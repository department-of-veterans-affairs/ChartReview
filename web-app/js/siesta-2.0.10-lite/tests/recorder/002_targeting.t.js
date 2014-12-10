StartTest(function (t) {

    t.it('Should produce expected targets for clicks', function (t) {
        var win = new Ext.Panel({
            itemId      : 'pan',
            renderTo    : document.body,
            height      : 100,
            width       : 100,
            title       : 'foo',
            buttons     : [
                {
                    itemId  : 'btn',
                    width   : 100,
                    height  : 50,
                    text    : 'hit me'
                }
            ]
        }).show();

        var recorderPanel     = t.getRecorderPanel();
        var recorder          = recorderPanel.recorder;
        var recordedSteps;

        t.chain(
            { click : 'panel[itemId=pan] => .x-panel-body'},
            { rightclick : '>>#btn' },

            function () {
                recorder.stop();
                
                var recordedActions  = recorderPanel.getActions(true)

                t.is(recordedActions.length, 2);

                t.is(recordedActions[ 0 ].action, 'click');
                t.isDeeply(
                    recordedActions[ 0 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : '[itemId=pan] => .x-panel-body',
                        offset      : t.any()
                    },
                    'Correct target extracted'
                );

                t.is(recordedActions[ 1 ].action, 'rightClick');
                t.isDeeply(
                    recordedActions[ 1 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : t.anyStringLike('[itemId=btn] => .x-btn'),
                        offset      : [ t.anyNumberApprox(50, 5), t.anyNumberApprox(25, 5) ]
                    },
                    'Correct target extracted'
                );
                
//                if (t.getFailCount() === 0) {
//                    recorderPanel.destroy();
//                    win.destroy();
//                }
            }
        );
    });

    t.it('Should produce expected targets for window header click', function (t) {
        var win = new Ext.Window({
            itemId      : 'win',
            x           : 200,
            y           : 0,
            renderTo    : document.body,
            height      : 100,
            width       : 100,
            title       : 'foo'
        }).show();

        var recorderPanel   = t.getRecorderPanel();
        var recorder        = recorderPanel.recorder;
        var recordedSteps;

        t.chain(
            { click : '>>window header' },

            function () {
                recorder.stop();
                
                var recordedActions  = recorderPanel.getActions(true)

                t.is(recordedActions.length, 1);
                
                t.is(recordedActions[ 0 ].action, 'click');
                t.isDeeply(
                    recordedActions[ 0 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : '[itemId=win] header[title=foo] => .x-header-text-container',
                        offset      : t.any()
                    },
                    'Correct target extracted'
                );

//                if (t.getFailCount() === 0) {
//                    recorderPanel.destroy();
//                    win.destroy();
//                }
            }
        );
    })
})