Ext.define('CR.app.view.AnnotationListButtonToolbar',
{
    id: 'annotationlistbuttontoolbar',
    itemId: 'annotationlistbuttontoolbar',
    alias: 'widget.annotationlistbuttontoolbar',
	extend: 'Ext.toolbar.Toolbar',
	requires: ['Ext.button.Button','CR.app.controller.AnnotationNatureController'],
    scrollable: false,
	layout: 'hbox',
    defaults:{margins:'0 20 0 0'},
    items: [
        	{
        		xtype: 'cycle',
        		showText: true,
                margin:'2 1 1 2',
        		tooltip: 'Filter Annotations to All selected Task annotations or selected Document annotations only',
    		    menu: {
    		        id: 'level-menu',
    		        items: [{
    		            text: 'All Annotations',
        		        checked: true
    		        },{
    		            text: 'Selected Document Annotations'
    		        }]
    		    },
    		    listeners:{
		   		    change: function(cycleBtn, activeItem) {
		   		    	if(activeItem.itemIndex == 0)
		   		    	{
			   		    	CR.app.controller.AnnotationNatureController.setShowAllAnnotationsForSelectedTask(true);
		   		    	}
		   		    	else
		   		    	{
			   		    	CR.app.controller.AnnotationNatureController.setShowAllAnnotationsForSelectedTask(false);
		   		    	}
		   				CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationListFilterTypeChangedByUser');
				    }
        		}
        	},
            {
        		xtype: 'button',
        		iconCls: 'filterShow',
        		iconAlign: 'left',
                margin:'2 1 1 2',
        		tooltip: 'Show column Filters',
        		handler: function(btn) {
                    var annotationList = Ext.ComponentQuery.query('[id=annotationlist]')[0];
                    var data = Ext.encode(annotationList.filters.getFilterData());
                    if(data.length > 2)
                    {
                        Ext.MessageBox.alert('Column Filters', data);
                    }
                    else
                    {
                        Ext.MessageBox.alert('Column Filters', 'Add a column filter through the column drop-down menu.');
                    }
        		}
        	},
            {
        		xtype: 'button',
        		iconCls: 'filterDelete',
        		iconAlign: 'left',
                margin:'2 1 1 2',
        		tooltip: 'Clear column Filters',
        		handler: function(btn) {
                    var annotationList = Ext.ComponentQuery.query('[id=annotationlist]')[0];
        			annotationList.filters.clearFilters();
        		}
        	},
            {
                xtype: 'button',
                iconCls: 'annotationDelete',
                iconAlign: 'left',
                margin:'2 1 1 2',
                tooltip: 'Delete selected Annotations',
                disabled: CR.app.model.CRAppData ? (CR.app.model.CRAppData.readOnly ? true : false) : false,
                handler: function(btn) {
                    var annotationList = Ext.ComponentQuery.query('[id=annotationlist]')[0];
                    annotationList.deleteSelectedAnnotation();
                }
            },
            {
                xtype: 'button',
                iconCls: 'annotationsRefresh',
                iconAlign: 'left',
                margin:'2 1 1 2',
                tooltip: 'Refresh the Annotations list with feature edits.',
                handler: function(btn) {
                    var annotationList = Ext.ComponentQuery.query('[id=annotationlist]')[0];
                    annotationList.refreshAnnotationList(false);
                }
            },
            {
                text: 'Wrap',
                iconCls: 'gridDetail',
                iconAlign: 'left',
                margin:'2 1 1 2',
                tooltip: 'Wrap the grid text.',
                enableToggle: true,
                pressed: true,
                scope: this,
                toggleHandler: function(btn, pressed) {
                    var annotationList = Ext.ComponentQuery.query('[id=annotationlist]')[0];
                    annotationList.setUserWrapChoice(pressed);
                }
            }
        ],
	initComponent: function() {
		this.callParent();
	}
});
