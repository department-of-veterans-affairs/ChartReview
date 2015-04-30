/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Test.Action.MethodCall
@extends Siesta.Test.Action

This action allows you to call any method of the test class. You can add it to the `chain` method by providing a property in the config object,
which corresponds to some method of the test class. The value of this property should contain arguments for the method call (see {@link #args}).

    t.chain(
        function (next) {
            t.someMethodCall('arg1', 'arg2', next)
        },
        // or
        {
            someMethodCall  : [ 'arg1', 'arg2' ]
        },
        ...
        {
            waitForSelector : '.selector'
        }
    )
    

*/
Class('Siesta.Test.Action.MethodCall', {
    
    isa         : Siesta.Test.Action,
    
    has : {
        /**
         * @cfg {String} methodName
         *
         * A name of the method to call.
         */
        methodName      : null,
        
        /**
         * @cfg {Array/Function/Object} args
         *
         * Arguments for the method call. Usually should be an array. 
         * 
         * If its a function, then the function will be called at the action execution time and result from the 
         * action will be treated as `args`. The only exception is the "waitForFn" method, for which the supplied function
         * will be treated as the 1st argument for the "waitForFn" method. 
         * 
         * Anything else will be converted to a single element array. 
         * 
         * The callback will be added as the last argument (after resolving this config), unless the {@link #callbackIndex} is specified.
         */
        args            : null,
        
        /**
         * @cfg {Number} callbackIndex An index in the {@link #args} array where the callback should be inserted. 
         */
        callbackIndex   : null
    },

    
    methods : {
        
        process : function () {
            var test            = this.test
            var methodName      = this.methodName
            var args            = this.args
            
            if (test.typeOf(args) == 'Function') args  = args.call(test, this)
            
            if (test.typeOf(args) != 'Array') args = [ args ]
            
            if (this.callbackIndex != null) 
                args.splice(this.callbackIndex, 0, this.next)
            else
                args.push(this.next)
            
            test[ methodName ].apply(test, args)
        }
    }
});

Siesta.Test.ActionRegistry().registerAction('methodCall', Siesta.Test.Action.MethodCall)
