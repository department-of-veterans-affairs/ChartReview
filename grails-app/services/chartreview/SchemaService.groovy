package chartreview

import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.schema.*
import gov.va.vinci.leo.descriptors.LeoTypeSystemDescription
import gov.va.vinci.leo.descriptors.TypeDescriptionBuilder
import groovy.util.slurpersupport.GPathResult
import groovy.util.slurpersupport.Node

import java.text.SimpleDateFormat

class SchemaService {

    def projectService;


    /**
     * Get the schema record for a schema id
     * @param id  the id of the schema to get.
     * @return  the annotation schema.
     */
    public AnnotationSchema getSchema(String id) {
        log.info('getSchema')
        AnnotationSchema schema = AnnotationSchema.get(id);
        return schema;
    }

    public AnnotationSchema parseSchemaXml(String xml, boolean changeUUIDs = true) {
        Map idMap = null;
        def annotationSchemas = new XmlSlurper().parseText(xml).annotationSchema;
        AnnotationSchema annotationSchema = null;
        def it = annotationSchemas.iterator().next();

        if (changeUUIDs) {
            idMap = Utils.getReplacementsForTempIds(it)
        } else {
            // Get ID Map that is a straight map, no replacements.
            def ids = it.'**'.grep{ it.@id != '' }.'@id'*.text().collect{(String)it} as Set
            idMap= new HashMap<String, String>();
            ids.each { guid -> idMap.put(guid, guid) }
        }
        String id = Utils.safeGet(idMap, it?.@id?.text())
        String schemaName = it?.name?.text();
        int type = 0;
        String description = it?.description?.text();
        def tAnnotationSchema = new AnnotationSchema(id, schemaName, type, description);
        def Set<AttributeDef> attributeDefs = this.prepareAttributeDefs(it?.attributeDefs?.attributeDef, idMap);
        def Set<ClassDef> classDefs = this.prepareClassDefs(it?.classDefs?.classDef, tAnnotationSchema, attributeDefs, idMap);
        def Set<ClassRelDef> classRelDefs = this.prepareClassRelDefs(it?.classRelDefs?.classRelDef, classDefs, attributeDefs, idMap);
        attributeDefs.each { it2 ->
            tAnnotationSchema.addAttributeDef(it2);
        }
        classDefs.each { it2 ->
            tAnnotationSchema.addClassDef(it2);
        }
        classRelDefs.each { it2 ->
            tAnnotationSchema.addClassRelDef(it2);
        }
        return tAnnotationSchema;
    }


    /**
     * Example xml:
     *
     * <pre>
     * {@code
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
     * }</pre>
     *
     * @param xmlToSave
     * @return
     */
    AnnotationSchema saveSchema(String xmlToSave, boolean changeUUIDs = true) {
        Map idMap = null;

        log.info('saveSchema')
        def annotationSchemas = new XmlSlurper().parseText(xmlToSave).annotationSchema;
        AnnotationSchema annotationSchema = null;
        annotationSchemas.each { it ->
            if (changeUUIDs) {
                idMap = Utils.getReplacementsForTempIds(it)
            } else {
                // Get ID Map that is a straight map, no replacements.
                def ids = it.'**'.grep{ it.@id != '' }.'@id'*.text().collect{(String)it} as Set
                idMap= new HashMap<String, String>();
                ids.each { guid -> idMap.put(guid, guid) }
            }
            String id = Utils.safeGet(idMap, it?.@id?.text())
            String schemaName = it?.name?.text();
            int type = 0;
            String description = it?.description?.text();
            def tAnnotationSchema = new AnnotationSchema(id, schemaName, type, description);
            def Set<AttributeDef> attributeDefs = this.prepareAttributeDefs(it?.attributeDefs?.attributeDef, idMap);
            def Set<ClassDef> classDefs = this.prepareClassDefs(it?.classDefs?.classDef, tAnnotationSchema, attributeDefs, idMap);
            def Set<ClassRelDef> classRelDefs = this.prepareClassRelDefs(it?.classRelDefs?.classRelDef, classDefs, attributeDefs, idMap);
            attributeDefs.each { it2 ->
                tAnnotationSchema.addAttributeDef(it2);
            }
            classDefs.each { it2 ->
                tAnnotationSchema.addClassDef(it2);
            }
            classRelDefs.each { it2 ->
                tAnnotationSchema.addClassRelDef(it2);
            }
            def existingSchemas = AnnotationSchema.findAllByName(schemaName);
            if(existingSchemas.size() == 0)
            {
                tAnnotationSchema.save();
                if(!annotationSchema)
                {
                    annotationSchema = tAnnotationSchema;
                }
            }
        }
        return annotationSchema;
    }

    /**
     * Convert AttributeDefs elements in Xml into set of domain objects
     * @param nodes
     * @return set
     */
    def Set<AttributeDef> prepareAttributeDefs(GPathResult nodes, Map idMap){
        log.info('prepareAttributeDefs')
        def attributeDefSet = new HashSet<AttributeDef>(0)

        nodes?.each { attrDf ->
            def attributeDef = new AttributeDef()
            attributeDef.id = idMap.get(attrDf?.@id?.text())
            attributeDef.type = attrDf?.@type?.toLong().longValue()
            attributeDef.name = attrDf?.name?.text()
            attributeDef.color = attrDf?.color?.text()
            attributeDef.numericLow = attrDf?.numericLow?.toDouble().doubleValue()
            attributeDef.numericHigh = attrDf?.numericHigh?.toDouble().doubleValue()
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MMM-dd hh:mm:ss");
            if(attrDf?.minDate)
            {
                try
                {
                    attributeDef.minDate = sdf.parse(attrDf?.minDate);
                }
                catch(Exception e)
                {
                    // Do nothing
                }
            }
            if(attrDf?.maxDate)
            {
                try
                {
                    attributeDef.maxDate = sdf.parse(attrDf?.maxDate);
                }
                catch(Exception e)
                {
                    // Do nothing
                }
            }

            attrDf?.attributeDefOptionDefs?.attributeDefOptionDef?.each{ attrDfOpDf ->
                def attributeDefOptionDef = new AttributeDefOptionDef()
                attributeDefOptionDef.id = idMap.get(attrDfOpDf?.@id?.text())
                attributeDefOptionDef.name = attrDfOpDf?.name?.text()

                // constructor initializes collection, no need to create new
                attributeDef.attributeDefOptionDefs.add (attributeDefOptionDef)
            }

            attributeDefSet.add(attributeDef)
        }

        return attributeDefSet
    }

    /**
     * Convert ClassDefs elements in Xml into set of domain objects
     * @param nodes
     * @return set
     */
    def Set<ClassDef> prepareClassDefs(GPathResult nodes, AnnotationSchema annotationSchema, Set<AttributeDef> attributeDefs, Map idMap){
        log.info('prepareClassDefs')
        def classDefSet = new HashSet<ClassDef>(0)
        nodes?.each { clsDf ->
            def cdf = new ClassDef()
            cdf.id = idMap.get(clsDf?.@id?.text())
            cdf.name = clsDf?.name?.text()
            cdf.color = clsDf?.color?.text()

            clsDf.attributeDefIds?.attributeDefId?.each {attrId ->
                def attributeDefId = idMap.get(attrId?.@id?.text());
                def attributeDef = getAttributeDef(attributeDefs, attributeDefId);
                if(attributeDef != null)
                {
                    cdf.attributeDefs.add(attributeDef);
                }
            }
            
            clsDf.classDefs?.classDef.each { clssDf ->
                def classDefs = prepareClassDefs (clssDf, annotationSchema, attributeDefs)
                classDefs.each { it2 ->
                    it2.setParent(cdf);
                    cdf.addClassDef(it2);
                    it2.annotationSchema = annotationSchema; // the addClassDef will set this to null at this point, because it has not yet been attached to its parent, so lets set this here.
                }
            }
            
            classDefSet.add(cdf)
        }

        return classDefSet
    }

    def AttributeDef getAttributeDef(Set<AttributeDef> attributeDefs, String id)
    {
        AttributeDef attributeDef = null;
        for(int i = 0; i < attributeDefs.size(); i++)
        {
            AttributeDef tAttributeDef = attributeDefs.getAt(i);
            if (tAttributeDef.id == id)
            {
                attributeDef = tAttributeDef;
                break;
            }
        }
        return attributeDef;
    }

    def ClassDef getClassDef(Set<ClassDef> classDefs, String id)
    {
        ClassDef classDef = null;
        for(int i = 0; i < classDefs.size(); i++)
        {
            ClassDef tClassDef = classDefs.getAt(i);
            if (tClassDef.id == id)
            {
                classDef = tClassDef;
                break;
            }
        }
        return classDef;
    }

    /**
     * Convert ClassRelDef elements in Xml into of domain objects
     * @param nodes
     * @return set
     */
    def Set<ClassRelDef> prepareClassRelDefs(GPathResult nodes, Set<ClassDef> classDefs, Set<AttributeDef> attributeDefs, Map idMap){
        log.info('prepareClassRelDefs')
        def classRelDefSet = new HashSet<ClassRelDef>(0)
        nodes?.each { clsRlDf ->
            def classRelDef = new ClassRelDef()

            classRelDef.id = idMap.get(clsRlDf?.@id?.text())
            classRelDef.name = clsRlDf?.name?.text()
            classRelDef.color = clsRlDf?.color?.text()
            
            // only set primitive types if value present
            if(clsRlDf?.type?.text()) {
                classRelDef.type = Utils.toInteger(clsRlDf?.type?.text());
            }

            // temp ids are ids matching classdefs from the schema xml
            clsRlDf?.leftClassDefIds?.classDefId?.each {tLeftClassDefId ->
                def leftClassDefId = idMap.get(tLeftClassDefId?.@id?.text());
                def leftClassDef = getClassDef(classDefs, leftClassDefId);
                if(leftClassDef != null)
                {
                    classRelDef.leftClassDefs.add(leftClassDef);
                }
            }
			
            // temp ids are ids matching classdefs from the schema xml
			clsRlDf?.rightClassDefIds?.classDefId?.each {tRightClassDefId ->
                def rightClassDefId = idMap.get(tRightClassDefId?.@id?.text());
                def rightClassDef = getClassDef(classDefs, rightClassDefId);
                if(rightClassDef != null)
                {
                    classRelDef.rightClassDefs.add(rightClassDef);
                }
			}

            clsRlDf.attributeDefIds?.attributeDefId?.each {attrId ->
                def attributeDefId = idMap.get(attrId?.@id?.text());
                def attributeDef = getAttributeDef(attributeDefs, attributeDefId);
                if(attributeDef != null)
                {
                    classRelDef.attributeDefs.add(attributeDef);
                }
            }

            classRelDefSet.add(classRelDef);
        }

        return classRelDefSet
    }

    public String[] schemaToUimaTypeNames(AnnotationSchema schema, String basePackage) {
        Set<String> uimaTypeNames = new HashSet<String>();

        for (ClassDef classDef: schema.classDefs) {
            uimaTypeNames.addAll(classDefUimaTypeNames(classDef, basePackage));
        }
        return uimaTypeNames.toArray(new String[uimaTypeNames.size()]);
    }

    protected Set<String> classDefUimaTypeNames(ClassDef classDef, String basePackage) {
        Set<String> results = new HashSet<String>();
        results.add(basePackage + "." + getTypeSystemClassName(classDef.name));
        classDef.classDefs.each {c ->
            results.addAll(classDefUimaTypeNames(c, basePackage));
        }
        return results;
    }

    /**
     * Generate a UIMA Type descriptor for an Annotation Schema
     * @param schema  the annotation schema to create the UIMA type descriptor for.
     * @param basePackage the base package the type names will be in. (ie - chartreview.myproject.
     * @return a UIMA Type descriptor for an Annotation Schema
     */
    public String schemaToUimaTypeDescriptor(AnnotationSchema schema, String basePackage) {
        LeoTypeSystemDescription typeSystem = new LeoTypeSystemDescription();
        String newBasePackage = basePackage;
        if (!newBasePackage.endsWith(".")) {
             newBasePackage += ".";
        }

        if (!schema) {
            throw IllegalArgumentException("Schema cannot be null. ");
        }

        for (ClassDef classDef: schema.classDefs) {
           processClassDef(classDef, newBasePackage, typeSystem);
        }
        File f = File.createTempFile("uima-", ".xml");
        typeSystem.toXML(f.getPath());
        return f.text;
    }

    /**
     * Get the typeSystemDescription for a classDef. This updates the typeSystemDescription object passed in, and
     * returns it.
     *
     * @param classDef  the object to get the typeSystemDescription for.
     * @param basePackage the base package the type names will be in. (ie - chartreview.myproject.
     * @param typeSystemDescription  the type system description to add this type to. This is also returned.
     * @return  the typeSystemDescription passed in with the additional types.
     */
    protected processClassDef(ClassDef classDef, String basePackage, LeoTypeSystemDescription typeSystemDescription) {
        String extendingType ="uima.tcas.Annotation";
        if (classDef.parent) {
            extendingType =  basePackage + classDef.parent.getTypeSystemClassName();
        }

        TypeDescriptionBuilder builder = TypeDescriptionBuilder.create(basePackage + classDef.getTypeSystemClassName(), classDef.getName(), extendingType);
        classDef.getAttributeDefs().each{ attribute ->
            String type = "uima.cas.String";
            switch(attribute.getType()) {
                    case AttributeDef.ATTRIBUTE_DEF_TYPE_NUMERIC:
                            type = "uima.cas.Long";
                            break;
                    case AttributeDef.ATTRIBUTE_DEF_TYPE_TEXT:
                            type = "uima.cas.String";
                            break;
                    case AttributeDef.ATTRIBUTE_DEF_TYPE_OPTION:
                            type = "uima.cas.StringList";
                            break;
                    default:
                            type= "uima.tcas.Annotation";
                            break;
            }
            builder.addFeature(attribute.getTypeSystemFeatureName(), attribute.getName(), type);
        }

        typeSystemDescription.addType(builder.getTypeDescription());

        /**
         * Add sub-referenced types if they are not already in the type system.
         */
        classDef.classDefs.each {c ->
            if (!typeSystemDescription.getType(basePackage + c.getTypeSystemClassName())) {
                typeSystemDescription = processClassDef(c, basePackage, typeSystemDescription);
            }
        }

        // TODO - Handle class relationships

        return typeSystemDescription;
    }

    private String getTypeSystemClassName(String s){
          return s.replaceAll("\\s","").replaceAll("[^a-zA-Z0-9]+","");
    }
}
