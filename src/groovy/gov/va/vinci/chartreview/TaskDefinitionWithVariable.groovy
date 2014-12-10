package gov.va.vinci.chartreview


class TaskDefinitionWithVariable implements Serializable {
    String taskDefinitionKey;
    String documentation;
    boolean hasSchema = false;
    boolean hasClinicalElements = false;
    String schemaName;
}
