/**
 * @class CR.app.view.ItemViewer
 * @extends Ext.container.Viewport
 *
 * The main CR.app.view.application
 *
 * @constructor
 * Create a new Item Viewer app
 * @param {Object} config The config object
 */

Ext.define('CR.app.view.ItemViewer', {
    extend: 'Ext.container.Viewport',
    layout: 'fit',
    anchor: '100%',

    initComponent: function(){

        this.callParent(arguments);
    },

    /**
     * Create the list of fields to be shown on the left
     * @private
     * @return {CR.app.view.ItemPanel} itemPanel
     */
    createItemPanel: function(){
        this.itemPanel = Ext.create('widget.itempanel', {
            region: 'west',
            collapsible: true,
            width: 225,
            //floatable: false,
            split: true,
            minWidth: 175,
            items: [{
                title: 'List'
            },{
                title: 'Summary'
            }],
            listeners: {
                scope: this,
                itemselect: this.onItemSelect
            }
        });
        return this.itemPanel;
    },

    /**
     * Create the item info container
     * @private
     * @return {CR.app.view.ItemInfo} itemInfo
     */
    createItemInfo: function(){
        this.itemInfo = Ext.create('widget.iteminfo', {
            region: 'center',
            minWidth: 300
        });
        return this.itemInfo;
    },

    /**
     * Reacts to a item being selected
     * @private
     */
    onItemSelect: function(item, title){
        this.itemInfo.addItem('itemlist', title);
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
    }
});
