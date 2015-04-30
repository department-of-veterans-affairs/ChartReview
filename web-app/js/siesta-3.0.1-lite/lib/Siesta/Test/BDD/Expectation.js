/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.BDD.Expectation

This class is the central point for writing assertions in BDD style. Instances of this class can be generated with the {@link Siesta.Test#expect expect}
method. Then, calling some method on the instance will create a new assertion in the test.

* **Note**, that to negate any assertion, you can use a special property {@link #not}, that contains an expectation instance with the opposite meaning.

For example:

    t.expect(1).toBe(1)
    t.expect(1).not.toBe(2)
    
    t.expect('Foo').toContain('oo')
    t.expect('Foo').not.toContain('bar')


*/
Class('Siesta.Test.BDD.Expectation', {
    
    does        : [
        Siesta.Util.Role.CanGetType
    ],

    has         : {
        value           : null,
        
        isNot           : false,
        
        /**
         * @property {Siesta.Test.BDD.Expectation} not Another expectation instance with the negated meaning. 
         */
        not             : null,
        
        t               : null
    },
    
    
    methods     : {
        
        initialize : function () {

            if (!this.isNot) this.not = new this.constructor({
                isNot           : true,
                t               : this.t,
                
                value           : this.value
            })
        },
        
        
        process : function (passed, config) {
            var isNot       = this.isNot
            config          = config || {}
            
            config.not      = config.not || isNot ? 'not ' : ''
            config.got      = config.hasOwnProperty('got') ? config.got : this.value
            
            if (config.noGot) delete config.got
            
            var assertionName   = config.assertionName
            
            if (assertionName && isNot) config.assertionName = assertionName.replace(/^(expect\(.+?\)\.)/, '$1not.')
            
            passed          = isNot ? !passed : passed
            
            this.t[ passed ? 'pass' : 'fail' ](null, config)
        },
        
        
        /**
         * This assertion compares the value provided to the {@link Siesta.Test#expect expect} method with the `expectedValue` argument.
         * Comparison is done with `===` operator, so it should be used only with the primitivies - numbers, strings, booleans etc.
         * To deeply compare JSON objects and arrays, use {@link #toEqual} method.
         * 
         * This method works correctly with the placeholders generated with {@link Siesta.Test#any any} method
         * 
         * @param {Primitive} expectedValue An expected value 
         */
        toBe : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.compareObjects(this.value, expectedValue, true, true), {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeText') + ' {need}',
                assertionName       : 'expect(got).toBe(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },
        
        
        /**
         * This assertion compares the value provided to the {@link Siesta.Test#expect expect} method with the `expectedValue` argument.
         * Comparison works for JSON objects and/or arrays, it is performed "deeply". Right now the values should not contain cyclic references.
         * 
         * This method works correctly with the placeholders generated with {@link Siesta.Test#any any} method
         * 
         * @param {Mixed} expectedValue An expected value 
         */
        toEqual : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.compareObjects(this.value, expectedValue, true), {
                descTpl             : R.get('expectText') +' {got} {!not}' + R.get('toBeEqualToText') + ' {need}',
                assertionName       : 'expect(got).toEqual(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is `null`.
         */
        toBeNull : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.compareObjects(this.value, null, true, true), {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeText') + ' null',
                assertionName       : 'expect(got).toBeNull()',
                need                : null,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is `NaN`.
         */
        toBeNaN : function () {
            var value   = this.value
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.typeOf(value) == 'Number' && value != value, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeText') + ' NaN',
                assertionName       : 'expect(got).toBeNaN()',
                need                : NaN,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },

        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is not the `undefined` value.
         */
        toBeDefined : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value !== undefined, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeDefinedText'),
                assertionName       : 'expect(got).toBeDefined()'
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is the `undefined` value.
         */
        toBeUndefined : function (value) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value === undefined, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeUndefinedText'),
                assertionName       : 'expect(got).toBeUndefined()'
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is "truthy" - evaluates to `true`.
         * For example - non empty strings, numbers except the 0, objects, arrays etc.
         */
        toBeTruthy : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeTruthyText'),
                assertionName       : 'expect(got).toBeTruthy()'
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is "falsy" - evaluates to `false`.
         * For example - empty strings, number 0, `null`, `undefined`, etc.
         */
        toBeFalsy : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(!this.value, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeFalsyText'),
                assertionName       : 'expect(got).toBeFalsy()'
            })
        },
        
        
        /**
         * This assertion passes, when the string provided to the {@link Siesta.Test#expect expect} method matches the regular expression.
         * 
         * @param {RegExp} regexp The regular expression to match the string against
         */
        toMatch : function (regexp) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (this.t.typeOf(regexp) != 'RegExp') throw new Error("`expect().toMatch()` matcher expects a regular expression")
            
            this.process(new RegExp(regexp).test(this.value), {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toMatchText') + ' {need}',
                assertionName       : 'expect(got).toMatch(need)',
                need                : regexp,
                needDesc            : this.isNot ? R.get('needNotMatchingText') : R.get('needMatchingText')
            })
        },
        
        
        /**
         * This assertion passes in 2 cases:
         * 
         * 1) When the value provided to the {@link Siesta.Test#expect expect} method is a string, and it contains a passed substring.
         * 2) When the value provided to the {@link Siesta.Test#expect expect} method is an array (or array-like), and it contains a passed element.
         * 
         * @param {String/Mixed} element The element of the array or a sub-string
         */
        toContain : function (element) {
            var value       = this.value
            var t           = this.t
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            var passed      = false

            if (t.typeOf(value) == 'String') {
                this.process(value.indexOf(element) >= 0, {
                    descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toContainText') + ' {need}',
                    assertionName       : 'expect(got).toContain(need)',
                    need                : element,
                    needDesc            : this.isNot ? R.get('needStringNotContainingText') : R.get('needStringContainingText')
                })
            } else {
                // Normalize to allow NodeList, Arguments etc.
                value = Array.prototype.slice.call(value);

                for (var i = 0; i < value.length; i++)
                    if (t.compareObjects(element, value[ i ], true)) {
                        passed      = true
                        break
                    }

                this.process(passed, {
                    descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toContainText') + ' {need}',
                    assertionName       : 'expect(got).toContain(need)',
                    need                : element,
                    needDesc            : this.isNot ? R.get('needArrayNotContainingText') : R.get('needArrayContainingText')
                })

            }
        },
        
        
        /**
         * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is less than the
         * expected number.
         * 
         * @param {Number} expectedValue The number to compare with
         */
        toBeLessThan : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value < expectedValue, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeLessThanText') + ' {need}',
                assertionName       : 'expect(got).toBeLessThan(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needGreaterEqualThanText') : R.get('needLessThanText')
            })
        },
        
        
        /**
         * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is greater than the
         * expected number.
         * 
         * @param {Number} expectedValue The number to compare with
         */
        toBeGreaterThan : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value > expectedValue, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeGreaterThanText') + ' {need}',
                assertionName       : 'expect(got).toBeGreaterThan(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needLessEqualThanText') : R.get('needGreaterThanText')
            })
        },
        
        
        /**
         * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is approximately equal
         * the given number. The proximity can be defined as the `precision` argument  
         * 
         * @param {Number} expectedValue The number to compare with
         * @param {Number} [precision=2] The number of digits after dot (comma) that should be same in both numbers.
         */
        toBeCloseTo : function (expectedValue, precision) {
            precision       = precision != null ? precision : 2
            
            // not sure why we divide the precision by 2, but jasmine does that for some reason
            var threshold   = Math.pow(10, -precision) / 2
            var delta       = Math.abs(this.value - expectedValue)
            var R           = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(delta < threshold, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeCloseToText') +' {need}',
                assertionName       : 'expect(got).toBeCloseTo(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needValueNotCloseToText') : R.get('needValueCloseToText'),
                annotation          : delta ? R.get('thresholdIsText') + threshold : R.get('exactMatchText')
            })        
        },
        
        
        /**
         * This assertion passes when the function, provided to the {@link Siesta.Test#expect expect} method, throws any exception
         * during its execution.
         */
        toThrow : function () {
            var func    = this.value
            var t       = this.t
            var R       = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (t.typeOf(func) != 'Function') throw new Error("`expect().toMatch()` matcher expects a function")
            
            var e       = t.getExceptionCatcher()(func)
            
            if (e instanceof t.getTestErrorClass())
                //IE uses non-standard 'description' property for error msg
                e = e.message || e.description
                
            this.process(e !== undefined, {
                descTpl             : R.get('expectText') + ' function {!not}' + R.get('toThrowText'),
                assertionName       : 'expect(func).toThrow()',
                annotation          : e ? (R.get('thrownExceptionText') + ': ' + Siesta.Util.Serializer.stringify(e)) : R.get('noExceptionThrownText'),
                
                noGot               : true
            })
        },
        
        
        /**
         * This assertion passes, if a spy, provided to the {@link Siesta.Test#expect expect} method have been 
         * called expected number of times. The expected number of times can be provided as the 1st argument and by default
         * is 1.
         * 
         * One can also provide the function, spied on, to the {@link Siesta.Test#expect expect} method.
         * 
         * Examples:
         * 
    var spy = t.spyOn(obj, 'process')
    
    // call the method 2 times
    obj.process()
    obj.process()

    // following 2 calls are equivalent
    t.expect(spy).toHaveBeenCalled();
    t.expect(obj.process).toHaveBeenCalled();
    
    // one can also use exact number of calls or comparison operators
    t.expect(obj.process).toHaveBeenCalled(2);
    t.expect(obj.process).toHaveBeenCalled('>1');
    t.expect(obj.process).toHaveBeenCalled('<3');

         * 
         * See also {@link #toHaveBeenCalledWith}
         * 
         * @param {Number/String} expectedNumber Expected number of calls. Can be either a number, specifying the exact
         * number of calls, or a string. In the latter case one can include a comparison operator in front of the number.
         * 
         */
        toHaveBeenCalled : function (expectedNumber) {
            expectedNumber  = expectedNumber != null ? expectedNumber : '>=1'
            
            var spy         = this.value
            var t           = this.t
            var R           = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (this.typeOf(spy) == 'Function') {
                if (!spy.__SIESTA_SPY__) throw new Error(R.get('wrongSpy'))
                
                spy         = spy.__SIESTA_SPY__
            }
            
            if (!(spy instanceof Siesta.Test.BDD.Spy)) throw new Error(R.get('wrongSpy'))
            
            this.process(t.verifyExpectedNumber(spy.callsLog.length, expectedNumber), {
                descTpl             : R.get('toHaveBeenCalledDescTpl'),
                assertionName       : 'expect(func).toHaveBeenCalled()',
                methodName          : spy.propertyName,
                got                 : spy.callsLog.length,
                gotDesc             : R.get('actualNbrOfCalls'),
                need                : expectedNumber,
                needDesc            : R.get('expectedNbrOfCalls')
            })
        },
        
        
        /**
         * This assertion passes, if a spy, provided to the {@link Siesta.Test#expect expect} method have been 
         * called at least once with the specified arguments. 
         * 
         * One can also provide the function, spied on, to the {@link Siesta.Test#expect expect} method.
         * 
         * One can use placeholders, generated with the {@link Siesta.Test.BDD#any any} method to verify the arguments.
         * 
         * Example:
         * 

    var spy = t.spyOn(obj, 'process')
    
    // call the method 2 times with different arguments
    obj.build('development', '1.0.0')
    obj.build('release', '1.0.1')

    t.expect(spy).toHaveBeenCalledWith('development', '1.0.0');
    // or
    t.expect(obj.process).toHaveBeenCalledWith('development', t.any(String));

         * 
         * See also {@link #toHaveBeenCalled}
         * 
         * @param {Object} arg1 Argument to a call
         * @param {Object} arg2 Argument to a call
         * @param {Object} argN Argument to a call
         */
        toHaveBeenCalledWith : function () {
            var spy         = this.value
            var t           = this.t
            var R           = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (this.typeOf(spy) == 'Function') {
                if (!spy.__SIESTA_SPY__) throw new Error(R.get('wrongSpy'))
                
                spy         = spy.__SIESTA_SPY__
            }
            
            if (!(spy instanceof Siesta.Test.BDD.Spy)) throw new Error(R.get('wrongSpy'))
            
            var args                        = Array.prototype.slice.call(arguments)
            var foundCallWithMatchingArgs   = false
            
            Joose.A.each(spy.callsLog, function (call) {
                if (t.compareObjects(call.args, args)) { foundCallWithMatchingArgs = true; return false }
            })
            
            this.process(foundCallWithMatchingArgs, {
                descTpl             : R.get('toHaveBeenCalledWithDescTpl'),
                assertionName       : 'expect(func).toHaveBeenCalledWith()',
                methodName          : spy.propertyName,
                noGot               : true
            })
        }
    }
})
