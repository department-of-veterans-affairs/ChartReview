Ext.define('CR.app.model.AnnotationListModel',{
    extend: 'Ext.data.Model',
    fields: [
        {name: 'span', type:'string'},
        {name: 'creationDate', type:'string'},
        {name: 'clinicalElementName', type:'string'},
        {name: 'clinicalElementId', type:'string'},
        {name: 'schemaRef', type:'string'},
        {name: 'type', type:'string'},
        {name: 'spanStart', type:'int'},
        {name: 'feature1', type:'string'},
        {name: 'feature2', type:'string'},
        {name: 'feature3', type:'string'},
        {name: 'feature4', type:'string'},
        {name: 'feature5', type:'string'},
        {name: 'feature6', type:'string'},
        {name: 'feature7', type:'string'},
        {name: 'feature8', type:'string'},
        {name: 'feature9', type:'string'},
        {name: 'feature10', type:'string'},
        {name: 'feature11', type:'string'},
        {name: 'feature12', type:'string'},
        {name: 'otherFeatures', type:'string'}
    ]
});
