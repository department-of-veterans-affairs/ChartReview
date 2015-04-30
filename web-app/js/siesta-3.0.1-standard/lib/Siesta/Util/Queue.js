/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Util.Queue', {
    
    has     : {
        // array of Objects, each containing arbitrary data about queue step. Possibly keys:
        // `processor` - an individual processor function for this step
        // can also be provided for whole queue
        // will receive the: (stepData, index, queue)
        // `isAsync` - when provided, the `next` function will be also embedded,
        // which should be called manually
        // `interval` - the delay after step (except for asynchronous)
        steps                   : Joose.I.Array,

        interval                : 100,
        callbackDelay           : 0,
        // setTimeout
        deferer                 : { required : true },
        // clearTimeout - only required when "abort" is planned / possible
        deferClearer            : null,
        
        processor               : null,
        processorScope          : null,
        
        currentTimeout          : null,
        callback                : null,
        scope                   : null,
        isAborted               : false,
        
        observeTest             : null,

        currentDelayStepId      : null,
        
        isDestroyed             : false
    },
    
    
    methods : {
        
        // step is an object with
        // { 
        //      processor : func, 
        //      processorScope : obj,
        //      next : func (in case of async step, will be populated by queue)
        // }
        
        addStep : function (stepData) {
            this.addSyncStep(stepData)
        },
        
        
        addSyncStep : function (stepData) {
            this.steps.push(stepData)
        },
        
        
        addAsyncStep : function (stepData) {
            stepData.isAsync = true
            
            this.steps.push(stepData)
        },

        addDelayStep : function (delayMs) {
            var origSetTimeout = this.deferer;
            var me = this;

            this.addAsyncStep({
                processor : function(data) {
                    me.currentDelayStepId = origSetTimeout(data.next, delayMs || 500);
                }
            });
        },
        
        
        run : function (callback, scope) {
            this.callback   = callback
            this.scope      = scope
            
            // abort the queue, if the provided test instance has finalized (probably because of exception)
            this.observeTest && this.observeTest.on('testfinalize', function () { this.abort(true) }, this, { single : true })
            
            this.doSteps(this.steps.slice(), callback, scope)
        },
        
        
        abort : function (ignoreCallback) {
            if (this.isDestroyed) return
            
            this.isAborted      = true
            
            var deferClearer    = this.deferClearer
            
            if (!deferClearer) throw "Need `deferClearer` to be able to `abort` the queue"

            deferClearer(this.currentDelayStepId);
            deferClearer(this.currentTimeout)
            
            if (!ignoreCallback) this.callback.call(this.scope || this)
            
            this.destroy()
        },
        
        
        doSteps : function (steps, callback, scope) {
            this.currentTimeout = null
            
            var me          = this
            var deferer     = this.deferer
            var step        = steps.shift()
            
            if (this.isAborted) return
            
            if (step) {
                // Normally, the `doSteps` is called recursively for every step in the chain
                // but, steps may complete synchronously, which means, stack will grow
                // since some version, FF has smaller stack size than other browsers
                // and it starts behaving unstable when stack grows
                // because of that, we perform a special check if step has completed synchronously
                // and processing the next step in the same `doStep` context (in the loop), avoiding recursion
                
                // if `doOneStep` has returned `true`, then step has completed synchronously
                // and the flow did not recurse into `doSteps`
                // in this case we continue processing to the next step
                while (this.doOneStep(step, steps, callback, scope) && !this.isAborted) {
                    if (steps.length)
                        step = steps.shift()
                    else {
                        this.doSteps(steps, callback, scope)
                        break;
                    }
                }
            } else {
                if (callback)
                    if (this.callbackDelay)
                        deferer(function () {
                            if (!me.isAborted) { callback.call(scope || this); me.destroy() }
                        }, this.callbackDelay)
                    else {
                        callback.call(scope || this)
                        me.destroy()
                    }
            }
        },
        
        
        doOneStep : function (step, steps, callback, scope) {
            var me              = this
            var deferer         = this.deferer
            
            var processor       = step.processor || this.processor
            var processorScope  = step.processorScope || this.processorScope
            
            var index           = this.steps.length - steps.length - 1
            
            if (!processor) throw new Error("No process function found for step: " + index)
            
            if (step.isAsync) {
                var stepHasCompletedSynchronously   = false
                var processorHasCompleted           = false
                
                var next = step.next = function () {
                    // if at this point `processorHasCompleted` is still `false`, that means that "next" function
                    // has been called before the `processor` function has returned, and thus, step has completed 
                    // synchronously
                    // see the comment in `doSteps` why we treat this case differently
                    if (!processorHasCompleted)
                        stepHasCompletedSynchronously   = true
                    else
                        me.doSteps(steps, callback, scope)
                }
                
                // processor should call `next` to continue
                processor.call(processorScope || me, step, index, this, next)
                
                processorHasCompleted               = true
                
                if (stepHasCompletedSynchronously) return true
            } else {
                processor.call(processorScope || me, step, index, this)
                
                if (this.isAborted) return
                
                var interval = step.interval || me.interval
                
                if (interval) 
                    this.currentTimeout = deferer(function () {
                        me.doSteps(steps, callback, scope)    
                    }, interval)
                else
                    me.doSteps(steps, callback, scope)
            }
        },
        
        
        // help garbage collector to release the memory 
        destroy : function () {
            if (this.isDestroyed) return
            
            this.callback   = this.observeTest      = this.deferer = this.deferClearer = null
            this.processor  = this.processorScope   = null
            
            // cleanup paranoya, this shouldn't matter in general, since "next" here is from the same context
            for (var i = 0; i < this.steps.length; i++) this.steps[ i ].next = null
            this.steps          = null
            
            this.isDestroyed    = true
        }
    }
})
