package chartreview

import gov.va.vinci.chartreview.ProcessVariablesEnum
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.User
import org.activiti.engine.history.HistoricProcessInstance
import org.activiti.engine.runtime.ProcessInstance

import javax.validation.ValidationException

class AdminController {
    def runtimeService;
    def historyService;
    def projectService;
    def springSecurityService;

    def switchUser() {

    }

    def userManagement() {
        render view: "userManagement";
    }

    def tools() {

    }

    /**
     * Deletes ALL running process instances in Activiti. Should mostly be used during testing.
     *
     * @return
     */
    def deleteRunningProcessInstances() {
        int processCounter = 0;
        List<ProcessInstance> instanceList = runtimeService.createProcessInstanceQuery().list();
        instanceList.each { instance ->
            runtimeService.deleteProcessInstance(instance.getId(), "Admin tool removal.");
            processCounter++;
        }

        List<HistoricProcessInstance> historyList =  historyService.createHistoricProcessInstanceQuery()
                .list();
        historyList.each { instance ->
            historyService.deleteHistoricProcessInstance(instance.getId());
            processCounter++;
        }

        ActivitiRuntimeProperty.findAll().each {
            it.delete();
        }
        flash.message = "${processCounter} processes deleted.";
        render(view: "tools");
    }

    /**
     * Deletes running process instances in Activiti for a given project/process. Should mostly be used during testing.
     *
     * @return
     */
    def deleteRunningProcessInstancesByProjectProcess() {
        if (!params.projectId || !params.displayName) {
            render("projectId and displayName are both required parameters.");
            return null;
        }

        List<User> admins = projectService.projectAdministrators(Project.get(params.projectId));
        def exists = admins.find{ user -> user.username ==  springSecurityService.principal.username};
        if (!exists) {
            render "You are not an administrator on project ${params.projectId}, and cannot delete process instances on that project.";
            return null;
        }

        int processCounter = 0;
        List<ProcessInstance> instanceList =  runtimeService.createProcessInstanceQuery()
                                                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), params.projectId)
                                                .variableValueEquals(ProcessVariablesEnum.DISPLAY_NAME.getName(), params.displayName)
                                                .list();
        instanceList.each { instance ->
            runtimeService.deleteProcessInstance(instance.getId(), "Admin tool removal.");
            processCounter++;
        }


        List<HistoricProcessInstance> historyList =  historyService.createHistoricProcessInstanceQuery()
                .variableValueEquals(ProcessVariablesEnum.PROJECT_ID.getName(), params.projectId)
                .variableValueEquals(ProcessVariablesEnum.DISPLAY_NAME.getName(), params.displayName)
                .finished()
                .list();
        historyList.each { instance ->
            historyService.deleteHistoricProcessInstance(instance.getId());
            processCounter++;
        }


        ActivitiRuntimeProperty.findAllByProjectAndProcessDisplayName(Project.get(params.projectId),  params.displayName).each {
            it.delete();
        }

        flash.message = "Process deleted.";
        redirect(controller: "project", action: "show", id: params.projectId);
        return;
    }
}
