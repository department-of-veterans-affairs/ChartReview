StartTest(function (t) {

    t.it('Should produce expected targets for clicks', function (t) {
        var panel = new Ext.Panel({
            itemId      : 'pan',
            renderTo    : document.body,
            height      : 200,
            width       : 200,
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

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : 'panel[itemId=pan] => .x-panel-body'},
            { rightclick : '>>#btn' },

            function () {
                recorder.stop();

                var recordedActions  = recorder.getRecordedActions()

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

                t.is(recordedActions[ 1 ].action, 'contextmenu');
                t.isDeeply(
                    recordedActions[ 1 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : t.anyStringLike('[itemId=btn] => .x-btn'),
                        offset      : t.any()
                    },
                    'Correct target extracted'
                );
            }
        );
    });

    t.it('Should produce expected targets for window header click', function (t) {
        var win = new Ext.Window({
            itemId      : 'win',
            x           : 200,
            y           : 0,
            height      : 100,
            width       : 100,
            title       : 'foo'
        }).show();

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        var headerCompositeQuery = Ext.versions.extjs.isLessThan("5") ?
                                  '[itemId=win] header[title=foo] => .x-header-text-container' :
                                  '[itemId=win] header title[text=foo] => .x-title-text'
        t.chain(
            { click : '>>window header' },

            function () {
                recorder.stop();
                
                var recordedActions  = recorder.getRecordedActions()

                t.is(recordedActions.length, 1);
                
                t.is(recordedActions[ 0 ].action, 'click');
                t.isDeeply(
                    recordedActions[ 0 ].getTarget(), 
                    {
                        type        : 'csq',
                        target      : headerCompositeQuery,
                        offset      : t.any()
                    },
                    'Correct target extracted'
                );
            }
        );
    })
})