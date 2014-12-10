/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.Recognizer.Grid

A class recognizing the Ext JS grid cell/row markup
*/
Role('Siesta.Recorder.TargetExtractor.Recognizer.Grid', {
    
    requires     : [ 'jquery', 'getFirstNonExtCssClass', 'getNthPosition', 'findDomQueryFor' ],

    override : {
        getCssQuerySegmentForElement : function (node, isTarget, maxNumberOfCssClasses, lookUpUntil) {
            var Ext             = this.Ext;
            var itemSelector    = Ext && Ext.grid && Ext.grid.View && Ext.grid.View.prototype.itemSelector;

            // Ext or Grid package may not be loaded in the page!
            if (!itemSelector) return this.SUPERARG(arguments);

            var cell            = this.jquery(node).closest('.x-grid-cell');
            var cellEl          = cell[ 0 ]

            if (!cellEl) return this.SUPERARG(arguments);

            var row             = cell.closest(itemSelector);
            var rowEl           = row[ 0 ]
            var gridViewCmp     = this.getComponentOfNode(rowEl)
            var gridCmp         = gridViewCmp && gridViewCmp.ownerCt
            var gridEl          = gridCmp && (gridCmp.el || gridCmp.element)

            gridEl              = gridEl && gridEl.dom;

            // `lookUpUntil` indicates the highest node in tree we can examine while building the css query segment
            // can't go inside the method if row exceeds this level
            if (!rowEl || rowEl == lookUpUntil || $.contains(rowEl, lookUpUntil) || !gridEl) return this.SUPERARG(arguments);
            
            var rowSelector;
            
            if (rowEl.id && !this.ignoreDomId(rowEl.id, rowEl)) 
                rowSelector         = '#' + rowEl.id
            else {
                var rowCss          = this.getFirstNonExtCssClass(rowEl);
                
                // If a custom non-Ext CSS row class is found we grab it, if not we fall back to nth-child
                if (rowCss) {
                    rowSelector     = '.' + rowCss;
                } else {
                    var rowIndex    = this.getNthPosition(rowEl, itemSelector.indexOf('item') >= 0 ? 'x-grid-item' : 'x-grid-row');
                    rowSelector     = itemSelector + ':nth-child(' + (rowIndex + 1) + ')';
                }
            }

            var cellSelector
            
            var cellCss         = this.getFirstNonExtCssClass(cellEl);
            
            // If a custom non-Ext CSS cell class is found we grab it, if not we fall back to nth-child
            if (cellCss) {
                cellSelector    = '.' + cellCss;
            } else {
                var cellIndex   = this.getNthPosition(cellEl, 'x-grid-cell');
                cellSelector    = '.x-grid-cell:nth-child(' + (cellIndex + 1) + ')';
            }

            
            // try to find additional dom query from cell to the original node
            var domQuery        = this.findDomQueryFor(node, cellEl, 1)
            
            var segment         = rowSelector + ' ' + cellSelector + (domQuery ? ' ' + domQuery.query : '')
            
            // if we've found a dom query that starts with ID - we don't need our row/cell selectors at all
            if (domQuery && domQuery.foundId) segment = domQuery.query
            
            return {
                current     : gridEl,
                segment     : segment,
                target      : domQuery ? domQuery.target : cellEl
            }
        }
    }
});
