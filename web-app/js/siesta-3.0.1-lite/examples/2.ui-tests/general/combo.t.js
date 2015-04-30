StartTest(function(t) {
    
    t.diag("Selecting a combobox item");

    // The data store containing a list of states
    var states = Ext.create('Ext.data.Store', {
        fields  : ['abbr', 'name'],
        data    : [
            {"abbr":"AL", "name":"Alabama"},
            {"abbr":"AK", "name":"Alaska"},
            {"abbr":"AZ", "name":"Arizona"}
        ]
    });
    
    var selected    = false
    
    // Create the combo box, attached to the states data store
    var combo = Ext.create('Ext.form.ComboBox', {
        fieldLabel      : 'Choose State',
        store           : states,
        queryMode       : 'local',
        displayField    : 'name',
        valueField      : 'abbr',
        renderTo        : Ext.getBody(),
        editable        : false,
        listeners       : {
            select  : function (combo, record) {
                selected = true
                
                Ext.Msg.alert('Item selected', 'Selected: ' + record.get('name'))
            }
        }
    });
    
    t.chain(
        {
            click       : 'combobox => .x-form-trigger',
            desc        : 'Successfully clicked'
        },

        { click : 'li:contains(Alaska)' },

        function () {
            t.ok(selected, 'Item was selected')
        }
    )
});