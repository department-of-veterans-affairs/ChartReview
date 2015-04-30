/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Test.ExtJSCore.meta.extend({
    
    has : {
        installLoaderInstrumentationHook    : false
    },

    override : {
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * The same as {@link Siesta.Test.Browser#waitForPageLoad}, but additionally passes the ExtJS object as the second argument
         * 
         *      t.waitForPageLoad(function (window, Ext) {
         *          ...
         *      })
         * 
         * @method
         * @member Siesta.Test.ExtJS
         */
        waitForPageLoad : function (callback, scope) {
            
            return this.SUPER(function (window) {
                callback.call(this, window, window.Ext)
            }, scope || this)
        },
        
        
        start : function () {
            if (this.installLoaderInstrumentationHook) this.installLoaderHook()
            
            this.SUPERARG(arguments)
        }
    },
    
    
    methods : {
        
        installLoaderHook : function () {
            this.harness.generateLoaderInstrumentationHook()(this.harness, this.Ext(), this.global.StartTest.launchId)
        }
    }
});
