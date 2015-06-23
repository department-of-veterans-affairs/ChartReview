package gov.va.vinci.chartreview.model;

import gov.va.vinci.siman.model.ClinicalElementConfiguration;

import java.io.Serializable;

/**
 * Metadata object to display CEC in a list.
 */
public class ClinicalElementConfigurationListObj implements Serializable {
    private static final long serialVersionUID=7274254328109699735L;
    ClinicalElementConfiguration obj;
    boolean canDelete = false;

    public ClinicalElementConfigurationListObj() {

    }

    public ClinicalElementConfigurationListObj(ClinicalElementConfiguration obj, boolean canDelete) {
        this.obj = obj;
        this.canDelete = canDelete;
    }

    public ClinicalElementConfiguration getObj() {
        return obj;
    }

    public void setObj(ClinicalElementConfiguration obj) {
        this.obj = obj;
    }

    public boolean canDelete() {
        return canDelete;
    }

    public void setCanCelete(boolean canDelete) {
        this.canDelete = canDelete;
    }

}
