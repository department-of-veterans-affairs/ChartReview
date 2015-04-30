/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Test.Browser.meta.extend({

    override : {
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * Only useful along with {@link Siesta.Harness.Browser.separateContext separateContext} option 
         * 
         * Wait for the page load to occur and runs the callback. The callback will receive a "window" object.
         * Should be used when you are doing a redirect / refresh of the test page:
         * 
         *      t.waitForPageLoad(function (window) {
         *          ...
         *      })
         * 
         * Note, that method obviously must be called before the new page has completed loading, otherwise it will
         * wait indefinitely and fail (since there will be no page load). So, to avoid the race conditions, one 
         * should always start waiting for page load *before* the action, that causes it. 
         * 
         * Consider the following example (where click on the `>> #loginPanel button` trigger a page redirect):

    // this code does not reliably - it contains a race condition
    // in Chrome, page refresh may happen too fast (even synchronously),
    // so, by the time the `waitForPageLoad` action will start, the page load event will already happen
    // and `waitForPageLoad` will wait indefinitely 
    { click : '>> #loginPanel button' },
    { waitFor : 'PageLoad'}
         * &nbsp;

    // Need to start waiting first, and only then - click
    // we'll use "trigger" config of the `wait` action for that
    {
        waitFor     : 'PageLoad',
        trigger     : {
            click : '>> #loginPanel button'
        }
    }
    // or, same action using function step:
    function (next) {
        t.waitForPageLoad(next)
        
        t.click('>> #loginPanel button', function () {})
    }

         * 
         * @method
         * @member Siesta.Test.Browser 
         */
        waitForPageLoad : function (callback, scope) {
            var me              = this
            
            var global          = this.global
            var unloaded        = false
            
            var onUnloadHandler = function () {
                global.removeEventListener('unload', onUnloadHandler)
                
                unloaded        = true
            }
            
            global.addEventListener('unload', onUnloadHandler)
            
            this.chain(
                { waitFor : function () {
                    return unloaded || me.global.document.readyState != 'complete'
                }},
                function (next) {
                    global.removeEventListener('unload', onUnloadHandler)
                    
                    global          = null
                    onUnloadHandler = null
                    
                    next()
                },
                { waitFor : function () {
                    return me.global.document.readyState == 'complete'
                }},
                { waitFor : 50 },
                function () {
                    callback && me.processCallbackFromTest(callback, [ me.global ], scope || me)
                }
            )
        },
        
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * This method will just call the `setTimeout` method from the scope of the test page.
         * 
         * Usually you don't need to use it - you can just call `setTimeout`, but if your test scripts resides in the
         * separate context, you need to use this method for `setTimeout` functionality. See documentation for {@link Siesta.Harness.Browser#separateContext separateContext}
         * option and <a href="#!/guide/cross_page_testing">Cross page testing</a> guide.
         * 
         * @param {Function} func The function to call after specified `delay`
         * @param {Number} delay The time to wait (in ms) before calling the `func`
         * @return {Number} timeoutId The id of the timeout, can be passed to {@link #clearTimeout} to cancel the function execution.
         * 
         * @method
         * @member Siesta.Test.Browser 
         */
        setTimeout : function (func, delay) {
            var pageSetTimeout = this.global.setTimeout
            
            pageSetTimeout(func, delay)
        },
        
        
        /**
         * **This feature is available only in Standard package**.
         * 
         * This method will just call the `clearTimeout` method from the scope of the test page.
         * 
         * Usually you don't need to use it - you can just call `clearTimeout`, but if your test scripts resides in the
         * separate context, you need to use this method for `clearTimeout` functionality. See documentation for {@link Siesta.Harness.Browser#separateContext separateContext}
         * option and <a href="#!/guide/cross_page_testing">Cross page testing</a> guide.
         * 
         * @param {Number} timeoutId The id of the timeout, recevied from the {@link #setTimeout} call
         * 
         * @method
         * @member Siesta.Test.Browser 
         */
        clearTimeout : function (id) {
            var pageClearTimeout = this.global.clearTimeout
            
            pageClearTimeout(id)
        }
    }
});
