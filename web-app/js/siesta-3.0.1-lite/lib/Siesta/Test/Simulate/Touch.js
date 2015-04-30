/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Simulate.Touch

This is a mixin, providing the touch events simulation functionality.
*/
Role('Siesta.Test.Simulate.Touch', {
    
    requires        : [ 
        'normalizeElement' 
    ],    
    
    has: {
        touchEventNamesMap  : {
            lazy        : 'this.buildTouchEventNamesMap'
        },
        
        currentTouchId  : 1,
        
        activeTouches   : Joose.I.Object
    },
    
    
    methods: {
        
        checkTouchEventsSupport : function () {
            var supports        = Siesta.Harness.Browser.FeatureSupport().supports
            
            if (!supports.TouchEvents && !supports.PointerEvents && !supports.MSPointerEvents) {
                this.warn("Touch events are not supported by browser. For Chrome, you can enable them, by launching it with: --args --touch-events")
            }
        },
        
        /**
         * This method taps the passed target, which can be of several different types, see {@link Siesta.Test.ActionTarget}
         * 
         * @param {Siesta.Test.ActionTarget} target Target for this action
         * @param {Function} callback (optional) A function to call after action.
         * @param {Object} scope (optional) The scope for the callback
         * @param {Object} options (optional) Any optionsthat will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         * @param {Array} offset (optional) An X,Y offset relative to the target. Example: [20, 20] for 20px or ["50%", "100%-2"] to click in the center horizontally and 2px from the bottom edge.
         */
        tap : function (target, callback, scope, options, offset) {
            this.checkTouchEventsSupport()
            
            var me      = this;
            var context = this.getNormalizedTopElementInfo(target, true, 'tap', offset);

            if (!context) {
                this.waitForTarget(target, function() {
                    this.tap(target, callback, scope, offset);
                }, this, null, offset);

                return;
            }
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : callback ? 30 : 0,
                
                observeTest     : this
            })
            
            var id
            
            queue.addStep({ 
                processor : function () {
                    id      = me.touchStart(null, null, options, context)
                } 
            })
            queue.addStep({ 
                processor : function () {
                    me.touchEnd(id, options)
                } 
            })

            var async   = me.beginAsync();
            
            queue.run(function () {
                me.endAsync(async);
                
                me.processCallbackFromTest(callback, null, scope || me)
            })
        },
        
        
        /**
         * This method double taps the passed target, which can be of several different types, see {@link Siesta.Test.ActionTarget}
         * 
         * @param {Siesta.Test.ActionTarget} target Target for this action
         * @param {Function} callback (optional) A function to call after action.
         * @param {Object} scope (optional) The scope for the callback
         * @param {Object} options (optional) Any optionsthat will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         * @param {Array} offset (optional) An X,Y offset relative to the target. Example: [20, 20] for 20px or ["50%", "100%-2"] to click in the center horizontally and 2px from the bottom edge.
         */
        doubleTap : function (target, callback, scope, options, offset) {
            this.checkTouchEventsSupport()
            
            var me      = this;
            var context = this.getNormalizedTopElementInfo(target, true, 'doubleTap', offset);

            if (!context) {
                this.waitForTarget(target, function() {
                    this.doubleTap(target, callback, scope, offset);
                }, this, null, offset);

                return;
            }
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : callback ? 30 : 0,
                
                observeTest     : this
            })
            
            var id
            
            queue.addStep({ 
                processor : function () {
                    id      = me.touchStart(null, null, options, context)
                } 
            })
            queue.addStep({ 
                processor : function () {
                    me.touchEnd(id, options)
                } 
            })
            queue.addStep({ 
                processor : function () {
                    id      = me.touchStart(null, null, options, context)
                } 
            })
            queue.addStep({ 
                processor : function () {
                    me.touchEnd(id, options)
                } 
            })

            var async   = me.beginAsync();
            
            queue.run(function () {
                me.endAsync(async);
                
                me.processCallbackFromTest(callback, null, scope || me)
            })
        },
        
        
        getLongPressDelay : function () {
            return 1500
        },
        
        
        // backward-compat with SenchaTouch class, which used to have all lower-cased method
        longpress : function () {
            return this.longPress.apply(this, arguments)
        },
        
        
        /**
         * This performs a long press on the passed target, which can be of several different types, see {@link Siesta.Test.ActionTarget}
         * 
         * @param {Siesta.Test.ActionTarget} target Target for this action
         * @param {Function} callback (optional) A function to call after action.
         * @param {Object} scope (optional) The scope for the callback
         * @param {Object} options (optional) Any optionsthat will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         * @param {Array} offset (optional) An X,Y offset relative to the target. Example: [20, 20] for 20px or ["50%", "100%-2"] to click in the center horizontally and 2px from the bottom edge.
         */
        longPress : function (target, callback, scope, options, offset) {
            this.checkTouchEventsSupport()
            
            var me      = this;
            var context = this.getNormalizedTopElementInfo(target, true, 'longPress', offset);

            if (!context) {
                this.waitForTarget(target, function() {
                    this.longPress(target, callback, scope, offset);
                }, this, null, offset);

                return;
            }
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : callback ? 30 : 0,
                
                observeTest     : this
            })
            
            var id
            
            queue.addStep({ 
                processor : function () {
                    id      = me.touchStart(null, null, options, context)
                } 
            })
            queue.addDelayStep(this.getLongPressDelay())
            queue.addStep({ 
                processor : function () {
                    me.touchEnd(id, options)
                } 
            })

            var async   = me.beginAsync();
            
            queue.run(function () {
                me.endAsync(async);
                
                me.processCallbackFromTest(callback, null, scope || me)
            })
        },
        
        
        /**
         * This method performs a pinch between the two specified points. It draws a line between the specified points and then moves 2 touches along that line,
         * so that the final distance between the touches becomes `scale * original distance`.
         * 
         * This method can be called either in the full form with 2 different targets:
         * 

    t.pinch("#grid > .col1", "#grid > .col2", 3, function () { ... })
    
         * or, in the short form, where the 2nd target argument is omitted:
         * 

    t.pinch("#grid > .col1", 3, function () { ... })
    
         * In the latter form, `target2` is considered to be the same as `target1`.
         * 
         * If `target1` and `target2` are the same, and no offsets are provided, offsets are set to the following values:
         * 
    
    offset1     = [ '25%', '50%' ]
    offset2     = [ '75%', '50%' ]

         * 
         * 
         * @param {Siesta.Test.ActionTarget} target1 First point for pinch
         * @param {Siesta.Test.ActionTarget} target2 Second point for pinch. Can be omitted, in this case both points will belong to `target1`
         * @param {Number} scale The multiplier for a final distance between the points
         * @param {Function} callback A function to call after the pinch has completed
         * @param {Object} scope A scope for the `callback`
         * @param {Object} options (optional) Any optionsthat will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         * @param {Array} offset1 An X,Y offset relative to the target1. Example: [20, 20] for 20px or ["50%", "100%-2"] 
         * for the point in the center horizontally and 2px from the bottom edge.
         * @param {Array} offset2 An X,Y offset relative to the target1. Example: [20, 20] for 20px or ["50%", "100%-2"] 
         * for the point in the center horizontally and 2px from the bottom edge.
         */
        pinch : function (target1, target2, scale, callback, scope, options, offset1, offset2) {
            this.checkTouchEventsSupport()
            
            var me          = this;
            
            if (this.typeOf(target2) == 'Number') {
                offset2     = offset1
                offset1     = options
                options     = scope
                scope       = callback
                callback    = scale
                scale       = target2
                target2     = target1
            }
            
            if (target2 == null) target2 = target1
            
            if (target1 == target2 && !offset1 && !offset2) {
                offset1     = [ '25%', '50%' ]
                offset2     = [ '75%', '50%' ]
            }
            
            var context1    = this.getNormalizedTopElementInfo(target1, true, 'pinch: target1', offset1);
            var context2    = this.getNormalizedTopElementInfo(target2, true, 'pinch: target2', offset2);

            if (!context1 || !context2) {
                var R  = Siesta.Resource('Siesta.Test.Browser');
                
                this.waitFor({
                    method          : function () { 
                        var el1     = me.normalizeElement(target1, true)
                        var el2     = me.normalizeElement(target2, true)
                        
                        return el1 && me.elementIsTop(el1, true, offset) && el2 && me.elementIsTop(el2, true, offset)
                    },
                    callback        : function () {
                        me.pinch(target1, target2, scope, callback, scope, options, offset1, offset2)
                    },
                    assertionName   : 'waitForTarget',
                    description     : ' ' + R.get('target') + ' "' + target1 + '" and "' + target2 + '" ' + R.get('toAppear')
                });                

                return
            }
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : callback ? 30 : 0,
                
                observeTest     : this
            })
            
            var id1, id2
            
            var dx          = context1.localXY[ 0 ] - context2.localXY[ 0 ]
            var dy          = context1.localXY[ 1 ] - context2.localXY[ 1 ]
            
            var distance    = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 1) distance = 1
            
            var scaled      = distance * scale
            var delta       = (scaled - distance) / 2
            
            var angle       = Math.atan(dy / dx)
            
            var x1          = Math.round(context1.localXY[ 0 ] - delta * Math.cos(angle))
            var y1          = Math.round(context1.localXY[ 1 ] - delta * Math.sin(angle))
            
            var x2          = Math.round(context2.localXY[ 0 ] + delta * Math.cos(angle))
            var y2          = Math.round(context2.localXY[ 1 ] + delta * Math.sin(angle))
            
            var options2    = Joose.O.extend({}, options)
            
            queue.addStep({ 
                processor : function () {
                    id1     = me.touchStart(null, null, options, context1)
                    id2     = me.touchStart(null, null, options2, context2)
                } 
            })
            queue.addAsyncStep({ 
                processor : function (data) {
                    var move1Done   = false
                    var move2Done   = false
                    
                    me.touchMove(id1, x1, y1, function () {
                        move1Done       = true
                        
                        if (move1Done && move2Done) data.next()
                    }, null, options)
                    
                    me.touchMove(id2, x2, y2, function () {
                        move2Done       = true
                        
                        if (move1Done && move2Done) data.next()
                    }, null, options2)
                } 
            })
            queue.addStep({ 
                processor : function () {
                    me.touchEnd(id1, options)
                    me.touchEnd(id2, options2)
                } 
            })

            var async   = me.beginAsync();
            
            queue.run(function () {
                me.endAsync(async);
                
                me.processCallbackFromTest(callback, null, scope || me)
            })
        },
        
        
        simulateTouchDrag : function (sourceXY, targetXY, callback, scope, options, dragOnly) {
            this.checkTouchEventsSupport()
            
            var me          = this
            options         = options || {};

            // For drag operations we should always use the top level document.elementFromPoint
            var source      = me.elementFromPoint(sourceXY[ 0 ], sourceXY[ 1 ], true);
            var target      = me.elementFromPoint(targetXY[ 0 ], targetXY[ 1 ], true);
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : me.dragDelay,
                callbackDelay   : me.afterActionDelay,
                
                observeTest     : this
            });
            
            var id
            
            queue.addStep({
                processor : function () {
                    id      = me.touchStart(sourceXY, null, options)
                } 
            })
            queue.addAsyncStep({ 
                processor : function (data) {
                    me.touchMove(id, targetXY[ 0 ], targetXY[ 1 ], data.next, null, options)
                } 
            })
            queue.addStep({ 
                processor : function () {
                    // if `dragOnly` flag is set, do not finalize the touch, instead, pass the touch id
                    // to the user in the callback (see below)
                    if (!dragOnly) me.touchEnd(id, options)
                } 
            })

            var async   = me.beginAsync();
            
            queue.run(function () {
                me.endAsync(async);
                
                // if `dragOnly` flag is set pass the touch id to the user as the argument of the callback
                me.processCallbackFromTest(callback, [ dragOnly ? id : null ], scope || me)
            })
        },
        
        
        /**
         * This method will simulate a drag and drop operation between either two points or two DOM elements.
         *   
         * @param {Siesta.Test.ActionTarget} source {@link Siesta.Test.ActionTarget} value for the drag starting point
         * @param {Siesta.Test.ActionTarget} target {@link Siesta.Test.ActionTarget} value for the drag end point
         * @param {Function} callback A function to call after the drag operation is completed.
         * @param {Object} scope (optional) the scope for the callback
         * @param {Object} options (optional) Any optionsthat will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         * @param {Boolean} dragOnly true to skip the mouseup and not finish the drop operation.
         * @param {Array} sourceOffset (optional) An X,Y offset relative to the source. Example: [20, 20] for 20px or ["50%", "100%-2"] to click in the center horizontally and 2px from the bottom edge.
         * @param {Array} targetOffset (optional) An X,Y offset relative to the target. Example: [20, 20] for 20px or ["50%", "100%-2"] to click in the center horizontally and 2px from the bottom edge.
         */
        touchDragTo : function (source, target, callback, scope, options, dragOnly, sourceOffset, targetOffset) {
            var me          = this
            var context1    = this.getNormalizedTopElementInfo(source, true, 'touchDragTo: source', sourceOffset);
            var context2    = this.getNormalizedTopElementInfo(target, true, 'touchDragTo: target', targetOffset);

            if (!context1 || !context2) {
                var R  = Siesta.Resource('Siesta.Test.Browser');
                
                this.waitFor({
                    method          : function () { 
                        var el1     = me.normalizeElement(source, true)
                        var el2     = me.normalizeElement(target, true)
                        
                        return el1 && me.elementIsTop(el1, true, sourceOffset) && el2 && me.elementIsTop(el2, true, targetOffset)
                    },
                    callback        : function () {
                        me.touchDragTo(source, target, callback, scope, options, dragOnly, sourceOffset, targetOffset)
                    },
                    assertionName   : 'waitForTarget',
                    description     : ' ' + R.get('target') + ' "' + source + '" and "' + target + '" ' + R.get('toAppear')
                });                

                return
            }
            
            this.simulateTouchDrag(context1.localXY, context2.localXY, callback, scope, options, dragOnly)
        },
        
        
        /**
         * This method will simulate a drag and drop operation from a point (or DOM element) and move by a delta.
         *   
         * @param {Siesta.Test.ActionTarget} source {@link Siesta.Test.ActionTarget} value as the drag starting point
         * @param {Array} delta The amount to drag from the source coordinate, expressed as [ x, y ]. E.g. [ 50, 10 ] will drag 50px to the right and 10px down.
         * @param {Function} callback A function to call after the drag operation is completed.
         * @param {Object} scope (optional) the scope for the callback
         * @param {Object} options (optional) Any optionsthat will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         * @param {Boolean} dragOnly true to skip the mouseup and not finish the drop operation.
         * @param {Array} offset (optional) An X,Y offset relative to the target. Example: [20, 20] for 20px or ["50%", "100%-2"] to click in the center horizontally and 2px from the bottom edge.
         */
        touchDragBy : function (source, delta, callback, scope, options, dragOnly, offset) {
            var me      = this;
            var context = this.getNormalizedTopElementInfo(source, true, 'touchDragBy', offset);

            if (!context) {
                this.waitForTarget(source, function() {
                    this.touchDragBy(source, delta, callback, scope, options, dragOnly, offset)
                }, this, null, offset)

                return
            }
            
            var sourceXY        = context.globalXY;
            var targetXY        = [ sourceXY[ 0 ] + delta[ 0 ], sourceXY[ 1 ] + delta[ 1 ] ];
            
            this.simulateTouchDrag(sourceXY, targetXY, callback, scope, options, dragOnly)
        },
        
        
        /**
         * This method will simulate a swipe operation between either two points or on a single DOM element.
         *   
         * @param {Siesta.Test.ActionTarget} target Target for this action
         * @param {String} direction Either 'left', 'right', 'up' or 'down'
         * @param {Function} callback A function to call after the swing operation is completed
         * @param {Object} scope (optional) the scope for the callback
         * @param {Object} options (optional) Any options that will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         */
        swipe : function (target, direction, callback, scope, options) {
            this.checkTouchEventsSupport()
            
            target      = this.normalizeElement(target, true);

            if (!target) {
                this.waitForTarget(target, function() {
                    this.swipe(target, direction, callback, scope, options)
                }, this)

                return
            }

            var Ext     = this.Ext()
            var R       = Siesta.Resource('Siesta.Test.SenchaTouch')
    
            var box     = Ext.fly(target).getBox(),
                start,
                end,
                edgeOffsetRatio = 10;
            
            // Since this method accepts elements as target, we need to assure that we swipe at least about 150px
            // using Math.max below etc

            switch(direction) {
                case 'u':
                case 'up':
                    start       = [ box.x + box.width / 2, (box.y + box.height * 9 / edgeOffsetRatio)];
                    end         = [ box.x + box.width / 2, box.y + box.height / edgeOffsetRatio]; 
                    
                    end[ 1 ]    = Math.min(start[ 1 ] - 100, end[ 1 ]);
                break;

                case 'd':
                case 'down':
                    start       = [ box.x + box.width / 2, (box.y + box.height / edgeOffsetRatio)]; 
                    end         = [ box.x + box.width / 2, (box.y + box.height * 9 / edgeOffsetRatio)];

                    end[ 1 ]    = Math.max(start[ 1 ] + 100, end[ 1 ]);
                break;

                case 'r':
                case 'right':
                    start       = [box.x + (box.width / edgeOffsetRatio), (box.y + box.height / 2) ]; 
                    end         = [box.x + (box.width * 9 / edgeOffsetRatio), (box.y + box.height / 2) ];
                    
                    end[ 0 ]    = Math.max(start[ 0 ] + 100, end[ 0 ]);
                break;

                case 'l':
                case 'left':
                    start       = [box.x + (box.width * 9 / edgeOffsetRatio), (box.y + box.height / 2) ];
                    end         = [box.x + (box.width / edgeOffsetRatio), (box.y + box.height / 2) ]; 
                    
                    end[ 0 ]    = Math.min(start[ 0 ] - 100, end[ 0 ]);
                break;

                default: 
                    throw R.get('invalidSwipeDir') + ': ' + direction;
            }

            this.touchDragTo(start, end, callback, scope, options);
        },
        
        
        touchStart : function (target, offset, options, context) {
            if (!context) context = this.getNormalizedTopElementInfo(target, true, 'touchStart', offset)
            
            options         = Joose.O.extend({
                clientX     : context.localXY[ 0 ],
                clientY     : context.localXY[ 1 ]
            }, options || {})
            
            var event       = this.simulateTouchEventGeneric(context.el, 'start', options)
            
            return event.pointerId || event.changedTouches[ 0 ].identifier
        },
        
        
        touchEnd : function (touchId, options) {
            var touch       = this.activeTouches[ touchId ]
            
            if (!touch) throw "Can't find active touch: " + touchId
            
            options         = Joose.O.extend({
                clientX     : touch.clientX,
                clientY     : touch.clientY
            }, options || {})
            
            this.simulateTouchEventGeneric(touch.currentEl || touch.target, 'end', options, { touchId : touchId })
        },
        
        
        touchMove : function (touchId, toX, toY, callback, scope, options) {
            var touch       = this.activeTouches[ touchId ]
            
            if (!touch) throw "Can't find active touch: " + touchId
            
            var me          = this
            var overEls     = []
            
            this.movePointerTemplate({
                xy              : [ touch.clientX, touch.clientY ],
                xy2             : [ toX, toY ],
                callback        : callback,
                scope           : scope,
                options         : options || {},
                
                overEls         : overEls,
                interval        : this.dragDelay,
                callbackDelay   : me.afterActionDelay,
                precision       : me.dragPrecision,
                
                onVoidOverEls   : function () {
                    overEls         = []
                },
                
                onPointerEnter  : function (el, options, suppressLog) {
                },
                
                onPointerLeave  : function (el, options, suppressLog) {
                },
                
                onPointerOver   : function (el, options, suppressLog) {
                },
                
                onPointerOut    : function (el, options, suppressLog) {
                },
                
                onPointerMove   : function (el, options, suppressLog) {
                    touch.clientX       = options.clientX
                    touch.clientY       = options.clientY
                    
                    // TODO should take scrolling into account
                    touch.pageX         = options.clientX
                    touch.pageY         = options.clientY
                    
                    touch.currentEl     = el
                    
                    me.simulateTouchEventGeneric(el, 'move', options, { touchId : touchId })
                }
            })
        },
        

        // never used yet, should be called when touchMove goes out of the document
        touchCancel : function (touchId, options) {
            var touch       = this.activeTouches[ touchId ]
            
            if (!touch) throw "Can't find active touch: " + touchId
            
            this.simulateTouchEventGeneric(touch.currentEl || touch.target, 'cancel', options, { touchId : touchId })
        },
        
        
        simulatePointerEvent : function (target, type, options, simOptions) {
            var supports    = Siesta.Harness.Browser.FeatureSupport().supports
            
            options         = options || {}
            
            var doc         = this.global.document,
                event       = doc.createEvent(
                    supports.PointerEvents ? 'PointerEvent' : supports.MSPointerEvents ? 'MSPointerEvent' : 'MouseEvents'
                ),
                target      = this.normalizeElement(target)
                
            if (!target) return false
            
            var clientX, clientY
            
            if (/pointerdown$/i.test(type) && (!("clientX" in options) || !("clientY" in options))) {
                var center  = this.findCenter(target);

                options     = Joose.O.extend({
                    clientX     : center[ 0 ],
                    clientY     : center[ 1 ]
                }, options)
            } else
            
            event[ (supports.MSPointerEvents || supports.PointerEvents) ? 'initPointerEvent' : 'initMouseEvent' ](
                type, true, true, this.global, options.detail,
                options.screenX, options.screenY, options.clientX, options.clientY,
                options.ctrlKey || false, options.altKey || false, options.shiftKey || false, options.metaKey || false,
                options.button, options.relatedTarget || doc.body.parentNode,
                // the following extra args are used in the "initPointerEvent"
                // offsetX, offsetY
                null, null,
                // width, height
                null, null,
                // pressure, rotation
                null, null,
                // tiltX, tiltY
                null, null,
                // pointerId
                simOptions.touchId || this.currentTouchId++,
                // pointerType
                // NOTE: this has to be set to "mouse" (IE11) or 4 (IE10, 11) because otherwise
                // ExtJS5 blocks the event
                // need to investigate what happens in SenchaTouch
                4,//'mouse',
                // timestamp, isPrimary
                null, null
            );
            
            if (!(supports.MSPointerEvents || supports.PointerEvents)) {
                event.pointerId = simOptions.touchId || this.currentTouchId++
            }
            
            target.dispatchEvent(event)
        
            return event
        },
        
        
        simulateTouchEvent : function (target, type, options, simOptions) {
            options         = options || {}
            var global      = this.global
            var doc         = global.document
            
            var event       = new global.CustomEvent(type, {
                bubbles     : true,
                cancelable  : true
            })
                
            var target      = this.normalizeElement(target)
            
            var clientX, clientY 
            
            if (("clientX" in options) && ("clientY" in options)) {
                clientX     = options.clientX
                clientY     = options.clientY
            } else {
                var center  = this.findCenter(target);

                clientX     = center[ 0 ]
                clientY     = center[ 1 ]
            }
            
            var activeTouches   = this.activeTouches
            var touch           = simOptions.touch
            var touches         = []
            var targetTouches   = []
            
            for (var id in activeTouches) {
                var currentTouch    = activeTouches[ id ]
                
                touches.push(currentTouch)
                if (currentTouch.target == target) targetTouches.push(currentTouch)
            }
            
            Joose.O.extend(event, {
                target          : target,
                
                changedTouches  : this.createTouchList([ touch ]),
                
                touches         : this.createTouchList(touches),
                targetTouches   : this.createTouchList(targetTouches),
                
                altKey          : options.altKey,
                metaKey         : options.metaKey,
                ctrlKey         : options.ctrlKey,
                shiftKey        : options.shiftKey
            });
        
            target.dispatchEvent(event)
            
            return event
        },
        
        
        createTouchList : function  (touchList) {
            var doc         = this.global.document
            
            // a branch for browsers supporting "createTouch/createTouchList"
            if (doc.createTouch) {
                var touches = [];
        
                for (var i = 0; i < touchList.length; i++) {
                    var touchCfg    = touchList[ i ];
                    
                    touches.push(doc.createTouch(
                        doc.defaultView || doc.parentWindow,
                        touchCfg.target,
                        touchCfg.identifier || this.currentTouchId++,
                        touchCfg.pageX,
                        touchCfg.pageY,
                        touchCfg.screenX || touchCfg.pageX,
                        touchCfg.screenY || touchCfg.pageY,
                        touchCfg.clientX,
                        touchCfg.clientY
                    ))
                }
            
                return doc.createTouchList.apply(doc, touches);
            } else
                return touchList
        },
        
    
        createTouch: function (target, clientX, clientY) {
            return {
                identifier  : this.currentTouchId++,
                target      : target,
                
                clientX     : clientX,
                clientY     : clientY,
                
                screenX     : 0,
                screenY     : 0,
             
                // TODO should take scrolling into account
                pageX       : clientX,
                pageY       : clientY
            }
        },
    
    
        buildTouchEventNamesMap : function () {
            var supports        = Siesta.Harness.Browser.FeatureSupport().supports
            
            return supports.PointerEvents ?
                {
                    start   : 'pointerdown',
                    move    : 'pointermove',
                    end     : 'pointerup',
                    cancel  : 'pointercancel'
                }
                : supports.MSPointerEvents ?
                {
                    start   : 'MSPointerDown',
                    move    : 'MSPointerMove',
                    end     : 'MSPointerUp',
                    cancel  : 'MSPointerCancel'
                }
                : /*supports.TouchEvents ?*/
                {
                    start   : 'touchstart',
                    move    : 'touchmove',
                    end     : 'touchend',
                    cancel  : 'touchcancel'
                }
//                :
//                // todo: fire mouseevents?
//                (function () { throw "Touch events not supported" })()
        },
        
        
        simulateTouchEventGeneric : function (target, type, options, simOptions) {
            simOptions      = simOptions || {}
            
            var target      = this.normalizeElement(target)
            
            var clientX, clientY 
            
            if (("clientX" in options) && ("clientY" in options)) {
                clientX     = options.clientX
                clientY     = options.clientY
            } else {
                var center  = this.findCenter(target);

                clientX     = center[ 0 ]
                clientY     = center[ 1 ]
            }
            
            var activeTouches   = this.activeTouches
            var touch
            
            if (type === 'end' || type === 'cancel') {
                touch       = activeTouches[ simOptions.touchId ]
                
                target      = touch.currentEl || touch.target
                
                delete activeTouches[ simOptions.touchId ]
            } else if (type == 'start') {
                touch       = this.createTouch(target, clientX, clientY)
                
                activeTouches[ touch.identifier ] = touch
                
            } else if (type == 'move') {
                touch           = activeTouches[ simOptions.touchId ]
                
                // "*move" events should be fired only from the "movePointerTemplate" method
                // which provides the "clientX/clientY" properties
                touch.clientX   = options.clientX
                touch.clientY   = options.clientY
            }
            
            if (!touch) throw "Can't find active touch" + (simOptions.touchId ? ': ' + simOptions.touchId : '')
            
            if (!simOptions.touchId) simOptions.touchId = touch.identifier
            
            simOptions.touch    = touch
            
            var eventType       = this.getTouchEventNamesMap()[ type ]
            var supports        = Siesta.Harness.Browser.FeatureSupport().supports
            
            if (supports.PointerEvents || supports.MSPointerEvents) {
                return this.simulatePointerEvent(target, eventType, options, simOptions)
            } else /*if (supports.TouchEvents)*/ {
                return this.simulateTouchEvent(target, eventType, options, simOptions);
            }
//            } else {
//                // TODO fallback to mouse events?
//                throw "Can't simulate any type of touch events"
//            }
        }
    }
});


//////////////////////////  Code copied from ExtJS:

// parts from 
// SDK/packages/sencha-core/test/resources/helpers.js

// parts from 
// SDK/ext/examples/desktop/.sencha/test/jasmine.js