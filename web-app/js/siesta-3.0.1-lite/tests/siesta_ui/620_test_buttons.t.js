StartTest(function (t) {
    t.getHarness(
        {
            viewDOM : false
        },
        [
            'testfiles/601_siesta_ui_passing.t.js',
            {
                preload : [
                    '../../../extjs-4.2.0/resources/css/ext-all.css',
                    '../../../extjs-4.2.0/ext-all-debug.js'
                ],
                url     : 'testfiles/604_extjs_components.t.js'
            }
        ]
    );

    t.it('Rerun button should work', function (t) {

        t.chain(
            { dblclick : "testgrid => .x-grid-row:contains(601_siesta_ui_passing)" },

            { waitFor : 'textPresent', args : 'All tests passed' },

            function (next) {
                t.firesOnce(Harness, 'testsuitestart');
                next();
            },

            { click : ">>toolbar [text=Run test]" }
        );
    });

    t.it('Toggle DOM button should work', function (t) {

        t.chain(
            function (next) {
                t.cq1('domcontainer').collapse();
                next()
            },

            { click : ">>toolbar [action=view-dom]" },

            function (next) {
                t.isStrict(t.cq1('domcontainer').getCollapsed(), false)
                next()
            },

            { click : ">>toolbar [action=view-dom]" },

            function (next) {
                t.ok(t.cq1('domcontainer').getCollapsed())
            }
        );
    });

    t.it('Toggle code view button should work', function (t) {

        t.chain(
            { click : ">>toolbar [action=view-source]" },

            function (next) {
                t.is(t.cq1('[slot=cardContainer]').layout.getActiveItem(), t.cq1('[slot=source]'))
                next()
            },

            { click : ">>sourcepanel button[text=Close]" }
        )
    });

    t.it('Toggle failed assertion', function (t) {
        t.chain(
            { click : ">>toolbar [action=show-failed-only]" },

            function (next) {
                t.selectorNotExists('.tr-assertion-row-passed')
                next()
            },

            { click : ">>toolbar [action=show-failed-only]" },

            function (next) {
                t.selectorExists('.tr-assertion-row-passed')
                next()
            }
        );
    });

    t.it('Toggle inspection mode in non-Ext test', function (t) {
        var dc = t.cq1('domcontainer');

        // No Ext JS loaded in the test
        t.firesOnce(dc, 'inspectionstart');
        t.firesOnce(dc, 'inspectionstop');

        t.chain(
            { click : ">>toolbar [action=toggle-cmp-inspector]" },
            { click : ">>toolbar [action=toggle-cmp-inspector]" }
        );
    });

    t.it('Toggle inspection mode', function (t) {
        var dc = t.cq1('domcontainer');

        dc.expand();

        t.firesOnce(dc, 'inspectionstart');
        t.firesOnce(dc, 'inspectionstop');

        t.chain(
            { dblclick : "testgrid => :contains(604_extjs_components) " },

            { click : ">>toolbar [action=toggle-cmp-inspector]" },

            { action : "click" },

            { waitFor : 'harnessIdle', args : [] }
        );
    });

    if (!Ext.browser.is.IE) t.it('Toggle recorder', function (t) {
        var dc = t.cq1('domcontainer');

        t.chain(
            { click : ">>toolbar [action=toggle-recorder]" },
            { waitForCQVisible : 'recorderpanel' },
            { click : ">>toolbar [action=toggle-recorder]" },
            { waitForCQNotVisible : 'recorderpanel' }
        );
    });
});