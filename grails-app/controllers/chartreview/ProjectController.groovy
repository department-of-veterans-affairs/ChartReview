package chartreview
import com.mysema.query.sql.SQLQuery
import com.mysema.query.sql.SQLQueryFactoryImpl
import com.mysema.query.sql.SQLTemplates
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.db.CreateAndDropAnnotationSchemaRecord
import gov.va.vinci.chartreview.model.*
import gov.va.vinci.chartreview.util.AnnotationTaskCreateDrop
import gov.va.vinci.siman.dao.AnnotationDAO
import gov.va.vinci.siman.model.Annotation
import gov.va.vinci.siman.model.QAnnotation
import gov.va.vinci.siman.model.QClinicalElement
import gov.va.vinci.siman.schema.*
import gov.va.vinci.siman.tools.ConnectionProvider
import gov.va.vinci.siman.tools.SimanUtils
import org.apache.commons.dbutils.QueryRunner
import org.apache.commons.dbutils.ResultSetHandler
import org.apache.commons.dbutils.handlers.ArrayListHandler
import org.springframework.dao.DataIntegrityViolationException

import java.sql.Connection
import java.sql.ResultSet
import java.sql.SQLException

import static gov.va.vinci.chartreview.Utils.closeConnection

class ProjectController {
    def springSecurityService;
    def projectService;
    def processService;
    def clinicalElementService;
    def annotationService;
    def grailsApplication;

    static allowedMethods = [save: "POST", update: "POST"]

    /** Forward to list page. **/
    def index() {
        redirect(action: "list", params: params)
    }

    /**
     * List all Projects. Max is the maximum number to show.
     * @param max
     * @return
     */
    def list(Integer max) {
        User u = springSecurityService.principal;
        Role adminRole = Role.findByName("ROLE_ADMIN");
        List<Project> projects=  new ArrayList<Project>();

        List<UserProjectRole> roleList = UserProjectRole.findAllByUserAndRole(u, adminRole);
        roleList.each { role ->
            if (!role.processStepId) {
                  projects.add(role.project);
            }
        }

        projects.sort { it.name };
        params.max = Math.min(max ?: 10, 100)

        [projectInstanceList: projects, projectInstanceTotal: projects.size()]
    }

    /**
     * Display a single project.
     * @param id  the id of the project to show.
     * @return
     */
    def show(String id) {
        Project projectInstance = Project.get(id)
        projectInstance.refresh();

        if (!projectInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'project.label'), id])
            redirect(action: "list")
            return
        }

        Boolean isValid = null;
        Connection c = null;

        try {
            c = projectService.getDatabaseConnection(projectInstance);
            SimanValidate validate = new SimanValidate(c, null);
            isValid = validate.isValid();
            validate.close();
        } catch (Exception e) {
           e.printStackTrace();
        } finally {
            closeConnection(c);
        }

        [
            projectInstance: projectInstance,
            processes: processService.getProcessNamesForProject(id),
            isValid: isValid,
            projectDocuments: ProjectDocument.findAllByProject(projectInstance),
            selectedTab: params['selectedTab']
        ];
    }

    def updateProcessDetailsTable(String id) {
        render(template: "templates/processesTable", model: [processes: processService.getProcessNamesForProject(id), projectInstance: Project.get(id)]);
    }

    def createSiman(String id) {
        Project projectInstance = Project.get(id)
        if (!projectInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'project.label'), id])
            redirect(action: "list")
            return
        }

        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(projectInstance);
            String defaultSchema = grailsApplication.config.chartReview.defaultSchema;

            SimanCreate create = new SimanCreate(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            create.execute();

            ClinicalElementConfigurationDDL clinicalElementConfigurationDDL = new ClinicalElementConfigurationDDL(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            clinicalElementConfigurationDDL.createTable();

            AnnotationTaskCreateDrop annotationTaskCreate = new AnnotationTaskCreateDrop(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            annotationTaskCreate.executeCreate();

            CreateAndDropAnnotationSchemaRecord schema = new CreateAndDropAnnotationSchemaRecord(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            schema.executeCreate();
        } finally {

            Utils.closeConnection(c);
        }

        redirect(action: "show", id: projectInstance.id);
        return
    }

    def dropSiman(String id) {
        Project projectInstance = Project.get(id)
        if (!projectInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'project.label'), id])
            redirect(action: "list")
            return
        }

        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(projectInstance);
            String defaultSchema = grailsApplication.config.chartReview.defaultSchema;

            SimanDrop drop = new SimanDrop(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            drop.execute();

            AnnotationTaskCreateDrop annotationTaskCreate = new AnnotationTaskCreateDrop(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            annotationTaskCreate.executeDrop();

            ClinicalElementConfigurationDDL clinicalElementConfigurationDDL = new ClinicalElementConfigurationDDL(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            clinicalElementConfigurationDDL.dropTable();

            CreateAndDropAnnotationSchemaRecord schema = new CreateAndDropAnnotationSchemaRecord(c, Utils.getSQLTemplate(projectInstance.jdbcDriver), defaultSchema);
            schema.executeDrop();
        } finally {

            Utils.closeConnection(c);
        }
        redirect(action: "show", id: projectInstance.id);
        return
    }

    /**
     * Create a new project.
     * @return
     */
    def create() {
        [
            administrators: new ArrayList<User>(),
            projectInstance: new Project(params),
            type: 'create',
            submitButton: 'Create'
        ]
    }

    def edit(String id) {
        def projectInstance = Project.get(id)
        if (!projectInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'project.label'), id])
            redirect(action: "list")
            return
        }
        List<User> users = User.findAll().unique();
        String userListStr = "";
        for(int i = 0; i < users.size(); i++)
        {
            def user = users.get(i);
            if(i > 0)
            {
                userListStr += ",";
            }
            userListStr += user.username;
        }
        [
            administrators: userListToUsernames(projectService.projectAdministrators(projectInstance)),
            projectInstance: projectInstance,
            type: 'update',
            submitButton: 'Update',
            userListStr: userListStr,
        ]
    }

    def save() {
        def projectInstance = new Project(params)


        projectInstance = validateAndSetProperties(projectInstance, params);
        projectInstance.id = UUID.randomUUID().toString();

        if (projectInstance.hasErrors() || !projectInstance.save(flush: true, failOnError: true)) {
            render(view: "create", model: [
                                            administrators: params.list('username'),
                                            projectInstance: projectInstance,
                                            type: 'create',
                                            submitButton: 'Create'
                                          ])
            return
        }

        saveProjectUsersAndClinicalElements(projectInstance, params);

        flash.message = message(code: 'default.created.message', args: [message(code: 'project.label'), projectInstance.id])
        redirect(action: "show", id: projectInstance.id)
    }

    def update(String id, Long version) {
        def projectInstance = Project.get(id)
        if (!projectInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'project.label'), id])
            redirect(action: "list")
            return
        }

        if (version != null) {
            if (projectInstance.version > version) {
                projectInstance.errors.rejectValue("version", "default.optimistic.locking.failure",
                          [message(code: 'project.label', default: 'Project')] as Object[],
                          "Another user has updated this Project while you were editing")
                render(view: "edit", model: [projectInstance: projectInstance, administrators: params.list('username'),
                                             type: 'update',
                                             submitButton: 'Update'])
                return
            }
        }

        projectInstance.properties = params

        projectInstance = validateAndSetProperties(projectInstance, params);

        if (projectInstance.hasErrors() || !projectInstance.save(flush: true)) {
            render(view: "edit", model: [
                                            administrators: params.list('username'),
                                            projectInstance: projectInstance,
                                            type: 'update',
                                            submitButton: 'Update'
                                        ])
            return
        }

        saveProjectUsersAndClinicalElements(projectInstance, params);

        flash.message = message(code: 'default.updated.message', args: [message(code: 'project.label'), projectInstance.name])
        redirect(action: "show", id: projectInstance.id)
    }

    def runSql(String id) {
        Project projectInstance = Project.get(id)

        render (view: "runSql", model: [project: projectInstance]);
    }

    def ajaxSql() {
        Project p =  Project.get(params.id);
        String sql = params.sql;

        Connection c = null;
        ResultSetHandler handler = new ArrayListHandler();
        List<Object[]> results = null;
        try {
            c = projectService.getDatabaseConnection(p);
            QueryRunner run = new QueryRunner();
            results = run.query(c, sql, handler);

            results.each { row ->

            }
        } catch (SQLException e) {
            render ("<div class=\"alert alert-block\">\n" +
                    "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" +
                    "<h4>Error</h4>" + e + "</div>");
            return;
        } finally {
            closeConnection(c);
        }

        render (template: "templates/sqlResults", model: [rows: results]);

    }

    def delete(String id) {
        Project projectInstance = Project.get(id)

        if (!projectInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'project.label'), projectInstance.name])
            redirect(action: "list")
            return
        }

        try {
            projectInstance.authorities.each() {
                it.delete();
            }
            projectInstance.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'project.label'), projectInstance.name])
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'project.label'), projectInstance.name])
            redirect(action: "show", id: id)
        }
    }

    def uploadDocument() {
        Project p = Project.get(params['projectId']);
        User u = springSecurityService.principal;
        ProjectDocument fileInstance = new ProjectDocument(id: UUID.randomUUID().toString());
        def uploadedFile = request.getFile('fileUpload')
        fileInstance.content = uploadedFile.getBytes();
        fileInstance.name = params['name'];
        fileInstance.description = params['description'];
        fileInstance.mimeType = uploadedFile.contentType;
        fileInstance.project = p;
        fileInstance.uploadedBy = u;
        fileInstance.save(flush: true, failOnError: true);
        redirect(action: "show", params: [id: p.id, selectedTab: 'projectDocuments']);
        return null;
    }

    def updateAnnotationTask(String id) {
        Project p = projectService.getProject(id);
        SQLTemplates sqlTemplate = Utils.getSQLTemplate(p.jdbcDriver);
        Connection connection = null;
        QAnnotation qAnnotation = new QAnnotation("a", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION");
        QClinicalElement qClinicalElement = new QClinicalElement("ce", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT");
        QAnnotationTask  qAnnotationTask = new QAnnotationTask("t", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION_TASK");

        try {
        connection = projectService.getDatabaseConnection(p);

        // Get all started or completed tasks for a project?
        // Then look at the annotations for each task?

        // Step 1, get all of the annotation guids and the clinical element serialized id's.
        // Annotation join clinical_element where annotation not in annotation_task.
        SQLQuery query = new SQLQueryFactoryImpl(sqlTemplate, new ConnectionProvider(connection)).query();
        query.from(qClinicalElement, qAnnotation, qAnnotationTask).where(qAnnotation.clinicalElementGuid.eq(qClinicalElement.guid));

        def results = query.list(qAnnotation.guid, qClinicalElement.serializedKeys);
        for (com.mysema.query.Tuple t: results) {
            println(t.get(qAnnotation.guid) + "  :::   " + t.get(qClinicalElement.serializedKeys));
        }

        // Step 2, determine which tasks this could have gone with.
        // Look at all activiti tasks for this project
        // go through each task and see which clinical elements can be associated with it.
        // Match up task / user / annotations.

        // Step 3, insert annotation_task records.
        } finally {
            closeConnection(connection);
        }


        flash.message = message(code: 'annotation.task.updated', default: "TODO: NOT IMPLEMENTED.")
        redirect(action: "show", id: p.id)
    }

    def upgradeAnnotationText(String id) {

        Project p = projectService.getProject(id);
        SQLTemplates sqlTemplate = Utils.getSQLTemplate(p.jdbcDriver);
        Connection c = null;
        response.writer.write("<html><body>");
        try {
            /** Modify the table. **/
            c = projectService.getDatabaseConnection(p);
            String clinicalElementSelect = "";
            String alterTableStatement = "";
            if (p.getJdbcDriver().contains("mysql")) {
                alterTableStatement = "alter table annotation add covered_text text;";
                clinicalElementSelect = "select serialized_keys, project_id, clinical_element_group, clinical_element_configuration_id, guid from clinical_element";

            } else if (p.getJdbcDriver().contains("microsoft")) {
                alterTableStatement = "alter table [Dflt].[annotation] add [covered_text] text;";
                clinicalElementSelect ="select serialized_keys, project_id, clinical_element_group, clinical_element_configuration_id, guid  from [clinical_element]";
            }

            try {
                c.prepareStatement(alterTableStatement).execute();
            } catch (Exception e) {
                response.writer.write("<strong>Error adding covered_text to annotation table. Assuming it already exists and continuing....</strong><br/><br/>");
                response.writer.flush();
            }

            /** Find all clinical elements. **/
            ResultSet rs = c.createStatement().executeQuery(clinicalElementSelect);


            AnnotationDAO annotationDAO = new AnnotationDAO(c, sqlTemplate);

            /** Update all existing clinical elements. **/
            while (rs.next()) {
                String serializedKey =  rs.getString(1);
                if (serializedKey.endsWith(";")) {
                    serializedKey = serializedKey.substring(0, serializedKey.length() - 1);
                }
                String projectId = rs.getString(2);
                String clinical_element_group = rs.getString(3);
                String clinical_element_configuration_id = rs.getString(4);

                Map<String, String> serializedKeyMap = new HashMap<String, String>();

                serializedKeyMap.put("projectId", projectId);
                serializedKeyMap.put("clinicalElementGroup", clinical_element_group);
                serializedKeyMap.put("clinicalElementConfigurationId", clinical_element_configuration_id);
                String fullKey = SimanUtils.serializeMapToString(serializedKeyMap, ";") + serializedKey;

                Map<String, Object> ce = clinicalElementService.getClinicalElementBySerializedKeyFromConnection(c, sqlTemplate, fullKey, false);

                String content =SimanUtils.removeHtmlTags(clinicalElementService.getElementContent(c, sqlTemplate, fullKey, false, false));
                response.writer.write("Updating clinical element key: ${serializedKey} for clinical element configuration: ${clinical_element_configuration_id} and group ${clinical_element_group}<br/>\n");
                response.flushBuffer();

                List<Annotation> annotations = annotationDAO.getByClinicalElementGuid(rs.getString("guid"));
                for (Annotation a: annotations) {
                    String coveredText = annotationService.getCoveredText(a, content);
                    a.setCoveredText(coveredText);
                    annotationDAO.updateAnnotation(a);
                }
            }
        } finally {
            closeConnection(c);
        }
        response.writer.write("<br/><br/><strong>Update complete.</strong>");
        response.writer.write("</body></html>");
        return null;
    }


    protected void saveProjectUsersAndClinicalElements(Project p, def params) {

        List<String> usernames = new ArrayList<String>(params.list('username'));
        List<String> roles = new ArrayList<String>(params.list('role'));

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

        p.save(flush:true, failOnError: true);

    }

    protected List<String> userListToUsernames(List<User> users) {
        List<String> usernames = new ArrayList<String>();
        users.sort{it.username}.each{
            usernames.add(it.username);
        }
        return usernames;
    }

    protected Project validateAndSetProperties(Project project, def params) {

        if (!project.name) {
            project.errors.rejectValue("name", "default.required", ["Name"] as Object[], "Name is required.")
        }
        if (!project.description) {
            project.errors.rejectValue("description", "default.required", ["Description"] as Object[], "Description is required.")
        }
        if (!project.databaseConnectionUrl) {
            project.errors.rejectValue("databaseConnectionUrl", "default.required", ["Database Connection Url"] as Object[], "Database Connection Url is required." )
        }
        if (params.jdbcPassword != params.confirmJdbcPassword) {
            project.errors.rejectValue("jdbcPassword", "default.notmatched", ["password", "confirm password"] as Object[], "Password and confirm password do not match.");
        }

        List<String> usernames = params.list('username');

        usernames.each { username ->
            if (!User.findByUsername(username)) {
                project.errors.reject("username.not.found", "User [${username}] is not a valid user.".toString());
//                result = false;
            }
        }
        return project;
    }

}
