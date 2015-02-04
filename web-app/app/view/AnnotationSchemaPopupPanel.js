Ext.define('CR.app.view.AnnotationSchemaPopupPanel',
{
    id: 'annotationschemapopuppanel',
    itemId: 'annotationschemapopuppanel',
    alias: 'widget.annotationschemapopuppanel',
    extend: 'Ext.tree.Panel',
    mixins: {
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
////    store: {type: 'annotationschemapanelstore'},
////	store: Ext.create('CR.app.store.AnnotationSchemaPanelStore'),
    requires: ['Ext.data.*', 'Ext.tree.*'],
////	rootVisible: false,
////	singleExpand: false,
////    viewConfig: {
////        plugins: [{
////            ptype: 'treeviewdragdrop'
////        }]
////    },
////    layout:
////    {
////        type: 'vbox',
////        align: 'stretch',
////        padding: '0 0 0 0'
////    },
////    height: 50,
////    autoScroll: true,
////    scroll: 'vertical',
    flex: 60,
    split: true,
    border: true,
////    collapsible: true,
////    bodyStyle:
////    {
////        borderWidth: 2,
////        borderColor: "#000000"
////    },
    listeners: {
        itemcontextmenu: function (panel, record, item, index, e) {
            // Adding this allows deselect
            this.getSelectionModel().deselect(index);
        },
////    	resize: function() {
////    		alert("CR.app.view.AnnotationSchemaPanel resize");
////    	},
////        select: function() {
////            var i = 0;
////        },
////        deselect: function() {
////            var j = 0;
////        },
        beforerender: function () {
            this.loadSelectedSchema();
        },
        afterrender: function () {
            var borderColor = this.getEl().getColor('color');
            Ext.apply(this,
                {
                    bodyStyle: {
                        borderWidth: 2,
                        borderColor: borderColor
                    }
                });
        },
        render: function (v) {
            if (!this.annotationAwareInitialized) {
                this.initAnnotationAwareness();
            }
        },
        itemdblclick: function () {
            this.up('window').fireEvent('classificationChosen', this.getSelectedSchemaElement());
            this.up('window').close();
        }
    },
    getSelectedSchemaElement: function()
    {
        var schemaElement = null;
        var selMdl = this.getSelectionModel();
        if (selMdl) {
            var selections = selMdl.selected;
            if (selections) {
                for (i = 0; i < selections.items.length; i++) {
                    var selection = selections.items[i];
                    if (selection && selection.data && selection.data.srcNode) {
                        schemaElement = selection.data.srcNode;
                    }
                }
            }
        }
        return schemaElement;
    },
    initAnnotationSchemaPanelCSS: function () {
        Ext.util.CSS.createStyleSheet(
                '.testLeaf  { '
                + 'background-image: url(\'images/classDef.gif\') !important;'
                + 'background-repeat: no-repeat !important;'
                + 'background-position: center 0px !important;'
                + 'background-size: cover;'
                + '}'
            , 'testLeafId'
        );
        Ext.util.CSS.createStyleSheet(
                '.testBranch  { '
                + 'background-image: url(\'images/classDef.gif\') !important;'
                + 'background-repeat: no-repeat !important;'
                + 'background-position: center 0px !important;'
                + 'background-size: cover;'
                + '}'
            , 'testBranchId'
        );
    },

    schemaName: 'Schema',
    schemaClasses: [], // Classes
    schemaAttributes: [], // Attributes
    schemaClassRels: [], // Class Relationships.

    /**
     * The schema brought in from AnnotationAdmin needs to be reshuffled with attributes that item the TreePanel.
     */
    loadSelectedSchema: function () {
        var me = this;
        this.schemaName = CR.app.controller.AnnotationNatureController.schemaName;
        this.schemaClasses = CR.app.controller.AnnotationNatureController.classes;
        this.schemaAttributes = CR.app.controller.AnnotationNatureController.attributes;
        this.schemaClassRels = CR.app.controller.AnnotationNatureController.classRels;

        // Clear all class and attribute elements as ready to process.
        for (key in this.schemaClasses) {
            this.schemaClasses[key]['processed'] = false;
        }
        for (key in this.schemaAttributes) {
            this.schemaAttributes[key]['processed'] = false;
        }
        var children = [];

        var childToSelect = null;
        // Add all classes and subclasses / subattributes
        for (key in this.schemaClasses) {
            var clazz = this.schemaClasses[key];
            if (!clazz['processed']) {
                var child = this.getChildFromNode(clazz);
                children.push(child);
//                var schemaElement = this.up('window').schemaElement;
//                if(schemaElement && schemaElement == clazz)
//                {
////                var record = this.getStore().getNodeById(schemaElement.id);
////                    var idx = this.getStore().indexOf(schemaElement);
////                    var child = this.getChildFromNode(schemaElement);
////                    var node = this.getStore().getNodeById(schemaElement.id);
////                    this.getSelectionModel().select(schemaElement);
////                    node.select();
//                    childToSelect = child;
//                }
            }
        }

        // Add all remaining attributes
//		for(key in this.schemaAttributes)
//		{
//			var attribute = this.schemaAttributes[key];
//			if(!attribute['processed'])
//			{
//				children.push(this.getChildFromNode(attribute));
//			}
//		}

        var root = {
            text: this.schemaName,
            expanded: true
        };
        root.children = children;
        this.store.setRootNode(root);
        this.selModel.deselectAll(false);
        this.store.proxy.reader.read(CR.app.controller.AnnotationNatureController.getSelectedSchema());
//        this.selModel.select(childToSelect);
    },

    getChildFromNode: function (node) {
        node['processed'] = true;
        var child = {};
        var color = CR.app.view.AnnotationSchemaPanel.convertToPoundSpecification(node['color']);
        child.text = "<text style='background-color:" + color + "'>" + node['name'] + "</text>";
        child.name = node['name'];
        child.type = node.tagName;
        child.srcNode = node;
        child.color = color;
        if ((node['classDefIds'] && node['classDefIds'].length > 0) /*|| (node['attributeDefIds'] && node['attributeDefIds'].length>0)*/) {
            // This is a branch.
            var subchildren = [];
            if (node['classDefIds']) {
                for (key in node['classDefIds']) {
                    var cid = node['classDefIds'][key];
                    var subclazz = this.schemaClasses[cid];
                    if (subclazz) {
                        subchildren.push(this.getChildFromNode(subclazz));
                    }
                }

            }
//			if(node['attributeDefIds'])
//			{
//				for(key in node['attributeDefIds'])
//				{
//					var aid = node['attributeDefIds'][key];
//					var subattribute = this.schemaAttributes[aid];
//					if(subattribute)
//					{
//						subchildren.push(this.getChildFromNode(subattribute));
//					}
//				}
//
//			}
            if (subchildren.length > 0) {
                child.expanded = true;
                child.children = subchildren;
                child.iconCls = 'testBranch';
                //child.style = "background-color:'yellow'";
                //child.icon = 'monkey.ico';
            }
            else {
                child.leaf = true;
                child.iconCls = 'testLeaf';
                //child.icon = 'js/icons/rabbit.ico';
                //child.iconCls = '{background-color:#352788; width:15px; height:15px; background-image:none}';
            }
        }
        else {
            // This is a leaf.
            child.leaf = true;
            child.iconCls = 'testLeaf';
            //child.icon = 'js/icons/rabbit.ico';
            //child.iconCls = '{background-color:#352788; width:15px; height:15px; background-image:none}';
        }
        return child;
    },

    statics: {
        convertToPoundSpecification: function (color) {
            if (!color) {
                return '#FFFFFF';
            }
            else if (color.indexOf('#') == 0) {
                // Do nothing.
            }
            else if (color && new String(color).indexOf('0x') > -1) {
                color = '#' + new String(color).substring(2);
            }
            else if (color.length == 6 && color.indexOf('#') == -1) {
                color = '#' + color;
            }
            return color;
        }
    }
});