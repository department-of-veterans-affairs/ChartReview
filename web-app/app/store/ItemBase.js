/**
 * @class CR.app.store.ItemBase
 *
 * Provides a base class for ItemListGrid and ItemSummaryChart (future)
 *
 * @constructor
 * Create a new Items Base
 * @param {Object} config The config object
 */
Ext.define('CR.app.store.ItemBase', {

    constructor: function(config) {
        this.callParent(config);
    },

    getElementsStore: function(tThis, onLoad){
        // Default
        var modelName = 'TempModel';
        var modelFields = new Array();
        var modelField = {
            name: 'text',
            type: 'string'
        }
        modelFields.push(modelField);
        var sortInfos = new Array();
        var sortInfo = {
            property: 'text',
            direction: 'ASC'
        }
        sortInfos.push(sortInfo);

        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(tThis.clinicalElementConfigurationId);
        if(clinicalElementConfiguration)
        {
            modelName = clinicalElementConfiguration.text;
            // Add columns from clinical element def
            modelFields = new Array();
            sortInfos = new Array();
            var fields = clinicalElementConfiguration.fields;

            // Done annotating icon is the first column
            modelField = {
                name: 'doneAnnotating',
                type: 'boolean',
                defaultValue: false
            }
            modelFields.push(modelField);
            for(var i = 0; i < fields.length; i++)
            {
                var field = fields[i];
                modelField = {
                    name: field.dataIndex,
                    type: field.type
                }
                modelFields.push(modelField);
                if(field.sort)
                {
                    var sortInfo = {
                        property: field.dataIndex,
                        direction: field.sort
                    }
                    sortInfos.push(sortInfo);
                }
            }
        }

        if(!Ext.ClassManager.get(modelName))
        {
            Ext.define(modelName, {
                extend: 'CR.app.model.CRModelBase',
                fields: modelFields
            });
        }

        var store = new Ext.data.Store(
            {
                model: modelName,
                sortInfo: sortInfos,
                autoLoad: false,
//                filterOnLoad: true,
//                groupField: 'doneAnnotating',
                proxy: {
                    type: 'rest',
                    url: 'clinicalElement/elements',
                    reader: {
                        type: 'json',
                        root: 'items'
                    },
                    listeners: {
                        exception: tThis.onProxyException,
                        scope: this
                    }
                }
            });

        return store;
    },

    getElementContentStore: function(clinicalElementConfiguration){
        // Default
        var modelName = clinicalElementConfiguration.id + '-ContentModel';
        var modelFields = new Array();
        var modelField = {
            name: 'content',
            type: 'string'
        }
        modelFields.push(modelField);

        if(!Ext.ClassManager.get(modelName))
        {
            Ext.define(modelName, {
                extend: 'CR.app.model.CRModelBase',
                fields: modelFields
            });
        }

        var store = new Ext.data.Store(
            {
                model: modelName,
                proxy: {
                    type: 'rest',
                    url: 'clinicalElement/elementContent',
                    autoLoad: false,
                    autoSync: false,
                    reader: {
                        type: 'json'
                    },
                    listeners: {
                        exception: this.onProxyException,
                        scope: this
                    }
                },
                listeners: {
                    load: this.onElementContentLoad,
                    scope: this
                },
                autoLoad: false
            });

        return store;
    }

});

