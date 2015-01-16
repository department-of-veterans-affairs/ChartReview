/**
 * @class CR.app.view.ItemPanel
 * @extends Ext.panel.Panel
 *
 * Shows a list of available items.
 *
 * @constructor
 * Create a new Item Panel
 * @param {Object} config The config object
 */

Ext.define('CR.app.view.ItemPanel', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.itempanel',

    animCollapse: true,
    title: 'Items',

    initComponent: function(){
        Ext.apply(this, {
            items: this.createView(),
            dockedItems: this.createToolbar()
        });
        this.createMenu();
        this.addEvents(
            /**
             * @event itemremove Fired when a item is removed
             * @param {ItemPanel} this
             * @param {String} title The title of the item
             */
            'itemremove',

            /**
             * @event itemselect Fired when a item is selected
             * @param {ItemPanel} this
             * @param {String} title The title of the item
             */
            'itemselect'
        );

        this.callParent(arguments);
    },

    /**
     * Create the DataView to be used for the item list.
     * @private
     * @return {Ext.view.View}
     */
    createView: function(){
        this.view = Ext.create('widget.dataview', {
            scrollable: true,
            store: Ext.create('Ext.data.Store', {
                model: 'Item',
                data: this.items
            }),
            selModel: {
                mode: 'SINGLE',
                listeners: {
                    scope: this,
                    selectionchange: this.onSelectionChange
                }
            },
            listeners: {
                scope: this,
                contextmenu: this.onContextMenu,
                viewready: this.onViewReady
            },
            trackOver: true,
            cls: 'item-list',
            itemSelector: '.item-list-item',
            overItemCls: 'item-list-item-hover',
            tpl: '<tpl for="."><div class="item-list-item">{title}</div></tpl>'
        });
        return this.view;
    },

    onViewReady: function(){
        this.view.getSelectionModel().select(this.view.store.first());
    },

    /**
     * Creates the toolbar to be used for controlling items.
     * @private
     * @return {Ext.toolbar.Toolbar}
     */
    createToolbar: function(){
        this.createActions();
        this.toolbar = Ext.create('widget.toolbar', {
            items: [this.addAction, this.removeAction]
        });
        return this.toolbar;
    },

    /**
     * Create actions to share between toolbar and menu
     * @private
     */
    createActions: function(){
        this.addAction = Ext.create('Ext.Action', {
            scope: this,
            handler: this.onAddItemClick,
            text: 'Add item',
            iconCls: 'item-add'
        });

        this.removeAction = Ext.create('Ext.Action', {
            itemId: 'remove',
            scope: this,
            handler: this.onRemoveItemClick,
            text: 'Remove item',
            iconCls: 'item-remove'
        });
    },

    /**
     * Create the context menu
     * @private
     */
    createMenu: function(){
        this.menu = Ext.create('widget.menu', {
            items: [{
                scope: this,
                handler: this.onLoadClick,
                text: 'Load item',
                iconCls: 'item-load'
            }, this.removeAction, '-', this.addAction],
            listeners: {
                hide: function(c){
                    c.activeItem = null;
                }
            }
        });
    },

    /**
     * Used when view selection changes so we can disable toolbar buttons.
     * @private
     */
    onSelectionChange: function(){
        var selected = this.getSelectedItem();
        this.toolbar.getComponent('remove').setDisabled(!selected);
        if (selected) {
            this.loadItems(selected);
        }
    },

    /**
     * React to the load items menu click
     * @private
     */
    onLoadClick: function(){
        this.loadItems(this.menu.activeItem);
    },

    /**
     * Loads a set of items.
     * @private
     * @param {Ext.data.Model} rec The item
     */
    loadItems: function(rec){
        if (rec) {
            this.fireEvent('itemselect', this, rec.get('title'));
        }
    },

    /**
     * Gets the currently selected record in the view.
     * @private
     * @return {Ext.data.Model} Returns the selected model. false if nothing is selected.
     */
    getSelectedItem: function(){
        return this.view.getSelectionModel().getSelection()[0] || false;
    },

    /**
     * Listens for the context menu event on the view
     * @private
     */
    onContextMenu: function(view, index, el, event){
        var menu = this.menu;

        event.stopEvent();
        menu.activeItem = view.store.getAt(index);
        menu.showAt(event.getXY());
    },

    /**
     * React to a item being removed
     * @private
     */
    onRemoveItemClick: function() {
        var active = this.menu.activeItem || this.getSelectedItem();


        if (active) {
            this.view.getSelectionModel().deselectAll();
            this.animateNode(this.view.getNode(active), 1, 0, {
                scope: this,
                afteranimate: function() {
                    this.view.store.remove(active);
                    
                }
            });
            this.fireEvent('itemremove', this, active.get('title'));
        }
    },

    /**
     * React to a item attempting to be added
     * @private
     */
    onAddItemClick: function(){
        var win = this.addItemWindow || (this.addItemWindow = Ext.create('widget.itemwindow', {
            listeners: {
                scope: this,
                itemvalid: this.onItemValid
            }
        }));
        win.form.getForm().reset();
        win.show();
    },

    /**
     * React to a validation on a item passing
     * @private
     * @param {CR.app.view.ItemWindow} win
     * @param {String} title The title of the item
     */
    onItemValid: function(win, title){
        var view = this.view,
            store = view.store,
            rec;

        rec = store.add({
            title: title
        })[0];
        this.animateNode(view.getNode(rec), 0, 1);
    },

    /**
     * Animate a node in the view when it is added/removed
     * @private
     * @param {Mixed} el The element to animate
     * @param {Number} start The start opacity
     * @param {Number} end The end opacity
     * @param {Object} listeners (optional) Any listeners
     */
    animateNode: function(el, start, end, listeners){
        Ext.create('Ext.fx.Anim', {
            target: Ext.get(el),
            duration: 500,
            from: {
                opacity: start
            },
            to: {
                opacity: end
            },
            listeners: listeners
         });
    },

    // Inherit docs
    onDestroy: function(){
        this.callParent(arguments);
        this.menu.destroy();
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
    }
});
