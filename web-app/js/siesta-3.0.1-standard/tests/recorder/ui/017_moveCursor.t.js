StartTest(function (t) {
    t.describe('Function step should work', function (t) {
        var recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
            width    : 600,
            height   : 200,
            renderTo : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            }
        });
        recorderPanel.attachTo(t);

        recorderPanel.store.loadData(
            [
                { action : 'moveCursor' }
            ]
        );

        var view = recorderPanel.down('eventview')
        view.editing.startEdit(0, 1);

        t.isInstanceOf(view.editing.getActiveEditor().field, Siesta.Recorder.Editor.MoveCursorTarget, 'Text field found');

        view.editing.getActiveEditor().field.byEditor.setValue('40,40');
        
        t.cq1('movecursoreditor').applyValues();
        
        view.editing.completeEdit();

        t.it('should update grid content', function(t) {
            t.matchGridCellContent(recorderPanel.eventView, 0, 1, 'by: [40,40]')
        })
        
        t.it('should convert text to array', function(t) {
            var rec = recorderPanel.store.first();

            t.isDeeply(rec.data.by, [ 40, 40 ]);
        })

        t.it('should generate proper step', function(t) {
            var steps = recorderPanel.generateSteps();
            
            t.is(steps.length, 1);

            t.isDeeply(steps[ 0 ], { action : 'moveCursor', by : [ 40, 40 ] });
        })
    })
})