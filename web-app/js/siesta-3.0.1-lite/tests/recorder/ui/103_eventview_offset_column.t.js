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
            { waitForRowsVisible : view },

            function (next) {
                t.it('Set a % offset', function(t) {
                    editPlugin.startEdit(0, 2);
                    editPlugin.getActiveEditor().setValue('33,100%');
                    editPlugin.completeEdit();

                    t.isDeeply(record.getTargetOffset(), [33, "100%"], 'Offset ok');
                    t.contentLike('.eventview-offsetcolumn .x-grid-cell-inner', '33,100%');
                })

                t.it('Set a number offset', function(t) {
                    editPlugin.startEdit(0, 2);
                    editPlugin.getActiveEditor().setValue('33,0');
                    editPlugin.completeEdit();

                    t.isDeeply(record.getTargetOffset(), [33, 0], 'Offset ok')
                    t.contentLike('.eventview-offsetcolumn .x-grid-cell-inner', '33,0');
                })

                t.it('Ignore a bad offset', function(t) {
                    editPlugin.startEdit(0, 2);
                    editPlugin.getActiveEditor().setValue('blargh');
                    editPlugin.completeEdit();

                    t.isDeeply(record.getTargetOffset(), [33, 0], 'Crap input ignored')
                    t.contentLike('.eventview-offsetcolumn .x-grid-cell-inner', '33,0');
                });

                t.it('Ignore a bad offset #2', function(t) {
                    editPlugin.startEdit(0, 2);
                    editPlugin.getActiveEditor().setValue('foo,bar');
                    editPlugin.completeEdit();

                    t.isDeeply(record.getTargetOffset(), [33, 0], 'Crap input ignored 2')
                    t.contentLike('.eventview-offsetcolumn .x-grid-cell-inner', '33,0');
                });

                t.it('Clear offset by setting empty', function(t) {
                    editPlugin.startEdit(0, 2);
                    editPlugin.getActiveEditor().setValue('');
                    editPlugin.completeEdit();

                    t.notOk(record.getTargetOffset(), 'Removing offset should work')

                    var val = $('.eventview-offsetcolumn .x-grid-cell-inner')[0].innerHTML.replace('&nbsp;', '');
                    t.is(val, '');
                });
            }
        );
    })
})