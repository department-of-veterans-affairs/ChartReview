StartTest(function(t) {
    
    t.expectGlobals('STORE')
    
    t.waitFor(function () {
        return window.STORE
    })
})    
