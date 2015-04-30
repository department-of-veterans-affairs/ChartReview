/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Simulate.Event

This is a mixin providing events simulation functionality.

*/

Role('Siesta.Test.Simulate.Event', {
    
    requires        : [ 
        'createTextEvent', 
        'createMouseEvent', 
        'createKeyboardEvent'
    ],
    
    has: {
        actionDelay             : 100,
        afterActionDelay        : 100,
        
        /**
         * @cfg {String} simulateEventsWith
         * 
         * This option is IE9-strict mode (and probably above) specific. It specifies, which events simulation function Siesta should use. 
         * The choice is between 'dispatchEvent' (W3C standard) and 'fireEvent' (MS interface) - both are available in IE9 strict mode
         * and both activates different event listeners. See this blog post for detailed explanations: 
         * <http://www.digitalenginesoftware.com/blog/archives/76-DOM-Event-Model-Compatibility-or-Why-fireEvent-Doesnt-Trigger-addEventListener.html>
         * 
         * Valid values are "dispatchEvent" and "fireEvent".
         * 
         * The framework specific adapters choose the most appropriate value automatically (unless explicitly configured).
         */
        simulateEventsWith      : {
            is          : 'rw',
            init        : 'dispatchEvent'
        }
    },

    methods: {
        
        processMouseEventName : function (eventName) {
            return eventName
        },
        
        
        /**
         * This method will simulate an event triggered by the passed element. If no coordinates are supplied in the options object, the center of the element
         * will be used. 
         * @param {Siesta.Test.ActionTarget} el
         * @param {String} type The type of event (e.g. 'mouseover', 'click', 'keypress')
         * @param {Object} the options for the event. See http://developer.mozilla.org/en/DOM/event for reference.
         * @param {Boolean} suppressLog true to not include this simulated event in the assertion grid.
         */
        simulateEvent: function (el, type, options, suppressLog) {
            var global      = this.global;
            options         = options || {};

            if (this.typeOf(el) == 'Array') {
                if (!('clientX' in options)) {
                    options.clientX = el[0];
                }

                if (!('clientY' in options)) {
                    options.clientY = el[1];
                }
            }

            el              = this.normalizeElement(el);
            
            var touchEvent
            var processed   = this.processMouseEventName(type)
            
            // simulate extra touch event 1st - for touch enabled browsers, like IE10, 11 
            if (processed != type) {
                touchEvent              = this.createEvent(processed, options, el);
                
                touchEvent.synthetic    = true;
                
                this.dispatchEvent(el, processed, touchEvent);
            }
            
            var evt             = this.createEvent(type, options, el);

            if (evt) {
                evt.synthetic   = true;
                this.dispatchEvent(el, type, evt);

                // Let the outside world know that an event was simulated
                if (!suppressLog) {
                    this.fireEvent('eventsimulated', this, el, type, evt);
                }
            }

            // touch event is considered to be "main" for IE10, 11 cause ExtJS listens mostly those
            // and cancel flag will be returned in touch event..
            return touchEvent || evt;
        },

        createEvent: function (type, options, el) {
            var event
            
            if (/^text(Input)$/.test(type)) {
                event   = this.createTextEvent(type, options, el);
            } else if (/^mouse(over|out|down|up|move|enter|leave)|contextmenu|(dbl)?click$/.test(type) || /^(ms)?pointer/i.test(type)) {
                event   = this.createMouseEvent(type, options, el);
            } else if (/^key(up|down|press)$/.test(type)) {
                event   = this.createKeyboardEvent(type, options, el);
            } /*else if (/^touch/.test(type)) {
                return this.createTouchEvent(type, options, el);
            }*/ else
                event   = this.createHtmlEvent(type, options, el);

            // IE>=10 somehow reports that "defaultPrevented" property of the event object is `false`
            // even that "preventDefault()" has been called on the object
            // more over, immediately after call to "preventDefault()" the property is updated
            // but down in stack it is replaced with "false" again somehow
            // we setup our own, additional property, indicating that event has been prevented
            if (event && $.browser.msie && Number($.browser.version) >= 10) {
                var prev    = event.preventDefault
                
                if (prev) event.preventDefault = function () {
                    this.$defaultPrevented  = true                    
                    return prev.apply(this, arguments)
                }
            }

            return event
        },


        createHtmlEvent : function(type, options, el) {
            var doc = el.ownerDocument;

            if (doc.createEvent && this.getSimulateEventsWith() == 'dispatchEvent') {
                var evt = doc.createEvent("HTMLEvents");
                evt.initEvent(type, false, false);
                return evt;
            } else if (doc.createEventObject) {
                return doc.createEventObject();
            }
        },
        
        dispatchEvent: function (el, type, evt) {

            // use W3C standard when available and allowed by "simulateEventsWith" option            
            if (el.dispatchEvent && this.getSimulateEventsWith() == 'dispatchEvent') {
                el.dispatchEvent(evt);
            } else if (el.fireEvent) {
                // IE 6,7,8 can't dispatch many events cleanly - throws exceptions
                try {
                    // this is the serios nominant to the best-IE-bug-ever prize and it's IE7 specific
                    // accessing the "scrollLeft" property on document or body triggers a synchronous(!) "resize" event on the window
                    // ExtJS uses a singleton for Ext.EventObj and its "target" property gets overwritten with "null"
                    // thus consequent event handlers fails
                    // doing an access to that property to cache it
                    var doc     = this.global.document.documentElement;
                    var body    = this.global.document.body;
                    
                    var xxx     = doc && doc.scrollLeft || body && body.scrollLeft || 0;
                    
                    el.fireEvent('on' + type, evt);
                } catch (e) {
                }
            } else
                throw "Can't dispatch event: " + type
            
            return evt;
        }

    }
});
