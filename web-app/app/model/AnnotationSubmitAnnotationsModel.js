Ext.define('CR.app.model.AnnotationSubmitAnnotationsModel', {
//    requires: ['CR.app.model.AnnotationSubmitAnnotationsModelProxyWriter'],
    extend: 'CR.app.model.CRModelBase',
    proxy: {
        type: 'rest',
        url : 'annotation/submitAnnotations',
        writer: Ext.create('CR.app.model.AnnotationSubmitAnnotationsModelProxyWriter')
    }
});
