StartTest(function (t) {
    var store = Ext.create('Ext.data.TreeStore', {
        root : {
            expanded : true,
            children : [
                {
                    text     : 'Ext JS',
                    expanded : false,
                    children : [
                        {
                            text     : 'Abstract Classes',
                            leaf     : false,
                            expanded : true,
                            children : []
                        },
                        {
                            "text" : "PluginManager.js",
                            "leaf" : true
                        },
                        {
                            "text" : "XTemplate.js",
                            "leaf" : true
                        },
                        {
                            "text" : "FocusManager.js",
                            "leaf" : true
                        },
                        {
                            "text" : "Layer.js",
                            "leaf" : true
                        },
                        {
                            "text" : "AbstractPlugin.js",
                            "leaf" : true
                        },
                        {
                            "text" : "AbstractManager.js",
                            "leaf" : true
                        },
                        {
                            "text" : "Action.js",
                            "leaf" : true
                        },
                        {
                            "text" : "Template.js",
                            "leaf" : true
                        },
                        {
                            "text" : "ZIndexManager.js",
                            "leaf" : true
                        },
                        {
                            "text" : "Shadow.js",
                            "leaf" : true
                        }
                    ]
                }
            ]
        }
    });

    var tree = Ext.create('Ext.tree.Panel', {
        store      : store,
        viewConfig : {
            plugins : 'treeviewdragdrop'
        },
        renderTo   : Ext.getBody(),
        height     : 300,
        width      : 250,
        title      : 'Files'
    });

    t.chain(
        { click : 'treepanel[title=Files] => .x-grid-cell:contains(Ext JS) .x-tree-elbow-end-plus' },
        { drag  : 'treepanel[title=Files] => .x-grid-cell:contains(AbstractManager)', to : '.x-grid-cell:contains(Abstract Classes)' },
        { drag  : 'treepanel[title=Files] => .x-grid-cell:contains(AbstractPlugin)', to : '.x-grid-cell:contains(Abstract Classes)' },

        function () {
            t.is(store.getRootNode().firstChild.firstChild.childNodes.length, 2, '2 nodes moved');
        }
    );
})
;