package chartreview

import gov.va.vinci.chartreview.Validator
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import grails.converters.XML
import org.springframework.core.io.ClassPathResource

import java.sql.Timestamp

class AnnotationSchemaController {
    def schemaService;
    def projectService;
    def springSecurityService;
    def annotationSchemaService;

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

        List<AnnotationSchemaRecord> records =  annotationSchemaService.getAll(p);
        render (view: "list", model: [model: records, total: records.size()]);
    }

    def delete() {
        annotationSchemaService.delete(Project.get(params.projectId), params.id);
        redirect(action: "list", params: params)
    }

    def copy() {
        Project p = Project.get(params.projectId);
        annotationSchemaService.copy(p, annotationSchemaService.get(p, params.id), params.newName, springSecurityService.principal.username);
        redirect(action: "list");
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

    def export() {
        Project p = Project.get(params.projectId);
        response.setContentType( 'text/xml');
        response.writer.write(annotationSchemaService.get(p, params.id).serializationData);
        response.flushBuffer();
        return null;
    }

    def upload() {
        def f = request.getFile('myFile')
        if (f.empty) {
            flash.message = 'File cannot be empty'
            redirect(action: "list")
            return
        }
        String xmlString = f.getInputStream().getText().replaceAll("\n","");

        String annotationSchemaId = '';
        if(xmlString != null && xmlString.size() > 0)
        {
            String xsdString = new ClassPathResource("submitSchema.xsd").getFile().newReader().getText()
            AnnotationSchema schema = null;
            try {
                Validator.validate(xmlString, xsdString);
                boolean changeUUIDS = false;
                if (params.changeUUIDS) {
                    changeUUIDS = Boolean.parseBoolean(params.changeUUIDS);
                }
                schema = annotationSchemaService.parseSchemaXml(xmlString, changeUUIDS);
            } catch (Exception e) {
                flash.message = 'Invalid schema file. (' + e.getMessage() + ')';
                redirect(action: "list")
                return
            }

            // See if name already exists. If so, error.


            // If not changing guids, see if guid already exists. If so, error.

            // Do save!

        } else {
            flash.message = 'Empty file submitted, please upload a valid xml file.';
            redirect(action: "list")
            return
        }

        redirect(action: "list")
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
        AnnotationSchema schema = schemaService.parseSchemaXml(params.xml, false);

        Project  p = Project.get(session.getAttribute(SELECTED_PROJECT));
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
            record.serializationData = params.xml;
            record.version = new Timestamp(new Date().getTime());
            annotationSchemaService.insert(p, record);
        } else if ("Edit" == params.mode) {
            AnnotationSchemaRecord record = annotationSchemaService.get(p, schema.id);
            if (!record) {
                throw new RuntimeException("Could not find annotation schema record for id: " + schema.id);
            }
            record.name = schema.name;
            record.description = schema.description;
            record.lastModifiedDate = record.createdDate;
            record.lastModifiedBy = springSecurityService.principal.username;
            record.serializationVersion = "1.0";
            record.serializationData = params.xml;
            record.version = new Timestamp(new Date().getTime());
            annotationSchemaService.update(p, record);
        } else {
            throw new RuntimeException("Unknown mode: ${params.mode}.");
        }

        redirect(action: "list");
    }

    /**
     * Get the schema record xml
     * @param id  the id of the schema to get.
     * @return  the annotation schema.
     */
    def getSchema(String id, String projectId) {
        AnnotationSchemaRecord record = annotationSchemaService.get(Project.get(params.projectId), id);
        render record.serializationData;
        return null;
    }

}
