StartTest(function (t) {

    t.describe('Event view type column', function (t) {
        document.body.innerHTML = '<div id="div"></div>'

        var view = new Siesta.Recorder.UI.EventView({
            height   : 300,
            width    : 600,
            renderTo : Ext.getBody(),
            test     : t,
            store    : new Ext.data.Store({
                model   : 'Siesta.Recorder.Model.Action',
                data    : [
                    { action    : 'click',      target : [ { type : 'css', target : '#div' } ]},
                ]
            })
        });

        var record      = view.store.first();
        var editPlugin  = view.editing

        t.chain(
            { waitFor : 'rowsVisible' },

            function (next) {
                editPlugin.startEdit(0, 2);
                editPlugin.getActiveEditor().setValue('33,100%');
                editPlugin.completeEdit();

                t.isDeeply(record.getTargetOffset(), [33, "100%"], 'Offset ok');

                editPlugin.startEdit(0, 2);
                editPlugin.getActiveEditor().setValue('33,0');
                editPlugin.completeEdit();

                t.isDeeply(record.getTargetOffset(), [33, 0], 'Offset ok')

                editPlugin.startEdit(0, 2);
                editPlugin.getActiveEditor().setValue('blargh');
                editPlugin.completeEdit();

                t.isDeeply(record.getTargetOffset(), [33, 0], 'Crap input ignored')

                editPlugin.startEdit(0, 2);
                editPlugin.getActiveEditor().setValue('foo,bar');
                editPlugin.completeEdit();

                t.isDeeply(record.getTargetOffset(), [33, 0], 'Crap input ignored 2')

                next();
            }
        );
    })
})