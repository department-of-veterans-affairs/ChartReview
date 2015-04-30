/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.Recognizer.BoundList

A class recognizing the Ext JS BoundList markup

*/
Role('Siesta.Recorder.TargetExtractor.Recognizer.BoundList', {
    
    requires     : [ 'jquery' ],

    override : {
        getCssQuerySegmentForElement : function (node) {
            var $item   = this.jquery(node).closest('.x-boundlist-item')
            
            if (!$item.length) return this.SUPERARG(arguments)
            
            // todo, should we check for user specific classes too and how to prioritize in this case?
            return {
                current     : $item.closest('.x-boundlist')[ 0 ],
                segment     : '.x-boundlist-item:contains(' + $item[ 0 ].innerHTML + ')',
                target      : $item[ 0 ]
            }
        }
    }
});
