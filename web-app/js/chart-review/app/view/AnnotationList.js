Ext.define('CR.app.view.AnnotationList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.annotationlist',
    requires: ['Ext.data.*','Ext.grid.*','Ext.grid.property.Grid'],
	mixins: {
		annotationaware: 'CR.app.controller.AnnotationNatureController'
	},
	store: Ext.create('CR.app.store.AnnotationListStore'),
    features: [{ftype: 'filters', encode: false, local: true},
        {ftype: 'grouping',
            groupHeaderTpl: '{name} ({rows.length})', //print the number of items in the group
            startCollapsed: false // start all groups collapsed
        }
    ],
    multiSelect: true,
    autoScroll: true,
    stripeRows: true,
	disableColumnEvents: false,
	gridAdvisor: null,
	grouping: true,
	hideHeaders: false,
	selType: 'rowmodel',
    collapseGridIfEmpty: false, // if collapsible is true, then automatically collapse the grid if there are no rows
    collapsible: false,
    collapsed: false,
    animCollapse: false,
    titleCollapse: true,
    userWrapChoice: true,

    // FOR DYNAMIC COLUMN CREATION - Initial column layout - this will change dynamically to include annotation features as columns,
    // as will the store model.
    // NOTE DYNAMIC COLUMN CREATION IS NOT WORKING VERY WELL.
    // The problem I could not get past was that the first row in the loaded grid did not fire a doSelect event when
    // I created the columns dynamically.  This was true if my starting static columns were at all different than
    // the dynamic columns.  The grid would not build if it did not have starting static columns defined.
    // Chose to use 12 reusable, static feature columns and a catch all otherFeatures column in stead for the
    // NOTE - If I put the rendering in a class function and pointed the renderer to the function, it did not work except for the first column, but if I included the function in-line, it worked for all columns...
    columns: [
          	{ header: 'Span', id: 'theSpan', dataIndex: 'span', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, showInGroups: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}}},
            { header: 'ClinicalElement Id', id: 'clinicalElementId',  dataIndex: 'clinicalElementId', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Class', id: 'schemaRef',  dataIndex: 'schemaRef', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Type', id: 'type', dataIndex: 'type', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Creation Date', id: 'creationDate',  dataIndex: 'creationDate', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'date'}, xtype: "datecolumn", renderer:function(value){var date = new Date(value);if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}}},
            { header: 'ClinicalElement Name', id: 'clinicalElementName',  dataIndex: 'clinicalElementName', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}}},
            { header: 'Feature 1', id: 'feature1', dataIndex: 'feature1', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}}},
            { header: 'Feature 2', id: 'feature2', dataIndex: 'feature2', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}}},
            { header: 'Feature 3', id: 'feature3', dataIndex: 'feature3', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 4', id: 'feature4', dataIndex: 'feature4', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 5', id: 'feature5', dataIndex: 'feature5', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 6', id: 'feature6', dataIndex: 'feature6', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 7', id: 'feature7', dataIndex: 'feature7', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 8', id: 'feature8', dataIndex: 'feature8', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 9', id: 'feature9', dataIndex: 'feature9', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 10', id: 'feature10', dataIndex: 'feature10', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 11', id: 'feature11', dataIndex: 'feature11', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Feature 12', id: 'feature12', dataIndex: 'feature12', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Other Features', id: 'otherFeatures', dataIndex: 'otherFeatures', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} }
    ],
    selRec: null,
    curAnnotations: [],  // Current, unfiltered annotations list.
    doBroadcastNextAnnotationSelection: true,
    listeners: {
    	render: function() {
    		var me = this;

         	// setup an event handler on the selection model
            me.getSelectionModel().on('select', function(model, rec) {
                var rowidx = arguments[2];
                // TODO: Highlight selected clinicalElement in view.
                // TODO: IF we move to loading annotations for stuff not shown, we may want to zoom-to the annotation.
                // TODO: Maybe we want to do the zooming anyway, if the clinicalElement it belongs to needs to scroll to show the clinicalElement.
            });
            // Tried adding via listeners below, but never worked until I did it this way.
            this.body.on('keypress', function(e){
            	// Tested on FF, Chrome, and Safari.
            	// All three repored '-' as keyCode 45.
            	if(e.keyCode==45)
            	{
            		me.deleteSelectedAnnotation();
            	}
            });
    	},
        beforeSync: function()
        {
            this.refreshAnnotationList();
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
//        schemaLoaded: function()
//        {
//            // NOTE THIS METHOD IS USED IN DYNAMIC COLUMN CREATION WHICH IS NOT WORKING VERY WELL.
////            var attributes = CR.app.controller.AnnotationNatureController.getAllSchemaAttributes();
////            this.doReconfigureIfNecessary(attributes);
//            this.refreshAnnotationList();
//            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
//        },
        principalClinicalElementLoaded: function()
        {
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        clinicalElementSelectedByUser: function()
        {
            this.refreshAnnotationList(false); // Do not broadcast the auto-select of the currently selecting annotation to other components during on this event, especially the grid component that sent this event, because it will potentially change the user's selection in that component.
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        portletClosed: function()
        {
            // The list of annotations displayed could be different, depending upon the annotation filter type...
            this.refreshAnnotationList();
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        annotationListFilterTypeChangedByUser: function()
        {
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        annotationCreatedByUserTextLevel: function()
        {
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        annotationSelectedByUserTextLevel: function()
        {
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        annotationCreatedByUserRecordLevel: function()
        {
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        annotationSelectedByUserRecordLevel: function()
        {
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
        annotationSelectionBlur: function()
        {
            CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
            this.refreshAnnotationList(true);
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectedByUserInList');
        }
    },

    /**
     * NOTE THIS METHOD IS USED IN DYNAMIC COLUMN CREATION WHICH IS NOT WORKING IN EXTJS4 VERY WELL.
     * Save this, because it is a more elegant way, if I have time to mess with it later.
     * It would be called in schemaChanged listener, before the refresh.
     * @param attributes
     * @returns {Ext.data.Store}
     */
    doReconfigureIfNecessary: function(attributes){
        // Reconfigure the grid to show all of the schema attributes.
        var columns = this.getDynamicColumns(attributes);
        if(!this.columnListsAreEqual(columns, this.headerCt.items.items))
        {
            var str = this.getAnnotationsStore(attributes);
            this.reconfigure(str, columns);
            this.show();
        }
    },

    /**
     * NOTE THIS METHOD IS USED IN DYNAMIC COLUMN CREATION WHICH IS NOT WORKING VERY WELL.
     * Save this, because it is a more elegant way, if I have time to mess with it later.
     * The problem I could not get past was that the first row in the loaded grid did not fire a doSelect event when
     * I created the columns dynamically.  This was true if my starting static columns were at all different than
     * the dynamic columns.  The grid would not build if it did not have starting static columns defined.
     * Chose to use 12 reusable, static feature columns and a catch all otherFeatures column in stead for the
     * first 12 features and any more after that.
     * @param attributes
     * @returns {Ext.data.Store}
     */
    getDynamicColumns: function(attributes){
        var columns = [];
        // Defaults
        var unorderedNewColumns = [
            { header: 'Span', id: 'theSpan', dataIndex: 'span', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, showInGroups: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Creation Date', id: 'creationDate',  dataIndex: 'creationDate', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'date'}, xtype: "datecolumn", renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', Ext.Date.format(value, 'Y/m/d G:i'))}} },
            { header: 'ClinicalElement Name', id: 'clinicalElementName',  dataIndex: 'clinicalElementName', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'ClinicalElement Id', id: 'clinicalElementId',  dataIndex: 'clinicalElementId', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Class', id: 'schemaRef',  dataIndex: 'schemaRef', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Type', id: 'type', dataIndex: 'type', minWidth:80, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} }
        ];
        if(attributes)
        {
            // Add columns from clinical element def
            for(var i = 0; i < attributes.length; i++)
            {
                var attribute = attributes[i];
                var filterDef = {};
                switch(attribute.attributeDef.type)
                {
                    case "" + CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_TEXT:
                    case "" + CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_BLOB:
                        filterDef = {type:'string'};
                        break;
                    case "" + CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_OPTION:
                        var options = [];
                        for (key1 in attribute.attributeDef.options)
                        {
                            var option = attribute.attributeDef.options[key1];
                            options.push(option);
                        }
                        filterDef = {
                            type:'list',
                            options: options,
                            phpMode: true
                        };
                        break;
                    case "" + CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_NUMERIC:
                        filterDef = {type:'numeric'};
                        break;
                    case "" + CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_DATE:
                        filterDef = {type:'date'};
                        break;
                    // case CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_DATE. // Not a valid attribute type... future
//                        filterDef = {type:'numeric'};
//                        renderer = function(value){var date = new Date(value);if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}};
//                        break;
                }
                var column = {
                    text: attribute.attributeDef.name,
                    dataIndex: attribute.attributeDef.name,
                    hidden: false,
                    flex: 1,  // expand or contract columns equally with grid width until manually changed
                    renderer: function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}},
                    filterable: true,
                    filter:filterDef,
                    lockable: true
                }
                unorderedNewColumns.push(column);
            }
        }
        // Add all of the new columns that are in the current columns, in their current order.
        var curColumns = this.columnManager.columns; // This does not get filled in until later in the rendering, but it has the non-default ordering, so use it if possible.
        if(!curColumns)
        {
            curColumns = this.columns;
        }
        for(colIdx1 in curColumns)
        {
            var curCol = curColumns[colIdx1];
            for(colIdx2 in unorderedNewColumns)
            {
                var unorderedNewColumn = unorderedNewColumns[colIdx2];
                if(curCol.dataIndex == unorderedNewColumn.dataIndex)
                {
                    columns.push(unorderedNewColumn);
                    break;
                }
            }
        }
        // Add all new columns that are not in the current columns.
        for(colIdx1 in unorderedNewColumns)
        {
            var unorderedNewColumn = unorderedNewColumns[colIdx1];
            var found = false;
            for(colIdx2 in columns)
            {
                var newColumn = columns[colIdx2];
                if(unorderedNewColumn.dataIndex == newColumn.dataIndex)
                {
                    found = true;
                    break;
                }
            }
            if(!found)
            {
                columns.push(unorderedNewColumn);
            }
        }
        return columns;
    },

    /**
     * NOTE THIS METHOD IS USED IN DYNAMIC COLUMN CREATION WHICH IS NOT WORKING VERY WELL.
     * Save this, because it is a more elegant way, if I have time to mess with it later.
     * @param attributes
     * @returns {Ext.data.Store}
     */
    getAnnotationsStore: function(attributes){
        // Default
        var modelName = 'TempModel';
        var modelFields = [
            {name: 'span', type:'string'},
            {name: 'creationDate', type:'string'},
            {name: 'clinicalElementName', type:'string'},
            {name: 'clinicalElementId', type:'string'},
            {name: 'schemaRef', type:'string'},
            {name: 'type', type:'string'}
        ];
        var sortInfos = [
            {property: 'clinicalElementId', type:'ASC'}
        ];

        if(attributes)
        {
            modelName = 'AnnotationListDynamicModel';

            // Add columns from all schema attributes
            columns = new Array();
            for(var i = 0; i < attributes.length; i++)
            {
                var attribute = attributes[i];
                modelField = {
                    name: attribute.attributeDef.name,
                    type: attribute.type
                }
                modelFields.push(modelField);
            }
        }

        // Model dynamically created and added to the ext by name
        // TBD - does this fill memory - does a second creation of a given
        // named model overwrite the first?
        Ext.define(modelName, {
            extend: 'Ext.data.Model',
            fields: modelFields
        });

        var store = new Ext.data.Store(
            {
                model: modelName,
                sortInfo: sortInfos,
                autoLoad: false
            });

        return store;
    },

	doSelect: function( rowModel, record,  index,  eOpts )
	{
		this.selRec = record;
		if(record && record.data && record.raw.annotation)
		{
    		CR.app.controller.AnnotationNatureController.setSelectedAnnotation(record.raw.annotation);
		}
		else
		{
    		CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
		}
        if(this.doBroadcastNextAnnotationSelection)
        {
            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectedByUserInList');
        }
        this.doBroadcastNextAnnotationSelection = true;
	},
	doDeselect: function( that, selected, eOpts )
	{
        CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectedByUserInList');
	},
	visibilityCache:[],
	columnListsAreEqual: function(columns1, columns2)
	{
		var isEqual = true;
		if(columns1 && columns2 && columns1.length == columns2.length)
		{
			for(var i = 0; i < columns1.length; i++)
			{
				var column1 = columns1[i];
				var matchFound = false;
				for(var j = 0; j < columns2.length; j++)
				{
					var column2 = columns2[j];
					if(column1.dataIndex == column2.dataIndex)
					{
						matchFound = true;
						break;
					}
				}
				if(!matchFound)
				{
					isEqual = false;
					break;
				}
			}
		}
		else
		{
			isEqual = false;
		}
		return isEqual;
	},

    selectSelectedAnnotation: function(doBroadcastSelectSelectedAnnotation)
    {
		var selAnnotation = CR.app.controller.AnnotationNatureController.getSelectedAnnotation();
	    if(selAnnotation)
	    {
    		var selItems = [];
	    	var item = this.getAnnotationItem(selAnnotation);
	    	if(item)
	    	{
	    		// The annotation stored in curAnnotations is not sufficient to put in the selItems list.  It
	    		// must be the original item from the data store.  So, make sure it is in the store and then find it for re-select.
		    	if(this.isAnnotationInFilter(selAnnotation))
		    	{
			    	var storeItem = this.getAnnotationStoreItem(selAnnotation);

			    	// These may have been updated in the annotation, but not in the list item.
			    	storeItem.data.clinicalElementDate = selAnnotation.clinicalElementDate;
                    storeItem.data.clinicalElementName = selAnnotation.clinicalElementName;
                    storeItem.data.clinicalElementId = this.getDisplayObjClinicalElementId(selAnnotation);

		    		selItems.push(storeItem);
		    	}
		    	else
		    	{
		    		// Filter is blocking - clear filters.
		    		if (confirm("Clear filters to see selected annotation?")) {
		    			this.filters.clearFilters();
				    	var storeItem = this.getAnnotationStoreItem(selAnnotation);

				    	// These may have been updated in the annotation, but not in the list item.
				    	storeItem.data.clinicalElementDate = selAnnotation.clinicalElementDate;
                        storeItem.data.clinicalElementName = selAnnotation.clinicalElementName;
                        storeItem.data.clinicalElementId = this.getDisplayObjClinicalElementId(selAnnotation);

			    		selItems.push(storeItem);
		    		}
		    	}
	    	}
//    		var rowIdx = this.store.find('')
//    		this.getView().getRow(rowIdx).scrollIntoView();
//    		var record = this.store.getNodeById(selItem.id);
//    	    var rowIndex = this.store.indexOf(record);
//	    	var selModel = this.selModel;
//	    	var theView = this.getView();
//    		if(this.rendered)
//    		{
////    			var row = this.store.data.items[0];
////    	        row.scrollIntoView();
//    	    	// NOTE: Funky - the scroll to selected only works if I do this three or four times.
//    	    	setTimeout(function(){
//    		    	var curSelItems = selModel.getSelection();
//    	    		var selItem = curSelItems[0];
//    	    		var rowIdx = selItem.index;
////    	    		new Ext.Element.Fly(this.getView().getNode(rowIdx)).scrollIntoView();
//    	    		var element = new Ext.Element(theView.getNode(rowIdx));
//    	    		element.scrollIntoView();
//        			var annotationList = Ext.ComponentQuery.query('[itemId="CR.app.view.AnnotationList"]')[0];
////        			annotationList.selModel.select(curSelItems, false, false);  // This scrolls to the selected item :) TBD - not highlighting yet.
//    	    	}, 300, selItems);
//    	    	setTimeout(function(){
//    		    	var curSelItems = this.selModel.getSelection();
//        			var annotationList = Ext.ComponentQuery.query('[itemId="CR.app.view.AnnotationList"]')[0];
//        			annotationList.selModel.select(curSelItems, false, false);  // This scrolls to the selected item :) TBD - not highlighting yet.
//    	    	}, 2000, selItems);
//    	    	setTimeout(function(){
//    		    	var curSelItems = this.selModel.getSelection();
//        			var annotationList = Ext.ComponentQuery.query('[itemId="CR.app.view.AnnotationList"]')[0];
//        			annotationList.selModel.select(curSelItems, false, false);  // This scrolls to the selected item :) TBD - not highlighting yet.
//    	    	}, 1000, selItems);
//    	    	setTimeout(function(){
//    		    	var curSelItems = this.selModel.getSelection();
//        			var annotationList = Ext.ComponentQuery.query('[itemId="CR.app.view.AnnotationList"]')[0];
//        			annotationList.selModel.select(curSelItems, false, false);  // This scrolls to the selected item :) TBD - not highlighting yet.
//    	    	}, 500, selItems);
                this.doBroadcastNextAnnotationSelection = doBroadcastSelectSelectedAnnotation;
        		this.selModel.select(selItems, false, false);  // This scrolls to the selected item :) TBD - not highlighting yet.
//    		}
	    }
    },

    getAnnotationStoreItem: function(annotation)
    {
    	var item = null;
	    for (var i = 0; i < this.store.data.items.length; i++)
	    {
	    	var tItem = this.store.data.items[i];
	        if (tItem && tItem.data && tItem.raw.annotation == annotation)
	        {
	        	item = tItem;
	            break;
	        }
	    }
	    return item;
    },

    getAnnotationItem: function(annotation)
    {
    	var ret = null;
	    for (var i = 0; i < this.curAnnotations.length; i++)
	    {
	    	var tAnnotationItem = this.curAnnotations[i];
	        if (tAnnotationItem && tAnnotationItem.annotation == annotation)
	        {
	        	ret = tAnnotationItem;
	            break;
	        }
	    }
	    return ret;
    },

    isAnnotationInFilter: function(annotation)
    {
    	var ret = false;
	    for (var i = 0; i < this.store.data.items.length; i++)
	    {
	    	var tItem = this.store.data.items[i];
	        if (tItem && tItem.data && tItem.raw.annotation == annotation)
	        {
	        	ret = true;
	            break;
	        }
	    }
	    return ret;
    },

    refreshAnnotationList: function(broadcastSelectSelectedAnnotation, forceRebuildColumns)
    {
		var selAnnotation = CR.app.controller.AnnotationNatureController.getSelectedAnnotation();
    	var annotations = CR.app.controller.AnnotationNatureControllerAnnotations.getAnnotationsForSelectedPrincipalClinicalElementByAnnotationFilterType();
    	var newList = [];
    	var attributes = [];

        var newColumnNames = [];
		if(annotations)
		{
            var nextFeatureColIdx = 1;
			for(i=0; i<annotations.length; i++)
			{
				var annotation = annotations[i];
				if(annotation)
				{
//                    var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(annotation.clinicalElementConfigurationId);
//                    var lastEqual = clinicalElementConfiguration.titleField + "=";
					var dispObj = {
							'span':(annotation.spans != null && annotation.spans.length > 0 && annotation.spans[0].text != null?(annotation.spans[0].text.length > 80?annotation.spans[0].text.substring(0,80)+'...':annotation.spans[0].text):''),
                            'creationDate':annotation.creationDate,
                            'clinicalElementName':annotation.clinicalElementName,
							'schemaRef':annotation.schemaRefName,
                            'type':(annotation.isNew?'New':'Pre'),
							'clinicalElementId': this.getDisplayObjClinicalElementId(annotation),
							'spanStart': 0,
                            'clinicalElementTask':annotation.clinicalElementTask,  // Not displayed
							'annotation':annotation                            // Not displayed
	    				};
                    if( annotation.spans.length > 0)
                    {
                        var span = annotation.spans[0];
                        dispObj.spanStart = span.textStart;
                    }

					// Display each annotation feature attribute in a separate column...
					var tAttributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForAnnotation(annotation);
                    var otherFeatures = "";
                    var firstOtherFeature = true;
					for(key in tAttributes)
					{
						var attribute = tAttributes[key];
                        var featureColIdx = 0;
                        for(j=0; j<attributes.length; j++)
                        {
                            var tAttribute = attributes[j];
                            if( tAttribute.attributeDef.id == attribute.attributeDef.id)
                            {
                                featureColIdx = j + 1;
                                break;
                            }
                        }
						if(featureColIdx <= 0) // not found
						{
							attributes.push(attribute);
						}
						var value = attribute.value;
						if(attribute.isNumeric && attribute.attributeDef.options != null)
						{
							value = attribute.attributeDef.options[attribute.value];
						}
//						dispObj[attribute.attributeDef.name] = value;  // This is what we do with a fully dynamic column creation... save
                        if(featureColIdx > 0) // found
                        {
                            var fieldName = "feature" + featureColIdx;
                            dispObj[fieldName] = value;
                        }
                        else // not found
                        {
                            if(nextFeatureColIdx <= 12) // increment next feature column up to 12
                            {
                                featureColIdx = nextFeatureColIdx;
                                nextFeatureColIdx++;

                                var fieldName = "feature" + featureColIdx;
                                dispObj[fieldName] = value;

                                // Save new column name for later - change once for all annotations.
                                newColumnNames[fieldName] = attribute.attributeDef.name;
                            }
                            else  // Put any features above 12 into the other feature column
                            {
                                if(value)
                                {
                                    if(!firstOtherFeature)
                                    {
                                        otherFeatures += "; ";
                                    }
                                    otherFeatures += attribute.attributeDef.name + "=" + value;
                                    firstOtherFeature = false;
                                }
                            }
                        }
					}
                    dispObj['otherFeatures'] = otherFeatures;
                    newList.push(dispObj);
				}
			}
		}
        // Rename the feature columns
        for(fieldName in newColumnNames)
        {
            var newColumnName = newColumnNames[fieldName];
            for(colIdx1 in this.columns)
            {
                var curCol = this.columns[colIdx1];
                if(curCol.dataIndex == fieldName)
                {
                    curCol.setText(newColumnName);
                    break;
                }
            }
        }
        // Hide the unused feature columns; un-hide the used ones.
        var hasUnusedFeatureColumns = false;
        for(colIdx1 in this.columns)
        {
            var curCol = this.columns[colIdx1];
            var found = false;
            for(fieldName in newColumnNames)
            {
                if(curCol.dataIndex == fieldName)
                {
                    found = true;
                    break;
                }
            }
            if(found)
            {
//                curCol.hidden = false;
                curCol.show();
            }
            else if(  // Don't hide the default columns...
                    !found &&
                    curCol.dataIndex != 'span' &&
                    curCol.dataIndex != 'creationDate' &&
                    curCol.dataIndex != 'clinicalElementName' &&
                    curCol.dataIndex != 'clinicalElementId' &&
                    curCol.dataIndex != 'schemaRef' &&
                    curCol.dataIndex != 'type'
                )
            {
                // Hide the unused feature columns.
//                curCol.hidden = true;
                curCol.hide();
                hasUnusedFeatureColumns = true;
            }
        }
        // Hide or unhide the otherFeatures column depending upon whether there are unused feature columns.
        for(colIdx1 in this.columns)
        {
            var curCol = this.columns[colIdx1];
            if(curCol.dataIndex == 'otherFeatures')
            {
                if(hasUnusedFeatureColumns) {
//                    curCol.hidden = true;
                    curCol.hide();
                }
                else
                {
//                    curCol.hidden = false;
                    curCol.show();
                }
                break;
            }
        }
		var allFound = true;
		var count = this.curAnnotations.length; // check unfiltered list length
		if(count != newList.length)
		{
			allFound = false;
		}
		if(!allFound)
		{
	    	for(var i=0; i < count; i++)
	    	{
	    		var annotation = this.curAnnotations[i]; // get from unfiltered list
	    		var found = false;
	    		for(var j=0; j < newList.length; j++)
	    		{
	    			var tAnnotation = newList[j];
	    			if(CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(tAnnotation.annotation, annotation.annotation))
	    			{
	    				found = true;
	    				break;
	    			}
	    		}
	    		if(!found)
	    		{
	    			allFound = false;
	    			break;
	    		}
	    	}
		}
		var changes = false;
		if(allFound)
		{
	    	for(var i=0; i < count; i++)
	    	{
	    		var annotation = this.curAnnotations[i]; // get from unfiltered list
	    		var change = false;
                var annotationFound = false;
	    		for(var j=0; j < newList.length; j++)
	    		{
	    			var tAnnotation = newList[j];

	    			if(CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(tAnnotation.annotation, annotation.annotation))
	    			{
                        // TBD - To keep the object compare from breaking on the cyclical annotation reference,
                        // temporarily break the cycle and then re-establish after the compare.
                        var tAnnotationAnnotation = tAnnotation.annotation;
                        var annotationAnnotation = annotation.annotation;
                        tAnnotation.annotation = null;
                        annotation.annotation = null;
                        var isObjectEqual = CR.app.controller.AnnotationNatureControllerAnnotations.isObjectEqual(tAnnotation, annotation);
                        tAnnotation.annotation = tAnnotationAnnotation;
                        annotation.annotation = annotationAnnotation;
                        if(!isObjectEqual)
                        {
                            change = true;
                            break;
                        }
                        annotationFound = true;
	    			}
	    		}
	    		if(change || !annotationFound)
	    		{
	    			changes = true;
	    			break;
	    		}
	    	}
		}

        // Reselect the selected annotation, if it is found in the new filtered list of annotations.  Note: This
        // handles the case where we are refreshing the annotations list because of a change of clinical element selection
        // and the selected annotation is not in the new annotations list because we are filtering to the annotations
        // of the selected document only...In this case, if the selected annotation is not found in the new list,
        // we unselect the annotation - if we do not, then the auto-select annotation mechanism will try to select the
        // document that has the old selected annotation, auto-changing the user's document selection...
        var reselectSelectedAnnotation = false;
        if(selAnnotation)
        {
            var selAnnotationFound = false;
            for(var i=0; i < newList.length; i++)
            {
                var tAnnotation = newList[i];
                if(CR.app.controller.AnnotationNatureControllerAnnotations.getIsSameAnnotation(tAnnotation.annotation, selAnnotation))
                {
                    selAnnotationFound = true;
                    break;
                }
            }
            if(!selAnnotationFound)
            {
                CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
            }
            else
            {
                reselectSelectedAnnotation = true;
            }
        }

        // NOTE:  Have to wait a smiggen of time before inserting the data or it does not display the
        // data for the new columns...?...
    	setTimeout(function(doReselectSelectedAnnotation, doBroadcastSelectSelectedAnnotation){
			var grid = Ext.getCmp('annotationlist');
			if(grid)
			{
                if(true || !allFound || changes)
                {
                    grid.curAnnotations = newList; // save unfiltered list for comparisons next time
                    grid.store.proxy.timeout = 100000000;
                    grid.store.loadData(newList);
                }
                if(doReselectSelectedAnnotation)
                {
                    grid.selectSelectedAnnotation(doBroadcastSelectSelectedAnnotation);
                }
            }
    	}, 500, reselectSelectedAnnotation, broadcastSelectSelectedAnnotation);
    },

    getDisplayObjClinicalElementId: function(annotation)
    {
        var id = annotation.clinicalElementName + ' ' + annotation.clinicalElementId.substring(annotation.clinicalElementId.lastIndexOf("=") + 1, annotation.clinicalElementId.length - 1);
        return id;
    },
    
    isAnnotationSelected: function(annotation)
    {
    	var contains = false;
    	var selItems = this.selModel.selected.items;
    	if(selItems)
    	{
		    for (var i = 0; i < selItems.length; i++)
		    {
		    	var item = selItems[i];
		        if (item && item.data && item.raw.annotation == annotation)
		        {
		        	contains = true;
		            break;
		        }
		    }
	    }
	    return contains;
    },
    
    deleteSelectedAnnotation: function()
    {
    	var selItems = this.selModel.selected.items;
    	if(selItems && selItems.length>0)
    	{
    		for(i=0; i<selItems.length; i++)
    		{
    			var selItem = selItems[i];
    			var annotation = selItem.raw.annotation;
    			var id = annotation.clinicalElementId;
    			var aSet = CR.app.controller.AnnotationNatureController.annotationsById[id];
    			if(aSet)
    			{
                    var pos = -1;
                    for(j=0; j<aSet.length; j++) {
                        var tAnnotation = aSet[j];
                        if(tAnnotation.id == annotation.id)
                        {
                            pos = j;
                            break;
                        }
                    }
    				if(pos >= 0)
					{
        				aSet.splice(pos, 1);
					}
    			}
    			CR.app.controller.AnnotationNatureController.annotationsById[id] = aSet;
    		}
			CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
    		CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationsDeletedByUserInList');
            this.refreshAnnotationList();
    	}	
    },

    constructor: function(config) {
        this.callParent(arguments);
        this.mixins.annotationaware.constructor.call(this);
        this.addListener('select', function(rowModel, record,  index,  eOpts){this.doSelect(rowModel, record,  index,  eOpts)});
        this.addListener('deselect', function(rowModel, record,  index,  eOpts){this.doDeselect(rowModel, record,  index,  eOpts)});
    },

    setUserWrapChoice: function(wrapChoice)
    {
        this.userWrapChoice = wrapChoice;
        this.refreshAnnotationList(false);
    },
});

