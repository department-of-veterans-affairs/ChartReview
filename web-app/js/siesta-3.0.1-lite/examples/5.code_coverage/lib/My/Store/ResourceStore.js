Ext.define('My.Store.ResourceStore', {
    extend          : 'Ext.data.Store',
    
    fields          : [ 'id', 'name' ],
    
    proxy           : 'memory',
    
    someMethod : function () {
        return 'value'
    }
})    
