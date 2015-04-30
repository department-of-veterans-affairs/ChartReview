StartTest(function (t) {
//    Lets say you have a 100x100 div1 (with overflow: hidden), inside of that div, you have 100x500 div2.
//    User tries to click on the div2. Siesta will try to click in the center of the div2, 
//    which will be outside of the div1 and truncated by it. Some sort of warning should be issued
//    https://www.assembla.com/spaces/bryntum/tickets/1239#/activity/ticket:
    
    t.testExtJS(function (t) {
        t.it('Clicking in the hidden area of some element should issue a warning', function (t) {
            document.body.innerHTML =
                '<div style="border:1px solid #ddd;width:100px;height:100px;overflow:hidden">' +
                    '<div style="width:500px;height:100px" id="inner">FOO</div>' +
                '</div>';

            var counter     = 0
                
            t.warn = function () {
                counter++
            }
                
            t.chain(
                // for IE
                { waitFor : 100 },
                function (next) {
                    t.ok(t.elementIsTop('#inner', false, [ 10, 10 ]), "Correct result for reachable point of the #inner")
                    t.ok(t.elementIsTop('#inner', false, [ 90, 90 ]), "Correct result for reachable point of the #inner")
                    t.notOk(t.elementIsTop('#inner', false, [ 101, 90 ]), "Correct result for unreachable point of the #inner")
                    
                    next()
                },
            
                { click : '#inner', offset : [ 10, 10 ] },
                { click : '#inner', offset : [ 90, 90 ] },
                { click : '#inner', offset : [ 101, 90 ] },
                { click : '#inner', offset : [ 200, 50 ] },
                
                function () {
                    t.is(counter, 2, '2 Warnings should be issued')
                }
            );
        });
        
        t.it('Clicking in the hidden area of some element should issue a warning', function (t) {
            t.enableUnreachableClickWarning = false
            
            document.body.innerHTML =
                '<div id="clickel" style="width:100px;height:100px"></div>';

            t.chain(
                // for IE
                { waitFor : 100 },
                function (next) {
                    t.firesOk(Ext.get('clickel'), 'click', 2)
                    
                    next()
                },
            
                { click : '#clickel', offset : [ 0, 0 ] },
                { click : '#clickel', offset : [ "100%", "100%" ] },
                
                { click : '#clickel', offset : [ "100%+1", "100%" ] },
                { click : '#clickel', offset : [ -1, 0 ] }
            );
        });
        
    });
});

