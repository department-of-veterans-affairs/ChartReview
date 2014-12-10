package gov.va.vinci.chartreview.model;

import java.sql.Timestamp;

/**
 * Table for storing activiti relation information about an annotation in the project database for reporting.
 *
 * Created by ryancornia on 8/26/14.
 */
public class AnnotationTask {
    private String annotationGuid;
    private String processName;
    private String taskId;
    private String principalElementId;
    private Timestamp version;

    public String getAnnotationGuid() {
        return annotationGuid;
    }

    public void setAnnotationGuid(String annotationGuid) {
        this.annotationGuid = annotationGuid;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getPrincipalElementId() {
        return principalElementId;
    }

    public void setPrincipalElementId(String principalElementId) {
        this.principalElementId = principalElementId;
    }

    public Timestamp getVersion() {
        return version;
    }

    public void setVersion(Timestamp version) {
        this.version = version;
    }
}
