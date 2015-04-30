StartTest(function (t) {

    t.it('Slider test', function (t) {

        new Ext.Panel({
            renderTo    : document.body,
            xtype       : 'panel',
            title       : 'Slider',
            height      : 200,
            width       : 200,
            layout      : 'anchor',

            items : [
                {
                    xtype     : 'slider',
                    anchor    : '100%'
                },
                {
                    xtype    : 'slider',
                    vertical : true,
                    height   : 100
                }
            ]
        });

        // Menus require a bit of special treatment since a submenu doesn't open sync,
        // We may actually need to automatically inject a 'waitForTarget' statement before clicking a menu item
        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : 'panel slider => .x-slider-thumb', by: [40, 0], offset : [5, 5] },
            { drag : 'panel slider => .x-slider-thumb', by: [-30, 0], offset : [5, 5] },

            function () {
                var steps = recorder.getRecordedActionsAsSteps();

                recorder.stop();

                t.is(steps.length, 2);
                
                t.is(steps[ 0 ].action, "drag")
                t.is(steps[ 0 ].target, "panel[title=Slider] slider => .x-slider-thumb")
                
                t.isDeeply(steps[ 0 ].by, [ 40, 0 ]);
                t.isApprox(steps[ 0 ].offset[ 0 ], 5, 2);
                t.isApprox(steps[ 0 ].offset[ 1 ], 5, 2);

                t.is(steps[ 1 ].action, "drag")
                t.is(steps[ 1 ].target, "panel[title=Slider] slider => .x-slider-thumb")
                t.isDeeply(steps[ 1 ].by, [ -30, 0 ]);
                t.isApprox(steps[ 1 ].offset[ 0 ], 5, 2);
                t.isApprox(steps[ 1 ].offset[ 1 ], 5, 2);
            }
        );
    })
})