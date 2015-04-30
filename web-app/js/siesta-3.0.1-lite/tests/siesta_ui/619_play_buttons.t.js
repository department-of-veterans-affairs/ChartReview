StartTest(function (t) {
    t.getHarness(
        {
            viewDOM : false,
        },
        [
            'testfiles/601_siesta_ui_passing.t.js'
        ]
    );

    t.it('Should do nothing if no tests are checked', function (t) {

        t.chain(
            function (next) {
                t.wontFire(Harness, 'testsuitestart')
                t.wontFire(Harness, 'testsuiteend')
                next();
            },

            { click : ">>toolbar [actionName=run-checked]" },
            { click : ">>toolbar [actionName=run-failed]" },

            { waitFor : 1000 },

            function() {
                t.contentLike('.total-pass', "0")
                t.contentLike('.total-fail', "0")
            }
        );
    })

    t.it('Should run checked test', function (t) {
        t.chain(
            function (next) {
                t.firesOnce(Harness, 'testsuitestart')
                t.firesOnce(Harness, 'testsuiteend')

                next();
            },

            { click : "testgrid => .x-grid-row:nth-child(1) > .x-grid-cell:nth-child(1) .x-tree-checkbox" },

            { click : ">>toolbar [actionName=run-checked]" },
            { waitFor : 1000 },

            function() {
                t.contentLike('.total-pass', "2")
                t.contentLike('.total-fail', "0")
            }
        );
    });

    t.it('Run all should work', function (t) {
        t.chain(
            function (next) {
                t.firesOnce(Harness, 'testsuitestart')
                t.firesOnce(Harness, 'testsuiteend')

                next();
            },

            { click : ">>toolbar [actionName=run-all]" },

            { waitFor : 1000 }
        );
    });
});