StartTest(function (t) {

    t.it('When clicking on empty space in <body> just an offset should be used', function (t) {
        document.body.style.padding = '50px';

        var recorderPanel   = t.getRecorderPanel();
        var recorder        = recorderPanel.recorder;

        t.chain(
            { click : [ 10, 10 ] },

            function () {
                var actions = recorderPanel.getActions(true);
                
                t.is(actions.length, 1, "One action recorded")
                
                var action  = actions[ 0 ]

                t.is(action.action, 'click');
                
                t.isDeeply(
                    action.getTarget(true).targets, 
                    [
                        {
                            type        : 'xy',
                            target      : [ 10, 10 ]
                        }
                    ],
                    'Correct target extracted'
                )
            }
        )
    });
})