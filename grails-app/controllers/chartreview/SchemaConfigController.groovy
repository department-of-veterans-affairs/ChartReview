package chartreview

import gov.va.vinci.chartreview.CreateAnnotationSchemaModel
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import org.springframework.dao.DataIntegrityViolationException

class SchemaConfigController {
//    static scaffold = AnnotationSchema;

    def schemaService;

    def getSchemaOptions(){
        def annotationSchemas = AnnotationSchema.findAll(sort:'name', order: 'asc');
        List<Object> schemaOptions = new ArrayList<Object>();
        for(AnnotationSchema schema in annotationSchemas)
        {
            def found = false;
            for(Object obj in schemaOptions)
            {
                if(obj.value == schema.getId())
                {
                    found = true;
                    continue;
                }
            }
            if(found == false)
            {
                // Put the first one with a given name in.
                schemaOptions.add([name:schema.getName(), value:schema.getId()]);
            }
        }
        return schemaOptions;
    }

/**
 * The webflow for creating a new schema.
 */
    def createAnnotationSchemaFlow = {
        init {
            action {
                if (!flow.name) {
                    CreateAnnotationSchemaModel model = new CreateAnnotationSchemaModel();
                    model.name = "";
                    model.description = "";
                    flow.model = model;
                }
                step1()
            }
            on("step1").to "step1"
            on("cancel").to "cancel"
        }
        step1 {
            on("finish"){
                String validationErrors = null;
                CreateAnnotationSchemaModel returnedModel = null;
                (validationErrors, returnedModel) = processStep2Params(flow.model, params);
                flow.model = returnedModel;
                if (validationErrors) {
                    flash.message = validationErrors;
                    return step1();
                }
                AnnotationSchema annotationSchema = new AnnotationSchema();
                annotationSchema.id = UUID.randomUUID().toString();
                annotationSchema.name = flow.model.name;
                annotationSchema.description = flow.model.description;
                annotationSchema.save();
            }.to "finish"
        }
        finish {
            // Done, no action. You do need a finish.gsp though, even though it will never be shown.
            redirect(controller: "schemaConfig", action:'list')
        }
        cancel {
            redirect(controller: "schemaConfig", action:'list')
        }
    }

    def show(String id) {
        // To implement.
    }

    def edit(String id) {
        def annotationSchema = gov.va.vinci.chartreview.model.schema.AnnotationSchema.get(id)
        if (!annotationSchema) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }

        [annotationSchema: annotationSchema]
    }

    def update(String id, Long version) {
        def annotationSchema = AnnotationSchema.get(id)
        if (!annotationSchema) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }

        if (version != null) {
            if (annotationSchema.version > version) {
                annotationSchema.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "edit", model: [annotationSchema: annotationSchema])
                return
            }
        }

        annotationSchema.properties = params

        if (!validate(params, annotationSchema) || !annotationSchema.save(flush: true)) {
            render(view: "edit", model: [annotationSchema: annotationSchema])
            return
        }

        flash.message = message(code: 'default.updated.message', args: [message(code: 'schema.label'), annotationSchema.name])
        redirect(action: "show", id: annotationSchema.id)
    }

    def delete(String id) {
        def annotationSchema = AnnotationSchema.get(id)

        if (!annotationSchema) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }

        def name = annotationSchema.name;
        try {
            annotationSchema.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'schema.label'), name])
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'schema.label'), name])
            redirect(action: "show", id: id)
        }
    }

    protected boolean validate(def params, AnnotationSchema annotationSchema) {
        boolean result = true;

        return result;
    }

    protected processStep2Params(CreateAnnotationSchemaModel model, def params) {
        List<String> validationErrors = new ArrayList<String>();
        model.name = params.name;
        model.description = params.description;
        String validationErrorString = "";
        validationErrors.sort{}.each {
            validationErrorString += "<p>${it}</p>";
        }
        return [validationErrorString, model];
    }


    protected String validateMaxLength(String string, int maxLength, String fieldName) {
        if (string.length() > maxLength) {
            return("${fieldName} cannot be greater than ${maxLength} characters.")
        }
    }
}