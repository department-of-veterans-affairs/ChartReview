/**
 * @class CR.app.view.ItemList
 * @extends Ext.panel.Panel
 *
 * Provides a list master/detail of all items
 *
 * @constructor
 * Create a new Item List
 * @param {Object} config The config object
 */
Ext.define('CR.app.view.ItemList', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.itemlist',
    border: false,
    flex: 2,
    layout: {
        type: 'border'
    },
    height: 350,
    width: 1000,

    initComponent: function(){
        this.detail = Ext.create('widget.itemlistdetail', {});
        this.grid = this.createGrid();
        this.east = this.createEast();
        this.south = this.createSouth();
        Ext.apply(this, {
            items: [this.grid, this.south, this.east]
        });
        this.relayEvents(this.detail, ['opentab']);
        this.relayEvents(this.grid, ['rowdblclick']);
        this.callParent(arguments);
    },

    doResize: function(box)
    {
        var curBox = this.getBox();
        if(box.width != curBox.width || box.height != curBox.height)
        {
            curBox.width = box.width;
            curBox.height = box.height;
            this.setBox(curBox);
        }
    },

    /**
     * Loads a set of items.
     */
    loadItems: function(){
        this.grid.loadItems();
    },

    /**
     * Creates the item grid
     * @private
     * @return {CR.app.view.ItemListGrid} itemGrid
     */
    createGrid: function(){
        this.grid = Ext.create('widget.itemlistgrid', {
            region: 'center',
            dockedItems: [this.createTopToolbar()],
            flex: 70,
            listeners: {
                scope: this,
                itemmousedown: this.onItemMouseDown,
                select: this.onSelect,
                deselect: this.onDeselect
            }
        });
        return this.grid;
    },

    /**
     * Creates top controller toolbar.
     * @private
     * @return {Ext.toolbar.Toolbar} toolbar
     */
    createTopToolbar: function(){
        this.toolbar = Ext.create('widget.toolbar', {
            cls: 'x-docked-noborder-top',
            items: [
//                {
//                iconCls: 'open-all',
//                text: 'Open All',
//                scope: this,
//                handler: this.onOpenAllClick
//            }, '-',
                {
                    itemId: this.id + '-theDetailPaneButton',
                    xtype: 'cycle',
                    text: 'Detail Pane',
                    tooltip: 'Show the clinical element detail to the right/bottom, or hide it.',
                    margin:'2 1 1 2',
                    prependText: 'Detail: ',
                    showText: true,
                    scope: this,
                    changeHandler: this.detailPaneChange,
                    menu: {
//                        id: this.id + '-detail-menu',
                        items: [{
                            text: 'Right',
                            tooltip: 'Show the clinical element detail to the right.',
                            checked: true,
                            iconCls:'detail-right'
                        }, {
                            text: 'Bottom',
                            tooltip: 'Show the clinical element detail at the bottom.',
                            iconCls:'detail-bottom'
                        }, {
                            text: 'Hide',
                            tooltip: 'Hide the clinical detail description.',
                            iconCls:'detail-hide'
                        }]
                    }
                }, {
                    iconCls: 'description',
                    text: 'Description',
                    tooltip: 'Show the clinical element brief description',
                    margin:'2 1 1 2',
                    enableToggle: true,
                    pressed: false,
                    scope: this,
                    toggleHandler: this.onDescriptionToggle
                }, {
                    text: 'Wrap',
                    iconCls: 'gridDetail',
                    iconAlign: 'left',
                    margin:'2 1 1 2',
                    tooltip: 'Wrap the grid text.',
                    enableToggle: true,
                    pressed: false,
                    scope: this,
                    toggleHandler: this.onWrapToggle
                }, {
                    text: 'Auto-select',
                    iconCls: 'autoSelect',
                    iconAlign: 'left',
                    margin:'2 1 1 2',
                    tooltip: 'Auto-select grid item on annotation selection.',
                    enableToggle: true,
                    pressed: true,
                    scope: this,
                    toggleHandler: this.onAutoSelectToggle
                }]
        });
        this.toolbar.id = 'itemlistdetailtoolbar-' + this.id;
        return this.toolbar;
    },

    /**
     * Reacts to the open all being clicked
     * @private
     */
    onOpenAllClick: function(){
        this.fireEvent('openall', this);
    },

    /**
     * Gets a list of titles for each item.
     * @return {Array} The item details
     */
    getItemData: function(){
        return this.grid.store.getRange();
    },

    /**
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed Whether the button is pressed
     */
    onDescriptionToggle: function(btn, pressed) {
        this.grid.getComponent('view').getPlugin('preview').toggleExpanded(pressed);
    },

    /**
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed Whether the button is pressed
     */
    onWrapToggle: function(btn, pressed) {
        this.grid.setUserWrapChoice(pressed);
    },

    /**
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed Whether the button is pressed
     */
    onAutoSelectToggle: function(btn, pressed) {
        this.grid.setAutoSelectChoice(pressed);
    },

    /**
     * Handle the checked item being changed
     * @private
     * @param {Ext.menu.CheckItem} item The checked item
     */
    detailPaneChange: function(cycle, activeItem){
        switch (activeItem.text) {
            case 'Bottom':
                this.east.hide();
                this.south.show();
                this.south.add(this.detail);
                break;
            case 'Right':
                this.south.hide();
                this.east.show();
                this.east.add(this.detail);
                break;
            default:
                this.south.hide();
                this.east.hide();
                break;
        }
    },

    /**
     * Create the south region container
     * @private
     * @return {Ext.panel.Panel} south
     */
    createSouth: function(){
        this.south =  Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            region: 'south',
            border: false,
            split: true,
            flex: 30,
            hidden: true,
            minHeight: 50
        });
        return this.south;
    },

    /**
     * Create the east region container
     * @private
     * @return {Ext.panel.Panel} east
     */
    createEast: function(){
        this.east =  Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            region: 'east',
            border: false,
            split: true,
            flex: 30,
            items: this.detail
        });
        return this.east;
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;

        // If there is no content, then just display the annotation panel at the bottom of the grid...
        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(clinicalElementConfigurationId);
        if(clinicalElementConfiguration)
        {
            if(!clinicalElementConfiguration.hasContent)
            {
                this.south.maxHeight = 50;
                this.south.minHeight = 50;
                this.south.flex = null;
                this.south.show();
                this.south.add(this.detail);
                this.east.hide();
                var btnItemId = this.id + '-theDetailPaneButton';
                var btn = Ext.ComponentQuery.query('[id^='+btnItemId+']')[0];
                btn.disabled = true;
            }
        }
    },

    onItemMouseDown: function(grid, rec) {
        // The user's focus has changed; unselect the selected annotation.
        CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('annotationSelectionBlur');
    },

    onSelect: function(grid, rec, index, eOpts) {
        this.detail.loadItemDetail(rec, true);
    },

    onDeselect: function(grid, rec, index, eOpts) {
        this.detail.loadItemDetail(null, true);
    },

    updateData: function()
    {
        this.detail.updateData();
        this.grid.updateData();
    },

    showSelectedAnnotation: function()
    {
        // We will show the selected annotation during the load that happens when we
        // select a new grid item, in our call to showSelectedAnnotation.
        var newSelection = this.grid.showSelectedAnnotation();
        if(!newSelection)
        {
            // If there was, in fact, not a new selection, then
            // let's call the showSelectedAnnotation on the detail right now.
            // NOTE: This handles the case when the newly selected annotation
            // is in the same detail that is already showing.
            this.detail.showSelectedAnnotation();
        }
    }
});