package chartreview

import gov.va.vinci.chartreview.Validator
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import grails.converters.JSON
import grails.converters.XML
import org.apache.commons.lang3.StringUtils
import org.springframework.core.io.ClassPathResource
import javax.validation.ValidationException

import java.sql.Timestamp

class AnnotationSchemaController {
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
        if (session.getAttribute(SELECTED_PROJECT) == null) {
            redirect(action: "chooseProject", params: params)
            return;
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
        if (params.changeName
                        &&  Boolean.parseBoolean(params.changeName)
                        && StringUtils.isBlank(params.newName)) {
            flash.message = "If changing the name, a new name is required.";
            redirect(action: "list")
            return

        }

        String xmlString = f.getInputStream().getText().replaceAll("\n","");

        if(xmlString != null && xmlString.size() > 0)
        {
            Project p = Project.get(session.getAttribute(SELECTED_PROJECT));

            String xsdString = new ClassPathResource("submitSchema.xsd").getFile().newReader().getText()
            AnnotationSchema schema = null;
            boolean changeUUIDS = false;
            try {
                Validator.validate(xmlString, xsdString);

                if (params.changeUUIDS) {
                    changeUUIDS = Boolean.parseBoolean(params.changeUUIDS);
                }

                schema = annotationSchemaService.parseSchemaXml(xmlString, changeUUIDS);
                if (params.changeName &&  Boolean.parseBoolean(params.changeName) ) {
                    schema.name = params.newName;
                }

            } catch (Exception e) {
                flash.message = 'Invalid schema file. (' + e.getMessage() + ')';
                redirect(action: "list")
                return
            }


            // See if name already exists. If so, error.
            if (annotationSchemaService.findByName(p, schema.name)) {
                flash.message = "Schema with name '${schema.name}' already exists.";
                redirect(action: "list")
                return
            }

            try {
                 // Save schema
                AnnotationSchemaRecord record = new AnnotationSchemaRecord(id: schema.id,
                                                        name: schema.name,
                                                        description: schema.description,
                                                        createdDate: new Date(),
                                                        createdBy: springSecurityService.principal.username,
                                                        lastModifiedDate: new Date(),
                                                        lastModifiedBy: springSecurityService.principal.username,
                                                        serializationVersion: "1.0",
                                                        version: new Timestamp(System.currentTimeMillis()) )

                record.serializationData = schema as XML;
                annotationSchemaService.insert(p, record);
            } catch (Exception e) {
                flash.message = "Error uploading schema: ${e}";
                redirect(action: "list")
                return
            }
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
        String xml = params.xml;

        AnnotationSchema schema = annotationSchemaService.parseSchemaXml(xml, false);

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
//        render record.serializationData;
//        return null;
        AnnotationSchema schema = annotationSchemaService.parseSchemaXml(record.serializationData, false);
        if (!schema) {
            throw new ValidationException("Annotation schema ${params.id} not found.");
        }
        List<AnnotationSchema> schemas = new ArrayList<AnnotationSchema>();
        // Sort the principal objects for UI consumption before converting to XML.
        // Overwriting (copy XML.java - all privates) our own converter is another option,
        // which would also prevent the sort meta data from streaming, but it wasn't working right away...
        schemas.add(schema);
        //     println(schemas as XML);
        if ("json" == params.type) {
            render schemas as JSON;
            return;
        } else {
            render schemas as XML;
            return;
        }
    }

}
