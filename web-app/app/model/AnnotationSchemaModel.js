Ext.define('CR.app.model.AnnotationSchemaModel', {
    extend: 'CR.app.model.CRModelBase',
    fields: ['schema'],
    proxy: {
        type: 'rest',
        url : 'annotationSchema/getSchema',
        reader:
        {
            type: 'xml',
            record: 'annotationSchemas'
        }
    }
});

