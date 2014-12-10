StartTest(function(t) {
    // Running in the 'top' page scope. Get the local variables from the test.
    var Ext         = t.Ext();
    var window      = t.global;
    var document    = window.document;
    
    t.chain(
        { type : "CharlieJohnson", target : '>> #loginPanel textfield[fieldLabel=Login]' }, 
        { type : "secret", target : '>> #loginPanel textfield[fieldLabel=Password]' },

//        NOTE, that this code won't work (or will work unreliably, as it contains race condition):
//            { click : '>> #loginPanel button' },
//            { waitFor : 'PageLoad'}
//        It is because in Chrome page refresh may happen too fast (may be even synchronously), 
//        and by the time the "waitForPageLoad" action will start, the page load event will already happen. 
//        Because of that `waitForPageLoad` will wait indefinitely.
//        Need to start waiting first, and only then - click, we'll use "trigger" config of the `wait` action for that
        
        {
            waitFor     : 'PageLoad',
            trigger     : {
                click : '>> #loginPanel button'
            }
        },
//        The complex "waitFor" action above can be written with the function step as well:
//        function (next) {
//            t.waitForPageLoad(next)
//            
//            t.click('>> #loginPanel button', function () {})
//        },
       
        function (next, window, Ext) {
            var panel   = Ext.getCmp('authResult')
                
            t.is(panel.authResult, 'success', 'Correct authentication result');
            
            t.done();
        }
    )
})    