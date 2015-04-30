StartTest(function(t) {
    t.getHarness([
        'testfiles/601_siesta_ui_passing.t.js'
    ]);

    t.it('Filtering', function(t) {
        t.chain(
            {
                desc            : 'Should find testgrid CQ',
                waitFor         : 'CQ',
                args            : ['testgrid']
            },
            {
                desc            : 'Should find IE text',
                waitFor         : 'contentLike',
                args            : ['>>testgrid', '601_siesta_ui_passing.t.js']
            },
            {
                desc            : 'Should click trigger field',
                action          : 'click',
                target          : '>>testgrid treefilter'
            },
            {
                desc            : 'Should type into filter field',
                action          : 'type',
                target          : '>>testgrid treefilter',
                text            : 'FOO '
            },
            {
                desc            : 'Should not find 601 text after filtering',
                waitFor         : 'contentNotLike',
                args            : ['>>testgrid', '601']
            },
            {
                desc            : 'Should click clear trigger',
                action          : 'click',
                target          : 'testgrid => .x-form-trigger'
            },
            {
                desc            : 'Should find 601 after clearing filter',
                waitFor         : 'contentLike',
                args            : ['>>testgrid', '601']
            }
        );
    })

    t.it('Running', function(t) {
        t.chain(
            {
                doubleClick     : 'testgrid => .x-grid-row'
            },
            {
                waitFor         : 'Selector',
                args            : ['.resultpanel-testtitle:contains(601_siesta_ui_passing.t.js)'],
                desc            : 'Test name shown in header'
            },

            { waitFor           : 'harnessIdle', args : []},

            function() {
                t.selectorExists('.tr-summary-row :contains(Passed: 2)')
                t.selectorExists('.tr-summary-row :contains(Failed: 0)')
                t.selectorExists('.tr-summary-row :contains(All tests passed)')
            }
        );
    });
});