package chartreview
import com.mysema.query.sql.SQLQuery
import com.mysema.query.sql.SQLQueryFactoryImpl
import com.mysema.query.sql.SQLTemplates
import gov.va.vinci.chartreview.PatientAnnotatorProcessTaskId
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.AnnotationTask
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.QAnnotationTask
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord
import gov.va.vinci.chartreview.model.schema.ClassDef
import gov.va.vinci.chartreview.report.AnnotationByAnnotatorDetailModel
import gov.va.vinci.chartreview.report.PrimaryClinicalElementUserClassificationCount
import gov.va.vinci.chartreview.report.PrimaryClinicalElementUserClassificationDetails
import gov.va.vinci.siman.model.*
import gov.va.vinci.siman.tools.ConnectionProvider

import java.math.RoundingMode
import java.sql.Connection
import java.text.DecimalFormat
import java.util.regex.Pattern

import static gov.va.vinci.chartreview.Utils.closeConnection

class ReportService {
    def projectService;
    def annotationSchemaService;
    def grailsApplication;

    public annotations(String projectId, List<String> processNames) {
        Map<String, AnnotationSchema> schemaMap = new HashMap<>();

        Project p = projectService.getProject(projectId);
        SQLTemplates sqlTemplate = Utils.getSQLTemplate(p.jdbcDriver);
        Connection connection = null;
        QClinicalElement qClinicalElement = new QClinicalElement("ce", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT");
        QClinicalElementConfiguration qClinicalElementConfiguration = new QClinicalElementConfiguration("cec", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT_CONFIGURATION");
        QFeature qFeature = new QFeature("f", grailsApplication.config.chartReview.defaultSchema, "FEATURE");
        QAnnotation qAnnotation = new QAnnotation("a", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION");
        QAnnotationTask  qAnnotationTask = new QAnnotationTask("t", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION_TASK");
        List<Annotation> results = new ArrayList<Annotation>();
        try {
            connection = projectService.getDatabaseConnection(p);

            SQLQuery query = new SQLQueryFactoryImpl(sqlTemplate, new ConnectionProvider(connection)).query();
            query.from(qClinicalElementConfiguration, qClinicalElement,  qAnnotationTask, qAnnotation)
                    .leftJoin(qFeature).on(qAnnotation.guid.eq(qFeature.annotationGuid))
                    .where(qAnnotation.guid.eq(qAnnotationTask.annotationGuid)
                    .and(qAnnotationTask.processName.in(processNames))
                    .and(qClinicalElement.guid.eq(qAnnotation.clinicalElementGuid))
                    .and(qClinicalElement.clinicalElementConfigurationId.eq(qClinicalElementConfiguration.id))
            );

            def queryResults = query.list(qAnnotation.guid,
                    qAnnotation.annotationGroup,
                    qAnnotation.annotationType,
                    qAnnotation.coveredText, qAnnotation.start,
                    qAnnotation.end, qAnnotation.userId,
                    qClinicalElementConfiguration.name,
                    qClinicalElementConfiguration.id,
                    qClinicalElement.serializedKeys,
                    qFeature.guid,
                    qFeature.annotationGuid,
                    qFeature.featureIndex,
                    qFeature.featureType,
                    qFeature.name,
                    qFeature.value,
                    qFeature.version);

            Annotation a = null;
            for (com.mysema.query.Tuple t: queryResults) {
                if ( a == null || a.guid != t.get(qAnnotation.guid)) {
                    a = new Annotation(  guid: t.get(qAnnotation.guid),
                            annotationGroup: t.get(qAnnotation.annotationGroup),
                            annotationType: t.get(qAnnotation.annotationType),
                            coveredText: t.get(qAnnotation.coveredText),
                            start: t.get(qAnnotation.start),
                            end: t.get(qAnnotation.end),
                            userId: t.get(qAnnotation.userId));

                    def annotationType = t.get(qAnnotation.annotationType)
                    Map<String, String> keyMap = deSerializeStringToMap(annotationType, ";");
                    def schemaId = keyMap.get("annotationSchema");

                    if (!schemaMap.containsKey(schemaId)) {
                        AnnotationSchemaRecord annotationSchemaRecord = annotationSchemaService.get(Project.get(projectId), schemaId);
                        if (!annotationSchemaRecord) {
                            throw new IllegalArgumentException("Could not find schema with id ${schemaId}.");
                        }
                        AnnotationSchema annotationSchema = annotationSchemaService.parseSchemaXml(annotationSchemaRecord.serializationData, false);
                        schemaMap.put(schemaId, annotationSchema);
                    }

                    results.add(a);
                }
                if (t.get(qFeature.guid)) {
                    Feature feature = new Feature(guid: t.get(qFeature.guid),
                            featureIndex: t.get(qFeature.featureIndex),
                            featureType: t.get(qFeature.featureType),
                            name: t.get(qFeature.name),
                            value: t.get(qFeature.value),
                            version: t.get(qFeature.version));
                    feature.setAnnotation(a);

                    if (a.getFeatures()) {
                        a.getFeatures().add(feature)
                    } else {
                        List<Feature> features = new ArrayList<Feature>();
                        features.add(feature);
                        a.setFeatures(features);
                    }
                }

            }

        } finally {
            closeConnection(connection);
        }

        return [results, schemaMap];

    }


    public List<AnnotationByAnnotatorDetailModel> annotationByAnnotatorDetail(String projectId, List<String> processNames) {
        Map<String, AnnotationSchema> schemaMap = new HashMap<>();

        Project p = projectService.getProject(projectId);
        SQLTemplates sqlTemplate = Utils.getSQLTemplate(p.jdbcDriver);
        Connection connection = null;
        QClinicalElement qClinicalElement = new QClinicalElement("ce", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT");
        QClinicalElementConfiguration qClinicalElementConfiguration = new QClinicalElementConfiguration("cec", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT_CONFIGURATION");
        QFeature qFeature = new QFeature("f", grailsApplication.config.chartReview.defaultSchema, "FEATURE");
        QAnnotation qAnnotation = new QAnnotation("a", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION");
        QAnnotationTask  qAnnotationTask = new QAnnotationTask("t", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION_TASK");
        List<AnnotationByAnnotatorDetailModel> results = new ArrayList<AnnotationByAnnotatorDetailModel>();
        try {
            connection = projectService.getDatabaseConnection(p);

            SQLQuery query = new SQLQueryFactoryImpl(sqlTemplate, new ConnectionProvider(connection)).query();
            query.from(qClinicalElementConfiguration, qClinicalElement,  qAnnotationTask, qAnnotation)
                    .leftJoin(qFeature).on(qAnnotation.guid.eq(qFeature.annotationGuid))
                    .where(qAnnotation.guid.eq(qAnnotationTask.annotationGuid)
                            .and(qAnnotationTask.processName.in(processNames))
                            .and(qClinicalElement.guid.eq(qAnnotation.clinicalElementGuid))
                            .and(qClinicalElement.clinicalElementConfigurationId.eq(qClinicalElementConfiguration.id))
                        );

//            connection = projectService.getDatabaseConnection(p)
//            SQLTemplates dialect = Utils.getSQLTemplate(p.jdbcDriver);
//            SQLQuery query = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(connection)).query();
//
//            QClinicalElement CLINICAL_ELEMENT = new QClinicalElement("ce", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT")
//            QAnnotation ANNOTATION = new QAnnotation("a", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION");
//            QFeature FEATURE = new QFeature("f", grailsApplication.config.chartReview.defaultSchema, "FEATURE");
//            QAnnotationTask ANNOTATION_TASK = new QAnnotationTask("t", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION_TASK");
//
//            query = query.from(CLINICAL_ELEMENT)
//                    .leftJoin(ANNOTATION).on(ANNOTATION.clinicalElementGuid.eq(CLINICAL_ELEMENT.guid))
//                    .leftJoin(FEATURE).on(FEATURE.annotationGuid.eq(ANNOTATION.guid))
//                    .join(ANNOTATION_TASK).on(ANNOTATION.guid.eq(ANNOTATION_TASK.annotationGuid))
//                    .where(CLINICAL_ELEMENT.projectId.eq(projectId)
//                    .and(CLINICAL_ELEMENT.clinicalElementConfigurationId.in(clinicalElementConfigurationIds)));
//
//



            def queryResults = query.list(qAnnotation.guid,
                                        qAnnotation.annotationGroup,
                                        qAnnotation.annotationType,
                                        qAnnotation.coveredText, qAnnotation.start,
                                        qAnnotation.end, qAnnotation.userId,
                                        qAnnotationTask.annotationGuid,
                                        qAnnotationTask.processName, qAnnotationTask.taskId,
                                        qAnnotationTask.principalElementId, qAnnotationTask.version,
                                        qClinicalElementConfiguration.name,
                                        qClinicalElementConfiguration.id,
                                        qClinicalElement.serializedKeys,
                                        qFeature.guid,
                                        qFeature.annotationGuid,
                                        qFeature.featureIndex,
                                        qFeature.featureType,
                                        qFeature.name,
                                        qFeature.value,
                                        qFeature.version);

            Annotation a = null;
            for (com.mysema.query.Tuple t: queryResults) {
                def annotationType = t.get(qAnnotation.annotationType)
                Map<String, String> keyMap = deSerializeStringToMap(annotationType, ";");
                def schemaId = keyMap.get("annotationSchema");

                AnnotationSchema annotationSchema = schemaMap.get(schemaId);
                if (!annotationSchema) {
                    AnnotationSchemaRecord annotationSchemaRecord = annotationSchemaService.get(p, schemaId);
                    if (!annotationSchemaRecord) {
                        throw new IllegalArgumentException("Could not find schema with id ${schemaId}.");
                    }
                    annotationSchema = annotationSchemaService.parseSchemaXml(annotationSchemaRecord.serializationData, false);
                    schemaMap.put(schemaId, annotationSchema);
                }
                if (!annotationSchema) {
                    throw new IllegalArgumentException("Could not find schema with id ${schemaId}.");
                }
                if ( a == null || a.guid != t.get(qAnnotation.guid)) {
                    a = new Annotation(  guid: t.get(qAnnotation.guid),
                            annotationGroup: t.get(qAnnotation.annotationGroup),
                            annotationType: t.get(qAnnotation.annotationType),
                            coveredText: t.get(qAnnotation.coveredText),
                            start: t.get(qAnnotation.start),
                            end: t.get(qAnnotation.end),
                            userId: t.get(qAnnotation.userId));

                    AnnotationTask at = new AnnotationTask(annotationGuid: t.get(qAnnotationTask.annotationGuid),
                            processName: t.get(qAnnotationTask.processName),
                            taskId: t.get(qAnnotationTask.taskId),
                            principalElementId: t.get(qAnnotationTask.principalElementId),
                            version: t.get(qAnnotationTask.version));
                    results.add(new AnnotationByAnnotatorDetailModel(annotation: a,
                            annotationTask: at,
                            clinicalElementConfigurationId: t.get(qClinicalElementConfiguration.id),
                            clinicalElementConfigurationName: t.get(qClinicalElementConfiguration.name),
                            annotationSchema: annotationSchema,
                            clinicalElementSerializedKeys: "clinicalElementConfigurationId=${t.get(qClinicalElementConfiguration.id)};" + t.get(qClinicalElement.serializedKeys)));
                }
                if (t.get(qFeature.guid)) {
                    String guid = t.get(qFeature.value);
                    String value = annotationSchema.getAttributeDefOptionDefValue(guid);

                    Feature feature = new Feature(guid: t.get(qFeature.guid),
                                                featureIndex: t.get(qFeature.featureIndex),
                                                featureType: t.get(qFeature.featureType),
                                                name: t.get(qFeature.name),
                                                value: value ? value : t.get(qFeature.value),
                                                version: t.get(qFeature.version));
                    feature.setAnnotation(a);

                    if (a.getFeatures()) {
                        a.getFeatures().add(feature)
                    } else {
                        List<Feature> features = new ArrayList<Feature>();
                        features.add(feature);
                        a.setFeatures(features);
                    }
                }
            }
        } finally {
            closeConnection(connection);
        }

        return results;

    }

    /**
     * Get the patients/annotator/processes summary for annotations.
     *
     * @param projectId         The project id to filter by.
     * @param processNames      The process names to filter by.
     * @return
     */
    public patientByAnnotatorProcess(String projectId, List<String> processNames) {
        Project p = projectService.getProject(projectId);
        SQLTemplates sqlTemplate = Utils.getSQLTemplate(p.jdbcDriver);
        Connection connection = null;
        QAnnotation qAnnotation = new QAnnotation("a", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION");
        QAnnotationTask  qAnnotationTask = new QAnnotationTask("t", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION_TASK");
        List<PatientAnnotatorProcessTaskId> patientAnnotatorProcesses = new ArrayList<PatientAnnotatorProcessTaskId>();
        List<String> finalProcessNames = new ArrayList<String>();

        try {
            connection = projectService.getDatabaseConnection(p);

            SQLQuery query = new SQLQueryFactoryImpl(sqlTemplate, new ConnectionProvider(connection)).query();
            query.from(qAnnotation, qAnnotationTask).where(qAnnotation.guid.eq(qAnnotationTask.annotationGuid))

            def results = query.list(qAnnotation.userId, qAnnotationTask.processName, qAnnotationTask.taskId, qAnnotationTask.principalElementId);
            for (com.mysema.query.Tuple t: results) {
                def userId = t.get(qAnnotation.userId);
                def processName = t.get(qAnnotationTask.processName);
                if(!processNames.contains(processName))
                {
                    continue;
                }
                def principalElementId = t.get(qAnnotationTask.principalElementId);
                def taskId = t.get(qAnnotationTask.taskId);
                PatientAnnotatorProcessTaskId pap = new PatientAnnotatorProcessTaskId(
                        processName: processName,
                        annotator: userId,
                        patientId: principalElementId,
                        taskId: taskId);
                def duplicate = false;
                for(PatientAnnotatorProcessTaskId tPap : patientAnnotatorProcesses)
                {
                    if(tPap.patientId == pap.patientId && tPap.annotator == pap.annotator)
                    {
                        duplicate = true;
                    }
                }
                if(!duplicate)
                {
                    patientAnnotatorProcesses.add(pap);
                }
                if(!finalProcessNames.contains(processName))
                {
                    finalProcessNames.add(processName);
                }
            }
        } finally {
            closeConnection(connection);
        }

        return [patientAnnotatorProcesses, finalProcessNames];
    }

    /**
     * Get a map of patient ids and the number of annotators that have annotated those patients.
     *
     * @param projectId the project id to look at.
     * @param processNames the process names within that project to filter on.
     * @return a map of patient ids and the number of annotators that have annotated those patients.
     */
    public patientsWithMultipleAnnotators(String projectId, List<String> processNames) {
        Map<String, Integer> principalClinicalElementIdToMultipleCountMap = new HashMap<String, Integer>();
        Map<String, Integer> principalClinicalElementIdToCountMap = new HashMap<String, Integer>();
        List<PatientAnnotatorProcessTaskId> patientAnnotatorProcesses = patientByAnnotatorProcess(projectId, processNames)[0];
        for(PatientAnnotatorProcessTaskId pap : patientAnnotatorProcesses)
        {
            def principalClinicalElementId = pap.patientId;
            def count = principalClinicalElementIdToCountMap.get(principalClinicalElementId);
            if(!count)
            {
                count = new Integer(0);
            }
            count += 1;
            principalClinicalElementIdToCountMap.put(principalClinicalElementId, count);
        }
        for(String principalClinicalElementId : principalClinicalElementIdToCountMap.keySet())
        {
            Integer count = principalClinicalElementIdToCountMap.get(principalClinicalElementId);
            if(count > 1)
            {
                principalClinicalElementIdToMultipleCountMap.put(principalClinicalElementId, count);
            }
        }
        return principalClinicalElementIdToMultipleCountMap;
    }

    /**
     * A basic IAA report, getting CLASSIFICATION level information for each annotator, patient, annotation type. This
     * does not take into account spans, documents, etc..., but is
     * @param projectId
     * @param processNames
     * @return
     */
    public iaa(String projectId, List<String> processNames) {
        Map<String, AnnotationSchema> schemaMap = new HashMap<>();
        Project p = projectService.getProject(projectId);
        SQLTemplates sqlTemplate = Utils.getSQLTemplate(p.jdbcDriver);
        Connection connection = null;
        QAnnotation qAnnotation = new QAnnotation("a", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION");
        QAnnotationTask  qAnnotationTask = new QAnnotationTask("t", grailsApplication.config.chartReview.defaultSchema, "ANNOTATION_TASK");

        List<PrimaryClinicalElementUserClassificationDetails> rowDetails = new ArrayList<PrimaryClinicalElementUserClassificationDetails>();
        List<String> classificationList = new ArrayList<String>();
        List<String> patientIdList = new ArrayList<String>();
        def patientIdToAnnotatorsListMap = new HashMap<String, List>();
        def patientIdToClassificationAllCountMapMap = new HashMap<String, List>();

        try {
            connection = projectService.getDatabaseConnection(p);

            SQLQuery query = new SQLQueryFactoryImpl(sqlTemplate, new ConnectionProvider(connection)).query();
            query.from(qAnnotation, qAnnotationTask).where(qAnnotation.guid.eq(qAnnotationTask.annotationGuid).and(qAnnotationTask.processName.in(processNames)))

            def results = query.list(qAnnotation.annotationType, qAnnotation.userId, qAnnotationTask.principalElementId, qAnnotation.guid, qAnnotation.annotationType);
            for (com.mysema.query.Tuple t: results) {
                def patientId = t.get(qAnnotationTask.principalElementId)
                def annotatorId = t.get(qAnnotation.userId)
                String annotationType = t.get(qAnnotation.annotationType)
                Map<String, String> keyMap = deSerializeStringToMap(annotationType, ";");
                def schemaId = keyMap.get("annotationSchema");

                AnnotationSchema annotationSchema = schemaMap.get(schemaId);
                if (!annotationSchema) {
                    AnnotationSchemaRecord annotationSchemaRecord = annotationSchemaService.get(p, schemaId);
                    if (!annotationSchemaRecord) {
                        throw new IllegalArgumentException("Could not find schema with id ${schemaId}.");
                    }
                    annotationSchema = annotationSchemaService.parseSchemaXml(annotationSchemaRecord.serializationData, false);
                    schemaMap.put(schemaId, annotationSchema);
                }
                if (!annotationSchema) {
                    throw new IllegalArgumentException("Could not find schema with id ${schemaId}.");
                }

                def annotatorsList = patientIdToAnnotatorsListMap.get(patientId);
                if(!annotatorsList)
                {
                    annotatorsList = new ArrayList<String>();
                    patientIdToAnnotatorsListMap.put(patientId, annotatorsList);
                }
                if(!annotatorsList.contains(annotatorId))
                {
                    annotatorsList.add(annotatorId);
                }
                def classificationCountMap = patientIdToClassificationAllCountMapMap.get(patientId);
                if(!classificationCountMap)
                {
                    classificationCountMap = new HashMap<String, Integer>();
                    patientIdToClassificationAllCountMapMap.put(patientId, classificationCountMap);
                }
                def classDefRef = keyMap.get("classDef");
                ClassDef classDef = annotationSchema.getClassDefs().find{it.id==classDefRef};
                Integer classificationCount = classificationCountMap.get(classDef.getName());

                if(!classificationCount)
                {
                    classificationCount = new Integer(0);
                    classificationCountMap.put(classDef.name, classificationCount);
                }
                classificationCount += 1;
                classificationCountMap.put(classDef.name, classificationCount);

                rowDetails.add(new PrimaryClinicalElementUserClassificationDetails(primaryClinicalElementId: patientId,
                                    annotationGuid: t.get(qAnnotation.guid),
                                    classification: classDef.getName(),
                                    userId: annotatorId));
            }
        } finally {
            closeConnection(connection);
        }
        def patientIdToClassificationCountMapMap = new HashMap<String, List>();
        for (String patientId : patientIdToClassificationAllCountMapMap.keySet()) {
            List annotatorsList = patientIdToAnnotatorsListMap.get(patientId);
            if(annotatorsList.size() > 1)
            {
                Map<String, Integer> classificationCountMap = patientIdToClassificationAllCountMapMap.get(patientId);
                Integer sumOfRow = new Integer(0);
                for (String className : classificationCountMap.keySet()) {
                    Integer tCount = classificationCountMap.get(className);
                    sumOfRow += tCount;
                }
                if(sumOfRow > 1)
                {
                    if(!patientIdList.contains(patientId))
                    {
                        patientIdList.add(patientId);
                    }
                    for (String className : classificationCountMap.keySet()) {
                        if(!classificationList.contains(className))
                        {
                            classificationList.add(className);
                        }
                    }
                    patientIdToClassificationCountMapMap.put(patientId, classificationCountMap);
                }
            }
        }


        // Algorithm from Google of Fleiss Kappa
        def piByPatientIdMap = new HashMap<String, Integer>();
        def sumOfColumnsMap = new HashMap<String, Integer>();
        def pjByClassificationMap = new HashMap<String, Integer>();
        def N = patientIdToClassificationCountMapMap.keySet().size();
        def sumOfPi = new Double(0);
        Integer sumOfAllCells = new Integer(0);
        def totalByClassificationMap = new HashMap<String, Integer>();
        DecimalFormat format = new DecimalFormat("#.###");
        format.setRoundingMode(RoundingMode.CEILING);
        Double iaaFleissKappaRounded = 0.0;
        Double pBar = 0.0;
        try {
            for (String patientId : patientIdToClassificationCountMapMap.keySet()) {
                Map<String, Integer> classificationCountMap = patientIdToClassificationCountMapMap.get(patientId);
                Integer squaredSumOfRow = new Integer(0);
                Integer sumOfRow = new Integer(0);
                for (String className : classificationCountMap.keySet()) {
                    Integer tCount = classificationCountMap.get(className);
                    if (!tCount) {
                        tCount = new Integer(0);
                        classificationCountMap.put(className, tCount);
                    }
                    squaredSumOfRow += tCount * tCount;
                    sumOfRow += tCount;
                    sumOfAllCells += tCount;
                    Integer classificationCountTotal = totalByClassificationMap.get(className);
                    if (!classificationCountTotal) {
                        classificationCountTotal = new Integer(0);
                    }
                    classificationCountTotal += tCount;
                    totalByClassificationMap.put(className, classificationCountTotal);

                    Integer sumOfColumn = sumOfColumnsMap.get(className);
                    if (!sumOfColumn) {
                        sumOfColumn = new Integer(0);
                    }
                    sumOfColumn += tCount;
                    sumOfColumnsMap.put(className, sumOfColumn);
                }
                Integer nOfRow = sumOfRow;
                Double pi = (squaredSumOfRow - nOfRow) / (nOfRow * (nOfRow - 1));//(squaredSumOfRow - n)/(n*(n-1));
                String piStr = format.format(pi)
                Double piRounded = new Double(piStr);
                piByPatientIdMap.put(patientId, piRounded);
                sumOfPi += piRounded;
            }
            Double squaredSumOfPj = new Double(0);
            for (String className : sumOfColumnsMap.keySet()) {
                Integer sumOfColumn = sumOfColumnsMap.get(className);
                Integer nOfColumn = sumOfColumn;
                Double pj = sumOfColumn / sumOfAllCells;//(N * nOfColumn); Going for the proportion of all ratings that this column holds
                String pjStr = format.format(pj)
                Double pjRounded = new Double(pjStr);
                pjByClassificationMap.put(className, pjRounded);
                squaredSumOfPj += pjRounded * pjRounded;
            }
            if(N > 0)
            {
                pBar = sumOfPi / N;
            }
            Double iaaFleissKappa =(pBar - squaredSumOfPj) / (1 - squaredSumOfPj);
            // Handle NaN as 1.0.  squared SumOfPj happens when all raters rate all items into only one category.
            if (Double.isNaN(iaaFleissKappa)) {
                // Happens if there is not any data.
                iaaFleissKappa = new Double(0.0);
            }
            String iaaFleissKappaStr = format.format(iaaFleissKappa)
            iaaFleissKappaRounded = new Double(iaaFleissKappaStr);
        }
        catch(Exception e)
        {
            iaaFleissKappaRounded = 0.0;
        }
        def iaaResults = [
            iaaFleissKappa: iaaFleissKappaRounded,
            classificationList: classificationList,
            patientIdList: patientIdList,
            patientIdToClassificationCountMapMap: patientIdToClassificationCountMapMap,
            piByPatientIdMap: piByPatientIdMap,
            totalByClassificationMap: totalByClassificationMap,
            pjByClassificationMap: pjByClassificationMap,
            primaryClinicalElementUserClassificationCount: summarizePrimaryClinicalElementUserClassificationDetails(rowDetails),
            concordance: pBar
        ]

        return iaaResults;
    }

    public List<PrimaryClinicalElementUserClassificationCount> summarizePrimaryClinicalElementUserClassificationDetails(
                                                        List<PrimaryClinicalElementUserClassificationDetails> details) {
        List<PrimaryClinicalElementUserClassificationCount> results = new ArrayList<PrimaryClinicalElementUserClassificationCount>();

        details.each { detail ->
            PrimaryClinicalElementUserClassificationCount count = results.find {
                                                                    it.userId == detail.userId &&
                                                                    it.primaryClinicalElementId == detail.primaryClinicalElementId &&
                                                                    it.classification == detail.classification };
            if (!count) {
                    results.add(new PrimaryClinicalElementUserClassificationCount(
                                                            primaryClinicalElementId: detail.primaryClinicalElementId,
                                                            classification: detail.classification,
                                                            userId: detail.userId,
                                                            count: 1));
            } else {
                count.count = count.count + 1;
            }
        }
        return results;
    }

    /**
     * de-serialize a string into a map based on a delimeter. The string should be in the format:
     * <pre>
     *     key1=value1<delimeter>key2=value2<delimeter>
     * </pre>
     * @param   string the string to de-serialize.
     * @param   delimeter the delimeter seperating name/value pairs in the string.
     * @return  a map of the name/value pairs in the string;
     */
    public static LinkedHashMap<String, String> deSerializeStringToMap(String string, String delimeter) {
        String regex = "(?<!\\\\)" + Pattern.quote(delimeter);
        LinkedHashMap<String, String> results = new LinkedHashMap<String, String>();
        for(String keyValue : string.split(regex)) {
            String value = keyValue.substring(keyValue.indexOf(":") + 1);
            if (value.length() < 1) {
                value = null;
            }
            results.put(keyValue.substring(0, keyValue.indexOf(":")), value);
        }
        return results;
    }
}