Ext.define('CR.app.model.CRModelBase', {
    extend: 'Ext.data.Model'
//    override: 'Ext.data.schema.Schema',
    // This configures the default schema because we don't assign an "id":
    // In Extjs5, the raw reader generated field went away.  This provides a transition time behavior. TBD Do not depend on this.
//    constructor: function (data) {
//        this.raw = Ext.apply({}, data);
//        this.callParent(arguments);
//    }
//    schema: {
//
//    }
});
