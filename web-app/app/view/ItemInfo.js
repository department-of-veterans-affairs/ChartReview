/**
 * @class CR.app.view.ItemInfo
 * @extends Ext.tab.Panel
 *
 * A container class for showing a series of item details
 *
 * @constructor
 * Create a new Item Info
 * @param {Object} config The config object
 */
Ext.define('CR.app.view.ItemInfo', {

    extend: 'Ext.tab.Panel',
    alias: 'widget.iteminfo',
    mixins: {
        itemsBase: 'CR.app.store.ItemBase',
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    layout:
    {
        type: 'fit',
        padding: '0 0 0 0',
        bodyStyle: {
            background: '#777777'
        }
    },

    maxTabWidth: 230,
    border: false,
    tabTitleCounter: 1,

    // Note that we only want to call the constructor on the ItemBase mixin one time, not one time for
    // each class that uses the mixin, but one time only.  It is like a static singleton in this way.
    // Therefore, we do it in the parent of the two classes that want to share the mixin (ItemList and ItemSummary)...
    constructor: function(config) {
        this.callParent(config);
//        this.mixins.itemsBase.constructor.call(this);
    },

    listeners: {
        annotationSelectedByUserInList: function()
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
            this.openListOrSummaryTab();
        },
        afterlayout: function(thePanel, width, height, eOpts) {
            for(var i = 0; i < this.items.items.length; i++)
            {
                var comp = this.items.items[i];
                comp.doResize(this.lastBox);
            }
        }
    },

    initComponent: function() {
//        this.tabBar = {
//            border: true
//        };
        this.callParent();
    },

    openListOrSummaryTab: function() {
        var selectedAnnotation = CR.app.controller.AnnotationNatureController.selectedAnnotation;
        if(selectedAnnotation)
        {
            var found = false;
            for(var i = 0; i < this.items.items.length; i++)
            {
                var comp = this.items.items[i];
                if(comp.clinicalElementId && selectedAnnotation && comp.clinicalElementId == selectedAnnotation.clinicalElementId)
                {
                    this.setActiveTab(comp);
                    found = true;
                    break;
                }
            }
            if(!found)
            {
                this.setActiveTab(this.items.items[0]);
            }
        }
    },

    /**
     * Add a new item
     * @param {String} title The title of the item
     */

    addItem: function(xtype, title){
        var tab = null;
        if(title == 'Summary')
        {
            tab = this.add({
                xtype: xtype,
                title: title,
                closable: false,
                listeners: {
                    scope: this,
                    opentab: this.onTabOpen,
                    openall: this.onOpenAll,
                    rowdblclick: this.onRowDblClick
                }
            });
        }
        else
        {
            tab = this.add({
                xtype: xtype,
                title: title,
                closable: false,
                listeners: {
                    scope: this,
                    opentab: this.onTabOpen,
                    openall: this.onOpenAll,
                    rowdblclick: this.onRowDblClick
                }
            });
        }
        return tab;
    },

    /**
     * Create an overview tab
     */
    onTabOpen: function(post, rec) {
        var tab,
            title,
            id,
            tabTitle;

        if(rec)
        {
            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
            if(clinicalElementConfiguration)
            {
                if (Ext.isArray(rec)) {
                    Ext.each(rec, function(rec) {
                        title = rec.raw[clinicalElementConfiguration.titleField];
                        id = rec.raw[clinicalElementConfiguration.idField];
                        tabTitle = title + " " + this.tabTitleCounter;
                        this.tabTitleCounter = this.tabTitleCounter + 1;
                        tab = this.getTabByClinicalElementId(id);
                        if (!tab) {
                            // Could do this by adding tabs to an array and then adding the array to the parent,
                            // but we need to call setClincialElementType on each one, so we do it this way.
                            var itemListDetail = Ext.create('CR.app.view.ItemListDetail', {
                                inTab: true,
                                title: tabTitle,
                                closable: true,
                                data: rec.data,
                                active: rec,
                                clinicalElementId: id
                            });
                            tab = this.add(itemListDetail);
                            // The newly created components will not be in the list of components that the addPortlet is
                            // iterating across to call this function, so we have to set the clinicalElementConfigurationId on these
                            // newly created components here.
                            if(typeof tab.setClinicalElementConfigurationId != "undefined")
                            {
                                tab.setClinicalElementConfigurationId(this.clinicalElementConfigurationId);
                            }
                            tab.query('.component').forEach(function(c){
                                if(typeof c.setClinicalElementConfigurationId != "undefined")
                                {
                                    c.setClinicalElementConfigurationId(this.clinicalElementConfigurationId);
                                }
                            });
                        }
                        this.setActiveTab(tab);
                        tab.loadItemDetail(rec, false);
                    }, this);
                }
                else {
                    title = rec.raw[clinicalElementConfiguration.titleField];
                    id = rec.raw[clinicalElementConfiguration.idField];
                    tabTitle = title + " " + this.tabTitleCounter;
                    this.tabTitleCounter = this.tabTitleCounter + 1;
                    tab = this.getTabByClinicalElementId(id);
                    if (!tab) {
                        var itemListDetail = Ext.create('CR.app.view.ItemListDetail', {
                            inTab: true,
                            title: tabTitle,
                            closable: true,
                            data: rec.data,
                            active: rec,
                            clinicalElementId: id
                        });
                        tab = this.add(itemListDetail);
                        // The newly created components will not be in the list of components that the addPortlet is
                        // iterating across to call this function, so we have to set the clinicalElementConfigurationId on these
                        // newly created components here.
                        if(typeof tab.setClinicalElementConfigurationId != "undefined")
                        {
                            tab.setClinicalElementConfigurationId(this.clinicalElementConfigurationId);
                        }
                        tab.query('.component').forEach(function(c){
                            if(typeof c.setClinicalElementConfigurationId != "undefined")
                            {
                                c.setClinicalElementConfigurationId(this.clinicalElementConfigurationId);
                            }
                        });
                    }
                    this.setActiveTab(tab);
                    tab.loadItemDetail(rec, false);
                }
            }
        }
    },

    /**
     * Find a tab by clinical element id
     * @param {String} title The title of the tab
     * @return {Ext.Component} The panel matching the title. null if not found.
     */
    getTabByClinicalElementId: function(id) {
        var index = this.items.findIndex('clinicalElementId', id);
        return (index < 0) ? null : this.items.getAt(index);
    },

    onRowDblClick: function(info, rec){
        this.onTabOpen(null, rec);
    },

    onOpenAll: function(detail) {
        this.onTabOpen(null, detail.getItemData());
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;

        // We wait to create a summary tab until we know if the clinicalElementConfiguration calls for it.
        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(clinicalElementConfigurationId);
        if(clinicalElementConfiguration)
        {
            if(clinicalElementConfiguration.elementType == 'LIST' || clinicalElementConfiguration.elementType == 'BOTH')
            {
                var tab = this.addItem('itemlist', 'List');

                // The newly created components will not be in the list of components that the addPortlet is
                // iterating across to call this function, so we have to set the clinicalElementConfigurationId on these
                // newly created components here.
                if(typeof tab.setClinicalElementConfigurationId != "undefined")
                {
                    tab.setClinicalElementConfigurationId(clinicalElementConfigurationId);
                }
                tab.query('.component').forEach(function(c){
                    if(typeof c.setClinicalElementConfigurationId != "undefined")
                    {
                        c.setClinicalElementConfigurationId(clinicalElementConfigurationId);
                    }
                });
            }
            if(clinicalElementConfiguration.elementType == 'SUMMARY' || clinicalElementConfiguration.elementType == 'BOTH')
            {
                var tab = this.addItem('itemsummary', 'Summary');

                // The newly created components will not be in the list of components that the addPortlet is
                // iterating across to call this function, so we have to set the clinicalElementConfigurationId on these
                // newly created components here.
                if(typeof tab.setClinicalElementConfigurationId != "undefined")
                {
                    tab.setClinicalElementConfigurationId(clinicalElementConfigurationId);
                }
                tab.query('.component').forEach(function(c){
                    if(typeof c.setClinicalElementConfigurationId != "undefined")
                    {
                        c.setClinicalElementConfigurationId(clinicalElementConfigurationId);
                    }
                });
            }
        }
    },

    updateData: function()
    {
        // Call this function on all itemListGrids that may be children.
        // Close all itemListDetails that may be open as tabs.  They may not be
        // valid when the data is updated.
        var compsToClose = [];
        var compsToUpdate = [];
        for(var i = 0; i < this.items.items.length; i++)
        {
            var comp = this.items.items[i];
            if(comp.xtype == 'itemlistdetail')
            {
                compsToClose.push(comp);
            }
            if(typeof comp.updateData != "undefined")
            {
                compsToUpdate.push(comp);
            }
        }
        for(var i = 0; i < compsToClose.length; i++) {
            var comp = compsToClose[i];
            comp.close();
        }
        for(var i = 0; i < compsToUpdate.length; i++) {
            var comp = compsToUpdate[i];
            comp.updateData();
        }
    },

    showSelectedAnnotation: function()
    {
        // Call this function on all itemlist and itemlistdetail (tabs) that may be children.
        for(var i = 0; i < this.items.items.length; i++)
        {
            var comp = this.items.items[i];
            if(typeof comp.showSelectedAnnotation != "undefined")
            {
                comp.showSelectedAnnotation();
            }
        }
    }
});

