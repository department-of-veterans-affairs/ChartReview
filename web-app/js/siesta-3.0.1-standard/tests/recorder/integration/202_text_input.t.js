StartTest(function (t) {

    document.body.innerHTML = '<input id="foo" type="text" />';

    var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

    recorder.attach(window);

    var el = t.$('#foo')[0];

    el.focus();

    function verifyChar(test, char, keyEventInfo) {
        recorder.clear();
        recorder.start();

        keyEventInfo.forEach(function (info) {
            test.simulateEvent(el, info[0], { keyCode : info[1], charCode : info[2] });
        });

        recorder.stop();

        var recordedActions = recorder.getRecordedActions()

        test.is(recordedActions.length, 1);

        if (recordedActions.length) {
            test.is(recordedActions[0].action, 'type');
            test.is(recordedActions[0].value, char);
        }
    }

    t.waitForSelector('input:focus', function () {

        t.it('should record "a"', function (t) {

            verifyChar(t, 'a', [
                    ['keydown', 65, 65],
                    ['keypress', 97, 97],
                    ['keyup', 65, 65]
                ]
            );
        })

        t.it('should record "."', function (t) {

            verifyChar(t, '.', [
                    ['keydown', 190, 190],
                    ['keypress', 46, 46],
                    ['keyup', 190, 190]
                ]
            );

        });

        t.it('should record "-"', function (t) {

            verifyChar(t, '.', [
                    ['keydown', 190, 190],
                    ['keypress', 46, 46],
                    ['keyup', 190, 190]
                ]
            );

        });

        t.it('should record RETURN', function (t) {

            verifyChar(t, '[RETURN]', [
                    ['keydown', 13, 13],
                    ['keypress', 13, 13],
                    ['keyup', 13, 13]
                ]
            );

        });

        t.it('should record arrow RIGHT', function (t) {

            verifyChar(t, '[RIGHT]', [
                    ['keydown', 39, 39],
                    ['keyup', 39, 39]
                ]
            );

        });
    });
})