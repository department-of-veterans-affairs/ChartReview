package gov.va.vinci.chartreview

import gov.va.vinci.chartreview.model.Project

/**
 * Created by ryancornia on 1/28/14.
 */
class AddProcessWorkflowModel implements Serializable {
    Project project;
    String processId;
    String processGroup;
    String displayName;
    String query;
    String processOrTask = "process";
    List<String> processUsers = new ArrayList<String>();

    /*
     * An ordered list of the tasks
     */
    List<TaskVariables> taskVariablesList;
    List<Object> schemas = new ArrayList<Object>(); // Can't use map because we want to sort this - key/value pairs dynamic groovy object


}
