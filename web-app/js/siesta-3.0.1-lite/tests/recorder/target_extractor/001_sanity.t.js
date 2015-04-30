StartTest(function (t) {

    t.it('When clicking on empty space in BODY just an offset should be used', function (t) {
        document.body.style.padding = '50px';

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : [ 10, 10 ] },

            function () {
                var actions = recorder.getRecordedActions();
                
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
                );

                t.isDeeply(action.asCode(), "{ click : [10, 10] }" );
            }
        )
    });

    t.it('It should encode DOM node ids containing : and .', function (t) {
        document.body.innerHTML = '<span class="foo" id="foo:bar.">Foo</span>';

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : 'span.foo' },

            function () {
                var actions = recorder.getRecordedActions();

                t.is(actions.length, 1, "One action recorded")

                var action  = actions[ 0 ]

                t.is(action.action, 'click');
                t.is(action.getTarget(true).targets[0].target, '#foo\\:bar\\.', 'Target escaped');
            }
        )
    });
})