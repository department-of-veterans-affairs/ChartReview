/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.ExtJS.Grid

This is a mixin, with helper methods for testing functionality relating to ExtJS grids. This mixin is being consumed by {@link Siesta.Test.ExtJS}

*/
Role('Siesta.Test.ExtJS.Grid', {
    
    requires        : [ 'waitFor', 'pass', 'fail', 'typeOf' ],
    
    
    methods : {
        /**
         * Waits for the rows of a gridpanel or tree panel to render and then calls the supplied callback. Please note, that if the store of the grid has no records,
         * the condition for this waiter will never be fullfilled.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * @param {Function} callback A function to call when the condition has been met.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForRowsVisible : function(panel, callback, scope, timeout) {
            if (typeof panel === 'function') {
                timeout     = scope;
                scope       = callback;
                callback    = panel;
                panel       = this.cq1('tablepanel');
            }

            var cmp = this.normalizeComponent(panel, true);
            var me = this;

            if (!cmp && typeof panel === 'string') {
                // Make sure CQ returns a result first
                return this.waitForCQ(panel, function(result) { this.waitForRowsVisible(result[0], callback, scope, timeout); }, this);
            } else {
                var checkerFn;

                // Handle case of locking grid (Ext JS 4+ only)
                if(cmp.normalGrid) {
                    var selector = cmp.normalGrid.getView().itemSelector;
                    checkerFn = function() {
                        if (!cmp.rendered || !cmp.normalGrid.rendered || !cmp.lockedGrid.rendered) return;
                         
                        var lockedResult = this.$(selector, cmp.lockedGrid.el.dom); 
                        var normalResult = this.$(selector, cmp.normalGrid.el.dom); 
                        
                        if (lockedResult.length > 0 && normalResult.length > 0) {
                            return {
                                lockedRows : lockedResult,
                                normalRows : normalResult
                            };
                        }
                    }
                } else {
                    var view = cmp.getView();
                    var selector = view.itemSelector || view.rowSelector; // Handling Ext 4 + Ext 3 cases

                    checkerFn = function() {
                        if (!cmp.rendered) return;
                         
                        var result = this.$(selector, cmp.el.dom); 
                        
                        if (result.length > 0) {
                            return result;
                        }
                    }
                }


                return this.waitFor({
                    method          : checkerFn, 
                    callback        : function() {
                        // Grid might be refreshing itself multiple times during initialization which can
                        // break tests easily
                        var as = me.beginAsync();

                        me.global.setTimeout(function(){
                            me.endAsync(as);
                            callback.call(scope || me);
                        }, 100);
                    },
                    timeout         : timeout,
                    assertionName   : 'waitForRowsVisible',
                    description     : ' ' + Siesta.Resource('Siesta.Test.ExtJS.Grid').get('waitForRowsVisible') + ' "' + cmp.id + '"'
                });
            }
        },

        /**
         * Utility method which returns the first grid row element.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * @return {Ext.Element} The element of the first row in the grid.
         */
        getFirstRow : function(grid) {
            grid = this.normalizeComponent(grid);

            return this.getRow(grid, 0);
        },

        /**
         * Utility method which returns the first grid cell element.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * 
         * @return {Ext.Element} The element of the first cell in the grid.
         */
        getFirstCell : function(panel) {
            panel = this.normalizeComponent(panel);

            return this.getCell(panel, 0, 0);
        },

        /**
         * Utility method which returns a grid row element.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * @param {Int} index The row index
         *
         * @return {Ext.Element} The element corresponding to the grid row.
         */
        getRow : function(grid, index) {
            grid = this.normalizeComponent(grid);

            var domNode = this.$(grid.getView().itemSelector, grid.el.dom)[ index ];

            return this.Ext().get(domNode);
        },

        /**
         * Utility method which returns the cell at the supplied row and col position.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * @param {Int} row The row index
         * @param {Int} column The column index
         * 
         * @return {Ext.Element} The element of the grid cell at specified position.
         */
        getCell : function(grid, row, col) {
            grid = this.normalizeComponent(grid);
            var rowEl = this.getRow(grid, row);
            var cellNode = this.$(grid.view.cellSelector, rowEl.dom)[col];

            return this.Ext().get(cellNode);
        },

        /**
         * Utility method which returns the last cell for the supplied row.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * @param {Int} row The row index
         * 
         * @return {Ext.Element} The element of the grid cell at specified position.
         */
        getLastCellInRow : function(grid, row) {
            grid = this.normalizeComponent(grid);

            return this.getCell(grid, row, grid.headerCt.getColumnCount() - 1);
        },

        /**
         * This assertion passes if the passed string is found in the passed grid's cell element.
         * 
         * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
         * @param {Int} row The row index
         * @param {Int} column The column index
         * @param {String/RegExp} string The string to find or RegExp to match
         * @param {String} [description] The description for the assertion
         */
        matchGridCellContent : function(grid, rowIndex, colIndex, string, description) {
            grid = this.normalizeComponent(grid);
            
            var view = grid.getView(),
                cell = this.getCell(grid, rowIndex, colIndex).child('div');

            var isRegExp    = this.typeOf(string) == 'RegExp';
            var content     = cell.dom.innerHTML;
                
            if (isRegExp ? string.test(content) : content.indexOf(string) != -1) {
                this.pass(description, {
                    descTpl     : isRegExp ? 'Cell content {content} matches regexp {string}' : 'Cell content {content} has a string {string}',
                    content     : content,
                    string      : string
                });
            } else {
                this.fail(description, {
                    assertionName   : 'matchGridCellContent',
                    
                    got         : cell.dom.innerHTML,
                    gotDesc     : 'Cell content',
                    
                    need        : string,
                    needDesc    : 'String matching',
                    
                    annotation  : 'Row index: ' + rowIndex + ', column index: ' + colIndex
                });
            }
        },
        
        
        /**
         * This method performs either a click or double click on the specified grid cell 
         * (depending from the [clicksToEdit](http://docs.sencha.com/extjs/4.2.2/#!/api/Ext.grid.plugin.Editing-cfg-clicksToEdit)
         * config of it's editing plugin), then waits until the `input` selector appears under the cursor and calls the provided callback.
         * The callback will receive the DOM `&lt;input&gt; element as the 1st argument. 
         * 
         * In some browsers the editor is shown with delay, so its highly recommended to use this method when editing cells.
         * Typical usage will be:
         * 

    t.chain(
        function (next) {
            t.clickToEdit(grid, 0, 1, next)
        },
        function (next, inputEl) {
            t.type(inputEl, "my text", next)
        }
    )

         * 
         * 
         * @param {Ext.grid.Panel/String} grid The grid panel or a ComponentQuery matching a panel
         * @param {Int} rowIndex The row index
         * @param {Int} colIndex The column index
         * @param {Function} callback The callback to call once the `input` selector appears under the cursor
         * @param {String} selector Custom selector to wait for, instead of `input`.
         */
        clickToEditCell : function (grid, rowIndex, colIndex, callback, selector) {
            var Ext             = this.getExt()
            
            grid                = this.normalizeComponent(grid);
            
            var editingPlugin   = grid && grid.editingPlugin
            
            if (!editingPlugin || !(editingPlugin instanceof Ext.grid.plugin.CellEditing)) {
                this.fail("No grid, or grid has no editing plugin, or its not a Ext.grid.plugin.CellEditing plugin")
                
                callback && callback(null)
                
                return
            }
            
            var me      = this
            
            this[ editingPlugin.clicksToEdit == 2 ? 'doubleClick' : 'click' ](this.getCell(grid, rowIndex, colIndex), function () {
                // manually force editing if it didn't get started by the click
                if (!editingPlugin.getActiveEditor()) editingPlugin.startEditByPosition({ row : rowIndex, column : colIndex })
                
                me.waitForSelectorAtCursor(selector || 'input', callback)
            })
        }
    }
});
