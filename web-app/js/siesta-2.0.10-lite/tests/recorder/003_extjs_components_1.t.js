StartTest(function (t) {

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

        var recorderPanel       = t.getRecorderPanel();
        var recorder            = recorderPanel.recorder;

        t.chain(
            { click : win.down('button')},

            function (next) {
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 1);
                t.is(recordedActions[ 0 ].action, 'click', 'action ok');
                t.is(recordedActions[ 0 ].target.activeTarget, 'csq', 'target type ok');

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
            buttons     : [
                {
                    id      : 'btn',
                    text    : 'hit me'
                }
            ]
        }).show();

        var recorderPanel       = t.getRecorderPanel();
        var recorder            = recorderPanel.recorder;

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
                
//                var steps           = recorderPanel.generateSteps()

//                t.subTest('Generated steps', function (t) {
//                    
//                    var step0           = steps[ 0 ]
//                    
//                    t.is(step0.action, 'drag', 'action drag');
//                    t.isDeeply(step0.by, [ 50, 20 ], 'drag by');
//                    t.notOk(step0.to, 'If "by" exists, skip "to"');
//                    t.notOk(step0.toOffset, 'If "by" exists, skip "toOffset"');
//
//                    t.is(step0.target, "#win header => .x-header-text-container", 'drag target');
//
//                    t.is(steps[ 1 ].action, 'click');
//                    t.is(steps[ 2 ].action, 'drag', '1 mousedown, mouseup is coalesced => drag');
//                    t.isDeeply(steps[ 2 ].by, [ -40, -10 ], 'drag by');
//                });

                t.contentLike(recorderPanel.down('gridview').getCell(0, recorderPanel.down('targetcolumn')), 'by: [50,20]')

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

    t.xit('Should produce expected output when typing', function (t) {
        var txt         = new Ext.form.TextField({
            renderTo    : document.body,
            id          : 'txt'
        });
        
        txt.focus(true);

        var recorderPanel     = t.getRecorderPanel();
        var recorder            = recorderPanel.recorder;

        t.diag('Record');

        t.chain(
            { waitFor : 500 },

            { type : 'foo[BACKSPACE]123,.', target : '>>#txt' },

            function (next) {
                recorder.stop();
                
                t.is(recorder.getRecordedEvents().length, 27, "9 `raw` keydown+keypress+keyup triples recorded")
                
                var recordedActions     = recorderPanel.getActions(true);

                t.is(recordedActions.length, 1, '1 type operation')
                t.is(recordedActions[ 0 ].type, 'type', '1 type operation')
                
                t.is(txt.getValue(), 'fo123,.');

                txt.setValue('');

                t.diag('Playback');

                t.chain(
                    recorderPanel.generateSteps(),

                    function () {
                        var record = recorderPanel.store.first();

                        t.is(txt.getValue(), 'fo123,.');
                        t.is(record.get('type'), 'type');
                        t.is(record.get('actionTarget'), 'foo[BACKSPACE]123,.');
                        t.matchGridCellContent(recorderPanel.down('gridpanel'), 0, 1, 'foo[BACKSPACE]123,.')

                        if (t.getFailCount() === 0) {
                            recorderPanel.destroy();
                            txt.destroy();
                        }
                    }
                )
            }
        )
    })
})