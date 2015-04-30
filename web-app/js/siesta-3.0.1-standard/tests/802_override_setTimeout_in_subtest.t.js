StartTest({
    overrideSetTimeout      : true
}, function(t) {

    t.it('`overrideSetTimeout` should work inside of the sub test', function (t) {
        
        // starting timeout in parent test
        var id  = setTimeout(function () {}, 10000)
        
        setTimeout(function () {
            t.pass("Assertion should belong to the subtest #1")
            
            t.it('`overrideSetTimeout` should work inside of the sub test', function (t) {
                // clearing timeout from parent test in the sub test
                clearTimeout(id)
                
                setTimeout(function () {
                    t.pass("Assertion should belong to the subtest #2")
                }, 100)
            })
            
        }, 100)
    })
    
    
    t.it('`overrideSetTimeout` should work inside of the sibling todo tests', function (t) {
        
        var timeout1
        
        t.todo('Todo test #1', function (t) {
            t.pass("Sub assertion #0")
            
            timeout1 = setTimeout(function () {
                t.fail("Sub assertion #1 - should not be executed, because timeout is cleared")
            }, 500)
        })
        
        t.todo('Todo test #2', function (t) {
            setTimeout(function () {
                clearTimeout(timeout1)
                t.pass("Sub assertion #2")
            }, 100)
        })
    })
    
});
