StartTest(function (t) {

    t.it('Simple HTML', function (t) {
        t.expectGlobals('0', 'frame')
        
        document.body.innerHTML     = '<iframe frameborder=0 style="margin:0;padding:0" id="frame" src="html-pages/basic1.html"/>';
        var recorderManager, recorder;

        t.chain(
            {
                waitFor : function() {
                    var body        = document.getElementById('frame').contentWindow.document.body
                    
                    return body && body.innerHTML.match('div');
                }
            },

            function(next) {
                recorderManager     = t.getRecorderPanel(null, null, document.getElementById('frame'));
                recorder            = recorderManager.recorder;
                next();
            },

            { click : [ 50, 50 ] },

            {
                waitFor : function() {
                    var body     = document.getElementById('frame').contentWindow.document.body
                    
                    return body && body.innerHTML.match('BAAAAAAAZ');
                }
            },

            { waitFor : 500 },

            function (next) {
                var events = recorder.getRecordedEvents();
                t.is(events.length, 0, 'Recorder queue should be cleared on page load');
                
                t.is(recorder.window, document.getElementById('frame').contentWindow, 'Recorder attached to new window object');
                next()
            },

            { click : [ 20, 20 ] },

            { waitFor : 500 },

            function () {
                var steps = recorderManager.generateSteps();

                recorder.stop();

                t.is(steps.length, 3)
                
                t.isDeeply(steps[ 0 ], { action : "click", target : ".foo", offset : [ 50, 50 ] })
                
                t.is(steps[ 1 ].waitFor, "PageLoad")
                
                t.isDeeply(steps[ 2 ], { action : "click", target : ".bar", offset : [ 20, 20 ] })
            }
        )
    })
})