Ext.define('CR.app.model.AnnotationListModel',{
    extend: 'CR.app.model.CRModelBase',
    fields: [
        {name: 'span', type:'string'},
        {name: 'creationDate', type:'string'},
        {name: 'clinicalElementName', type:'string'},
        {name: 'clinicalElementId', type:'string'},
        {name: 'schemaRef', type:'string'},
        {name: 'type', type:'string'},
        {name: 'spanStart', type:'int'}
    ]
});
