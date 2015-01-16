// NOTE: Not used in this version - where task is chosen outside of extjs5 app page and passed in as html parameter.
Ext.define('CR.app.view.AnnotationTaskList', {
    id: 'tasklistpanel',
    itemId: 'annotationtasklist',
    alias: 'widget.tasklist',
	requires: ['Ext.data.*','Ext.grid.*','Ext.form.*','Ext.grid.property.Grid','Ext.grid.plugin.CellEditing'],
    extend: 'Ext.grid.Panel',
	mixins: {
		annotationaware: 'CR.app.controller.AnnotationNatureController'
	},
    store: {type: 'annotationtaskliststore'},
//    store: Ext.create('CR.app.store.AnnotationTaskListStore'),
    scrollable: true,
    stripeRows: true,
	disableColumnEvents: false,
    margins: '5 5 0 5',
    flex: 100,
    columns: [
//		{ header: 'ClinicalElement ID',  dataIndex: 'id' },
		{ header: 'ClinicalElement', dataIndex: 'clinicalElementTask' },
		{ header: 'Task', dataIndex: 'name' },
		{ header: 'Status', dataIndex: 'status', 
			renderer: function(value){
		        if (value == 'completed') {
		            return 'Completed';
		        }
		        if (value == 'todo') {
		            return 'To-Do';
		        }
		        if (value == 'onhold') {
		            return 'On Hold';
		        }
		        if (value == 'skip') {
		            return 'Skip';
		        }
		        
		        return value + 'people';
		    },
		    editor: 
			{
			xtype: 'combobox',
			allowBlank: false,
			store: 
		    	Ext.create('Ext.data.Store', {
		    	    fields: ['abbr', 'name'],
		    	    data : [
		    	        {"abbr":"To-Do", "name":"todo"},
		    	        {"abbr":"Completed", "name":"completed"},
		    	        {"abbr":"On Hold", "name":"onhold"},
		    	        {"abbr":"Skip", "name":"skip"}
		    	    ]
		    	}),
		    	
		    queryMode: 'local',
		    displayField: 'abbr',
		    valueField: 'name',
		    listeners:
			    {
			    	change: function(thisEditor, newVal, oldVal)
			    	{
			    		//alert('Changed from '+oldVal+' to '+newVal);
			    		var anlt = CR.app.controller.AnnotationNatureController.selectedClinicalElement;
			    		if(anlt && newVal && (newVal!=oldVal) && anlt.id)
			    		{
			    			CR.app.controller.AnnotationNatureController.principalClinicalElementsById[anlt.id].status = newVal;
			    		}	
			    	}
			    }
			}
		},
		{ header: 'Project', dataIndex: 'projectName'}
    ],
    plugins: [
              Ext.create('Ext.grid.plugin.CellEditing', {
                  clicksToEdit: 1
              })
          ],
    selRec: null,
    listeners: {
    	render: function() {
    		var me = this;
    		
         	// setup an event handler on the selection model
            me.getSelectionModel().on('select', function(model, rec) {
                var rowidx = arguments[2];                
                // TODO: Change selected task and fire listeners.
            });
            me.refreshTaskList();
    	},
    	select: function( rowModel, record,  index,  eOpts )
    	{
    		this.selRec = record;

            // Note we pass RAW here because the record.data is an object that does not contain the
            // proper definition for context element types.  We have used a grid-only data structure for
            // Tasks - it does not contain context element types, but the raw dom object does...
            CR.app.controller.AnnotationNatureController.setSelectedPrincipalClinicalElement(record.raw);

            // The annotation list will fill in with annotations from the clinicalElementIds of the
            // components that have an clinicalElementId set.  Since we are not guaranteed to have
            // a principal clinicalElement portlet open, we set this list as having an clinicalElementId
            // of the selected principal clinicalElement so that it will be certain to be in the
            // list of clinicalElements whose annotations may be shown in the annotations list.
            this.clinicalElementId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.id;

			CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('principalClinicalElementSelectedByUser');
    	},
        principalClinicalElementLoaded: function()
        {
            // This happens after the tasks and schema have been loaded, after the principal clinical element has been created from the first (or only) given task
            // and after the annotations for the principal clinical element have benn loaded.
            //
            // NOTE: This is where a principal clinical element gets auto-selected in the current design
            // which does not dispay this tasks list to the user.  The selected principal clinical element gets
            // set after the schema has been loaded, in setTaskAux.  This event is fired there and this
            // component sets that principal clinical element id as its clinical element, so the annotations
            // fill will find the principal clinical element set on some component when it goes to fill the
            // list.
            //
            // The annotation list will fill in with annotations from the clinicalElementIds of the
            // components that have an clinicalElementId set.  Since we are not guaranteed to have
            // a principal clinicalElement portlet open, we set this list as having an clinicalElementId
            // of the selected principal clinicalElement so that it will be certain to be in the
            // list of clinicalElements whose annotations may be shown in the annotations list.
            this.clinicalElementId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.id;

            // Now that the principal clinical element has been loaded and set as the clinicalElementId on a component,
            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('principalClinicalElementSelectedAutomatically');
            this.refreshTaskList();
        }
    },
    refreshTaskList: function()
    {
    	var clinicalElements = [];
    	for(key in CR.app.controller.AnnotationNatureController.principalClinicalElementsById)
    	{
    		clinicalElements.push(CR.app.controller.AnnotationNatureController.principalClinicalElementsById[key]);
    	}
    	this.store.proxy.timeout = 100000000;
    	this.store.loadData(clinicalElements);
    },
    constructor: function(config) {
      this.callParent(config);
      this.mixins.annotationaware.constructor.call(this);
    }
});
