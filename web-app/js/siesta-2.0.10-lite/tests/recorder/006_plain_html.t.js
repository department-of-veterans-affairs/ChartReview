StartTest(function (t) {

    t.it('Label field click (triggers extra click)', function (t) {
        document.body.innerHTML = '<label id="lab" for="foo">BAR</label><input id="foo">'

        var recorderPanel   = t.getRecorderPanel();
        var recorder        = recorderPanel.recorder;

        t.chain(
            { click : '#lab' },

            function (next) {
                var actions             = recorderPanel.getActions(true);
                
                t.is(actions.length, 1);
                t.is(actions[ 0 ].action, 'click');
                t.isDeeply(actions[ 0 ].getTarget(), { type : 'css', target : '#lab', offset : t.any() });

                recorder.stop();
//                recorderPanel.clear();
//                recorder.start();

                next()
            }
//            ,
//
//            { rightclick : '#lab' },
//
//            function (next) {
//                var actions             = recorderPanel.getActions(true);
//                
//                t.is(actions.length, 1);
//                t.is(actions[ 0 ].action, 'rightClick');
//                t.isDeeply(actions[ 0 ].getTarget(), { type : 'css', target : '#lab', offset : t.any() });
//
//                recorder.stop();
//                recorderPanel.clear();
//                recorder.start();
//
//                next()
//            },
//
//            { doubleclick : '#lab' },
//
//            function (next) {
//                var actions             = recorderPanel.getActions(true);
//                
//                t.is(actions.length, 1);
//                t.is(actions[ 0 ].action, 'doubleClick');
//                t.isDeeply(actions[ 0 ].getTarget(), { type : 'css', target : '#lab', offset : t.any() });
//                
//                recorder.stop();
//                recorderPanel.clear();
//                recorder.start();
//
//                next()
//            }
        )
    })
})