/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TestGridContextMenu', {
    extend : 'Ext.menu.Menu',
    xtype  : 'testgridcontextmenu',

    items : [
        {
            itemId : 'uncheckOthers',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('uncheckOthersText')
        },
        {
            itemId : 'uncheckAll',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('uncheckAllText')
        },
        {
            itemId : 'checkAll',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('checkAllText')
        },
        {
            itemId : 'runThis',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('runThisText')
        },
        { xtype   : 'menuseparator' },
        {
            itemId : 'expandAll',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('expandAll')
        },
        {
            itemId : 'collapseAll',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('collapseAll')
        },
        { xtype   : 'menuseparator' },
        {
            itemId : 'filterToCurrentGroup',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('filterToCurrentGroup')
        },
        {
            itemId : 'filterToFailed',
            text   : Siesta.Resource('Siesta.Harness.Browser.UI.Viewport').get('filterToFailed')
        }
    ]
})
