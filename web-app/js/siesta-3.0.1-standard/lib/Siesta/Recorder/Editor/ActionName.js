/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.Editor.ActionName', {
    extend          : 'Ext.form.field.ComboBox',
    alias           : 'widget.typeeditor',
    
    displayField    : 'id',
    valueField      : 'id',
    queryMode       : 'local',
    matchFieldWidth : false,
    forceSelection  : true,
    typeAhead       : true,
    selectOnFocus   : true,

    // TODO move to test class autogenerate these (either during Siesta build or at Siesta runtime - via JsDuck?)
    // Not all commands can be edited either (like waitForStoresToLoad etc).
    actions         : [
        { id : 'click', type : 'mouseinput' },
        { id : 'dblclick', type : 'mouseinput' },
        { id : 'contextmenu', type : 'mouseinput' },

        { id : 'drag', type : 'mouseinput' },
        { id : 'fn', type : 'fn' },
        { id : 'moveCursorTo', type : 'mouseinput' },
        { id : 'moveCursorBy', type : 'mouseinput' },
        { id : 'type', type : 'keyinput' }
    ],

    initComponent : function () {
        this.store = new Ext.data.JsonStore({
            fields : [ 'id', 'type' ]
        });

        this.callParent();
    },
    
    
    applyChanges : function (actionRecord) {
        actionRecord.setAction(this.getValue())
    },
    

    populate : function (test) {
        var waitActions = [];

        for (var o in test) {
            if (o.match(/waitFor.+/) && typeof test[ o ] === 'function') {
                waitActions.push({ id : o, type : 'wait' });
            }
        }

        var actions = this.actions.concat(waitActions).sort(function(a, b) { return a.id < b.id ? -1 : 1; });

        this.store.loadData(actions);
    }

});
