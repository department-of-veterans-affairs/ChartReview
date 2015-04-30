StartTest(function(t) {
    t.chain(
        { waitForCQ : 'gridpanel' },

        function(next, grids) {
            var userGrid = grids[0];

            t.willFireNTimes(userGrid.store, 'write', 1);
            next();
        },

        { waitForRowsVisible : 'gridpanel' },

        { doubleclick : 'gridpanel => .x-grid-cell' },

        // waiting for popup window to appear
        { waitForCQ : 'useredit' },

        // When using target, >> specifies a Component Query
        { click : '>>field[name=firstname]'},

        function(next) {
            // Manually clear text field
            t.cq1('field[name=firstname]').setValue();
            next();
        },

        { type : 'foo', target : '>>field[name=firstname]' },

        { click : '>>useredit button[text=Save]'},

        function(next) {
            t.matchGridCellContent(t.cq1('gridpanel'), 0, 0, 'foo Spencer', 'Updated name found in grid');
        }
    );
})    
