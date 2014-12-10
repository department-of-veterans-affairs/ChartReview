StartTest(function (t) {

    t.it('Event view', function (t) {
        var editor = new Siesta.Recorder.Editor.Target({
            renderTo : Ext.getBody()
        });

        editor.populate(new Siesta.Recorder.Target({
            targets : [
                {
                    type        : 'cq',
                    target      : 'foo'
                },
                {
                    type        : 'xy',
                    target      : [ 10, 20 ]
                },
                {
                    type        : 'csq',
                    target      : 'somecmp => .bar'
                }
            ]
        }))

        t.notOk(editor.getValue())

        t.chain(
            { click : 'targeteditor => .x-form-trigger' },
            { click : 'targeteditor.getPicker() => .x-boundlist-item:contains(foo)' },

            function(next) {
                t.is(editor.getRawValue(), '>>foo')
                
                t.isDeeply(editor.getTarget(), {
                    type        : 'cq',
                    target      : 'foo'
                })
                
                next();
            },

            { click : 'targeteditor => .x-form-trigger' },
            { click : '.x-boundlist-item:contains(10,)' },

            function(next) {
                t.isDeeply(editor.getTarget(), { type : 'xy', target : [10, 20] })

                next();
            },

            { click : 'targeteditor => .x-form-trigger' },
            { click : '.x-boundlist-item:contains(somecmp)' },

            function(next) {
                t.isDeeply(editor.getRawValue(), 'somecmp => .bar')
                t.isDeeply(editor.getTarget(), { type : 'csq', target : 'somecmp => .bar' })

                next();
            }
        )
    })
})