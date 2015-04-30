StartTest(function (t) {
    t.getHarness(
        {
            viewDOM : false
        },
        [
            'testfiles/601_siesta_ui_passing.t.js'
        ]
    );

    t.it('Should toggle collapse expand', function (t) {
        var domContainer    = t.cq1('domcontainer')

        // in FF DOM container starts collapsed (in Chrome it does not)
        // ext does not create ext component at all if its collapsed
        if (domContainer && !domContainer.getCollapsed()) domContainer.collapse()
        
        t.chain(
            { click  : ">>button[action=view-dom] "},

            function (next) {
                t.notOk(t.cq1('domcontainer').getCollapsed())
                next();
            },

            { click : ">>button[action=view-dom]" },

            function (next) {
                t.ok(t.cq1('domcontainer').getCollapsed())
            }
        );
    })

    t.it('Should toggle collapse expand', function (t) {
        t.chain(
            { click : ">> [action=options]" },

            { click : ">>#tool-menu{isVisible()} [text=About Siesta]" },

            function (next) {
                t.ok(t.cq1('domcontainer').getCollapsed())
                next();
            },

            { action : "click", target : ">>#aboutwindow button[text=Close]" }
        );
    });
});