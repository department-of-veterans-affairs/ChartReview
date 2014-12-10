package gov.va.vinci.chartreview.model;

import com.google.gson.Gson;

import java.io.Serializable;

/**
 * Metadata object about how to display a ClinicalElementConfiguration.
 */
public class ClinicalElementDisplayParameters implements Serializable {
    private static final long serialVersionUID=7274254328109699732L;
    String clinicalElementConfigurationId;
    boolean hidden=false;
    Integer position;
    boolean include= true;

    public ClinicalElementDisplayParameters() {

    }

    public ClinicalElementDisplayParameters(String clinicalElementConfigurationId, Integer position) {
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
        this.position = position;
    }

    public String getClinicalElementConfigurationId() {
        return clinicalElementConfigurationId;
    }

    public void setClinicalElementConfigurationId(String clinicalElementConfigurationId) {
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public boolean isInclude() {
        return include;
    }

    public void setInclude(boolean include) {
        this.include = include;
    }

}
