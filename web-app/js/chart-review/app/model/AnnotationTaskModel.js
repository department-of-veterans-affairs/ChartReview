Ext.define('CR.app.model.AnnotationTaskModel', {
    extend: 'Ext.data.Model',
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