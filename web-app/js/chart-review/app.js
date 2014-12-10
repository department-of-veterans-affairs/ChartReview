Ext.require([
    'Ext.layout.container.*',
    'Ext.resizer.Splitter',
    'Ext.fx.target.Element',
    'Ext.fx.target.Component',
    'Ext.window.Window',

    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.Action',
    'Ext.tab.*',
    'Ext.button.*',
    'Ext.form.*',
    'Ext.layout.container.Card',
    'Ext.layout.container.Border',
    'Ext.ux.ajax.SimManager',
//    'Ext.ux.PreviewPlugin',
//    'Ext.ux.FitToParent',
    'CR.ux.CRPreviewPlugin',
    'CR.ux.CRFitToParent',

    'CR.app.controller.AnnotationNatureController',
    'CR.app.controller.AnnotationNatureControllerAnnotations',
    'CR.app.controller.AnnotationNatureControllerText',
    'CR.app.model.AnnotationAnnotatorModel',
    'CR.app.model.AnnotationContextClinicalElementLoaderModel',
    'CR.app.model.AnnotationContextClinicalElementModel',
    'CR.app.model.AnnotationContextElementTypeModel',
    'CR.app.model.AnnotationListModel',
    'CR.app.model.AnnotationModel',
    'CR.app.model.AnnotationSchemaModel',
    'CR.app.model.AnnotationSubmitAnnotationsModel',
    'CR.app.model.AnnotationTaskListModel',
    'CR.app.model.AnnotationTaskModel',
    'CR.app.model.CRAppData',
    'CR.app.model.ClinicalElementConfigurationsModel',
    'CR.app.store.AnnotationAnnotatorStore',
    'CR.app.store.AnnotationEditorStore',
    'CR.app.store.AnnotationListStore',
    'CR.app.store.AnnotationSchemaPanelStore',
    'CR.app.store.AnnotationStore',
    'CR.app.store.AnnotationTaskListStore',
    'CR.app.store.ItemBase',
    'CR.app.view.AnnotationEditor',
    'CR.app.view.AnnotationList',
    'CR.app.view.AnnotationListButtonToolbar',
    'CR.app.view.AnnotationSchemaPanel',
    'CR.app.view.AnnotationTaskList',
    'CR.app.view.AnnotationTaskPanel',
    'CR.app.view.ChartPortlet',
    'CR.app.view.ChartReviewPanel',
    'CR.app.view.ClinicalElementPortlet',
    'CR.app.view.GridPortlet',
    'CR.app.view.ItemInfo',
    'CR.app.view.ItemList',
    'CR.app.view.ItemListDetail',
    'CR.app.view.ItemListGrid',
    'CR.app.view.ItemPanel',
    'CR.app.view.ItemSummary',
    'CR.app.view.ItemSummaryDetail',
    'CR.app.view.ItemViewer',
    'CR.app.view.PortalColumn',
    'CR.app.view.PortalDropZone',
    'CR.app.view.PortalPanel',
    'CR.app.view.Portlet'
]);

Ext.override(Ext.data.proxy.Ajax, {timeout:300000})

Ext.application({
    name: 'ChartReview',
//    extend: 'ChartReview.Application',
    autoCreateViewport: false,
//    appFolder: Ext.Loader.getPath('js/chart-review/app').substring(0,Ext.Loader.getPath('js/chart-review/app').length - 3), // remove ".js"
//    models : [
//        'ClinicalElementConfigurationsModel',
//        'CRAppData',
//        'AnnotationAnnotatorModel',
//        'AnnotationContextClinicalElementLoaderModel',
//        'AnnotationContextClinicalElementModel',
//        'AnnotationContextElementTypeModel',
//        'AnnotationListModel',
//        'AnnotationSchemaModel',
//        'AnnotationSubmitAnnotationsModel',
//        'AnnotationTaskListModel',
//        'AnnotationTaskModel'
//    ],
//    stores : [
//        'ItemBase',
//        'StoreOverride',
//        'AnnotationAnnotatorStore',
//        'AnnotationEditorStore',
//        'AnnotationListStore',
//        'AnnotationSchemaPanelStore',
//        'AnnotationStore',
//        'AnnotationTaskListStore'
//    ],
//    views: [
//        'ChartPortlet',
//        'ChartReviewPanel',
//        'GridPortlet',
//        'ItemInfo',
//        'ItemList',
//        'ItemListDetail',
//        'ItemListGrid',
//        'ItemPanel',
//        'ItemSummary',
//        'ItemSummaryDetail',
//        'ItemViewer',
//        'PortalColumn',
//        'PortalDropZone',
//        'PortalPanel',
//        'Portlet',
//        'AnnotationEditor',
//        'AnnotationList',
//        'AnnotationListButtonPanel',
//        'AnnotationSchemaPanel',
//        'AnnotationTaskList',
//        'AnnotationTaskPanel'
//    ],
//    controllers: [
//    ],

    launch: function() {

        if(!hasParameter('projectId'))
        {
            // A project id is necessary to proceed.
            alert('Please pass the project id as a parameter.');
            return;
        }
        else
        {
            // Parse parameters, getting the project id and the process id.
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++)
            {
                var pair = vars[i].split("=");
                if(pair[0] == 'projectId')
                {
                    CR.app.model.CRAppData.projectId = decodeURI(pair[1]);
                }
                else if(pair[0] == 'processId')
                {
                    CR.app.model.CRAppData.processId = decodeURI(pair[1]);
                }
                else if(pair[0] == 'taskId')
                {
                    CR.app.model.CRAppData.taskId = decodeURI(pair[1]);
                }
                else if(pair[0] == 'taskType')
                {
                    CR.app.model.CRAppData.taskType = decodeURI(pair[1]);
                }
                else if(pair[0] == 'readOnly')
                {
                    CR.app.model.CRAppData.readOnly = new Boolean(decodeURI(pair[1]));
                }
            }


        }

        // Tell the ChartReview component that the clinical element definitions have
        // been loaded so that we can create default views, if necessary.
        var comps = Ext.ComponentQuery.query('[alias=widget.chartreview]');
        for(var key1 in comps)
        {
            var comp = comps[key1];
            comp.updateForNewClinicalElementConfigurations();
        }

        // Get the definitions of the possible clinical elements that can be displayed
        // in the chart review Clinical Element portlet.  The list will be used to
        // fill the Add View dropdown and to build the model and columns of a chosen view.
        // The definitions can be saved statically within the client, because they are
        // assumed to not change for the session.
        var clinicalElementConfigurationsStore = Ext.create('Ext.data.JsonStore', {
            model: 'CR.app.model.ClinicalElementConfigurationsModel',
            proxy: {
                type: 'rest',
                url: 'clinicalElementConfiguration/byProject',
                reader: {
                    type: 'json',
                    root: 'elements'
                }
            },
            listeners: {
                exception: function(proxy, response, operation) {
                    Ext.Msg.alert("Error getting element definitions from server.", operation.error);
                    this.view.el.update('');
                },
                scope: this
            }
        });
        clinicalElementConfigurationsStore.load({
            params:{
                id: CR.app.model.CRAppData.projectId,
                processId: CR.app.model.CRAppData.processId
            },
            callback : function(r, options, success){
                if(success)
                {
                    var clinicalElementConfigurations = new Array();
                    for(var i = 0; i < r.length; i++)
                    {
                        var clinicalElementConfiguration = r[i].raw;
                        clinicalElementConfigurations.push(clinicalElementConfiguration);
                    }
                    CR.app.model.CRAppData.clinicalElementConfigurations = clinicalElementConfigurations;

                    // Tell the ChartReview component that the clinical element definitions have
                    // been loaded so that we can create default views, if necessary.
                    var comps = Ext.ComponentQuery.query('[alias=widget.chartreview]');
                    for(var key1 in comps)
                    {
                        var comp = comps[key1];
                        comp.updateForNewClinicalElementConfigurations();
                    }

                    // Tell all components that the clinical element definitions changed.
                    var comps = Ext.ComponentQuery.query('[clinicalElementType]');
                    for(var key1 in comps)
                    {
                        var comp = comps[key1];
                        comp.fireEvent("clinicalElementConfigurationsChanged");
                    }
                }
                else
                {
                    alert('Failed to load clinical element configurations.');
                }
            }
        });
        Ext.create('CR.app.view.ChartReviewPanel');
        Ext.tip.QuickTipManager.init();
        CR.app.controller.AnnotationNatureController.doSync();
    }
});

function hasParameter (name) {
    return window.location.search.indexOf(name) >= 0;
}