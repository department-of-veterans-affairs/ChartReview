describe('Testing the Ticket App example', function (t) {

    t.it('Should be possible to login', function(t) {

        t.chain(
            { waitForCQ : 'window[title=Login - Ticket App]' },

            { click : '>> textfield[inputType=password]' },

            { type : 'foo', target : '>> textfield[inputType=password]' },

            { click : '>> button[text=Login]' },

            { waitForCQNotFound : 'window[title=Login - Ticket App]', desc: 'Login window should be destroyed after login' }
        )
    })

    t.it('Should find various UI elements on the dashboard', function(t) {

        t.chain(
            { waitForCQ : 'app-dashboard', desc : 'Should find dashboard component created' },

            function() {
                t.contentLike('#app-header-username', 'Don', 'Should find current user name in the top right corner');

                t.cqExists('grid[title=Projects]', 'Found projects grid')
                t.cqExists('grid[title=Projects] actioncolumn', 'Found action column in projects grid')
            }
        )
    })

    t.it('Dashboard interactions', function(t) {

        t.chain(
            { click : '>> grid[title="My Active Tickets"] button[text=Refresh]' },

            function(next) {
                t.cqNotExists('window[title^=Edit User]', 'User window not found before clicking Edit')
                next()
            },

            { click : 'grid[title^=Project Members] => .x-grid-cell:contains(Edit)' },

            { waitForCQ : 'window[title^=Edit User]{isVisible()}'},

            { click : '>> window[title^=Edit User] button[text=Close]' },

            { waitForCQNotFound : 'window[title^=Edit User]', desc : 'Edit window destroyed after close is pressed'}
        )
    })

    t.it('Search interactions', function(t) {

        t.chain(
            { click : 'grid[title="Projects"] => .x-action-col-icon.search' },

            { waitForCQ : 'tabpanel grid[title^=Search]', desc : 'Should find Search tab created' },

            { waitForRowsVisible : '>>grid[title^=Search]', desc : 'Search grid should contain rows' },

            { click : '>>combobox[fieldLabel="User"]' },

            function (next) {
                var gridview = t.cq1('>>grid[title^=Search]').getView()
                t.firesOnce(gridview, 'refresh');

                t.cq1('combobox[fieldLabel="User"]').select(2)

                t.waitForEvent(gridview, 'refresh', next);
            },

            { click : 'tab[text^=Search] => .x-tab-close-btn'},

            { waitForCQNotFound : 'tabpanel grid[title^=Search]', desc : 'Should not find Search tab after close' }

        )
    })
});
