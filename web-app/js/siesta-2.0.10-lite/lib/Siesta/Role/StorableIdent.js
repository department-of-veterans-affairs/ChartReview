/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Role.StorableIdent', {
    
    does        : KiokuJS.Feature.Class.OwnID,
    
    
    methods : {
        
        acquireId : function() {
            return this.id
        }
    }
})
