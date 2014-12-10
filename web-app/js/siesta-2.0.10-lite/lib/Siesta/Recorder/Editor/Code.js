/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.Editor.Code', {
    extend      : 'Ext.ux.form.field.CodeMirror',
    
    height      : 100,
    cls         : 'siesta-recorder-codeeditor',

    listeners : {
        afterrender : function () {
            this.editor.focus();
        },
        delay       : 50
    },

//    isValid : function() {
//        var syntaxOk = true;
//        var val = this.getValue();
//
//        return syntaxOk && this.callParent(arguments);
//    },

    
    applyChanges : function (actionRecord) {
        actionRecord.set('value', this.getValue())
    },
    
    
    getEditorValue : function (record) {
        return record.get('value')
    },    
    

    getErrors: function () {
        var value = this.getValue();

        if (value) {
            try {
                new Function(value)
            } catch (e) {
                return [ Siesta.Resource('Siesta.Recorder.Editor.Code', 'invalidSyntax') ];
            }
        }

        return this.callParent(arguments);
    }
})