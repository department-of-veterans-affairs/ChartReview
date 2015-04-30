StartTest(function(t) {
    document.body.innerHTML += '<a id="one" href="#foo">Click a hash tag</a>';
    document.body.innerHTML += '<a id="two" href="#bar">Click a hash tag</a>'   ;
    document.body.innerHTML += '<a id="three" href="#">Click a hash tag</a>'   ;
    document.body.innerHTML += '<a id="four" href="foo">Click a link with no hash</a>'   ;

    t.it('Should fire hashchange and change location.href using Ext JS', function(t) {

        Ext.History.init();

        t.willFireNTimes(Ext.History, 'change', 3);
        t.willFireNTimes(window, 'hashchange', 3);
    
        t.chain(
            { click : '#one' },

            function(next) {
                t.is(window.location.hash, '#foo', 'Found hash object ok');
                next();
            },

            { click : '#two' },

            function(next) {
                t.is(window.location.hash, '#bar', 'Found hash object ok');
                next();
            },

            { click : '#three' },

            function() {
                // in some browsers assigning empty string to the hash empties the "hash" property of "location"
                // in some (IE) it still keeps the # character
                t.like(window.location.hash, /#?/, 'Found hash object ok');
            }
        )
    })

    t.it('Should fire hashchange and change location.href using Ext JS', function(t) {
        $('#four').click(function() {
            return false;
        })

        t.chain(
            { click : '#four' }
        )
    });
});
