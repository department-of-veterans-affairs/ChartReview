Ext.define('CR.app.store.AnnotationAnnotatorStore', {
    alias: 'store.annotationannotatorstore',
    extend: 'Ext.data.Store',
    model: 'CR.app.model.AnnotationAnnotatorModel',
    autoLoad: false,
    autoSync: false,
    proxy: {
        type: 'rest',
        reader: {
            type: 'xml',
            record: 'annotator',
            root: 'annotators'
        }
    }
});

