StartTest(function (t) {
    t.describe('Function step should work', function (t) {
        document.body.innerHTML = '<div id="div">BAR</div><div id="div2">BAR2</div>'

        var recorderManager = new Siesta.Recorder.UI.RecorderPanel({
            width    : 600,
            height   : 200,
            renderTo : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            }
        });
        recorderManager.attachTo(t);

        recorderManager.store.loadData([
            { action : 'drag', target : [ { type : 'css', target : "#div" } ], by : [ 20, 20 ] },
            { action : 'drag', target : [ { type : 'css', target : "#div" } ], toTarget : [ { type : 'xy', target : [ 20, 20 ] } ] }
        ]);

        var rec         = recorderManager.store.first();
        var view        = recorderManager.down('eventview')
        var editing     = view.editing

        editing.startEdit(0, 1);

        var dragEditorPanel = editing.getActiveEditor().field.getPicker();

        t.isInstanceOf(editing.getActiveEditor().field, Siesta.Recorder.Editor.DragTarget, 'Formpanel found for drag action');

        dragEditorPanel.down('targeteditor[name=target]').setValue('#div2');
        dragEditorPanel.down('textfield[name=by]').setValue('10,11%');

        editing.getActiveEditor().field.applyValues();

        t.isDeeply(rec.getTarget(), { type : 'user', target : '#div2' });
        t.isDeeplyStrict(rec.get('by'), [ 10, "11%" ]);
        t.notOk(rec.get('to'));

//        editing.startEdit(0, 1);
//
//        t.cq1('drageditor').getPicker().form.reset();
//
//        t.cq1('targeteditor[name=target]').setValue('1,2%');
//        t.cq1('textfield[name=toTarget]').setValue('10,21%');
//
//        t.cq1('drageditor').applyValues();
//
//        t.ok(rec.get('actionTarget') instanceof Array);
//        t.ok(rec.get('to') instanceof Array);
//
//        t.isDeeplyStrict(rec.get('actionTarget'), [1, "2%"]);
//        t.isDeeplyStrict(rec.get('to'), [10, "21%"]);
//        t.notOk(rec.get('by'));

        t.xit('verify steps', function(t) {
            var recorderManager = new Siesta.Recorder.UI.RecorderPanel({
            });

            recorderManager.store.loadData([
                { action : 'drag', target : [ { type : 'css', target : "#div" } ], by : [ 20, 20 ] },
                { action : 'drag', target : [ { type : 'css', target : "#div" } ], to : [ 30, 30 ] }
            ]);

            var steps = recorderManager.generateSteps();

            t.isDeeply(steps, [
                {
                    action      : 'drag',
                    target      : '#div',
                    by          : [ 20, 20 ]
                },
                {
                    action      : 'drag',
                    target      : '#div',
                    to          : [ 30, 30 ]
                }
            ])
        });
    })
})