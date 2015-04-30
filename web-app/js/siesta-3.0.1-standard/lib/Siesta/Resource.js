/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// Localization helper
Siesta.Resource = (function () {
    
    var Resource    = Class({
        does    : Siesta.Util.Role.CanFormatStrings,
        
        has     : {
            dict        : null
        },
        
        methods : {
            'get' : function (key, data) {
                var text = this.dict[ key ];
        
                if (text) return this.formatString(text, data);
        
                if (window.console && console.error) {
                    window.top.console.error('TEXT_NOT_DEFINED: ' + key);
                }
        
                return 'TEXT_NOT_DEFINED: ' + key;
            }
        }
    
    })
    

    return function (namespace, key) {
        var dictionary  = Siesta.CurrentLocale[ namespace ];

        if (!dictionary) {
            throw 'Missing dictionary for namespace: ' + namespace;
        }
        
        var resource    = new Resource({ dict : dictionary, serializeFormatingPlaceholders : false })

        if (key) return resource.get(key)

        return resource
    }
})();
