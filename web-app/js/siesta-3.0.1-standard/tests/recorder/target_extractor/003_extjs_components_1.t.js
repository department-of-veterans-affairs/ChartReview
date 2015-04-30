// tests with typing should use sequential run core in general
StartTest({ runCore : 'sequential' }, function (t) {

    t.it('Should produce expected output for a simple mouse scenario', function (t) {
        var win = new Ext.window.Window({
            x           : 0,
            y           : 0,
            height      : 200,
            width       : 100,
            html        : 'foo',
            buttons     : [
                {
                    text    : 'OK'
                }
            ]
        }).show();

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : win.down('button')},

            function (next) {
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 1);
                t.is(recordedActions[ 0 ].action, 'click', 'action ok');
                t.is(recordedActions[ 0 ].target.activeTarget, 'csq', 'target type ok');

                recorder.stop();
                win.destroy();
            }
        );
    })

    t.it('Should produce expected output for a simple mouse scenario', function (t) {
        var win = new Ext.window.Window({
            itemId      : 'win',
            x           : 0,
            y           : 0,
            height      : 200,
            width       : 100,
            html        : 'foo',
            title       : 'title',
            buttons     : [
                {
                    id      : 'btn',
                    text    : 'hit me'
                }
            ]
        }).show();

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : '>>#win header', by : [ 50, 20 ] },

            function (next) {
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 1);
                t.is(recordedActions[ 0 ].action, 'drag', 'mousedown + mouseup is coalesced => drag');

                next()
            },

            { click : '#btn' },

            function(next) {
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 2);
                t.is(recordedActions[ 0 ].action, 'drag', 'mousedown + mouseup is coalesced => drag');
                t.is(recordedActions[ 1 ].action, 'click', 'click coalesced ok');

                next()
            },

            { drag : '>>#win header', by : [ -40, -10 ] },

            function () {
                recorder.stop();
                
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 3);
                t.is(recordedActions[ 0 ].action, 'drag', 'mousedown, mouseup is coalesced => drag');
                t.is(recordedActions[ 1 ].action, 'click');
                t.is(recordedActions[ 2 ].action, 'drag', 'mousedown, mouseup is coalesced => drag');
                
                var steps           = recorder.getRecordedActionsAsSteps()

                t.subTest('Generated steps', function (t) {

                    var step0           = steps[ 0 ]

                    t.is(step0.action, 'drag', 'action drag');
                    t.isDeeply(step0.by, [ 50, 20 ], 'drag by');
                    t.notOk(step0.to, 'If "by" exists, skip "to"');
                    t.notOk(step0.toOffset, 'If "by" exists, skip "toOffset"');

                    t.is(step0.target,
                        Ext.versions.extjs.isLessThan('5') ?
                            "[itemId=win] header[title=title] => .x-header-text-container" :
                            "[itemId=win] header title[text=title] => .x-title-text",
                        'drag target');

                    t.is(steps[ 1 ].action, 'click');
                    t.is(steps[ 2 ].action, 'drag', '1 mousedown, mouseup is coalesced => drag');
                    t.isDeeply(steps[ 2 ].by, [ -40, -10 ], 'drag by');
                });

                //t.contentLike(recorderPanel.down('gridview').getCell(0, recorderPanel.down('targetcolumn')), 'by: [50,20]')

//                // Reset window position
//                win.setPosition(0, 0);
//
//                t.chain(
//                    steps,
//
//                    function() {
//                        t.hasPosition(win, 10, 10);
//                        t.is(recorderPanel.store.getCount(), 3);
//
//                        if (t.getFailCount() === 0) {
//                            recorderPanel.destroy();
//                            win.destroy();
//                        }
//                    }
//                );
            }
        );
    })

    t.it('Should produce expected output when typing', function (t) {
        var txt         = new Ext.form.TextField({
            renderTo    : document.body,
            id          : 'txt'
        });
        
        txt.focus(true);

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { waitFor : 500 },

            { type : 'foo[BACKSPACE]123,.', target : '>>#txt' },

            function (next) {
                recorder.stop();
                
                t.is(recorder.getRecordedEvents().length, 27, "9 `raw` keydown+keypress+keyup triples recorded")
                
                var recordedActions     = recorder.getRecordedActionsAsSteps();

                t.is(recordedActions.length, 1, '1 type operation')
                t.is(recordedActions[ 0 ].action, 'type', '1 type operation')
                
                t.is(txt.getValue(), 'fo123,.');

                txt.setValue('');

                t.diag('Playback');

                t.chain(
                    recordedActions,

                    function () {
                        var record = recordedActions[0];

                        t.is(txt.getValue(), 'fo123,.');

                        recorder.stop();
                    }
                )
            }
        )
    })
})