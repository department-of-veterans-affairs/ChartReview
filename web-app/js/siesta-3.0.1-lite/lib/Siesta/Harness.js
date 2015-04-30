/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Harness

`Siesta.Harness` is an abstract base harness class in Siesta hierarchy. This class provides no UI, 
you should use one of it subclasses, for example {@link Siesta.Harness.Browser}

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.


Synopsys
========

    var Harness,
        isNode        = typeof process != 'undefined' && process.pid
    
    if (isNode) {
        Harness = require('siesta');
    } else {
        Harness = Siesta.Harness.Browser;
    }
        
    
    Harness.configure({
        title     : 'Awesome Test Suite',
        
        transparentEx       : true,
        
        autoCheckGlobals    : true,
        expectedGlobals     : [
            'Ext',
            'Sch'
        ],
        
        preload : [
            "http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js",
            "../awesome-project-all.js",
            {
                text    : "console.log('preload completed')"
            }
        ]
    })
    
    
    Harness.start(
        // simple string - url relative to harness file
        'sanity.t.js',
        
        // test file descriptor with own configuration options
        {
            url     : 'basic.t.js',
            
            // replace `preload` option of harness
            preload : [
                "http://cdn.sencha.io/ext-4.0.6/ext-all-debug.js",
                "../awesome-project-all.js"
            ]
        },
        
        // groups ("folders") of test files (possibly with own options)
        {
            group       : 'Sanity',
            
            autoCheckGlobals    : false,
            
            items       : [
                'data/crud.t.js',
                ...
            ]
        },
        ...
    )


*/


Class('Siesta.Harness', {
    
    does        : [
        JooseX.Observable,
        Siesta.Util.Role.CanGetType
    ],
    
    has : {
        /**
         * @cfg {String} title The title of the test suite. Can contain HTML. When provided in the test file descriptor - will change the name of test in the harness UI.
         */
        title               : null,
        
        /**
         * @cfg {Class} testClass The test class which will be used for creating test instances, defaults to {@link Siesta.Test}.
         * You can subclass {@link Siesta.Test} and provide a new class. 
         * 
         * This option can be also specified in the test file descriptor. 
         */
        testClass           : Siesta.Test,
        contentManagerClass : Siesta.Content.Manager,
        
        // fields of test descriptor:
        // - id - either `url` or wbs + group - computed
        // - url
        // - isMissing - true if test file is missing
        // - testCode - a test code source (can be provided by user)
        // - testConfig - config object provided to the StartTest
        // - index - (in the group) computed
        // - scopeProvider
        // - scopeProviderConfig
        // - preload
        // - alsoPreload
        // - parent - parent descriptor (or harness for top-most ones) - computed
        // - preset - computed by harness - instance of Siesta.Content.Preset
        // - forceDOMVisible - true to show the <iframe> on top of all others when running this test
        //                     (required for IE when using "document.getElementFromPoint()") 
        // OR - object 
        // - group - group name
        // - items - array of test descriptors
        // - expanded - initial state of the group (true by default)
        descriptors         : Joose.I.Array,
        descriptorsById     : Joose.I.Object,
        
        launchCounter       : 0,
        
        launches            : Joose.I.Object,
        
        scopesByURL         : Joose.I.Object,
        testsByURL          : Joose.I.Object,
        
        /**
         * @cfg {Boolean} transparentEx When set to `true` harness will not try to catch any exception, thrown from the test code.
         * This is very useful for debugging - you can for example use the "break on error" option in Firebug.
         * But, using this option may naturally lead to unhandled exceptions, which may leave the harness in incosistent state - 
         * refresh the browser page in such case.
         *  
         * Defaults to `false` - harness will do its best to detect any exception thrown from the test code.
         * 
         * This option can be also specified in the test file descriptor. 
         */
        transparentEx       : false,
        
        scopeProviderConfig     : null,
        scopeProvider           : null,
        
        /**
         * @cfg {String} runCore Either `parallel` or `sequential`. Indicates how the individual tests should be run - several at once or one-by-one.
         * Default value is "parallel". You do not need to change this option usually.
         */
        runCore                 : 'parallel',
        
        /**
         * @cfg {Number} maxThreads The maximum number of tests running at the same time. Only applicable for `parallel` run-core.
         */
        maxThreads              : 4,
        
        /**
         * @cfg {Boolean} autoCheckGlobals When set to `true`, harness will automatically issue an {@link Siesta.Test#verifyGlobals} assertion at the end of each test,
         * so you won't have to manually specify it each time. The assertion will be triggered only if test completed successfully. Default value is `false`.
         * See also {@link #expectedGlobals} configuration option and {@link Siesta.Test#expectGlobals} method.
         * 
         * This option will be always disabled in Opera, since every DOM element with `id` is being added as a global symbol in it.
         * 
         * This option can be also specified in the test file descriptor.
         */
        autoCheckGlobals        : false,
        
        disableGlobalsCheck     : false,
        
        /**
         * @cfg {Array} expectedGlobals An array of properties names which are likely to present in the scope of each test. There is no need to provide the name
         * of built-in globals - harness will automatically scan them from the empty context. Only provide the names of global properties which will be created
         * by your preload code.
         * 
         * For example
         * 
    Harness.configure({
        title               : 'Ext Scheduler Test Suite',
        
        autoCheckGlobals    : true,
        expectedGlobals     : [
            'Ext',
            'MyProject',
            'SomeExternalLibrary'
        ],
        ...
    })
            
         * This option can be also specified in the test file descriptor.
         */
        expectedGlobals         : Joose.I.Array,
        // will be populated by `populateCleanScopeGlobals` 
        cleanScopeGlobals       : Joose.I.Array,
        
        /**
         * @cfg {Array} preload The array which contains the *preload descriptors* describing which files/code should be preloaded into the scope of each test.
         * 
         * Preload descriptor can be:
         * 
         * - a string, containing an url to load (cross-domain urls are ok, if url ends with ".css" it will be loaded as CSS)
         * - an object `{ type : 'css/js', url : '...' }` allowing to specify the CSS files with different extension
         * - an object `{ type : 'css/js', content : '...' }` allowing to specify the inline content for script / style. The content should only be the tag content - not the tag itself, it'll be created by Siesta.
         * - an object `{ text : '...' }` which is a shortcut for `{ type : 'js', content : '...' }`
         * 
         * For example:
         * 
    Harness.configure({
        title           : 'Ext Scheduler Test Suite',
        
        preload         : [
            'http://cdn.sencha.io/ext-4.0.2a/resources/css/ext-all.css',
            'http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js',
            {
                text    : 'MySpecialGlobalFunc = function () { if (typeof console != "undefined") ... }'
            }
        ],
        ...
    })
            
         * This option can be also specified in the test file descriptor. **Note**, that if test descriptor has non-empty {@link Siesta.Harness.Browser#hostPageUrl hostPageUrl}
         * option, then *it will not inherit* the `preload` option from parent descriptors or harness, **unless** it has the `preload` config set to string `inherit`. 
         * If both `hostPageUrl` and `preload` are set on the harness level, `preload` value still will be inherited. For example:
         *
    Harness.configure({
        hostPageUrl     : 'general-page.html',
        preload         : [ 'my-file.js' ],
        ...
    })
    
    Harness.start(
        // this test will inherit both `hostPageUrl` and `preload`
        'test1.js',
        {
            // no preloads inherited
            hostPageUrl     : 'host-page.html',
            url             : 'test2.js'
        }, 
        {
            // inherit `preload` value from the upper level - [ 'my-file.js' ]
            hostPageUrl     : 'host-page.html',
            preload         : 'inherit',
            url             : 'test3.js'
        }, 
        {
            group           : 'Some group',
            hostPageUrl     : 'host-page2.html',
            preload         : 'inherit',
            
            items           : [
                // inherit `hostPageUrl` value from the group
                // inherit `preload` value from the upper level - [ 'my-file.js' ]
                url             : 'test3.js'
            ]
        }
    )
    
         * When using the code coverage feature, one need to explicitly mark the JavaScript files that needs to be instrumented with the "instrument : true".
         * See {@link Siesta.Harness.Browser#enableCodeCoverage} for details.
         * 

    Harness.configure({
        preload         : [
            {
                type        : 'js',
                url         : 'some_file.js',
                instrument  : true
            }
        ],
        ...
    })


         *     
         *     
         */
        preload                 : Joose.I.Array,
        
        /**
         * @cfg {Array} alsoPreload The array with preload descriptors describing which files/code should be preloaded **additionally**.
         * 
         * This option can be also specified in the test file descriptor.
         */
        
        /**
         * @cfg {Object} listeners The object which keys corresponds to event names and values - to event handlers. If provided, the special key "scope" will be treated as the 
         * scope for all event handlers, otherwise the harness itself will be used as scope.
         * 
         * Note, that the events from individual {@link Siesta.Test test cases} instances will bubble up to the harness - you can listen to all of them in one place: 
         * 

    Harness.configure({
        title     : 'Awesome Test Suite',
        
        preload : [
            'http://cdn.sencha.io/ext-4.1.0-gpl/resources/css/ext-all.css',
            'http://cdn.sencha.io/ext-4.1.0-gpl/ext-all-debug.js',
            
            'preload.js'
        ],
        
        listeners : {
            testsuitestart      : function (event, harness) {
                log('Test suite is starting: ' + harness.title)
            },
            testsuiteend        : function (event, harness) {
                log('Test suite is finishing: ' + harness.title)
            },
            teststart           : function (event, test) {
                log('Test case is starting: ' + test.url)
            },
            testupdate          : function (event, test, result) {
                log('Test case [' + test.url + '] has been updated: ' + result.description + (result.annotation ? ', ' + result.annotation : ''))
            },
            testfailedwithexception : function (event, test) {
                log('Test case [' + test.url + '] has failed with exception: ' + test.failedException)
            },
            testfinalize        : function (event, test) {
                log('Test case [' + test.url + '] has completed')
            }
        }
    })

         */
        
        
        /**
         * @cfg {Boolean} cachePreload When set to `true`, harness will cache the content of the preload files and provide it for each test, instead of loading it 
         * from network each time. This option may give a slight speedup in tests execution (especially when running the suite from the remote server), but see the 
         * caveats below. Default value is `false`.
         * 
         * Caveats: this option doesn't work very well for CSS (due to broken relative urls for images). Also its not "debugging-friendly" - as you will not be able 
         * to setup breakpoints for cached code. 
         */
        cachePreload            : false,
        
        mainPreset              : null,
        emptyPreset             : null,
        
        verbosity               : 0,
        
        /**
         * @cfg {Number} keepNLastResults
         * 
         * Indicates the number of the test results which still should be kept, for user examination.
         * Results are cleared when their total number exceed this value, based on FIFO order.
         */
        keepNLastResults        : 2,
        
        lastResultsURLs         : Joose.I.Array,
        lastResultsByURL        : Joose.I.Object,
        
        /**
         * @cfg {Boolean} overrideSetTimeout When set to `true`, the tests will override the native "setTimeout" from the context of each test
         * for asynchronous code tracking. If setting it to `false`, you will need to use `beginAsync/endAsync` calls to indicate that test is still running.
         * 
         * Note, that this option may not work reliably, when used for several sub tests launched simultaneously (for example 
         * for several sibling {@link Siesta.Test#todo} sections.  
         * 
         * This option can be also specified in the test file descriptor. Defaults to `false`.
         */
        overrideSetTimeout      : false,
        
        /**
         * @cfg {Boolean} needDone When set to `true`, the tests will must indicate that that they have reached the correct exit point with `t.done()` call, 
         * after which, adding any assertions is not allowed. Using this option will ensure that test did not exit prematurely with some exception silently caught.
         * 
         * This option can be also specified in the test file descriptor.
         */
        needDone                : false,
        
        needToStop              : false,
        
        // the default timeout for tests will be increased when launching more than this number of files
        increaseTimeoutThreshold    : 8,
        
        // the start and end dates for the most recent `launch` method
        startDate               : null,
        endDate                 : null,
        
        /**
         * @cfg {Number} waitForTimeout Default timeout for `waitFor` (in milliseconds). Default value is 10000.
         * 
         * This option can be also specified in the test file descriptor.
         */
        waitForTimeout          : 10000,
        
        /**
         * @cfg {Number} defaultTimeout Default timeout for `beginAsync` operation (in milliseconds). Default value is 15000.
         * 
         * This option can be also specified in the test file descriptor.
         */
        defaultTimeout          : 15000,
        
        /**
         * @cfg {Number} subTestTimeout Default timeout for sub tests. Default value is twice bigger than {@link #defaultTimeout}.
         * 
         * This option can be also specified in the test file descriptor.
         */
        subTestTimeout          : null,
        
        /**
         * @cfg {Number} isReadyTimeout Default timeout for test start (in milliseconds). Default value is 15000. See {@link Siesta.Test#isReady} for details.
         * 
         * This option can be also specified in the test file descriptor.
         */
        isReadyTimeout          : 10000,
        
        /**
         * @cfg {Number} pauseBetweenTests Default timeout between tests (in milliseconds). Increase this settings for big test suites, to give browser time for memory cleanup.
         */
        pauseBetweenTests       : 300,
        
        
        /**
         * @cfg {Boolean} failOnExclusiveSpecsWhenAutomated When this option is enabled and Siesta is running in automation mode
         * (using WebDriver or PhantomJS launcher) any exclusive BDD specs found (like {@link Siesta.Test#iit t.iit} or {@link Siesta.Test#ddescribe t.ddescribe}
         * will cause a failing assertion. The idea behind this setting is that such "exclusive" specs should only be used during debugging
         * and are often mistakenly committed in the codebase, leaving other specs not executed. 
         * 
         * This option can be also specified in the test file descriptor.
         */
        failOnExclusiveSpecsWhenAutomated   : false,
        
        
        setupDone               : false,
        
        sourceLineForAllAssertions      : false,
        
        currentLaunchId         : null
    },
    
    
    methods : {
        
        initialize : function () {
            var me      = this
            
            me.on('testupdate', function (event, test, result, parentResult) {
                me.onTestUpdate(test, result, parentResult);
            })
            
            me.on('testfailedwithexception', function (event, test, exception, stack) {
                me.onTestFail(test, exception, stack);
            })
            
            me.on('teststart', function (event, test) {
                me.onTestStart(test);
            })
            
            me.on('testfinalize', function (event, test) {
                me.onTestEnd(test);
            })
        },
        
        onTestUpdate : function (test, result, parentResult) {
        },
        
        
        onTestFail : function (test, exception, stack) {
        },
        
        
        onTestStart : function (test) {
        },
        
        
        onTestEnd : function (test) {
        },
        
        
        onTestSuiteStart : function (descriptors, contentManager) {
            this.startDate  = new Date()
            
            /**
             * This event is fired when the test suite starts. Note, that when running the test suite in the browsers, this event can be fired several times
             * (for each group of tests you've launched).  
             * 
             * You can subscribe to it, using regular ExtJS syntax:
             * 
             *      Harness.on('testsuitestart', function (event, harness) {}, scope, { single : true })
             * 
             * See also the "/examples/events"
             * 
             * @event testsuitestart
             * @member Siesta.Harness
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Harness} harness The harness that just has started
             */
            this.fireEvent('testsuitestart', this)
        },
        
        
        onTestSuiteEnd : function (descriptors, contentManager) {
            this.endDate    = new Date()
            
            /**
             * This event is fired when the test suite ends. Note, that when running the test suite in the browsers, this event can be fired several times
             * (for each group of tests you've launched).  
             * 
             * @event testsuiteend
             * @member Siesta.Harness
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Harness} harness The harness that just has ended
             */
            this.fireEvent('testsuiteend', this)
        },
        
        
        onBeforeScopePreload : function (scopeProvider, url) {
            this.fireEvent('beforescopepreload', scopeProvider, url)
        },
        
        
        onAfterScopePreload : function (scopeProvider, url) {
            this.fireEvent('afterscopepreload', scopeProvider, url)
        },
        
        
        onCachingError : function (descriptors, contentManager) {
        },
        
        
        /**
         * This method configures the harness instance. It just copies the passed configuration option into harness instance.
         *
         * @param {Object} config - configuration options (values of attributes for this class)
         */
        configure : function (config) {
            Joose.O.copy(config, this)
            
            var me      = this
            
            if (config.listeners) Joose.O.each(config.listeners, function (value, name) {
                if (name == 'scope') return
                
                me.on(name, value, config.scope || me)
            })
        },
        
        
        // backward compat
        processPreloadArray : function (preload) {
            var me = this
            
            Joose.A.each(preload, function (url, index) {
                
                // do not process { text : "" } preload descriptors
                if (Object(url) === url) return 
                
                preload[ index ] = me.normalizeURL(url)
            })
            
            return preload
        },
        
        
        populateCleanScopeGlobals : function (scopeProvider, callback) {
            var scopeProviderClass  = eval(scopeProvider)
            var cleanScope          = new scopeProviderClass()
            
            var cleanScopeGlobals   = this.cleanScopeGlobals        
            
            // we can also use "create" and not "setup" here
            // create will only create the iframe (in browsers) and will not try to update its content
            // the latter crashes IE8
            cleanScope.setup(function () {
                
                for (var name in cleanScope.scope) cleanScopeGlobals.push(name)
                
                callback()
                
                // this setTimeout seems to stop the spinning loading indicator in FF
                // accorting to https://github.com/3rd-Eden/Socket.IO/commit/bad600fb1fb70238f42767c56f01256470fa3c15
                // it only works *after* onload (this callback will be called *in* onload)
                
                setTimeout(function () {
                    // will remove the iframe (in case of browser harness) from DOM and stop loading indicator
                    cleanScope.cleanup()    
                }, 0)
            })
        },
        
        
        startSingle : function (desc, callback) {
            var me              = this
            
            this.__counter__    = this.__counter__ || 0 
            
            var startSingle     = function () {
                me.launch([ me.normalizeDescriptor(desc, me, me.__counter__++) ], callback)
            }
            
            me.setupDone ? startSingle() : this.setup(startSingle)
        },
        
        
        setup : function (callback) {
            var me              = this
            
            this.mainPreset     = new Siesta.Content.Preset({
                preload     : this.processPreloadArray(this.preload)
            })
            
            this.emptyPreset    = new Siesta.Content.Preset()
            
            this.populateCleanScopeGlobals(this.scopeProvider, function () {
                me.setupDone        = true
                
                callback()
            })
        },
        
        /**
         * This method will launch a test suite. It accepts a variable number of *test file descriptors* or an array of such. A test file descritor is one of the following:
         * 
         * - a string, containing a test file url
         * - an object containing the `url` property `{ url : '...', option1 : 'value1', option2 : 'value2' }`. The `url` property should point to the test file.
         * Other properties can contain values of some configuration options of the harness (marked accordingly). In this case, they will **override** the corresponding values,
         * provided to harness or parent descriptor. 
         * - an object `{ group : 'groupName', items : [], expanded : true, option1 : 'value1' }` specifying the folder of test files. The `expanded` property
         * sets the initial state of the folder - "collapsed/expanded". The `items` property can contain an array of test file descriptors.
         * Other properties will override the applicable harness options **for all child descriptors**.
         * 
         * If test descriptor is `null` or other "falsy" value it is ignored.
         * 
         * Groups (folder) may contain nested groups. Number of nesting levels is not limited.
         * 
         * For example, one may easily have a special group of test files, having its own `preload` configuration (for example for testing on-demand loading). In the same
         * time some test in that group may have its own preload, overriding others.

    Harness.configure({
        title           : 'Ext Scheduler Test Suite',
        preload         : [
            'http://cdn.sencha.io/ext-4.0.2a/resources/css/ext-all.css',
            'http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js',
            '../awesome-app-all-debug.js'
        ],
        ...
    })
    
    Harness.start(
        // regular file
        'data/crud.t.js',
        // a group with own "preload" config for its items
        {
            group       : 'On-demand loading',
            
            preload     : [
                'http://cdn.sencha.io/ext-4.0.2a/resources/css/ext-all.css',
                'http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js',
            ],
            items       : [
                'ondemand/sanity.t.js',
                'ondemand/special-test.t.js',
                // a test descriptor with its own "preload" config (have the most priority)
                {
                    url         : 'ondemand/4-0-6-compat.t.js',
                    preload     : [
                        'http://cdn.sencha.io/ext-4.0.6/resources/css/ext-all.css',
                        'http://cdn.sencha.io/ext-4.0.6/ext-all-debug.js',
                    ]
                },
                // sub-group
                {
                    group       : 'Sub-group',
                    items       : [
                        ...
                    ]
                }
            ]
        },
        ...
    )

         * Additionally, you can provide a test descriptor in the test file itself, adding it as the 1st or 2nd argument for `StartTest` call:  
         * 
    StartTest({
        autoCheckGlobals    : false,
        alsoPreload         : [ 'some_additional_preload.js' ]
    }, function (t) {
        ...
    }) 
         * 
         * Values from this object takes the highest priority and will override any other configuration.
         * 
         * Test descriptor may contain special property - `config` which will be applied to the test instance created. Be careful not to overwrite
         * standard properties and methods!
         * 

    Harness.start(
        {
            url         : 'ondemand/4-0-6-compat.t.js',
            config      : {
                myProperty1     : 'value1',
                myProperty2     : 'value2'
            }
        },
        ...
    )
    
    StartTest(function (t) {
        if (t.myProperty1 == 'value1') {
            // do this
        }
        ...
    }) 

         * 
         * @param {Array/Mixed} descriptor1 or an array of descriptors
         * @param {Mixed} descriptor2
         * @param {Mixed} descriptorN
         */
        start : function () {
            // a bit hackish - used by Selenium reporter..
            var me      = Siesta.my.activeHarness = this
            var args    = Array.prototype.concat.apply([], arguments)
            
            this.setup(function () {
                me.normalizeDescriptors(args)
                
                me.launch(me.descriptors)
            })
        },
        
        
        // good to have this as a seprate method for testing
        normalizeDescriptors : function (descArray) {
            var me              = this
            
            var descriptors     = []
            
            Joose.A.each(descArray, function (desc, index) {
                if (desc) descriptors.push(me.normalizeDescriptor(desc, me, index))
            })
            
            me.descriptors      = descriptors
        },

        
        launch : function (descriptors, callback, errback) {
            var launchId                = this.currentLaunchId  = this.launchCounter++
            var me                      = this
            
            //console.time('launch')
            //console.time('launch-till-preload')
            //console.time('launch-after-preload')
            
            this.needToStop             = false
            
            // no folders, only leafs
            var flattenDescriptors      = this.flattenDescriptors(descriptors)
            // the preset for the test scripts files 
            var testScriptsPreset       = new Siesta.Content.Preset()
            var presets                 = [ testScriptsPreset, this.mainPreset ]
            
            Joose.A.each(flattenDescriptors, function (desc) { 
                if (desc.preset != me.mainPreset && desc.preset != me.emptyPreset) presets.push(desc.preset)
                
                if (!desc.testCode) testScriptsPreset.addResource(desc.url)
                
                me.deleteTestByURL(desc.url)
            })
            
            // cache either everything (this.cachePreload) or only the test files (to be able to show missing files / show content) 
            var contentManager  = new this.contentManagerClass({
                harness         : this,
                presets         : [ testScriptsPreset ].concat(this.cachePreload ? presets : [])
            })
            
            var options         = this.launches[ launchId ] = {
                increaseTimeout     : this.runCore == 'parallel' && flattenDescriptors.length > this.increaseTimeoutThreshold,
                launchId            : launchId,
                descriptors         : flattenDescriptors.slice(),
                descriptorsLeft     : null,
                contentManager      : contentManager
            }
            
            //console.time('caching')
            
            me.onTestSuiteStart(descriptors, contentManager)
            
            contentManager.cache(function () {
                
                //console.timeEnd('caching')
                
                Joose.A.each(flattenDescriptors, function (desc) {
                    var url             = desc.url
                    
                    if (contentManager.hasContentOf(url)) {
                        var testConfig  = desc.testConfig = Siesta.getConfigForTestScript(contentManager.getContentOf(url))
                        
                        // if testConfig contains the "preload" or "alsoPreload" key - then we need to update the preset of the descriptor
                        if (testConfig && (testConfig.preload || testConfig.alsoPreload)) desc.preset = me.getDescriptorPreset(desc)
                    } else
                        // if test code is provided, then test is considered not missing 
                        // allow subclasses to define there own logic when found missing test file
                        if (!desc.testCode) me.markMissingFile(desc)
                        
                    me.normalizeScopeProvider(desc)
                })
                
                me.fireEvent('testsuitelaunch', descriptors, contentManager)
                
                me.runCoreGeneral(flattenDescriptors, contentManager, options, options.callback = function () {
                    me.onTestSuiteEnd(descriptors, contentManager)
                    
                    callback && callback(descriptors)
                    
                    delete me.launches[ launchId ]
                })
                
            }, function () {}, true)
        },
        
        
        markMissingFile : function (desc) {
            desc.isMissing = true
        },
        
        
        flattenDescriptors : function (descriptors, includeFolders) {
            var flatten     = []
            var me          = this
            
            Joose.A.each(descriptors, function (descriptor) {
                
                if (descriptor.group) {
                    
                    if (includeFolders) flatten.push(descriptor)
                    
                    flatten.push.apply(flatten, me.flattenDescriptors(descriptor.items, includeFolders))
                    
                } else
                    flatten.push(descriptor)
            })
            
            return flatten
        },
        
        
        lookUpValueInDescriptorTree : function (descriptor, configName, doNotLookAtRoot) {
            var testConfig  = descriptor.testConfig
            
            if (testConfig && testConfig.hasOwnProperty(configName))    return testConfig[ configName ]
            if (descriptor.hasOwnProperty(configName))                  return descriptor[ configName ]
            
            var parent  = descriptor.parent
            
            if (parent) {
                if (parent == this)
                    if (doNotLookAtRoot) 
                        return undefined
                    else
                        return this[ configName ]
                
                return this.lookUpValueInDescriptorTree(parent, configName, doNotLookAtRoot)
            }
            
            return undefined
        },
        

        getDescriptorConfig : function (descriptor, configName, doNotLookAtRoot) {
            return this.lookUpValueInDescriptorTree(descriptor, configName, doNotLookAtRoot)
        },
        
        
        getDescriptorPreset : function (desc) {
            var preload                 = this.getDescriptorConfig(desc, 'preload', true)
            var alsoPreload             = this.getDescriptorConfig(desc, 'alsoPreload', true)
            
            if (preload || alsoPreload) {
                var totalPreload        = (preload || this.preload).concat(alsoPreload || [])
                
                // filter out empty array as preloads - return `emptyPreset` for them
                return totalPreload.length ? new Siesta.Content.Preset({ preload : this.processPreloadArray(totalPreload) }) : this.emptyPreset
            }
                
            return this.mainPreset
        },
        
        
        normalizeScopeProvider : function (desc) {
            var scopeProvider = this.getDescriptorConfig(desc, 'scopeProvider')
            
            if (scopeProvider) {
                var match 
                
                if (match = /^=(.+)/.exec(scopeProvider))
                    scopeProvider = match[ 1 ]
                else 
                    scopeProvider = scopeProvider.replace(/^(Scope\.Provider\.)?/, 'Scope.Provider.')
            }
            
            desc.scopeProvider          = scopeProvider
            desc.scopeProviderConfig    = this.getDescriptorConfig(desc, 'scopeProviderConfig') 
        },
        
        
        normalizeDescriptor : function (desc, parent, index, level) {
            if (typeof desc == 'string') desc = { url : desc }
            
            level       = level || 0
            
            var me      = this
            
            desc.parent = parent
            
            // folder
            if (desc.group) {
                desc.id     = parent == this ? 'testFolder-' + level + '-' + index : parent.id + '/' + level + '-' + index
                
                var items   = []
                
                Joose.A.each(desc.items || [], function (subDesc, index) {
                    if (subDesc) items.push(me.normalizeDescriptor(subDesc, desc, index, level + 1))
                })
                
                desc.items  = items
                
            } else {
                // leaf case
                desc.id                     = desc.url
                desc.preset                 = this.getDescriptorPreset(desc)
                
                // the only thing left to normalize in the descriptor is now "scopeProvider"
                // we postpone this normalization to the moment after loading of the test files, 
                // since they can also contain "scopeProvider"-related configs
                // see "normalizeScopeProvider"
            }
            
            this.descriptorsById[ desc.id ] = desc
            
            return desc
        },
        
        
        runCoreGeneral : function (descriptors, contentManager, launchOptions, callback) {
            var runCoreMethod   = 'runCore' + Joose.S.uppercaseFirst(this.runCore)
            
            if (typeof this[ runCoreMethod ] != 'function') throw new Error("Invalid `runCore` specified: [" + this.runCore + "]")
            
            this[ runCoreMethod ](descriptors, contentManager, launchOptions, callback)
        },
        
        
        runCoreParallel : function (descriptors, contentManager, launchOptions, callback) {
            var me              = this
            var processedNum    = 0
            var count           = descriptors.length
            
            if (!count) callback()
            
            var exitLoop                = false
            var hasExited               = false
            var hasLaunchedAllThreads   = false
            
            var doProcessURL  = function (desc) {
                me.processURL(desc, desc.index, contentManager, launchOptions, function () {
                    processedNum++
                    
                    // set the internal closure `exitLoop` to stop launching new branches
                    // on the 1st encountering of `me.needToStop` flag
                    if (me.needToStop || exitLoop) {
                        exitLoop = true
                        
                        if (!hasExited) {
                            hasExited = true
                            callback()
                        }
                        
                        return
                    }
                    
                    if (processedNum == count) 
                        callback()
                    else
                        launchThread(descriptors)
                })
            }
            
            var launchThread  = function (descriptors) {
                var desc = descriptors.shift()
                
                if (!desc) return
                
                if (hasLaunchedAllThreads)
                    setTimeout(function () {
                        doProcessURL(desc)
                    }, me.pauseBetweenTests)
                else
                    doProcessURL(desc)
            }
            
            for (var i = 1; i <= this.maxThreads; i++) launchThread(descriptors)
            
            hasLaunchedAllThreads = true
        },
        
        
        runCoreSequential : function (descriptors, contentManager, launchOptions, callback) {
            if (!launchOptions.descriptorsLeft) launchOptions.descriptorsLeft = descriptors
            
            if (descriptors.length && !this.needToStop) {
                var desc        = descriptors.shift()
                var me          = this
                var prevLength  = descriptors.length
                
                this.processURL(desc, desc.index, contentManager, launchOptions, function () {

                    // if the length of the `descriptors` array has changed - that means that test suite has been restarted
                    // (because of 3 mins inactivity) - should not try to continue in this case
                    if (descriptors.length && descriptors.length == prevLength)
                        setTimeout(function () {
                            me.runCoreSequential(descriptors, contentManager, launchOptions, callback)
                        }, me.pauseBetweenTests)
                    else
                        callback()
                })
                
            } else
                callback()
        },
        
        
        getSeedingCode : function (desc, launchId) {
            var code    = function (descId, launchId) {
                StartTest = startTest = describe = function () { arguments.callee.args = arguments };
                
                StartTest.launchId          = launchId
                StartTest.id                = descId
                
                // for older IE - the try/catch should be from the same context as the exception
                StartTest.exceptionCatcher  = function (func) { var ex; try { func() } catch (e) { ex = e; }; return ex; };
                
                // for Error instances we try to pick up the values from "message" or "description" property
                // so need to have a correct constructor from the context of test
                StartTest.testErrorClass    = Error;
            }
            
            return ';(' + code.toString() + ')(' + JSON.stringify(desc.id) + ', ' + launchId + ')'
        },
        
        
        getScopeProviderConfigFor : function (desc, launchId) {
            var config          = Joose.O.copy(desc.scopeProviderConfig || {})
            
            config.seedingCode  = this.getSeedingCode(desc, launchId)
            
            return config
        },
        
        
        keepTestResult : function (url) {
            // already keeping 
            if (this.lastResultsByURL[ url ]) {
                var indexOf     = -1
                
                Joose.A.each(this.lastResultsURLs, function (resultUrl, i) { 
                    if (resultUrl == url) { indexOf = i; return false }
                })
                
                this.lastResultsURLs.splice(indexOf, 1)
                this.lastResultsURLs.push(url)
                
                return
            }
            
            this.lastResultsURLs.push(url)
            this.lastResultsByURL[ url ] = true
            
            if (this.lastResultsURLs.length > this.keepNLastResults) this.releaseTestResult()
        },
        
        
        releaseTestResult : function () {
            if (this.lastResultsURLs.length <= this.keepNLastResults) return
            
            var url     = this.lastResultsURLs.shift()
            
            delete this.lastResultsByURL[ url ]
            
            var test    = this.getTestByURL(url)
            
            if (test && test.isFinished()) this.cleanupScopeForURL(url)
        },
        
        
        isKeepingResultForURL : function (url) {
            return this.lastResultsByURL[ url ]
        },
        
        
        setupScope : function (desc, launchId) {
            var url                 = desc.url
            var scopeProviderClass  = eval(desc.scopeProvider)
            
            this.cleanupScopeForURL(url)
            
            this.keepTestResult(url)
            
            return this.scopesByURL[ url ] = new scopeProviderClass(this.getScopeProviderConfigFor(desc, launchId))
        },
        
        
        cleanupScopeForURL : function (url) {
            var scopeProvider = this.scopesByURL[ url ]
            
            if (scopeProvider) {
                delete this.scopesByURL[ url ]
                
                scopeProvider.cleanup()
            }
        },


        // should prepare the "seedingScript" - include it to the `scopeProvider`
        prepareScopeSeeding : function (scopeProvider, desc, contentManager) {
            if (desc.testCode || this.cachePreload && contentManager.hasContentOf(desc.url))
                scopeProvider.addPreload({
                    type        : 'js', 
                    content     : desc.testCode || (contentManager.getContentOf(desc.url) + '\n//# sourceURL=' + desc.url)
                })
            else
                scopeProvider.seedingScript = this.resolveURL(desc.url, scopeProvider, desc)
        },

        
        // should normalize non-standard urls (like specifying Class.Name in preload)
        // such behavior is not documented and generally deprecated
        normalizeURL : function (url) {
            return url
        },
            
            
        resolveURL : function (url, scopeProvider, desc) {
            return url
        },
        
        
        canUseCachedContent : function (resource) {
            return this.cachePreload && resource instanceof Siesta.Content.Resource.JavaScript
        },
        
        
        addCachedResourceToPreloads : function (scopeProvider, contentManager, resource) {
            scopeProvider.addPreload({
                type        : 'js',
                content     : contentManager.getContentOf(resource)
            })
        },
        
        
        processURL : function (desc, index, contentManager, launchOptions, callback, noCleanup) {
            var me      = this
            var url     = desc.url
            
            if (desc.isMissing) {
                callback()
                
                return
            }
            
            // a magical shared object, which will contain the `test` property with test instance, once the test will be created
            var testHolder      = {}
            // an array of errors occured during preload phase
            var preloadErrors   = []    
            
            var scopeProvider   = this.setupScope(desc, launchOptions.launchId)
            var transparentEx   = this.getDescriptorConfig(desc, 'transparentEx')
            
            var onErrorHandler  = function (msg, url, lineNumber, col, error) {
                var test = testHolder.test

                if (test && test.isStarted()) {
                    test.nbrExceptions++;
                    test.failWithException(error || (msg + ' ' + url + ' ' + lineNumber))
                } else {
                    preloadErrors.push(error && error.stack ? error.stack + '' : msg + ' ' + url + ' ' + lineNumber)
                }
            }
            
            // trying to setup the `onerror` handler as early as possible - to detect each and every exception from the test
            scopeProvider.addOnErrorHandler(onErrorHandler, !transparentEx)
            
//            scopeProvider.addPreload({
//                type        : 'js', 
//                content     : 'console.time("scope-onload")'
//            })
            
            desc.preset.eachResource(function (resource) {
                var hasConent       = contentManager.hasContentOf(resource)
                
                if (hasConent && me.canUseCachedContent(resource)) {
                    me.addCachedResourceToPreloads(scopeProvider, contentManager, resource)
                } else {
                    var resourceDesc    = resource.asDescriptor()
                    
                    if (resourceDesc.url) resourceDesc.url = me.resolveURL(resourceDesc.url, scopeProvider, desc)
                    
                    scopeProvider.addPreload(resourceDesc)
                }
            })

            
            me.prepareScopeSeeding(scopeProvider, desc, contentManager)
            
            var testClass       = me.getDescriptorConfig(desc, 'testClass')
            if (me.typeOf(testClass) == 'String') testClass = Joose.S.strToClass(testClass)
            
            var testConfig      = me.getNewTestConfiguration(desc, scopeProvider, contentManager, launchOptions)
            
            // create the test instance early, so that one can perform some setup (as the test class method call)
            // even before the "hostPageUrl" starts loading
            var test            = testHolder.test = new testClass(testConfig)
            
            this.onBeforeScopePreload(scopeProvider, url, test)
            
            test.earlySetup(function () {
                cont()
            }, function (errorMessage) {
                cont(errorMessage)
            })
            
            function cont(errorMessage) {
                //console.timeEnd('launch-till-preload')
                
                //console.time('preload')
                
    //            scopeProvider.addPreload({
    //                type        : 'js', 
    //                content     : 'console.timeEnd("scope-onload")'
    //            })
                
                scopeProvider.setup(function () {
                    me.onAfterScopePreload(scopeProvider, url, test)
                    
                    // scope provider has been cleaned up while setting up? (may be user has restarted the test)
                    // then do nothing
                    if (!scopeProvider.scope) { callback(); return }
                    
                    me.launchTest({
                        testHolder          : testHolder,
                        desc                : desc,
                        scopeProvider       : scopeProvider,
                        contentManager      : contentManager,
                        launchOptions       : launchOptions,
                        preloadErrors       : errorMessage || preloadErrors,
                        onErrorHandler      : onErrorHandler,
                        
                        // need to provide the "startTestAnchor" explicitly (and not just get from "scope" inside of the "launchTest"
                        // method, because for "separateContext" method, startAnchor is calculated differently
                        startTestAnchor     : scopeProvider.scope.StartTest,
                        noCleanup           : noCleanup,
                        reusingSandbox      : false
                    }, callback)
                })
            }
        },
        
        
        launchTest : function (options, callback) {
            var scopeProvider   = options.scopeProvider
            var desc            = options.desc
//            desc, scopeProvider, contentManager, options, preloadErrors, onErrorHandler, callback
            
            //console.timeEnd('preload')
            //console.timeEnd('launch-after-preload')
            var me              = this
            var url             = desc.url
        
            // after the scope setup, the `onerror` handler might be cleared - installing it again
            scopeProvider.addOnErrorHandler(options.onErrorHandler, !this.getDescriptorConfig(desc, 'transparentEx'))
            
            var test            = options.testHolder.test
            var startTestAnchor = options.startTestAnchor
            var args            = startTestAnchor && startTestAnchor.args
            var global          = scopeProvider.scope
            var noCleanup       = options.noCleanup
            
            // additional setup of the test instance, setting up the properties, which are known only after scope
            // is loaded
            Joose.O.extend(test, {
                startTestAnchor     : startTestAnchor,
                exceptionCatcher    : startTestAnchor.exceptionCatcher,
                testErrorClass      : startTestAnchor.testErrorClass,
                
                global              : global,
                
                // the "options" part is used by the "separateContext" branch, where
                // the test script is executed in different context from the "global" context
                originalSetTimeout  : options.originalSetTimeout || global.setTimeout,
                originalClearTimeout: options.originalClearTimeout || global.clearTimeout,
                
                // pick either 1st or 2nd argument depending which one is a function 
                run                 : args && (typeof args[ 0 ] == 'function' ? args[ 0 ] : args[ 1 ]),
                
                reusingSandbox      : options.reusingSandbox,
                
                // "main" test callback, called once test is completed
                callback : function () {
                    if (!noCleanup && !me.isKeepingResultForURL(url)) me.cleanupScopeForURL(url)
                    
                    callback && callback()
                }
            })
            
            this.saveTestWithURL(url, test)
            
            var doLaunch        = function() {
                //console.timeEnd('launch')
                
                me.fireEvent('beforeteststart', test)
                
                // in the edge case, test can be already finished before its even started :)
                // this happens if user re-launch the test during these 10ms - test will be 
                // finalized forcefully in the "deleteTestByUrl" method
                if (!test.isFinished()) test.start(options.preloadErrors[ 0 ])
                
                options         = null
                test            = null
            }
            
            if (options.reusingSandbox)
                doLaunch()
            else {
                if (scopeProvider instanceof Scope.Provider.IFrame) 
                    // start the test after slight delay - to run it already *after* onload (in browsers)
                    global.setTimeout(doLaunch, 10)
                else
                    // for Window provider, `global.setTimeout` seems to not execute passed function _sometimes_
                    // also increase the "onload" delay
                    setTimeout(doLaunch, 50)
            }
        },
        
        
        getNewTestConfiguration : function (desc, scopeProvider, contentManager, launchOptions) {
            var groups          = []
            var currentDesc     = desc.parent
            
            while (currentDesc) {
                // do not push name of the top-level "hidden" group which has no parent
                currentDesc.parent && groups.unshift(String(currentDesc.group))
                
                currentDesc     = currentDesc.parent
            }
            
            var config          = {
                url                 : desc.url,
                name                : desc.name,
                
                groups              : groups,
                jUnitClass          : this.getDescriptorConfig(desc, 'jUnitClass'),
            
                harness             : this,
            
                expectedGlobals     : this.cleanScopeGlobals.concat(this.getDescriptorConfig(desc, 'expectedGlobals')),
                autoCheckGlobals    : this.getDescriptorConfig(desc, 'autoCheckGlobals'),
                disableGlobalsCheck : this.disableGlobalsCheck,
            
                scopeProvider       : scopeProvider,
                
                contentManager      : contentManager,
                
                transparentEx       : this.getDescriptorConfig(desc, 'transparentEx'),
                needDone            : this.getDescriptorConfig(desc, 'needDone'),
                
                overrideSetTimeout          : this.getDescriptorConfig(desc, 'overrideSetTimeout'),
                
                defaultTimeout              : this.getDescriptorConfig(desc, 'defaultTimeout') * (launchOptions.increaseTimeout ? 2 : 1),
                subTestTimeout              : this.getDescriptorConfig(desc, 'subTestTimeout') * (launchOptions.increaseTimeout ? 2 : 1),
                waitForTimeout              : this.getDescriptorConfig(desc, 'waitForTimeout') * (launchOptions.increaseTimeout ? 3 : 1),
                isReadyTimeout              : this.getDescriptorConfig(desc, 'isReadyTimeout'),
                
                sourceLineForAllAssertions  : this.sourceLineForAllAssertions,
                
                sandboxCleanup              : this.getDescriptorConfig(desc, 'sandboxCleanup'),
                
                config                      : this.getDescriptorConfig(desc, 'config'),
                
                failOnExclusiveSpecsWhenAutomated   : this.getDescriptorConfig(desc, 'failOnExclusiveSpecsWhenAutomated')
            }
            
            // potentially not safe
            if (desc.testConfig || desc.config) Joose.O.extend(config, desc.testConfig || desc.config)
            
            return config
        },
        
        
        getScriptDescriptor : function (id) {
            return this.descriptorsById[ id ]
        },
        
        
        getTestByURL : function (url) {
            return this.testsByURL[ url ]
        },
        
        
        saveTestWithURL : function (url, test) {
            this.testsByURL[ url ] = test
        },
        
        
        deleteTestByURL : function (url) {
            var test    = this.testsByURL[ url ]
            
            if (test) {
                // exceptions can arise if test page has switched to different context for example (click on the link)
                // and siesta is trying to clear the timeouts with "clearTimeout"
                try {
                    test.finalize(true)
                } catch (e) {
                }
                this.cleanupScopeForURL(url)
            }
            
            delete this.testsByURL[ url ]
        },
        
        
        allPassed : function () {
            var allPassed       = true
            var me              = this
            
            Joose.A.each(this.flattenDescriptors(this.descriptors), function (descriptor) {
                // if at least one test is missing then something is wrong
                if (descriptor.isMissing) { allPassed = false; return false }
                
                var test    = me.getTestByURL(descriptor.url)
                
                // ignore missing tests (could be skipped by test filtering)
                if (!test) return
                
                allPassed = allPassed && test.isPassed()
            })
            
            return allPassed
        },
        
        
        generateReport : function (options) {
            if (!arguments.length) options = __REPORT_OPTIONS__
            
            // a string? 
            if (Object(options) !== options) options = { format : options || 'JSON' }
            
            var methodName  = 'generate' + options.format + 'Report'
            
            if (!this[ methodName ]) throw "Can't generate report - missing the `" + methodName + "` method"
            
            return this[ methodName ](options)
        }
    }
    // eof methods
})
//eof Siesta.Harness
