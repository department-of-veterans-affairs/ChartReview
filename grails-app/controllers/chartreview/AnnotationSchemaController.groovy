package chartreview

import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecordDAO
import org.apache.commons.dbutils.DbUtils

import java.sql.Connection
import java.sql.Timestamp

class AnnotationSchemaController {
    def schemaService;
    def projectService;
    def springSecurityService;
    public static String SELECTED_PROJECT = "selectedProject";

    /** Forward to list page. **/
    def index() {
        if (session.getAttribute(SELECTED_PROJECT)) {
            redirect(action: "list", params: params)
        } else {
            redirect(action: "chooseProject", params: params)
        }

    }

    def chooseProject() {
        render(view: "chooseProject", model: [projects: projectService.projectsUserIsAssignedTo(springSecurityService.authentication.principal.username)])
    }

    /**
     * List all schemas. Max is the maximum number to show.
     * @param max
     * @return
     */
    def list(Integer max) {
        if (params.projectId) {
            session.setAttribute(SELECTED_PROJECT, params.projectId);
        }

        Project p = Project.get(session.getAttribute(SELECTED_PROJECT));
        session.setAttribute("projectName", p.getName());
        if (!session.getAttribute(SELECTED_PROJECT)) {
            redirect(action: "chooseProject", params: params)
            return;
        }

        params.max = Math.min(max ?: 10, 100)
        if (!params.sort) {
            params.sort= "name";
        }


        Connection c = null;

        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            List<AnnotationSchemaRecord> records = dao.getAll();
            render (view: "list", model: [model: records, total: records.size()]);
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    def view() {
        if (!session.getAttribute(SELECTED_PROJECT)) {
            redirect(action: "chooseProject", params: params)
            return;
        }

        render (view: "create", model: [mode: "View", id: params.id]);
    }

    def create() {
        if (!session.getAttribute(SELECTED_PROJECT)) {
            redirect(action: "chooseProject", params: params)
            return;
        }

        [mode: "Create"]
    }

    def edit() {
        if (!session.getAttribute(SELECTED_PROJECT)) {
            redirect(action: "chooseProject", params: params)
            return;
        }

        render (view: "create", model: [mode: "Edit", id: params.id]);
    }

    def save() {
        if (!session.getAttribute(SELECTED_PROJECT)) {
            redirect(action: "chooseProject", params: params)
            return;
        }

        def xml = params.xml;
        println(params);

        AnnotationSchema schema = schemaService.parseSchemaXml(xml, false);

        Connection c = null;

        try {
            Project  p = Project.get(session.getAttribute(SELECTED_PROJECT));
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));

            if ("Create" == params.mode) {
                AnnotationSchemaRecord record = new AnnotationSchemaRecord();
                record.id = schema.id;
                record.name = schema.name;
                record.description = schema.description;
                record.createdDate = new Date();
                record.createdBy = springSecurityService.principal.username;
                record.lastModifiedDate = record.createdDate;
                record.lastModifiedBy = springSecurityService.principal.username;
                record.serializationVersion = "1.0";
                record.serializationData = xml;
                record.version = new Timestamp(new Date().getTime());
                dao.insert(record);
            } else if ("Edit" == params.mode) {
                AnnotationSchemaRecord record = dao.get(schema.id);
                if (!record) {
                    throw new RuntimeException("Could not find annotation schema record for id: " + schema.id);
                }
                record.name = schema.name;
                record.description = schema.description;
                record.lastModifiedDate = record.createdDate;
                record.lastModifiedBy = springSecurityService.principal.username;
                record.serializationVersion = "1.0";
                record.serializationData = xml;
                record.version = new Timestamp(new Date().getTime());
                dao.update(record);
            } else {
                throw new RuntimeException("Un-known mode: ${params.mode}.");
            }
        } catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        } finally {
            DbUtils.close(c);
        }
        redirect(action: "list");
    }

    /**
     * Get the schema record xml
     * @param id  the id of the schema to get.
     * @return  the annotation schema.
     */
    def getSchema(String id, String projectId) {
        Connection c = null;

        try {
            Project p = Project.get(params.projectId);
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            AnnotationSchemaRecord record = dao.get(id);
            render record.serializationData;
            return null;
        } finally {
            DbUtils.close(c);
        }

    }


}
