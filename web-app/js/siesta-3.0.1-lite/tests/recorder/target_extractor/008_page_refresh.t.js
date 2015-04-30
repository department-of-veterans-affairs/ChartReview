StartTest(function (t) {

    t.it('Simple HTML', function (t) {
        t.expectGlobals('0', 'frame')
        
        document.body.innerHTML     = '<iframe frameborder=0 style="margin:0;padding:0" id="frame" src="html-pages/basic1.html"/>';
        var recorder;

        t.chain(
            {
                waitFor : function() {
                    var body        = document.getElementById('frame').contentWindow.document.body
                    
                    return body && body.innerHTML.match('div');
                }
            },

            function(next) {
                recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
                recorder.attach(document.getElementById('frame').contentWindow);
                recorder.start();

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
                var steps = recorder.getRecordedActionsAsSteps();

                recorder.stop();

                t.is(steps.length, 2)
                
                t.isDeeply(steps[ 0 ], { waitFor : 'PageLoad', args : [], trigger : { action : "click", target : ".foo", offset : [ 50, 50 ] }})
                
                t.isDeeply(steps[ 1 ], { action : "click", target : ".bar", offset : [ 20, 20 ] })
            }
        )
    })
})