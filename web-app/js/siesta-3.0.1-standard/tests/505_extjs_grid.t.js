StartTest(function(t) {
    
    var grid,
        itemSelector = Ext.grid.View.prototype.itemSelector;
    
    t.it('Methods should work', function (t) {
        grid && grid.destroy()
        
        grid = t.getGrid();
    
        t.waitForRowsVisible(grid, function() {
            t.expectPass(function (t) {
                t.is(t.getFirstRow(grid).dom, Ext.select(itemSelector).item(0).dom, 'getFirstRow OK');
                t.matchGridCellContent(grid, 0, 0, 'Foo', 'matchGridCellContent OK');
            });
        
            t.expectFail(function (t) {
                t.matchGridCellContent(grid, 0, 0, 'ASD', 'matchGridCellContent fails OK');
            });
            
            var record  = grid.store.getAt(0)
            
            record.set('bar', '/,[,],')
            
            t.expectPass(function (t) {
                t.matchGridCellContent(grid, 0, 0, '/,[,],', 'matchGridCellContent OK');
                t.matchGridCellContent(grid, 0, 0, /\/,\[,\],/, 'matchGridCellContent OK');
            });
            
            record.set('bar', 'baz/,[,],blarg')
            
            t.expectPass(function (t) {
                t.matchGridCellContent(grid, 0, 0, '/,[,],', 'matchGridCellContent OK');
                t.matchGridCellContent(grid, 0, 0, /\/,\[,\],/, 'matchGridCellContent OK');
            });

            t.expectPass(function (t) {
                var rowNode  = t.$(grid.view.itemSelector, grid.el.dom)[0];
                var cellNode = t.$(grid.view.cellSelector + ':nth-child(2)', rowNode)[0];

                t.is(t.getRow(grid, 0).dom, rowNode, 't.getRow OK')

                t.is(t.getCell(grid, 0, 1).dom, cellNode, 't.getCell OK')
            });
        });
    })

    t.it('`clickToEditCell` should work', function (t) {
        grid && grid.destroy()
        
        grid = new Ext.grid.Panel({
            renderTo    : document.body,
            store       : new Ext.data.Store({
                fields      : [ 'id', 'name' ],
                data        : [
                    { id    : 1, name : 'name1' },
                    { id    : 2, name : 'name2' },
                    { id    : 3, name : 'name3' }
                ]
            }),
            columns     : [
                { text  : 'id', dataIndex : 'id', editor : 'textfield' },
                { text  : 'name', dataIndex : 'name' }
            ],
            
            plugins: new Ext.grid.plugin.CellEditing({ clicksToEdit: 2 })
        })
    
        t.testExtJS(function (t) {
            t.chain(
                { waitForRowsVisible : grid },

                { clickToEditCell : [ grid, 0, 0 ] },

                function (next, inputEl) {
                    t.is(inputEl, grid.editingPlugin.activeEditor.field.inputEl.dom, 'Correct editor el returned')
                }
            )
        })
        
    })

});