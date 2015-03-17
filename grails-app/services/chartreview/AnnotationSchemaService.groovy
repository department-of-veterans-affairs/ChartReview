package chartreview

import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecordDAO
import gov.va.vinci.chartreview.model.schema.AttributeDef
import gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef
import gov.va.vinci.chartreview.model.schema.ClassDef
import gov.va.vinci.chartreview.model.schema.ClassRelDef
import gov.va.vinci.leo.descriptors.LeoTypeSystemDescription
import gov.va.vinci.leo.descriptors.TypeDescriptionBuilder
import grails.converters.XML
import groovy.util.slurpersupport.GPathResult
import org.apache.commons.dbutils.DbUtils

import java.sql.Connection
import java.sql.Timestamp
import java.text.SimpleDateFormat

/**
 * Service for dealing with annotation schemas.
 */
class AnnotationSchemaService {
    def projectService;

    /**
     * Copy an annotation schema. This creates new UUIDs.
     * @param p   the project that holds both the original schema and will hold the new copy.
     * @param record   the schema record to copy.
     * @param newName    the new name for the copied schema.
     * @param createdBy  the user that is creating the copy.
     * @return the new record.
     */
    public AnnotationSchemaRecord copy(Project p, AnnotationSchemaRecord record, String newName, String createdBy) {
        AnnotationSchemaRecord newRecord = new AnnotationSchemaRecord();
        AnnotationSchema schema = parseSchemaXml(record.serializationData, true);
        schema.name = newName;
        newRecord.name = schema.name;
        newRecord.description = schema.description;
        newRecord.id = schema.id;

        List<AnnotationSchema> schemas = new ArrayList<AnnotationSchema>();
        schema.applySorts();
        schemas.add(schema);
        XML xmlData= schemas as XML;
        newRecord.serializationData = xmlData.toString();
        newRecord.createdDate = new Date();
        newRecord.createdBy = createdBy;
        newRecord.lastModifiedBy = createdBy;
        newRecord.lastModifiedDate = newRecord.createdDate;
        newRecord.serializationVersion = record.version;
        newRecord.version = new Timestamp(System.currentTimeMillis());
        insert(p, newRecord);
        return newRecord;
    }

    /**
     * Insert a new annotation schema record into the project database.
     * @param p   the project to insert the schema record into.
     * @param record  the schema record to insert.
     */
    public void insert(Project p, AnnotationSchemaRecord record) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            dao.insert(record);
            if (!c.autoCommit) {
                c.commit();
            }
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    /**
     * Update a schema record.
     * @param p   the project the existing record resides in.
     * @param record  the record to update.
     */
    public void update(Project p, AnnotationSchemaRecord record) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            dao.update(record);
            if (!c.autoCommit) {
                c.commit();
            }
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    /**
     * Find a schema by name
     * @param p     The project to get the schema from.
     * @param name  The name of the annotation schema.
     * @return      The annotation schema, or null if not found.
     */
    public AnnotationSchemaRecord findByName(Project p, String name) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.findByName(name);
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    /**
     * Get a schema by id
     * @param p     The project to get the schema from.
     * @param id    The id of the annotation schema.
     * @return      The annotation schema, or null if not found.
     */
    public AnnotationSchemaRecord get(Project p, String id) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.get(id);
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    /**
     * Get all schemas in a given project
     * @param p     The project to get the schemas from.
     * @return      The annotation schemas, or an empty list if there are none.
     */
    public List<AnnotationSchemaRecord> getAll(Project p) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.getAll();
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    /**
     * delete a schema in a given project
     * @param p     The project to get the schemas from.
     * @param id    The id of the schema to delete.
     * @return      The number of rows affected.
     */
    public Long delete(Project p, String id) {
        Connection c = null;
        try {
            c = projectService.getDatabaseConnection(p);
            AnnotationSchemaRecordDAO dao = new AnnotationSchemaRecordDAO(c, Utils.getSQLTemplate(p.jdbcDriver));
            return dao.delete(id);
        } finally {
            if (c!= null) {
                DbUtils.close(c);
            }
        }
    }

    /**
     * Parse an xml representation of a schema into Java POJOS.
     * @param xml the xml to parse.
     * @param changeUUIDs  if true, all GUIDs in the xml schema are changed in the POJOS. This is useful
     * if copying a schema. If false, GUIDs are left as is.
     * @return the Object representation of the xml.
     *
     */
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
        def SortedSet<AttributeDef> attributeDefs = this.prepareAttributeDefs(it?.attributeDefs?.attributeDef, idMap);
        def SortedSet<ClassDef> classDefs = this.prepareClassDefs(it?.classDefs?.classDef, tAnnotationSchema, attributeDefs, idMap);
        def SortedSet<ClassRelDef> classRelDefs = this.prepareClassRelDefs(it?.classRelDefs?.classRelDef, classDefs, attributeDefs, idMap);

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
     * Convert AttributeDefs elements in Xml into set of domain objects
     * @param nodes
     * @return set
     */
    protected SortedSet<AttributeDef> prepareAttributeDefs(GPathResult nodes, Map idMap){
        log.info('prepareAttributeDefs')
        def attributeDefSet = new TreeSet<AttributeDef>();

        nodes?.each { attrDf ->
            def attributeDef = new AttributeDef()
            attributeDef.id = idMap.get(attrDf?.@id?.text())
            attributeDef.type = attrDf?.@type?.toLong().longValue()
            attributeDef.name = attrDf?.name?.text()
            attributeDef.color = attrDf?.color?.text()
            attributeDef.numericLow = attrDf?.numericLow?.toDouble().doubleValue()
            attributeDef.numericHigh = attrDf?.numericHigh?.toDouble().doubleValue()
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

            if(attrDf?.minDate)
            {
                try
                {
                    String date = attrDf.minDate;
                    attributeDef.minDate = sdf.parse(date);
                }
                catch(Exception e)
                {
                   println(e);
                }
            }
            if(attrDf?.maxDate)
            {
                try
                {
                    String maxDate = attrDf.maxDate
                    attributeDef.maxDate = sdf.parse(maxDate);
                }
                catch(Exception e)
                {
                    println(e);
                }
            }

            attrDf?.attributeDefOptionDefs?.attributeDefOptionDef?.each{ attrDfOpDf ->
                def attributeDefOptionDef = new AttributeDefOptionDef()
                attributeDefOptionDef.id = idMap.get(attrDfOpDf?.@id?.text())
                attributeDefOptionDef.name = attrDfOpDf?.text()

                // constructor initializes collection, no need to create new
                attributeDef.addAttributeDefOptionDef(attributeDefOptionDef);
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
    protected SortedSet<ClassDef> prepareClassDefs(GPathResult nodes, AnnotationSchema annotationSchema, Set<AttributeDef> attributeDefs, Map idMap){
        log.info('prepareClassDefs')
        def classDefSet = new TreeSet<ClassDef>()
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

    protected AttributeDef getAttributeDef(Set<AttributeDef> attributeDefs, String id)
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

    protected ClassDef getClassDef(Set<ClassDef> classDefs, String id)
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
    protected SortedSet<ClassRelDef> prepareClassRelDefs(GPathResult nodes, Set<ClassDef> classDefs, Set<AttributeDef> attributeDefs, Map idMap){
        log.info('prepareClassRelDefs')
        def classRelDefSet = new TreeSet<ClassRelDef>()
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
