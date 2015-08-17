package chartreview
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import gov.va.vinci.chartreview.*
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty
import gov.va.vinci.chartreview.model.ClinicalElementDisplayParameters
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.util.NotFoundException
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import gov.va.vinci.siman.model.ClinicalElementConfigurationDetails
import grails.transaction.Transactional
import groovy.sql.Sql
import groovy.transform.Synchronized
import groovy.xml.XmlUtil
import org.activiti.bpmn.model.BpmnModel
import org.activiti.bpmn.model.FlowElement
import org.activiti.bpmn.model.ServiceTask
import org.activiti.engine.ActivitiObjectNotFoundException
import org.activiti.engine.history.HistoricProcessInstance
import org.activiti.engine.history.HistoricTaskInstance
import org.activiti.engine.history.HistoricVariableInstance
import org.activiti.engine.history.NativeHistoricTaskInstanceQuery
import org.activiti.engine.impl.RepositoryServiceImpl
import org.activiti.engine.impl.form.DefaultTaskFormHandler
import org.activiti.engine.impl.form.FormPropertyHandler
import org.activiti.engine.impl.pvm.PvmActivity
import org.activiti.engine.impl.pvm.ReadOnlyProcessDefinition
import org.activiti.engine.impl.task.TaskDefinition
import org.activiti.engine.runtime.ProcessInstance
import org.activiti.engine.task.Task
import org.apache.commons.validator.GenericValidator
import org.w3c.dom.Document
import org.w3c.dom.Element

import javax.sql.DataSource
import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory
import java.sql.Connection

import static gov.va.vinci.chartreview.Utils.closeConnection

class ProcessService {
    def projectService;
    def runtimeService;
    def taskService;
    def repositoryService;
    def historyService;
    def managementService;
    def dataSource;
    def formService;
    def clinicalElementConfigurationService;
    private final claimTaskLock = new Object();
    def annotationSchemaService;

    /**
     * Given a task execution id, find the process instance business key. This looks in both current and historic tasks.
     * @param executionId
     * @return the process instance business key
     */
    public String getProcessBusinessKeyForTask(String taskId) {
        Task t = taskService.createTaskQuery().taskId(taskId)?.singleResult();

        if (t != null) {
            ProcessInstance process = runtimeService.createProcessInstanceQuery().processInstanceId(t.getProcessInstanceId()).singleResult();
            return process.businessKey;
        } else {
            HistoricTaskInstance task = historyService.createHistoricTaskInstanceQuery().taskId(taskId).includeTaskLocalVariables().singleResult();
            HistoricProcessInstance processInstance = historyService.createHistoricProcessInstanceQuery().processInstanceId(task.getProcessInstanceId()).singleResult();
            return processInstance.businessKey;
        }
    }

    /**
     * Start a new set of process instances.
     * @param model The model pojo with all of the metadata about the processes to start.
     * @return   the number of process instances started.
     */
    public int startProcess(AddProcessWorkflowModel model, Map<String,String> processFormData, List patientIds) {
        Connection conn;
        int instantiatedCount= 0;
        log.debug("Starting process.");
        try {
            conn = projectService.getDatabaseConnection(model.project);

            createProcessLevelVariables(model, processFormData)
            String processId = model.processId + "::" + UUID.randomUUID().toString();

            for (Object id: patientIds) {

                // Step 2 - Start the processes, using the parameters supplied.
                log.info("Start process for id ${id}");
                Map<String, ? extends Object> processInstanceVariables = new HashMap<String, ? extends Object>();

                String businessKey = createBusinessKey(model.project.id, model.processId, id.toString());

                processInstanceVariables.put(ProcessVariablesEnum.PROJECT_ID.getName(), model.project.id);
                processInstanceVariables.put(ProcessVariablesEnum.PROCESS_ID.getName(), processId);
                processInstanceVariables.put(ProcessVariablesEnum.DISPLAY_NAME.getName(), model.displayName);
                processInstanceVariables.put(ProcessVariablesEnum.PROCESS_OR_TASK.getName(), model.processOrTask);

                /**
                 * Note: The process_users is used in the bpm for setting who is a candidate user for this task.
                 */
                processInstanceVariables.put(ProcessVariablesEnum.PROCESS_USERS.getName(), model.processUsers);
                ProcessInstance processInstance = runtimeService.startProcessInstanceById(model.processId, businessKey, processInstanceVariables);

                instantiatedCount++;
                List<Task> taskList = taskService.createTaskQuery().processInstanceId(processInstance.id).list();
                for (Task task: taskList) {
                    Map<String, String> a = new HashMap<String, Object>();
                    a.put(TaskVariablesEnum.STATUS.getName(), "");
                    a.put(TaskVariablesEnum.STATUS_COMMENT.getName(), "");
                    taskService.setVariablesLocal(task.getId(), a);
                }

                log.debug("Finished starting process.");
            }
        } finally {
            closeConnection(conn);
        }
        return instantiatedCount;
    }


    protected void createProcessLevelVariables(AddProcessWorkflowModel model, Map<String,String> processFormData) {
        /** Set the process instance level variables. **/
        new ActivitiRuntimeProperty(
                id: UUID.randomUUID().toString(),
                project: model.project,
                processDisplayName: model.displayName,
                taskName: null,
                name: ProcessVariablesEnum.PROCESS_OR_TASK.getName(),
                value: model.processOrTask).save(flush: true, failOnError: true);
        new ActivitiRuntimeProperty(
                id: UUID.randomUUID().toString(),
                project: model.project,
                processDisplayName: model.displayName,
                taskName: null,
                name: ProcessVariablesEnum.PROCESS_USERS.getName(),
                value: model.processUsers.join(",")).save(flush: true, failOnError: true);
        new ActivitiRuntimeProperty(
                id: UUID.randomUUID().toString(),
                project: model.project,
                processDisplayName: model.displayName,
                taskName: null,
                name: ProcessVariablesEnum.PROCESS_CREATION_QUERY.getName(),
                value: model.query).save(flush: true, failOnError: true);

        processFormData.each { k, v ->
            new ActivitiRuntimeProperty(
                    id: UUID.randomUUID().toString(),
                    project: model.project,
                    processDisplayName: model.displayName,
                    taskName: null,
                    name: k,
                    value: v).save(flush: true, failOnError: true);
        }

        /**
         * Store the process group, if it is empty, store it as null;
         */
        String processGroup = null;
        if (!GenericValidator.isBlankOrNull(model.processGroup)) {
            processGroup = model.processGroup;
        }
        new ActivitiRuntimeProperty(
                id: UUID.randomUUID().toString(),
                project: model.project,
                processDisplayName: model.displayName,
                taskDefinitionKey: null,
                name: ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(),
                value: processGroup).save(flush: true, failOnError: true);


        List<TaskDefinitionWithVariable> taskList = this.getTaskDefinitions(model.processId);

        for (TaskDefinitionWithVariable task : taskList) {
            TaskVariables variables = model.taskVariablesList.find { it.taskDefinitionKey == task.taskDefinitionKey }

            if (variables) {
                variables.getAllVariables().each { k, v ->
                    String value;

                    if (v instanceof List<ClinicalElementDisplayParameters>) {
                        value = new Gson().toJson(v);
                    } else {
                        value = v.toString();
                    }

                    new ActivitiRuntimeProperty(
                            id: UUID.randomUUID().toString(),
                            project: model.project,
                            processDisplayName: model.displayName,
                            taskDefinitionKey: task.getTaskDefinitionKey(),
                            name: k,
                            value: value).save(flush: true, failOnError: true);
                }
            }
        }
    }

    public void updateProcess(String projectGuid, String processDisplayName, Map<String, String> nameValueMap, List<String> users) {
        Project p = Project.get(projectGuid);

        // Set activiti process variables.
        List<ProcessInstance> instances =  runtimeService.createProcessInstanceQuery().variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(),projectGuid).variableValueEquals(ProcessVariablesEnum.DISPLAY_NAME.getName(),processDisplayName).list();
        instances.each { process ->
            String currentUsers = runtimeService.getVariable(process.getId(), ProcessVariablesEnum.PROCESS_USERS.getName());
            List<String> usersToDelete = new ArrayList<String>();

            if (currentUsers && currentUsers.split(",").length > 0) {
                currentUsers.substring(1, currentUsers.length() -1 ).split(",").each {
                    String u = it.trim();
                    if (!users.contains(u)) {
                        usersToDelete.add(u);
                    }
                }
            }

            runtimeService.setVariable(process.getId(), ProcessVariablesEnum.PROCESS_USERS.getName(),users);

            // Remove candidate users that are no longer part of the process and add nnew ones.
            usersToDelete.each { toDelete ->
                List<Task> taskList = taskService.createTaskQuery().processInstanceId(process.id).list();
                for (Task task: taskList) {
                    taskService.deleteCandidateUser(task.getId(), toDelete);
                    users.each { u ->
                        if (!currentUsers.contains(u)) {
                            taskService.addCandidateUser(task.getId(), toDelete);
                        }

                    }
                }
            }


            nameValueMap.each{key, value ->
                if ("displayName" == key) {
                    runtimeService.setVariable(process.getId(),ProcessVariablesEnum.DISPLAY_NAME.getName(), value);
                }
            }
        }


        // Update process users in activiti_runtime_table.
        ActivitiRuntimeProperty userEntryToUpdate = ActivitiRuntimeProperty.findByProjectAndProcessDisplayNameAndNameAndTaskDefinitionKeyIsNull(p, processDisplayName, "processUsers");
        userEntryToUpdate.value =  users.join(",");
        userEntryToUpdate.save();

        // Now set our custom acitivi runtime properties table.
        nameValueMap.each { key, value ->
            if ("displayName" == key) {
                List<ActivitiRuntimeProperty> toUpdate = ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayName(p, processDisplayName);
                toUpdate.each{
                  it.setProcessDisplayName(value);
                  it.save();
                }

                // Change history activiti instances as well.
                List<HistoricProcessInstance> historyEntries =  historyService.createHistoricProcessInstanceQuery().variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(),projectGuid).variableValueEquals(ProcessVariablesEnum.DISPLAY_NAME.getName(),processDisplayName).list();
                Sql sql = new Sql(dataSource);
                historyEntries.each {
                    sql.execute("update act_hi_varinst set text_ = ? where execution_id_ = ? and name_ = ?", [ value, it.id, ProcessVariablesEnum.DISPLAY_NAME.getName()  ]);
                }
            }
            if (key.contains(".")) {
                String[] taskAndName = key.split("\\.");
                ActivitiRuntimeProperty entryToUpdate = ActivitiRuntimeProperty.findByProjectAndProcessDisplayNameAndTaskDefinitionKeyAndName(p, processDisplayName, taskAndName[0], taskAndName[1]);
                entryToUpdate.value = value;
                entryToUpdate.save();
            }
        }


    }

    /**
     * For a project id, find all of the unique process displayNames that have available
     * tasks for this user. This allows the user to select which "process" they would like to work on.
     *
     * @param username      The username to query on.
     * @param projectId     The project id.
     * @return              A unique set of display name for processes this user has tasks available for.
     */
    @Transactional
    public Set<LinkedHashSet> getProcessNamesAndTodoCountForProject(String projectId) {

        Set<LinkedHashSet> names = new LinkedHashSet<ProjectProcessMetadata>();

        if (!projectId) {
            return names;
        }

        def sql = new Sql(dataSource);
        Date d = new Date();
        sql.rows('''
                select  text_,
                        min(act_ru_variable.proc_inst_id_) as pid,
                        min(act_ru_execution.proc_def_id_) as procdefid,
                        count(*) as count
                    from act_ru_variable, act_ru_execution
                    where
                        act_ru_variable.proc_inst_id_ = act_ru_execution.proc_inst_id_
                        and act_ru_variable.name_ = 'displayName'
                        and act_ru_variable.proc_inst_id_ in (
                               select proc_inst_id_ from act_ru_variable where name_ = 'projectId'
                                    and text_ = ?
                        )
                    group by text_''', projectId).each {
            names.add(new ProjectProcessMetadata(processName: it.text_,
                    processId: it.pid,
                    processDefinitionId: it.procdefid,
                    todoCount: it.count, doneCount: 0));
        }
        return names;
    }


    /**
     * For a project id, find all of the unique process displayNames that have available
     * tasks for this user. This allows the user to select which "process" they would like to work on.
     *
     * @param username      The username to query on.
     * @param projectId     The project id.
     * @return              A unique set of display name for processes this user has tasks available for.
     */
    @Transactional
    public Set<LinkedHashSet> getProcessNamesForProject(String projectId) {
        Set<LinkedHashSet> names = new LinkedHashSet<ProjectProcessMetadata>();


        Date d = new Date();
        List<ProcessInstance> processInstanceList = runtimeService.createProcessInstanceQuery()
                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .list();
        processInstanceList.each { process->
            String name = runtimeService.getVariable(process.getId(), ProcessVariablesEnum.DISPLAY_NAME.getName());

            if (name) {
                ProjectProcessMetadata data = names.find{ it.processName == name};

                if (data) {
                    data.todoCount = data.todoCount + 1;
                    names.add(data);
                } else {
                    names.add(new ProjectProcessMetadata(processName: name,
                            processId: process.getId(),
                            processDefinitionId: process.getProcessDefinitionId(),
                            todoCount: 1, doneCount: 0));
                }
            }
        }
        //log.debug("Query took: " + new Date().getTime() - d.getTime() + " ms.");
        // Look at historical processes.

        d = new Date();
        List<HistoricProcessInstance> historicProcessInstanceList = historyService.createHistoricProcessInstanceQuery()
                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .finished()
                .list();
        historicProcessInstanceList.each { process ->
            List<HistoricVariableInstance> list = historyService.createHistoricVariableInstanceQuery()
                                .variableName(ProcessVariablesEnum.DISPLAY_NAME.getName())
                                .processInstanceId(process.getId())
                                .list();
            if (list.size() < 1) {
                log.error("Could not get dipslay name for historic process id: " + process.id);
            }

            String name = list.get(0).getValue();

            if (name) {
                ProjectProcessMetadata data = names.find{ it.processName == name};

                if (data) {
                    data.doneCount = data.doneCount + 1;
                    names.add(data);
                } else {
                    names.add(new ProjectProcessMetadata(processName: name,
                            processId: process.getId(),
                            processDefinitionId: process.getProcessDefinitionId(),
                            todoCount: 0, doneCount: 1));
                }
            }
        }
       // log.debug("Historic query took: " + (new Date().getTime() - d.getTime()) / 1000 + " ms.");
        return names;
    }

    public List<SummaryTableDTO> getAssignedAndRecentTasksForUser(String username, String projectId, String processId) {
        List<SummaryTableDTO> results = new ArrayList<SummaryTableDTO>();

        // Check holds first
        taskService.createTaskQuery()
                .taskAssignee(username)
                .processVariableValueEquals(ProcessVariablesEnum.PROCESS_ID.getName(), processId)
                .processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .taskVariableValueEquals(TaskVariablesEnum.STATUS.getName(), "hold")
                .orderByTaskId().desc()
                .list().each {
            def variables = taskService.getVariables(it.id);

            Map<String, String> businessKey = parseBusinessKey(getProcessBusinessKeyForTask(it.id));

            results.add(new SummaryTableDTO(taskId:  it.id, patientId: businessKey.get("patientId"),
                    status: "hold", date: it.getCreateTime(),
                    taskType: SummaryTableDTO.TaskType.ASSIGNED,
                    statusComment: variables.get(TaskVariablesEnum.STATUS_COMMENT.getName())));

        };


        // Check non-holds.
        taskService.createTaskQuery()
                .taskAssignee(username)
                .processVariableValueEquals(ProcessVariablesEnum.PROCESS_ID.getName(), processId)
                .processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .taskVariableValueNotEquals("status", "hold")
                .orderByTaskId().desc()
                .list().each {
            def variables = taskService.getVariables(it.id);
            Map<String, String> businessKey = parseBusinessKey(getProcessBusinessKeyForTask(it.id));

            results.add(new SummaryTableDTO(taskId:  it.id, patientId: businessKey.get("patientId"),
                    status: "open", date: it.getCreateTime(),
                    taskType: SummaryTableDTO.TaskType.ASSIGNED));

        };

        // Get historic records.
        def values = historyService.createHistoricProcessInstanceQuery()
                .variableValueEquals(ProcessVariablesEnum.PROCESS_ID.getName(), processId)
                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .orderByProcessInstanceId().asc()
                .list().collect { "'" + it.id + "'" }.join(",");

        if (values == null || values.trim().length() < 1) {
            return results;
        }

        NativeHistoricTaskInstanceQuery taskQuery = historyService.createNativeHistoricTaskInstanceQuery();
        taskQuery.sql("SELECT * FROM "+ managementService.getTableName(HistoricTaskInstance.class) +
                " WHERE assignee_=#{assignee} AND delete_reason_=#{status} and proc_inst_id_ in ( " + values + " ) order by ID_ desc");
        taskQuery.parameter("assignee", username);
        taskQuery.parameter("status", "completed");

        taskQuery.list().each{
            Map<String, String> businessKey = parseBusinessKey(getProcessBusinessKeyForTask(it.id));
            results.add(new SummaryTableDTO(taskId:  it.id, patientId: businessKey.get("patientId"),
                    status: it.deleteReason, date: it.endTime,
                    taskType: SummaryTableDTO.TaskType.COMPLETED));
        }

        return results;
    }


    /**
     * For a project id, find all of the unique process displayNames that have available
     * tasks for this user. This allows the user to select which "process" they would like to work on.
     *
     * @param clinicalElementConfigurationId      Id of the CEC to find.
     * @param projectId                           The project id.
     * @return                                    Returns true if there are no processes using the given CEC.
     */
    @Transactional
    public boolean canDeleteClinicalElementConfiguration(String clinicalElementConfigurationId, String projectId) {
        boolean canDelete = true;

        if (!projectId) {
            return canDelete;
        }

        /* Existing clinical element configurations look like this (having event the includ=false ones specified.  The new code will not
         have the includ-false in it.  That will allow the following query to find only those clinical element configurations that are
         used in a process by quickly searching for existence in this field on any row.
        [
            {"clinicalElementConfigurationId":"df1a7aa8-bea5-437f-a5d6-16905318da2c","hidden":false,"position":1,"include":false},
            {"clinicalElementConfigurationId":"bcd588c6-2ca2-4e75-962c-9c2f7f3175e5","hidden":false,"position":2,"include":false},
            {"clinicalElementConfigurationId":"85e2f835-3bd5-4ca6-8923-c8d25783a196","hidden":false,"position":3,"include":false},
            {"clinicalElementConfigurationId":"036cc219-424d-4573-b5c3-5b7e1bf322a5","hidden":false,"position":4,"include":true},
            {"clinicalElementConfigurationId":"a57ba2f0-e55d-4f4a-848e-9bd7d2c233de","hidden":false,"position":5,"include":true},
            {"clinicalElementConfigurationId":"af239c12-2ac7-47e7-a30e-c2216f80ff95","hidden":false,"position":6,"include":false},
            {"clinicalElementConfigurationId":"979ea7b9-89f4-484c-9bf5-9e0bbcb921b3","hidden":false,"position":7,"include":true}
        ]
*/
//        def sql = new Sql(dataSource);
//        def likeStr = '%'+clinicalElementConfigurationId+'%';
//        def results = sql.rows('''
//                select  count(*)
//                    from activiti_runtime_property
//                    where
//                        activiti_runtime_property.project = ?
//                        and activiti_runtime_property.name = 'clinicalElements'
//                        and activiti_runtime_property.value like ?
//                        and charindex(clinicalElementConfigurationId, activiti_runtime_property.value) -
//                            charindex("\\"include\\"\\:false", activiti_runtime_property.value, charindex(clinicalElementConfigurationId, activiti_runtime_property.value)) < 40
//                    ''', projectId, likeStr);
//        results.each {
//            if(it[0].value > 0)
//            {
//                canDelete = false;
//            }
//        }
        return canDelete;
    }

    /**
     * For a username and project id, find all of the unique process displayNames that have available
     * tasks for this user or that a user has a task assigned for.
     *
     * This allows the user to select which "process" they would like to work on.
     *
     * @param username      The username to query on.
     * @param projectId     The project id.
     * @param showCompletedProcesses   if true, processes that are completed will also be returned.
     * @return              A unique set of display name for processes this user has tasks available for.  The key is the process name, the value is the process Id.
     */
    public Map<String, String> getAvailableProcessNameUserCanGetTasksFor(String username, String projectId, Boolean showCompletedProcesses) {
        Long date = new Date().getTime();
        Map<String, String> names = new HashMap<String, String>();
        String taskIds = taskService.createTaskQuery().taskCandidateUser(username).processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId).list().collect { "'" + it.id + "'" }.join(",");
        String assignedTaskIds =  taskService.createTaskQuery().taskAssignee(username).processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId).list().collect { "'" + it.id + "'" }.join(",");
        String completedTaskIds =  historyService.createHistoricTaskInstanceQuery().taskAssignee(username).processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId).list().collect { "'" + it.id + "'" }.join(",");

        if (taskIds && assignedTaskIds) {
            taskIds += ", " + assignedTaskIds;
        } else if (!taskIds && assignedTaskIds) {
            taskIds = assignedTaskIds;
        }

        if(taskIds.trim().length() > 0)
        {
            String sqlStatement = "select distinct RES.ID_ taskId,\n" +
                    "         VAR.ID_ as VAR_ID_, VAR.NAME_ as VAR_NAME_, VAR.TYPE_ as VAR_TYPE_,\n" +
                    "         VAR.TEXT_ as VAR_TEXT_, VAR.TEXT2_ as VAR_TEXT2_\n" +
                    "         from ACT_RU_TASK RES\n" +
                    "         left outer join ACT_RU_VARIABLE VAR ON RES.PROC_INST_ID_ = VAR.EXECUTION_ID_ and VAR.TASK_ID_ is null\n" +
                    "         WHERE\n" +
                    "         res.id_ in (" + taskIds + ")\n" +
                    "         and (var.name_ = 'displayName' or var.name_ = 'processId')\n" +
                    "         order by RES.ID_, var_name_;";

            def sql = new Sql(dataSource);
            Map<String, IdNameValue> results1 = new HashMap<String, IdNameValue>();

            sql.eachRow(sqlStatement) {  row ->
                IdNameValue nameValue = results1.get(row['taskId']);
                if (nameValue == null) {
                    nameValue = new IdNameValue(taskId: row['taskId']);
                }
                if (row['VAR_NAME_'] == ProcessVariablesEnum.PROCESS_ID.getName()) {
                    nameValue.processId = row['VAR_TEXT_'];
                } else {
                    nameValue.displayName = row['VAR_TEXT_'];
                }
                results1.put(row['taskId'], nameValue);
            }
            results1.values().each {
                names.put(it.processId, it.displayName);
            }
        }

        if(showCompletedProcesses && completedTaskIds.trim().length() > 0)
        {
            String sqlStatement2 = "select distinct RES.ID_ taskId,\n" +
                    "         VAR.ID_ as VAR_ID_, VAR.NAME_ as VAR_NAME_, VAR_TYPE_,\n" +
                    "         VAR.TEXT_ as VAR_TEXT_, VAR.TEXT2_ as VAR_TEXT2_\n" +
                    "         from ACT_HI_TASKINST RES\n" +
                    "         left outer join ACT_HI_VARINST VAR ON RES.PROC_INST_ID_ = VAR.EXECUTION_ID_ and VAR.TASK_ID_ is null\n" +
                    "         WHERE\n" +
                    "         res.id_ in (" + completedTaskIds + ")\n" +
                    "         and (var.name_ = 'displayName' or var.name_ = 'processId')\n" +
                    "         order by RES.ID_, var_name_;";

            def sql2 = new Sql(dataSource);
            Map<String, IdNameValue> results2 = new HashMap<String, IdNameValue>();

            sql2.eachRow(sqlStatement2) {  row ->
                IdNameValue nameValue = results2.get(row['taskId']);
                if (nameValue == null) {
                    nameValue = new IdNameValue(taskId: row['taskId']);
                }
                if (row['VAR_NAME_'] == ProcessVariablesEnum.PROCESS_ID.getName()) {
                    nameValue.processId = row['VAR_TEXT_'];
                } else {
                    nameValue.displayName = row['VAR_TEXT_'];
                }
                results2.put(row['taskId'], nameValue);
            }

            results2.values().each {
                names.put(it.processId, it.displayName);
            }
        }

        log.debug("getAvailableProcessNameUserCanGetTasksFor took ${new Date().getTime() - date} ms.")
        return names;
    }

    /**
     * Find and claim a task from activiti for a give user/projectId/processId. If a task is already assigned to this
     * user/projectId/processId, it is returned. If not, a new task is grabbed if it is available.
     *
     * Synchronized so the task can be found and claimed without contention.
     *
     * @param user
     * @param projectId
     * @param processId
     * @return the task executionId claimed.
     * @throws NotFoundException if a task cannot be claimed for this user/project/process.
     */
    @Synchronized("claimTaskLock")
    public String claimTask(String username, String projectId, String processId) throws NotFoundException {

        log.debug("Claiming task for ${username}, projectId: ${projectId}, and processId: ${processId}");

        /** Grab one already assigned to user if it exists. **/
        List<Task> tasks = taskService.createTaskQuery()
                .processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .processVariableValueEquals(ProcessVariablesEnum.PROCESS_ID.getName(), processId)
                .taskVariableValueEquals("status", "")
                .taskAssignee(username)
                .orderByProcessInstanceId()
                .asc()
                .listPage(0,1);

        if (tasks.size() < 1) {
            /** See if there is one in progress. **/
            tasks = taskService.createTaskQuery()
                    .processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                    .processVariableValueEquals(ProcessVariablesEnum.PROCESS_ID.getName(), processId)
                    .taskVariableValueEquals("status", "in-progress")
                    .taskAssignee(username)
                    .orderByProcessInstanceId()
                    .asc()
                    .listPage(0,1);

            /** Grab an unassigned one if it exists. **/
            if (tasks.size() < 1) {
                tasks = taskService.createTaskQuery()
                        .processVariableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                        .processVariableValueEquals(ProcessVariablesEnum.PROCESS_ID.getName(), processId)
                        .taskVariableValueEquals("status", "")
                        .taskCandidateUser(username)
                        .orderByProcessInstanceId()
                        .asc()
                        .listPage(0, 1);

                if (tasks.size() < 1) {
                    throw new NotFoundException("No tasks available for ${username} with project ${projectId} and process ${processId}.");
                }

                taskService.claim(tasks.get(0).getId(), username);
            }
        }

        // TODO: If this is a single assignment per process, remove other candidate users from the process variables.
        String processInstanceId = tasks.get(0).processInstanceId;


        return tasks.get(0).getId();
    }

    /**
     * All variables visible from the given task id. (Local variables and project level.)
     *
     * This tries to get "current" task, but if not found, looks in historic tasks as well.
     *
     * @param executionId  id of execution, cannot be null.
     * @return the variables or an empty map if no such variables are found.
     * @throws ActivitiObjectNotFoundException when no execution is found for the given executionId.
     */
    public List<ActivitiRuntimeProperty> getActivitiRuntimePropertiesTaskId(String id) throws ActivitiObjectNotFoundException
    {
        Task t = taskService.createTaskQuery().taskId(id).singleResult();
        if (t != null) {
            Map<String, Object> variables = taskService.getVariables(id);
            List<ActivitiRuntimeProperty> props =  getRuntimeProperties(Project.get(variables.get(ProcessVariablesEnum.PROJECT_ID.getName())),
                    variables.get(ProcessVariablesEnum.DISPLAY_NAME.getName()),
                    t.getTaskDefinitionKey());

            props.addAll( getRuntimeProperties(Project.get(variables.get(ProcessVariablesEnum.PROJECT_ID.getName())),
                    variables.get(ProcessVariablesEnum.DISPLAY_NAME.getName()),
                    null));
            return props;
        } else {
            Map<String,Object> variables = null;

            HistoricTaskInstance task = historyService.createHistoricTaskInstanceQuery().taskId(id).includeTaskLocalVariables().singleResult();
            HistoricProcessInstance processInstance = historyService.createHistoricProcessInstanceQuery().processInstanceId(task.getProcessInstanceId()).includeProcessVariables().singleResult();

            variables = processInstance.getProcessVariables();
            variables.putAll(task.getTaskLocalVariables());
            List<ActivitiRuntimeProperty> props =  getRuntimeProperties(Project.get(variables.get(ProcessVariablesEnum.PROJECT_ID.getName())),
                    variables.get(ProcessVariablesEnum.DISPLAY_NAME.getName()),
                    task.getTaskDefinitionKey());
            props.addAll( getRuntimeProperties(Project.get(variables.get(ProcessVariablesEnum.PROJECT_ID.getName())),
                    variables.get(ProcessVariablesEnum.DISPLAY_NAME.getName()),
                    null));
            return props;
        }
    }

    /**
     * Given a task id, look up the clinical element configurations that are associated with that task.
     *
     * @param id the task id to get the clinical element configurations for.
     * @return  a map of clinical element configurations, and the task specific display parameters associated with it for
     *          this task.
     */
    public Map<ClinicalElementConfiguration, ClinicalElementDisplayParameters> getClinicalElementConfigurationsForTaskId(String id) {
        Map<ClinicalElementConfigurationDetails, ClinicalElementDisplayParameters> results = new HashMap<ClinicalElementConfigurationDetails, ClinicalElementDisplayParameters>();
        List<ActivitiRuntimeProperty> variables = getActivitiRuntimePropertiesTaskId(id);
        def key = parseBusinessKey(getProcessBusinessKeyForTask(id));
        String projectId = key.projectId;
        List<ClinicalElementDisplayParameters> clinicalElements = null;

        /** Only get task clinical elements, not project level ones. **/
        for (ActivitiRuntimeProperty p: variables) {
            if (!GenericValidator.isBlankOrNull(p.taskDefinitionKey) && p.name == TaskVariablesEnum.CLINICAL_ELEMENTS.getName()) {
                clinicalElements =
                        new Gson().fromJson(
                                p.value,
                                new TypeToken<List<ClinicalElementDisplayParameters>>(){}.getType());
                break;
            }
        }

        if (clinicalElements != null) {

            clinicalElements = clinicalElements.sort { clinicalElement -> clinicalElement.position };

            clinicalElements.each {
                if (it.include) {
                    Project p = Project.get(projectId);
                    DataSource ds = Utils.getProjectDatasource(p);

                    results.put(clinicalElementConfigurationService.getClinicalElementConfiguration(it.clinicalElementConfigurationId, ds, p), it);
                }
            }
        }

        return results;
    }

    /**
     * For a deployed process definition id, find the process definition and return the task definition metadata
     *
     * @param deployedProcessDefinitionId
     * @return
     */
    public LinkedList<TaskDefinitionWithVariable> getTaskDefinitions(String deployedProcessDefinitionId) {
        LinkedList<TaskDefinitionWithVariable> results = new LinkedList<TaskDefinitionWithVariable>();
        ReadOnlyProcessDefinition processDefinition =
                ((RepositoryServiceImpl)repositoryService)
                        .getDeployedProcessDefinition( deployedProcessDefinitionId );

        BpmnModel bpmnModel = repositoryService.getBpmnModel(deployedProcessDefinitionId);


        if (processDefinition != null) {
            for (PvmActivity activity : processDefinition.getActivities()) {
                String type = (String) activity.getProperty("type");
                if (type == "userTask") {
                    TaskDefinition taskDefinition = activity.getProperty("taskDefinition")
                    List<FormPropertyHandler> handlers = ((DefaultTaskFormHandler) taskDefinition
                            .getTaskFormHandler()).getFormPropertyHandlers();

                    TaskDefinitionWithVariable variable = new TaskDefinitionWithVariable(taskDefinitionKey: taskDefinition.getKey(), documentation: activity.getProperty("documentation"));

                    for(FormPropertyHandler handler : handlers){
                        if (handler.getId() == TaskVariablesEnum.SCHEMA.getName()) {
                            variable.hasSchema = true;
                        }
                        if (TaskVariablesEnum.CLINICAL_ELEMENTS.getName() == handler.getId()) {
                            variable.hasClinicalElements = true;
                        }
                    }
                    results.add(variable);
                } else if (type == "serviceTask") {
                    for (org.activiti.bpmn.model.Process p : bpmnModel.getProcesses())
                    {
                        for (FlowElement flowElement : p.getFlowElements())
                        {
                            if(flowElement instanceof ServiceTask && flowElement.id.equals(activity.id)){
                                ServiceTask serviceTask = (ServiceTask) flowElement;
                                String className = serviceTask.getImplementation();
                                ServiceTaskDefinitionWithVariable variable=  new ServiceTaskDefinitionWithVariable(taskDefinitionKey: flowElement.id, documentation: activity.getProperty("documentation"), serviceClass: className, hasSchema: true, hasClinicalElements: true);
                                results.add(variable);
                            }
                        }
                    }
                }
            }
        }
        return results;
    }

    /**
     * Returns the xml definition of the task with its metadata.
     * @param taskId the task id to get
     * @return  the xml definition of the task with its metadata.
     */
    public String getXmlForHistoricTask(String taskId) {
        HistoricTaskInstance task = historyService.createHistoricTaskInstanceQuery().taskId(taskId).includeTaskLocalVariables().singleResult();
        HistoricProcessInstance processInstance = historyService.createHistoricProcessInstanceQuery().processInstanceId(task.getProcessInstanceId()).singleResult();
        List<ActivitiRuntimeProperty> activitiRuntimeProperties = getActivitiRuntimePropertiesTaskId(taskId);
        Map<String, String> variables = new HashMap<String, String>();
        Map<ClinicalElementConfiguration, ClinicalElementDisplayParameters> clinicalElements = getClinicalElementConfigurationsForTaskId(taskId);
        Map<ClinicalElementConfigurationDetails, ClinicalElementDisplayParameters> clinicalElementMap = new LinkedHashMap<ClinicalElementConfigurationDetails, ClinicalElementDisplayParameters>();

        HistoricProcessInstance process = historyService.createHistoricProcessInstanceQuery().processInstanceId(task.processInstanceId).includeProcessVariables().singleResult();
        Map<String, Object> processVariables = process.getProcessVariables();


        clinicalElements.each {  ClinicalElementConfiguration key, ClinicalElementDisplayParameters value ->
            if (value.include) {
                clinicalElementMap.put(key, value);
            }
        }

        activitiRuntimeProperties.each {
            variables.put(it.name, it.value);
        }

        Map<String, String> businessKey = parseBusinessKey(processInstance.businessKey);

        def clinicalElementGroup = Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), activitiRuntimeProperties).getValue();
            return createAnnotationXml(
                    businessKey.get("patientId"),
                    taskId,
                    variables,
                    processVariables.get(ProcessVariablesEnum.PROJECT_ID.getName()),
                    clinicalElementGroup,
                    clinicalElementMap,
                    "completed"
           );
    }

    /**
     * Returns the xml definition of the task with its metadata.
     * @param taskId the task id to get
     * @return  the xml definition of the task with its metadata.
     */
    public String getXmlForTask(String taskId) {
        Map<ClinicalElementConfiguration, ClinicalElementDisplayParameters> clinicalElements = getClinicalElementConfigurationsForTaskId(taskId);
        List<ActivitiRuntimeProperty> activitiRuntimeProperties = getActivitiRuntimePropertiesTaskId(taskId);
        Map<String, String> variables = new HashMap<String, String>();

        activitiRuntimeProperties.each {
            variables.put(it.name, it.value);
        }

        Map<String, String> businessKey = parseBusinessKey(getProcessBusinessKeyForTask(taskId));
        Map<String, Object> values = this.taskService.getVariables(taskId);
        return createAnnotationXml(businessKey.get("patientId"),
                taskId,
                variables,
                values.get(ProcessVariablesEnum.PROJECT_ID.getName()),
                Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), activitiRuntimeProperties).getValue(),
                clinicalElements,
                "todo"
        );
    }

    /**
     * Method that create the annotation xml. Separated out so it can be used for current and completed tasks.
     * @param businessKey
     * @param taskId
     * @param variables
     * @param projectId
     * @param processId
     * @param clinicalElements
     * @return
     */
    protected String createAnnotationXml(String patientId, String taskId, Map<String, Object> variables, String projectId, String clinicalElementGroup, Map<ClinicalElementConfiguration, ClinicalElementDisplayParameters> clinicalElements, String status) {

        DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder()
        Document document = builder.newDocument()
        Element root = document.createElement('tasks')

        Element task = document.createElement('task')
        task.setAttribute("id", taskId);

        Element name = document.createElement("name");
        name.setTextContent(variables.get(TaskVariablesEnum.NAME.getName()));
        task.appendChild(name);

        // TInclude project document if there is one.
        def projectDocumentNameObj = TaskVariablesEnum.PROJECT_DOCUMENT;
        def projectDocumentName = projectDocumentNameObj.getName();
        def projectDocumentVariable = variables.get(projectDocumentName);
        if (projectDocumentVariable && projectDocumentVariable != "null") {
            Element projectDocumentUrl = document.createElement("projectDocument");

            projectDocumentUrl.setTextContent("/chart-review/projectDocument/show/" + projectDocumentVariable);
            task.appendChild(projectDocumentUrl);
        }

        Element detailedDescription = document.createElement("detailedDescription");
        detailedDescription.setTextContent(variables.get(TaskVariablesEnum.DETAILED_DESCRIPTION.getName()));
        task.appendChild(detailedDescription);

        Element dateModified = document.createElement("dateModified");
        task.appendChild(dateModified);

        Element statusEl = document.createElement("status");
        statusEl.setTextContent(status);
        task.appendChild(statusEl);


        def schemaId = variables.get(TaskVariablesEnum.SCHEMA.name);
        AnnotationSchemaRecord annotationSchema = annotationSchemaService.get(Project.get(projectId), schemaId);
        if (!annotationSchema) {
            throw new IllegalArgumentException("Could not find schema with id ${schemaId}.");
        }
        Element schema = document.createElement("schema");
        schema.setAttribute("id", annotationSchema.id);
        schema.setTextContent(annotationSchema.name);
        task.appendChild(schema);

        Project p = Project.get(projectId);
        DataSource ds = Utils.getProjectDatasource(p);

        // Get the primary clinical element information.
        ClinicalElementConfiguration primaryClinicalElementConfiguration = clinicalElementConfigurationService.getClinicalElementConfiguration(variables.get(TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName()), ds, p);
        if (!primaryClinicalElementConfiguration) {
            throw new IllegalArgumentException("Could not find primary clinical element configuration ('${variables.get(TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName())}')");
        }
        Element clinicalElementConfiguration = document.createElement("clinicalElementConfiguration");
        clinicalElementConfiguration.setAttribute("id", primaryClinicalElementConfiguration.getId());
        clinicalElementConfiguration.setTextContent(primaryClinicalElementConfiguration.getName());
        task.appendChild(clinicalElementConfiguration);

        Element clinicalElement = document.createElement("clinicalElement");

        String clinicalElementId = null;
        if (clinicalElementGroup == null) {
            clinicalElementId = "projectId=${projectId};clinicalElementGroup=;clinicalElementConfigurationId=${primaryClinicalElementConfiguration.getId()};${primaryClinicalElementConfiguration.keyColumns.get(0).columnName}=${patientId};"
        } else {
            clinicalElementId = "projectId=${projectId};clinicalElementGroup=${clinicalElementGroup};clinicalElementConfigurationId=${primaryClinicalElementConfiguration.getId()};${primaryClinicalElementConfiguration.keyColumns.get(0).columnName}=${patientId};"
        }
        clinicalElement.setAttribute("id", clinicalElementId);
        clinicalElement.setTextContent(clinicalElementId);
        task.appendChild(clinicalElement);

        Element dateAssigned = document.createElement("dateAssigned");
        dateAssigned.setTextContent(new Date().toGMTString());
        task.appendChild(dateAssigned);

        /**
         * Add the clinical element configurations.
         */
        Element configurationElementTypes = document.createElement("contextElementTypes");
        clinicalElements.each() { key, value ->
            Element contextElementType = document.createElement("contextElementType");

            Element ceName = document.createElement("name");
            ceName.setTextContent(key.name);
            contextElementType.appendChild(ceName);

            Element ceType = document.createElement("type");
            ceType.setTextContent(key.id);
            contextElementType.appendChild(ceType);

            Element sequence = document.createElement("sequence");
            sequence.setTextContent(value.position.toString());
            contextElementType.appendChild(sequence);

            // TODO - Hard coded for now. May change in the future.
            Element allowAnnotation = document.createElement("allowAnnotation");
            allowAnnotation.setTextContent("true");
            contextElementType.appendChild(allowAnnotation);

            Element hidden = document.createElement("hidden");
            hidden.setTextContent(value.hidden.toString());
            contextElementType.appendChild(hidden);

            configurationElementTypes.appendChild(contextElementType);
        };

        task.appendChild(configurationElementTypes);
        root.appendChild(task);

        return XmlUtil.serialize(root);
    }

    public String getTaskName(String taskId)
    {
        Task t = taskService.createTaskQuery().taskId(taskId)?.singleResult();

        if (t) {
            return t.name;
        } else {
            HistoricTaskInstance ht = historyService.createHistoricTaskInstanceQuery().taskId(taskId).singleResult();
            if (!ht) {
                throw new RuntimeException("Tasl ${taskId} not found. ");
            }
            return ht.name;

        }
        return t?.name;
    }

    /**
     * Complete a task
     * @param taskId  the task id to complete.
     */
    public void taskComplete(String taskId, String statusComment) {
        setTaskVariable(taskId, TaskVariablesEnum.STATUS.getName(), "");
        setTaskVariable(taskId, TaskVariablesEnum.STATUS_COMMENT.getName(), statusComment);
        Task t = taskService.createTaskQuery().taskId(taskId)?.singleResult();
        if (t) {
            taskService.complete(taskId);
        }
    }

    /**
     * Place a task on hold. With activiti, this means putting a status variable of "hold" as
     * part of the task. Activiti does not have a concept of hold, it has to be implemented as
     * a variable that is part of the task.
     *
     * @param taskId the task id to put on hold.
     */
    public void taskHold(String taskId, String statusComment) {
        setTaskVariable(taskId, TaskVariablesEnum.STATUS.getName(), "hold");
        setTaskVariable(taskId, TaskVariablesEnum.STATUS_COMMENT.getName(), statusComment);
    }

    /**
     * Place a task on Work in Progress (WIP). With activiti, this means putting a status variable of "wip" as
     * part of the task. Activiti does not have a concept of status, it has to be implemented as
     * a variable that is part of the task.
     *
     * @param taskId the task id to put on hold.
     */
    public void taskInProgress(String taskId, String statusComment) {
        setTaskVariable(taskId, TaskVariablesEnum.STATUS.getName(), "in-progress");
        setTaskVariable(taskId, TaskVariablesEnum.STATUS_COMMENT.getName(), statusComment);
    }

    /**
     * Remove a task on hold. With activiti, this means removing a status variable of "hold" as
     * part of the task. Activiti does not have a concept of hold, it has to be implemented as
     * a variable that is part of the task.
     *
     * @param taskId the task id to remove from hold.
     */
    public void taskRemoveHold(String taskId) {
        setTaskVariable(taskId, TaskVariablesEnum.STATUS.getName(), "");
        setTaskVariable(taskId, TaskVariablesEnum.STATUS_COMMENT.getName(), "");
    }

    public String getTaskStatus(String taskId) {
        return getTaskVariables(taskId).get(TaskVariablesEnum.STATUS.getName());
    }

    /**
     * Create a serialized business key for Activiti. This is in the form:
     *
     * ${projectId}::${processId}::${patientId}::${System.currentTimeMillis()}
     *
     * @param projectId the project id for the key
     * @param processId the process id for the key
     * @param patientId the patient id for the key
     * @return  the key as a serialized string in the format: ${projectId}::${processId}::${patientId}::${System.currentTimeMillis()}
     */
    public static String createBusinessKey(String projectId, String processId, String patientId) {
        return  "${projectId}::${processId}::${patientId}::${System.currentTimeMillis()}";
    }

    /**
     * De-serialize a business key into a map.
     *
     * @param key the serialized business key.
     * @return a map containing the following keys: projectId, processId, patientId, creationTime (a long);
     */
    public static Map<String, Object> parseBusinessKey(String key) {
        String[] parts = key.split("::");
        return [projectId: parts[0], processId: parts[1], patientId: parts[2], creationTime: new Long(parts[3])]
    }

    /**
     * Get all properties for a project/processDisplayName. This includes task properties as well.
     * @param p  the project guid  get properties for.
     * @param processDisplayName the process display name to get properties for.
     * @return  a list of properties for that project/processDisplayName. This includes task properties as well.
     */
    public List<ActivitiRuntimeProperty> getRuntimeProperties(String projectId, String processDisplayName) {
        List<ActivitiRuntimeProperty> propertyList =  ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayName(Project.get(projectId), processDisplayName);
        return   propertyList;
    }

    /**
     * Get all properties for a project/processDisplayName. This includes task properties as well.
     * @param p  the project to get properties for.
     * @param processDisplayName the process display name to get properties for.
     * @return  a list of properties for that project/processDisplayName. This includes task properties as well.
     */
    public List<ActivitiRuntimeProperty> getRuntimeProperties(Project p, String processDisplayName) {
        return ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayName(p, processDisplayName);
    }

    /**
     * Get all properties for a project/processDisplayName/taskName. This is limited to a specific task of a
     * project/process. A NULL task name will return just the process level variables, without the task level
     * variables.
     *
     * @param p  the project to get properties for.
     * @param processDisplayName the process display name to get properties for.
     * @param taskDefinitionKey the task definition key
     * @return  a list of properties for that project/processDisplayName/taskName. This is limited to a specific
     * task of a project/process.
     */
    public List<ActivitiRuntimeProperty> getRuntimeProperties(Project p, String processDisplayName, String taskDefinitionKey) {
        if (taskDefinitionKey == null) {
            return ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayNameAndTaskDefinitionKeyIsNull(p, processDisplayName);
        } else {
            return ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayNameAndTaskDefinitionKey(p, processDisplayName, taskDefinitionKey);
        }
    }

    public boolean isHistoric(String taskId) {
        Task t = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (t) {
            return false;
        }
        return true;
    }

    /**
     * Return task and process variables for either an active task, or an historic task.
     *
     * @param taskId the task id to get variables for.
     * @return   a map containing the process and task local variables for the given task. If a task cannot be found,
     * an illegalarguement exception is thrown.
     */
    public Map<String, Object> getTaskVariables(String taskId) {
        Task t = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (t) {
            return taskService.getVariables(taskId);
        } else {
            HistoricTaskInstance ht = historyService.createHistoricTaskInstanceQuery().taskId(taskId).includeTaskLocalVariables().list()?.get(0);
            if (!ht) {
                throw new IllegalArgumentException("Could not find task id ${taskId}.");
            }

            Map <String, Object> variables = ht.getTaskLocalVariables();
            ht = historyService.createHistoricTaskInstanceQuery().taskId(taskId).includeProcessVariables().list().get(0);

            variables.putAll(ht.getProcessVariables());
            return variables;
        }
    }

    protected void setTaskVariable(String taskId, String name, String value) {
        Task t = taskService.createTaskQuery().taskId(taskId)?.singleResult();

        if (t != null) {
            taskService.setVariable(taskId, name, value);
        } else {
            HistoricTaskInstance task = historyService.createHistoricTaskInstanceQuery().taskId(taskId).includeTaskLocalVariables().singleResult();
            HistoricProcessInstance processInstance = historyService.createHistoricProcessInstanceQuery().processInstanceId(task.getProcessInstanceId()).singleResult();

            // TODO - No way to set variables on historic tasks.
        }
    }




    /**
     * For a project id, find all of the unique process displayNames that have available
     * tasks for this user. This allows the user to select which "process" they would like to work on.
     *
     * @param username      The username to query on.
     * @param projectId     The project id.
     * @return              A unique set of display name for processes this user has tasks available for.
     */
    @Transactional
    public Set<LinkedHashSet> updateAnnotationTaskTable(String projectId, String user) {

        // Step 1 - Get all the processes.
        List<ProcessInstance> processInstanceList = runtimeService.createProcessInstanceQuery()
                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .includeProcessVariables()
                .list();


        processInstanceList.each { process ->
            List<Task> tasks = taskService.createTaskQuery().taskAssignee(user).processInstanceId(process.getId()).list();
            tasks.each { task ->
                println("Patient::" + "TaskId::" + task.id);
            }

        }

        // Step 2 - Get all the claimed tasks

        // Step 3 - Get all of the completed tasks.



        processInstanceList.each { process->
            String name = runtimeService.getVariable(process.getId(), ProcessVariablesEnum.DISPLAY_NAME.getName());

            if (name) {
                ProjectProcessMetadata data = names.find{ it.processName == name};

                if (data) {
                    data.todoCount = data.todoCount + 1;
                    names.add(data);
                } else {
                    names.add(new ProjectProcessMetadata(processName: name,
                            processId: process.getId(),
                            processDefinitionId: process.getProcessDefinitionId(),
                            todoCount: 1, doneCount: 0));
                }
            }
        }
        //log.debug("Query took: " + new Date().getTime() - d.getTime() + " ms.");
        // Look at historical processes.

        d = new Date();
        List<HistoricProcessInstance> historicProcessInstanceList = historyService.createHistoricProcessInstanceQuery()
                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), projectId)
                .finished()
                .list();
        historicProcessInstanceList.each { process ->
            List<HistoricVariableInstance> list = historyService.createHistoricVariableInstanceQuery()
                    .variableName(ProcessVariablesEnum.DISPLAY_NAME.getName())
                    .processInstanceId(process.getId())
                    .list();
            if (list.size() < 1) {
                log.error("Could not get dipslay name for historic process id: " + process.id);
            }

            String name = list.get(0).getValue();

            if (name) {
                ProjectProcessMetadata data = names.find{ it.processName == name};

                if (data) {
                    data.doneCount = data.doneCount + 1;
                    names.add(data);
                } else {
                    names.add(new ProjectProcessMetadata(processName: name,
                            processId: process.getId(),
                            processDefinitionId: process.getProcessDefinitionId(),
                            todoCount: 0, doneCount: 1));
                }
            }
        }
        // log.debug("Historic query took: " + (new Date().getTime() - d.getTime()) / 1000 + " ms.");
        return names;
    }



    protected class IdNameValue {
        def taskId;
        def processId;
        def displayName;
    }
}
