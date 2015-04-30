/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Test.BDD.StringPlaceholder', {
    
    does        : Siesta.Test.Role.Placeholder,
    
    has         : {
        value           : { required : true }
    },
    
    
    methods     : {
        
        equalsTo : function (string) {
            if (Object.prototype.toString(this.value) == '[object RegExp]')
                return this.value.test(string)
            else
                return String(string).indexOf(this.value) > -1
        },
        
        
        toString : function () {
            if (Object.prototype.toString(this.value) == '[object RegExp]')
                return 'any string matching: ' + this.value
            else
                return 'any string containing: ' + this.value
        }
    }
})
