describe('Event view type column', function (t) {

    t.it('Integration test', function (t) {
        document.body.innerHTML = '<div id="div"></div>'

        var view = new Siesta.Recorder.UI.EventView({
            height   : 300,
            width    : 600,
            renderTo : Ext.getBody(),
            test     : t,
            store    : new Ext.data.Store({
                model   : 'Siesta.Recorder.Model.Action',
                data  : [
                    { action    : 'click',      target  : [ { type : 'css', target : '#div' } ]},
                    { action    : 'dblclick',   target  : [ { type : 'css', target : '#div' } ]},
                    { action    : 'type',       value   : 'asfs' }
                ]
            })
        });

        var record = view.store.first();
        
        var editPlugin  = view.editing

        t.chain(
            { waitForRowsVisible : view },

            function (next) {
                editPlugin.startEdit(0, 0);
                editPlugin.getActiveEditor().setValue('dblclick');
                editPlugin.completeEdit();

                t.isDeeply(record.getTarget(), { type : 'css', target : '#div' }, 'Should keep actionTarget when switching the type to same kind of action')

                editPlugin.startEdit(0, 0);
                editPlugin.getActiveEditor().setValue('type');
                editPlugin.completeEdit();

                t.notOk(record.getTarget(), 'Should clear actionTarget when switching the type to a new kind')

                editPlugin.startEdit(1, 0);

                editPlugin.getActiveEditor().setValue('fn');

                next();
            },

            { waitFor : function () { return t.elementIsTop(editPlugin.getActiveEditor().field) } },
            { type : '[TAB]', target : function () { return editPlugin.getActiveEditor().field } },
            { waitFor : function() { return editPlugin.getActiveEditor(); }},

            function (next) {
                t.isaOk(editPlugin.getActiveEditor().field, Ext.ux.form.field.CodeMirror, 'Should switch to correct editor when using TAB')

                editPlugin.startEdit(1, 0);
                editPlugin.getActiveEditor().setValue('click');

                next();
            },

            { waitFor : function () { return t.elementIsTop(editPlugin.getActiveEditor().field) } },
            { type : '[TAB]', target : function () { return editPlugin.getActiveEditor().field } },
            { waitFor : function() { return editPlugin.getActiveEditor(); }, desc : 'waiting for editor to exist'},

            function (next) {
                t.isaOk(editPlugin.getActiveEditor().field, Siesta.Recorder.Editor.Target, 'Should switch to correct editor when using TAB')
            }
        );
    })
})