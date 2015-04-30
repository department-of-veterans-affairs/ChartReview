StartTest(function (t) {

    t.describe('Event view edit target', function (t) {
        var view = new Siesta.Recorder.UI.EventView({
            height   : 300,
            width    : 600,
            renderTo : Ext.getBody(),
            test     : t,
            store    : new Ext.data.Store({
                model   : 'Siesta.Recorder.Model.Action',
                data    : [
                    { action : 'click', target : [ { type : 'css', target : '#div' }, { type : 'css1', target : '#div1' } ] },
                    { action : 'waitForMs', value : 1000 },
                    { action : 'waitForFn', value : 'return 2 > 1;'},
                    { action : 'fn', value : "Ext.get(div).setStyle('background-color', 'black');" },
                    { action : 'type', value : "foo" }
                ]
            })
        });

        t.it('Editing click target', function (t) {
            t.chain(
                { waitFor : 'rowsVisible' },

                { click : '.x-grid-cell:contains(#div)' },

                { waitForSelectorAtCursor : 'input' },
                
                function (next) {
                    t.ok(view.editing.getActiveEditor().field instanceof Siesta.Recorder.Editor.Target, 'targetEditor ok')
                    next();
                },

                { type : "2[ENTER]" },

                function (next) {
                    t.matchGridCellContent(view, 0, 1, '#div2', 'Cell correctly updated')
                    
                    t.isDeeply(
                        view.store.getAt(0).getTarget(), 
                        { type : 'user', target : '#div2' }, 
                        'Edited regular target ok'
                    )
                }
            );
        });

        t.it('Editing waitForMs', function (t) {

            t.chain(
                { waitFor : 'rowsVisible' },

                { click : '.x-grid-cell:contains(1000)' },

                { waitForSelectorAtCursor : 'input' },

                function (next) {
                    t.isaOk(view.editing.getActiveEditor().field, Ext.form.field.Text, 'waitForMs editor ok')
                    next();
                },

                { type : "2[ENTER]" },

                function (next) {
                    t.is(view.store.getAt(1).get('value'), "10002", 'Edited waitForMs number ok')
                    next();
                }
            );
        });

        t.it('Editing waitForFn', function (t) {

            t.chain(
                { waitFor : 'rowsVisible' },

                { click : '.x-grid-cell:contains(return)' },

                { waitForSelectorAtCursor : '.siesta-recorder-codeeditor *' },

                function (next) {
                    t.isaOk(view.editing.getActiveEditor().field, Siesta.Recorder.Editor.Code, 'waitForFn editor ok')
                    
                    view.editing.completeEdit()
                    next();
                }
            );
        });

        t.it('Editing fn', function (t) {

            t.chain(
                { waitFor : 'rowsVisible' },

                { click : '.x-grid-cell:contains(background-color)' },

                { waitForSelectorAtCursor : '.siesta-recorder-codeeditor *' },

                function (next) {
                    t.isaOk(view.editing.getActiveEditor().field, Siesta.Recorder.Editor.Code, 'fn editor ok');
                    
                    view.editing.completeEdit()
                    next();
              }
            );
        })

        t.it('Editing fn', function (t) {

            t.chain(
                { waitFor : 'rowsVisible' },

                { click : '.x-grid-cell:contains(foo)' },

                { waitForSelectorAtCursor : 'input' },

                function (next) {
                    t.is(t.getElementAtCursor().value, 'foo', 'Value populated');
                    t.is(view.editing.getActiveEditor().field.xtype, 'textfield', 'type editor ok');

                    next();
                }
            );
        })
    })
})