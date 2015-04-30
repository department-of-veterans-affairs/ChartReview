StartTest(function (t) {

    t.it('Simple HTML', function (t) {
        document.body.innerHTML = '<div class="foo" style="background:gray;width:100px;height:100px">FOO</div><div id="bar" style="background:yellow;width:100px;height:100px">BAR</div>'

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        
        recorder.attach(window)
        recorder.start()

        t.chain(
            { moveCursorTo : '.foo' },
            { action : 'mouseDown', target : '.foo' },
            
            { 
                waitForEvent    : [ recorder, 'actionadd' ],
                trigger         : { moveCursorTo : [150, 150] }
            },
            { 
                waitForEvent    : [ recorder, 'actionadd' ],
                trigger         : { moveCursorTo : "#bar" }
            },
            { action : 'moveCursor', by : [10, 10] },
            { action : 'mouseUp' },

            function () {
                var steps = recorder.getRecordedActionsAsSteps();

                recorder.stop();
                
                t.is(steps.length, 5);
                t.is(steps[ 0 ].action, 'mousedown');
                t.is(steps[ 0 ].target, '.foo');
                t.isDeeply(steps[ 0 ].offset, [50, 50]);

                t.is(steps[ 1 ].action, 'moveCursorTo');
                t.isDeeply(steps[ 1 ].target, [150, 150]);

                t.is(steps[ 2 ].action, 'moveCursorTo');
                t.is(steps[ 2 ].target, '#bar');
                t.isDeeply(steps[ 2 ].offset, [50, 50]);

                t.is(steps[3].action, 'moveCursorTo');
                t.is(steps[3].target, '#bar');
                t.isDeeply(steps[3].offset, [60, 60]);

                t.is(steps[4].action, 'mouseup');
                t.is(steps[4].target, '#bar');
                t.isDeeply(steps[4].offset, [60, 60]);
            }
        )
    })
})