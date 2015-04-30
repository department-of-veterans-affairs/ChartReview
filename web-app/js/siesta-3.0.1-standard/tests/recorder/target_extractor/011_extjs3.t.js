StartTest(function (t) {

    function getRecorder(frame) {
        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(frame.contentWindow);
        recorder.start();

        return recorder;
    }

    t.it('Ext JS 3 form', function (t) {
        // 0 - global refrence for iframe in FF, 'frame' - in IE
        t.expectGlobals('0', 'frame')
        
        document.body.innerHTML     = '<iframe id="frame" src="html-pages/extjs3.html" frameborder=0></iframe>'
        var frame                   = document.getElementById('frame');
        
        var recorderManager;
        var recorder;
        
        var Ext3

        t.chain(
            { waitFor : function() { return frame.contentWindow.Ext && frame.contentWindow.Ext.getCmp && frame.contentWindow.Ext.getCmp('theform'); } },

            function(next) {
                recorder = getRecorder(frame);

                Ext3                = frame.contentWindow.Ext
                
                next();
            },

            { click : function () { return Ext3.query("#theform .foo")[ 0 ] } },
            { click : function () { return Ext3.query("#theform .baz")[ 0 ] } },

            function () {
                var steps = recorder.getRecordedActionsAsSteps();

                recorder.stop();

                t.is(steps.length, 2);
                t.isDeeply(steps[ 0 ], { action : "click", target : "#theform .foo", offset : [ t.any(Number), t.any(Number) ] })
                t.isDeeply(steps[ 1 ], { action : "click", target : "#theform .baz", offset : [ t.any(Number), t.any(Number) ] })
            }
        );
    })
})