Ext.define('CR.app.model.AnnotationSchemaModel', {
    extend: 'CR.app.model.CRModelBase',
    fields: ['schema'],
    proxy: {
        type: 'rest',
        url : 'schema/getSchema',
        reader:
        {
            type: 'xml',
            record: 'annotationSchemas'
        }
    }
});

