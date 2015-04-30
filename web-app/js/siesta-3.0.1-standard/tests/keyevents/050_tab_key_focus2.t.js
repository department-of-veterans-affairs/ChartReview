StartTest(function(t) {
    if ($.browser.msie) t.isTodo = true
    
    t.testBrowser(function (t) {
        document.body.innerHTML     = '<input tabindex=3 id="one" type="text"><input tabindex=2 id="two" type="password"><textarea tabindex=1 id="three"></textarea><input id="four">'

        t.chain(
            { waitFor : 500 },
            
            function(next) {
                t.focus($('#three')[ 0 ])
                t.ok($("#three").is(":focus"), 'Field 3 focused');
                next();
            },
            {
                type        : '[TAB]'
            },

            function(next) {
                t.ok($("#two").is(":focus"), 'Field 2 focused');
                next();
            },
            {
                type        : '[TAB]'
            },

            function(next) {
                t.ok($("#one").is(":focus"), 'Field 1 focused');
                next();
            },
            {
                type        : '[TAB]'
            },

            function(next) {
                t.notOk($("#three").is(":focus"), 'Field 3 not focused');
                next();
            },
            {
                type        : '[TAB]'
            },

            function(next) {
                t.notOk($("#one").is(":focus"), 'Field 1 not focused');
                t.notOk($("#two").is(":focus"), 'Field 2 not focused');
                t.notOk($("#three").is(":focus"), 'Field 3 not focused');
                t.notOk($("#four").is(":focus"), 'Field 4 not focused');

                t.is(document.activeElement, document.body, 'Body focused');
            }
        )
    });
});

