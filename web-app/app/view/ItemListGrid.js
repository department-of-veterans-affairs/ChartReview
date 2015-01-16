Ext.define('CR.app.view.ItemListGrid', {
    extend: 'Ext.grid.Panel',
    userWrapChoice: false,
    autoSelectChoice: true,
    scrollable: true,

    alias: 'widget.itemlistgrid',
    requires: [],
    mixins: {
        itemsBase: 'CR.app.store.ItemBase',
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    clinicalElementConfigurationName: 'Notes',

    listeners: {
        rowdblclick: function() {
        },
        clinicalElementConfigurationsChanged: function() {
            this.doReconfigure();
        }
    },

    constructor: function(config) {
        this.callParent(arguments);
        this.mixins.itemsBase.constructor.call(this);
    },

    initComponent: function(){
        Ext.apply(this, {
            cls: 'itemlist-grid',
            viewConfig: {
                itemId: 'view',
                plugins: [{
                    pluginId: 'preview',
                    ptype: 'preview',
                    bodyField: 'descriptionField',
                    expanded: true
                }],
                listeners: {
                    scope: this,
                    itemdblclick: this.onRowDblClick
                }
            },
            columns: [
                {
                    dataIndex: 'doneAnnotating',
                    hidden: false,
                    width: 30,
                    renderer: this.formatDoneAnnotating,
                    variableRowHeight: true,
                    filterable: true,
                    filter:{type:'boolean'}
                }
            ],
            features:
                [
                    {ftype: 'grouping',
                        groupHeaderTpl: '{name} ({rows.length})', //print the number of items in the group
                        startCollapsed: false // start all groups collapsed
                    }
                ],
            stripeRows: true
//            editable: true,
//            allowDeselect: true  THIS IS NOT WORKING RIGHT - IT CAUSES A DESELECT AFTER EVERY SELECT OF AN ITEM WHICH IS NEGATING MY SELECT...just in EXTJS5...
        });

        this.callParent(arguments);
    },

    doReconfigure: function(){
        // Reconfigure the grid to the new clinical element definitions.
        var me = this;
        var str = this.mixins.itemsBase.getElementsStore(this);
        if(str.hasListener('datachanged'))
        {
            str.removeListener('datachanged');
        }
        str.addListener('datachanged', function(st, filters, eOpts){
            var parentTab = me.findParentByType("itemlist");
            if(typeof st.snapshot != 'undefined')
            {
                parentTab.setTitle("List (" + st.count() + " of " + st.snapshot.items.length + ")");
            }
        });
        var columns = this.getDynamicColumns();
        this.reconfigure(str, columns);
        this.show();
        this.loadItems('');
    },

    getDynamicColumns: function(){
        // Default
        var newColumns = new Array();
        var column = {
            text: 'tempColumn',
            dataIndex: 'tempColumn',
            hidden: true,
            width: 30,
            variableRowHeight: true,
            filterable: true,
            filter:{type:'string'}
        }
        newColumns.push(column);

        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
        if(clinicalElementConfiguration)
        {
            // Add columns from clinical element def
            newColumns = new Array();
            var column = {
                dataIndex: 'doneAnnotating',
                hidden: false,
                width: 30,
                renderer: this.formatDoneAnnotating,
                variableRowHeight: true,
                filterable: true,
                filter:{type:'boolean'}
            }
            newColumns.push(column);
            var fields = clinicalElementConfiguration.fields;
            for(var i = 0; i < fields.length; i++)
            {
                var field = fields[i];
                if(!field.exclude)
                {
                    var renderer = function(value){if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', value)}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', value)}};
                    switch(field.type)
                    {
                        case 'date':
                            renderer = function(value){var date = new Date(value);if(this.userWrapChoice){return Ext.String.format('<div class="cellTextWrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}else{return Ext.String.format('<div class="cellTextNowrap">{0}</div>', Ext.Date.format(date, 'Y/m/d G:i'))}};
                            break;
                        case 'int':
                        default:
                            break;
                    }
                    var column = {
                        text: field.text,
                        dataIndex: field.dataIndex,
                        hidden: field.hidden,
                        flex: 1,  // expand or contract columns equally with grid width until manually changed
                        renderer: renderer,
                        variableRowHeight: true,
                        filterable: true,
                        filter:{type:field.type},
                        //  filter: {
//                              type: 'string',
//                              value: 'in'
//                          }
                        lockable: true
                    }
                    newColumns.push(column);
                }
            }
        }

        // Put any existing columns in the list first, with the current width, then add the new ones.
        var columns = [];
        for(colIdx1 in this.columns) {
            var curCol1 = this.columns[colIdx1];
            var curCol2 = null;
            for(colIdx2 in newColumns) {
                var tCurCol2 = newColumns[colIdx2];
                if(tCurCol2.dataindex == curCol1.dataindex)
                {
                    curCol2 = tCurCol2;
                    curCol2.width = curCol1.width;
                    columns.push(curCol2);
                    break;
                }
            }
            if(curCol2)
            {
                // Take the matching column out of the new columns, because we
                // have already included it in the columns list.
                var idx = newColumns.indexOf(curCol2);
                if(idx != -1) {
                    newColumns.splice(idx, 1);
                }
            }
        }
        for(colIdx1 in newColumns) {
            var curCol1 = newColumns[colIdx1];
            columns.push(curCol1);
        }
        return columns;
    },

    /**
     * Reacts to a double click
     * @private
     * @param {Object} view The view
     * @param {Object} index The row index
     */
    onRowDblClick: function(view, record, item, index, e) {
        this.fireEvent('rowdblclick', this, this.store.getAt(index));
    },

    onClinicalElementConfigurationsChanged: function() {
        this.reconfigure();
    },

    /**
     * Listen for proxy eerrors.
     */
    onProxyException: function(proxy, response, operation) {
        Ext.Msg.alert("Error with data from server", operation.error);
        this.view.el.update('');

        // Update the detail view with a dummy empty record
        this.fireEvent('select', this, {data:{}});
    },

    /**
     * Instructs the grid to load a new set of items
     */
    loadItems: function(){
        var store = this.store;
        var me = this;

        var principalElementId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.id;
        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
        if(store && clinicalElementConfiguration && clinicalElementConfiguration.text && principalElementId != null)
        {
            store.getProxy().setExtraParams({
                projectId: CR.app.model.CRAppData.projectId,
                processId: CR.app.model.CRAppData.processId,
                clinicalElementConfigurationId: clinicalElementConfiguration.dataIndex,
                principalElementId: principalElementId
            });
            store.load({
                callback: function(records, operation, success){
                    if(!success)
                    {
                        Ext.MessageBox.show({
                            title: '',
                            msg: 'Error loading data from server: ' + operation.error.statusText + " - is your query taking more than 5 min?",
                            buttons: Ext.Msg.OK,
                            closable:false,
                            icon: Ext.MessageBox.INFO
                        });
                        if(operation.error.status == 401)
                        {
                            var baseUrl = location.origin + "/chart-review/login/auth";
                            window.location.assign(baseUrl);
                        }
                    }
                    else
                    {
                        if (typeof this.getSelectionModel != 'undefined' && this.totalCount > 0) {
                            this.getSelectionModel().select(0);
                        }

                        var parentTab = me.findParentByType("itemlist");
                        parentTab.setTitle("List (" + store.count() + " of " + records.length + ")");

                        // Show the selected annotation when this is loaded, if there is one.
                        // This is good to do in any case, but specifically handles the case
                        // where a portlet is created and loaded because of an annotation
                        // selection, when a portlet of the same clinical element type
                        // as the annotation is not found.
                        me.showSelectedAnnotation();
                    }
                }
            })
        }
    },

    /**
     * Title renderer
     * @private
     */
    formatTitle: function(value, p, record){
        return Ext.String.format('<div class="topic"><b>{0}</b><span class="author">{1}</span></div>', value, record.get('author') || "Unknown");
    },

    /**
     * Done annotating renderer
     * @private
     */
    formatDoneAnnotating: function(doneAnnotating, metadata, record, row, col, store, gridView){
        if (doneAnnotating)
        {
            metadata.tdCls = 'doneAnnotating';
        }
        else
        {
            metadata.tdCls = 'doneAnnotatingDisabled';
        }
    },

    /**
     * Classify renderer
     * @private
     */
    formatClassify: function(value, metadata, record, row, col, store, gridView){
        return value;
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
        this.doReconfigure();
    },

    updateData: function()
    {
        this.getSelectionModel().deselectAll();
        this.loadItems();
    },

    /**
     * Finds the item that has the selected Annotation.  Selects that item, if not already selected.  Returns true if the item was selected
     * false otherwise.
     * @returns newSelection; true if an item was selected, false if not.
     */
    showSelectedAnnotation: function() {
        var selectedAnnotation = CR.app.controller.AnnotationNatureController.getSelectedAnnotation();
        var selectedItem = this.getSelectionModel().getSelection()[0];
        var newSelection = false;
        if (this.autoSelectChoice) {
            for (var i = 0; i < this.store.data.length; i++) {
                var item = this.store.data.items[i];
                var rawItem = item.raw;
                var itemId = rawItem._SERIALIZED_ID_;
                if (selectedAnnotation && itemId == selectedAnnotation.clinicalElementId) {
                    if (typeof this.getSelectionModel != 'undefined' && this.store.totalCount > 0) {
                        if (!selectedItem || selectedItem && item.raw._SERIALIZED_ID_ != selectedItem.raw._SERIALIZED_ID_) {
                            newSelection = true;
//                            this.getSelectionModel().select(item.index);
                            this.getSelectionModel().select(item);
                        }
                        break;
                    }
                }
            }
        }

        return newSelection;
    },

    setUserWrapChoice: function(wrapChoice)
    {
        this.userWrapChoice = wrapChoice;
        this.doReconfigure();
    },

    setAutoSelectChoice: function(autoSelectChoice)
    {
        this.autoSelectChoice = autoSelectChoice;
    }
});
