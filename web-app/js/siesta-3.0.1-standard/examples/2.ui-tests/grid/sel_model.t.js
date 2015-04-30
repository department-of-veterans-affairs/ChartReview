StartTest(function(t) {
    //=================================================================
    t.diag("Simple grid assertions");
    
    // Use a convenience method to generate the grid, keeping the test as small as possible
    var grid = t.getGrid({
        renderTo : document.body
    });
     
    var view = grid.getView(),
        store = grid.store,
        selModel = grid.getSelectionModel();

    var btn = new Ext.Button({
        height  : 20,
        text : 'Add new record',
        renderTo : Ext.getBody(),
        handler : function() { 
            store.add(Ext.create(store.model, {
                name : 'foo'
            }));  
        }
    });
   
    
    t.chain(
        {
            // First wait until rows are present in the DOM
            waitFor     : 'rowsVisible',
            args        : grid
        },
        function (next) {
            t.is(selModel.getCount(), 0, 'No records selected');
            t.is(store.getCount(), 5, 'Store has some records');
            
            next()
        },
        {
            click       : function () { return t.getFirstRow(grid) }
        },
        function (next) {
            t.is(selModel.getCount(), 1, '1 record selected after click on row');
            
            next()
        },
        {
            // Clicking a component
            click       : btn
        },
        function (next) {
            t.ok(selModel.isSelected(0), 'First record still selected after adding another record');
            t.is(store.getCount(), 6, 'Store has a new record after clicking button');

            view.el.on('keypress', function(e, t) {
                if (e.getKey() === e.DELETE) {
                    store.remove(selModel.getLastSelected());
                }
            });
            
            next()
        },
        { click     : function() { return t.getFirstRow(grid) } },
        { type      : '[DELETE]',  target : function() { return t.getFirstRow(grid) } },
        
        function (next) {
            t.is(store.getCount(), 5, 'Store lost one record after hitting delete');

            next()
        },
        
        { click     : function() { return t.getFirstRow(grid) } },
        { type      : '[DELETE]',  target : function() { return t.getFirstRow(grid) } },
        
        { click     : function() { return t.getFirstRow(grid) } },
        { type      : '[DELETE]',  target : function() { return t.getFirstRow(grid) } },
        
        { click     : function() { return t.getFirstRow(grid) } },
        { type      : '[DELETE]',  target : function() { return t.getFirstRow(grid) } },
        
        { click     : function() { return t.getFirstRow(grid) } },
        { type      : '[DELETE]',  target : function() { return t.getFirstRow(grid) } },
        
        { click     : function() { return t.getFirstRow(grid) } },
        { type      : '[DELETE]',  target : function() { return t.getFirstRow(grid) } },
        
        function() {
            t.is(store.getCount(), 0, 'Store has no records after 5 delete presses');
            t.ok(!view.el.down('tr.x-grid-row'), 'Grid view contains no row elements');
        }        
    )
});
