StartTest(function(t) {
    
    var setupBox = function (id) {
        Ext.get(id).on({
            touchstart      : function (e) { log.push("touchstart/" + id) },
            touchend        : function (e) { log.push("touchend/" + id) },
            touchmove       : function (e) { log.push("touchmove/" + id) },
            pinch           : function (e) { log.push("pinch/" + id) },
            pinchstart      : function (e) { log.push("pinchstart/" + id) },
            pinchend        : function (e) { log.push("pinchend/" + id) }
        })
    }
    
    var log, box1, box2, box3
    
    t.testExtJS(function (t) {
        t.it('Pinch should work', function (t) {
            document.body.innerHTML = 
                '<div id="box1">' +
                    'Some long text #1' +
                    '<div id="box2">' +
                        'Some long text #2' +
                    '</div>'
                '</div>' 
                
            box1    = setupBox('box1')
            box2    = setupBox('box2')
            
            log     = []
            
            t.chain(
                { pinch : '#box2', scale : 3, offset : [ 10, 0 ], offset2 : [ 11, 0 ] },
                function (next) {
                    t.isDeeply(log, [
                        'touchstart/box2',
                        'touchstart/box1',
                        'touchstart/box2',
                        'touchstart/box1',
                        'touchmove/box2',
                        'touchmove/box1',
                        'touchmove/box2',
                        'touchmove/box1',
                        'pinchstart/box2',
                        'pinchstart/box1',
                        'touchend/box2',
                        'touchend/box1',
                        'touchend/box2',
                        'touchend/box1',
                        'pinchend/box2',
                        'pinchend/box1'
                    ])
                    
                    next()
                }
            )
        })
    })
});

