Ext.define('CR.app.model.AnnotationContextClinicalElementLoaderModel', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'rest',
        url: 'clinicalElementByContextElementId',
        reader:
        {
            type: 'xml',
            record: 'clinicalElements',
            root: 'getClinicalElementsByContextElementId'
        }
        ,
        hasMany: [
            {model: 'ContextClinicalElement', name: 'clinicalElements'}
        ]
    }
});