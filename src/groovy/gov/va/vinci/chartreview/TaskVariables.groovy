package gov.va.vinci.chartreview

import gov.va.vinci.chartreview.model.ClinicalElementDisplayParameters

/**
 * Created by ryancornia on 2/12/14.
 */
class TaskVariables implements Serializable {
    String taskDefinitionKey;
    List<ClinicalElementDisplayParameters> clinicalElements;
    Map<String, Object> parameters = new HashMap<String, Object>();

    public Map<String, Object> getAllVariables() {
        Map<String, Object> variables = new HashMap<String, Object>();
        if (parameters != null) {
            variables.putAll(parameters);
        }
        variables.put("clinicalElements", clinicalElements);
        return variables;
    }
}
