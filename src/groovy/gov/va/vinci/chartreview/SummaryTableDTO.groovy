package gov.va.vinci.chartreview

import groovy.transform.ToString

/**
 * Created by ryancornia on 3/12/14.
 */
@ToString(includeNames=true)
class SummaryTableDTO {

    String patientId;
    String taskId;
    String status;
    Date    date;
    TaskType taskType;
    String statusComment;

    public enum TaskType {
        COMPLETED, ASSIGNED;
    }
}
