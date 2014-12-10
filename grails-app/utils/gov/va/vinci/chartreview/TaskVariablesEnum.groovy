package gov.va.vinci.chartreview

/**
 * An enum for keeping variables names that are set in activiti so they can be referenced in java code in
 * a compile time safe way.
 *
 */
public enum TaskVariablesEnum {
    ANNOTATION_GROUP("annotationGroup"),
    CLINICAL_ELEMENTS("clinicalElements"),
    DETAILED_DESCRIPTION("detailedDescription"),
    NAME("name"),
    PRE_ANNOTATION_GROUP("preAnnotationGroup"),
    PRIMARY_CLINICAL_ELEMENT("primaryClinicalElement"),
    SCHEMA("schema"),
    STATUS("status"),
    STATUS_COMMENT("statusComment"),
    PROJECT_DOCUMENT("projectDocument");

    protected String name;

    public TaskVariablesEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
