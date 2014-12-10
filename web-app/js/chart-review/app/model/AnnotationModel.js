Ext.define('CR.app.model.AnnotationModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string', mapping: '@id'},
        {name: 'name', type: 'string'}
    ]
});

