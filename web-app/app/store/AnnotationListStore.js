Ext.define('CR.app.store.AnnotationListStore', {
    alias: 'store.annotationliststore',
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