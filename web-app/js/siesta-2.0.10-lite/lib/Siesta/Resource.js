/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// Localization helper
Siesta.Resource = (function () {

    function get(dict, key) {
        var text = dict[key];

        if (text) return text;

        if (window.console && console.error) {
            window.top.console.error('TEXT_NOT_DEFINED: ' + key);
        }

        return 'TEXT_NOT_DEFINED: ' + key;
    }

    return function (namespace, key) {

        var dictionary = Siesta.CurrentLocale[namespace];

        if (!dictionary) {
            throw 'Missing dictionary for namespace: ' + namespace;
        }

        if (key) {
            return get(dictionary, key)
        }

        return {
            dict    : dictionary,

            get     : function(key) {
                return get(this.dict, key);
            }
        };
    }
})();
