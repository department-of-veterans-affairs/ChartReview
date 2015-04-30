StartTest(function (t) {
    t.getHarness(
        {
            enableCodeCoverage    : true,
            preload : [
                '../../../extjs-4.2.2/resources/css/ext-all.css',
                '../../../extjs-4.2.2/ext-all-debug.js',

                {
                    instrument : true,
                    url        : 'testfiles/ext_class.js'
                }
            ]
        },
        [
            {
                url     : 'testfiles/605_class_test.t.js'
            }
        ]
    );

    t.it('Should show coverage info', function (t) {
        t.chain(
            { waitFor : 'harnessReady' },

            function (next) {
                var coverageButton = t.cq1('[actionName=show-coverage]')
                t.ok(coverageButton.isDisabled());
                next();
            },

            { dblclick : "testgrid => .x-grid-row" },

            { waitFor : 'harnessIdle' },

            { click : ">> [actionName=show-coverage]" },

            function (next) {
                var coverageTree = t.cq1('coveragereport treepanel');

                t.ok(t.cq1('coveragereport').isVisible(), 'Visible coverage report');
                t.ok(t.cq1('[slot=sourcePanel]').isHidden(), 'Hidden source');

                t.matchGridCellContent(coverageTree, 0, 0, 'My')
                t.matchGridCellContent(coverageTree, 0, 1, '83%', 'Statements')
                t.matchGridCellContent(coverageTree, 0, 2, '100%', 'Branches')
                t.matchGridCellContent(coverageTree, 0, 3, '75%', 'Functions')
                t.matchGridCellContent(coverageTree, 0, 4, '83%', 'Lines')

                t.matchGridCellContent(coverageTree, 1, 0, 'awesome')
                t.matchGridCellContent(coverageTree, 1, 1, '83%', 'Statements')
                t.matchGridCellContent(coverageTree, 1, 2, '100%', 'Branches')
                t.matchGridCellContent(coverageTree, 1, 3, '75%', 'Functions')
                t.matchGridCellContent(coverageTree, 1, 4, '83%', 'Lines')

                t.matchGridCellContent(coverageTree, 2, 0, 'Class')
                t.matchGridCellContent(coverageTree, 2, 1, '67%', 'Statements')
                t.matchGridCellContent(coverageTree, 2, 2, '100%', 'Branches')
                t.matchGridCellContent(coverageTree, 2, 3, '50%', 'Functions')
                t.matchGridCellContent(coverageTree, 2, 4, '67%', 'Lines')

                t.matchGridCellContent(coverageTree, 3, 0, 'Class2')
                t.matchGridCellContent(coverageTree, 3, 1, '100%', 'Statements')
                t.matchGridCellContent(coverageTree, 3, 2, '100%', 'Branches')
                t.matchGridCellContent(coverageTree, 3, 3, '100%', 'Functions')
                t.matchGridCellContent(coverageTree, 3, 4, '100%', 'Lines')
                
                next();
            }
        );
    });
    
    t.it('Should show chart or source when clicking rows', function (t) {
        t.chain(
            { click : "coveragereport treepanel => .x-grid-item:nth-child(1)" },

            function (next) {
                t.ok(t.cq1('[slot=sourcePanel]').isHidden(), 'Hidden source');
                t.ok(t.cq1('coveragereport chart').isVisible(), 'Visible chart');
                next()
            },

            { click : "coveragereport treepanel => .x-grid-item:nth-child(2)" },

            function (next) {
                t.ok(t.cq1('[slot=sourcePanel]').isHidden(), 'Hidden source');
                t.ok(t.cq1('coveragereport chart').isVisible(), 'Visible chart');
                next()
            },

            { click : "coveragereport treepanel => .x-grid-item:nth-child(3)" },

            function (next) {
                t.ok(t.cq1('[slot=sourcePanel]').isVisible(), 'Visible source');
                t.ok(t.cq1('coveragereport chart').isHidden(), 'Hidden chart');
                next()
            }
        );
    });

    t.it('Should filter rows when clicking buttons', function (t) {
        t.chain(
            { click : '>> coveragereport [level=med]' },

            function(next) {
                t.is(t.cq1('coveragereport treeview').getNodes().length, 3, '3 rows after unsetting the medium button');
                next()
            },

            { click : '>> coveragereport [level=med]' },

            function(next) {
                t.is(t.cq1('coveragereport treeview').getNodes().length, 4, '4 rows after clearing filter');
                next()
            },

            { click : '>> coveragereport [level=low]' },

            function(next) {
                t.is(t.cq1('coveragereport treeview').getNodes().length, 4, 'Still 4 rows after unsetting the "low" covered classes');
                next()
            },

            { click : '>> coveragereport [level=med]' },
            { click : '>> coveragereport [level=high]' },

            function(next) {
                t.is(t.cq1('coveragereport treeview').getNodes().length, 0, '0 rows after unsetting med and high');
                next()
            }
        );
    });

    t.it('Should close panel when clicking close button', function (t) {

        t.chain(
            { click : ">> coveragereport button[text=Close]" },

            function (next) {
                t.ok(t.cq1('coveragereport').isHidden(), 'Hidden after close');
            }
        );
    });
});