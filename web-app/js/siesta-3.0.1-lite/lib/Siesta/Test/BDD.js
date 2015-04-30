/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.BDD

A mixin providing a BDD style layer for most of the assertion methods.
It is consumed by {@link Siesta.Test}, so all of its methods are available in all tests. 

*/
Role('Siesta.Test.BDD', {
    
    requires    : [
        'getSubTest', 'chain'
    ],
    
    has         : {
        specType                : null, // `describe` or `it`
        
        beforeEachHooks         : Joose.I.Array,
        afterEachHooks          : Joose.I.Array,
        
        sequentialSubTests      : Joose.I.Array,
        
        // flag, whether the "run" function of the test (containing actual test code) have been already run
        codeProcessed           : false,
        
        launchTimeout           : null,
        
        // Siesta.Test.BDD.Expectation should already present on the page
        expectationClass        : Siesta.Test.BDD.Expectation,
        
        failOnExclusiveSpecsWhenAutomated   : false,
        
        spies                   : Joose.I.Array
    },
    
    
    methods     : {
        
        checkSpecFunction : function (func, type, name) {
            if (!func)          throw new Error(Siesta.Resource('Siesta.Test.BDD', 'codeBodyMissing') + " " + (type == 'describe' ? 'suite' : 'spec') + ' [' + name + ']')
            if (!func.length)   throw new Error(Siesta.Resource('Siesta.Test.BDD', 'codeBodyOf') + " " + (type == 'describe' ? 'suite' : 'spec') + ' [' + name + '] ' + Siesta.Resource('Siesta.Test.BDD', 'missingFirstArg'))
        },
        
        
        /**
         * This is an "exclusive" version of the regular {@link #describe} suite. When such suites presents in some test file,
         * the other regular suites at the same level will not be executed, only "exclusive" ones.
         * 
         * @param {String} name The name or description of the suite
         * @param {Function} code The code function for this suite. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this suite. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        ddescribe : function (name, code, timeout) {
            this.describe(name, code, timeout, true)
        },
        
        
        /**
         * This is a no-op method, allowing you to quickly ignore some suites. 
         */
        xdescribe : function () {
        },
        
        
        /**
         * This method starts a sub test with *suite* (in BDD terms). Such suite consists from one or more *specs* (see method {@link #it}} or other suites.
         * The number of nesting levels is not limited. All suites of the same nesting level are executed sequentially. 
         * 
         * For example:
         * 
    t.describe('A product', function (t) {
    
        t.it('should have feature X', function (t) {
            ...
        })
        
        t.describe('feature X', function (t) {
            t.it('should be cool', function (t) {
                ...
            })
        })
    })
         *
         * See also {@link #beforeEach}, {@link #afterEach}, {@link #xdescribe}, {@link #ddescribe}
         * 
         * @param {String} name The name or description of the suite
         * @param {Function} code The code function for this suite. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this suite. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        describe : function (name, code, timeout, isExclusive) {
            this.checkSpecFunction(code, 'describe', name)
            
            var subTest     = this.getSubTest({
                name            : name,
                run             : code,
                
                isExclusive     : isExclusive,
                
                specType        : 'describe',
                timeout         : timeout
            })
            
            if (this.codeProcessed) this.scheduleSpecsLaunch()
            
            this.sequentialSubTests.push(subTest)
        },
        
        
        /**
         * This is an "exclusive" version of the regular {@link #it} spec. When such specs presents in some suite,
         * the other regular specs at the same level will not be executed, only "exclusive" ones. Note, that even "regular" suites (`t.describe`) sections
         * will be ignored, if they are on the same level with the exclusive `iit` section.
         * 
         * @param {String} name The name or description of the spec
         * @param {Function} code The code function for this spec. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this spec. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        iit : function (name, code, timeout) {
            if (this.harness.isAutomated) {
                if (this.failOnExclusiveSpecsWhenAutomated) this.fail(Siesta.Resource('Siesta.Test.BDD', 'iitFound'));
            }
            this.it(name, code, timeout, true)
        },
        
        
        /**
         * This is a no-op method, allowing you to quickly ignore some specs. 
         */
        xit : function () {
        },
        
        
        /**
         * This method starts a sub test with *spec* (in BDD terms). Such spec consists from one or more assertions (or *expectations*, *matchers*, etc) or other nested specs
         * and/or suites. See the {@link #expect} method. The number of nesting levels is not limited. All specs of the same nesting level are executed sequentially. 
         * 
         * For example:
         * 
    t.describe('A product', function (t) {
    
        t.it('should have feature X', function (t) {
            ...
        })
        
        t.it('should have feature Y', function (t) {
            ...
        })
    })
         *
         * See also {@link #beforeEach}, {@link #afterEach}, {@link #xit}, {@link #iit}
         * 
         * @param {String} name The name or description of the spec
         * @param {Function} code The code function for this spec. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this spec. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        it : function (name, code, timeout, isExclusive) {
            this.checkSpecFunction(code, 'it', name)
            
            var subTest     = this.getSubTest({
                name            : name,
                run             : code,
                
                isExclusive     : isExclusive,
                
                specType        : 'it',
                timeout         : timeout
            })
            
            if (this.codeProcessed) this.scheduleSpecsLaunch()
            
            this.sequentialSubTests.push(subTest)
        },
        
        
        /**
         * This method returns an "expectation" instance, which can be used to check various assertions about the passed value.
         * 
         * **Note**, that every expectation has a special property `not`, that contains another expectation, but with the negated meaning.
         * 
         * For example:
         * 

    t.expect(1).toBe(1)
    t.expect(1).not.toBe(2)
    
    t.expect('Foo').toContain('oo')
    t.expect('Foo').not.toContain('bar')
 
 
         * Please refer to the documentation of the {@link Siesta.Test.BDD.Expectation} class for the list of available methods.
         * 
         * @param {Mixed} value Any value, that will be assert about
         * @return {Siesta.Test.BDD.Expectation} Expectation instance
         */
        expect : function (value) {
            return new this.expectationClass({
                t           : this,
                value       : value
            })
        },
        
        
        /**
         * This method returns a *placeholder*, denoting any instance of the provided class constructor. Such placeholder can be used in various
         * comparison assertions, like {@link #is}, {@link #isDeeply}, {@link Siesta.Test.BDD.Expectation#toBe expect().toBe()}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toEqual()} and so on.
         * 
         * For example:

    t.is(1, t.any(Number))
    
    t.expect(1).toBe(t.any(Number))
    
    t.isDeeply({ name : 'John', age : 45 }, { name : 'John', age : t.any(Number))
    
    t.expect({ name : 'John', age : 45 }).toEqual({ name : 'John', age : t.any(Number))
    
    t.is(NaN, t.any(), 'When class constructor is not provided `t.any()` should match anything')

         * 
         * See also {@link #anyNumberApprox}, {@link #anyStringLike}.
         * 
         * @param {Function} clsConstructor A class constructor instances of which are denoted with this placeholder. As a special case if this argument
         * is not provided, a placeholder will match any value. 
         * 
         * @return {Object} A placeholder object
         */
        any : function (clsConstructor) {
            return new Siesta.Test.BDD.Placeholder({
                clsConstructor      : clsConstructor,
                t                   : this,
                context             : this.global
            })
        },
        
        /**
         * This method returns a *placeholder*, denoting any number approximately equal to the provided value. 
         * Such placeholder can be used in various comparison assertions, like {@link #is}, {@link #isDeeply}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toBe()}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toEqual()} and so on.
         * 
         * For example:

    t.is(1, t.anyNumberApprox(1.2, 0.5))
    
    t.expect(1).toBe(t.anyNumberApprox(1.2, 0.5))
    
         * 
         * @param {Number} value The approximate value
         * @param {Number} [threshold] The threshold. If omitted, it is set to 5% from the `value`.
         *  
         * @return {Object} A placeholder object
         */
        anyNumberApprox : function (value, threshold) {
            return new Siesta.Test.BDD.NumberPlaceholder({
                value               : value,
                threshold           : threshold
            })
        },
        
        
        /**
         * This method returns a *placeholder*, denoting any string that matches provided value. 
         * Such placeholder can be used in various comparison assertions, like {@link #is}, {@link #isDeeply},
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toBe()}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toEqual()} and so on.
         * 
         * For example:

    t.is('foo', t.anyStringLike('oo'))
    
    t.expect('bar').toBe(t.anyStringLike(/ar$/))
    
         * 
         * @param {String/RegExp} value If given as string will denote a substring a string being checked should contain,
         * if given as RegExp instance then string being checked should match this RegExp
         *  
         * @return {Object} A placeholder object
         */
        anyStringLike : function (value) {
            return new Siesta.Test.BDD.StringPlaceholder({ value : value })
        },
        
        
        scheduleSpecsLaunch : function () {
            if (this.launchTimeout) return
            
            var async                   = this.beginAsync()
            var originalSetTimeout      = this.originalSetTimeout
            var me                      = this
            
            this.launchTimeout          = originalSetTimeout(function () {
                me.endAsync(async)
                me.launchTimeout        = null
                
                me.launchSpecs()
            }, 0)
        },
        
        
        runBeforeSpecHooks : function (done) {
            var me          = this
            
            var runOwnHooks = function (done) {
                me.chainForArray(me.beforeEachHooks, function (hook) {
                    return hook.isAsync ? hook.code : function (next) {
                        hook.code()
                        next()
                    }
                }, done)                    
            }
            
            if (this.parent)
                this.parent.runBeforeSpecHooks(function () {
                    runOwnHooks(done)
                })
            else
                runOwnHooks(done)
        },
                
            
        runAfterSpecHooks : function (done) {
            var me      = this
            
            me.chainForArray(
                this.afterEachHooks, function (hook) {
                    return hook.isAsync ? hook.code : function (next) {
                        hook.code()
                        next()
                    }
                }, function () {
                    me.parent ? me.parent.runAfterSpecHooks(done) : done()
                },
                // reverse
                true
            )
        },
        
        
        launchSpecs : function () {
            var me                  = this
            var sequentialSubTests  = this.sequentialSubTests
            
            this.sequentialSubTests = []
            
            // hackish way to pass a config to `t.chain`
            this.chain.actionDelay  = 0
            
            var exclusiveSubTests   = []
            
            Joose.A.each(sequentialSubTests, function (subTest) {
                if (subTest.isExclusive) exclusiveSubTests.push(subTest)
            })
            
            this.chainForArray(exclusiveSubTests.length ? exclusiveSubTests : sequentialSubTests, function (subTest) {
                return [
                    subTest.specType == 'it' ? function (next) { me.runBeforeSpecHooks(next) } : null,
                    subTest,
                    subTest.specType == 'it' ? function (next) { me.runAfterSpecHooks(next) } : null
                ]
            })
        },
        
        
        /**
         * This method allows you to execute some "setup" code before every spec of the current test. Note, that specs can be nested
         * and all `beforeEach` methods are executed in order, starting from the most-nested one.
         * 
         * By default the setup code is supposed to be synchronous, but you can change it with the `isAsync` argument. 
         * This method can be called several times, providing several "setup" functions. Note, that `beforeEach` code is not
         * executed for the sub-tests generated with the {@link Siesta.Test#getSubTest getSubTest} method.
         * 
         * For example:

    StartTest(function (t) {
        var baz     = 0
        
        t.beforeEach(function () {
            baz     = 0
        })
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         * 
         * @param {Function} code A function to execute before every spec
         * @param {Function} code.next A callback to call when the `beforeEach` method completes. This argument is only provided
         * when the `isAsync` argument is passed as `true`
         * @param {Boolean} isAsync When passed as `true` this argument makes the `beforeEach` method asynchronous. In this case,
         * the `code` function will receive a callback argument, which should be called once the method has completed it's work. 
         * Note, that `beforeEach` method should complete within {@link Siesta.Test#defaultTimeout defaultTimeout} time, otherwise
         * failing assertion will be added to the test. 
         * 
         * Example:

    StartTest(function (t) {
        var baz     = 0
    
        // asynchronous setup code
        t.beforeEach(function (next) {
            
            // `beforeEach` will complete in 100ms 
            setTimeout(function () {
                baz     = 0
                next()
            }, 100)
        }, true)
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         */
        beforeEach : function (code, isAsync) {
            this.beforeEachHooks.push({ code : code, isAsync : isAsync })
        },
        
        
        /**
         * This method allows you to execute some "tear down" code after every spec of the current test. Note, that specs can be nested
         * and all `afterEach` methods are executed in order, starting from the most-nested one.
         * 
         * By default the tear down code is supposed to be synchronous, but you can change it with the `isAsync` argument. 
         * This method can be called several times, providing several "tear down" functions. Note, that `afterEach` code is not
         * executed for the sub-tests generated with the {@link Siesta.Test#getSubTest getSubTest} method.
         * 
         * For example:

    StartTest(function (t) {
        var baz     = 0
        
        t.afterEach(function () {
            baz     = 0
        })
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         * 
         * @param {Function} code A function to execute after every spec
         * @param {Function} code.next A callback to call when the `afterEach` method completes. This argument is only provided
         * when the `isAsync` argument is passed as `true`
         * @param {Boolean} isAsync When passed as `true` this argument makes the `afterEach` method asynchronous. In this case,
         * the `code` function will receive a callback argument, which should be called once the method has completed it's work. 
         * Note, that `afterEach` method should complete within {@link Siesta.Test#defaultTimeout defaultTimeout} time, otherwise
         * failing assertion will be added to the test. 
         * 
         * Example:

    StartTest(function (t) {
        var baz     = 0
    
        // asynchronous setup code
        t.afterEach(function (next) {
            
            // `afterEach` will complete in 100ms 
            setTimeout(function () {
                baz     = 0
                next()
            }, 100)
        }, true)
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         */
        afterEach : function (code, isAsync) {
            this.afterEachHooks.push({ code : code, isAsync : isAsync })
        },
        

        /**
         * This method installs a "spy" instead of normal function in some object. The "spy" is basically another function,
         * which tracks the calls to itself. With spies, one can verify that some function was called and that
         * it was called with certain arguments.
         * 
         * Note, that by default, spy will not call the original method. To enable that, use {@link Siesta.Test.BDD.Spy#callThrough} method.
         * 

    var spy = t.spyOn(obj, 'process')
    // or, if you need to call the original 'process' method
    var spy = t.spyOn(obj, 'process').and.callThrough()
    
    // call the method
    obj.process('fast', 1)

    t.expect(spy).toHaveBeenCalled();
    t.expect(spy).toHaveBeenCalledWith('fast', 1);

         *
         * See also {@link #createSpy}, {@link #createSpyObj}, {@link Siesta.Test.BDD.Expectation#toHaveBeenCalled toHaveBeenCalled}, 
         * {@link Siesta.Test.BDD.Expectation#toHaveBeenCalledWith toHaveBeenCalledWith}
         * 
         * See also the {@link Siesta.Test.BDD.Spy} class for additional details.
         * 
         * @param {Object} object An object which property is being spied
         * @param {String} propertyName A name of the property over which to install the spy. 
         * 
         * @return {Siesta.Test.BDD.Spy} spy Created spy instance
         */
        spyOn : function (object, propertyName) {
            var R       = Siesta.Resource('Siesta.Test.BDD')
            
            if (!object) { this.warn(R.get('noObject')); return; }
            
            return new Siesta.Test.BDD.Spy({
                name            : propertyName,
                
                t               : this,
                hostObject      : object,
                propertyName    : propertyName
            })
        },
        
        /**
         * This method create a standalone spy function, which tracks all calls to it. Tracking is done using the associated 
         * spy instance, which is available as `and` property. One can use the {@link Siesta.Test.BDD.Spy} class API to
         * verify the calls to the spy function.
         * 
         * Example:

    var spyFunc     = t.createSpy('onadd listener')
    
    myObservable.addEventListener('add', spyFunc)
    
    // do something that triggers the `add` event on the `myObservable`

    t.expect(spyFunc).toHaveBeenCalled()
    
    t.expect(spyFunc.calls.argsFor(1)).toEqual([ 'Arg1', 'Arg2' ])
    
         * 
         * See also: {@link #spyOn}
         * 
         * @param {String} [spyName='James Bond'] A name of the spy for debugging purposes
         * 
         * @return {Function} Created function. The associated spy instance is assigned to it as the `and` property 
         */
        createSpy : function (spyName) {
            return (new Siesta.Test.BDD.Spy({
                name            : spyName || 'James Bond',
                t               : this
            })).getProcessor()
        },
        
        
        /**
         * This method creates an object, which properties are spy functions. Such object can later be used as a mockup.
         * 
         * This method can be called with one argument only, which should be an array of properties.
         * 
         * Example:

    var mockup      = t.createSpyObj('encoder-mockup', [ 'encode', 'decode' ])
    // or just
    var mockup      = t.createSpyObj([ 'encode', 'decode' ])
    
    mockup.encode('string')
    mockup.decode('string')
    
    t.expect(mockup.encode).toHaveBeenCalled()
    

         * 
         * See also: {@link #createSpy}
         * 
         * @param {String} spyName A name of the spy object. Can be omitted.
         * @param {Array[String]} properties An array of the property names. For each property name a spy function will be created.
         * 
         * @return {Object} A mockup object
         */
        createSpyObj : function (spyName, properties) {
            if (arguments.length == 1) { properties = spyName; spyName = null }
            
            spyName     = spyName || 'spyObject'
            
            var me      = this
            var obj     = {}
            
            Joose.A.each(properties, function (propertyName) {
                obj[ propertyName ] = me.createSpy(spyName) 
            })
            
            return obj
        }
    },
    
    
    override : {
        onTestFinalize : function () {
            Joose.A.each(this.spies, function (spy) { spy.remove() })
            
            this.spies  = null
            
            this.SUPER()
        },
        
        
        afterLaunch : function () {
            this.codeProcessed      = true
            
            this.launchSpecs()
            
            this.SUPERARG(arguments)
        }
    }
        
})
//eof Siesta.Test.BDD
