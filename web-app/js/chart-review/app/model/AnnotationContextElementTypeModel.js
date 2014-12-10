// This model is for use in the grid only, not for communication with the server.
// Currently the getTasks xml and this task definition do not match exactly,
// so we just bring in the xml nodes and then parse them into a dynamic dom structure
// to use in AnnotationNatureController.
Ext.define('CR.app.model.AnnotationContextElementTypeModel',{
    extend: 'Ext.data.Model',
    fields: [
        {name: 'name', type:'string'},
        {name: 'typeId', type:'string'},
        {name: 'typeName', type:'string'},
        {name: 'allowAnnotation', type:'string'},
        {name: 'sequence', type:'string'}
    ]
});