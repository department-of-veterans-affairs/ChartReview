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

    initComponent: function(){
        Ext.apply(this, {
            layout: 'border',
            items: [this.createSummary()]
//            items: [this.createSummary(), this.createSouth(), this.createEast()]    // Chart details docking, later
        });
//        this.relayEvents(this.detail, ['opentab']);
//        this.relayEvents(this.grid, relayEvents['rowdblclick']);           // Chart clicking events, later
        this.callParent(arguments);
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
            flex: 2,
            minHeight: 200,
            minWidth: 150
//            ,
//            listeners: {
//                scope: this,
//                select: this.onSelect
//            }
        });
        return this.summary;
    },

    /**
     * Fires when a chart element is selected
     * @private
     * @param {CR.app.view.ItemChart} chart
     * @param {Ext.data.Model} rec
     */
//    onSelect: function(chart, rec) {
//        this.detail.loadItemDetail(rec);
//    },

    /**
     * Creates top controller toolbar.
     * @private
     * @return {Ext.toolbar.Toolbar} toolbar
     */
//    createTopToolbar: function(){
//        this.toolbar = Ext.create('widget.toolbar', {
//            cls: 'x-docked-noborder-top',
//            items: [
////                {
////                    iconCls: 'open-all',
////                    text: 'Open All',
////                    scope: this,
////                    handler: this.onOpenAllClick
////                }, '-',
//                {
//                    xtype: 'cycle',
//                    text: 'Detail Pane',
//                    prependText: 'Detail: ',
//                    showText: true,
//                    scope: this,
//                    changeHandler: this.detailPaneChange,
//                    menu: {
//                        id: 'detail-menu',
//                        items: [{
//                            text: 'Right',
//                            checked: true,
//                            iconCls:'detail-right'
//                        }, {
//                            text: 'Bottom',
//                            iconCls:'detail-bottom'
//                        }, {
//                            text: 'Hide',
//                            iconCls:'detail-hide'
//                        }]
//                    }
//                }
////                ,
////                {
////                    iconCls: 'description',
////                    text: 'Description',
////                    enableToggle: true,
////                    pressed: true,
////                    scope: this,
////                    toggleHandler: this.onDescriptionToggle
////                }
//            ]
//        });
//        return this.toolbar;
//    },

    /**
     * Reacts to the open all being clicked
     * @private
     */
//    onOpenAllClick: function(){
//        this.fireEvent('openall', this);
//    },

    /**
     * Gets a list of titles for each item.
     * @return {Array} The item details
     */
//    getItemData: function(){
//        return this.grid.store.getRange();
//    },

    /**
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Boolean} pressed Whether the button is pressed
     */
//    onDescriptionToggle: function(btn, pressed) {
//        this.grid.getComponent('view').getPlugin('crpreview').toggleExpanded(pressed);
//    },

    /**
     * Handle the checked item being changed
     * @private
     * @param {Ext.menu.CheckItem} item The checked item
     */
//    detailPaneChange: function(cycle, activeItem){
//        switch (activeItem.text) {
//            case 'Bottom':
//                this.east.hide();
//                this.south.show();
//                this.south.add(this.detail);
//                break;
//            case 'Right':
//                this.south.hide();
//                this.east.show();
//                this.east.add(this.detail);
//                break;
//            default:
//                this.south.hide();
//                this.east.hide();
//                break;
//        }
//    },

    /**
     * Create the south region container
     * @private
     * @return {Ext.panel.Panel} south
     */
//    createSouth: function(){
//        this.south =  Ext.create('Ext.panel.Panel', {
//            layout: 'fit',
//            region: 'south',
//            border: false,
//            split: true,
//            flex: 2,
//            hidden: true,
//            minHeight: 150
//        });
//        return this.south;
//    },

    /**
     * Create the east region container
     * @private
     * @return {Ext.panel.Panel} east
     */
//    createEast: function(){
//        this.east =  Ext.create('Ext.panel.Panel', {
//            layout: 'fit',
//            region: 'east',
//            flex: 1,
//            split: true,
//            minWidth: 150,
//            border: false,
//            items: this.detail
//        });
//        return this.east;
//    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
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