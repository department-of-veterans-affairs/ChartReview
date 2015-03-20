Ext.define('CR.app.model.AnnotationSchemaModel', {
    extend: 'CR.app.model.CRModelBase',
    fields: ['schema'],
    proxy: {
        type: 'rest',
        url : 'annotationSchema/getSchemaForClient',
        reader:
        {
            type: 'xml',
            record: 'annotationSchemas'
        }
    }
});

