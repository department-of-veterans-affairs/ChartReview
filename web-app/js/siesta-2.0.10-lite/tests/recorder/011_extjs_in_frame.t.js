StartTest(function (t) {
    // 0 - global refrence for iframe in FF, 'frame' - in IE
    t.expectGlobals('0', '1', '2', 'frame')

    function getRecorderPanel(frame) {
        var recorderManager = new Siesta.Recorder.UI.RecorderPanel({
            width    : 600,
            height   : 100,
            renderTo : document.body
        });
        recorderManager.attachTo(t);

        var recorder = recorderManager.recorder;

        recorder.ignoreSynthetic = false;
        recorder.start();

        return recorderManager;
    }

    // Make sure we handle targeting frames not yet existing
    setTimeout(function(){
        document.body.innerHTML = '<iframe height="200" width="900" id="frame" src="html-pages/extjs3.html" frameborder=0></iframe>' +
                                '<iframe height="200" width="900" id="frame2" src="html-pages/extjs4.html" frameborder=0></iframe>' +
                                '<iframe height="400" width="900" id="frame3" src="../../../extjs-5.0.0/build/examples/kitchensink" frameborder=0></iframe>';
    }, 500);

    t.it('Ext JS 3 frame', function (t) {

        var recorderManager;
        var recorder;

        t.chain(
            { click : '#frame -> .btn'},

            function(next) {

                recorderManager     = getRecorderPanel();
                recorder            = recorderManager.recorder;

                next();
            },

            { click : '#frame -> .btn'},

            function () {
                var frame           = document.getElementById('frame');
                var Ext3            = frame.contentWindow.Ext
                var steps           = recorderManager.generateSteps();
                var btn             = Ext3.getCmp('theform').items.get(2);
                recorder.stop();

                t.is(steps.length, 1);
                t.is(btn.nbrClicks, 2);
                t.isDeeply(steps[ 0 ], { action : "click", target : "#frame -> #theform .btn .x-btn-text", offset : [ t.any(Number), t.any(Number) ] })
            }
        );
    })

    t.it('Ext JS 4 frame', function (t) {

        var recorderManager;
        var recorder;

        t.chain(
            { click : '#frame2 -> >>button[text=BUTTON]'},

            function(next) {

                recorderManager     = getRecorderPanel();
                recorder            = recorderManager.recorder;

                next();
            },

            { click : '#frame2 -> >>button[text=BUTTON]'},

            function () {
                var frame           = document.getElementById('frame2');
                var Ext4            = frame.contentWindow.Ext
                var steps           = recorderManager.generateSteps();
                var btn             = Ext4.getCmp('theform').down('button');
                recorder.stop();

                t.is(steps.length, 1);
                t.is(btn.nbrClicks, 2);
                t.isDeeply(steps[ 0 ], { action : "click", target : "#frame2 -> #theform button[text=BUTTON] => .x-btn-icon-el", offset : [ t.any(Number), t.any(Number) ] })
            }
        );
    })
})
