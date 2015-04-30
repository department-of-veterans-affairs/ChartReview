/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Test.Sub', {
    
    has : {
        isExclusive         : false,
        parent              : { required : true }
    },
    
    
    methods : {
        
        getExceptionCatcher : function () {
            return this.parent.getExceptionCatcher()
        },
        
        
        getTestErrorClass : function () {
            return this.parent.getTestErrorClass()
        },
        
        
        getStartTestAnchor : function () {
            return this.parent.getStartTestAnchor()
        },
        
        
        expectGlobals : function () {
            return this.parent.expectGlobals.apply(this.parent, arguments)
        }
    }
        
})
//eof Siesta.Test
