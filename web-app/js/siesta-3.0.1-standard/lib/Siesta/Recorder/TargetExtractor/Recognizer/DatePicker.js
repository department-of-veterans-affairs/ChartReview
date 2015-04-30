/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Recorder.TargetExtractor.Recognizer.DatePicker

A class recognizing the Ext JS DatePicker component
*/
Role('Siesta.Recorder.TargetExtractor.Recognizer.DatePicker', {

    override : {
        getCssQuerySegmentForElement : function (node) {
            if (!node.className.match(/\bx-datepicker-date\b/)) {
                return this.SUPERARG(arguments);
            }

            return '.x-datepicker-date:contains(' + node.innerHTML.match(/^\d{1,2}/)[ 0 ] + ')'
        }
    }
});
