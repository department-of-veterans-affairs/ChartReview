package chartreview
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.mysema.query.sql.SQLQuery
import com.mysema.query.sql.SQLQueryFactoryImpl
import gov.va.vinci.chartreview.*
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty
import gov.va.vinci.chartreview.model.ClinicalElementDisplayParameters
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.ProjectDocument
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.util.StringFormTypeSerializable
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import gov.va.vinci.siman.model.QAnnotation
import gov.va.vinci.siman.tools.ConnectionProvider
import org.activiti.engine.form.StartFormData
import org.activiti.engine.impl.form.FormPropertyImpl
import org.activiti.engine.repository.Deployment
import org.activiti.engine.repository.ProcessDefinition
import org.apache.commons.beanutils.BeanUtils
import org.apache.commons.validator.GenericValidator
import org.springframework.web.multipart.commons.CommonsMultipartFile

import javax.sql.DataSource
import javax.validation.ValidationException
import java.sql.Connection

import static gov.va.vinci.chartreview.Utils.closeConnection

class ProcessController {

    def annotationSchemaService;
    def projectService
    def repositoryService;
    def processService;
    def clinicalElementConfigurationService;

    def list() {
        def processes = repositoryService.createProcessDefinitionQuery().orderByProcessDefinitionName().asc().list();
        [processList: processes, total: processes.size()]
    }

    def diagram() {
        render file: repositoryService.getProcessDiagram(params.id), contentType: 'image/png';
    }

    def upload() {
        CommonsMultipartFile bpmFile = request.getFile('myFile')
        if (bpmFile.empty) {
            flash.message = 'File cannot be empty'
            redirect(action: "list")
            return
        }

        Deployment d = repositoryService.createDeployment()
                .addString(bpmFile.originalFilename, bpmFile.getInputStream().getText())
                .deploy();

        flash.message = 'Process imported.'
        redirect(action: "list")
    }

    def getSchemaOptions(Project p) {
        def annotationSchemas = annotationSchemaService.getAll(p).sort {it.name};
        List<Object> schemaOptions = new ArrayList<Object>();
        for (AnnotationSchemaRecord schema in annotationSchemas) {
            def found = false;
            for (Object obj in schemaOptions) {
                if (obj.value == schema.getId()) {
                    found = true;
                    continue;
                }
            }
            if (found == false) {
                // Put the first one with a given name in.
                schemaOptions.add([name: schema.getName(), value: schema.getId()]);
            }
        }
        return schemaOptions;
    }

    /**
     * The webflow for creating a new process as part of a project.
     */
    def addToProjectFlow = {
        init {
            action {

                Project p = Project.get(params.id);
                conversation.schemas = annotationSchemaService.getAll(p);
                conversation.readOnly = false;
                conversation.editValuesMap = new HashMap<String, Object>();


                if (params.readOnly && Boolean.parseBoolean(params.readOnly)) {
                    conversation.mode = "readOnly";
                } else if ("true".equals(params.editMode)) {
                    conversation.mode = "edit";
                }

                if (!p) {
                    throw new ValidationException("Could not load project for deployedProcessDefinitionId=${params.id}.");
                }

                AddProcessWorkflowModel model = new AddProcessWorkflowModel();
                model.query = "select id from patient;";
                model.project = p;
                model.schemas = getSchemaOptions(p);
                List<ProcessDefinition> processList = repositoryService.createProcessDefinitionQuery().orderByProcessDefinitionName().asc().list()

                conversation.model = model;
                conversation.project = p;
                conversation.authorities = p.authorities.sort{it.user.username};
                conversation.processes = processList;
                conversation.serviceParameters = new HashMap<String, String>();
                conversation.possibleAnnotationGroups = getPossibleAnnotationGroups(p);

                // Copying from an existing process.
                if ( params.proc ) {
                    String projectIdToCopy = params.id;
                    String processName = params.proc;
                    def (Map<String, ClinicalElementConfiguration> configurationMap, LinkedList<TaskDefinitionWithVariable> tasks, HashMap<String, String> serviceParameters) = setupProcessModel(Project.get(projectIdToCopy), processName, model);
                    conversation.clinicalElementConfigurationMap = configurationMap;
                    conversation.tasksWithVariables = tasks;
                    conversation.model = model;
                    conversation.formProperties = getStartFormData(model.processId);
                    conversation.serviceParameters = serviceParameters;
                    conversation.originalProcessName = params.proc;
                    step2();
                } else {
                    step1();
                }
            }
            on("step1").to "step1"
            on("step2").to "step2"
            on("cancel").to "cancel"
        }
        step1 {
            on("next"){
                AddProcessWorkflowModel model = conversation.model;
                model.processId = params.processId;

                def (LinkedList<TaskDefinitionWithVariable> tasks, List<FormPropertyImpl> props, Map<String, ClinicalElementConfiguration> configurationMap) = prepForStep2(model, conversation.project)
                conversation.clinicalElementConfigurationMap = configurationMap;
                conversation.tasksWithVariables = tasks;
                conversation.model = model;
                conversation.formProperties = props;
                List<ProjectDocument> projectDocumentList = ProjectDocument.findAllByProject(conversation.model.project).sort{it.name};
                conversation.projectDocumentList = projectDocumentList;
            }.to "step2"
        }
        step2 {
            on("previous") {
                // Only happens on create, not review or edit where step 1 is not available...
                String validationErrors = null;
                AddProcessWorkflowModel returnedModel = null;
                Map serviceParameters;
                (validationErrors, returnedModel, serviceParameters) = processStep2Params(conversation.model, params, conversation.serviceParameters, conversation.project);
                conversation.model = returnedModel;
                conversation.serviceParameters = serviceParameters;
                if (validationErrors) {
                    flash.message = validationErrors;
                    return step2();
                }
            }.to "step1"
            on("next"){
                if (conversation.mode == "readOnly") {
                    step3();
                    return;
                } else if (conversation.mode == "edit"){
                    conversation.editValuesMap.put("displayName", params.displayName);
                    conversation.model.displayName = params.displayName;
                    Map<String, String> webParams = params;
                    Set<String> taskDescriptionKeys = webParams.keySet().findAll {
                        it.matches(/taskVariablesList\[[0-9]?\].detailedDescription/)
                    };

                    taskDescriptionKeys.each {
                        String indexString =it.substring(it.indexOf("[") + 1, it.indexOf("]"));
                        int index = new Integer(indexString);
                        String taskName = conversation.model.taskVariablesList.get(index).taskDefinitionKey;
                        String varName = it.substring(it.indexOf(".") + 1);
                        conversation.model.taskVariablesList.get(index).parameters.put(varName, webParams.get(it));
                        conversation.editValuesMap.put(taskName + "." + varName, webParams.get(it));
                    }
                } else {
                    String validationErrors = null;
                    AddProcessWorkflowModel returnedModel = null;
                    Map serviceParameters;
                    (validationErrors, returnedModel, serviceParameters) = processStep2Params(conversation.model, params, conversation.serviceParameters, conversation.project);
                    conversation.model = returnedModel;
                    conversation.serviceParameters = serviceParameters;

                    if (validationErrors) {
                        flash.message = validationErrors;
                        return step2();
                    }
                }
            }.to "step3"
        }
        step3 {
            on("previous"){
                if (conversation.mode == "readOnly" || conversation.mode == "edit") {
                    step2();
                    return;
                } else {
                    boolean singleStep = (conversation.serviceParameters.size() == 1);
                    conversation.model = processStep3Params(conversation.model, params, singleStep);
                    conversation.model.schemas = getSchemaOptions(conversation.model.project);
                }
            }.to "step2"
            on("finish") {
                if (conversation.mode == "readOnly") {
                    finish();
                    return;
                } else if (conversation.mode == "edit") {
                    def variableMap = conversation.editValuesMap;
                    boolean singleStep = (conversation.serviceParameters.size() == 1);
                    AddProcessWorkflowModel model = processStep3Params(conversation.model, params, singleStep);
                    processService.updateProcess(conversation.project.id, conversation.originalProcessName, variableMap, model.processUsers);
                    flash.message = "Edits saved.";
                    redirect(controller: "project", action: 'show', id: conversation.project.id);
                } else {
                    boolean singleStep = (conversation.serviceParameters.size() == 1);
                    AddProcessWorkflowModel model = processStep3Params(conversation.model, params, singleStep);
                    List<Object[]> patientIdResultSet = null;
                    try {
                        patientIdResultSet = projectService.runQuery(model.project, model.query);
                    } catch (Exception e) {
                        flash.message = "Error: ${e.getMessage()}";
                        return step3();
                    }
                    int instantiatedCount = processService.startProcess(model, conversation.serviceParameters, patientIdResultSet.collect {
                        it[0]
                    });
                    flash.message = "(${instantiatedCount}) processes started.";
                    redirect(controller: "project", action: 'show', id: conversation.project.id);
                }
            }.to "finish"
            on("cancel").to "cancel"
        }
        finish {
            // Done, no action. You do need a finish.gsp though, even though it will never be shown.
        }
        cancel {
            redirect(controller: "project", action:'list')
        }

    }

    protected List setupProcessModel(Project projectToCopy, String processName, AddProcessWorkflowModel model) {
        Map<String, String> serviceParameters = new HashMap<String, String>();
        List<ActivitiRuntimeProperty> processVariables = processService.getRuntimeProperties(projectToCopy, processName);

        model.processId = params.processDefinitionId;

        def (LinkedList<TaskDefinitionWithVariable> tasks, List<FormPropertyImpl> props, Map<String, ClinicalElementConfiguration> configurationMap) = prepForStep2(model, projectToCopy)

        model.displayName = processVariables.get(0).processDisplayName;
        model.processGroup = Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), processVariables)?.value;
        model.processOrTask = Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.PROCESS_OR_TASK.getName(), processVariables)?.value;
        model.query = Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.PROCESS_CREATION_QUERY.getName(), processVariables)?.value;
        model.processUsers = Utils.getActivitiRuntimePropertyFromList("processUsers", processVariables).value?.tokenize(",");
        if (!model.processUsers) {
            model.processUsers = new ArrayList<String>();
        }

        // Copy existing task property values over.
        model.taskVariablesList.each { taskVariable ->
            List<ActivitiRuntimeProperty> taskVariables = processService.getRuntimeProperties(projectToCopy, processName, taskVariable.taskDefinitionKey);
            String clinicalElementDisplayParametersListJSON = Utils.getActivitiRuntimePropertyFromList("clinicalElements", taskVariables)?.value;

            List<ClinicalElementDisplayParameters> originalDisplayParameters = taskVariable.clinicalElements;

            if (clinicalElementDisplayParametersListJSON) {
                List<ClinicalElementDisplayParameters> displayParameters = new Gson().fromJson(clinicalElementDisplayParametersListJSON, new TypeToken<List<ClinicalElementDisplayParameters>>() {
                }.getType());

                originalDisplayParameters.each { orig ->
                    if (!displayParameters.find {
                        it.clinicalElementConfigurationId == orig.clinicalElementConfigurationId
                    }) {
                        orig.position = displayParameters.size() + 1;
                        displayParameters.add(orig);
                    }
                }

                taskVariable.clinicalElements = displayParameters;
            }

            def existingTaskVars = processVariables.findAll { it.taskDefinitionKey == taskVariable.taskDefinitionKey };
            existingTaskVars.each {
                taskVariable.parameters.put(it.name, it.value);
            }
        }

        // Set conversation.serviceParameters correctly.
        processVariables.each { variable ->
            if (variable.name.startsWith("serviceTask:")) {
                serviceParameters.put(variable.name, variable.value);
            }
        }
        return [configurationMap, tasks, serviceParameters]
    }

    def delete() {
        repositoryService.deleteDeployment(params.id);
        redirect(action: "list");

    }

    protected List prepForStep2(AddProcessWorkflowModel model, Project p) {
        List<TaskDefinitionWithVariable> tasks = processService.getTaskDefinitions(model.processId);
        Map<String, ClinicalElementConfiguration> configurationMap = new HashMap<>();
        DataSource ds = Utils.getProjectDatasource(p);

        /**
         * Add default task variables for each user task.
         */
        List<TaskVariables> taskVariablesList = new ArrayList<TaskVariables>();
        for (TaskDefinitionWithVariable task : tasks) {
            if (task instanceof ServiceTaskDefinitionWithVariable) {
                List<ClinicalElementConfiguration> cecs = clinicalElementConfigurationService.getAllClinicalElementConfigurations(ds, p).sort{it.name};
                cecs.eachWithIndex() { obj, i ->
                    configurationMap.put(obj.id, obj);
                }
                continue;
            }

            TaskVariables variables = new TaskVariables();
            variables.taskDefinitionKey = task.taskDefinitionKey;
            if (task.hasClinicalElements) {
                List<ClinicalElementDisplayParameters> clinicalElementConfigurations = new ArrayList<ClinicalElementDisplayParameters>();
                List<ClinicalElementConfiguration> cecs = clinicalElementConfigurationService.getAllClinicalElementConfigurations(ds, p).sort{it.name};


                cecs.eachWithIndex() { obj, i ->
                    configurationMap.put(obj.id, obj);
                    clinicalElementConfigurations.add(new ClinicalElementDisplayParameters(obj.id, i + 1));
                }

                variables.clinicalElements = clinicalElementConfigurations;
            }
            taskVariablesList.add(variables);
        }
        model.taskVariablesList = taskVariablesList;
        model.schemas = getSchemaOptions(p);

        List<FormPropertyImpl> props = getStartFormData(model.processId)
        return [tasks, props, configurationMap]
    }

    protected List<FormPropertyImpl> getStartFormData(String processId) {
        StartFormData startFormData = processService.formService.getStartFormData(processId);
        List<FormPropertyImpl> props = startFormData.formProperties;

        if (startFormData && startFormData.formProperties.size() > 0) {
            props.each { formProperty ->
                StringFormTypeSerializable s = new StringFormTypeSerializable();
                BeanUtils.copyProperties(s, formProperty.type);
                formProperty.type = s;
            }
        }
        return props
    }

    protected AddProcessWorkflowModel processStep3Params(AddProcessWorkflowModel model, def params, boolean singleStep) {
        model.query = params.query;
        if (singleStep) {
            model.processOrTask = "process";
        } else {
            model.processOrTask = params.processOrTask;
        }
        model.processUsers = params.list('processUsers');
        return model;
    }


    protected processStep2Params(AddProcessWorkflowModel model, def params, Map<String, String> serviceParameters, Project p) {
        List<String> validationErrors = new ArrayList<String>();

        if (GenericValidator.isBlankOrNull(params.displayName)) {
            validationErrors.add("Display name is required.")
        }
        model.displayName = params.displayName;
        model.processGroup = params.processGroup;

        model.taskVariablesList.eachWithIndex { TaskVariables taskVariable, int taskVariableIndex ->
            String toGet = "taskVariablesList[${taskVariableIndex}]";
            Map webTaskVariable = params.get(toGet);
            taskVariable.clinicalElements.eachWithIndex { ClinicalElementDisplayParameters entry, int clinicalElementIndex ->
                String ceToGet = "clinicalElements[${clinicalElementIndex}]";

                /**
                 * Map with the clinical Element values.
                 */
                Map webClinicalElement = webTaskVariable.get(ceToGet);

                if (webClinicalElement.containsKey("include")) {
                    entry.include = true;
                } else {
                    entry.include = false;
                }
                if (webClinicalElement.containsKey("hidden")) {
                    entry.hidden = true;
                } else {
                    entry.hidden = false;
                }
                entry.position = new Integer(webClinicalElement.get("position"));
            }



            if (GenericValidator.isBlankOrNull(webTaskVariable.get(TaskVariablesEnum.ANNOTATION_GROUP.getName()))) {
                validationErrors.add("Task annotation group for task ${taskVariableIndex} is required.")
            }
            taskVariable.parameters.put(TaskVariablesEnum.ANNOTATION_GROUP.getName(),
                    webTaskVariable.get(TaskVariablesEnum.ANNOTATION_GROUP.getName()));

            taskVariable.parameters.put(TaskVariablesEnum.PROJECT_DOCUMENT.getName(),
                    webTaskVariable.get(TaskVariablesEnum.PROJECT_DOCUMENT.getName()));

            taskVariable.parameters.put(TaskVariablesEnum.DETAILED_DESCRIPTION.getName(),
                    webTaskVariable.get(TaskVariablesEnum.DETAILED_DESCRIPTION.getName()));


            if (model.taskVariablesList.size() == 1) {
                webTaskVariable.put(TaskVariablesEnum.NAME.getName(), model.displayName);
            } else if (GenericValidator.isBlankOrNull(webTaskVariable.get(TaskVariablesEnum.NAME.getName()))) {
                validationErrors.add("Task name for task ${taskVariableIndex} is required.")
            }
            taskVariable.parameters.put(TaskVariablesEnum.NAME.getName(),
                    webTaskVariable.get(TaskVariablesEnum.NAME.getName()));
            taskVariable.parameters.put(TaskVariablesEnum.PRE_ANNOTATION_GROUP.getName(),
                    webTaskVariable.get(TaskVariablesEnum.PRE_ANNOTATION_GROUP.getName()));
            taskVariable.parameters.put(TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName(),
                    webTaskVariable.get(TaskVariablesEnum.PRIMARY_CLINICAL_ELEMENT.getName()));
            taskVariable.parameters.put(TaskVariablesEnum.SCHEMA.getName(),
                    webTaskVariable.get(TaskVariablesEnum.SCHEMA.getName()));

            validationErrors.add(validateMaxLength(webTaskVariable.get(TaskVariablesEnum.ANNOTATION_GROUP.getName()), 255, "Task ${taskVariableIndex + 1}: annotation Group"));
            validationErrors.add(validateMaxLength(webTaskVariable.get(TaskVariablesEnum.DETAILED_DESCRIPTION.getName()), 4000, "Task ${taskVariableIndex + 1}: detailed description"));
            validationErrors.add(validateMaxLength(webTaskVariable.get(TaskVariablesEnum.NAME.getName()), 100, "Task ${taskVariableIndex + 1}: name"));
            validationErrors.add(validateMaxLength(webTaskVariable.get(TaskVariablesEnum.PRE_ANNOTATION_GROUP.getName()), 255, "Task ${taskVariableIndex + 1}: pre-annotation group"));

            if (ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayName(p, model.displayName).size() >0) {
                validationErrors.add("Process already running with '${model.displayName}' for this project. Display name must be unique within a project.");
            }

        }

        params.each { k, v ->
            if (k.startsWith("serviceTask:")) {
                   if (v instanceof String[]) {
                       serviceParameters.put(k, v.join(","));
                   } else {
                       serviceParameters.put(k, v);
                   }
            }
        }


        if (serviceParameters.size() >0) {
            serviceParameters.put("databaseConnectionUrl", p.getDatabaseConnectionUrl());
            serviceParameters.put("jdbcDriver", p.getJdbcDriver());
            serviceParameters.put("jdbcUsername", p.getJdbcUsername());
            serviceParameters.put("jdbcPassword", p.getJdbcPassword());
        }

        validationErrors.add(validateMaxLength(params.displayName, 100, "Display name"));
        validationErrors.removeAll([null])
        String validationErrorString = "";
        validationErrors.sort{}.each {
            validationErrorString += "<p>${it}</p>";
        }

        return [validationErrorString, model, serviceParameters];
    }

    protected String validateMaxLength(String string, int maxLength, String fieldName) {
         if (string.length() > maxLength) {
             return("${fieldName} cannot be greater than ${maxLength} characters.")
         }
    }

    public SortedSet<String> getPossibleAnnotationGroups(Project p) {
        Connection connection = null;
        QAnnotation qAnnotation = new QAnnotation("a");
        SortedSet<String> results = new TreeSet<String>();
        try {
            /** Get current siman groups. **/
            connection = projectService.getDatabaseConnection(p);

            SQLQuery query = new SQLQueryFactoryImpl(Utils.getSQLTemplate(p.jdbcDriver), new ConnectionProvider(connection)).query();
            query.from(qAnnotation);
            def queryResults = query.distinct().list(qAnnotation.annotationGroup);

            for (String t: queryResults) {
                results.add(t);
            }

            /**
             * Get list of configured activiti groups for this project.
             */
            List<ActivitiRuntimeProperty> props = ActivitiRuntimeProperty.findAllByProjectAndName(p, "annotationGroup");
            props.each {
                results.add(it.value);
            }


        } finally {
            closeConnection(connection);
        }

        results = results.sort();
        return results;
    }


}
