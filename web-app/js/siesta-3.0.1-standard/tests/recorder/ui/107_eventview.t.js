StartTest(function (t) {

    t.it('Event view', function (t) {
        var view = new Siesta.Recorder.UI.EventView({
            height      : 200,
            width       : 400,
            renderTo    : Ext.getBody(),
            test        : t,
            store       : new Ext.data.Store({
                model   : 'Siesta.Recorder.Model.Action',
                data    : [
                    { action    : 'click', target : [ { type : 'css', target : '#div' } ] },
                    { action    : 'waitForMs', value : 1000 },
                    { action    : 'fn', value : "Ext.get(div).addCls('black');" }
                ]
            })
        });

        t.chain(
            { waitForRowsVisible : view },

            { dblclick : "eventview => .eventview-typecolumn:contains(waitForMs)" },

            { waitForSelectorAtCursor : 'input'},

            { waitFor : 100 },

            { type : "fn" },
            { click : ">>eventview", offset : [10, '100%'] }
        );
    })
})