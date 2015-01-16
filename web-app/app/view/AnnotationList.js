Ext.define('CR.app.view.AnnotationList', {
    id: 'annotationlist',
    itemId: 'annotationlist',
    alias: 'widget.annotationlist',
    extend: 'Ext.grid.Panel',
//    requires: ['Ext.data.*','Ext.grid.*','Ext.grid.property.Grid', 'CR.app.store.AnnotationListStore'],
    requires: [
        'CR.app.store.AnnotationListStore'
    ],
	mixins: {
		annotationaware: 'CR.app.controller.AnnotationNatureController'
	},
	store: {type:'annotationliststore'},
    features:
    [
//        {ftype: 'filters', encode: false, local: true},
        {ftype: 'grouping',
            groupHeaderTpl: '{name} ({rows.length})', //print the number of items in the group
            startCollapsed: false // start all groups collapsed
        }
    ],
    flex: 60,
    multiSelect: true,
    scrollable: true,
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
    bufferedRenderer: false,

    columns: [
          	{ header: 'Span', id: 'theSpan', dataIndex: 'span', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, showInGroups: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}}},
            { header: 'ClinicalElement Id', id: 'clinicalElementId',  dataIndex: 'clinicalElementId', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Class', id: 'schemaRef',  dataIndex: 'schemaRef', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Type', id: 'type', dataIndex: 'type', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Creation Date', id: 'creationDate',  dataIndex: 'creationDate', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'date'}, xtype: "datecolumn", renderer:function(value){var date = new Date(value);if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}}},
            { header: 'ClinicalElement Name', id: 'clinicalElementName',  dataIndex: 'clinicalElementName', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}}}
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
        schemaLoaded: function()
        {
            // NOTE THIS METHOD IS USED IN DYNAMIC COLUMN CREATION WHICH IS NOT WORKING VERY WELL.
            var attributes = CR.app.controller.AnnotationNatureController.getAllSchemaAttributes();
            this.doReconfigureIfNecessary(attributes);
            this.refreshAnnotationList();
            // Remember - put anything you want to happen after the refresh into the timeout of refreshAnnotationList
        },
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

    doReconfigureIfNecessary: function(attributes, annotations){
        // Reconfigure the grid to show all of the schema attributes.
        var columns = this.getDynamicColumns(attributes);
        //if(!this.columnListsAreEqual(columns, this.headerCt.items.items))
        {
            var str = this.getAnnotationsStore(attributes, annotations);
            this.reconfigure(str, columns);
            this.show();
        }
    },

    getDynamicColumns: function(attributes){
        var columns = [];
        // Defaults
        var unorderedNewColumns = [
            { header: 'Span', id: 'theSpan', dataIndex: 'span', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, showInGroups: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Creation Date', id: 'creationDate',  dataIndex: 'creationDate', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'date'}, xtype: "datecolumn", renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', Ext.Date.format(value, 'Y/m/d G:i'))}} },
            { header: 'ClinicalElement Name', id: 'clinicalElementName',  dataIndex: 'clinicalElementName', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'ClinicalElement Id', id: 'clinicalElementId',  dataIndex: 'clinicalElementId', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Class', id: 'schemaRef',  dataIndex: 'schemaRef', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} },
            { header: 'Type', id: 'type', dataIndex: 'type', minWidth:80, variableRowHeight: true, sortable: true, hideable: true, draggable: true, groupable: true, filterable: true, filter: {type: 'string'}, renderer:function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}} }
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
                    lockable: true,
                    variableRowHeight: true
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

    getAnnotationsStore: function(attributes, annotations){
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

        if(!Ext.ClassManager.get(modelName))
        {
            Ext.define(modelName, {
                extend: 'CR.app.model.CRModelBase',
                fields: modelFields
            });
        }

        var store = new Ext.data.Store(
        {
            model: modelName,
            sortInfo: sortInfos,
            autoLoad: true
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
            this.doBroadcastNextAnnotationSelection = doBroadcastSelectSelectedAnnotation;
            this.selModel.select(selItems, false, false);  // This scrolls to the selected item :) TBD - not highlighting yet.
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
		if(annotations)
		{
			for(i=0; i<annotations.length; i++)
			{
				var annotation = annotations[i];
				if(annotation)
				{
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
					for(key in tAttributes)
					{
						var attribute = tAttributes[key];
						var value = attribute.value;
						if(attribute.isNumeric && attribute.attributeDef.options != null)
						{
							value = attribute.attributeDef.options[attribute.value];
						}
                        dispObj[attribute.attributeDef.name] = value;
					}
                    newList.push(dispObj);
				}
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

        this.curAnnotations = newList; // save unfiltered list for comparisons next time
        this.store.proxy.timeout = 100000000;
        this.store.loadData(newList);
        if(reselectSelectedAnnotation)
        {
            this.selectSelectedAnnotation(broadcastSelectSelectedAnnotation);
        }
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
        this.callParent(config);
        this.mixins.annotationaware.constructor.call(this);
        this.addListener('select', function(rowModel, record,  index,  eOpts){this.doSelect(rowModel, record,  index,  eOpts)});
        this.addListener('deselect', function(rowModel, record,  index,  eOpts){this.doDeselect(rowModel, record,  index,  eOpts)});
    },

    setUserWrapChoice: function(wrapChoice)
    {
        this.userWrapChoice = wrapChoice;
        this.refreshAnnotationList(false);
    }
});

