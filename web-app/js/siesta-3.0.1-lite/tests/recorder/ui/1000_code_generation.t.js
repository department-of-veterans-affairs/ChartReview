StartTest(function (t) {

    var getRecorderPanel = function () {
        var recorderManager = new Siesta.Recorder.UI.RecorderPanel({
            width    : 600,
            height   : 200,
            renderTo : document.body
        });

        return recorderManager;
    }

    t.it('Basic code generation', function (t) {

        var recorderManager = getRecorderPanel();

        recorderManager.store.loadData([
            { action : 'click', target : [ { type : 'css', target : 'button', offset : [10, 20] } ] },
            { action : 'click', target : [ { type : 'css', target : 'button' } ], options : { ctrlKey : true, shiftKey : true, foo : "bar" } },
            { action : 'waitForMs', value : "300" },
            { action : 'fn', value : "Ext.getBody().setStyle('background-color', 'black');" }
        ])

        var codeSteps       = recorderManager.generateCodeForSteps();

        t.is(codeSteps[ 0 ], '{ click : "button", offset : [10, 20] }');
        t.is(codeSteps[ 1 ], '{ click : "button", options : { ctrlKey : true, shiftKey : true, foo : "bar" } }');
        t.is(codeSteps[ 2 ], '{ waitFor : "Ms", args : 300 }')

        t.like(codeSteps[3].toString(), "Ext.getBody().setStyle('background-color', 'black');");
        t.like(codeSteps[3].toString(), "next();");
    })
})