describe('Should handle frames in the page pointing to other domains', function (t) {
    
    t.expectGlobals('0')

    document.body.innerHTML = '<iframe id="fra" width=200 height=200 src="http://mankz.com" />';
    var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
    recorder.attach(window);

    var frame = document.getElementById("fra");

    t.waitForEvent(frame, 'load', function() {
        recorder.start();
    })
})