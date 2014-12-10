package gov.va.vinci.chartreview.nlp;


import chartreview.ProjectService;
import gov.va.vinci.chartreview.Utils;
import gov.va.vinci.chartreview.model.Project;
import gov.va.vinci.chartreview.model.schema.AnnotationSchema;
import gov.va.vinci.chartreview.model.schema.AttributeDef;
import gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef;
import gov.va.vinci.chartreview.model.schema.ClassDef;
import gov.va.vinci.siman.dao.SimanService;
import gov.va.vinci.siman.listener.SimanDatabaseListener;
import gov.va.vinci.siman.tools.SimanUtils;

import java.sql.SQLException;
import java.util.*;

public class ChartReviewListener extends SimanDatabaseListener
{
    Project project;
    AnnotationSchema annotationSchema;
    String processId;
    Map<String, ClassDef> annotationTypeToSchemaGuid = new HashMap<String, ClassDef>();
    Map<String, AttributeDef> featureTypeToSchemaGuide = new HashMap<String, AttributeDef>();

    public ChartReviewListener(AnnotationSchema annotationSchema, Project project, String processId, String annotationGroup, boolean insertOnly) throws SQLException, ClassNotFoundException {
        super (ProjectService.getDatabaseConnection(project), Utils.getSQLTemplate(project.getJdbcDriver()), project.getId(), processId, annotationGroup, insertOnly);
        this.exitOnError = false;
        this.project = project;
        this.annotationSchema = annotationSchema;
        this.processId = processId;
        service = new SimanService(connection, Utils.getSQLTemplate(project.getJdbcDriver()));
        annotationTypeToSchemaGuid = annotationSchema.getUimaAnnotationTypeToSchemaGuidMap();
        featureTypeToSchemaGuide = annotationSchema.getUimaFeatureTypeToSchemaGuidMap();
    }


    /**
     * Listeners that extends this may map annotation types different from leo to siman. This method takes
     * a uima annotation type and returns the siman type. In its simples form, it would return the uimaType
     * @param uimaType the uima type name
     * @return the string type name to be stored as part of siman.
     */
    @Override
    protected String getSimanAnnotationType(String uimaType) {
        String typeName = uimaType.substring(uimaType.lastIndexOf(".") + 1).replaceAll("\\s", "").replaceAll("[^a-zA-Z0-9]+", "");
        ClassDef classDef =  annotationTypeToSchemaGuid.get(typeName);
        return "annotationSchema:" + classDef.getAnnotationSchema().getId() + ";classDef:" + classDef.getId();
    }

    /**
     * Listeners that extends this may map feature types different from leo to siman. This method takes
     * a uima feature type short name and returns the siman type. In its simples form, it would return the uimaType
     * @param uimaType the uima type name
     * @return the string type name to be stored as part of siman.
     */
    @Override
    protected String getSimanFeatureType(String uimaType, Object featureValue) {
        String typeName = uimaType.substring(uimaType.lastIndexOf(".") + 1).replaceAll("\\s", "").replaceAll("[^a-zA-Z0-9]+", "");
        AttributeDef attribute =  featureTypeToSchemaGuide.get(typeName);

        if (attribute == null) {
            LOG.error("Could not find attribute for feature: " + typeName + " value: " + featureValue);
            return null;
        }

        String type = "annotationSchema:" + attribute.getAnnotationSchema().getId() + ";attributeDef:" + attribute.getId();

        if (attribute.getType() == AttributeDef.ATTRIBUTE_DEF_TYPE_OPTION) {
            String stringFeatureValue = featureValue.toString();
            for (AttributeDefOptionDef optionDef : attribute.getAttributeDefOptionDefs()) {
                if (optionDef.getName().equals(stringFeatureValue)) {
                    return type + ";attributeDefOptionDef:" + optionDef.getId() + ";";
                }
            }
            LOG.error("Could not find attributeDefOptionDef for feature: " + typeName + " value: " + featureValue);
        }

        return type;
    }

}
