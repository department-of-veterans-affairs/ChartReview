/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Browser
@extends Siesta.Test
@mixin Siesta.Test.Simulate.Event
@mixin Siesta.Test.TextSelection 
@mixin Siesta.Test.Simulate.Mouse
@mixin Siesta.Test.Simulate.Keyboard


A base class for testing a generic browser functionality. It has various DOM-related assertions, and is not optimized for any framework.

*/
Class('Siesta.Test.Browser', {
    
    isa         : Siesta.Test,
        
    does        : [ 
        Siesta.Test.Simulate.Event,
        Siesta.Test.Simulate.Mouse,
        Siesta.Test.Simulate.Touch,
        Siesta.Test.Simulate.Keyboard,
        Siesta.Test.Element,
        Siesta.Test.TextSelection
    ],

    has : {
        // this will be a shared array instance between all subtests
        // it should not be overwritten, instead modify individual elements:
        // NO: this.currentPosition = [ 1, 2 ]
        // YES: this.currentPosition[ 0 ] = 1
        // YES: this.currentPosition[ 1 ] = 2
        currentPosition         : {
           init : function () { return [ 0, 0 ]; }
        },
        
        forceDOMVisible         : false,
        isDOMForced             : false,
        
        browserInfo             : {
            lazy    : function () {
                return this.parseBrowser(window.navigator.userAgent)
            }
        }
    },
    
    after : {
        cleanup : function () {
            this._global    = null
        }
    },

    methods : { 
        $ : function () {
            var local$ = $.rebindWindowContext(this.global);
            return local$.apply(this.global, arguments);
        },


        isEventPrevented : function (event) {
            // our custom property - takes highest priority
            if (this.typeOf(event.$defaultPrevented) == 'Boolean') return event.$defaultPrevented
            
            // W3c standards property
            if (this.typeOf(event.defaultPrevented) == 'Boolean') return event.defaultPrevented
            
            return event.returnValue === false
        },
        
        
        // only called for the re-used contexts
        cleanupContextBeforeStart : function () {
            this.cleanupContextBeforeStartDom()
            
            this.SUPER()
        },
        
        
        cleanupContextBeforeStartDom : function () {
            var doc                 = this.global.document
            
            doc.body.innerHTML      = ''
        },
        
        
        getElementPageRect : function (el, $el) {
            $el             = $el || this.$(el)
            
            var offset      = $el.offset()
            
            return new Siesta.Util.Rect({
                left        : offset.left,
                top         : offset.top,
                width       : $el.outerWidth(),
                height      : $el.outerHeight()
            })
        },
        
        
        elementHasScroller : function (el, $el) {
            $el             = $el || this.$(el)
                
            var hasX        = el.scrollWidth != el.clientWidth && $el.css('overflow-x') != 'visible'
            var hasY        = el.scrollHeight != el.clientHeight && $el.css('overflow-y') != 'visible'
            
            return hasX || hasY ? { x : hasX, y : hasY } : false
        },
        
        
        hasForcedIframe : function () {
            return Boolean(
                (this.isDOMForced || this.forceDOMVisible) && (this.scopeProvider instanceof Scope.Provider.IFrame) && this.scopeProvider.iframe
            )
        },
        
        
        elementIsScrolledOut : function (el, offset) {
            var $el                 = this.$(el)
            
            var scrollableParents   = []
            var parent              = $el
            
            var body                = this.global.document.body
            
            while (parent = parent.parent(), parent.length && parent[ 0 ] != body) {
                var hasScroller     = this.elementHasScroller(parent[ 0 ], parent)
                
                if (hasScroller) scrollableParents.unshift({ hasScroller : hasScroller, $el : parent }) 
            }
            
            var $body               = this.$(body)
            var bodyOffset          = $body.offset()
            
            var currentRect         = new Siesta.Util.Rect({
                left        : bodyOffset.left + $body.scrollLeft(),
                top         : bodyOffset.top + $body.scrollTop(),

                // using height / width of the *screen* for BODY tag since it may have 0 height in some cases
                width       : this.$(this.global).width(),
                height      : this.$(this.global).height()
            })

            for (var i = 0; i < scrollableParents.length; i++) {
                var hasScroller     = scrollableParents[ i ].hasScroller
                var $parent         = scrollableParents[ i ].$el
                
                if (hasScroller && hasScroller.x)
                    currentRect     = currentRect.cropLeftRight(this.getElementPageRect($parent[ 0 ], $parent))
                    
                if (currentRect.isEmpty()) return true
                    
                if (hasScroller && hasScroller.y)
                    currentRect     = currentRect.cropTopBottom(this.getElementPageRect($parent[ 0 ], $parent))
                    
                if (currentRect.isEmpty()) return true
            }
            
            var elPageRect          = this.getElementPageRect($el[ 0 ], $el)
            var finalRect           = currentRect.intersect(elPageRect)
            
            if (finalRect.isEmpty()) return true
            
            offset                  = this.normalizeOffset(offset, $el)
            
            return !finalRect.contains(elPageRect.left + offset[ 0 ], elPageRect.top + offset[ 1 ])
        },
        
        
        scrollTargetIntoView : function (target, offset) {
            // If element isn't visible, try to bring it into view
            if (this.elementIsScrolledOut(target, offset)) {
                // Required to handle the case where the body is scrolled
                target.scrollIntoView();

                this.$(target).scrollintoview({ duration : 0 });
            }
        },

        
        processSubTestConfig : function () {
            var res             = this.SUPERARG(arguments)
            var me              = this
            
            Joose.A.each([ 
                'currentPosition', 
                'actionDelay', 'afterActionDelay', 
                'dragDelay', 'moveCursorBetweenPoints', 'dragPrecision', 'overEls'
            ], function (name) {
                res[ name ]     = me[ name ]
            })
            
            res.simulateEventsWith  = me.getSimulateEventsWith()
            
            return res
        },
        
        
        // Normalizes the element to an HTML element. Every 'framework layer' will need to provide its own implementation
        // This implementation accepts either a CSS selector or an Array with xy coordinates.
        normalizeElement : function (el, allowMissing, shallow, detailed) {
            // Quick exit if already an element
            if (el && el.nodeName) return el;

            var matchingMultiple = false

            if (this.typeOf(el) === 'String') {
                // DOM query
                var origEl  = el;

                var wasAdjusted = this.adjustScope(el);

                var query   = this.$(el.indexOf('->') >= 0 ? el.split('->')[1] : el);

                if (wasAdjusted) this.resetScope();

                el          = query[ 0 ];
                matchingMultiple = query.length > 1
                
                if (!allowMissing && !el) {
                    var warning = Siesta.Resource('Siesta.Test.Browser','noDomElementFound') + ': ' + origEl

                    this.warn(warning);
                    throw warning;
                }
            }
            
            if (this.typeOf(el) == 'Array') el = this.elementFromPoint(el[ 0 ], el[ 1 ]);
            
            return detailed ? { el : el, matchingMultiple : matchingMultiple } : el;
        },
        
        
        // this method generally has the same semantic as the "normalizeElement", its being used in 
        // Siesta.Test.Action.Role.HasTarget to determine what to pass to next step
        //
        // on the browser level the only possibility is DOM element
        // but on ExtJS level user can also use ComponentQuery and next step need to receive the 
        // component instance
        normalizeActionTarget : function (el, allowMissing) {
            return this.normalizeElement(el, allowMissing);
        },

        
        
        // private
        getPathBetweenPoints: function (from, to) {
            if (
                typeof from[0] !== 'number' ||
                typeof from[1] !== 'number' ||
                typeof to[0] !== 'number'   ||
                typeof to[1] !== 'number'   ||
                isNaN(from[0])              ||
                isNaN(from[1])              ||
                isNaN(to[0])                ||
                isNaN(to[1]))
            {
                throw 'Incorrect arguments passed to getPathBetweenPoints';
            }

            var stops = [],
                x0 = Math.floor(from[0]),
                x1 = Math.floor(to[0]),
                y0 = Math.floor(from[1]),
                y1 = Math.floor(to[1]),
                dx = Math.abs(x1 - x0),
                dy = Math.abs(y1 - y0),
                sx, sy, err, e2;

            if (x0 < x1) {
                sx = 1;
            } else {
                sx = -1;
            }

            if (y0 < y1) {
                sy = 1;
            } else {
                sy = -1;
            }
            err = dx - dy;
            
            while (x0 !== x1 || y0 !== y1) {
                e2 = 2 * err;
                if (e2 > -dy) {
                    err = err - dy;
                    x0 = x0 + sx;
                }

                if (e2 < dx) {
                    err = err + dx;
                    y0 = y0 + sy;
                }
                stops.push([x0, y0]);
            }

            var last = stops[stops.length-1];

            if (stops.length > 0 && (last[0] !== to[0] || last[1] !== to[1])) {
                // the points of the path can be modified in the move mouse method - thus pushing a copy
                // of the original target
                stops.push(to.slice());
            }
            return stops;
        },

        randomBetween : function (min, max) {
            return Math.round(min + (Math.random()*(max - min)));
        },

        
        // private, deprecated
        valueIsArray : function(a) {
            return this.typeOf(a) == 'Array'
        },
        
        
        /**
         * This method will return the top-most DOM element at the specified coordinates from the test page. If
         * the resulting element is an iframe and `shallow` argument is not passed as `true`
         * it'll query the iframe for its element from the local point inside it.
         * 
         * @param {Number} x The X coordinate
         * @param {Number} y The Y coordinate
         * @param {Boolean} [shallow] Pass `true` to _not_ check the nested iframe if element at original coordinates is an iframe.
         * 
         * @return {HTMLElement} The top-most element at the specified position on the test page
         */
        elementFromPoint : function (x, y, shallow, fallbackEl, fullInfo) {
            var document    = this.global.document;
            var el          = document.elementFromPoint(x, y)
            
            // trying 2nd time if 1st attempt failed and returned null
            // this weird thing seems to be required sometimes for IE8 and may be for IE10
            if (!el) el     = document.elementFromPoint(x, y)
            
            // final fallback to the provided element or to the <body> element
            el              = el || fallbackEl || document.body;
            
            var localX      = x
            var localY      = y

            // If we found IFRAME and its not a `shallow` request, try to dig deeper
            if (el.nodeName.toUpperCase() == 'IFRAME' && !shallow) { 
                // if found iframe is loaded from different domain
                // just accessing its "el.contentWindow.document" property will throw exception
                try {
                    var iframeDoc       = el.contentWindow.document;
                    var offsetsToTop    = this.$(el).offset();
                    
                    localX              = x - offsetsToTop.left
                    localY              = y - offsetsToTop.top
        
                    var resolvedEl      = iframeDoc.elementFromPoint(localX, localY)
        
                    // again weird 2nd attempt for IE
                    if (!resolvedEl) resolvedEl = iframeDoc.elementFromPoint(localX, localY)
                    
                    resolvedEl          = resolvedEl || iframeDoc.body;
        
                    // Chrome reports 'HTML' in nested document.elementFromPoint calls which makes no sense
                    if (resolvedEl.nodeName.toUpperCase() === 'HTML') resolvedEl = iframeDoc.body;
        
                    el                  = resolvedEl;
                } catch (e) {
                    // digging deeper failed, restore the local coordinates
                    localX              = x
                    localY              = y
                }
            }
            
            return fullInfo ? {
                el          : el,
                localXY     : [ localX, localY ],
                globalXY    : [ x, y ]
            } : el
        },
        
        
        activeElement : function (notAllowBody, fallbackEl, elOrDoc) {
            var doc         = elOrDoc ? elOrDoc.ownerDocument || elOrDoc : this.global.document
            
            var focusedEl   = doc.activeElement;

            // For iframes, we need to grab the activeElement of the frame
            if ($(focusedEl).is('iframe') && focusedEl.contentDocument && focusedEl.contentDocument.body) {
                focusedEl = focusedEl.contentDocument.activeElement;
            }
            // 1. In IE10, it seems activeElement cannot be trusted as it sometimes returns an empty object with no properties.
            // Try to detect this case and use the fallback el 
            // 2. Sometimes receiving <body> from this method does not make sense either - use fallback el as well
            else if (!focusedEl || !focusedEl.nodeName || !focusedEl.tagName || (focusedEl === doc.body && notAllowBody)) {
                focusedEl   = fallbackEl;
            }
            
            return focusedEl
        },

        
        /**
         * This method uses native `document.elementFromPoint()` and returns the DOM element under the current logical cursor 
         * position in the test. Note, that this method may work not 100% reliable in IE due to its bugs. In cases
         * when "document.elementFromPoint" can't find any element this method returns the &lt;body&gt; element.
         * 
         * @return {HTMLElement}
         */
        getElementAtCursor : function() {
            var xy          = this.currentPosition;
            
            return this.elementFromPoint(xy[0], xy[1]);
        },

        /**
         * This method will wait for the first browser `event`, fired by the provided `observable` and will then call the provided callback.
         * 
         * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
         * @param {String} event The name of the event to wait for
         * @param {Function} callback The callback to call 
         * @param {Object} scope The scope for the callback
         * @param {Number} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForEvent : function (observable, event, callback, scope, timeout) {
            var eventFired      = false
            var R               = Siesta.Resource('Siesta.Test.Browser');

            this.addListenerToObservable(observable, event, function () { eventFired = true })
            
            return this.waitFor({
                method          : function() { return eventFired; }, 
                callback        : callback,
                scope           : scope,
                timeout         : timeout,
                assertionName   : 'waitForEvent',
                description     : ' ' + R.get('waitForEvent') + ' "' + event + '" ' + R.get('event')
            });
        },

        
        addListenerToObservable : function (observable, event, listener, isSingle) {
            this.$(observable).bind(event, listener)
        },
        
        
        removeListenerFromObservable : function (observable, event, listener) {
            this.$(observable).unbind(event, listener)
        },
        
        
        /**
         * This assertion verifies the number of certain events fired by provided observable instance during provided period.
         * 
         * For example:
         *

    t.firesOk({
        observable      : store,
        events          : {
            update      : 1,
            add         : 2,
            datachanged : '> 1'
        },
        during          : function () {
            store.getAt(0).set('Foo', 'Bar');
            
            store.add({ FooBar : 'BazQuix' })
            store.add({ Foo : 'Baz' })
        },
        desc            : 'Correct events fired'
    })
    
    // or
    
    t.firesOk({
        observable      : store,
        events          : {
            update      : 1,
            add         : 2,
            datachanged : '>= 1'
        },
        during          : 1
    })
    
    store.getAt(0).set('Foo', 'Bar');
    
    store.add({ FooBar : 'BazQuix' })
    store.add({ Foo : 'Baz' })
    
         *
         * Normally this method accepts a single object with various options (as shown above), but also can be called in 2 additional shortcuts forms:
         * 

    // 1st form for multiple events
    t.firesOk(observable, { event1 : 1, event2 : '>1' }, description)
    
    // 2nd form for single event
    t.firesOk(observable, eventName, 1, description)
    t.firesOk(observable, eventName, '>1', description)

         * 
         * In both forms, `during` is assumed to be undefined and `description` is optional.
         * 
         * @param {Object} options An obect with the following properties:
         * @param {Ext.util.Observable/Ext.Element/HTMLElement} options.observable The observable instance that will fire events
         * @param {Object} options.events The object, properties of which corresponds to event names and values - to expected 
         * number of this event triggering. If value of some property is a number then exact that number of events is expected. If value
         * of some property is a string starting with one of the comparison operators like "\<", "\<=" etc and followed by the number
         * then Siesta will perform that comparison with the number of actualy fired events.
         * @param {Number/Function} [options.during] If provided as a number denotes the number of milliseconds during which
         * this assertion will "record" the events from observable, if provided as function - then this assertion will "record"
         * only events fired during execution of this function. If not provided at all - assertions are recorded until the end of
         * current test (or sub-test)  
         * @param {Function} [options.callback] A callback to call after this assertion has been checked. Only used if `during` value is provided. 
         * @param {String} [options.desc] A description for this assertion
         */
        firesOk: function (options, events, n, timeOut, func, desc, callback) {
            //                    |        backward compat arguments        | 
            var me              = this;
            var sourceLine      = me.getSourceLine();
            var R               = Siesta.Resource('Siesta.Test.Browser');
            var nbrArgs         = arguments.length
            var observable, during
            
            if (nbrArgs == 1) {
                observable      = options.observable
                events          = options.events
                during          = options.during
                desc            = options.desc || options.description
                callback        = options.callback
                
                timeOut         = this.typeOf(during) == 'Number' ? during : null
                func            = this.typeOf(during) == 'Function' ? during : null
                
            } else if (nbrArgs >= 5) {
                // old signature, backward compat
                observable      = options
                
                if (this.typeOf(events) == 'String') {
                    var obj         = {}
                    obj[ events ]   = n
                    
                    events          = obj
                }
            } else if (nbrArgs <= 3 && this.typeOf(events) == 'Object') {
                // shortcut form 1
                observable      = options
                desc            = n
            } else if (nbrArgs <= 4 && this.typeOf(events) == 'String') {
                // shortcut form 2
                observable      = options
                
                var obj         = {}
                obj[ events ]   = n
                events          = obj
                
                desc            = timeOut
                timeOut         = null
            } else
                throw new Error(R.get('unrecognizedSignature'))
            
            // start recording
            var counters    = {};
            var countFuncs  = {};

            Joose.O.each(events, function (expected, eventName) {
                counters[ eventName ]   = 0
                
                var countFunc   = countFuncs[ eventName ] = function () {
                    counters[ eventName ]++
                }
                
                me.addListenerToObservable(observable, eventName, countFunc);    
            })
            
            
            // stop recording and verify the results
            var stopRecording   = function () {
                Joose.O.each(events, function (expected, eventName) {
                    me.removeListenerFromObservable(observable, eventName, countFuncs[ eventName ]);
                    
                    var actualNumber    = counters[ eventName ]
    
                    if (me.verifyExpectedNumber(actualNumber, expected))
                        me.pass(desc, {
                            descTpl         : R.get('observableFired') + ' ' + actualNumber + ' `' + eventName + '` ' + R.get('events')
                        });
                    else
                        me.fail(desc, {
                            assertionName   : 'firesOk',
                            sourceLine      : sourceLine,
                            descTpl         : R.get('observableFiredOk') + ' `' + eventName + '` ' + R.get('events'),
                            got             : actualNumber,
                            gotDesc         : R.get('actualNbrEvents'),
                            need            : expected,
                            needDesc        : R.get('expectedNbrEvents')
                        });
                })
            }
            
            if (timeOut) {
                var async               = this.beginAsync(timeOut + 100);
                
                var originalSetTimeout  = this.originalSetTimeout;
    
                originalSetTimeout(function () {
                    me.endAsync(async);
                    
                    stopRecording()
    
                    callback && me.processCallbackFromTest(callback);
                }, timeOut);
            } else if (func) {
                func()
                
                stopRecording()
                
                callback && me.processCallbackFromTest(callback)
            } else {
                this.on('beforetestfinalizeearly', stopRecording)
            }
        },


        /**
         * This assertion passes if the observable fires the specified event exactly (n) times during the test execution.
         *
         * @param {Ext.util.Observable/Ext.Element/HTMLElement} observable The observable instance
         * @param {String} event The name of event
         * @param {Number} n The expected number of events to be fired
         * @param {String} desc The description of the assertion.
         */
        willFireNTimes: function (observable, event, n, desc, isGreaterEqual) {
            this.firesOk(observable, event, isGreaterEqual ? '>=' + n : n, desc)
        },
        
        
        getObjectWithExpectedEvents : function (event, expected) {
            var events      = {}
            
            if (this.typeOf(event) == 'Array') 
                Joose.A.each(event, function (eventName) {
                    events[ eventName ] = expected
                })
            else
                events[ event ]         = expected
                
            return events
        },
        
        
        /**
         * This assertion passes if the observable does not fire the specified event(s) after calling this method.
         * 
         * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
         * @param {String/Array[String]} event The name of event or array of such
         * @param {String} desc The description of the assertion.
         */
        wontFire : function(observable, event, desc) {
            this.firesOk({
                observable      : observable,
                events          : this.getObjectWithExpectedEvents(event, 0), 
                desc            : desc
            });
        },

        /**
         * This assertion passes if the observable fires the specified event exactly once after calling this method.
         * 
         * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
         * @param {String/Array[String]} event The name of event or array of such
         * @param {String} desc The description of the assertion.
         */
        firesOnce : function(observable, event, desc) {
            this.firesOk({
                observable      : observable,
                events          : this.getObjectWithExpectedEvents(event, 1), 
                desc            : desc
            });
        },

        /**
         * Alias for {@link #wontFire} method
         * 
         * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
         * @param {String/Array[String]} event The name of event or array of such
         * @param {String} desc The description of the assertion.
         */
        isntFired : function() {
            this.wontFire.apply(this, arguments);
        },

        /**
         * This assertion passes if the observable fires the specified event at least `n` times after calling this method.
         * 
         * @param {Mixed} observable Any browser observable, window object, element instances, CSS selector.
         * @param {String} event The name of event
         * @param {Number} n The minimum number of events to be fired
         * @param {String} desc The description of the assertion.
         */
        firesAtLeastNTimes : function(observable, event, n, desc) {
            this.firesOk(observable, event, '>=' + n, desc);
        },
        
        

        
        /**
         * This assertion will verify that the observable fires the specified event and supplies the correct parameters to the listener function.
         * A checker method should be supplied that verifies the arguments passed to the listener function, and then returns true or false depending on the result.
         * If the event was never fired, this assertion fails. If the event is fired multiple times, all events will be checked, but 
         * only one pass/fail message will be reported.
         * 
         * For example:
         * 

    t.isFiredWithSignature(store, 'add', function (store, records, index) {
        return (store instanceof Ext.data.Store) && (records instanceof Array) && t.typeOf(index) == 'Number'
    })
 
         * @param {Ext.util.Observable/Siesta.Test.ActionTarget} observable Ext.util.Observable instance or target as specified by the {@link Siesta.Test.ActionTarget} rules with 
         * the only difference that component queries will be resolved till the component level, and not the DOM element.
         * @param {String} event The name of event
         * @param {Function} checkerFn A method that should verify each argument, and return true or false depending on the result.
         * @param {String} desc The description of the assertion.
         */
        isFiredWithSignature : function(observable, event, checkerFn, description) {
            var eventFired;
            var me              = this;
            var sourceLine      = me.getSourceLine();
            var R               = Siesta.Resource('Siesta.Test.ExtJS.Observable');

            var verifyFiredFn = function () {
                me.removeListenerFromObservable(observable, event, listener)

                if (!eventFired) {
                    me.fail(event + " " + R.get('isFiredWithSignatureNotFired'));
                }
            };
            
            me.on('beforetestfinalizeearly', verifyFiredFn);

            var listener = function () { 
                me.un('beforetestfinalizeearly', verifyFiredFn);
                
                var result = checkerFn.apply(me, arguments);

                if (!eventFired && result) {
                    me.pass(description || R.get('observableFired') + ' ' + event + ' ' + R.get('correctSignature'), {
                        sourceLine  : sourceLine
                    });
                }

                if (!result) {
                    me.fail(description || R.get('observableFired') + ' ' + event + ' ' + R.get('incorrectSignature'), {
                        sourceLine  : sourceLine
                    });
                    
                    // Don't spam the assertion grid with failure, one failure is enough
                    me.removeListenerFromObservable(observable, event, listener)
                }
                eventFired = true 
            };
            
            me.addListenerToObservable(observable, event, listener)
        },


        // This method accepts actionTargets as input (Dom node, string, CQ etc) and does a first normalization pass to get a DOM element.
        // After initial normalization it also tries to locate, the 'top' DOM node at the center of the first pass resulting DOM node.
        // This is the only element we can truly interact with in a real browser.
        // returns an object containing the element plus coordinates
        getNormalizedTopElementInfo : function (actionTarget, skipWarning, actionName, offset) {
            var localXY, globalXY, el;

            actionTarget    = actionTarget || this.currentPosition;
            
            var targetIsPoint   = this.typeOf(actionTarget) == 'Array'

            // First lets get a normal DOM element to work with
            if (targetIsPoint) {
                globalXY    = actionTarget;
                
                var info    = this.elementFromPoint(actionTarget[ 0 ], actionTarget[ 1 ], false, null, true);
                
                el          = info.el
                localXY     = info.localXY
            } else {
                el          = this.normalizeElement(actionTarget, skipWarning, Boolean(offset));
            }

            if (!el && skipWarning) {
                return;
            }

            // 1. If this element is not visible, something is wrong
            // 2. If element is visible but not reachable (scrolled out of view) this is also an invalid scenario (this check is skipped for IE)
            //    TODO needs further investigation, conflicting with starting a drag operation on an element that isn't visible until the cursor is above it

            // we don't need to this check if target is a coordinate point, because in this case element is reachable by definition
            if (!targetIsPoint) {
                var R       = Siesta.Resource('Siesta.Test.Browser');
                var message = 'getNormalizedTopElementInfo: ' + (actionName ? R.get('targetElementOfAction') + " [" + actionName + "]" : R.get('targetElementOfSomeAction')) +
                    " " + R.get('isNotVisible') + ": " + (el.id ? '#' + el.id : el)
                
                if (!this.isElementVisible(el)){
                    this.fail(message)
                    return;
                }
                else if (!skipWarning && !this.elementIsTop(el, true, offset)) {
                    this.warn(message)
                }
            }

            if (!targetIsPoint) {
                var doc     = el.ownerDocument;
                var R       = Siesta.Resource('Siesta.Test.Browser');

                localXY     = this.getTargetCoordinate(el, true, offset)
                globalXY    = this.getTargetCoordinate(el, false, offset)

                // trying 2 times for IE
                el          = doc.elementFromPoint(localXY[ 0 ], localXY[ 1 ]) || doc.elementFromPoint(localXY[ 0 ], localXY[ 1 ]) || doc.body;

                if (!el) {
                    this.fail('getNormalizedTopElementInfo: ' + R.get('noElementFound') + ' [' + localXY + ']');
                    return; // No point going further
                }
            }

            return {
                el          : el,
                localXY     : localXY,
                globalXY    : globalXY
            }
        },

        /**
         * This method will wait for the presence of the passed string.
         *
         * @param {String} text The text to wait for
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Number} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForTextPresent : function (text, callback, scope, timeout) {
            var R               = Siesta.Resource('Siesta.Test.Browser');

            return this.waitFor({
                method          : function () {
                    var body        = this.global.document.body
                    var selector    = ':contains(' + text + ')'
                    
                    return this.$(selector, body).length > 0 || this.$(body).is(selector); 
                },
                callback        : callback,
                scope           : scope,
                timeout         : timeout,
                assertionName   : 'waitForTextPresent',
                description     : ' ' + R.get('text') + ' "' + text + '" ' + R.get('toBePresent')
            });
        },

        /**
         * This method will wait for the absence of the passed string.
         *
         * @param {String} text The text to wait for
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Number} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForTextNotPresent : function (text, callback, scope, timeout) {
            var R               = Siesta.Resource('Siesta.Test.Browser');

            return this.waitFor({
                method          : function () { 
                    var body        = this.global.document.body
                    var selector    = ':contains(' + text + ')'
                    
                    return this.$(selector, body).length === 0 && !this.$(body).is(selector); 
                },
                callback        : callback,
                scope           : scope,
                timeout         : timeout,
                assertionName   : 'waitForTextNotPresent',
                description     : ' ' + R.get('text') + ' "' + text + '" ' + R.get('toNotBePresent')
            });
        },

        /**
         * Waits until the passed action target is detected. This can be a string such as a component query, CSS query or a composite query.
         *
         * @param {String/Siesta.Test.ActionTarget} target The target presence to wait for
         * @param {Function} callback The callback to call after the target has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForTarget : function(target, callback, scope, timeout, offset) {
            var me = this;
            var R  = Siesta.Resource('Siesta.Test.Browser');

            return this.waitFor({
                method          : function () { 
                    var el      = me.normalizeElement(target, true)
                    
                    return el && me.elementIsTop(el, true, offset)
                },
                callback        : callback,
                scope           : scope,
                timeout         : timeout,
                assertionName   : 'waitForTarget',
                description     : ' ' + R.get('target') + ' "' + target + '" ' + R.get('toAppear')
            });
        },

        /**
         * Sets a new size for the test iframe
         *
         * @param {Int} width The new width
         * @param {Int} height The new height
         */
        setWindowSize : function(width, height) {
            this.scopeProvider.setViewportSize(width, height)
        },
        
        
        parseBrowser : function (uaString) {
            var browser = 'unknown'
            var version = ''
            
            var match
            
            if (match = /Firefox\/((?:\d+\.?)+)/.exec(uaString)) {
                browser     = "Firefox"
                version     = match[ 1 ]
            }
            
            if (match = /Chrome\/((?:\d+\.?)+)/.exec(uaString)) {
                browser     = "Chrome"
                version     = match[ 1 ]
            }
            
            if (match = /MSIE\s*((?:\d+\.?)+)/.exec(uaString)) {
                browser     = "IE"
                version     = match[ 1 ]
            }
            
            if (uaString.match(/trident/i) && (match = /rv.(\d\d\.?\d?)/.exec(uaString))) {
                browser     = "IE"
                version     = match[ 1 ]
            }
            
            if (match = /Apple.*Version\/((?:\d+\.?)+)\s*(?=Safari\/((?:\d+\.?)+))/.exec(uaString)) {
                browser     = "Safari"
                version     = match[ 1 ] + ' (' + match[ 2 ] + ')'
            }
            
            return {
                name        : browser,
                version     : version
            }
        },
        
        
        getJUnitClass : function () {
            var browserInfo         = this.getBrowserInfo()
            
            browserInfo             = browserInfo.name + browserInfo.version
            
            return browserInfo + ':' + this.SUPER()
        },

        // Returns true if the scope was adjusted to another frame for the target string
        adjustScope : function(target) {

            if (this.typeOf(target) == 'String') {
                var mainParts  = target.split('->');

                if (mainParts.length === 2) {
                    var frameEl = this.$(this.trimString(mainParts[ 0 ]))[ 0 ];

                    if (!frameEl || !frameEl.contentWindow) {
                        return false;
                    }

                    this._global = this.global;
                    this.global = frameEl.contentWindow;
                    return true;
                }
            }

            return false;
        },

        resetScope : function() {
            this.global     = this._global || this.global;
            
            this._global    = null
        },
        
        
        // a stub method for the Lite package
        screenshot : function (fileName, callback) {
            this.diag("Command: `screenshot` skipped - not running in Standard Package")
            
            callback && callback(false)
        }
        
    }
});
