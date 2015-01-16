// This model is for use in the grid only, not for communication with the server.
// Currently the getTasks xml and this task definition do not match exactly,
// so we just bring in the xml nodes and then parse them into a dynamic dom structure
// to use in AnnotationNatureController.
Ext.define('CR.app.model.AnnotationTaskListModel',{
    extend: 'CR.app.model.CRModelBase',
    fields: [
        {name: 'id', type:'string'},
        {name: 'name', type:'string'},
        {name: 'principalClinicalElementId', type:'string'},
        {name: 'id', type:'string'},
        {name: 'type', type:'string'},
        {name: 'task', type:'string'},
        {name: 'taskId', type:'string'},
        {name: 'isContext', type:'string'},
        {name: 'clinicalElementTaskId', type:'string'},
        {name: 'sequence', type:'string'},
        {name: 'status', type:'string'},
        {name: 'dateCompleted', type:'string'},
        {name: 'schemaId', type:'string'}
    ],
    hasMany: {model: 'ContextElementTypeModel', name: 'contextElementTypes'}
});

