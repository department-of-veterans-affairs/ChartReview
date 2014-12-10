Ext.define('CR.app.model.CRAppData', {
    singleton: true,
    project: null,
    clinicalElementConfigurations: [],
    clinicalElementConfigurationPortletSizes: [],
    getClinicalElementConfiguration: function(clinicalElementConfigurationId)
    {
        var clinicalElementConfigurations = this.clinicalElementConfigurations;
        var clinicalElementConfiguration = null;
        for(var i = 0; i < clinicalElementConfigurations.length; i++)
        {
            var tClinicalElementConfiguration = clinicalElementConfigurations[i];
            if(tClinicalElementConfiguration.dataIndex == clinicalElementConfigurationId)
            {
                clinicalElementConfiguration = tClinicalElementConfiguration;
                break;
            }
        }
        return clinicalElementConfiguration;
    }
});

