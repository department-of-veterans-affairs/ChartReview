StartTest(function (t) {

    t.it('DataView empty', function (t) {
        var recorderManager = t.getRecorderPanel();
        var recorder        = recorderManager.recorder;

        Ext.create('Ext.TabPanel', {
            width    : 350,
            height   : 100,

            renderTo : Ext.getBody(),
            items    : [
                {
                    title : 'foooooooooooo'
                },
                {
                    title   : 'barbarbarbar',
                    iconCls : 'somecls'
                },
                {
                    iconCls : 'onlyIconCls'
                }
            ]
        });

        t.chain(
            { click : '>>tab[text=foooooooooooo]' },
            { click : '>>tab[iconCls=somecls]' },
            { click : '>>tab[iconCls=onlyIconCls]' },

            function () {
                recorder.stop();

                var store = recorderManager.store;

                t.is(store.getCount(), 3);

                t.is(store.getAt(0).getTarget().target, 'tab[text=foooooooooooo] => .x-tab-inner')
                t.is(store.getAt(1).getTarget().target, 'tab[text=barbarbarbar] => .x-tab-inner')
                t.is(store.getAt(2).getTarget().target, 'tab[iconCls=onlyIconCls] => .onlyIconCls')
            }
        )
    })
})