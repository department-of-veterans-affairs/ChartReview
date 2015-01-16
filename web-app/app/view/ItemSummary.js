/**
 * @class CR.app.view.ItemSummary
 * @extends Ext.panel.Panel
 *
 * Provides a summary master/detail of all items
 *
 * @constructor
 * Create a new Item Summary
 * @param {Object} config The config object
 */
Ext.define('CR.app.view.ItemSummary', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.itemsummary',
    mixins: {
        itemsBase: 'CR.app.store.ItemBase',
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    border: false,
    flex: 2,
    layout: {
        type: 'border'
    },
    width: 1500,
    height: 1500,

    initComponent: function(){
        this.summary = this.createSummary();
        Ext.apply(this, {
            items: [this.summary]
        });
//        this.relayEvents(this.detail, ['opentab']);
//        this.relayEvents(this.summary, relayEvents['rowdblclick']);           // Chart clicking events, later
        this.callParent(arguments);
    },

    doResize: function(box)
    {
        for(var i = 0; i < this.items.items.length; i++)
        {
            var comp = this.items.items[i];
            comp.doResize(box);
        }
    },

    /**
     * Loads a set of items.
     */
    loadItems: function(){
        this.summary.loadItems();
    },

    /**
     * Creates the item summary
     * @private
     * @return {CR.app.view.ItemSummary} itemSummary
     */
    createSummary: function(){
        // In the case of labs, this would be a chart.  In the case
        // of patient, this is a summary detail.
        this.summary = Ext.create('widget.itemsummarydetail', {
            region: 'center',
//            dockedItems: [this.createTopToolbar()],
            flex: 100,
            listeners: {
                scope: this,
                select: this.onSelect
            }
        });
        return this.summary;
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
//                    iconCls: 'open-all',
//                    text: 'Open All',
//                    scope: this,
//                    handler: this.onOpenAllClick
//                }, '-',
                {
                    xtype: 'cycle',
                    text: 'Detail Pane',
                    prependText: 'Detail: ',
                    showText: true,
                    scope: this,
                    changeHandler: this.detailPaneChange,
                    menu: {
//                        id: 'detail-menu',
                        items: [{
                            text: 'Right',
                            checked: true,
                            iconCls:'detail-right'
                        }, {
                            text: 'Bottom',
                            iconCls:'detail-bottom'
                        }, {
                            text: 'Hide',
                            iconCls:'detail-hide'
                        }]
                    }
                }
//                ,
//                {
//                    iconCls: 'description',
//                    text: 'Description',
//                    enableToggle: true,
//                    pressed: true,
//                    scope: this,
//                    toggleHandler: this.onDescriptionToggle
//                }
            ]
        });
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
        return this.summary.store.getRange();
    },

    /**
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed Whether the button is pressed
     */
    onDescriptionToggle: function(btn, pressed) {
        this.summary.getComponent('view').getPlugin('preview').toggleExpanded(pressed);
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

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
    },

    /**
     * Fires when a chart element is selected
     * @private
     * @param {CR.app.view.ItemChart} chart
     * @param {Ext.data.Model} rec
     */
    onSelect: function(chart, rec) {
        this.detail.loadItemDetail(rec);
    },

    updateData: function()
    {
        this.loadItems();
    },

    showSelectedAnnotation: function()
    {
        this.summary.showSelectedAnnotation();
    }
});