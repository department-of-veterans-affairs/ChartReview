StartTest(function(t) {
    if ($.browser.msie) t.isTodo = true
    
    t.testBrowser(function (t) {
        
        document.body.innerHTML     = '<div><input id="one" type="text"></div><input id="two" type="password"><textarea id="three"></textarea>'

        t.chain(
            { waitFor : 500 },
            
            function(next) {
                t.focus($('#one')[ 0 ]);
                t.ok($("#one").is(":focus"), 'Field 1 focused');
                next();
            },
            { type          : '[TAB]' },
            function(next) {
                t.ok($("#two").is(":focus"), 'Field 2 focused');
                next();
            },
            { type          : '[TAB]' },
            function(next) {
                t.ok($("#three").is(":focus"), 'Field 3 focused');
                next();
            },
            {
                type        : '[TAB]',
                options     : { shiftKey : true }
            },
            function(next) {
                t.ok($("#two").is(":focus"), 'Field 2 focused after SHIFT+TAB');
                next();
            },
            { type          : '[TAB]' },
            function(next) {
                t.ok($("#three").is(":focus"), 'Field 3 focused');
                next();
            },
            { type          : '[TAB]' },
            function(next) {
                t.notOk($("#three").is(":focus"), 'Field 3 not focused');
                t.notOk($("#two").is(":focus"), 'Field 2 not focused');
                t.notOk($("#one").is(":focus"), 'Field 1 not focused');
                next();
            }
        )
    });
});

