package chartreview

import com.mysema.query.sql.SQLQuery
import com.mysema.query.sql.SQLQueryFactoryImpl
import com.mysema.query.sql.SQLTemplates
import com.mysema.query.sql.dml.SQLDeleteClause
import com.mysema.query.sql.dml.SQLInsertClause
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.QAnnotationTask
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.model.schema.AttributeDef
import gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef
import gov.va.vinci.chartreview.model.schema.ClassRelDef
import gov.va.vinci.siman.model.*
import gov.va.vinci.siman.tools.ConnectionProvider
import gov.va.vinci.siman.tools.SimanUtils
import groovy.xml.XmlUtil
import org.apache.commons.lang3.StringEscapeUtils
import org.apache.commons.validator.GenericValidator
import org.w3c.dom.Element

import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory
import java.sql.Connection
import java.sql.Timestamp
import java.text.DateFormat
import java.text.SimpleDateFormat

import static gov.va.vinci.chartreview.Utils.closeConnection

class AnnotationService {
    def clinicalElementService;
    def projectService;
    def annotationSchemaService;

    DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss'Z'");

    /**
     * Example xml:
     *
     *   <annotations>
     *       <annotation id="2">
     *            <schema id="104"/>
     *            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
     *            <creationDate>2014-02-26T11:52:52Z</creationDate>
     *            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
     *            <clinicalElement id="1;threeStepProcess:1:9;b9d363b0-1c9e-4576-8875-5e199db919d8;1;"/>
     *            <spans>
     *                <span>
     *                    <clinicalElementField id="WHOLE_CONTENT"/>
     *                    <startOffset>10</startOffset>
     *                    <endOffset>22</endOffset>
     *                    <text>kettSSN: 123</text>
     *                </span>
     *            </spans>
     *            <features>
     *                <feature type="0">
     *                    <name>Comments</name>
     *                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
     *                    <elements>
     *                        <element>
     *                            <value>simple feature</value>
     *                            <schemaRef></schemaRef>
     *                        </element>
     *                    </elements>
     *                </feature>
     *                <feature type="0">
     *                    <name>Comments</name>
     *                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
     *                    <elements>
     *                       <element>
     *                           <value>simple feature 2</value>
     *                           <schemaRef></schemaRef>
     *                       </element>
     *                    </elements>
     *                </feature>
     *            </features>
     *        </annotation>
     *   </annotations>
     *
     * @param p the project to save annotations under.
     * @param xmlToSave the xml representation of annotations to save.
     * @param userId the user id to save annotations under.
     * @param annotationGroup the annotation clinicalElementGroup to save these annotations under.
     */
    public void saveAnnotations(String processName, String taskId,
                                Project p, List<ClinicalElementConfiguration> configurations,
                                String xmlToSave, String userId, String group,
                                String annotationGroup, String patientId) {
        log.debug("Save annotations: ${xmlToSave}");

        def annotations = new XmlSlurper().parseText(xmlToSave).annotation;
        Connection connection = null;
        SQLTemplates dialect;
        SQLQuery query;
        boolean autoCommit = false;

        try {
            connection = projectService.getDatabaseConnection(p);
            autoCommit = connection.getAutoCommit();
            connection.setAutoCommit(false);
            dialect = Utils.getSQLTemplate(p.getJdbcDriver());

            // Delete existing annotations for this user/clinicalElementGroup. New ones are saved over top.
            deleteAnnotations(p, configurations, patientId, dialect, connection, group, annotationGroup, userId)
            String clinicalElementGuid;
            Map<String, String> existingClinicalElements = new HashMap<String, String>();

            QFeature qFeature = new QFeature("q");
            SQLInsertClause featureInsert = new SQLInsertClause(connection, dialect, qFeature);

            QAnnotation qAnnotation = new QAnnotation("a");
            SQLInsertClause annotationInsert = new SQLInsertClause(connection, dialect, qAnnotation);

            QAnnotationTask qAnnotationTask =
                        QAnnotationTask.annotationTask;
            SQLInsertClause annotationTaskInsert = new SQLInsertClause(connection, dialect, qAnnotationTask);

            QClinicalElement qClinicalElement = new QClinicalElement("c");
            SQLInsertClause clinicalElementInsert = new SQLInsertClause(connection, dialect, qClinicalElement);
            boolean hasClinicalElementInsert = false;
            boolean hasAnnotationInsert = false;
            boolean hasFeatureInsert = false;
            annotations.each {
                def span = it.spans.span[0];
                String startOffsetText = span.startOffset.text();
                String endOffsetText = span.endOffset.text();
                Integer startOffset = 0;
                Integer endOffset = 0;

                if (startOffsetText) {
                    startOffset = Integer.parseInt(span.startOffset.text())
                }
                if (endOffsetText) {
                    endOffset = Integer.parseInt(span.endOffset.text());
                }

                String clinicalElementId = it.clinicalElement.@id;
                Map key = SimanUtils.deSerializeStringToMap(clinicalElementId, ";");
                Map clinicalElementKey = key.clone();
                clinicalElementKey.remove("projectId");
                clinicalElementKey.remove("clinicalElementGroup");
                clinicalElementKey.remove("clinicalElementConfigurationId");
                String elementKey = SimanUtils.serializeMapToString(clinicalElementKey, ";");
                Timestamp currentTime = new Timestamp(new Date().getTime());

                if (!existingClinicalElements.containsKey(clinicalElementId)) {
                    query = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(connection)).query();

                    // Check for clinical element and insert it if it doesn't exit.
                    QClinicalElement CLINICAL_ELEMENT = QClinicalElement.clinicalElement;

                    List<Tuple> clinicalElements = null;

                    query = query.from(CLINICAL_ELEMENT)
                            .where(CLINICAL_ELEMENT.projectId.eq(key.get("projectId"))
                            .and(CLINICAL_ELEMENT.clinicalElementConfigurationId.eq(key.get("clinicalElementConfigurationId")))
                            .and(CLINICAL_ELEMENT.serializedKeys.eq(elementKey)));

                    if (GenericValidator.isBlankOrNull(group)) {
                        query.where(CLINICAL_ELEMENT.clinicalElementGroup.isNull())
                    } else {
                        query.where(CLINICAL_ELEMENT.clinicalElementGroup.eq(group))
                    }

                    clinicalElements = query.list(CLINICAL_ELEMENT.guid);


                    if (clinicalElements.size() == 0) {
                        // Insert Clinical Element.
                        clinicalElementGuid = UUID.randomUUID().toString();
                        clinicalElementInsert.set(qClinicalElement.guid, clinicalElementGuid)
                                .set(qClinicalElement.version, currentTime)
                                .set(qClinicalElement.projectId, key.get("projectId"))
                                .set(qClinicalElement.clinicalElementConfigurationId, key.get("clinicalElementConfigurationId"))
                                .set(qClinicalElement.serializedKeys, elementKey)
                        if (group == null) {
                            clinicalElementInsert.setNull(qClinicalElement.clinicalElementGroup);
                        } else {
                            clinicalElementInsert.set(qClinicalElement.clinicalElementGroup, group);
                        }

                        clinicalElementInsert.addBatch();
                        hasClinicalElementInsert = true;
                    } else {
                        clinicalElementGuid = clinicalElements.get(0);
                    }
                    existingClinicalElements.put(clinicalElementId, clinicalElementGuid);
                } else {
                    clinicalElementGuid = existingClinicalElements.get(clinicalElementId);
                }

                // Insert Annotation
                QAnnotation ANNOTATION = QAnnotation.annotation;
                QFeature FEATURE = new QFeature("f");
                String annotationGuid = UUID.randomUUID();
                String schemaURI = it.schemaRef.@uri;

                // Do insert.
                annotationInsert.set(qAnnotation.guid, annotationGuid)
                        .set(qAnnotation.clinicalElementGuid, clinicalElementGuid)
                        .set(qAnnotation.end, endOffset)
                        .set(qAnnotation.start, startOffset)
                        .set(qAnnotation.annotationType, schemaURI)
                        .set(qAnnotation.userId, userId)
                        .set(qAnnotation.version, currentTime)
                        .set(qAnnotation.coveredText, span.text.text());
                if (annotationGroup == null) {
                    annotationInsert.setNull(qAnnotation.annotationGroup);
                } else {
                    annotationInsert.set(qAnnotation.annotationGroup, annotationGroup)
                }
                annotationInsert.addBatch();

                annotationTaskInsert.set(qAnnotationTask.annotationGuid, annotationGuid)
                        .set(qAnnotationTask.processName, processName )
                        .set(qAnnotationTask.taskId, taskId)
                        .set(qAnnotationTask.principalElementId, patientId)
                        .set(qAnnotationTask.version, currentTime);
                annotationTaskInsert.addBatch();

                hasAnnotationInsert = true;
                // Insert Features
                it.features.each { features ->
                    features.feature.each { feature ->
                        def elements = feature.elements[0];
                        elements.eachWithIndex { element, index ->
                            String elementValue = element;
                            featureInsert.set(qFeature.guid, UUID.randomUUID().toString())
                                    .set(qFeature.version, currentTime)
                                    .set(qFeature.annotationGuid, annotationGuid)
                                    .set(qFeature.featureIndex, index)
                                    .set(qFeature.featureType, feature.schemaRef.@uri.text())
                                    .set(qFeature.name, feature.name.text());
                            if (elementValue == null) {
                                featureInsert.setNull(qFeature.value)
                            } else {
                                featureInsert.set(qFeature.value, elementValue)
                            }
                            featureInsert.addBatch();
                            hasFeatureInsert = true;
                        }
                    }
                }
            }

            if (hasClinicalElementInsert) {
                clinicalElementInsert.execute();
            }
            if (hasAnnotationInsert) {
                annotationInsert.execute();
                annotationTaskInsert.execute();
            }
            if (hasFeatureInsert) {
                featureInsert.execute();
            }
            /** Commit the last inserts. **/
            if (connection != null) {
                connection.commit();
            }
        } finally {
            closeConnection(connection);

        }
    }

    /**
     * Find existing annotations for a clinical element.
     *
     * @param clinicalElementConfigurationIds - The list of clinical element configuration ids of the clinical elements
     *                  whose annotations are requested
     * @param projectId - The project id to get annotations for. The project defines where the database
     *                    is and how to connect to it.
     * @param clinicalElementGroup - This is the user defined grouping to limit annotations to.
     * @return Document objects populated WITH ONLY ANNOTATIONS for a specific annotation clinicalElementGroup.
     */
    public List<ClinicalElement> getExistingAnnotations(String projectId, List<String> clinicalElementConfigurationIds,
                                                        String clinicalElementGroup, String annotationGroup,
                                                        String principalElementId) {
        Project p = Project.get(projectId);
        if (!p) {
            throw new IllegalArgumentException("Could not find project [${projectId}].");
        }

        Connection connection = null;
        try {
            connection = projectService.getDatabaseConnection(p)
            SQLTemplates dialect = Utils.getSQLTemplate(p.jdbcDriver);
            SQLQuery query = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(connection)).query();

            QClinicalElement CLINICAL_ELEMENT = QClinicalElement.clinicalElement;
            QAnnotation ANNOTATION = QAnnotation.annotation;
            QFeature FEATURE = QFeature.feature;
            QAnnotationTask ANNOTATION_TASK = QAnnotationTask.annotationTask;


            query = query.from(CLINICAL_ELEMENT)
                    .leftJoin(ANNOTATION).on(ANNOTATION.clinicalElementGuid.eq(CLINICAL_ELEMENT.guid))
                    .leftJoin(FEATURE).on(FEATURE.annotationGuid.eq(ANNOTATION.guid))
                    .join(ANNOTATION_TASK).on(ANNOTATION.guid.eq(ANNOTATION_TASK.annotationGuid))
                    .where(CLINICAL_ELEMENT.projectId.eq(projectId)
                    .and(CLINICAL_ELEMENT.clinicalElementConfigurationId.in(clinicalElementConfigurationIds)));

            if (clinicalElementGroup == null) {
                query.where(CLINICAL_ELEMENT.clinicalElementGroup.isNull());
            } else {
                query.where(CLINICAL_ELEMENT.clinicalElementGroup.eq(clinicalElementGroup));
            }

            if (GenericValidator.isBlankOrNull(annotationGroup)) {
                query = query.where(ANNOTATION.annotationGroup.isNull());
            } else {
                query = query.where(ANNOTATION.annotationGroup.in(annotationGroup.split(";")));
            }

            query.where(ANNOTATION_TASK.principalElementId.eq(principalElementId));

            log.debug("Select statement: ${query.toString()} ['${projectId}', '${clinicalElementGroup}', '${annotationGroup}']");

            List<Tuple> results = query.orderBy(CLINICAL_ELEMENT.guid.asc(), ANNOTATION.guid.asc(), FEATURE.guid.asc())
                    .list(
                    CLINICAL_ELEMENT.guid, CLINICAL_ELEMENT.projectId, CLINICAL_ELEMENT.clinicalElementGroup,
                    CLINICAL_ELEMENT.clinicalElementConfigurationId, CLINICAL_ELEMENT.serializedKeys,
                    ANNOTATION.annotationType, ANNOTATION.clinicalElementGuid, ANNOTATION.end, ANNOTATION.annotationGroup,
                    ANNOTATION.guid, ANNOTATION.start, ANNOTATION.userId, ANNOTATION.version, ANNOTATION.coveredText,
                    FEATURE.annotationGuid, FEATURE.featureIndex, FEATURE.featureType, FEATURE.guid, FEATURE.name, FEATURE.value,
                    FEATURE.version
            );

            String clinicalElementGuid = null;
            String annotationGuid = null;
            ClinicalElement clinicalElement = null;
            Annotation a = null;
            Map<String, ClinicalElement> clinicalElementMap = new LinkedHashMap<String, ClinicalElement>();

            results.each { result ->
                if (!result.get(CLINICAL_ELEMENT.guid).equals(clinicalElementGuid)) {
                    clinicalElement = new ClinicalElement(
                            guid: result.get(CLINICAL_ELEMENT.guid),
                            projectId: result.get(CLINICAL_ELEMENT.projectId),
                            clinicalElementGroup: result.get(CLINICAL_ELEMENT.clinicalElementGroup),
                            clinicalElementConfigurationId: result.get(CLINICAL_ELEMENT.clinicalElementConfigurationId)
                    );
                    clinicalElement.setSerializedKeysFromString(result.get(CLINICAL_ELEMENT.serializedKeys));
                    clinicalElementMap.put(clinicalElement.guid, clinicalElement);
                    clinicalElementGuid = clinicalElement.guid;
                }

                if (result.get(ANNOTATION.guid) != null && !result.get(ANNOTATION.guid).equals(annotationGuid)) {
                    if (a != null) {
                        clinicalElementMap.get(a.clinicalElementGuid).getAnnotations().add(a);
                    }
                    a = new Annotation(
                            annotationGroup: result.get(ANNOTATION.annotationGroup),
                            annotationType: result.get(ANNOTATION.annotationType),
                            clinicalElementGuid: result.get(CLINICAL_ELEMENT.guid),
                            end: result.get(ANNOTATION.end),
                            guid: result.get(ANNOTATION.guid),
                            start: result.get(ANNOTATION.start),
                            userId: result.get(ANNOTATION.userId),
                            version: result.get(ANNOTATION.version),
                            coveredText: result.get(ANNOTATION.coveredText));

                    annotationGuid = a.guid;
                    log.debug("Adding annotation: ${a.guid}");
                }

                if (result.get(FEATURE.guid) != null) {
                    Feature f = new Feature(featureIndex: result.get(FEATURE.featureIndex),
                            featureType: result.get(FEATURE.featureType), guid: result.get(FEATURE.guid),
                            name: result.get(FEATURE.name), value: result.get(FEATURE.value),
                            version: result.get(FEATURE.version));
                    f.annotation = a;
                    log.debug("Adding feature ${f.guid} to: ${a.guid}");
                    a.getFeatures().add(f);
                }
            }
            if (clinicalElement != null) {
                clinicalElementMap.put(clinicalElement.guid, clinicalElement);
            }
            if (a != null) {
                clinicalElementMap.get(a.clinicalElementGuid).getAnnotations().add(a);
            }

            return new ArrayList<ClinicalElement>(clinicalElementMap.values());
        } finally {
            closeConnection(connection);
        }
    }

    /**
     * Returns the xml definition of the task with its metadata.
     * @param taskId the task id to get
     * @return the xml definition of the task with its metadata.
     */
    public String getXmlForAnnotations(List<ClinicalElement> clinicalElements, String filterSchema, Project p) {
        DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder()
        org.w3c.dom.Document document = builder.newDocument()
        Element root = document.createElement('annotations')
        def schemaTypePattern = ~/annotationSchema:.+;classDef:.+/

        Connection connection = null;
        try {
            Map connectionInfo = getConnections(p.getId());
            connection= connectionInfo.connection;
            Map<String, AnnotationSchema> annotationSchemaIdToAnnotationSchemaMap = new HashMap<String, AnnotationSchema>();
            for (ClinicalElement clinicalElement : clinicalElements) {
                if (clinicalElement.annotations == null || clinicalElement.annotations.size() < 1) {
                    continue;
                }

                for (Annotation annotation : clinicalElement.getAnnotations()) {
                    String schema = annotation.getAnnotationType();
                    if (!schemaTypePattern.matcher(schema).matches() || !schema.contains("annotationSchema:${filterSchema}")) {
                        continue;
                    }
                    Element annotationElement = document.createElement('annotation')
                    annotationElement.setAttribute("id", annotation.guid);
                    AnnotationSchema annotationSchema = null;

                    if (schemaTypePattern.matcher(schema).matches() && schema.contains("annotationSchema:${filterSchema}")) {
                        Map schemaParts = new HashMap();
                        schema.split(";").each {
                            schemaParts.put(it.split(":")[0], it.split(":")[1])
                        }
                        def annotationSchemaId = schemaParts.get("annotationSchema");
                        annotationSchema = annotationSchemaIdToAnnotationSchemaMap.get(annotationSchemaId);
                        if(!annotationSchema)
                        {
                            AnnotationSchemaRecord annotationSchemaRecord = annotationSchemaService.get(p, annotationSchemaId);
                            annotationSchema = annotationSchemaService.parseSchemaXml(annotationSchemaRecord.serializationData, false);
                            annotationSchemaIdToAnnotationSchemaMap.put(annotationSchema.getId(), annotationSchema);
                        }

                        Element schemaElement = document.createElement("schema");
                        schemaElement.setAttribute("id", annotationSchemaId);
                        annotationElement.appendChild(schemaElement);

                        Element schemaRefElement = document.createElement("schemaRef");
                        schemaRefElement.setAttribute("id", schemaParts.get("classDef"));
                        schemaRefElement.setAttribute("uri", schema);
                        annotationElement.appendChild(schemaRefElement);

                        Element clinicalElementConfiguration = document.createElement("clinicalElementConfiguration");
                        clinicalElementConfiguration.setAttribute("id", clinicalElement.clinicalElementConfigurationId);
                        annotationElement.appendChild(clinicalElementConfiguration);

                        Element ce = document.createElement("clinicalElement");
                        ce.setAttribute("id", Utils.fullSerializedKey(clinicalElement));
                        annotationElement.appendChild(ce);
                    }

                    annotationElement.appendChild(createElement(document, "creationDate", dateFormatter.format(new Date(annotation.version.getTime()))));

                    Element spans = document.createElement("spans");

                    Element clinicalElementFieldElement = document.createElement("clinicalElementField");
                    clinicalElementFieldElement.setAttribute("id", "WHOLE_CONTENT");

                    if (!(annotation.getStart() == 0 && annotation.getEnd() == 0)) {
                        Element span = document.createElement("span");
                        span.appendChild(clinicalElementFieldElement);

                        span.appendChild(createElement(document, "startOffset", "" + annotation.getStart()));
                        span.appendChild(createElement(document, "endOffset", "" + annotation.getEnd()));
                        span.appendChild(createElement(document, "text", annotation.coveredText));

                        spans.appendChild(span);
                    }
                    annotationElement.appendChild(spans);

                    // Add the annotations features.
                    Element featuresElement = document.createElement('features');
                    Set<String> featuresProcessed = new HashSet<String>();

                    annotation.features.each { feature ->
                        Element featureElement = document.createElement('feature');

                        int type = 0;
                        String typeQualifier = "";
                        if(annotationSchema)
                        {
                            (type, typeQualifier) = featureTypeFromSchema(annotationSchema, feature);
                        }
                        featureElement.setAttribute("type", "" + type);

                        featureElement.appendChild(createElement(document, "name", feature.name));

                        Element featureSchemaRefElement = document.createElement("schemaRef");
                        featureSchemaRefElement.setAttribute("uri", feature.featureType);
                        featureElement.appendChild(featureSchemaRefElement)

                        // Add feature elements
                        // TODO: Handle multiple options and class relationships.
                        Element elementsElement = document.createElement('elements');

                        AttributeDefOptionDef optionDef = null;
                        if (type == 3 && typeQualifier == "attributeDef" && !featuresProcessed.contains(feature.name)) {
                            Map featureTypeParts = new HashMap();
                            feature.featureType.split(";").each {
                                featureTypeParts.put(it.split(":")[0], it.split(":")[1])
                            }
                            def attributeDefId = featureTypeParts.get("attributeDef");
                            optionDef = getAttributeDefOptionDef(annotationSchema, attributeDefId, feature.value);
                        }
                        // Deal with options.
                        if (type == 3 && typeQualifier == "attributeDef" && !featuresProcessed.contains(feature.name)) {
                            annotation.features.findAll { it -> it.name == feature.name }.sort {
                                it.featureIndex
                            }.each {
                                Element elementElement = document.createElement('element');
                                elementElement.appendChild(createElement(document, "value", optionDef.id));

                                Element schemaRefE = document.createElement("schemaRef");
                                schemaRefE.setAttribute("uri", optionDef.getSchemaRef());

                                elementElement.appendChild(schemaRefE);
                                elementsElement.appendChild(elementElement);
                            }
                        } else {
                            Element elementElement = document.createElement('element');
                            elementElement.appendChild(createElement(document, "value", feature.value));
                            elementsElement.appendChild(elementElement);
                        }

                        featuresProcessed.add(feature.name);
                        featureElement.appendChild(elementsElement);
                        featuresElement.appendChild(featureElement);
                    }

                    annotationElement.appendChild(featuresElement);
                    root.appendChild(annotationElement);
                }
            }
        } finally {
            closeConnection(connection);
        }
        return XmlUtil.serialize(root);
    }

    /**
     * Given a connection, delete all annotations for a user/clinicalElement/annotationGroup. This method does NOT auto commit,
     * as it is expected to run as part of the larger insert transaction. If it fails, it should roll back with the rest
     * of the transaction.
     *
     *
     * @param p the project to delete annotations from.
     * @param configurations the clinical element configurations to delete annotations for.
     * @param patientId the patient id to delete annotations for.
     * @param c the database connection to use for the delete.
     * @param annotationGroup the annotation clinicalElementGroup to filter deletes on
     * @param user the user name to filter deletes on.
     * @return the number of annotations deleted.
     */
    protected long deleteAnnotations(Project p,
                                    List<ClinicalElementConfiguration> configurations,
                                    String patientId,
                                    SQLTemplates dialect,
                                    Connection c,
                                    String clinicalElementGroup,
                                    String annotationGroup,
                                    String user) {
        QClinicalElement clinicalElement = QClinicalElement.clinicalElement;
        QAnnotation annotation = QAnnotation.annotation;
        QAnnotation annotationSubquery = QAnnotation.annotation;
        QFeature feature = QFeature.feature;
        QAnnotationTask qAnnotationProcessTaskPrincipalClinicalElement  = QAnnotationTask.annotationTask;
        long deleteAnnotationCount = 0;

        SQLQuery subQuery = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(c)).query();

        // Figure out which annotations to delete.
        subQuery = subQuery.from(clinicalElement)
                .join(annotationSubquery).on(clinicalElement.guid.eq(annotationSubquery.clinicalElementGuid))
                .join(qAnnotationProcessTaskPrincipalClinicalElement).on(qAnnotationProcessTaskPrincipalClinicalElement.annotationGuid.eq(annotationSubquery.guid))
                .where(
                    annotationSubquery.annotationGroup.eq(annotationGroup), annotationSubquery.userId.eq(user)
                    .and(annotationSubquery.userId.eq(user)) // Make sure it is the right user.
                    .and(clinicalElement.clinicalElementConfigurationId.in(configurations.collect{it.id})) // Make sure the CEC is in the list.
                    .and(qAnnotationProcessTaskPrincipalClinicalElement.principalElementId.eq(patientId)) // Make sure the patient is right.
                );

        if (GenericValidator.isBlankOrNull(clinicalElementGroup)) {
            subQuery = subQuery.where(clinicalElement.clinicalElementGroup.isNull());
        } else {
            subQuery = subQuery.where(clinicalElement.clinicalElementGroup.eq(clinicalElementGroup));
        }

        List<String> annotationGuids = subQuery.list(annotationSubquery.guid);
        if (annotationGuids.size() > 0) {
            // Delete xrefs first.
            long deletedAnnotationProcessTaskPrincipalClinicalElementCount = new SQLDeleteClause(c, dialect, qAnnotationProcessTaskPrincipalClinicalElement)
                            .where(qAnnotationProcessTaskPrincipalClinicalElement.annotationGuid.in(annotationGuids))
                            .execute();

            // Delete features
            long deleteFeatureCount = new SQLDeleteClause(c, dialect, feature)
                    .where(feature.annotationGuid.in(annotationGuids))
                    .execute();

            // Delete annotations.
            deleteAnnotationCount += new SQLDeleteClause(c, dialect, annotation)
                    .where(annotation.guid.in(annotationGuids))
                    .execute();
        }


        return deleteAnnotationCount;
    }

    /**
     * Given an annotation, get the text it is covering.
     * @param a the annotation
     * @return the text the annotation is covering in the document.
     */
    public String getCoveredText(Annotation a, String clinicalElementText) {
        try {
            return clinicalElementText.substring(a.getStart(), a.getEnd());
        } catch (Exception e) {
            println("Error: a.start: ${a.getStart()} / a.end: ${a.getEnd()} clinicalElementLength: ${clinicalElementText.length()}");
            throw e;
        }
    }

    /**
     * Helper method to easily create xml elements with a text content value.
     * <br/><br/>
     * <strong>Note: elementContent is xml escaped before being set.</strong>
     *
     * @param document the document to create the element from.
     * @param elementName the element name
     * @param elementContent the element content
     * @return an xml element with the content set.
     */
    protected Element createElement(org.w3c.dom.Document document, String elementName, String elementContent) {
        Element element = document.createElement(elementName);
        if (elementContent) {
            element.setTextContent(StringEscapeUtils.escapeXml(elementContent));
        }
        return element;
    }

    /**
     * Given a feature, look up the associated schema to get the attribute or class def type.
     * @param f the feature to look up the type from.
     * @return the type from the schema definition.
     */
    protected featureTypeFromSchema(AnnotationSchema annotationSchema, Feature f) {
        String[] parts = f.featureType.split(";");

        String keyType = parts[1].split(":")[0];
        String keyValue = parts[1].split(":")[1];

        if (keyType == "attributeDef") {
            def attributeDefs = annotationSchema.getAttributeDefs();
            def attributeDef = annotationSchemaService.getAttributeDef(attributeDefs as Set<AttributeDef>, keyValue);
            if(attributeDef != null)
            {
                return [attributeDef.type, keyType];
            }
        } else if (keyType == "classRelDef") {
            def classRelDef = annotationSchemaService.getClassRelDef(annotationSchema.getClassRelDefs() as Set<ClassRelDef>, keyValue);
            if(classRelDef != null)
            {
                return [classRelDef.type, keyType];
            }
        } else {
            throw new RuntimeException("Could not determine feature type for type: ${f.featureType}. Not a attributeDef or classRelDef.");
        }
    }

    /**
     * Given a feature, look up the associated schema to get the attribute or class def type.
     * @param f the feature to look up the type from.
     * @return the type from the schema definition.
     */
    protected getAttributeDefOptionDef(AnnotationSchema annotationSchema, String attributeDefId, String attributeDefOptionDefId) {
        def attributeDefOptionDef = null;
        def attributeDefs = annotationSchema.getAttributeDefs();
        def attributeDef = annotationSchemaService.getAttributeDef(attributeDefs as Set<AttributeDef>, attributeDefId);
        if(attributeDef != null)
        {
            def attributeDefOptionDefs = attributeDef.getAttributeDefOptionDefs();
            attributeDefOptionDef = annotationSchemaService.getAttributeDefOptionDef(attributeDefOptionDefs as Set<AttributeDefOptionDef>, attributeDefOptionDefId);
        }
        return attributeDefOptionDef;
    }

    protected getConnections(String projectId) {
        Project p = projectService.getProject(projectId);
        Connection c = projectService.getDatabaseConnection(projectService.getProject(projectId));
        return [connection: c, template: Utils.getSQLTemplate(p.getJdbcDriver())];
    }
}
