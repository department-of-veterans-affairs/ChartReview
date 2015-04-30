StartTest(function (t) {
    
    t.it('Re-ordering of steps should work', function (t) {
        var recorderManager = new Siesta.Recorder.UI.RecorderPanel({
            width    : 600,
            height   : 200,
            renderTo : document.body,

            domContainer : {
                highlightTarget : function() {},
                startInspection : function() {},
                clearHighlight  : function() {}
            }
        });
        recorderManager.attachTo(t);

        recorderManager.store.loadData([
            { action : 'drag', target : [ { type : 'css', target : "#div" } ], by : [ 20, 20 ] },
            { action : 'click', target : [ { type : 'css', target : "#div" } ] }
        ]);

        var view = recorderManager.down('eventview')
        
        t.chain(
            { 
                drag    : '.x-grid-cell:contains(drag)', 
                by      : function () {
                    return [ 0, view.getView().getNode(0).offsetHeight * 1.5 ]
                } 
            },

            function() {
                var rec = recorderManager.store.first();
                
                t.is(rec.get('action'), 'click', 'Re-ordering happened correctly');
            }
        )
    })
})