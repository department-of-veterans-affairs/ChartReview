StartTest(function (t) {
    document.body.innerHTML = 'foo';

    t.it('Click with ctrl key, with ctrl + shift', function (t) {
        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : [ 1, 1 ], options : { ctrlKey : true } },
            { click : [ 1, 1 ], options : { ctrlKey : true, shiftKey : true } },

            function () {
                var steps   = recorder.getRecordedActionsAsSteps();

                recorder.stop();

                t.isDeeply(
                    steps, 
                    [
                        { action : "click", target : [ 1, 1 ], options : { ctrlKey : true } },
                        { action : "click", target : [ 1, 1 ], options : { ctrlKey : true, shiftKey : true } }
                    ]
                )
            }
        );
    })

    t.iit('Typing chars with SHIFT should work', function (t) {
        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();
        var KeyCodes        = Siesta.Test.Simulate.KeyCodes().keys

        var el              = document.body;

        t.chain(
            { type : 'f' },

            function(next) {
                t.simulateEvent(el, 'keydown', { keyCode : KeyCodes.SHIFT });
                t.simulateEvent(el, 'keydown', { keyCode : 65 });
                t.simulateEvent(el, 'keypress', { keyCode : 0, charCode : 65, shiftKey : true });
                t.simulateEvent(el, 'keyup', { keyCode : KeyCodes.A });
                t.simulateEvent(el, 'keyup', { keyCode : KeyCodes.SHIFT });

                next()
            },

            { type : 'n' },

            function() {
                var steps   = recorder.getRecordedActions();

                t.is(steps.length, 1)
                t.is(steps[0].value, 'fAn')
            }
        )

    })

})