/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.Model.AssertionTreeStore', {
    extend          : 'Ext.data.TreeStore',

    model   : 'Siesta.Harness.Browser.Model.Assertion',

    mixins          : [
        'Sch.data.mixin.FilterableTreeStore'
    ],

    constructor     : function () {
        this.callParent(arguments)
        
        this.initTreeFiltering()
    },
    
    
    removeAll : function () {
        var newRoot = this.setRootNode({
            id              : '__ROOT__',
            expanded        : true,
            loaded          : true
        })
    },
    
    
    add : function (record) {
        this.getRootNode().appendChild(record)
    }
})