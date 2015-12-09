package chartreview
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.Role
import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import gov.va.vinci.leo.tools.db.LeoArrayListHandler
import net.sourceforge.jtds.jdbc.jTDSDriverManager
import net.sourceforge.spnego.SpnegoPrincipal
import org.apache.commons.dbcp.BasicDataSource
import org.apache.commons.dbutils.QueryRunner
import org.codehaus.groovy.grails.web.servlet.mvc.GrailsHttpSession
import org.codehaus.groovy.grails.web.servlet.mvc.GrailsWebRequest
import org.codehaus.groovy.grails.web.util.WebUtils
import org.ietf.jgss.GSSCredential

import javax.servlet.http.HttpServletRequest
import java.security.Principal
import java.sql.Connection

import static gov.va.vinci.chartreview.Utils.closeConnection

class ProjectService {
    static String DEFAULT_SQL_CONNECTION_VALIDATION_QUERY = "select 1";
    def springSecurityService;

    /**
     * Return a list of administrators for a project.
     * @param p the project to get administrators for.
     * @return a list of users that have ROLE_ADMIN on the project.
     */
    public List<User> projectAdministrators(Project p) {
        List<User> admins = new ArrayList<User>();
        Role adminRole = Role.findByName("ROLE_ADMIN");

        p.authorities.each { authority ->
            if (authority.processStepId == null && authority.role.equals(adminRole)) {
                admins.add(authority.user);
            }
        }
        return admins;
    }

    /**
     * Return a list of administrators for a project.
     * @param p the project to get administrators for.
     * @return a list of users that have ROLE_ADMIN on the project.
     */
    public List<User> projectUsers(Project p) {
        List<User> users = new ArrayList<User>();

        p.authorities.each { authority ->
            if (authority.processStepId == null) {
                users.add(authority.user);
            }
        }
        return users;
    }

    /**
     * Return all projects the user is associated with. This can be in any role.
     * @param username the username to get project for.
     * @return all projects the user is associated with, regardless of role. (Sorted by project name)
     */
    public List<Project> projectsUserIsAssignedTo(String username) {
        List<Project> results = new ArrayList<Project>();

        UserProjectRole.findAllByUser(User.findByUsername(username)).each { userProjectRole ->
            if (!results.contains(userProjectRole.getProject())) {
                results.add(userProjectRole.getProject());
            }
        }
        results = results.sort { o1, o2 -> o1.name.compareToIgnoreCase(o2.name) };
        return results;
    }

    /**
     * Return all projects the user is associated with. This can be in any role.
     * @param username the username to get project for.
     * @return all projects the user is associated with, regardless of role. (Sorted by project name)
     */
    public List<Project> projectsUserIsAssignedTo(String username, Role projectRole) {
        List<Project> results = new ArrayList<Project>();

        UserProjectRole.findAllByUserAndRole(User.findByUsername(username), projectRole).each { userProjectRole ->
            if (!results.contains(userProjectRole.getProject())) {
                results.add(userProjectRole.getProject());
            }
        }
        results = results.sort { o1, o2 -> o1.name.compareToIgnoreCase(o2.name) };
        return results;
    }

    public List<Object[]> runQuery(Project project, String query) throws Exception {
        Connection conn;
        LeoArrayListHandler handler = new LeoArrayListHandler();

        try {
            conn = getDatabaseConnection(project);
            QueryRunner runner = new QueryRunner();
            return runner.query(conn, query, handler);
        } finally {
            closeConnection(conn);
        }
    }

    /**
     * Get a database connection for a project.
     * @param p the project to get the database connection for.
     * @return a database connection created from the project metadata. If  net.bull.javamelody.JdbcDriver
     *  is available in the classpath, the driver class with use net.bull.javamelody.JdbcDriver as the main
     *  driver to allow for JavaMelody statistics on the connection. Otherwise the connection will use
     *  the project jdbc driver.
     */
    public static Connection getDatabaseConnection(Project p) {
        GrailsWebRequest webUtils = WebUtils.retrieveGrailsWebRequest();
        GrailsHttpSession session = webUtils.getSession()
        BasicDataSource dataSource = null;

        dataSource = session.getAttribute("BasicDataSource:" + p.getId());
        if (dataSource) {
            return dataSource.getConnection();
        }

        boolean javaMelodyDriverExists = true;
        try {
            Class.forName("net.bull.javamelody.JdbcDriver");
        } catch (ClassNotFoundException e) {
            javaMelodyDriverExists = false;
        }

        // Now perform the query to get the data.
        Class.forName(p.getJdbcDriver());

        // Get a connection to the database
        Connection conn = null;

        dataSource = new BasicDataSource();
        dataSource.setTestOnBorrow(true);
        dataSource.setMaxActive(5);
        dataSource.setMinIdle(2);
        dataSource.setUrl(p.getDatabaseConnectionUrl());
        if (p.getJdbcUsername()) {
            dataSource.setUsername(p.getJdbcUsername());
        }
        if (p.getJdbcPassword()) {
            dataSource.setPassword(p.getJdbcPassword());
        }
        if (p.getJdbcDriver().equals("net.sourceforge.jtds.jdbc.Driver")) {
            HttpServletRequest request = WebUtils.retrieveGrailsWebRequest().getCurrentRequest();
            Principal principal = request.getSession().getAttribute("SPNEGO-PRINCIPAL");
            if (principal == null) {
               principal = request.getUserPrincipal();
            }

            if (principal instanceof SpnegoPrincipal) {
                GSSCredential credential = ((SpnegoPrincipal)principal).getDelegatedCredential();
                if (credential != null) {
                    return jTDSDriverManager.getConnection(p.getDatabaseConnectionUrl(), credential);
                }
            }

            dataSource.setDriverClassName(p.getJdbcDriver());
//        } else if (javaMelodyDriverExists) {
//            dataSource.setDriverClassName("net.bull.javamelody.JdbcDriver");
//            dataSource.setConnectionProperties("[driver=" + p.getJdbcDriver() + ";]");
        } else {
            dataSource.setDriverClassName(p.getJdbcDriver());
        }

        dataSource.setValidationQuery(DEFAULT_SQL_CONNECTION_VALIDATION_QUERY);
        session.setAttribute("BasicDataSource:" + p.getId(), dataSource);
        return dataSource.getConnection();
    }

    public Project getProject(String projectId) {
        Project p = Project.get(projectId);
        return p;
    }

    protected boolean saveProject(Project p, List<String>usernames, List<String>roles) {

        if(!p.save(flush: true, failOnError: true))
        {
            return false;
        }

        /**
         * Make sure the user creating the project is in the list, or the project will be invisible to them.
         */
        User u = springSecurityService.principal;

        if (!usernames.contains(u.username)) {
            usernames.add(u.username)
            roles.add(Role.findByName("ROLE_ADMIN").id);
        }

        Role role = Role.findByName("ROLE_ADMIN");
        List<UserProjectRole> existingPermissions = UserProjectRole.findAllByProjectAndProcessStepIdIsNull(p);

        if (p.getAuthorities() == null) {
            p.setAuthorities(new ArrayList<UserProjectRole>());
        }

        // Delete existing permissions since they are re-created.
        existingPermissions.each { existing ->
            existing.delete(flush: true);
        }

        int counter = 0;
        usernames.each{ username ->
            UserProjectRole userProjectRole = new UserProjectRole(project: p, role: Role.get(roles.get(counter)), user: User.findByUsername(username), processStepId: null);
            userProjectRole.setId(UUID.randomUUID().toString());
            userProjectRole.save(flush: true, failOnError: true);
            p.getAuthorities().add(userProjectRole);
            counter++;
        }

//        p.save(flush:true, failOnError: true);
        if(!p.save(flush: true, failOnError: true))
        {
            return false;
        }
        return true;
    }

}
