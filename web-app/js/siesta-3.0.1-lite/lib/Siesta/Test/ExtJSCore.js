/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Test.ExtJSCore

A base mixin for testing ExtJS and SenchaTouch applications. 

Contains testing functionality that is common for both frameworks.

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

*/
Role('Siesta.Test.ExtJSCore', {
    
    has : {
        waitForExtReady         : true,
        waitForAppReady         : false,
        
        loaderPath              : null,
        requires                : null,
        
        simulateEventsWith      : {
            is      : 'rw',
            lazy    : function () {
                var isIE9           = navigator.userAgent.match(/MSIE 9.0;/)
                var Ext             = this.getExt()

                // no Ext or Ext3 should use standard "dispatchEvent" method
                if (!Ext || !Ext.getVersion) return 'dispatchEvent'
                
                var extVersion      = Ext.getVersion('extjs')
                
                // the "Ext.getVersion('extjs')" is just "true" in Ext3? (when testing SA)
                var isBelowExt421   = Boolean((extVersion && extVersion.isLessThan && extVersion.isLessThan('4.2.1.883')))
                
                var div             = document.createElement('div')
                
                return div.attachEvent && (isIE9 || isBelowExt421) ? 'fireEvent' : 'dispatchEvent'
            }
        },
        
        eventMap                : {
            is              : 'rw',
            lazy            : function () {
                var Ext             = this.getExt()
                
                if (!Ext || !Ext.dom || !Ext.dom.Element || !Ext.dom.Element.prototype.eventMap) return null
                
                // need to create copy! to not store the value from another context on a test instance
                return Joose.O.copy(Ext.dom.Element.prototype.eventMap)
            }
        },
        
        isExtOnReadyDone        : false,
        onReadyWaitingStarted   : false,
        isAppReadyDone          : false,
        
        requiringWaitingStarted : false,
        isRequiringDone         : false
    },

    override : {
        
        // only called for the re-used contexts
        cleanupContextBeforeStartDom : function () {
            var Ext         = this.getExt()
            
            if (!Ext) return this.SUPER()
            
            var me          = this
            
            // if component query presents - trying to unregister the components
            if (Ext.ComponentQuery) {
                var keep        = {}
                var msgBox      = Ext.MessageBox
                
                if (msgBox) {
                    keep[ msgBox.id ] = true
                }
                
                // retrieve the top-level components
                var comps       = Ext.ComponentQuery.query('{ownerCt == null}')
                
                // sort, so that containers goes first
                // the logic is, that containers have "more logic" and may affect components
                // use case - grid editing is active and the editor field is destroyed before the grid - 
                // that throws exception in gantt code
                
                comps.sort(function (a, b) {
                    a   = (a instanceof Ext.Container) ? 0 : 1
                    b   = (b instanceof Ext.Container) ? 0 : 1
                    
                    return a - b
                })
                
                Joose.A.each(comps, function (comp) {
                    if (!keep[ comp.id ] && !comp.isDestroyed) comp.destroy()
                })
            }
            
            // if there's a class manager - unregister "unexpected" classes
            if (Ext.ClassManager && Ext.undefine) {
                var index       = {}
                
                Joose.O.each(Ext.ClassManager.classes, function (cls, name) {
                    var global      = name.split('.')[ 0 ]
                    
                    if (!me.isGlobalExpected(global, index)) Ext.undefine(name)
                })
            }
            
            // if there's a store manager - also unregister stores (all stores except internal ext js store(s))
            if (Ext.data && Ext.data.StoreManager) {
                var toRemove = [];

                Ext.data.StoreManager.each(function(store) {
                    if (store.storeId !== "ext-empty-store") toRemove.push(store);
                });

                Ext.data.StoreManager.unregister.apply(Ext.data.StoreManager, toRemove);
            }
        },
        
        
        processMouseEventName : function (eventName) {
            var eventMap        = this.getEventMap()
            
            return eventMap && eventMap[ eventName ] || eventName; 
        },
        
        
        processSubTestConfig : function () {
            var res                 = this.SUPERARG(arguments)
            
            // sub tests should not wait for Ext.onReady or for application launch
            res.waitForAppReady     = false
            res.waitForExtReady     = false 
            
            return res
        },
        
        
        isReady : function() {
            var result      = this.SUPERARG(arguments);

            if (!result.ready) return result;
            
            var me          = this
            var Ext         = this.getExt();
            var R           = Siesta.Resource('Siesta.Test.ExtJSCore');

            var requires    = this.requires
            
            if (requires && !this.requiringWaitingStarted && Ext && Ext.require) {
                this.requiringWaitingStarted    = true
                
                Ext.require(requires, function () {
                    me.isRequiringDone      = true
                })
            }
            
            if (this.waitForExtReady && !this.onReadyWaitingStarted && Ext && Ext.onReady) {
                this.onReadyWaitingStarted  = true
                
                Ext.onReady(function () {
                    me.isExtOnReadyDone     = true
                })
            }
            
            if (requires && !this.isRequiringDone) return {
                ready       : false,
                reason      : R.get('waitedForRequires')
            }

            if (this.waitForExtReady && !this.isExtOnReadyDone) return {
                ready       : false,
                reason      : R.get('waitedForExt')
            }
            
            if (this.waitForAppReady && !this.isAppReadyDone) return {
                ready       : false,
                reason      : R.get('waitedForApp')
            }
            
            return {
                ready       : true
            }
        },

        // Overridden to deal with the different event firing mechanisms in Ext JS 3 vs 4
        // This code is required because in IE events are simulated using fireEvent instead of dispatchEvent and it seems fireEvent will
        // will not update a checkbox 'checked' state properly so we're forcing the toggle to solve this situation. 
        // This issue is only relevant in IE + Ext. 
        //
        // Test case: 507_form_checkbox.t.js
        simulateMouseClick: function (clickInfo, callback, scope, options) {
            var el      = clickInfo.el
            var Ext     = this.getExt()
            
            var isExt5  = Ext && Ext.getVersion && Ext.getVersion('extjs') && Ext.getVersion('extjs').major == 5
            
            // Force check toggle for input checkboxes
            if (
                (this.getSimulateEventsWith() === 'fireEvent' || isExt5) 
                    && 
                (el.type === 'checkbox' || el.type === 'radio') && !el.disabled && !el.readOnly
            ) {
                var oldState = el.checked;
                
                if (callback) {
                    this.SUPER(clickInfo, function () {
                        if (el.checked === oldState) {
                            el.checked = !oldState;
                        }
                        callback.call(scope || this);
                    });
                } else {
                    this.SUPERARG(arguments);

                    if (el.checked === oldState) {
                        el.checked = !oldState;
                    }
                }
            } else {
                this.SUPERARG(arguments);
            }
        }
    },

    methods : {
        
        initialize : function() {
            // Since this test is preloading Ext JS, we should let Siesta know what to 'expect'
            this.expectGlobals('Ext', 'id');
            this.SUPER();
        },

        
        start : function (alreadyFailedWithException) {
            var me      = this;
            var Ext     = this.getExt();
            
            if (!Ext) {
                // proceed to parent implementation disabling our "can start" checkers 
                this.waitForAppReady    = false
                this.waitForExtReady    = false
                this.requires           = null
                
                this.SUPERARG(arguments)
                
                return
            }

            // install a "loader path hook" 
            this.harness.generateLoaderPathHook()(this.global.StartTest, Ext, this.loaderPath)
            
            // the actual waiting for Ext.onReady will happen inside of `isReady` method
            // this is because in microloaded touch apps, Ext.onReady may appear with some arbitrary delay

            
            // this flag will explain to Ext, that DOM ready event has already happened
            // Ext fails to set this flag if it was loaded dynamically, already after DOM ready
            // the test will start only after DOM ready anyway, so we just set this flag  
            Ext.isReady         = true

            var canWaitForApp   = Ext.ClassManager && Boolean(Ext.ClassManager.get('Ext.app.Application'))
            
            if (!canWaitForApp) this.waitForAppReady = false
                
            if (this.waitForAppReady && canWaitForApp)
                Ext.util.Observable.observe(Ext.app.Application, {
                    launch      : function () {
                        me.isAppReadyDone   = true
                    },
                    
                    single      : true,
                    delay       : 100
                })
            
            this.SUPERARG(arguments)
        },

        /**
         * This method returns the `Ext` object from the scope of the test. When creating your own assertions for Ext JS code, you need
         * to make sure you are using this method to get the `Ext` instance. Otherwise, you'll be using the same "top-level" `Ext`
         * instance, used by the harness for its UI. 
         * 
         * For example:
         * 
         *      elementHasProvidedCssClass : function (el, cls, desc) {
         *          var Ext     = this.getExt();
         *          
         *          if (Ext.fly(el).hasCls(cls)) {
         *              this.pass(desc);
         *          } else {
         *              this.fail(desc);
         *          }
         *      }
         *   
         * @return {Object} The `Ext` object from the scope of test
         */
        getExt : function () {
            return this.global.Ext
        },
        
        
        /**
         * The alias for {@link #getExt}
         * @method
         */
        Ext : function () {
            return this.global.Ext
        },
        
        
        isExtJSComponent : function (obj) {
            var Ext     = this.getExt()
            
            return Boolean(Ext && Ext.Component && obj instanceof Ext.Component)
        },
        
        // Accepts Ext.Component or ComponentQuery
        normalizeComponent : function(component, allowEmpty, options) {
            options         = options || {}
            var Ext         = this.Ext()
            
            var matchingMultiple    = false

            if (this.typeOf(component) === 'String') {
                // strip out leading >>  which is used as indicator of the ComponentQuery in ActionTarget string
                component   = this.trimString(component.replace(/^(\s*>>)?/, ''))
                
                var result  = Ext.ComponentQuery.query(component);
                var R       = Siesta.Resource('Siesta.Test.ExtJSCore');

                if (!allowEmpty && result.length < 1)   this.warn(R.get('noComponentMatch').replace('{component}', component));
                
                if (options.ignoreNonVisible) {
                    var onlyVisible = []
                    
                    // Sencha Touch components have no "isVisible()" method
                    Joose.A.each(result, function (cmp) { 
                        if (cmp.isVisible ? cmp.isVisible() : !cmp.isHidden()) onlyVisible.push(cmp) 
                    });
                    
                    result          = onlyVisible
                }
                
                if (result.length > 1)   {
                    matchingMultiple    = true
                    
                    var text        = R.get('multipleComponentMatch').replace('{component}', component);

                    if (this.harness.failOnMultipleComponentMatches) {
                        this.fail(text);
                    } else {
                        this.warn(text);
                    }
                }
                
                component = result[ 0 ];
            }
            
            return options.detailed ? { comp : component, matchingMultiple : matchingMultiple } : component
        },

        /**
         * @private
         * @param {Ext.Component} comp the Ext.Component
         * @param {Boolean} locateInputEl For form fields, try to find the inner input element by default.
         *                  If you want to target the containing Component element, pass false instead.
         * @return {*}
         */
        compToEl : function (comp, locateInputEl) {
            var Ext = this.Ext();

            if (!comp) return null

            locateInputEl = locateInputEl !== false;

            // Ext JS
            if (Ext && Ext.form && Ext.form.Field && locateInputEl) {
                if (comp instanceof Ext.form.Field && comp.inputEl) {
                    return comp.inputEl.dom || comp.inputEl;
                }

                if (Ext.form.HtmlEditor && comp instanceof Ext.form.HtmlEditor) {
                    //     Ext JS 3       Ext JS 4
                    return comp.iframe || comp.inputEl;
                }
            }

            // Sencha Touch: Form fields can have a child input component
            if (Ext && Ext.field && Ext.field.Field && comp instanceof Ext.field.Field && locateInputEl) {
                comp = comp.getComponent();
            }

            //     Ext JS                             vs Sencha Touch
            return comp.getEl ? comp.getEl() : comp.el || comp.element;
        },

        // Accept Ext.Element and Ext.Component
        // If the 'shallow' flag is true we should not 'reevaluate' the target element - stop at the component element.
        normalizeElement : function(el, allowMissing, shallow, detailed, options) {
            if (!el)         return null

            if (el.nodeName) return el;

            var matchingMultiple = false
            var query   
            var Ext     = this.getExt();
            var origEl  = el;
            var scopeAdjusted;
            
            var stopAtComponentLevel        = options && options.stopAtComponentLevel
            var ignoreNonVisible            = options && options.hasOwnProperty('ignoreNonVisible') ? options.ignoreNonVisible : true

            if (typeof el === 'string') {
                var mainParts  = el.split('->');

                if (mainParts.length === 2) {
                    scopeAdjusted = this.adjustScope(el);

                    el = this.trimString(mainParts[ 1 ]);

                    // Frame might not yet exist, or be ready
                    if (!scopeAdjusted ||
                        ((el.match(/^\s*>>/) || el.match(/=>/)) && !this.Ext())) {
                        this.resetScope();
                        return null;
                    }
                }

                if (el.match(/=>/)) {
                    // Composite query
                    query               = this.compositeQuery(el, null, allowMissing, ignoreNonVisible)
                    el                  = query[ 0 ]
                    matchingMultiple    = query.length > 1
                } else if (el.match(/^\s*>>/)) {
                    var compRes         = this.normalizeComponent(el, allowMissing, { ignoreNonVisible : ignoreNonVisible, detailed : true })
                    
                    el                  = compRes.comp
                    matchingMultiple    = compRes.matchingMultiple
                } else {
                    // string in unknown format, guessing it's a DOM query
                    var retVal          = this.SUPER(el, allowMissing, shallow, detailed);

                    if (scopeAdjusted) this.resetScope();

                    return retVal;
                }

                if (!allowMissing && !el) {
                    var R               = Siesta.Resource('Siesta.Test.ExtJSCore');
                    var warning         = R.get('noComponentFound') + ': ' + origEl;

                    this.warn(warning);
                    if (scopeAdjusted) this.resetScope();
                    throw warning;
                }
            }
            
            var rawResult       = false 

            if (this.isExtJSComponent(el))
                if (stopAtComponentLevel)
                    rawResult   = true
                else {
                    el              = this.compToEl(el);
    
                    if (!shallow && this.isElementVisible(el) && this.elementIsTop(el, true)) {
                        var center  = this.findCenter(el);
    
                        el          = this.elementFromPoint(center[0], center[1], false, el.dom);
                    }
                }

            // ExtJS Element
            if (el && el.dom)
                if (stopAtComponentLevel)
                    rawResult   = true
                else
                    el          = el.dom
            
            // will also handle the case of conversion of array with coordinates to el 
            var res             = rawResult ? el : this.SUPER(el, allowMissing, shallow);

            if (scopeAdjusted) this.resetScope();

            return detailed ? { el : res, matchingMultiple : matchingMultiple } : res
        },
        
        
        // this method generally has the same semantic as the "normalizeElement", it's being used in
        // Siesta.Test.Action.Role.HasTarget to determine what to pass to the next step
        //
        // on the browser level the only possibility is DOM element
        // but on ExtJS level user can also use ComponentQuery and next step need to receive the 
        // component instance
        normalizeActionTarget : function (el, allowMissing) {
            return this.normalizeElement(el, allowMissing, false, false, { stopAtComponentLevel : true });
        },

         /**
         * This method allow assertions to fail silently for tests executed in versions of Ext JS up to a certain release. When you try to run this test on a newer
         * version of Ext JS and it fails, it will fail properly and force you to re-investigate. If it passes in the newer version, you should remove the 
         * use of this method.
         * 
         * See also {@link Siesta.Test#todo}
         *   
         * @param {String} frameworkVersion The Ext JS framework version, e.g. '4.0.7'
         * @param {Function} fn The method covering the broken functionality
         * @param {String} reason The reason or explanation of the bug
        */
        knownBugIn : function(frameworkVersion, fn, reason) {
            var Ext     = this.getExt();
            var version = Ext.versions.extjs || Ext.versions.touch;
            var R       = Siesta.Resource('Siesta.Test.ExtJSCore');

            if (this.harness.failKnownBugIn || version.isGreaterThan(frameworkVersion)) {
                fn.call(this.global, this);
            } else {
                this.todo(R.get('knownBugIn') + ' ' + frameworkVersion + ': ' + (reason || ''), fn);
            }
        },
        
        
         /**
         * This method will load the specified classes with `Ext.require()` and call the provided callback. Additionally it will check that all classes have been loaded.
         * 
         * This method accepts either variable number of arguments:
         *
         *      t.requireOk('Some.Class1', 'Some.Class2', function () { ... })
         * or array of class names:
         * 
         *      t.requireOk([ 'Some.Class1', 'Some.Class2' ], function () { ... })
         * 
         * @param {String} className1 The name of the class to `require`
         * @param {String} className2 The name of the class to `require`
         * @param {String} classNameN The name of the class to `require`
         * @param {Function} fn The callback. Will be called even if the loading of some classes have failed.
        */
        requireOk : function () {
            var me                  = this
            var global              = this.global
            var Ext                 = this.getExt()
            var args                = Array.prototype.concat.apply([], arguments)
            var R                   = Siesta.Resource('Siesta.Test.ExtJSCore');

            var callback
            
            if (this.typeOf(args[ args.length - 1 ]) == 'Function') callback = args.pop()
            
            
            // what to do when loading completed or timed-out
            var continuation    = function () {
                me.endAsync(async)
                
                Joose.A.each(args, function (className) {
                    var cls     = Ext.ClassManager.get(className)
                    
                    //                       normal class                         singleton
                    if (cls && (me.typeOf(cls) == 'Function' || me.typeOf(cls.self) == 'Function'))
                        me.pass(R.get('Class') + ": " + className + " " + R.get('wasLoaded'))
                    else
                        me.fail(R.get('Class') + ": " + className + " " + R.get('wasNotLoaded'))
                })
                
                callback && me.processCallbackFromTest(callback)
            }
            
            var timeout         = Ext.isIE ? 120000 : 30000,
                async           = this.beginAsync(timeout + 100)
            
            var hasTimedOut             = false
            var originalSetTimeout      = this.originalSetTimeout
            var originalClearTimeout    = this.originalClearTimeout
            
            var timeoutId       = originalSetTimeout(function () {
                hasTimedOut     = true
                continuation()
            }, timeout)
            
            Ext.Loader.setConfig({ enabled : true });

            Ext.require(args, function () {
                originalClearTimeout(timeoutId)
                
                if (!hasTimedOut) continuation() 
            })
        },
        
        /**
         * This method is a simple wrapper around the {@link #chainClick} - it performs a component query for provided `selector` starting from the `root` container
         * and then clicks on all found components, in order:
         * 

    // click all buttons in the `panel`
    t.clickComponentQuery('button', panel, function () {})
    
         * 
         * The 2nd argument for this method can be omitted and method can be called with 2 arguments only. In this case a global component query will be performed:
         *

    // click all buttons in the application
    t.clickComponentQuery('button', function () {})
    
         * 
         * @param {String} selector The selector to perform a component query with
         * @param {Ext.Container} root The optional root container to start a query from.
         * @param {Function} callback The callback to call, after clicking all the found components
         */
        clickComponentQuery : function (selector, root, callback) {
            
            if (arguments.length == 2 && this.typeOf(arguments[ 1 ]) == 'Function') {
                callback    = root
                root        = this.Ext().ComponentQuery
            }
            
            if (arguments.length == 1) {
                root        = this.Ext().ComponentQuery
            }
            
            var result      = root.query(selector)
            
            this.chainClick(result, function () { callback && callback.call(this, result) })
        },
        
        
        /**
         * An alias for {@link #clickComponentQuery}.
         * 
         * @param {String} selector The selector to perform a component query with
         * @param {Ext.Container} root The optional root container to start a query from.
         * @param {Function} callback The callback to call, after clicking all the found components
         */
        clickCQ : function () {
            this.clickComponentQuery.apply(this, arguments)
        },

        /**
         * This method performs a combination of `Ext.ComponentQuery` and DOM query, allowing to easily find the DOM elements, 
         * matching a css selector, inside of some Ext.Component.
         * 
         * Both queries should be combined with the `=>` separator: 
         *      
         *      gridpanel[title=Accounts] => .x-grid-row
         *       
         * On the left side of such "composite" query should be a component query, on the right - DOM query (CSS selector)
         * 
         * In case when component query returns more than one component, this method iterate through all of them and will try to
         * resolve the 2nd part of the query. The results from the 1st component with matching DOM nodes is returned. 
         * 
         * E.g. the composite query `gridpanel[title=Accounts] => .x-grid-row` will give you the grid row elements inside a grid panel
         * with `title` config matching "Accounts". 
         * 
         * @param {String} selector The CompositeQuery selector
         * @param {Ext.Component} root The optional root component to start the component query from. If omitted, a global component query will be performed.
         * @param {Boolean} allowEmpty False to throw the exception from this method if no matching DOM element is found. Default is `true`.
         * 
         * @return {HTMLElement[]} The array of DOM elements 
         */
        compositeQuery : function (selector, root, allowEmpty, onlyVisibleComponents) {
            allowEmpty  = allowEmpty !== false
            
            var Ext     = this.Ext();
            var R       = Siesta.Resource('Siesta.Test.ExtJSCore');
            // Try to find magic => selector for nested ComponentQuery and CSS selector
            var mainParts  = selector.split('=>');
            var result, i, cmp;

            root        = root || Ext.ComponentQuery;

            // Root might not exist, Ext could be loaded in bootstrap mode without CQ
            if (!root) return [];

            if (mainParts.length < 2) throw R.get('invalidCompositeQuery') + ': ' + selector

            var components;

            if (mainParts[ 0 ].match(/\.\w+\(/)) {
                // complex case
                var cqParts = this.trimString(mainParts[ 0 ]).split(' ');

                for (i = 0; i < cqParts.length; i++) {
                    var query = this.trimString(cqParts[ i ]).split('.');

                    // TODO assuming query is specific, targeting just one target
                    root = root.query(query[0])[0];

                    if (query.length > 1) {
                        var fn = query[1].substr(0, query[1].length-2);
                        root = root[fn]();
                    }
                }

                components     = [root];
            } else {
                components     = root.query(mainParts[0]);
            }


            if (!components.length)
                if (allowEmpty) 
                    return []
                else
                    throw R.get('ComponentQuery') + ' ' + mainParts[0] + ' ' + R.get('matchedNoCmp');
            
            for (i = 0; i < components.length; i++) {
                cmp         = components[i];

                if (
                    cmp.rendered && (
                        !onlyVisibleComponents || (cmp.isVisible ? cmp.isVisible() : !cmp.isHidden()) 
                    )
                ) {
                    result = this.compToEl(cmp, false);
                    result = Array.prototype.slice.call($(mainParts[1], result.dom));

                    if (result.length > 0) {
                        return result;
                    }
                }
            }

            if (allowEmpty) {
                return [];
            }
            throw R.get('CompositeQuery') + ' ' + selector + ' ' + R.get('matchedNoCmp');
        },
        
        /**
         * An alias for Ext.ComponentQuery.query
         * 
         * @param {String} selector The selector to perform a component query with
         */
        cq : function (selector) {
            return this.Ext().ComponentQuery.query(selector);
        },

        /**
         * An shorthand method to get the first result of any Ext.ComponentQuery.query
         * 
         * @param {String} selector The selector to perform a component query with
         */
        cq1 : function (selector) {
            return this.Ext().ComponentQuery.query(selector)[0];
        },

        /**
         * Waits until the passed action target is detected and no ongoing animations are found. This can be a string such as a component query, CSS query or a composite query.
         *
         * @param {String/Siesta.Test.ActionTarget} target The target presence to wait for
         * @param {Function} callback The callback to call after the target has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForTarget : function(target, callback, scope, timeout, offset) {
            var SUPER   = this.SUPER
            
            this.waitForAnimations(function () {
                SUPER.call(this, target, callback, scope, timeout, offset)
            }, this, timeout);
        },

        /**
         * This assertion passes if the singleton MessageBox instance is currently visible.
         * The assertion is relevant if you use one of the following methods Ext.Msg.alert, Ext.Msg.confirm, Ext.Msg.prompt.
         *
         * @param {String} [description] The description for the assertion
         */
        messageBoxIsVisible : function(desc) {
            return this.notOk(this.Ext().Msg.isHidden(), desc || Siesta.Resource('Siesta.Test.ExtJSCore', 'messageBoxVisible'));
        },

        /**
         * This assertion passes if the singleton MessageBox instance is currently hidden.
         * The assertion is relevant if you use one of the following methods Ext.Msg.alert, Ext.Msg.confirm, Ext.Msg.prompt.
         *
         * @param {String} [description] The description for the assertion
         */
        messageBoxIsHidden : function(desc) {
            return this.ok(this.Ext().Msg.isHidden(), desc || Siesta.Resource('Siesta.Test.ExtJSCore', 'messageBoxHidden'));
        },

        /**
         * This assertion passes if the passed component query matches at least one component.
         *
         * @param {String} query The component query
         * @param {String} [description] The description for the assertion
         */
        cqExists : function(query, description) {
            this.ok(this.cq1(query), description);
        },

        /**
         * This assertion passes if the passed component query matches no components.
         *
         * @param {String} query The component query
         * @param {String} [description] The description for the assertion
         */
        cqNotExists : function(query, description) {
            this.notOk(this.cq1(query), description);
        },

        /**
         * This assertion passes if the passed component query matches at least one component.
         *
         * @param {String} query The component query
         * @param {String} [description] The description for the assertion
         */
        componentQueryExists : function() {
            this.cqExists.apply(this, arguments);
        }
    }
})
