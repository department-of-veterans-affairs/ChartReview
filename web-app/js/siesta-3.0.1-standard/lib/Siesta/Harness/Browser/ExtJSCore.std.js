/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Harness.Browser.ExtJSCore.meta.extend({
    
    has : {
        /**
         * @cfg {String} coverageUnit A string defining how the instrumented files are processed, can be either "file" or "extjs_class" (default value).
         * 
         * The generic browser layer only recognizes the "file" value. Please refer its {@link Siesta.Harness.Browser#coverageUnit documentation}
         * for details.
         * 
         * This class adds a new coverage mode - "extjs_class". In this mode, in every file, Siesta will look
         * for `Ext.define(className, definition)` statements and only instrument these statements. Several classes can be 
         * instrumented in one file. The resulting report will contain information about **classes**, not files. In this mode
         * you can preload one big file with all your classes concatenated and still get a meaningful coverage report.
         * 
         * Please note that when using the "extjs_class" mode, any custom code statements between `Ext.define()` calls will not be instrumented.
         * 
         * The same rules apply to files that are loaded on-demand with Ext.Loader, please see {@link #installLoaderInstrumentationHook}.
         * 
         * **This option is available only in the Siesta Standard package**.
         * 
         * @member Siesta.Harness.Browser.ExtJSCore
         */
        coverageUnit                : {
            lazy    : function () { return 'extjs_class' }
        },
        
        
        /**
         * @cfg {Boolean} installLoaderInstrumentationHook A boolean flag indicating whether Siesta should install the hook into the
         * `Ext.Loader` code, to instrument files being "required" on the fly.
         * 
         * **Note:** You may find, that the hook is installed later then needed and some classes are missing in the coverage report.
         * In this case, try to use the alternative method for hook installation, using {@link #getLoaderInstrumentationHook} method.
         * 
         * **Note:** In both cases, the Ext JS loader will be switched the to synchronous loading mode, so that all files will be loaded
         * with an XHR request (and its possible to modify the loaded content) and not with &lt;script&gt; tag. Naturally, all
         * files have to originate from the same domain.
         * 
         * See also {@link Siesta.Harness.Browser#includeCoverageUnits includeCoverageUnits}, {@link Siesta.Harness.Browser#excludeCoverageUnits excludeCoverageUnits}, 
         * {@link #coverageUnit}, {@link Siesta.Harness.Browser#enableCodeCoverage enableCodeCoverage}
         *  
         * **This option is available only in Standard package**.
         * 
         * @member Siesta.Harness.Browser.ExtJSCore
         */
        installLoaderInstrumentationHook    : true,
        
        /**
         * @cfg {RegExp} excludeCoverageUnits A regular expression, defining which coverage units to exclude from the instrumentation.
         * The default value is /^Ext/ meaning that Ext JS framework classes will not be instrumented.
         * 
         * See also {@link Siesta.Harness.Browser#includeCoverageUnits includeCoverageUnits}, 
         * {@link #coverageUnit}, {@link Siesta.Harness.Browser#enableCodeCoverage enableCodeCoverage}
         *  
         * **This option is available only in the Siesta Standard package**.
         * 
         * @member Siesta.Harness.Browser.ExtJSCore
         */
        excludeCoverageUnits                : /^Ext/
    },
    
    override : {
        
        getNewTestConfiguration : function (desc, scopeProvider, contentManager, launchOptions) {
            var config                              = this.SUPERARG(arguments)
            
            config.installLoaderInstrumentationHook = this.enableCodeCoverage && this.getDescriptorConfig(desc, 'installLoaderInstrumentationHook')
            
            return config
        }
    },
    
    methods : {
        
        generateLoaderInstrumentationHook : function () {
            return function (Harness, tExt, launchId) {
                // absence of `tExt.getVersion` indicates Ext3 
                if (!tExt || !tExt.Loader || !tExt.getVersion || window.__loaderInstrumentationHookInstalled__) return
                
                __loaderInstrumentationHookInstalled__ = true
                
                // if no arguments were supplied, assume the function is executed inside of the test's iframe/popup
                if (Harness == null)    Harness     = (window.opener || window.parent).Siesta.my.activeHarness
                if (tExt == null)       tExt        = window.Ext
                // launchId should generally be always supplied, because user can start several parallel test executions
                // exception is the automation mode, where we can reliably use "currentLaunchId" 
                if (launchId == null)   launchId    = Harness.currentLaunchId
                
                var contentManager      = Harness.launches[ launchId ].contentManager
                
                var Loader              = tExt.Loader
                
                var coverageUnit        = Harness.getCoverageUnit()
                var instrumenter        = Harness.instrumenter
                
                Loader.syncModeEnabled  = true
                
                var prevLoadScriptFile  = Loader.loadScriptFile
                var prevGlobalEval      = tExt.globalEval
                
                var currentUrl
                
                var instrumentedEval    = function (code) {
                    contentManager.addContent(currentUrl, code)
                    
                    var instrumentedContent = contentManager.getInstrumentedContentOf(currentUrl, instrumenter, coverageUnit)
                    
                    prevGlobalEval.call(tExt, instrumentedContent)
                }
                
                var touchVersion        = tExt.getVersion('touch')
                var extVersion          = tExt.getVersion('extjs')
                
                if (touchVersion) {
                    var prevOnFileLoaded    = Loader.onFileLoaded
                    
                    Loader.onFileLoaded     = function () {
                        // some weird issue with ST loader when it is in synchronous loading mode
                        // `numPendingFiles` goes < 0, which break various checks like `numPendingFiles == 0`
                        if (this.numPendingFiles <= 0) this.numPendingFiles = 1
                        
                        return prevOnFileLoaded.apply(this, arguments)
                    }
                } else if (extVersion && extVersion.major == 4) {
                    Loader.loadScriptFile   = function (url, onLoad, onError, scope, synchronous) {
                        currentUrl              = url.replace(/\?.*/, '')
                        
                        var instrumentedContent = contentManager.getInstrumentedContentOf(currentUrl, instrumenter, coverageUnit)
                        
                        // empty string is ok, only `null/undefined` is invalid case
                        if (instrumentedContent != null) {
                            prevGlobalEval.call(tExt, instrumentedContent)
                            onLoad.call(scope)
                        } else {
                            tExt.globalEval      = instrumentedEval
                            
                            prevLoadScriptFile.apply(this, arguments)
                            
                            tExt.globalEval      = prevGlobalEval
                        }
                        
                        currentUrl          = null
                    }
                } else if (extVersion && extVersion.major == 5) {
                    var prevInject      = tExt.Boot.Entry.prototype.inject
                    
                    tExt.Boot.Entry.prototype.inject = function (content, asset) {
                        if (!this.isCss()) {
                            currentUrl              = this.url.replace(/\?.*/, '')
                            
                            contentManager.addContent(currentUrl, content)
                            
                            var instrumentedContent = contentManager.getInstrumentedContentOf(currentUrl, instrumenter, coverageUnit)
                            
                            // empty string is ok, only `null/undefined` is invalid case
                            if (instrumentedContent != null) {
                                content             = instrumentedContent
                            }
                            
                            currentUrl          = null
                        }
                        
                        prevInject.call(this, content, asset)
                    }
                }
            }
        },
        
        
        /**
         * Returns a string presentation of the ExtJS/SenchaTouch on-demand loader hook, suitable to be used in the test's 
         * {@link Siesta.Harness#preload preloads}. This will allow you to install the hook at the earliest possible point, 
         * right after preloading Ext and before "requiring" any classes. 
         * 
         * When using this method, there's no need to enable {@link #installLoaderInstrumentationHook} option
         * (which will become a no-op).  
         * 
         * Typical usage will be:
         * 
    
    var Harness = Siesta.Harness.Browser.ExtJS;

    Harness.configure({
        title                   : 'Code Coverage',
        
        enableCodeCoverage      : true,
        coverageUnit            : 'extjs_class',
        
        preload                 : [
            'http://cdn.sencha.io/ext-4.2.0-gpl/ext-all.js',
            {
                // inject the hook right after ExtJS and before application file
                text    : Harness.getLoaderInstrumentationHook()
            },
            {
                url         : 'app.js',
                instrument  : true
            }
        ]
    });

         * Or, when using {@link Siesta.Harness#hostPageUrl} option:
         *

    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=UTF-8">
            
            <link rel="stylesheet" type="text/css" href="http://cdn.sencha.com/ext/gpl/4.2.0/resources/css/ext-all.css">
            <script type="text/javascript" src="http://cdn.sencha.com/ext/gpl/4.2.0/ext-all-debug.js"></script>
    
            <!-- 
                The hook needs to be installed after the Ext loader is available on the page
            -->
            <script type="text/javascript">
                // will be executed when running in testing environment only
                parent.Harness && eval(parent.Harness.getLoaderInstrumentationHook())
            </script>
            <!--
                And before any code that uses it, like main application file or similar.
             -->
             ....
        </head>
        <body>
            ....
        </body>
    </html>

         * 
         * @return {String}
         * 
         * @member Siesta.Harness.Browser.ExtJSCore
         */
        getLoaderInstrumentationHook : function () {
            return ';(' + this.generateLoaderInstrumentationHook().toString() + ')(' + 
                '(window.opener || window.parent).Siesta.my.activeHarness, Ext, window.StartTest && window.StartTest.launchId' +
            ')'
        }
    }
})