Ext.define('CR.app.model.AnnotationContextClinicalElementLoaderModel', {
    extend: 'CR.app.model.CRModelBase',
    proxy: {
        type: 'rest',
        url: 'clinicalElementByContextElementId',
        reader:
        {
            type: 'xml',
            record: 'clinicalElements',
            rootProperty: 'getClinicalElementsByContextElementId'
        }
        ,
        hasMany: [
            {model: 'ContextClinicalElement', name: 'clinicalElements'}
        ]
    }
});