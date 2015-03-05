package chartreview

import gov.va.vinci.chartreview.Validator
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.*
import grails.converters.JSON
import grails.converters.XML
import grails.plugin.gson.converters.GSON
import org.restapidoc.annotation.RestApi
import org.restapidoc.annotation.RestApiMethod
import org.restapidoc.annotation.RestApiParam
import org.restapidoc.annotation.RestApiParams
import org.restapidoc.pojo.RestApiParamType
import org.restapidoc.pojo.RestApiVerb
import org.springframework.core.io.ClassPathResource
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.MediaType

import javax.validation.ValidationException

@Deprecated
@RestApi(name = "Schema services", description = "Methods for managing annotation schemas")
class SchemaController {
//    static scaffold = AnnotationSchema;

    def schemaService;
    def projectService;

    /** Forward to list page. **/
    def index() {
        redirect(action: "list", params: params)
    }

    /**
     * List all schemas. Max is the maximum number to show.
     * @param max
     * @return
     */
    def list(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        if (!params.sort) {
            params.sort= "name";
        }
        [model: AnnotationSchema.list(params), total: AnnotationSchema.count()]
    }

    /**
     * Return the annotationSchema whose id is given.
     * @id - Id of the requested annotationSchema
     * @param xmlToSave
     * @return
     * Example xml:
     *
     <?xml version="1.0" encoding="UTF-8"?>
     <annotationSchemas>
     <annotationSchema id="536184b3-56ec-4556-85e8-108853fb3a8d">
     <id>536184b3-56ec-4556-85e8-108853fb3a8d</id>
     <attributeDefs>
     <attributeDef id="3aaf778a-352d-4647-b18b-f1680415e40e" type="0">
     <name>contextLeft</name>
     <color>ededed</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs/>
     </attributeDef>
     <attributeDef id="66bbb465-318f-4bce-8b03-0e2da1a4c7cf" type="0">
     <name>semanticCategories</name>
     <color>ededed</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs/>
     </attributeDef>
     <attributeDef id="2d1724ba-38dd-4498-a9d3-91a5b926969f" type="3">
     <name>Explanability</name>
     <color>8a8aff</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs>
     <attributeDefOptionDef id="3c039258-f899-45a6-b282-f390688ff42d">Unexplained</attributeDefOptionDef>
     <attributeDefOptionDef id="5fa39282-09fe-4332-8eef-2240ea8e92a0">Diagnosed as functional/unknown</attributeDefOptionDef>
     <attributeDefOptionDef id="b950056c-23b0-466e-9554-c2ebae47a770">Inconsistent with unexplained</attributeDefOptionDef>
     </attributeDefOptionDefs>
     </attributeDef>
     <attributeDef id="d54791fb-c255-4469-94bc-1d5751364ee3" type="0">
     <name>cuis</name>
     <color>ededed</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs/>
     </attributeDef>
     <attributeDef id="e699b872-b3fa-49d0-99db-e0a7602e6ce2" type="0">
     <name>contextRight</name>
     <color>ededed</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs/>
     </attributeDef>
     <attributeDef id="2e43cb92-6a5f-4f8d-afe8-140800c99f02" type="3">
     <name>Persistence</name>
     <color>ffff61</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs>
     <attributeDefOptionDef id="258b747e-83db-47b1-a590-c551be96f4a8">False</attributeDefOptionDef>
     <attributeDefOptionDef id="af4fdf7e-2dfc-44ae-a752-45a261ca542a">True</attributeDefOptionDef>
     </attributeDefOptionDefs>
     </attributeDef>
     <attributeDef id="103fea12-cf80-4d3a-8695-8dcf1a78a2d2" type="0">
     <name>organSystem</name>
     <color>ededed</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs/>
     </attributeDef>
     <attributeDef id="10ed1391-fbc5-476b-bce3-84692d5df18c" type="0">
     <name>Comments</name>
     <color>ededed</color>
     <numericLow>0.0</numericLow>
     <numericHigh>9.99999999999999E11</numericHigh>
     <minDate>0000-01-01 00:00:00</minDate>
     <maxDate>9999-01-01 00:00:00</maxDate>
     <attributeDefOptionDefs/>
     </attributeDef>
     </attributeDefs>
     <classDefs>
     <classDef id="6bb75b36-a78c-491a-a206-b65826b509ae">
     <name>Temporality</name>
     <color>b2b300</color>
     <attributeDefIds/>
     <classDefIds/>
     </classDef>
     <classDef id="70a9e11e-96dd-496f-8dbc-86456a711fb4">
     <name>Symptom</name>
     <color>999999</color>
     <attributeDefIds>
     <attributeDefId id="103fea12-cf80-4d3a-8695-8dcf1a78a2d2"/>
     <attributeDefId id="10ed1391-fbc5-476b-bce3-84692d5df18c"/>
     <attributeDefId id="2d1724ba-38dd-4498-a9d3-91a5b926969f"/>
     <attributeDefId id="2e43cb92-6a5f-4f8d-afe8-140800c99f02"/>
     <attributeDefId id="3aaf778a-352d-4647-b18b-f1680415e40e"/>
     <attributeDefId id="66bbb465-318f-4bce-8b03-0e2da1a4c7cf"/>
     <attributeDefId id="d54791fb-c255-4469-94bc-1d5751364ee3"/>
     <attributeDefId id="e699b872-b3fa-49d0-99db-e0a7602e6ce2"/>
     </attributeDefIds>
     <classDefIds/>
     </classDef>
     <classDef id="8504bb11-a6d5-492d-8bce-ae4f8131a80c">
     <name>Chronic Fatigue Syndrome</name>
     <color>00ffff</color>
     <attributeDefIds>
     <attributeDefId id="2d1724ba-38dd-4498-a9d3-91a5b926969f"/>
     <attributeDefId id="2e43cb92-6a5f-4f8d-afe8-140800c99f02"/>
     </attributeDefIds>
     <classDefIds/>
     </classDef>
     <classDef id="a25d77a0-6119-4c1c-ba52-09f07c12753f">
     <name>Fibromyalgia</name>
     <color>79c41c</color>
     <attributeDefIds>
     <attributeDefId id="2d1724ba-38dd-4498-a9d3-91a5b926969f"/>
     <attributeDefId id="2e43cb92-6a5f-4f8d-afe8-140800c99f02"/>
     </attributeDefIds>
     <classDefIds/>
     </classDef>
     <classDef id="02233d40-b863-43c2-97ac-d760a4d45e26">
     <name>Evidence of Persistence</name>
     <color>ffff33</color>
     <attributeDefIds/>
     <classDefIds>
     <classDefId id="6bb75b36-a78c-491a-a206-b65826b509ae"/>
     </classDefIds>
     </classDef>
     <classDef id="4bd4a223-810b-48b3-b5f4-0f49e1573fb6">
     <name>Irritable Bowel Syndrome</name>
     <color>ff00fb</color>
     <attributeDefIds>
     <attributeDefId id="2d1724ba-38dd-4498-a9d3-91a5b926969f"/>
     <attributeDefId id="2e43cb92-6a5f-4f8d-afe8-140800c99f02"/>
     </attributeDefIds>
     <classDefIds/>
     </classDef>
     <classDef id="4f9066c0-81ec-4eac-9acd-bbec98eb5884">
     <name>Evidence of Explainability</name>
     <color>8080ff</color>
     <attributeDefIds/>
     <classDefIds/>
     </classDef>
     </classDefs>
     <classRelDefs>
     <classRelDef id="5acc866a-be68-4527-899e-39e5822d9480">
     <name>Persistence to Explainability_copy</name>
     <color>00eaff</color>
     <type>0</type>
     <attributeDefIds>
     <attributeDefId id="10ed1391-fbc5-476b-bce3-84692d5df18c"/>
     </attributeDefIds>
     <leftClassDefIds>
     <classDefId id="02233d40-b863-43c2-97ac-d760a4d45e26"/>
     </leftClassDefIds>
     <rightClassDefIds>
     <classDefId id="02233d40-b863-43c2-97ac-d760a4d45e26"/>
     </rightClassDefIds>
     </classRelDef>
     <classRelDef id="fd651154-d9a4-43d6-806c-ab3aa089c669">
     <name>Persistence to Explainability</name>
     <color>00eaff</color>
     <type>0</type>
     <attributeDefIds>
     <attributeDefId id="10ed1391-fbc5-476b-bce3-84692d5df18c"/>
     </attributeDefIds>
     <leftClassDefIds>
     <classDefId id="02233d40-b863-43c2-97ac-d760a4d45e26"/>
     </leftClassDefIds>
     <rightClassDefIds>
     <classDefId id="02233d40-b863-43c2-97ac-d760a4d45e26"/>
     </rightClassDefIds>
     </classRelDef>
     </classRelDefs>
     <description/>
     <name>MUS1</name>
     <type>0</type>
     </annotationSchema>
     </annotationSchemas>
     *
     */
    def getSchema = {
        if (!params.id)
        {
            throw new ValidationException("Required parameters: (annotationSchema) id");
        }

    //    println("Getting schema: ${params.id}")
        AnnotationSchema schema = schemaService.getSchema(params.id);

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

    @RestApiMethod( description="Get the UIMA Type Descriptor XML representation of an annotation schema",
            path="/schema/uimaTypeSystem",
            produces= MediaType.TEXT_XML_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="id", type="string", paramType = RestApiParamType.QUERY, description = "The annotation schema id"),
            @RestApiParam(name="projectId", type="string", paramType = RestApiParamType.QUERY, description = "The project id. This is used to located the project and get the package name for the project. ")
    ])
    /**
     * For a schema id, return the UIMA type system xml for that schema.
     * @param id the schema id to generate the type system for.
     *
     */
    def uimaTypeSystem() {
        AnnotationSchema schema = AnnotationSchema.get(params.id);
        if (!schema) {
            throw new ValidationException("Annotation schema ${id} not found.");
        }
        if (!params.projectId) {
            throw new ValidationException("projectId parameter is required.");
        }
        Project p = projectService.getProject(params.projectId);

        if (!p) {
            throw new ValidationException("Could not find project for projectId: ${p.projectId}");
        }
        String xml = schemaService.schemaToUimaTypeDescriptor(schema, "chartreview.${p.getTypeSystemPackageName()}");

        render(contentType: "text/xml", text: xml, encoding: "UTF-8");

        return null;
    }

    /**
     * Uploads a schema xml file, parses it into objects, and then writes them to the database.
     */
    def upload = {
        try
        {
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
                Validator.validate(xmlString, xsdString)
                def annotationSchema = schemaService.saveSchema(xmlString)
                if(annotationSchema != null)
                {
                    annotationSchemaId = annotationSchema.getId();
                }
                else
                {
                    flash.message = 'Duplicate schema name';
                    redirect(action: "list")
                    return
                }
            }
            redirect(action: "list")
        }
        catch(Exception e)
        {
            flash.message = 'Invalid schema: ' + e.toString();
            redirect(action: "list")
        }
    }

    def create() {
        def schemaInstance = new AnnotationSchema();
        schemaInstance.id = UUID.randomUUID().toString();
        if (!schemaInstance.save(flush:true, failOnError: true)) {
            redirect(action: "list")
            return
        }
        flash.message = message(code: 'default.created.message', args: [message(code: 'schema.label'), schemaInstance.name])
        redirect(action: "edit", id: schemaInstance.id, params:[currentTab:'configuration'])
    }

    def startEdit(String id) {
        def schemaInstance = AnnotationSchema.get(id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }
        redirect(action: "edit", id: schemaInstance.id, params:[currentTab:'configuration'])
    }

    def edit(String id, String currentTab) {
        def schemaInstance = AnnotationSchema.get(id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }
        [
                schemaInstance: schemaInstance,
                attributeDefs: schemaInstance.doGetAttributeDefsSorted(),
                classDefs: schemaInstance.doGetClassDefsSorted(),
                classRelDefs: schemaInstance.doGetClassRelDefsSorted(),
                currentTab: currentTab,
                type: 'update',
                submitButton: 'Update'
        ]
    }

    def update(String id, Long version) {
        def schemaInstance = AnnotationSchema.get(id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }
        if (version != null) {
            if (schemaInstance.version > version) {
                schemaInstance.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "edit", model: [schemaInstance: schemaInstance, administrators: params.list('username'),
                                             type: 'update',
                                             submitButton: 'Update'])
                return
            }
        }
        doUpdate(schemaInstance);
        redirect(action: "edit", id: schemaInstance.id, params:[currentTab:params.currentTab])
    }

    def doUpdate(AnnotationSchema schemaInstance) {
        schemaInstance.properties = params
        def attributeDefsRowOrderStr = params.attributeDefsRowOrder;
        if(attributeDefsRowOrderStr && attributeDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(attributeDefsRowOrderStr);
            schemaInstance.sortAttributeDefsByIdToOrderMap(idToOrder);
        }
        def classDefsRowOrderStr = params.classDefsRowOrder;
        if(classDefsRowOrderStr && classDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(classDefsRowOrderStr);
            schemaInstance.sortClassDefsByIdToOrderMap(idToOrder);
        }
        def classRelDefsRowOrderStr = params.classRelDefsRowOrder;
        if(classRelDefsRowOrderStr && classRelDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(classRelDefsRowOrderStr);
            schemaInstance.sortClassRelDefsByIdToOrderMap(idToOrder);
        }

        try{
            boolean validated = validateAndSetProperties(schemaInstance, params);
            schemaService.updateAnnotationSchemaSortOrders(schemaInstance, false);
            if (!validated || !schemaInstance.save(flush: true, failOnError: true)) {
                render(view: "edit", model: [
                        schemaInstance: schemaInstance,
                        attributeDefs : schemaInstance.getAttributeDefs(),
                        classDefs     : schemaInstance.getClassDefs(),
                        classRelDefs  : schemaInstance.getClassRelDefs(),
                        type          : 'update',
                        submitButton  : 'Update'
                ])
                return
            }

            saveSchemaAttributesClassesAndClassRels(schemaInstance, params);

            flash.message = message(code: 'default.updated.message', args: [message(code: 'schema.label'), schemaInstance.name])
        }
        catch(Exception e)
        {
            flash.message = message(code: 'default.not.updated.message', args: [message(code: 'schema.label'), schemaInstance.name]) + ":"+e.toString()
        }
    }

    def rowOrderStringToMap(String input)
    {
        Map<String, String> map = new HashMap<String, String>();
        String[] array = input.split(",");
        for (String str : array) {
            String[] pair = str.split("=");
            map.put(pair[0], pair[1]);
        }
        return map;
    }
    def delete(String id) {
        AnnotationSchema schemaInstance = AnnotationSchema.get(id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }
        try {
            schemaInstance.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'schema.label'), schemaInstance.name])
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'schema.label'), schemaInstance.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:params.currentTab])
        }
    }

    def copy(String id, String newName) {

        def annotationSchema = AnnotationSchema.get(id)

        if (!annotationSchema) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }

        String name = newName;
        def annotationSchemaByName = AnnotationSchema.findByName(newName);

        if (annotationSchemaByName) {
            name = name  + " " + UUID.randomUUID().toString();
        }

        try {
            AnnotationSchema objCopy = new AnnotationSchema(annotationSchema, false);
            objCopy.setName(name)
            objCopy.save(flush: true);
            flash.message = message(code: 'default.copied.message', args: [message(code: 'schema.label'), name])
            if (annotationSchemaByName) {
                flash.message = flash.message + "<br/>Schema name already in use. Unique identifier added to the end of the name.";
            }
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.copied.message', args: [message(code: 'schema.label'), name])
            redirect(action: "list", id: id)
        }
    }

    def export(String id) {
        def annotationSchema = AnnotationSchema.get(id)

        if (!annotationSchema) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }

//        def annotationSchemaCopy = new AnnotationSchema(annotationSchema, false);
//        annotationSchemaCopy.clearSorts();
        def annotationSchemaCopy = annotationSchema;

        def name = annotationSchemaCopy.name;
        try {
            List<AnnotationSchema> schemas = new ArrayList<AnnotationSchema>();
            schemas.add(annotationSchemaCopy);
            render schemas as XML;
        }
        catch (Exception e) {
            flash.message = message(code: 'default.not.exported.message', args: [message(code: 'schema.label'), name]) + e.toString()
            redirect(action: "list", id: id)
        }
    }

    def editSchemaSchemaList(String id, Long version) {
        def schemaInstance = AnnotationSchema.get(id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), id])
            redirect(action: "list")
            return
        }
        doUpdate(schemaInstance);
        redirect(action: "list")
    }

    protected boolean validateAndSetProperties(AnnotationSchema schema, def params) {
        boolean result = true;

        if (!schema.name) {
            schema.errors.rejectValue("name", "default.required", ["Name"] as Object[], "Name is required.")
            result = false;
        }
        return result;
    }

    protected void saveSchemaAttributesClassesAndClassRels(AnnotationSchema s, def params) {

        List<String> usernames = new ArrayList<String>(params.list('username'));

        s.save(flush:true, failOnError: true);
    }

    // ATTRIBUTE DEF

    def createAttributeDef() {
        def schemaInstance = AnnotationSchema.get(params.id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), params.id])
            redirect(action: "edit")
            return
        }

        // It is likely that the user created children without pressing update for the parent, so do the update here.
        doUpdate(schemaInstance);

        def attributeDef = new AttributeDef();
        attributeDef.id = UUID.randomUUID().toString();
        schemaInstance.addAttributeDef(attributeDef);
        if (!schemaInstance.save(flush:true, failOnError: true)) {
            redirect(action: "edit")
            return
        }
        flash.message = message(code: 'default.created.message', args: [message(code: 'attributeDef.label'), attributeDef.name])
        if(params.classDefId)
        {
            redirect(action: "editClassDef", id: params.classDefId, params:[currentTab:'attributeDefsList'])
        }
        else
        {
            redirect(action: "editAttributeDef", id:attributeDef.id, params:[currentTab:'configuration'])
        }
    }

    def createAttributeDefFromClassDefEdit() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.classDefId])
            redirect(action: "editClassDef", id:params.id, params:[currentTab:'attributeDefsList'])
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }

        def attributeDef = new AttributeDef();
        attributeDef.id = UUID.randomUUID().toString();
        schemaInstance.addAttributeDef(attributeDef);
        if (!schemaInstance.save(flush:true, failOnError: true)) {
            redirect(action: "edit")
            return
        }
        flash.message = message(code: 'default.created.message', args: [message(code: 'attributeDef.label'), attributeDef.name])
        redirect(action: "editAttributeDef", id:attributeDef.id, params:[classDefId:params.id, currentTab:'configuration'])
    }

    def startEditAttributeDef() {
        redirect(action: "editAttributeDef", id:params.id, params:[currentTab:'configuration'])
    }

    def editAttributeDef() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        def returnAction = 'editAttributeDefSchema';
        if(params.classDefId)
        {
            returnAction = 'editAttributeDefClassDef'
        }
        [
                schemaInstance: schemaInstance,
                attributeDef: attributeDef,
                currentTab: params.currentTab,
                type: 'updateAttributeDef',
                submitButton: 'Update',
                returnAction: returnAction,
                classDefId: params.classDefId
        ]
    }

    def updateAttributeDef() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), attributeDef.id])
            redirect(action: "edit")
            return
        }
        if (params.version != null) {
            if (attributeDef.version > params.version) {
                attributeDef.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "editAttributeDef", model: [schemaInstance: schemaInstance, administrators: params.list('username'),
                                                         type: 'updateAttributeDef',
                                                         submitButton: 'Update'])
                return
            }
        }
        doUpdateAttributeDef(attributeDef);
        redirect(action: "editAttributeDef", id: params.id, params:[currentTab:params.currentTab])
    }

    def doUpdateAttributeDef(AttributeDef attributeDef) {
        attributeDef.properties = params
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "editAttributeDef", id: params.id, params:[currentTab:params.currentTab])
            return
        }
        def attributeDefOptionDefsRowOrderStr = params.attributeDefOptionDefsRowOrder;
        if(attributeDefOptionDefsRowOrderStr && attributeDefOptionDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(attributeDefOptionDefsRowOrderStr);
            attributeDef.sortAttributeDefOptionDefsByIdToOrderMap(idToOrder);
        }

        try{
            boolean validated = validateAndSetAttributeDefProperties(attributeDef, params);
            schemaService.updateAttributeDefSortOrders(attributeDef);

            if (!validated || !attributeDef.save(flush:true, failOnError: true)) {
                render(view: "editAttributeDef", model:[
                        schemaInstance: schemaInstance,
                        attributeDef: attributeDef,
                        type: 'updateAttributeDef',
                        submitButton: 'Update'
                ])
                return
            }
            flash.message = message(code: 'default.updated.message', args: [message(code: 'attributeDef.label'), attributeDef.name])
        }
        catch(Exception e)
        {
            flash.message = message(code: 'default.not.updated.message', args: [message(code: 'attributeDef.label'), attributeDef.name]) + ":"+e.toString()
        }
    }

    def deleteAttributeDef() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        try {
            schemaInstance.getAttributeDefs().remove(attributeDef);
            attributeDef.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'attributeDef.label'), attributeDef.name])
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"attributeDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'attributeDef.label'), attributeDef.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"attributeDefs"])
        }
    }

    def copyAttributeDef() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        try {
            AttributeDef objCopy = new AttributeDef(attributeDef, true);
            objCopy.save(flush: true)
            schemaInstance.addAttributeDef(objCopy);
            schemaInstance.save(flush: true)
            flash.message = message(code: 'default.copied.message', args: [message(code: 'attributeDef.label'), attributeDef.name])
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"attributeDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.copied.message', args: [message(code: 'attributeDef.label'), attributeDef.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"attributeDefs"])
        }
    }

    protected boolean validateAndSetAttributeDefProperties(AttributeDef attributeDef, def params) {
        boolean result = true;

        if (!attributeDef.name) {
            attributeDef.errors.rejectValue("name", "default.required", ["Name"] as Object[], "Name is required.")
            result = false;
        }
        if (!attributeDef.type) {
            attributeDef.errors.rejectValue("type", "default.required", ["Type"] as Object[], "Type is required.")
            result = false;
        }

        return result;
    }

    def editAttributeDefSchema() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        doUpdateAttributeDef(attributeDef);
        redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"attributeDefs"])
    }

    def editAttributeDefClassDef() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        doUpdateAttributeDef(attributeDef);
        redirect(action: "editClassDef", id: params.classDefId, params:[currentTab:"attributeDefsList"])
    }

    // ATTRIBUTE DEF OPTION DEF

    def createAttributeDefOptionDef() {
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), attributeDef.id])
            redirect(action: "edit")
            return
        }

        // It is likely that the user created children without pressing update for the parent, so do the update here.
        doUpdateAttributeDef(attributeDef);

        def attributeDefOptionDef = new AttributeDefOptionDef();
        attributeDefOptionDef.id = UUID.randomUUID().toString();
        attributeDef.addAttributeDefOptionDef(attributeDefOptionDef);
        if (!attributeDef.save(flush:true, failOnError: true)) {
            redirect(action: "editAttributeDef", id: params.id, params:[currentTab:"attributeDefs"])
            return
        }
        flash.message = message(code: 'default.created.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name])
        redirect(action: "editAttributeDefOptionDef", id:attributeDefOptionDef.id, params:[currentTab:'configuration'])
    }

    def startEditAttributeDefOptionDef() {
        redirect(action: "editAttributeDefOptionDef", id: params.id, params:[currentTab:'configuration'])
    }

    def editAttributeDefOptionDef() {
        def attributeDefOptionDef = AttributeDefOptionDef.get(params.id)
        if (!attributeDefOptionDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDefOptionDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def attributeDef = attributeDefOptionDef.getAttributeDef();
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        [
                schemaInstance: schemaInstance,
                attributeDef: attributeDef,
                attributeDefOptionDef: attributeDefOptionDef,
                currentTab: params.currentTab,
                type: 'updateAttributeDefOptionDef',
                submitButton: 'Update'
        ]
    }

    def updateAttributeDefOptionDef() {
        def attributeDefOptionDef = AttributeDefOptionDef.get(params.id)
        if (!attributeDefOptionDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDefOptionDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def attributeDef = attributeDefOptionDef.getAttributeDef();
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        if (params.version != null) {
            if (attributeDefOptionDef.version > params.version) {
                attributeDefOptionDef.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "editAttributeDefOptionDef",
                        model: [
                                schemaInstance: schemaInstance,
                                attributeDef: attributeDef,
                                attributeDefOptionDef: attributeDefOptionDef,
                                currentTab: params.currentTab,
                                administrators: params.list('username'),
                                type: 'updateAttributeDefOptionDef',
                                submitButton: 'Update'])
                return
            }
        }
        doUpdateAttributeDef(attributeDefOptionDef);
        redirect(action: "editAttributeDefOptionDef", id: attributeDefOptionDef.id, params:[currentTab:params.currentTab])
    }

    def doUpdateAttributeDefOptionDef(AttributeDefOptionDef attributeDefOptionDef) {
        def attributeDef = attributeDefOptionDef.getAttributeDef();
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = attributeDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }

        attributeDefOptionDef.properties = params

        try {
            boolean validated = validateAndSetAttributeDefOptionDefProperties(attributeDefOptionDef, params);

            if (!validated || !attributeDefOptionDef.save(flush:true, failOnError: true)) {
                render(view: "editAttributeDefOptionDef",
                        model: [
                                schemaInstance: schemaInstance,
                                attributeDefOptionDef: attributeDefOptionDef,
                                type: 'updateAttributeDefOptionDef',
                                submitButton: 'Update'
                        ])
                return
            }

            flash.message = message(code: 'default.updated.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name])
        }
        catch(Exception e)
        {
            flash.message = message(code: 'default.not.updated.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name]) + ":"+e.toString()
        }
    }

    def deleteAttributeDefOptionDef() {
        def attributeDefOptionDef = AttributeDefOptionDef.get(params.id)
        if (!attributeDefOptionDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDefOptionDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def attributeDef = attributeDefOptionDef.getAttributeDef();
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        try {
            attributeDef.getAttributeDefOptionDefs().remove(attributeDefOptionDef);
            attributeDefOptionDef.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name])
            redirect(action: "editAttributeDef", id: attributeDef.id, params:[currentTab:"attributeDefOptionDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name]) + ":"+e.toString()
            redirect(action: "editAttributeDef", id: attributeDef.id, params:[currentTab:"attributeDefOptionDefs"])
        }
    }

    def copyAttributeDefOptionDef() {
        def attributeDefOptionDef = AttributeDefOptionDef.get(params.id)
        if (!attributeDefOptionDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDefOptionDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def attributeDef = attributeDefOptionDef.getAttributeDef();
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        try {
            AttributeDefOptionDef objCopy = new AttributeDefOptionDef(attributeDefOptionDef, true);
            objCopy.save(flush: true)
            attributeDef.addAttributeDefOptionDef(objCopy);
            attributeDef.save(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name])
            redirect(action: "editAttributeDef", id: attributeDef.id, params:[currentTab:"attributeDefOptionDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'attributeDefOptionDef.label'), attributeDefOptionDef.name]) + ":"+e.toString()
            redirect(action: "editAttributeDef", id: attributeDef.id, params:[currentTab:"attributeDefOptionDefs"])
        }
    }

    protected boolean validateAndSetAttributeDefOptionDefProperties(AttributeDefOptionDef attributeDefOptionDef, def params) {
        boolean result = true;

        if (!attributeDefOptionDef.name) {
            attributeDefOptionDef.errors.rejectValue("name", "default.required", ["Name"] as Object[], "Name is required.")
            result = false;
        }
        return result;
    }

    def editAttributeDefOptionDefAttributeDef() {
        def attributeDefOptionDef = AttributeDefOptionDef.get(params.id)
        if (!attributeDefOptionDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDefOptionDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def attributeDef = attributeDefOptionDef.getAttributeDef();
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        doUpdateAttributeDefOptionDef(attributeDefOptionDef);
        redirect(action: "editAttributeDef", id: attributeDef.id, params:[currentTab:"configuration"])
    }

    // CLASS DEF

    def createClassDef() {
        def schemaInstance = AnnotationSchema.get(params.id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), params.id])
            redirect(action: "edit")
            return
        }

        // It is likely that the user created children without pressing update for the parent, so do the update here.
        doUpdate(schemaInstance);

        def classDef = new ClassDef();
        classDef.id = UUID.randomUUID().toString();
        schemaInstance.addClassDef(classDef);
        if (!schemaInstance.save(flush:true, failOnError: true)) {
            redirect(action: "edit", id: params.id, params:[currentTab:'classDefs'])
            return
        }
        flash.message = message(code: 'default.created.message', args: [message(code: 'classDef.label'), classDef.name])
        redirect(action: "editClassDef", id:classDef.id, params:[currentTab:"configuration"])
    }

    def startEditClassDef() {
        redirect(action: "editClassDef", id: params.id, params:[currentTab:'configuration'])
    }

    def editClassDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        [
                schemaInstance: schemaInstance,
                attributeDefs: schemaInstance.doGetAttributeDefsSorted(),
                classDefs: schemaInstance.doGetClassDefsSorted(),
                classDef: classDef,
                currentTab: params.currentTab,
                type: 'updateClassDef',
                submitButton: 'Update'
        ]
    }

    def updateClassDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), classDef.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        if (params.version != null) {
            if (classDef.version > params.version) {
                classDef.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "editClassDef", model: [
                        schemaInstance: schemaInstance,
                        attributeDefs: schemaInstance.getAttributeDefs(),
                        classDefs: schemaInstance.getClassDefs(),
                        classDef: classDef,
                        currentTab: params.currentTab,
                        type: 'updateClassDef',
                        submitButton: 'Update'
                ])
                return
            }
        }
        doUpdateClassDef(classDef);
        redirect(action: "editClassDef", id: params.id, params:[currentTab:params.currentTab])
    }

    def doUpdateClassDef(ClassDef classDef) {
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        classDef.properties = params
        def attributeDefsRowOrderStr = params.attributeDefsRowOrder;
        if(attributeDefsRowOrderStr && attributeDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(attributeDefsRowOrderStr);
            classDef.sortAttributeDefsByIdToOrderMap(idToOrder);
        }
        def classDefClassDefsRowOrderStr = params.classDefClassDefsRowOrder;
        if(classDefClassDefsRowOrderStr && classDefClassDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(classDefClassDefsRowOrderStr);
            classDef.sortClassDefClassDefsByIdToOrderMap(idToOrder);
        }
        try {
            boolean validated = validateAndSetClassDefProperties(classDef, params);
            schemaService.updateClassDefSortOrders(classDef);

            if (!validated || !classDef.save(flush:true, failOnError: true)) {
                render(view: "editClassDef", model: [
                        schemaInstance: schemaInstance,
                        classDef: classDef,
                        type: 'updateClassDef',
                        submitButton: 'Update'
                ])
                return
            }

            flash.message = message(code: 'default.updated.message', args: [message(code: 'classDef.label'), classDef.name])
        }
        catch(Exception e)
        {
            flash.message = message(code: 'default.not.updated.message', args: [message(code: 'classDef.label'), classDef.name]) + ":"+e.toString()
        }
    }

    def updateClassDefCreateAttributeDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), classDef.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        if (params.version != null) {
            if (classDef.version > params.version) {
                classDef.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "editClassDef", model: [
                        schemaInstance: schemaInstance,
                        attributeDefs: schemaInstance.getAttributeDefs(),
                        classDefs: schemaInstance.getClassDefs(),
                        classDef: classDef,
                        currentTab: params.currentTab,
                        type: 'updateClassDef',
                        submitButton: 'Update'
                ])
                return
            }
        }
        doUpdateClassDef(classDef);
        redirect(action: "createAttributeDefFromClassDefEdit", id: params.id, params:[currentTab:params.currentTab])
    }

    def deleteClassDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        try {
            schemaInstance.getClassDefs().remove(classDef);
            classDef.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'classDef.label'), classDef.name])
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'classDef.label'), classDef.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classDefs"])
        }
    }

    def copyClassDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        try {
            Map<AttributeDef, AttributeDef> attributeDefMap = new HashMap<AttributeDef, AttributeDef>();
            for(Iterator iter = schemaInstance.getAttributeDefs().iterator(); iter.hasNext();)
            {
                AttributeDef attributeDef = (AttributeDef)iter.next();
                attributeDefMap.put(attributeDef, attributeDef);
            }
            Map<ClassDef, ClassDef> classDefMap = new HashMap<ClassDef, ClassDef>();
            for(Iterator iter = schemaInstance.getClassDefs().iterator(); iter.hasNext();)
            {
                ClassDef tClassDef = (ClassDef)iter.next();
                classDefMap.put(tClassDef, tClassDef);
            }
            ClassDef objCopy = new ClassDef(classDef, attributeDefMap, classDefMap, true);
            objCopy.save(flush: true);
            schemaInstance.addClassDef(objCopy);
            schemaInstance.save(flush: true)
            flash.message = message(code: 'default.copied.message', args: [message(code: 'classDef.label'), classDef.name])
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.copied.message', args: [message(code: 'classDef.label'), classDef.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classDefs"])
        }
    }

    def editClassDefSchema() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        doUpdateClassDef(classDef);
        redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classDefs"])
    }

    def addClassDefAttributeDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def selectedAttributeDefIds = params.selectedAttributeDefIds;
        for(selectedAttributeDefId in selectedAttributeDefIds)
        {
            def attributeDef = AttributeDef.findById(selectedAttributeDefId);
            if(attributeDef != null && !classDef.getAttributeDefs().contains(attributeDef))
            {
                classDef.addAttributeDef(attributeDef);
            }
        }

        // The user expects that this will be saved upon add.  He should not have to press Update specifically in addition to adding children.
        doUpdateClassDef(classDef);

        redirect(action: "editClassDef", id: classDef.id, params:[currentTab:"attributeDefsList"])
    }

    def removeClassDefAttributeDef() {
        // An attributeDef does not have a classDef parent reference, because it can be attached to multiple parents.
        // We have to pass a separate parameter each, for parent and child.
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.attributeDefId])
            redirect(action: "edit")
            return
        }
        def classDef = ClassDef.get(params.classDefId)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        try {
            classDef.getAttributeDefs().remove(attributeDef);
            classDef.save(flush: true)
            flash.message = message(code: 'default.removed.message', args: [message(code: 'classDef.label'), classDef.name])
            redirect(action: "editClassDef", id: classDef.id, params:[currentTab:"attributeDefsList"])
        }
        catch (Exception e) {
            flash.message = message(code: 'default.not.removed.message', args: [message(code: 'classDef.label'), classDef.name]) + ":"+e.toString()
            redirect(action: "editClassDef", id: classDef.id, params:[currentTab:"attributeDefsList"])
        }
    }

    def addClassDefClassDef() {
        def classDef = ClassDef.get(params.id)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def selectedClassDefClassDefIds = params.selectedClassDefClassDefIds;
        for(selectedClassDefClassDefId in selectedClassDefClassDefIds)
        {
            def classDefClassDef = ClassDef.findById(selectedClassDefClassDefId);
            if(classDefClassDef != null && !classDef.getClassDefs().contains(classDefClassDef))
            {
                classDef.addClassDef(classDefClassDef);
            }
        }

        // The user expects that this will be saved upon add.  He should not have to press Update specifically in addition to adding children.
        doUpdateClassDef(classDef);

        redirect(action: "editClassDef", id: classDef.id, params:[currentTab:"classDefsList"])
    }

    def removeClassDefClassDef() {
        // An classDefClassDef does not have a classDef parent reference, because it can be attached to multiple parents.
        // We have to pass a separate parameter each, for parent and child.
        def classDefClassDef = ClassDef.get(params.id)
        if (!classDefClassDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def classDef = ClassDef.get(params.classDefId)
        if (!classDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classDef.label'), params.classDefId])
            redirect(action: "edit")
            return
        }
        try {
            classDefClassDef.setParent(null);
            classDefClassDef.save(flush: true)
            classDef.getClassDefs().remove(classDefClassDef);
            classDef.save(flush: true)
            flash.message = message(code: 'default.removed.message', args: [message(code: 'classDef.label'), classDefClassDef.name])
            redirect(action: "editClassDef", id: classDef.id, params:[currentTab:"classDefsList"])
        }
        catch (Exception e) {
            flash.message = message(code: 'default.not.removed.message', args: [message(code: 'classDef.label'), classDef.name]) + ":"+e.toString()
            redirect(action: "editClassDef", id: classDef.id, params:[currentTab:"classDefsList"])
        }
    }

    protected boolean validateAndSetClassDefProperties(ClassDef classDef, def params) {
        boolean result = true;

        if (!classDef.name) {
            classDef.errors.rejectValue("name", "default.required", ["Name"] as Object[], "Name is required.")
            result = false;
        }
        if (!classDef.color) {
            classDef.errors.rejectValue("color", "default.required", ["Color"] as Object[], "Color is required.")
            result = false;
        }
        return result;
    }

    // CLASS REL DEF

    def createClassRelDef() {
        def schemaInstance = AnnotationSchema.get(params.id)
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), params.id])
            redirect(action: "edit")
            return
        }

        // It is likely that the user created children without pressing update for the parent, so do the update here.
        doUpdate(schemaInstance);

        def classRelDef = new ClassRelDef();
        classRelDef.id = UUID.randomUUID().toString();
        schemaInstance.addClassRelDef(classRelDef);
        if (!schemaInstance.save(flush:true, failOnError: true)) {
            redirect(action: "edit", id: params.id, params:[currentTab:'classRelDefs'])
            return
        }
        flash.message = message(code: 'default.created.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
        redirect(action: "editClassRelDef", id:classRelDef.id, params:[currentTab:'configuration'])
    }

    def startEditClassRelDef() {
        redirect(action: "editClassRelDef", id: params.id, params:[currentTab:'configuration'])
    }

    def editClassRelDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classRelDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        [
                schemaInstance: schemaInstance,
                attributeDefs: schemaInstance.doGetAttributeDefsSorted(),
                classDefs: schemaInstance.doGetClassDefsSorted(),
                classRelDef: classRelDef,
                currentTab: params.currentTab,
                type: 'updateClassRelDef',
                submitButton: 'Update'
        ]
    }

    def updateClassRelDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), classRelDef.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classRelDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        if (params.version != null) {
            if (classRelDef.version > params.version) {
                classRelDef.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'schema.label', default: 'Schema')] as Object[],
                        "Another user has updated this Schema while you were editing")
                render(view: "editClassRelDef", model: [
                        schemaInstance: schemaInstance,
                        attributeDefs: schemaInstance.getAttributeDefs(),
                        classDefs: schemaInstance.getClassDefs(),
                        classRelDef: classRelDef,
                        currentTab: params.currentTab,
                        type: 'updateClassRelDef',
                        submitButton: 'Update'
                ])
                return
            }
        }
        doUpdateClassRelDef(classRelDef);
        redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:params.currentTab])
    }

    def doUpdateClassRelDef(ClassRelDef classRelDef) {
        def schemaInstance = classRelDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        classRelDef.properties = params
        def attributeDefsRowOrderStr = params.attributeDefsRowOrder;
        if(attributeDefsRowOrderStr && attributeDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(attributeDefsRowOrderStr);
            classRelDef.sortAttributeDefsByIdToOrderMap(idToOrder);
        }
        def leftClassDefsRowOrderStr = params.leftClassDefsRowOrder;
        if(leftClassDefsRowOrderStr && leftClassDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(leftClassDefsRowOrderStr);
            classRelDef.sortLeftClassDefsByIdToOrderMap(idToOrder);
        }
        def rightClassDefsRowOrderStr = params.rightClassDefsRowOrder;
        if(rightClassDefsRowOrderStr && rightClassDefsRowOrderStr.size() > 0)
        {
            Map<String, String> idToOrder = rowOrderStringToMap(rightClassDefsRowOrderStr);
            classRelDef.sortRightClassDefsByIdToOrderMap(idToOrder);
        }

        try {
            boolean validated = validateAndSetClassRelDefProperties(classRelDef, params);
            schemaService.updateClassRelDefSortOrders(classRelDef);

            if (!validated || !classRelDef.save(flush:true, failOnError: true)) {
                render(view: "editClassRelDef", model: [
                        schemaInstance: schemaInstance,
                        classRelDef: classRelDef,
                        type: 'updateClassRelDef',
                        submitButton: 'Update'
                ])
                return
            }

            flash.message = message(code: 'default.updated.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
        }
        catch(Exception e)
        {
            flash.message = message(code: 'default.not.updated.message', args: [message(code: 'classRelDef.label'), classRelDef.name]) + ":"+e.toString()
        }
    }

    def deleteClassRelDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classRelDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        try {
            schemaInstance.getClassRelDefs().remove(classRelDef);
            classRelDef.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classRelDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'classRelDef.label'), classRelDef.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classRelDefs"])
        }
    }

    def copyClassRelDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classRelDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        try {
            Map<AttributeDef, AttributeDef> attributeDefMap = new HashMap<AttributeDef, AttributeDef>();
            for(Iterator iter = schemaInstance.getAttributeDefs().iterator(); iter.hasNext();)
            {
                AttributeDef attributeDef = (AttributeDef)iter.next();
                attributeDefMap.put(attributeDef, attributeDef);
            }
            Map<ClassDef, ClassDef> classDefMap = new HashMap<ClassDef, ClassDef>();
            for(Iterator iter = schemaInstance.getClassDefs().iterator(); iter.hasNext();)
            {
                ClassDef classDef = (ClassDef)iter.next();
                classDefMap.put(classDef, classDef);
            }
            ClassRelDef objCopy = new ClassRelDef(classRelDef, attributeDefMap, classDefMap, true);
            objCopy.save(flush: true)
            schemaInstance.addClassRelDef(objCopy);
            schemaInstance.save(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classRelDefs"])
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'classRelDef.label'), classRelDef.name]) + ":"+e.toString()
            redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classRelDefs"])
        }
    }

    def editClassRelDefSchema() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def schemaInstance = classRelDef.getAnnotationSchema();
        if (!schemaInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'schema.label'), schemaInstance.id])
            redirect(action: "edit")
            return
        }
        doUpdateClassRelDef(classRelDef);
        redirect(action: "edit", id: schemaInstance.id, params:[currentTab:"classRelDefs"])
    }

    def addClassRelDefAttributeDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def selectedAttributeDefIds = params.selectedAttributeDefIds;
        for(selectedAttributeDefId in selectedAttributeDefIds)
        {
            def attributeDef = AttributeDef.findById(selectedAttributeDefId);
            if(attributeDef != null && !classRelDef.getAttributeDefs().contains(attributeDef))
            {
                classRelDef.addAttributeDef(attributeDef);
            }
        }

        // The user expects that this will be saved upon add.  He should not have to press Update specifically in addition to adding children.
        doUpdateClassRelDef(classRelDef);

        redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"attributeDefs"])
    }

    def removeClassRelDefAttributeDef() {
        // An attributeDef does not have a classRelDef parent reference, because it can be attached to multiple parents.
        // We have to pass a separate parameter each, for parent and child.
        def attributeDef = AttributeDef.get(params.id)
        if (!attributeDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'attributeDef.label'), params.attributeDefId])
            redirect(action: "edit")
            return
        }
        def classRelDef = ClassRelDef.get(params.classRelDefId)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        try {
            classRelDef.getAttributeDefs().remove(attributeDef);
            classRelDef.save(flush: true)
            flash.message = message(code: 'default.removed.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
            redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:'attributeDefs'])
        }
        catch (Exception e) {
            flash.message = message(code: 'default.not.removed.message', args: [message(code: 'classRelDef.label'), classRelDef.name]) + ":"+e.toString()
            redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:'attributeDefs'])
        }
    }

    def addClassRelDefLeftClassDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def selectedLeftClassDefIds = params.selectedLeftClassDefIds;
        for(selectedLeftClassDefId in selectedLeftClassDefIds)
        {
            def leftClassDef = ClassDef.findById(selectedLeftClassDefId);
            if(leftClassDef != null && !classRelDef.getLeftClassDefs().contains(leftClassDef))
            {
                classRelDef.addLeftClassDef(leftClassDef);
            }
        }

        // The user expects that this will be saved upon add.  He should not have to press Update specifically in addition to adding children.
        doUpdateClassRelDef(classRelDef);

        redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"classRels"])
    }

    def removeClassRelDefLeftClassDef() {
        // An classRelDefLeftClassDef does not have a classRelDef parent reference, because it can be attached to multiple parents.
        // We have to pass a separate parameter each, for parent and child.
        def leftClassDef = ClassDef.get(params.id)
        if (!leftClassDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def classRelDef = ClassRelDef.get(params.classRelDefId)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.classRelDefId])
            redirect(action: "edit")
            return
        }
        try {
            classRelDef.getLeftClassDefs().remove(leftClassDef);
            classRelDef.save(flush: true)
            flash.message = message(code: 'default.removed.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
            redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"classRels"])
        }
        catch (Exception e) {
            flash.message = message(code: 'default.not.removed.message', args: [message(code: 'classRelDef.label'), classRelDef.name]) + ":"+e.toString()
            redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"classRels"])
        }
    }

    def addClassRelDefRightClassDef() {
        def classRelDef = ClassRelDef.get(params.id)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def selectedRightClassDefIds = params.selectedRightClassDefIds;
        for(selectedRightClassDefId in selectedRightClassDefIds)
        {
            def rightClassDef = ClassDef.findById(selectedRightClassDefId);
            if(rightClassDef != null && !classRelDef.getRightClassDefs().contains(rightClassDef))
            {
                classRelDef.addRightClassDef(rightClassDef);
            }
        }

        // The user expects that this will be saved upon add.  He should not have to press Update specifically in addition to adding children.
        doUpdateClassRelDef(classRelDef);

        redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"classRels"])
    }

    def removeClassRelDefRightClassDef() {
        // An classRelDefRightClassDef does not have a classRelDef parent reference, because it can be attached to multiple parents.
        // We have to pass a separate parameter each, for parent and child.
        def rightClassDef = ClassDef.get(params.id)
        if (!rightClassDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.id])
            redirect(action: "edit")
            return
        }
        def classRelDef = ClassRelDef.get(params.classRelDefId)
        if (!classRelDef) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'classRelDef.label'), params.classRelDefId])
            redirect(action: "edit")
            return
        }
        try {
            classRelDef.getRightClassDefs().remove(rightClassDef);
            classRelDef.save(flush: true)
            flash.message = message(code: 'default.removed.message', args: [message(code: 'classRelDef.label'), classRelDef.name])
            redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"classRels"])
        }
        catch (Exception e) {
            flash.message = message(code: 'default.not.removed.message', args: [message(code: 'classRelDef.label'), classRelDef.name]) + ":"+e.toString()
            redirect(action: "editClassRelDef", id: classRelDef.id, params:[currentTab:"classRels"])
        }
    }

    protected boolean validateAndSetClassRelDefProperties(ClassRelDef classRelDef, def params) {
        boolean result = true;

        if (!classRelDef.name) {
            classRelDef.errors.rejectValue("name", "default.required", ["Name"] as Object[], "Name is required.")
            result = false;
        }
        if (!classRelDef.color) {
            classRelDef.errors.rejectValue("color", "default.required", ["Color"] as Object[], "Color is required.")
            result = false;
        }
        return result;
    }

}