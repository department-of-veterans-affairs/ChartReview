StartTest(function (t) {
    var grid = new Ext.grid.Panel({
        width: 300,
        height: 200,
        resizable: true,
        renderTo: Ext.getBody(),
        resizeHandles: 'w e s',
        columns: [{ text: 'foo', flex : 1}],
        store: new Ext.data.Store({
            model: Ext.define('moo', { extend: "Ext.data.Model" })
        })
    });

    function getHandle(dir) {
        return grid.el.down('.x-resizable-handle-' + dir);
    }

    // Is the grid sized appropriately?
    t.isDeeply(grid.getSize(), { width : 300, height : 200 }, 'Is the grid 300x200px?');

    t.is(Ext.select('div.x-resizable-handle').getCount(), 3, '3 resize handles found');

    t.chain(
        { waitFor : 'ComponentVisible', args : [ grid ] },
        function () {
            var dragSteps = [
                { handle : 'east', deltaX : 50, deltaY : 0, expectedSize : { width : 350, height : 200 } },
                { handle : 'east', deltaX : -50, deltaY : 0, expectedSize : { width : 300, height : 200 } },
                { handle : 'east', deltaX : -50, deltaY : 0, expectedSize : { width : 250, height : 200 } },
                { handle : 'south', deltaX : 0, deltaY : 50, expectedSize : { width : 250, height : 250 } },
                { handle : 'south', deltaX : 0, deltaY : -50, expectedSize : { width : 250, height : 200 } },
                { handle : 'south', deltaX : 0, deltaY : -50, expectedSize : { width : 250, height : 150 } }
            ];
            
            t.chainForArray(dragSteps, function (cfg) {
                return function (next) {
                    t.dragBy(getHandle(cfg.handle), [ cfg.deltaX, cfg.deltaY ], function () {
                        // on Linux test fails with 1px difference, passed on Mac and Windows
                        // difference is not significant, considering that its Linux, so we just 
                        // add 1px threshold
                        var expectedSizeWithThreshold   = {
                            width   : t.anyNumberApprox(cfg.expectedSize.width, 1),
                            height  : t.anyNumberApprox(cfg.expectedSize.height, 1)
                        }
                        
                        t.isDeeply(grid.getSize(), expectedSizeWithThreshold, 'grid has correct width and height.');
                        next();
                    });
                }
            })
        }
    )
});
