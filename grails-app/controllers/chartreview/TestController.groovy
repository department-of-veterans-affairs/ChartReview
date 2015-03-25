package chartreview

import gov.va.vinci.chartreview.ProcessVariablesEnum
import gov.va.vinci.chartreview.SummaryTableDTO
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.Role
import grails.plugin.gson.converters.GSON

class TestController {
    def projectService;

    def up() {
//        response.setContentType("text/html");
//        response.setCharacterEncoding("utf-8");
// as GSON is making the response content type application/json which IE tries to download instead of display....Works on other browsers and solar winds.
        try
        {
            List<Project> userProjects = projectService.projectsUserIsAssignedTo("admin", Role.findByName("ROLE_ADMIN")).sort{it.name};
            if(userProjects.size() > 0)
            {
                render([status:"OK"] as GSON)
            }
            else
            {
                render([status:"ERROR"] as GSON)
            }
        }
        catch(Exception e)
        {
            render([status:"ERROR"] as GSON)

        }
    }
}
