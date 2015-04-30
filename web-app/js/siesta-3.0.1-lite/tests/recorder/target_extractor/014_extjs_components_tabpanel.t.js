StartTest(function (t) {

    t.it('DataView empty', function (t) {
        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

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

                var steps = recorder.getRecordedActions();

                t.is(steps.length, 3);

                t.is(steps[0].getTarget().target, 'tab[text=foooooooooooo] => .x-tab-inner')
                t.is(steps[1].getTarget().target, 'tab[text=barbarbarbar] => .x-tab-inner')
                t.is(steps[2].getTarget().target, 'tab[iconCls=onlyIconCls] => .onlyIconCls')
            }
        )
    })
})