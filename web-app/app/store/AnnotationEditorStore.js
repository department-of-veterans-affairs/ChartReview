/*
 * This is loaded on initial app startup.
 * Also loaded when task is synched.
 */
Ext.define('CR.app.store.AnnotationEditorStore', {
    alias: 'store.annotationeditorstore',
    extend: 'Ext.data.Store',
    fields: ['clinicalElementTask', 'schemaRef', 'type', 'clinicalElementId', 'annotation'], // clinicalElementId and annotation are hidden references for working with the annotation programmatically via this store (e.g. deleting)
    autoLoad: false,

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});

