describe('Event view target column', function (t) {

    t.it('Unit test', function (t) {

        var col = new Siesta.Recorder.UI.TargetColumn();

        t.it('Renderer', function (t) {
            var action = new Siesta.Recorder.Model.Action({ 
                action : 'click', 
                target : [ { type : 'css', target : '#div' } ] 
            });

            t.is(col.renderer('#div', {}, action), '#div');

            action.data.action  = 'drag';
            action.data.by = [ 20, "10%" ];

            t.is(col.renderer('#div', {}, action), '#div by: [20,10%]');

            delete action.data.by;
            action.data.toTarget = new Siesta.Recorder.Target({ targets : [ { type : 'css', target : 'foo' } ]});

            t.is(col.renderer('#div', {}, action), '#div to: foo');
            
            var action = new Siesta.Recorder.Model.Action({ 
                action : 'click', 
                target : [ { type : 'cq', target : '#some_component' } ] 
            });
            
            t.is(col.renderer('#div', {}, action), '>>#some_component');
        })

        t.it('getTargetEditor', function(t) {
            var action = new Siesta.Recorder.Model.Action({ action : 'click' });
            t.isInstanceOf(col.getTargetEditor(action), Siesta.Recorder.Editor.Target, 'click')

            var action = new Siesta.Recorder.Model.Action({ action : 'drag' });
            t.isInstanceOf(col.getTargetEditor(action), Siesta.Recorder.Editor.DragTarget, 'drag')

            var action = new Siesta.Recorder.Model.Action({ action : 'fn' });
            t.isInstanceOf(col.getTargetEditor(action), Siesta.Recorder.Editor.Code, 'fn')

            var action = new Siesta.Recorder.Model.Action({ action : 'waitForFn' });
            t.isInstanceOf(col.getTargetEditor(action), Siesta.Recorder.Editor.Code, 'waitForFn')

            var action = new Siesta.Recorder.Model.Action({ action : 'waitForMs' });
            t.isInstanceOf(col.getTargetEditor(action), Ext.form.NumberField, 'waitForMs')

            var action = new Siesta.Recorder.Model.Action({ action : 'waitForSelector' });
            t.isInstanceOf(col.getTargetEditor(action), Ext.form.TextField, 'waitForSelector')

            var action = new Siesta.Recorder.Model.Action({ action : 'waitForAnimations' });
            t.notOk(col.getTargetEditor(action), 'waitForAnimations')
        })

    })
})