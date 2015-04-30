StartTest(function (t) {

    t.it('Should be able add/remove rows from the grid', function (t) {
        var recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
            id           : 'rec1',
            width        : 600,
            height       : 200,
            renderTo     : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            }
        });
        recorderPanel.attachTo(t);

        recorderPanel.store.add({ 
            action      : 'click',
            target      : [
                {
                    type        : 'css',
                    target      : "body", 
                    offset      : [ 5, 5 ]
                }
            ] 
        })

        t.chain(
            { click : '#rec1 .eventview-clearoffset' },

            function (next) {
                t.notOk(recorderPanel.store.first().getTargetOffset(), 'Offset cleared')
                next();
            },
            { click : '#rec1 .icon-delete' },

            function (next) {
                t.is(recorderPanel.store.getCount(), 0, 'Deleted a row')
                next();
            },

            { click : '>>#rec1 [action=recorder-add-step]' },
            { click : '>>#rec1 [action=recorder-add-step]' },

            function (next) {
                t.is(recorderPanel.store.getCount(), 2, 'Added two rows')
                next();
            },

            { click : '>>#rec1 [action=recorder-remove-all]' },

            { click : '>>button[text=Yes]' },

            function (next) {
                t.is(recorderPanel.store.getCount(), 0, 'Cleared store')

                if (this.getFailCount() === 0) {
                    recorderPanel.destroy();
                }
            }
        );
    })

    t.it('Should update mousedown action in the UI to "drag"', function (t) {
        var recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
            id           : 'rec10',
            width        : 600,
            height       : 200,
            renderTo     : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            }
        });
        recorderPanel.attachTo(t);
        recorderPanel.recorder.ignoreSynthetic = false;
        recorderPanel.recorder.start();

        t.chain(
            { drag : [1,1], to : [5,5] },

            { waitForSelector : '.eventview-typecolumn:contains(drag)' },

            function (next) {
                recorderPanel.recorder.stop();
            }
        );
    })

    t.it('Should be able start/stop/play', function (t) {
        var recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
            id       : 'rec2',
            width    : 600,
            height   : 200,
            harness  : {
                launch : function () {
                },

                getScriptDescriptor : function () {
                    return {};
                },

                on : function () {
                }
            },
            renderTo : document.body
        });
        recorderPanel.attachTo(t);
        recorderPanel.recorder.ignoreSynthetic = false;

        t.willFireNTimes(recorderPanel, 'startrecord', 1);
        t.willFireNTimes(recorderPanel, 'stoprecord', 1);

        t.notOk(recorderPanel.recorder.active, 'Recorder inactive at first')

        t.chain(
            { click : '>>#rec2 [action=recorder-start]' },

            function (next) {
                t.ok(recorderPanel.recorder.active, 'Recorder active')
                next();
            },

            { click : '#rec2 #eventView => .x-panel-body', offset : [ '50%', '95%' ] },

            function (next) {
                t.is(recorderPanel.store.first().data.action, 'click');
                
                t.isDeeply(recorderPanel.store.first().getTarget(), { 
                    type    : 'csq', 
                    target  : '#rec2 [itemId=eventView] => .x-panel-body',
                    offset  : t.any(Array)
                })
                
                next()
            },

            { click : '>>#rec2 [action=recorder-stop]' },

            function (next) {
                t.notOk(recorderPanel.recorder.active, 'Recorder stopped');
                t.isCalled('launch', recorderPanel.harness);
                next()
            },

            { click : '>>#rec2 [action=recorder-play]' },

            function () {
                if (this.getFailCount() === 0) {
                    recorderPanel.destroy();
                }
            }
        );

    })
})