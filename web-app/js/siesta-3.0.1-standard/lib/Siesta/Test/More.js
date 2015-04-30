/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.More

A mixin with additional generic assertion methods, which can work cross-platform between browsers and NodeJS. 
Is being consumed by {@link Siesta.Test}, so all of them are available in all tests. 

*/
Role('Siesta.Test.More', {
    
    requires        : [ 'isFailed', 'typeOf', 'on' ],
    
    
    has : {
        autoCheckGlobals        : false,
        expectedGlobals         : Joose.I.Array,

        disableGlobalsCheck     : false,
        
        browserGlobals : { 
            init : [
                'console',
                'getInterface',
                'ExtBox1',
                '__IE_DEVTOOLBAR_CONSOLE_COMMAND_LINE',
                /__BROWSERTOOLS/, // IE11 with console open
                'seleniumAlert',
                '_phantom', // phantomJS
                'callPhantom', // phantomJS
                'onload',
                'onerror', 
                'StartTest',
                'startTest',
                '__loaderInstrumentationHookInstalled__',
                'describe',
                // will be reported in IE8 after overriding
                'setTimeout',
                'clearTimeout',
                'requestAnimationFrame',
                'cancelAnimationFrame',
                '__coverage__',
                /__cov_\d+/
            ]
        },
        
        /**
         * @cfg {Number} waitForTimeout Default timeout for `waitFor` (in milliseconds). Default value is 10000. 
         */
        waitForTimeout          : 10000,
        
        waitForPollInterval     : 100
    },
    
    
    methods : {
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `>` operator will return `true` and fails otherwise. 
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isGreater : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 > value2)
                this.pass(desc, {
                    descTpl             : R.get('isGreaterPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isGreater',
                    
                    got                 : value1,
                    need                : value2,
                    
                    needDesc            : R.get('needGreaterThan')
                })
        },
        
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `<` operator will return `true` and fails otherwise. 
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isLess : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 < value2)
                this.pass(desc, {
                    descTpl             : R.get('isLessPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isLess',
                    
                    got                 : value1,
                    need                : value2,
                    
                    needDesc            : R.get('needLessThan')
                })
        },
        

        isGE : function () {
            this.isGreaterOrEqual.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `>=` operator will return `true` and fails otherwise. 
         * 
         * It has a synonym - `isGE`.
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isGreaterOrEqual : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 >= value2)
                this.pass(desc, {
                    descTpl             : R.get('isGreaterEqualPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isGreaterOrEqual',
                    
                    got                 : value1,
                    need                : value2,

                    needDesc            : R.get('needGreaterEqualTo')
                })
        },
        

        
        isLE : function () {
            this.isLessOrEqual.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `<=` operator will return `true` and fails otherwise. 
         * 
         * It has a synonym - `isLE`.
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isLessOrEqual : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 <= value2)
                this.pass(desc, {
                    descTpl             : R.get('isLessEqualPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isLessOrEqual',
                    
                    got                 : value1,
                    need                : value2,

                    needDesc            : R.get('needLessEqualTo')
                })
        },
        
        
        /**
         * This assertion suppose to compare the numeric values. It passes when the passed values are approximately the same (the difference 
         * is withing a threshold). A threshold can be provided explicitly (when assertion is called with 4 arguments), 
         * or it will be set to 5% from the 1st value (when calling assertion with 3 arguments).
         * 
         * @param {Number} value1 The 1st value to compare
         * @param {Number} value2 The 2nd value to compare
         * @param {Number} threshHold The maximum allowed difference between values. This argument can be omited. 
         * @param {String} desc The description of the assertion
         */
        isApprox : function (value1, value2, threshHold, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (arguments.length == 2) threshHold  = Math.abs(value1 * 0.05)
            
            if (arguments.length == 3) {
                if (this.typeOf(threshHold) == 'String') {
                    desc            = threshHold
                    threshHold      = Math.abs(value1 * 0.05)
                }
            }
            
            // this function normalizes the fractional numbers to fixed point presentation
            // for example in JS: 1.05 - 1 = 0.050000000000000044
            // so what we do is: (1.05 * 10^2 - 1 * 10^2) / 10^2 = (105 - 100) / 100 = 0.05
            var subtract    = function (value1, value2) {
                var fractionalLength    = function (v) {
                    var afterPointPart = (v + '').split('.')[ 1 ]
                    
                    return afterPointPart && afterPointPart.length || 0
                }
                
                var maxLength           = Math.max(fractionalLength(value1), fractionalLength(value2))
                var k                   = Math.pow(10, maxLength);

                return (value1 * k - value2 * k) / k;
            };            
            
            if (Math.abs(subtract(value2, value1)) <= threshHold)
                this.pass(desc, {
                    descTpl             : R.get('isApproxToPassTpl'),
                    value1              : value1,
                    value2              : value2,
                    annotation          : value2 == value1 ? R.get('exactMatch') : (R.get('withinThreshold') + ': ' + threshHold)
                })
            else
                this.fail(desc, {
                    assertionName       : 'isApprox', 
                    got                 : value1, 
                    need                : value2, 
                    needDesc            : R.get('needApprox'),
                    annotation          : R.get('thresholdIs') + ': ' + threshHold
                })
        },
        
        
        /**
         * This assertion passes when the passed `string` matches to a regular expression `regex`. When `regex` is a string, 
         * assertion will check that it is a substring of `string`
         * 
         * @param {String} string The string to check for "likeness"
         * @param {String/RegExp} regex The regex against which to test the string, can be also a plain string
         * @param {String} desc The description of the assertion
         */
        like : function (string, regex, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(regex) == "RegExp")
            
                if (string.match(regex))
                    this.pass(desc, {
                        descTpl             : R.get('stringMatchesRe'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'like', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringMatching')
                    })
            else
             
                if (string.indexOf(regex) != -1)
                    this.pass(desc, {
                        descTpl             : R.get('stringHasSubstring'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'like', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringContaining')
                    })
        },
        
        /**
         * This method is the opposite of 'like', it adds failed assertion, when the string matches the passed regex.
         * 
         * @param {String} string The string to check for "unlikeness"
         * @param {String/RegExp} regex The regex against which to test the string, can be also a plain string
         * @param {String} desc The description of the assertion
         */
        unlike : function(string, regex, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(regex) == "RegExp")
            
                if (!string.match(regex))
                    this.pass(desc, {
                        descTpl             : R.get('stringNotMatchesRe'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'unlike', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringNotMatching')
                    })
            else
             
                if (string.indexOf(regex) == -1)
                    this.pass(desc, {
                        descTpl             : R.get('stringHasNoSubstring'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'unlike', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringNotContaining')
                    })
        },
        
        
        "throws" : function () {
            this.throwsOk.apply(this, arguments)
        },
        
        throws_ok : function () {
            this.throwsOk.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the `func` function throws the exception during executing, and the
         * stringified exception passes the 'like' assertion (with 'expected' parameter).
         * 
         * It has synonyms - `throws_ok` and `throws`.
         * 
         * @param {Function} func The function which supposed to throw an exception
         * @param {String/RegExp} expected The regex against which to test the stringified exception, can be also a plain string
         * @param {String} desc The description of the assertion
         */
        throwsOk : function (func, expected, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(func) != 'Function') throw new Error(R.get('throwsOkInvalid'))
            
            var e = this.getExceptionCatcher()(func)
            
            // assuming no one will throw undefined exception..
            if (e === undefined) {
                this.fail(desc, {
                    assertionName       : 'throws_ok', 
                    annotation          : R.get('didntThrow')
                })
                
                return
            }
            
            if (e instanceof this.getTestErrorClass())
                //IE uses non-standard 'description' property for error msg
                e = e.message || e.description
                
            e = '' + e
                
            if (this.typeOf(expected) == "RegExp")
            
                if (e.match(expected))
                    this.pass(desc, {
                        descTpl             : R.get('exMatchesRe'),
                        expected            : expected
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'throws_ok', 
                        got                 : e, 
                        gotDesc             : R.get('exceptionStringifiesTo'),
                        need                : expected, 
                        needDesc            : R.get('needStringMatching')
                    })
            else
             
                if (e.indexOf(expected) != -1)
                    this.pass(desc, {
                        descTpl             : R.get('exContainsSubstring'),
                        expected            : expected
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'throws_ok', 
                        got                 : e,
                        gotDesc             : R.get('exceptionStringifiesTo'),
                        need                : expected,
                        needDesc            : R.get('needStringContaining')
                    })
        },
        
        
        
        lives_ok : function () {
            this.livesOk.apply(this, arguments)
        },
        
        lives : function () {
            this.livesOk.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the supplied `func` function doesn't throw an exception during execution.
         * 
         * This method has two synonyms: `lives_ok` and `lives`
         * 
         * @param {Function} func The function which is not supposed to throw an exception
         * @param {String} desc The description of the assertion
         */
        livesOk : function (func, desc) {
            if (this.typeOf(func) != 'Function') {
                func = [ desc, desc = func ][ 0 ]
            }

            var R       = Siesta.Resource('Siesta.Test.More');
            var e       = this.getExceptionCatcher()(func)
            
            if (e === undefined) 
                this.pass(desc, {
                    descTpl             : R.get('fnDoesntThrow')
                })
            else
                this.fail(desc, {
                    assertionName       : 'lives_ok', 
                    annotation          : R.get('fnThrew') + ': ' + e
                })
        },
        
        
        isa_ok : function (value, className, desc) {
            this.isInstanceOf(value, className, desc)
        },
        

        isaOk : function (value, className, desc) {
            this.isInstanceOf(value, className, desc)
        },
        
        /**
         * This assertion passes, when the supplied `value` is the instance of the `className`. The check is performed with
         * `instanceof` operator. The `className` parameter can be supplied as class constructor or as string, representing the class
         * name. In the latter case the `class` will eval'ed to receive the class constructor.
         * 
         * This method has synonyms: `isaOk`, `isa_ok`
         * 
         * @param {Mixed} value The value to check for 'isa' relationship
         * @param {Class/String} className The class to check for 'isa' relationship with `value`
         * @param {String} desc The description of the assertion
         */
        isInstanceOf : function (value, className, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            try {
                if (this.typeOf(className) == 'String') className = this.global.eval(className)
            } catch (e) {
                this.fail(desc, {
                    assertionName       : 'isa_ok', 
                    annotation          : Siesta.Resource('Siesta.Test.Function', 'exceptionEvalutingClass')
                })
                
                return
            }
            
            if (value instanceof className) 
                this.pass(desc, {
                    descTpl             : R.get('isInstanceOfPass')
                })
            else
                this.fail(desc, {
                    assertionName       : 'isa_ok', 
                    got                 : value, 
                    need                : String(className), 
                    needDesc            : R.get('needInstanceOf')
                })
        },
        
        
        /**
         * This assertion passes, if supplied value is a String.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isString : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'String')
                this.pass(desc, {
                    descTpl     : R.get('isAString'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aStringValue')
                })
        },
        
        
        /**
         * This assertion passes, if supplied value is an Object
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isObject : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Object')
                this.pass(desc, {
                    descTpl     : R.get('isAnObject'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('anObject')
                })
        },
        

        /**
         * This assertion passes, if supplied value is an Array
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isArray : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Array')
                this.pass(desc, {
                    descTpl     : R.get('isAnArray'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('anArrayValue')
                })
        },


        /**
         * This assertion passes, if supplied value is a Number.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isNumber : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Number')
                this.pass(desc, {
                    descTpl     : R.get('isANumber'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aNumberValue')
                })
        },


        /**
         * This assertion passes, if supplied value is a Boolean.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isBoolean : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Boolean')
                this.pass(desc, {
                    descTpl     : R.get('isABoolean'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aBooleanValue')
                })
        },

        
        /**
         * This assertion passes, if supplied value is a Date.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isDate : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Date')
                this.pass(desc, {
                    descTpl     : R.get('isADate'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aDateValue')
                })
        },

        
        /**
         * This assertion passes, if supplied value is a RegExp.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isRegExp : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'RegExp')
                this.pass(desc, {
                    descTpl     : R.get('isARe'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aReValue')
                })
        },
        
        
        /**
         * This assertion passes, if supplied value is a Function.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isFunction : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Function')
                this.pass(desc, {
                    descTpl     : R.get('isAFunction'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aFunctionValue')
                })
        },        
        
        
        is_deeply : function (obj1, obj2, desc) {
            this.isDeeply.apply(this, arguments)
        },
        
        /**
         * This assertion passes when in-depth comparison of 1st and 2nd arguments (which are assumed to be JSON objects) shows that they are equal.
         * Comparison is performed with '==' operator, so `[ 1 ]` and `[ "1" ] objects will be equal. The objects should not contain cyclic references.
         * 
         * This method works correctly with the *placeholders* generated with method {@link #any}.
         * 
         * This method has a synonym: `is_deeply`
         * 
         * @param {Object} obj1 The 1st object to compare
         * @param {Object} obj2 The 2nd object to compare
         * @param {String} desc The description of the assertion
         */
        isDeeply : function (obj1, obj2, desc) {

            if (this.typeOf(obj1) === this.typeOf(obj2) && this.compareObjects(obj1, obj2)) {
                var R       = Siesta.Resource('Siesta.Test.More');

                this.pass(desc, {
                    descTpl             : R.get('isDeeplyPassTpl'),
                    obj1                : obj1,
                    obj2                : obj2
                })
            }
            else
                this.fail(desc, {
                    assertionName       : 'isDeeply', 
                    got                 : obj1, 
                    need                : obj2 
                })
        },
        
        
        /**
         * This assertion passes when in-depth comparison of 1st and 2nd arguments (which are assumed to be JSON objects) shows that they are equal.
         * Comparison is performed with '===' operator, so `[ 1 ]` and `[ "1" ] objects will be different. The objects should not contain cyclic references.
         * 
         * This method works correctly with the *placeholders* generated with method {@link #any}.
         * 
         * @param {Object} obj1 The 1st object to compare
         * @param {Object} obj2 The 2nd object to compare
         * @param {String} desc The description of the assertion
         */
        isDeeplyStrict : function (obj1, obj2, desc) {
            if (this.typeOf(obj1) === this.typeOf(obj2) && this.compareObjects(obj1, obj2, true)) {

                var R       = Siesta.Resource('Siesta.Test.More');

                this.pass(desc, {
                    descTpl             : R.get('isDeeplyStrictPassTpl'),
                    obj1                : obj1,
                    obj2                : obj2
                })
            }
            else
                this.fail(desc, {
                    assertionName       : 'isDeeplyStrict', 
                    got                 : obj1, 
                    need                : obj2 
                })
        },
        
        expectGlobal : function () {
            this.expectGlobals.apply(this, arguments)
        },
        
        
        /**
         * This method accepts a variable number of names of expected properties in the global scope. When verifying the globals with {@link #verifyGlobals}
         * assertions, the expected gloabls will not be counted as failed assertions.
         * 
         * This method has a synonym with singular name: `expectGlobal`
         * 
         * @param {String/RegExp} name1 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} name2 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} nameN The name of global property or the regular expression to match several properties
         */
        expectGlobals : function () {
            this.expectedGlobals.push.apply(this.expectedGlobals, arguments)
        },
        
        
        isGlobalExpected : function (name, index) {
            var me                  = this
            
            if (!index || index && !index.expectedStrings) {
                if (!index) index   = {}
                
                Joose.O.extend(index, {
                    expectedStrings     : {},
                    expectedRegExps     : []
                })
                
                Joose.A.each(this.expectedGlobals.concat(this.browserGlobals), function (value) {
                    if (me.typeOf(value) == 'RegExp')
                        index.expectedRegExps.push(value)
                    else
                        index.expectedStrings[ value ] = true 
                })
            }
            
            if (index.expectedStrings[ name ]) return true
            
            var imageWithIdCreatesGlobalEnumerable  = Siesta.Harness.Browser.FeatureSupport().supports.imageWithIdCreatesGlobalEnumerable;
            
            // remove after https://bugzilla.mozilla.org/show_bug.cgi?id=959992 will be fixed
            if (imageWithIdCreatesGlobalEnumerable) {
                var domEl       = this.global.document.getElementById(name)
                
                if (domEl && domEl.tagName.toLowerCase() == 'img') return true;
            }
                
            for (var i = 0; i < index.expectedRegExps.length; i++)
                if (index.expectedRegExps[ i ].test(name)) return true
            
            return false
        },
        
        
        forEachUnexpectedGlobal : function (func, scope) {
            scope                   = scope || this
            
            var index               = {}
            
            for (var name in this.global) 
                if (!this.isGlobalExpected(name, index)) func.call(scope, name)
        },
        
        
        /**
         * This method accepts a variable number of names of expected properties in the global scope and then performs a globals check. 
         *
         * It will scan all globals properties in the scope of test and compare them with the list of expected globals. Expected globals can be provided with:
         * {@link #expectGlobals} method or {@link Siesta.Harness#expectedGlobals expectedGlobals} configuration option of harness.
         * 
         * You can enable this assertion to automatically happen at the end of each test, using {@link Siesta.Harness#autoCheckGlobals autoCheckGlobals} option of the harness.
         * 
         * @param {String/RegExp} name1 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} name2 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} nameN The name of global property or the regular expression to match several properties
         */
        verifyGlobals : function () {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.disableGlobalsCheck) {
                this.diag(R.get('globalCheckNotSupported'));
                
                return
            }
            
            this.expectGlobals.apply(this, arguments)
            
            this.diag(R.get('globalVariables'))
            
            var failed          = false
            
            this.forEachUnexpectedGlobal(function (name) {
                this.fail(
                    R.get('globalFound'), 
                    R.get('globalName') + ': ' + name + ', ' + R.get('value') + ': ' + Siesta.Util.Serializer.stringify(this.global[ name ])
                )
                
                failed      = true
            })
            
            if (!failed) this.pass(R.get('noGlobalsFound'))
        },
        
        
        // will create a half-realized, "phantom", "isWaitFor" assertion, which is only purposed
        // for user to get the instant feedback about "waitFor" actions
        // this assertion will be "finalized" and added to the test results in the "finalizeWaiting"
        startWaiting : function (description, sourceLine) {
            var result = new Siesta.Result.Assertion({
                description     : description,
                isWaitFor       : true,
                sourceLine      : sourceLine
            });
            
            this.fireEvent('testupdate', this, result, this.getResults())
            
            return result;
        },
        
        
        finalizeWaiting : function (result, passed, desc, annotation, errback) {
            // Treat this is an ordinary assertion from now on
            result.completed = true;
            
            if (passed)
                this.pass(desc, annotation, result)
            else {
                this.fail(desc, annotation, result);
                
                errback && errback()
            }
        },
        
        
        /**
         * Waits for passed checker method to return true (or any non-false value, like for example DOM element or array), and calls the callback when this happens.
         * As an additional feature, the callback will receive the result from the checker method as the 1st argument.
         * 

    t.waitFor(
        function () { return document.getElementById('someEl') },
        function (el) {
            // waited for element #someEl to appear
            // element will be available in the callback as 1st argument "el"
        }
    )

         * You can also call this method with a single Object having the following properties: `method`, `callback`, `scope`, `timeout`, `interval`:

    t.waitFor({
        method      : function () { return document.getElementById('someEl') },
        callback    : function (el) {
            // waited for element #someEl to appear
            // element will be available in the callback as 1st argument "el"
        }
    })

         * 
         * @param {Object/Function/Number} method Either a function which should return true when a certain condition has been fulfilled, or a number of ms to wait before calling the callback. 
         * @param {Function} callback A function to call when the condition has been met. Will receive a result from checker function.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time (in milliseconds) to wait for the condition to be fulfilled. 
         * Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. If condition is not fullfilled within this time, a failed assertion will be added to the test. 
         * @param {Int} [interval=100] The polling interval (in milliseconds)
         * 
         * @return {Object} An object with the following properties:
         * @return {Function} return.force A function, that will force this wait operation to immediately complete (and call the callback). 
         * No call to checker will be performed and callback will not receive a result from it. 
         */
        waitFor : function (method, callback, scope, timeout, interval)  {
            var R                       = Siesta.Resource('Siesta.Test.More');
            var description             = ' ' + R.get('conditionToBeFulfilled');
            var assertionName           = 'waitFor';
            var me                      = this;
            var sourceLine              = me.getSourceLine();
            var originalSetTimeout      = me.originalSetTimeout;
            var originalClearTimeout    = me.originalClearTimeout;
            var errback;

            if (arguments.length === 1 && this.typeOf(method) == 'Object') {
                var options     = method;
                
                method          = options.method;
                callback        = options.callback;
                scope           = options.scope;
                timeout         = options.timeout;
                interval        = options.interval
                
                description     = options.description || description;
                assertionName   = options.assertionName || assertionName;
                
                // errback is called in case "waitFor" has failed
                errback         = options.errback
            }
            
            var isWaitingForTime        = this.typeOf(method) == 'Number'

            callback                    = callback || function () {}
            description                 = isWaitingForTime ? (method + ' ' + R.get('ms')) : description;

            var pollTimeout
            
            // early notification about the started "waitFor" operation
            var waitAssertion           = me.startWaiting(R.get('waitingFor') + ' ' + description, sourceLine);
            
            interval                    = interval || this.waitForPollInterval
            timeout                     = timeout || this.waitForTimeout
            
            // this async frame is not supposed to fail, because it's delayed to `timeout + 3 * interval`
            // failure supposed to be generated in the "pollFunc" and this async frame to be closed
            // however, in IE the async frame may end earlier than failure from "pollFunc"
            // in such case we report the same error as in "pollFunc"
            var async                   = this.beginAsync((isWaitingForTime ? method : timeout) + 3 * interval, function () {
                originalClearTimeout(pollTimeout)
                
                me.finalizeWaiting(waitAssertion, false, R.get('waitedTooLong') + ': ' + description, {
                    assertionName       : assertionName,
                    annotation          : R.get('conditionNotFulfilled') + ' ' + timeout + R.get('ms')
                }, errback)
                
                return true
            })
            
            var isDone      = false

            // stop polling, if this test instance has finalized (probably because of exception)
            this.on('beforetestfinalize', function () {
                if (!isDone) {
                    isDone      = true
                    
                    me.finalizeWaiting(waitAssertion, false, R.get('waitingAborted'));
                    me.endAsync(async)
                    
                    originalClearTimeout(pollTimeout)
                }
            }, null, { single : true })

            if (isWaitingForTime) {
                pollTimeout = originalSetTimeout(function() {
                    isDone      = true
                    
                    me.finalizeWaiting(waitAssertion, true, R.get('Waited') + ' ' + method + ' ' + R.get('ms'));
                    me.endAsync(async);
                    me.processCallbackFromTest(callback, [], scope || me)
                }, method);
                
            } else {

                var result;
                var startDate   = new Date()
            
                var pollFunc    = function () {
                    var time = new Date() - startDate;
                    
                    if (time > timeout) {
                        me.endAsync(async);

                        me.finalizeWaiting(waitAssertion, false, R.get('waitedTooLong') + ': ' + description, {
                            assertionName       : assertionName,
                            annotation          : R.get('conditionNotFulfilled') + ' ' + timeout + R.get('ms')
                        }, errback)
                        
                        isDone      = true
                    
                        return
                    }
                
                    try {
                        result = method.call(scope || me);
                    } catch (e) {
                        me.endAsync(async);
                    
                        me.finalizeWaiting(waitAssertion, false, assertionName + ' ' + R.get('checkerException'), {
                            assertionName       : assertionName,
                            got                 : e.toString(),
                            gotDesc             : R.get('Exception')
                        }, errback)
                    
                        isDone      = true
                        
                        return
                    }
                
                    if (result != null && result !== false) {
                        me.endAsync(async);
                        
                        isDone      = true
                        
                        me.finalizeWaiting(waitAssertion, true, R.get('Waited') + ' ' + time + ' ' + R.get('msFor') + ' ' + description);
                        
                        me.processCallbackFromTest(callback, [ result ], scope || me)
                    } else 
                        pollTimeout = originalSetTimeout(pollFunc, interval)
                }
            
                pollFunc()
            }
            
            return {
                force : function () {
                    // wait operation already completed 
                    if (isDone) return
                    
                    isDone      = true
                    
                    originalClearTimeout(pollTimeout)
                    
                    me.endAsync(async);
                    
                    me.finalizeWaiting(waitAssertion, true, R.get('forcedWaitFinalization') + ' ' + description);
                    
                    me.processCallbackFromTest(callback, [], scope || me)
                }
            }
        },

        /**
         * Waits for the number of a number millseconds and calls the callback when after waiting. This is just a convenience synonym for the {@link #waitFor} method.

         t.waitForMs(1500, callback)

         *
         * @param {Number} method The number of ms to wait before calling the callback.
         * @param {Function} callback A function to call when the condition has been met. Will receive a result from checker function.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time (in milliseconds) to wait for the condition to be fulfilled.
         * Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. If condition is not fullfilled within this time, a failed assertion will be added to the test.
         * @param {Int} [interval=100] The polling interval (in milliseconds)
         *
         * @return {Object} An object with the following properties:
         * @return {Function} return.force A function, that will force this wait operation to immediately complete (and call the callback).
         * No call to checker will be performed and callback will not receive a result from it.
         */
        waitForMs : function() {
            return this.waitFor.apply(this, arguments);
        },
        

        /**
         * Waits for the passed checker method to return true (or any non-false value, like for example DOM element or array), and calls the callback when this happens.
         * This is just a convenience synonym for the {@link #waitFor} method.
         *

         t.waitForFn(function() { return true; }, callback)

         *
         * @param {Function} fn The checker function.
         * @param {Function} callback A function to call when the condition has been met. Will receive a result from checker function.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time (in milliseconds) to wait for the condition to be fulfilled.
         * Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. If condition is not fullfilled within this time, a failed assertion will be added to the test.
         * @param {Int} [interval=100] The polling interval (in milliseconds)
         *
         * @return {Object} An object with the following properties:
         * @return {Function} return.force A function, that will force this wait operation to immediately complete (and call the callback).
         * No call to checker will be performed and callback will not receive a result from it.
         */
        waitForFn : function() {
            return this.waitFor.apply(this, arguments);
        },
        
        // takes the step function and tries to analyze if it is missing the call to "next"
        // returns "true" if "next" is used, 
        analyzeChainStep : function (func) {
            var sources         = func.toString()
            var firstArg        = sources.match(/function\s*[^(]*\(\s*(.*?)\s*(?:,|\))/)[ 1 ]
                        
            if (!firstArg) return false
            
            var body            = sources.match(/\{([\s\S]*)\}/)[ 1 ]
            
            return body.indexOf(firstArg) != -1
        },
        
        
        /**
         * This method accepts a variable number of steps, either as individual arguments or as a single array containing them. Steps and arrays
         * of steps are handled just fine, and any step-arrays passed will be flattened. Each step should be either a function or configuration 
         * object for {@link Siesta.Test.Action test actions}. These functions / actions will be executed in order.
         * 
         * 1) For a function step, it will receive a callback as the 1st argument, to call when the step is completed.
         * As the 2nd and further arguments, the step function will receive the arguments passed to the previous callback.
         * 
         * The last step will receive a no-op callback, which can be ignored or still called. **Note**, that last step is assumed to
         * complete synchronously! If you need to launch some asynchronous process in the last step, you may need to add another empty function step
         * to the end of the chain.
         * 
         * 2) For Siesta.Test.Action objects, the callback will be called by the action class automatically,
         * there's no need to provide any callback manually. The configuration object should contain an "action" property, specifying the action class
         * along with other config options depending on the action class. For brevity, instead of using the "action" property, the configuration
         * object can contain the property corresponding to the action name itself, with the action's target (or even a test method with arguments).
         * See the following examples and also refer to the documentation of the action classes. 
         * 
         * If the configuration object will contain a "desc" property, a passing assertion with its value will be added to the test, after this step has completed.
         * 
         * 3) If a step is a sub test instance, created with {@link #getSubTest} method, then the step will launch it.
         * 
         * It's better to see how it works in action. For example, when using using only functions:
         
    t.chain(
        // function receives a callback as 1st argument
        function (next) {
            // we pass that callback to the "click" method
            t.click(buttonEl, next)
        },
        function (next) {
            t.type(fieldEl, 'Something', next)
        },
        function (next) {
            t.is(fieldEl.value == 'Something', 'Correct value in the field')
            
            // call the callback with some arguments
            next('foo', 'bar')  
        }, 
        // those arguments are now available as arguments of next step
        function (next, value1, value2) {
            t.is(value1, 'foo', 'The arguments for the callback are translated to the arguments of the step')
            t.is(value2, 'bar', 'The arguments for the callback are translated to the arguments of the step')
        }
    )

         * 
         * The same example, using action configuration objects for first 2 steps. For the list of available actions 
         * please refer to the classes in the `Siesta.Test.Action` namespace.
         
    t.chain(
        {
            action      : 'click',
            target      : buttonEl,
            desc        : "Clicked on the button"
        },
        // or
        {
            click       : buttonEl,
            desc        : "Clicked on the button"
        },

        {
            action      : 'type',
            target      : fieldEl,
            text        : 'Something',
            desc        : "Typed in the field"
        },
        // or
        {
            type        : 'Something',
            target      : fieldEl,
            desc        : "Typed in the field"
        },
        
        {
            waitFor     : 'Selector',
            args        : '.selector'
        }
        // or, using Siesta.Test.Action.MethodCall notation:
        {
            waitForSelector : '.selector'
        }
        
        function (next) {
            t.is(fieldEl.value == 'Something', 'Correct value in the field')
            
            next('foo', 'bar')  
        }, 
        ...
    )
    
         * Please note, that by default, each step is expected to complete within the {@link Siesta.Harness#defaultTimeout} time. 
         * You can change this with the `timeout` property of the step configuration object, allowing some steps to last longer.
         * Steps with sub-tests are expected to complete within {@link Siesta.Harness#subTestTimeout}.
         * 
         * In a special case, `action` property of the step configuration object can be a function. In this case you can also 
         * provide a `timeout` property, otherwise this case is identical to using functions:
         *  

    t.chain(
        {
            action      : function (next) { ... },
            // allow 50s for the function to call "next" before step will be considered timed-out
            timeout     : 50000
        },
        ...
    )
    
         *  **Tip**:
         *  
         *  If a step is presented with a `null` or `undefined` value it will be ignored. Additionally, a step can be
         *  an array of steps - all arrays passed to t.chain will be flattened.
         *  
         *  These tips allows us to implement conditional steps processing, like this:
         *  

    var el1IsInDom          = t.$('.some-class1')[ 0 ]
    var el2IsInDom          = t.$('.some-class2')[ 0 ]
    
    t.chain(
        { click : '.some-other-el' },
        
        el1IsInDom ? [
            { click : el1IsInDom },
            
            el2IsInDom ? [
                { click : el1IsInDom }
            ] : null,
        ] : null,
        
        ...
    )

         *
         *  See also : {@link #chainForArray}.
         *  
         *  @param {Function/Object/Array} step1 The function to execute or action configuration, or an array of steps
         *  @param {Function/Object} step2 The function to execute or action configuration
         *  @param {Function/Object} stepN The function to execute or action configuration
         */
        chain : function () {
            // inline any arrays in the arguments into one array
            var steps       = this.flattenArray(arguments)
            var R           = Siesta.Resource('Siesta.Test.More');

            var nonEmpty    = []
            Joose.A.each(steps, function (step) { if (step) nonEmpty.push(step) })
            
            steps           = nonEmpty
            
            var len         = steps.length
            
            // do nothing
            if (!len) return;
            
            var me          = this
            var self        = arguments.callee
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : self.hasOwnProperty('actionDelay') ? self.actionDelay : this.actionDelay,
                
                observeTest     : this
            })
            
            // hack to allow configuration of `actionDelay`...
            delete self.actionDelay
            
            var sourceLine  = me.getSourceLine();
            
            var args        = []
            
            Joose.A.each(steps, function (step, index) {
                
                var isLast      = index == len - 1
                
                queue.addAsyncStep({
                    processor : function (data) {
                        var isStepWithOwnAsyncFrame  = step.action == 'wait' || step.waitFor || (step instanceof Siesta.Test)
                        
                        if (!isStepWithOwnAsyncFrame) {
                            var timeout     = step.timeout || me.defaultTimeout
                            
                            // + 100 to allow `waitFor` steps (which will be waiting the `timeout` time) to
                            // generate their own failures
                            var async       = me.beginAsync(timeout + 100, function () {
                                me.fail(
                                    R.get('chainStepNotCompleted'),
                                    {
                                        sourceLine      : sourceLine,
                                        annotation      : R.get('stepNumber') + ': ' + (index + 1) + ' ' + R.get('oneBased') + (sourceLine ? ('\n' + R.get('atLine') + ': ' + sourceLine) : ''),
                                        ownTextOnly     : true
                                    }
                                )
                                
                                return true
                            })
                        }
                        
                        var nextFunc    = function () {
                            var self    = arguments.callee
                            if (self.__CALLED__) me.fail(R.get('calledMoreThanOnce', { num : index + 1, line : sourceLine }))
                            
                            self.__CALLED__ = true
                            
                            if (!isStepWithOwnAsyncFrame) me.endAsync(async)
                            
                            args    =  Array.prototype.slice.call(arguments);
                            
                            if (step.desc) {
                                me.pass(step.desc);
                            }
                            data.next()
                        }
                        
                        if (step instanceof Siesta.Test) {
                            me.launchSubTest(step, nextFunc)
                        } else if (me.typeOf(step) == 'Function' || me.typeOf(step.action) == 'Function') {
                            var func    = me.typeOf(step) == 'Function' ? step : step.action
                            
                            // if the last step is a function - then provide "null" as the "next" callback for it
                            args.unshift(isLast ? function () {} : nextFunc)
                            
                            if (!isLast && !me.analyzeChainStep(func)) me.fail(R.get('stepFn') + ' [' + func.toString() + '] ' + R.get('notUsingNext'))
                            
                            if (me.transparentEx)
                                func.apply(me, args)
                            else {
                                var e = me.getExceptionCatcher()(function () {
                                    func.apply(me, args)
                                })
                                
                                if (e !== undefined) {
                                    me.fail(R.get('chainStepEx'), { annotation : me.stringifyException(e) })
                                }
                            }
                            
                            // and finalize the async frame manually, as the "nextFunc" for last step will never be called
                            isLast && me.endAsync(async)
                            
                        } else if (me.typeOf(step) == 'String') {
                            var action      = new Siesta.Test.Action.Eval({
                                actionString        : step,
                                next                : nextFunc,
                                test                : me
                            })
                            
                            action.process()
                            
                        } else {
                            step.next       = nextFunc
                            step.test       = me
                            
                            var action      = Siesta.Test.ActionRegistry().create(step, me, args)
                            
                            action.process()
                        }
                    } 
                })
            })
            
            queue.run()
        },
        
        
        /**
         * This is a wrapper around the {@link #chain} method, which allows you to run the chain over the steps, generated from the elements
         * of some array. For example, if in some step of outer chain, we need to click the elements with ids, given as the array, we can do:
         *

    function (next) {
        var ids     = [ 'button-1', 'button-2', 'button-3' ]
        
        t.chainForArray(ids, function (elId) {
            return { click : '#' + elId }
        }, next)
    }
         * 
         * @param {Array} array An array with arbitrary elements
         * @param {Function} generator A function, which will be called for every element of the `array`. It should return
         * a chain step, generated from that element. This function can return an array of steps as well. If generator will return `null` or 
         * `undefined` nothing will be added to the chain.
         * @param {Function} generator.el An element of the `array`
         * @param {Function} generator.index An index of the element
         * @param {Function} [callback] A function to call, once the chain is completed.
         */
        chainForArray : function (array, generator, callback, reverse) {
            var me          = this
            var steps       = []
            
            Joose.A[ reverse ? 'eachR' : 'each' ](array, function (el, index) {
                var res     = generator.call(me, el, index)
                
                if (me.typeOf(res) == 'Array') 
                    steps.push.apply(steps, res)
                else
                    if (res) steps.push(res)
            })
            
            if (callback) steps.push(function () {
                me.processCallbackFromTest(callback)
            })
            
            this.chain(steps)
        },
        
        
        verifyExpectedNumber : function (actual, expected) {
            var operator        = '=='
            
            if (this.typeOf(expected) == 'String') {
                var match       = /([<>=]=?)\s*(\d+)/.exec(expected)
                var R               = Siesta.Resource('Siesta.Test.Browser');

                if (!match) throw new Error(R.get('wrongFormat')  + ": " + expected)
                
                operator        = match[ 1 ]
                expected        = Number(match[ 2 ])
            }
            
            switch (operator) {
                case '==' : return actual == expected
                case '<=' : return actual <= expected
                case '>=' : return actual >= expected
                case '<' : return actual < expected
                case '>' : return actual > expected
            }
        }
    },
    
    
    after : {
        
        initialize        : function () {
            
            this.on('beforetestfinalize', function () {
                
                if (this.autoCheckGlobals && !this.isFailed() && !this.parent) this.verifyGlobals()
                
            }, this)
        }
    }
        
})
//eof Siesta.Test.More
