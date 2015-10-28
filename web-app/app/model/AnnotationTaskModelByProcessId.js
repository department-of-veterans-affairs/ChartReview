Ext.define('CR.app.model.AnnotationTaskModelByProcessId', {
    extend: 'CR.app.model.CRModelBase',
    fields: ['task'],
    proxy: {
        type: 'rest',
        url : 'annotation/getTask',
        reader:
        {
            type: 'xml',
            record: 'tasks'
        }
    }
});