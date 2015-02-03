package chartreview

import gov.va.vinci.chartreview.ProcessVariablesEnum
import gov.va.vinci.chartreview.SummaryTableDTO
import grails.plugin.gson.converters.GSON

class WelcomeController {
    def springSecurityService;
    def activitiUserService;
    def processService;
    def projectService;
    public static String SESSION_VARIABLE_NAME_PROJECT_ID="welcomeController:projectId";
    public static String SESSION_VARIABLE_NAME_PROCESS_ID="welcomeController:processId";
    public static String SESSION_VARIABLE_NAME_SHOW_COMPLETED="welcomeController:showCompleted";

    def index() {

        String projectId = session.getAttribute(SESSION_VARIABLE_NAME_PROJECT_ID);
        boolean showCompleted = false;




        /** Project id changed. **/
        if (params.containsKey('projectId') && params.projectId != "-1") {
            if (!params.projectId.equals(projectId)) {
                session.removeAttribute(SESSION_VARIABLE_NAME_PROCESS_ID);
            }
            projectId = params.projectId;
            session.setAttribute(SESSION_VARIABLE_NAME_PROJECT_ID, projectId);
        }

        if (params.containsKey('projectId')) {
            session.setAttribute(SESSION_VARIABLE_NAME_SHOW_COMPLETED, new Boolean(params.containsKey('showCompletedProcesses') && params.showCompletedProcesses == "on" ? true : false));
        }

        if (activitiUserService.findUser(springSecurityService.principal.username) == null) {
            activitiUserService.createUser(springSecurityService.principal.username);
        }

        Map<String, String> processDisplayNames = new HashMap<String, String>();

        /**
         * Submission to move into annotation screen.
         */
        Boolean doGetNextAssignment = new Boolean(params.containsKey('open') && params.open == "Get Next Assignment" ? true : false);
        if (params.containsKey(ProcessVariablesEnum.PROJECT_ID.getName()) && params.containsKey(ProcessVariablesEnum.PROCESS_ID.getName()) &&
                params.processId != "-1" && params.projectId != "-1" && doGetNextAssignment) {
            redirect(url: "/chart-review?projectId=${params.projectId}&processId=${params.processId}");
            return;
        }

        Boolean showCompletedProcesses = session.getAttribute(SESSION_VARIABLE_NAME_SHOW_COMPLETED);
        if (projectId != "-1") {
            processDisplayNames = processService.getAvailableProcessNameUserCanGetTasksFor(springSecurityService.principal.username, projectId, showCompletedProcesses);
        }

        def processCounts =  processService.getProcessNamesAndTodoCountForProject(params.projectId);

        processDisplayNames.each { k, v ->
            def proc = processCounts.find{it.processName == v}
            if (proc) {
                v = v +  " ( " + proc.todoCount + " todo )"
            } else {
                v = v +  " ( 0 todo )"
            }
            processDisplayNames.put(k, v);
        }


        params.projectId = projectId;

        render(view: "index",
                model: [
                        projectId: params.projectId,
                        processId: params.processId,
                        showCompletedProcesses: params.showCompletedProcesses,
                        projects: projectService.projectsUserIsAssignedTo(springSecurityService.principal.username),
                        processDisplayNames: processDisplayNames.sort{it.key.toLowerCase()},
                        processCounts: processCounts
                ]
        );
    }

    /**
     * Renders HTML table of recent tasks for a user, project, and process id.
     * @return   HTML table of recent tasks for a user, project, and process id.
     */
    def loadSummaryTable() {
        List<SummaryTableDTO> summaryTable =  null;

        if (params.processId != "-1") {
            summaryTable = processService.getAssignedAndRecentTasksForUser(springSecurityService.principal.username, params.projectId, params.processId)
            session.setAttribute(SESSION_VARIABLE_NAME_PROCESS_ID, params.processId);
        } else {
            session.removeAttribute(SESSION_VARIABLE_NAME_PROCESS_ID);
            render "";
            return;
        }

        if (!summaryTable) {
            render "No previously completed or currently assigned tasks for this processes!"
        } else {
            render(template: "summaryTable",
                    model: [ summaryTableDTOs: summaryTable,
                             projectId: params.projectId,
                             processId: params.processId]);
        }
    }

    def loadProcessDisplayNames() {
        Map<String, String> processDisplayNames = processService.getAvailableProcessNameUserCanGetTasksFor(springSecurityService.principal.username, params.projectId);

        render processDisplayNames as GSON;
        return null;
    }

    def putOnHold() {
        processService.taskHold(params.taskId, params.statusComment);
        forward action: "loadSummaryTable";
    }
}
