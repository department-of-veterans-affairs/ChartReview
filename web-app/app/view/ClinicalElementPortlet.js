Ext.define('CR.app.view.ClinicalElementPortlet', {
    extend: 'CR.app.view.Portlet',
    alias: 'widget.clinicalelementportlet',
    title: 'Notes',
    height: 350,
    width: 1000,
    resizable: true,
    resizeHandles: 's e',
//    resizeHandles: 'all',
    mixins: {
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    listeners: {
    	resize: function(comp, width, height, oldWidth, oldHeight, eOpts )
        {
            CR.app.model.CRAppData.clinicalElementConfigurationPortletSizes[this.clinicalElementConfigurationId] = {width: width, height: height};
    	},
        render: function(v)
        {
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
        }
    },

    initComponent: function(){
//        var modelName = 'Item';
//        if(!Ext.ClassManager.get(modelName))
//        {
//            Ext.define(modelName, {
//                extend: 'CR.app.model.CRModelBase',
//                fields: modelFields
//            });
//        }

        Ext.apply(this, {
            layout: {
                type: 'border'
                ,
                padding: 0
            },
            items: [this.createItemInfo()]
        });

        this.callParent(arguments);
    },

    createItemInfo: function(){
        this.itemInfo = Ext.create('widget.iteminfo', {
            region: 'center',
            minWidth: 300
        });
        // Add List and Summary tabs, if required, when clinical element type is set in the ItemInfo.
        return this.itemInfo;
    },

    updateData: function()
    {
        this.itemInfo.updateData();
    },

    showSelectedAnnotation: function()
    {
        this.itemInfo.showSelectedAnnotation();
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
        this.resizeToLastSizeOrDefaultSize();

        // Set the clinicalElementConfigurationId on each sub component, so they can configure themselves.
        this.query('.component').forEach(function(c){
            if(typeof c.setClinicalElementConfigurationId != "undefined")
            {
                c.setClinicalElementConfigurationId(clinicalElementConfigurationId);
            }
        });
    },

    resizeToLastSizeOrDefaultSize: function(){
        var size = CR.app.model.CRAppData.clinicalElementConfigurationPortletSizes[this.clinicalElementConfigurationId];
        if(size)
        {
            this.setWidth(size.width);
            this.setHeight(size.height);
        }
    }
});
