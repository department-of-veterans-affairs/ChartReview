StartTest(function(t) {
    
    var setupBox = function (id) {
        Ext.get(id).on({
            touchstart      : function (e) { log.push("touchstart/" + id) },
            touchend        : function (e) { log.push("touchend/" + id) },
            tap             : function (e) { log.push("tap/" + id) },
            doubletap       : function (e) { log.push("doubletap/" + id) },
            longpress       : function (e) { log.push("longpress/" + id) }
        })
    }
    
    var log, box1, box2, box3
    
    t.testExtJS(function (t) {
        t.it('Tap should work', function (t) {
            document.body.innerHTML = 
                '<div id="box1">' +
                    'Box1' +
                    '<div id="box2">' +
                        'Box2' +
                        '<div id="box3">Box3</div>'
                    '</div>'
                '</div>' 
                
            box1    = setupBox('box1')
            box2    = setupBox('box2')
            box3    = setupBox('box3')
            
            log     = []
            
            t.chain(
                { tap : '#box3' },
                function (next) {
                    t.isDeeply(log, [
                        'touchstart/box3',
                        'touchstart/box2',
                        'touchstart/box1',
                        'touchend/box3',
                        'touchend/box2',
                        'touchend/box1',
                        'tap/box3',
                        'tap/box2',
                        'tap/box1'
                    ])
                    
                    next()
                }
            )
        })
        
        t.it('Double tap should work', function (t) {
            document.body.innerHTML = 
                '<div id="box1">' +
                    'Box1' +
                    '<div id="box2">' +
                        'Box2' +
                    '</div>'
                '</div>' 
                
            box1    = setupBox('box1')
            box2    = setupBox('box2')
            
            log     = []
            
            t.chain(
                { doubleTap : '#box2' },
                function (next) {
                    t.isDeeply(log, [
                        'touchstart/box2',
                        'touchstart/box1',
                        'touchend/box2',
                        'touchend/box1',
                        'tap/box2',
                        'tap/box1',
                        'touchstart/box2',
                        'touchstart/box1',
                        'touchend/box2',
                        'touchend/box1',
                        'tap/box2',
                        'tap/box1',
                        'doubletap/box2',
                        'doubletap/box1'
                    ])
                    
                    next()
                }
            )
        })
        
        t.it('Long press should work', function (t) {
            document.body.innerHTML = 
                '<div id="box1">' +
                    'Box1' +
                    '<div id="box2">' +
                        'Box2' +
                    '</div>'
                '</div>' 
                
            box1    = setupBox('box1')
            box2    = setupBox('box2')
            
            log     = []
            
            t.chain(
                { longPress : '#box2' },
                function (next) {
                    t.isDeeply(log, [
                        'touchstart/box2',
                        'touchstart/box1',
                        'longpress/box2',
                        'longpress/box1',
                        'touchend/box2',
                        'touchend/box1',
                        'tap/box2',
                        'tap/box1'
                    ])
                    
                    next()
                }
            )
        })
        
    });
});

