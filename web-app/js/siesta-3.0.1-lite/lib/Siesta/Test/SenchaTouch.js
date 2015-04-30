/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.SenchaTouch
@extends Siesta.Test.Browser
@mixin Siesta.Test.ExtJSCore
@mixin Siesta.Test.ExtJS.Observable
@mixin Siesta.Test.ExtJS.FormField
@mixin Siesta.Test.ExtJS.Component
@mixin Siesta.Test.ExtJS.Element 
@mixin Siesta.Test.ExtJS.Store 

A base class for testing Sencha Touch applications. It inherits from {@link Siesta.Test.Browser} 
and adds various ST specific assertions.

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

*/
Class('Siesta.Test.SenchaTouch', {
    
    isa         : Siesta.Test.Browser,
        
    does        :  [ 
        Siesta.Test.ExtJSCore, 
        Siesta.Test.ExtJS.Component, 
        Siesta.Test.ExtJS.Element, 
        Siesta.Test.ExtJS.Observable, 
        Siesta.Test.ExtJS.Store,
		Siesta.Test.ExtJS.Ajax
    ],
    
    has         : {
        performSetup        : true,
        isSTSetupDone       : false,

        moveCursorBetweenPoints : false
    },
    
    override : {
        
        isReady : function () {
            var result  = this.SUPERARG(arguments);
            var R       = Siesta.Resource('Siesta.Test.SenchaTouch');

            if (!result.ready) return result;

            if (!this.parent && this.performSetup && !this.isSTSetupDone) return {
                ready       : false,
                reason      : R.get('STSetupFailed')
            }
            
            return {
                ready       : true
            }
        },

        
        start : function () {
            var me      = this;
            var Ext     = this.getExt();
            
            if (!Ext) return
            
            // calling SUPER to setup the loader paths, Ext.setup() will already do Ext.require
            this.SUPERARG(arguments)
            
            // execute "Ext.setup()" for top-level tests only 
            if (this.performSetup && !this.parent) Ext.setup({
                onReady : function () {
                    me.isSTSetupDone    = true
                }
            })
        }
    },
    
    methods : {
        // one of these methods feels redundant
        getTouchBundlePath : function() {
            var path;
            var testDescriptor      = this.harness.getScriptDescriptor(this.url)
            
            while (testDescriptor && !path) {
                if (testDescriptor.preload) {
                    Joose.A.each(testDescriptor.preload, function (url) {
                        if (url.match && url.match(/(.*sencha-touch-\d\.\d+\.\d+.*?)\/sencha-touch(.*)\.js/)) {
                            path = url;
                            return false;
                        }
                    });
                }
                testDescriptor = testDescriptor.parent;
            }

            return path;
        },


        getTouchBundleFolder : function() {
            var folder;
            var testDescriptor      = this.harness.getScriptDescriptor(this.url)

            while (testDescriptor && !folder) {
                if (testDescriptor.preload) {
                    Joose.A.each(testDescriptor.preload, function (url) {
                        var regex = /(.*sencha-touch-\d\.\d+\.\d+.*?)\/sencha-touch(.*)\.js/;
                        var match = regex.exec(url);
                
                        if (match) {
                           folder = match[1];
                        }
                    });
                }
                testDescriptor = testDescriptor.parent;
            }

            return folder;
        },
        
        
        getExtBundleFolder : function() {
            var folder;

            this.harness.mainPreset.eachResource(function (resource) {
                var desc = resource.asDescriptor();
                
                var regex = /(.*sencha-touch-\d\.\d+\.\d+.*?)\/sencha-touch-all(?:-debug)?\.js/;
                var match = regex.exec(desc.url);
                
                if (match) {
                   folder = match[1];
                }
            });

            return folder;
        },
        

        /**
        * This method will simulate a finger move to an xy-coordinate or an element (the center of it)
        * 
        * @param {Siesta.Test.ActionTarget} target Target point to move the finger to.
        * @param {Function} callback (optional) To run this method async, provide a callback method to be called after the operation is completed.
        * @param {Object} scope (optional) the scope for the callback
        * @param {Array} offset (optional) An X,Y offset relative to the target. Example: [20, 20] for 20px or ["50%", "50%"] to click in the center.
         */
        moveFingerTo : function(target, callback, scope, offset) {
            this.moveCursorTo.apply(this, arguments);
        },

        /**
        * This method will simulate a finger move from current position relative by the x and y distances provided.
        * 
        * @param {Array} delta The delta offset to move the finger by.
        * @param {Function} callback (optional) To run this method async, provide a callback method to be called after the operation is completed.
        * @param {Object} scope (optional) the scope for the callback
        */
        moveFingerBy : function(delta, callback, scope) {
            if (!delta) {
                var R = Siesta.Resource('Siesta.Test.SenchaTouch');
                throw R.get('moveFingerByInvalidInput');
            }

            this.moveCursorBy.apply(this, arguments);
        },

        
        scrollUntil : function(target, direction, checkerFn, callback, scope) {
            var me          = this,
                startDate   = new Date(),
                dir         = direction;

            var R = Siesta.Resource('Siesta.Test.SenchaTouch');

            // Invert direction, Scroll up => Swipe down
            switch(dir) {
                case 'u':
                case 'up':
                    direction = 'down';
                break;

                case 'd':
                case 'down':
                    direction = 'up';
                break;

                case 'l':
                case 'left':
                    direction = 'right';
                break;

                case 'r':
                case 'right':
                    direction = 'left';
                break;

                default: 
                    throw R.get('invalidSwipeDir') + ': ' + direction;
            }

            var inner = function() {
                if (checkerFn.call(scope || me, target)) {
                    // We're done
                    me.processCallbackFromTest(callback, null, scope || me)
                } else {
                    me.swipe(target, direction, function() { 

                        if (new Date() - startDate < this.waitForTimeout) {
                            var as = me.beginAsync();
                            setTimeout(function() {
                                me.endAsync(as); 
                                inner(); 
                            }, 1000); 
                        } else {
                            me.fail(R.get('scrollUntilFailed'));
                        }
                    });
                }
            };

            inner();
        },

        /**
         * Waits until the supplied x&y scroll property has the passed value. You can test for either x or y, or both.
         *
         * @param {Ext.scroller.Scroller} scrollable The scroller instance
         * @param {String} direction 'up', 'down', 'left' or 'right'
         * @param {Siesta.Test.ActionTarget} actionTarget The target, either an element or a CSS selector normally.
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         */
        scrollUntilElementVisible : function(scrollable, direction, actionTarget, callback, scope) {
            var me = this;

            if (!actionTarget || !scrollable) {
                var R = Siesta.Resource('Siesta.Test.SenchaTouch');
                this.fail(R.get('scrollUntilElementVisibleInvalid'));

                return;
            }

            this.scrollUntil(scrollable, direction, function() {
                var element = me.normalizeElement(actionTarget, true);
                return me.elementIsInView(element);
            },
            callback, scope);
        },

        
        /**
         * Waits until the supplied x&y scroll property has the passed value. You can test for either x or y, or both.
         * 
         * @param {Ext.scroller.Scroller} scroller The scroller instance
         * @param {Object} position An object with an x, y, or x&y values. Ex. { x : 0 } or { x : 0, y : 200 }.
         * @param {Int} value
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForScrollerPosition: function(scroller, pos, callback, scope, timeout) {
            return this.waitFor({
                method          : function() { 
                    return (!('x' in pos) || pos.x === scroller.position.x) && (!('y' in pos) || pos.y === scroller.position.y);
                }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                assertionName   : 'waitForScrollerPosition',
                description     : ' ' + Siesta.Resource('Siesta.Test.SenchaTouch', 'scrollerReachPos') + ' '+ Siesta.Util.Serializer.stringify(pos)
            });
        },

        /**
         * Waits until no ongoing animations can be detected.
         *
         * @param {Function} callback The callback to call after the component becomes visible
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForAnimations: function (callback, scope, timeout) {
            var Ext = this.Ext();

            return this.waitFor({
                method          : function () { return !Ext.AnimationQueue.isRunning; },
                callback        : callback,
                scope           : scope,
                timeout         : timeout,
                assertionName   : 'waitForAnimations',
                description     : Siesta.Resource('Siesta.Test.ExtJS', 'animationsToFinalize')
            });
        }
    }
})
