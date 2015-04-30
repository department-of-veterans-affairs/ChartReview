StartTest(function (t) {
    document.body.innerHTML = '<div id="one">FOO</div><div id="two">BAR</div>'

    t.expectPass(function (t) {
        var animationDone       = false
        
        Ext.get('one').animate({
            duration : 300,

            to : {
                backgroundColor : '#f00'
            },
            callback    : function () {
                animationDone   = true
            }
        });

        t.chain(
            { waitFor : 'animations' },

            function () {
                t.ok(animationDone)
            }
        );
    })

    t.expectFail(function (t) {
        var animationDone       = false
        
        t.waitForTimeout = 100;

        Ext.get('two').animate({
            duration : 300,

            to : {
                backgroundColor : '#f00'
            },
            callback    : function () {
                animationDone   = true
            }
        });

        t.chain(
            { waitFor : 'animations' },

            function () {
                t.ok(animationDone)
            }
        );
    })

});
