Ext.define('CR.app.model.AnnotationTaskModelByTaskId', {
    extend: 'CR.app.model.CRModelBase',
    fields: ['task'],
    proxy: {
        type: 'rest',
        url : 'annotation/getTaskByTaskId',
        reader:
        {
            type: 'xml',
            record: 'tasks'
        }
    }
});