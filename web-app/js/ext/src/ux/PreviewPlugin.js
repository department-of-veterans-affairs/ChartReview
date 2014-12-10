/**
 * The Preview enables you to show a configurable preview of a record.
 *
 * This plugin assumes that it has control over the features used for this
 * particular grid section and may conflict with other plugins.
 */
Ext.define('Ext.ux.PreviewPlugin', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.preview',
    requires: ['Ext.grid.feature.RowBody', 'Ext.grid.feature.RowWrap'],

    // private, css class to use to hide the body
    hideBodyCls: 'x-grid-row-body-hidden',

    /**
     * @cfg {String} bodyField
     * Field to display in the preview. Must be a field within the Model definition
     * that the store is using.
     */
    bodyField: '',

    /**
     * @cfg {Boolean} previewExpanded
     */
    previewExpanded: true,

    setCmp: function(grid) {
        this.callParent(arguments);

        var bodyField   = this.bodyField,
            hideBodyCls = this.hideBodyCls,
            features    = [{
                ftype: 'rowbody',
                getAdditionalData: function(data, idx, record, orig, view) {
                    // NOTE CR CHANGES HERE
                    // Get the description field from the clinical element configuration directly.
                    var descriptionField = 'descriptionField';
                    var clinicalElementConfiguration = CR.app.model.CRAppData.getClinicalElementConfiguration(this.grid.clinicalElementConfigurationId);
                    if(clinicalElementConfiguration)
                    {
                        descriptionField = clinicalElementConfiguration.descriptionField;
                    }

                    var getAdditionalData = Ext.grid.feature.RowBody.prototype.getAdditionalData,
                        additionalData = {
                            rowBody: data[descriptionField],
                            rowBodyCls: grid.previewExpanded ? '' : hideBodyCls
                        };

                    if (getAdditionalData) {
                        Ext.apply(additionalData, getAdditionalData.apply(this, arguments));
                    }
                    return additionalData;
                }
            }, {
                ftype: 'rowwrap'
            }];

        grid.previewExpanded = this.previewExpanded;
        if (!grid.features) {
            grid.features = [];
        }
        grid.features = features.concat(grid.features);
    },

    doGetAdditionalData: function(data, idx, record, orig, view) {
        var getAdditionalData = Ext.grid.feature.RowBody.prototype.getAdditionalData,
            additionalData = {
                rowBody: data[this.bodyField],
                rowBodyCls: grid.previewExpanded ? '' : hideBodyCls
            };

        if (getAdditionalData) {
            Ext.apply(additionalData, getAdditionalData.apply(this, arguments));
        }
        return additionalData;
    },

    /**
     * Toggle between the preview being expanded/hidden
     * @param {Boolean} expanded Pass true to expand the record and false to not show the preview.
     */
    toggleExpanded: function(expanded) {
        var view = this.getCmp();
        this.previewExpanded = view.previewExpanded = expanded;
        view.refresh();
    },
    init: function(c)
    {
        // Needed an init - do nothing, though.
    },
    /**
     * Toggle between the preview being expanded/hidden
     * @param {Boolean} expanded Pass true to expand the record and false to not show the preview.
     */
    // NOTE CR ADDITIONAL FUNCTION
    doRefresh: function() {
        var view = this.getCmp();
        view.refresh();
    }
});
