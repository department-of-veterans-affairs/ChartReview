StartTest({
    overrideSetTimeout      : false
}, function(t) {

    t.it('waitForTextPresent', function(t) {

        t.chain(
            function(next) {
                t.waitForTextPresent('foo', next)

                document.body.innerHTML = 'foo';
            },
            
            { waitFor : 100 },

            function(next) {
                t.waitForTextNotPresent('foo', next)

                document.body.innerHTML = 'bar';
            },

            function(next) {
                t.pass('All seems well')
            }
        )
    })
});
