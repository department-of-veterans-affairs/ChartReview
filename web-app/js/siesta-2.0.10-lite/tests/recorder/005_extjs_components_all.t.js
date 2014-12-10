StartTest(function (t) {

    var recorderManager = t.getRecorderPanel();

    t.chain(
        { waitFor : 1000 },

        { click : ">>#form-widgets_header", offset : [330, 22] },

        { click : "#main-container-innerCt", offset : [3, 3] }
    );
})