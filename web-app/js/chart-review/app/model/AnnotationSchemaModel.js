Ext.define('CR.app.model.AnnotationSchemaModel', {
    extend: 'Ext.data.Model',
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

