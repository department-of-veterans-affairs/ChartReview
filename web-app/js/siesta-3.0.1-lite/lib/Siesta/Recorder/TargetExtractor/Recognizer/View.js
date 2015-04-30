/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.Recognizer.View

A class recognizing the Ext JS View component
*/
Role('Siesta.Recorder.TargetExtractor.Recognizer.View', {

    override : {
        getCssQuerySegmentForElement : function (node, isTarget, maxNumberOfCssClasses, lookUpUntil) {
            var cmpRoot = $(node).closest('.x-component');

            if (cmpRoot.length === 0 || $.contains(cmpRoot[ 0 ], lookUpUntil)) {
                return this.SUPERARG(arguments);
            }

            var Ext     = this.Ext;
            var cmp     = Ext && Ext.getCmp(cmpRoot[ 0 ].id);

            if (!(cmp && Ext.ComponentQuery.is(cmp, 'dataview') && $(node).closest(cmp.itemSelector).length > 0)) {
                return this.SUPERARG(arguments);
            }

            var itemSelector    = cmp.itemSelector;
            var itemNode        = node;
            var newTarget       = node

            if (!$(node).is(itemSelector)) {
                itemNode        = $(node).closest(itemSelector)[ 0 ];
            }

            var pos             = Array.prototype.slice.apply(itemNode.parentNode.childNodes).indexOf(itemNode) + 1;

            var segment         = itemSelector + ':nth-child(' + pos + ')' + ' ';

            if (node !== itemNode) {
                var customCss   = this.getFirstNonExtCssClass(node);
                
                if (customCss)
                    // TODO not guaruanteed that this query will match exact "node"
                    segment         += '.' + customCss
                else {
                    var prev        = this.allowNodeNamesForTargetNodes
                    this.allowNodeNamesForTargetNodes = true
                    
                    var extraQuery  = this.findDomQueryFor(node, itemNode)
                    
                    this.allowNodeNamesForTargetNodes = prev
                    
                    if (extraQuery) {
                        segment     += extraQuery.query
                        newTarget   = extraQuery.target
                    }
                }
                    
            }

            return {
                current     : (cmp.el || cmp.element).dom,
                segment     : segment,
                target      : newTarget
            }
        }
    }
});
