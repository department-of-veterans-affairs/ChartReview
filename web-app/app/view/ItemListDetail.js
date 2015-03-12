/**
 * @class CR.app.view.ItemListDetail
 * @extends Ext.panel.Panel
 *
 * Shows the detail of an item.
 *
 * @constructor
 * Create a new Item Post
 * @param {Object} config The config object
 */
Ext.define('CR.app.view.ItemListDetail', {

    extend: 'Ext.panel.Panel',
    alias: 'widget.itemlistdetail',
    mixins: {
        itemsBase: 'CR.app.store.ItemBase',
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
//    cls: 'preview',
    scrollable: true,
    border: true,
    curDoneAnnotatingState: false,
    isLoaded: false,
    width: 1500,
    height: 1500,

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
        }
    },

    initComponent: function(){
        Ext.apply(this, {
            cls: 'itemlist-detail',
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
     * Set the active item detail
     * @param {Ext.data.Model} rec The record
     */
    loadItemDetail: function(rec, userSelectedClinicalElement) {
        this.active = rec;
        if(rec)
        {
            var me = this;
            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.clinicalElementConfigurationId);
            if(typeof CR.app.model.CRAppData.projectId !== 'undefined' && typeof CR.app.model.CRAppData.processId !== 'undefined' && clinicalElementConfiguration)
            {
                var clinicalElementId = rec.raw[clinicalElementConfiguration.idField];
                this.clinicalElementId = clinicalElementId;
                this.userSelectedClinicalElement = userSelectedClinicalElement;
                var store = this.getElementContentStore(this);
                store.getProxy().setExtraParams({
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
                            var pnl = me;
                            pnl.checkForExistingClinicalElementAfterRender();
                            pnl.initAnnotationAwareness();

                            var content = records[0].raw.content;
                            me.update(content);
                            me.body.scrollTo('top', 0);
                            var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(me.clinicalElementConfigurationId);
                            if(clinicalElementConfiguration && me.active)
                            {
                                var clinicalElement = me.active.raw;
                                var clinicalElementId = clinicalElement[clinicalElementConfiguration.idField];
                                if(!clinicalElementId)
                                {
                                    alert('Cannot add annotation because id cannot be found for selected component.');
                                    return;
                                }
                                var clinicalElement = CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId];
                                if(!clinicalElement)
                                {
                                    var selectedClinicalElement = CR.app.controller.AnnotationNatureController.selectedClinicalElement;
                                    var selectedPrincipalClinicalElement = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement;
                                    clinicalElement = CR.app.controller.AnnotationNatureController.createClinicalElement(
                                        clinicalElementId, // id
                                        clinicalElementConfiguration.text, // name
                                        '', // taskId
                                        '', // taskName
                                        '', // taskDescription
                                        '', // taskDetailedDescription
                                        clinicalElementConfiguration.dataIndex, // clinicalElementConfigurationId
                                        clinicalElementConfiguration.textContent, // clinicalElementConfigurationName
                                        '', // dateAssigned
                                        '', // dateModified
                                        selectedPrincipalClinicalElement.schemaId, //schemaId
                                        selectedPrincipalClinicalElement.schemaName, // schemaName
                                        '', // status
                                        '', // contextElementTypes
                                        selectedPrincipalClinicalElement.id, //principalClinicalElementId
                                        '', // dateCompleted
                                        true, // isContext
                                        true) // isNew

                                    /*
                                     * The clinicalElement will be given to the call to CRAdmin.
                                     * Because the call is asynchronous, I will let the callback routine fill it in.
                                     */
                                    var clinicalElements = [];
                                    clinicalElements.push(clinicalElement);
                                    CR.app.controller.AnnotationNatureController.principalClinicalElementsById[clinicalElementId] = clinicalElement;
                                }
                                pnl.clinicalElementId = clinicalElement.id;
                                CR.app.controller.AnnotationNatureController.setSelectedClinicalElement(clinicalElement);
                                CR.app.controller.AnnotationNatureControllerText.markupAnnotationHTML(me);
                                if(me.userSelectedClinicalElement)
                                {
                                    CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('clinicalElementSelectedByUser');
                                }
                            }

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
        else
        {
            this.initAnnotationAwareness();
            var content = '';
            this.update(content);
        }
        this.body.scrollTo('top', 0);
        this.enableDoneAnnotating();
    },

    /**
     * Listens for the store loading
     * @private
     */
    onElementContentLoad: function(store, records, success) {
        // Do nothing for list detail
    },

    /**
     * Listen for proxy eerrors.
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
            items.push({
                itemId: this.id + '-viewInNewTab',
                scope: this,
                handler: this.openTab,
                text: 'View in new tab',
                tooltip: 'Save this clinical element view in a separate tab, to be able to come back to it.',
                margin:'2 1 1 2',
                iconCls: 'tab-new'
            });
//           }, '-');
        }
        items.push({
            id: this.id + '-doneAnnotatingButton',
            scope: this,
            focusCls: '', // work around for button staying focused - sencha bug
            listeners: {
                click: function(btn, e, eOpts) {
                    var parent = this.up('itemlistdetail');
                    parent.doDoneAnnotating();
                }
            },
            text: 'Done',
            tooltip: 'Mark this clinical element as done for this task.',
            margin:'2 1 1 2',
            iconCls: 'doneAnnotatingDisabled'
        });
        config.items = items;
        config.id = 'itemlistdetailtoolbar-' + this.id;
        return Ext.create('widget.toolbar', config);
    },

    /**
     * Enable Done annotating
     */
    enableDoneAnnotating: function ()
    {
        var cmp = Ext.getCmp(this.id + '-doneAnnotatingButton');
        if(this.active && this.active.data.doneAnnotating)
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
        if(typeof this.active != 'undefined') {
            this.active.store.group();
        }
        this.enableDoneAnnotating();
    },

    /**
     * Open the post in a new tab
     * @private
     */
    openTab: function(){
        this.fireEvent('opentab', this, this.active);
    },

    setClinicalElementConfigurationId: function(clinicalElementConfigurationId){
        this.clinicalElementConfigurationId = clinicalElementConfigurationId;

        var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(clinicalElementConfigurationId);
        if(clinicalElementConfiguration)
        {
            if(!clinicalElementConfiguration.hasContent)
            {
                var btnViewInNewTabId = this.id + '-viewInNewTab';
                var btnViewInNewTab = Ext.ComponentQuery.query('[id^='+btnViewInNewTabId+']')[0];
                btnViewInNewTab.disabled = true;
            }
        }
    },

    /**
     * Update is only called on the in-line item list details, not the ones
     * that are in a separate tab.  If the portlet updateData will close those
     * tabs, but it will call updateData on the inline item list details so they
     * can clear themselves.
     */
    updateData: function()
    {
        this.active = null;
        this.clinicalElementId = null;
        this.update(null);
    },

    showSelectedAnnotation: function()
    {
        // Call the shared method in Annotation Aware
        CR.app.controller.AnnotationNatureControllerText.scrollToSelectedAnnotation(this);
    }
});