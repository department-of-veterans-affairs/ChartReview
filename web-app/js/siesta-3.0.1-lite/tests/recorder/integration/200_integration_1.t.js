StartTest(function (t) {
    
    t.expectGlobals('0', '1', '601_siesta_ui_failing.t.js', '601_siesta_ui_passing.t.js')

    t.getHarness([
        'testfiles/601_siesta_ui_failing.t.js',
        'testfiles/601_siesta_ui_passing.t.js'
    ]);

    t.it('Should not crash when starting recorder without a test', function (t) {
        var recPanel
        
        t.chain(
            { click : '>> [action=toggle-recorder]' },

            function(next) {
                recPanel = t.cq1('[slot=recorderPanel]');

                t.wontFire(recPanel, 'startrecord')

                next();
            },

            { click : '>> [action=recorder-start]' },

            function(next) {
                t.messageBoxIsVisible();
                t.notOk(recPanel.test, 'Should not be bound to anything');

                Ext.Msg.hide();

                next()
            },

            { click : '>> recorderpanel [text=Close]' }
        );
    })

    t.it('Should be bound to a test after running it', function (t) {
        var recPanel

        t.chain(
            { waitFor : 'harnessReady' },

            function (next) {
                recPanel = t.cq1('[slot=recorderPanel]');

                t.wontFire(recPanel, 'startrecord')

                t.waitForHarnessEvent('testsuiteend', next);
                t.runFirstTest();
            },

            function () {
                t.is(recPanel.test.url, 'testfiles/601_siesta_ui_failing.t.js');

                t.messageBoxIsHidden();

                Ext.Msg.hide();
            }
        );
    })

    t.it('Should stop any ongoing recording when running another test', function (t) {

        t.chain(
            { waitForHarnessEvent : 'teststart', trigger : { doubleclick : 'testgrid => .x-grid-row:contains(passing)' } },

            function(next) {
                var recPanel = t.cq1('[slot=recorderPanel]');
                
                t.isnt(t.cq1('[slot=cardContainer]').layout.getActiveItem(), recPanel);

                t.is(recPanel.test.url, 'testfiles/601_siesta_ui_passing.t.js');

                t.messageBoxIsHidden();
            }
        );

    })

    t.it('Should attach to the test after starting recorder again', function (t) {

        t.chain(
            function(next) {
                var recPanel = t.cq1('[slot=recorderPanel]');

                t.firesOnce(recPanel, 'startrecord')
                t.firesOnce(recPanel, 'stoprecord')

                next();
            },
            { click : '>> [action=toggle-recorder]' },
            { click : '>> [action=recorder-start]' },

            function(next) {
                var recPanel = t.cq1('[slot=recorderPanel]');

                t.is(recPanel.test.url, 'testfiles/601_siesta_ui_passing.t.js');

                next();
            },

            { click : '>> [action=recorder-stop]' }
        );
    })
})