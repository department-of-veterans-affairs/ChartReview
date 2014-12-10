package chartreview

import gov.va.vinci.chartreview.ProcessVariablesEnum
import gov.va.vinci.chartreview.TaskVariablesEnum
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty
import gov.va.vinci.chartreview.model.ClinicalElementDisplayParameters
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.util.NotFoundException
import gov.va.vinci.siman.model.ClinicalElement
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import org.restapidoc.annotation.RestApi
import org.restapidoc.annotation.RestApiMethod
import org.restapidoc.annotation.RestApiParam
import org.restapidoc.annotation.RestApiParams
import org.restapidoc.pojo.RestApiParamType
import org.restapidoc.pojo.RestApiVerb
import org.springframework.http.MediaType

import javax.validation.ValidationException

@RestApi(name = "Annotation services", description = "Methods for managing annotations")
class AnnotationController {
    def springSecurityService
    def processService;
    def clinicalElementService;
    AnnotationService annotationService;

    @RestApiMethod( description="Get an assigned task for the currently logged in user.",
                    path="/annotation/getTask",
                    produces= MediaType.TEXT_XML_VALUE,
                    verb=RestApiVerb.GET
                  )
    @RestApiParams(params=[
            @RestApiParam(name="projectId", type="string", paramType = RestApiParamType.PATH, description = "The project id to get a task for "),
            @RestApiParam(name="processId", type="string", paramType = RestApiParamType.PATH, description = "The processId id to get a task for ")
    ])
    /**
     * Return (a single) task that is to be performed by the current user for the given project and process.
     * @projectId - The requested project
     * @processId - The requested process
     */
    def getTask() {
        def projectId = params.projectId;
        def processId = params.processId;

        if (!projectId || !processId)
        {
            throw new ValidationException("Required parameters: projectId, processId");
        }

        String claimedTaskId = null;
        try{
            claimedTaskId = processService.claimTask(springSecurityService.principal.username, params.projectId, params.processId);
        }
        catch(NotFoundException e)
        {
            render(text: "<?xml version=\"1.0\" encoding=\"UTF-8\"?><tasks></tasks>", contentType:"application/xml");
            return;
        }

        log.debug("Claimed task id: ${claimedTaskId} for user ${springSecurityService.principal.username}.");
        String taskXml = processService.getXmlForTask(claimedTaskId);
        render(text: taskXml, contentType:"application/xml");
    }

    @RestApiMethod( description="Get an task by task id",
            path="/annotation/getTaskByTaskId",
            produces= MediaType.TEXT_XML_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="taskId", type="string", paramType = RestApiParamType.PATH, description = "The task id to get")
    ])
    /**
     *
     * Return (a single) task that is to be performed by the current user for the given project and process.
     * @taskId - The Task ID to get.
     */
    def getTaskByTaskId() {
        def taskId = params.taskId;

        if (!taskId)
        {
            throw new ValidationException("Required parameters: taskId");
        }


        String xml= "";

        if (params.taskType != "COMPLETED") {
            xml =  processService.getXmlForTask(taskId);
        } else {
            xml =  processService.getXmlForHistoricTask(taskId);
        }


        render(text: xml, contentType:"application/xml");
    }


    @RestApiMethod( description="Returns the list of annotations for the given clinical element, task.",
            path="/annotation/getAnnotations",
            produces= MediaType.TEXT_XML_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="taskId", type="string", paramType = RestApiParamType.PATH, description = "The id of the on which the requested annotations will be pre-annotations (not the tasks for which the annotations were created)")
    ])
    /**
     * Returns the list of annotations for the given clinical element, task.
     * @taskId - The id of the on which the requested annotations will be pre-annotations (not the tasks for which the annotations were created)
     */
    def getAnnotations() {
        log.debug("Get annotations for taskId: ${params.taskId}");

        if (!params.taskId ) {
            throw new ValidationException("Required parameters: taskId.")
        }

        String patientId = processService.parseBusinessKey(processService.getProcessBusinessKeyForTask(params.taskId)).get("patientId");

        List<ActivitiRuntimeProperty> activitiRuntimeProperties = processService.getActivitiRuntimePropertiesTaskId(params.taskId);

        Map<String, Object> processVariables = null;
        processVariables = processService.getTaskVariables(params.taskId);

        String annotationGroup = Utils.getActivitiRuntimePropertyFromList(TaskVariablesEnum.PRE_ANNOTATION_GROUP.getName(), activitiRuntimeProperties)?.value;
        String group = Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), activitiRuntimeProperties)?.value;
        String taskStatus = processService.getTaskStatus(params.taskId);

        if (processService.isHistoric(params.taskId)) {
            taskStatus = "completed"
        }

        String filterSchema = Utils.getActivitiRuntimePropertyFromList(TaskVariablesEnum.SCHEMA.getName(), activitiRuntimeProperties)?.value;

        if (taskStatus == "hold" || taskStatus == "in-progress" || taskStatus == "completed") {
               annotationGroup = Utils.getActivitiRuntimePropertyFromList(TaskVariablesEnum.ANNOTATION_GROUP.getName(), activitiRuntimeProperties).value;
        }

        Map<ClinicalElementConfiguration, ClinicalElementDisplayParameters> clinicalElementConfigurations = processService.getClinicalElementConfigurationsForTaskId(params.taskId);
        List<ClinicalElement> clinicalElements = new ArrayList<ClinicalElement>();

        clinicalElements.addAll(annotationService.getExistingAnnotations(processVariables.get(ProcessVariablesEnum.PROJECT_ID.getName()),
                clinicalElementConfigurations.keySet().collect{ it.id},  /** list of cec ids **/
                group,
                annotationGroup,
                patientId));

        if (clinicalElements) {
            String annotationXml = annotationService.getXmlForAnnotations(clinicalElements, filterSchema, processVariables.get(ProcessVariablesEnum.PROJECT_ID.getName()));
            render(text: annotationXml, contentType: "text/xml");
        } else {
            render "";
        }
    }

    @RestApiMethod( description="Submit annotations and change task status. The body of the post should contain the submission XML. ",
            path="/annotation/submitAnnotations",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.POST
    )
    @RestApiParams(params=[
            @RestApiParam(name="status", type="string", paramType = RestApiParamType.PATH, description = "The new task status (hold/completed/save)"),
            @RestApiParam(name="taskId", type="string", paramType = RestApiParamType.PATH, description = "The task whose annotations these are and whose status should be changed."),
            @RestApiParam(name="statusComment", type="string", paramType = RestApiParamType.PATH, description = "The comment on the status. Must be hold, completed, or in-progress.")

    ])
    /**
     * Submit annotations and change task status.
     * @taskId - The task whose annotations these are and whose status should be changed.
     * @status - The new task status (hold/completed/save)
     * @statusComment - The comment on the status.
     */
    def submitAnnotations() {
        // NOTE params.statusComment is optional
        if (!params.taskId || !params.status  ||
                (params.status != "hold" && params.status != "completed" && params.status != "in-progress") ||
                (params.status == "hold" && (!params.statusComment || params.statusComment.length() == 0)))
        {
            throw new ValidationException("Required parameters: taskId, status (hold/completed/save)")
        }

        // Save annotations
        String requestXml = request.inputStream.text;

        List<ActivitiRuntimeProperty> props =  processService.getActivitiRuntimePropertiesTaskId(params.taskId);
        String annotationGroup = Utils.getActivitiRuntimePropertyFromList(TaskVariablesEnum.ANNOTATION_GROUP.getName(), props)?.value;
        String group =  Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), props)?.value;

        Map<String, Object> processVariables = processService.getTaskVariables(params.taskId);

        String projectId = processVariables.get(ProcessVariablesEnum.PROJECT_ID.getName());
        Project project= Project.get(projectId);

        String patientId = processService.parseBusinessKey(processService.getProcessBusinessKeyForTask(params.taskId)).get("patientId");
        annotationService.saveAnnotations(  props.get(0).getProcessDisplayName(),
                                            params.taskId,
                                            project,
                                            new ArrayList<ClinicalElementConfiguration>(processService.getClinicalElementConfigurationsForTaskId(params.taskId).keySet()),
                                            requestXml,
                                            springSecurityService.principal.username,
                                            group,
                                            annotationGroup,
                                            patientId );

        /**
         *  Update activity status if needed.
         */
         if ("hold".equals(params.status)) {
            processService.taskHold(params.taskId, params.statusComment);
        } else if ("completed".equals(params.status)) {
            processService.taskComplete(params.taskId, params.statusComment);
        } else if ("in-progress".equals(params.status)) {
             processService.taskInProgress(params.taskId, params.statusComment);
         }

        render(text: "{'status':'OK'}", contentType:"application/json")
    }
}
