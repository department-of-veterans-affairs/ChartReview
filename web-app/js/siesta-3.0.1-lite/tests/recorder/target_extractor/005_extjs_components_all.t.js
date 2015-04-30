StartTest(function (t) {

    var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

    recorder.attach(window);
    recorder.start();

    t.chain(
        { waitFor : 1000 },

        { click : ">>#form-widgets_header", offset : [330, 22] },

        { click : "#main-container-innerCt", offset : [3, 3] }
    );
})