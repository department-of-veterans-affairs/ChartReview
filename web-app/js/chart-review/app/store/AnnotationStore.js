Ext.define('CR.app.store.AnnotationStore', {
    extend: 'Ext.data.Store',
    model: 'CR.app.model.AnnotationAnnotatorModel',
    autoLoad: false,
    autoSync: false,
    proxy: {
        type: 'rest',
//		url : 'processUsers.json',
        reader: {
            type: 'xml',
            record: 'annotation',
            root: 'annotations'
        }
    }
});