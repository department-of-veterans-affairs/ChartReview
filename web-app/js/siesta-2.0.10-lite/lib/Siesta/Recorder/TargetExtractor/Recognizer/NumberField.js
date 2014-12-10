/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.Recognizer.NumberField

A class recognizing the Ext JS NumberField component
*/
Role('Siesta.Recorder.TargetExtractor.Recognizer.NumberField', {

    override : {
        getCssQuerySegmentForElement : function (node) {
            if (!node.className.match(/\bx-form-spinner-(?:up|down)/)) {
                return this.SUPERARG(arguments);
            }

            return '.' + node.className.match(/\bx-form-spinner-(?:up|down)/)[ 0 ]
        }
    }
});
