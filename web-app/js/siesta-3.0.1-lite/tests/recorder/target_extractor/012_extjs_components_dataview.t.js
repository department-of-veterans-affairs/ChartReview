StartTest(function (t) {

    Ext.define('Ext.Company', {
        extend : 'Ext.data.Model',
        fields : [
            {name : 'company'},
            {name : 'price', type : 'float'}
        ]
    });

    var store = Ext.create('Ext.data.ArrayStore', {
        model : 'Ext.Company',
        data  : [
            [ 'foo', 71.72 ],
            [ 'bar', 29.01 ],
            [ 'baz', 83.81 ]
        ]
    });

    t.it('DataView 1', function (t) {
        Ext.create('Ext.Panel', {
            id          : 'pnl',
            width       : 150,
            renderTo    : Ext.getBody(),
            items       : Ext.create('Ext.view.View', {
                store       : store,
                tpl         : [
                    '<tpl for=".">',
                        '<div class="thumb-wrap {name}">',
                            '<span>{company} {price}</span>',
                        '</div>',
                    '</tpl>'
                ],
                height          : 100,
                itemSelector    : 'div.thumb-wrap'
            })
        });

        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        t.chain(
            { waitForSelector : '.thumb-wrap' },

            { click : '#pnl .thumb-wrap:nth-child(1) span' },
            { click : '#pnl .thumb-wrap:nth-child(2) span' },
            { click : '#pnl .thumb-wrap:nth-child(3) span' },

            function () {
                recorder.stop();

                var steps = recorder.getRecordedActions();

                t.is(steps.length, 3);

                t.is(steps[0].getTarget().target, '#pnl dataview => div.thumb-wrap:nth-child(1) span')
                t.is(steps[1].getTarget().target, '#pnl dataview => div.thumb-wrap:nth-child(2) span')
                t.is(steps[2].getTarget().target, '#pnl dataview => div.thumb-wrap:nth-child(3) span')
            }
        )
    })

    
    t.it('DataView 2', function (t) {
        Ext.create('Ext.Panel', {
            width    : 150,
            renderTo : Ext.getBody(),
            items    : Ext.create('Ext.view.View', {
                id           : 'view',
                store        : store,
                tpl          : [
                    '<tpl for=".">',
                        '<div class="thumb-wrap">',
                            '<span class="{company}">{company} {price}</span>',
                        '</div>',
                    '</tpl>'
                ],
                height       : 100,
                itemSelector : 'div.thumb-wrap'
            })
        });

        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        t.chain(
            { waitForSelector : '#view .thumb-wrap' },

            { click : '#view .thumb-wrap:nth-child(1) span' },
            { waitFor : 400 },

            { click : '#view .thumb-wrap:nth-child(2) span' },
            { waitFor : 400 },

            { click : '#view .thumb-wrap:nth-child(3) span' },
            { waitFor : 400 },

            function () {
                recorder.stop();

                var steps = recorder.getRecordedActions();

                t.is(steps.length, 3);

                t.is(steps[0].getTarget().target, '#view => div.thumb-wrap:nth-child(1) .foo')
                t.is(steps[1].getTarget().target, '#view => div.thumb-wrap:nth-child(2) .bar')
                t.is(steps[2].getTarget().target, '#view => div.thumb-wrap:nth-child(3) .baz')
            }
        )
    })

    t.it('DataView 3', function (t) {

        Ext.create('Ext.Panel', {
            width    : 150,
            renderTo : Ext.getBody(),
            items    : Ext.create('Ext.view.View', {
                id           : 'view2',
                store        : store,
                tpl          : [
                    '<div>some extra outer stuff</div>',
                    '<div><span>boooooooo</span>',
                        '<tpl for=".">',
                            '<div class="thumb-wrap">',
                                '<div>',
                                    '<span class="{company}">{company} {price}</span>',
                                '</div>',
                            '</div>',
                        '</tpl>',
                    '</div>'
                ],
                height       : 100,
                itemSelector : '.thumb-wrap'
            })
        });

        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        t.chain(
            { waitFor : 'selector', args : '#view2 .thumb-wrap' },

            { click : '#view2 .thumb-wrap:nth-child(2) span' },
            { waitFor : 400 },

            { click : '#view2 .thumb-wrap:nth-child(3) span' },
            { waitFor : 400 },

            { click : '#view2 .thumb-wrap:nth-child(4) span' },
            { waitFor : 400 },

            function () {
                recorder.stop();

                var steps = recorder.getRecordedActions();

                t.is(steps.length, 3);

                t.is(steps[0].getTarget().target, '#view2 => .thumb-wrap:nth-child(2) .foo')
                t.is(steps[1].getTarget().target, '#view2 => .thumb-wrap:nth-child(3) .bar')
                t.is(steps[2].getTarget().target, '#view2 => .thumb-wrap:nth-child(4) .baz')
            }
        )
    })

    t.it('DataView empty', function (t) {

        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        Ext.create('Ext.Panel', {
            width    : 150,
            renderTo : Ext.getBody(),
            items    : Ext.create('Ext.view.View', {
                id           : 'view3',
                store        : new Ext.data.Store({ proxy : 'memory' }),
                tpl          : [
                    '<div>some extra outer stuff</div>',
                        '<tpl for=".">',
                            '<span class="{company}">{company} {price}</span>',
                        '</tpl>',
                    '</div>'
                ],
                height       : 100,
                itemSelector : '.thumb-wrap'
            })
        });

        t.chain(
            { click : '#view3' },
            { waitFor : 400 },

            function () {
                recorder.stop();

                var steps = recorder.getRecordedActions();

                t.is(steps.length, 1);

                t.is(steps[0].getTarget().target, '#view3')
            }
        )
    })
})