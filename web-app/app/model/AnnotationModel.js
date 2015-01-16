Ext.define('CR.app.model.AnnotationModel', {
    extend: 'CR.app.model.CRModelBase',
    fields: [
        {name: 'id', type: 'string', mapping: '@id'},
        {name: 'name', type: 'string'}
    ]
});

