package chartreview

import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.Role

class TestController {
    def projectService;

    def up() {
        try
        {
            List<Project> userProjects = projectService.projectsUserIsAssignedTo("admin", Role.findByName("ROLE_ADMIN")).sort{it.name};
            if(userProjects.size() > 0)
            {
                render("OK")
            }
            else
            {
                render("ERROR")
            }
        }
        catch(Exception e)
        {
            render("ERROR")
        }
    }
}
