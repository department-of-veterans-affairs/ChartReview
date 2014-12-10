Ext.define('CR.app.store.AnnotationListStore', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    model: 'CR.app.model.AnnotationListModel',
    filterOnLoad: true,
    groupField: 'schemaRef',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    sorters: [
        {property: 'clinicalElementId', type:'ASC'},
        {property: 'spanStart', type:'ASC'}
    ]
});