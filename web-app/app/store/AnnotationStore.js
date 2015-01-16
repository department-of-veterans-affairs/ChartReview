Ext.define('CR.app.store.AnnotationStore', {
    alias: 'store.annotationstore',
    extend: 'Ext.data.Store',
    model: 'CR.app.model.AnnotationAnnotatorModel',
    autoLoad: false,
    autoSync: false,
    proxy: {
        type: 'rest',
		url : 'annotation/getAnnotations',
        reader: {
            type: 'xml',
            record: 'annotation',
            root: 'annotations'
        }
    }
});