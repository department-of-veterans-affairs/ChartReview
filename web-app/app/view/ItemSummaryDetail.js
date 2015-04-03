/**
 * @class CR.app.view.ItemSummaryDetail
 * @extends Ext.panel.Panel
 *
 * Shows the summary of all items of a clinical element
 *
 * @constructor
 * Create a new Item Summary detail panel
 * @param {Object} config The config object
 */
Ext.define('CR.app.view.ItemSummaryDetail', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.itemsummarydetail',
    mixins: {
        itemsBase: 'CR.app.store.ItemBase',
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
//    cls: 'preview',
    scrollable: true,
    border: true,
    curDoneAnnotatingState: false,
    width: 1500,
    height: 1500,

//    padding: '0 5 0 5', // Left and right space gives the annotator the ability to capture the left-most character without the resize icon getting in the way.
    listeners: {
        doneAnnotating: function(cmp, pid) {
            this.doDoneAnnotating();
        },
        beforeSync: function()
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
//            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(this);
            CR.app.controller.AnnotationNatureControllerText.resetAnnotationHTML(this);
        },
        principalClinicalElementLoaded: function()
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(this);
        },
        annotationCreatedByUserTextLevel: function()
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(this);
        },
        annotationSelectedByUserTextLevel: function()
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(this);
        },
        annotationSelectedByUserInList: function(drawEyeToSelectedAnnotationResult)
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(this);
        },
        annotationsDeletedByUserInList: function()
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(this);
        },
        render: function(v)
        {
            // Should probably be a method in the AnnotationAware mixin.
            if(!this.annotationAwareInitialized)
            {
                this.initAnnotationAwareness();
            }
        },
        onLoadItemDetail: function(rec){
            this.loadItemDetail(rec);
        },
        clinicalElementConfigurationsChanged: function()
        {
            this.doReconfigure();
        }
    },

    initComponent: function(){
        Ext.apply(this, {
            dockedItems: [this.createToolbar()],
            tpl: Ext.create('Ext.XTemplate',
//                '<div class="content-data">',
//                '<span class="content-date">{pubDate:this.formatDate}</span>',
//                '<h3 class="content-title">{title}</h3>',

//                '<h4 class="content-author">by {author:this.defaultValue}</h4>',
//                '</div>',
                '<div class="content-body">{content:this.getBody}</div>',
                {
                    getBody: function(value, all){
                        return Ext.util.Format.stripScripts(value);
                    },

                    defaultValue: function(v){
                        return v ? v : 'Unknown';
                    },

                    formatDate: function(value){
                        if (!value) {
                            return '';
                        }
                        return Ext.Date.format(value, 'M j, Y, g:i a');
                    }
                }
            )
        });
        this.callParent(arguments);
//        this.on('clinicalElementConfigurationsChanged', this.doReconfigure, this);
    },

    doResize: function(box)
    {
        //var curBox = this.getBox();
        //if(box.width != curBox.width || box.height != curBox.height)
        //{
        //    curBox.width = box.width;
        //    curBox.height = box.height;
        //    this.setBox(curBox);
        //}
    },

    doReconfigure: function(){
        // Update the description field from the new definition.
        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
        if(clinicalElementConfiguration)
        {
            for(var key1 in this.items.items)
            {
                var comp = this.items.items[key1];
                var plugin = comp.getPlugin('preview');
                if(typeof plugin != 'undefined')
                {
                    plugin.doRefresh();
                }
            }
        }
        // Reconfigure the grid to the new clinical element definitions.
        this.store = this.mixins.itemsBase.getElementsStore(this);
        this.show();
        this.loadItems('');
    },

    /**
     * Instructs the grid to load a new set of items
     */
    loadItems: function(){
        var store = this.store;
        var me = this;

        var principalElementId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.id;
        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
        if(store && clinicalElementConfiguration && clinicalElementConfiguration.text && principalElementId)
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
                        // In this first implementation of summary, we are expecting one record (patient) that
                        // we will display.  In a future implementation of Lab summary, we will be expecting
                        // a data payload that describes the lab summary "items" - a list of lab panels, for example.
                        // TBD - need to abstract this to handle labs and other clinical element summary information.
                        var rec = records[0];
                        me.fireEvent('onLoadItemDetail', rec);
                    }
                }
            })
        }
    },

    /**
     * Set the active item detail
     * @param {Ext.data.Model} rec The record
     */
    loadItemDetail: function(rec) {
        var me = this;
        this.active = rec;
        if(rec)
        {
            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
            if(typeof CR.app.model.CRAppData.projectId !== 'undefined' && typeof CR.app.model.CRAppData.processId !== 'undefined' && clinicalElementConfiguration)
            {
                var clinicalElementId = rec.raw[clinicalElementConfiguration.idField];

                // NOTE: Do this on item selection - in ItemSummary/Detail, that is right here, when the
                // *only* record is loaded.
                this.clinicalElementId = clinicalElementId;

                var store = this.getElementContentStore(clinicalElementConfiguration);
                store.getProxy().setExtraParams({
                    projectId: CR.app.model.CRAppData.projectId,
                    processId: CR.app.model.CRAppData.processId,
                    clinicalElementConfigurationId: clinicalElementConfiguration.dataIndex,
                    serializedKey: clinicalElementId
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
                            var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[me.clinicalElementId];
                            if(!clinicalElement)
                            {
                                CR.app.controller.AnnotationNatureController.setSelectedClinicalElement(clinicalElement);
                            }
                            CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(me);

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
        }
        if(this.body)
        {
            this.body.scrollTo('top', 0);
            this.enableDoneAnnotating();
        }
    },

    /**
     * Listens for the store loading
     * @private
     */
    onElementContentLoad: function(store, records, success) {
        if(records)
        {
            // In this first implementation of summary, we are expecting one record (patient summary) that
            // we will display.  In future implementations this may be one object containing chart data
            // for one lab panel that was picked at the "Items" display level (i.e. list of lab panels.).
            // TBD - need to abstract this to handle labs and other clinical element summary information detail.
            var pnl = this;
            pnl.checkForExistingClinicalElementAfterRender();
            pnl.initAnnotationAwareness();
            var content = records[0].raw.content;
            this.update(content);
            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
            if(clinicalElementConfiguration)
            {
                var clinicalElement = this.active.raw;
                var clinicalElementId = clinicalElement[clinicalElementConfiguration.idField];
                this.clinicalElementId = clinicalElementId;
                this.clinicalElementDate = new Date();
                this.clinicalElementName = clinicalElementConfiguration.text;
            }
            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('clinicalElementSelectedByUser');
        }
    },

    /**
     * Listen for proxy errors.
     */
    onProxyException: function(proxy, response, operation) {
        Ext.Msg.alert("Error with data from server", operation.error);
        if(this.view)
        {
            this.view.el.update('');

            // Update the detail view with a dummy empty record
            this.fireEvent('select', this, {data:{}});
        }
    },

    /**
     * Create the top toolbar
     * @private
     * @return {Ext.toolbar.Toolbar} toolbar
     */
    createToolbar: function(){
        var items = [],
            config = {};
        if (!this.inTab) {
//            items.push({
//                scope: this,
//                handler: this.openTab,
//                text: 'View in new tab',
//                iconCls: 'tab-new'
//            }, '-');
            items.push({
                id: this.id + '-doneAnnotatingButton',
                scope: this,
                focusCls: '', // work around for button staying focused - sencha bug
                listeners: {
                    click: function(btn, e, eOpts) {
                        var parent = btn.up('itemsummarydetail');
                        parent.doDoneAnnotating();
                    }
                },
                text: 'Done',
                tooltip: 'Mark this clinical element as done for this task.',
                iconCls: 'doneAnnotatingDisabled'
            });
        }
        else {
            config.cls = 'x-docked-noborder-top';
        }
        config.items = items;
        config.id = 'itemsummarydetailtoolbar-' + this.id;
        return Ext.create('widget.toolbar', config);
    },

    /**
     * Enable Done annotating
     */
    enableDoneAnnotating: function ()
    {
        var cmp = Ext.getCmp(this.id + '-doneAnnotatingButton');
        if(typeof this.active != 'undefined' && this.active.data.doneAnnotating)
        {
            cmp.setIconCls('doneAnnotating');
            this.curDoneAnnotatingState = true;  // Sets this during the setActive call; redundantly sets during doDoneAnnotating toggle
        }
        else
        {
            cmp.setIconCls('doneAnnotatingDisabled');
            this.curDoneAnnotatingState = false;  // Sets this during the setActive call; redundantly sets during doDoneAnnotating toggle
        }
    },

    doDoneAnnotating: function ()
    {
        var cmp = Ext.getCmp(this.id + '-doneAnnotatingButton');
        if(!this.curDoneAnnotatingState)
        {
            this.curDoneAnnotatingState = true;
            if(typeof this.active != 'undefined')
            {
                this.active.set('doneAnnotating', true);
            }
        }
        else
        {
            this.curDoneAnnotatingState = false;
            if(typeof this.active != 'undefined')
            {
                this.active.set('doneAnnotating', false);
            }
        }
        this.enableDoneAnnotating();
    },

    /**
     * Open the summary in a new tab
     * @private
     */
    openTab: function(){
        this.fireEvent('opentab', this, this.active);
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;
        this.doReconfigure();
    },

    showSelectedAnnotation: function()
    {
        CR.app.controller.AnnotationNatureControllerText.scrollToSelectedAnnotation(this);
        // this.body.scrollTo('top', 0);
    }
});