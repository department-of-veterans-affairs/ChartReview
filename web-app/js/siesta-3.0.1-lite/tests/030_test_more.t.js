StartTest(function(t) {
	//==================================================================================================================================================================================
    t.diag("Siesta.Test.More methods")
    
    var topTest     = t

    //==================================================================================================================================================================================
    t.diag("WaitFor")
    
    t.testGeneric(
        {
            doNotTranslate : true
        }, 
        function (t) {
            var counter     = 0 
            
            t.waitFor(
                function () {
                    return counter++ > 2
                }, 
                function () {
                    
                    t.waitFor(
                        function () {
                        }, 
                        function () {
                            topTest.fail("Should never reach this")
                        },
                        null,
                        200
                    )
                }
            )
        }, 
        function (test) {
            t.is(test.getAssertionCount(), 2, '2 assertions - 1 for passed waitFor and 1 for failed')
            t.ok(test.results.itemAt(0).passed, "1st one is passing")
            t.notOk(test.results.itemAt(1).passed, "2nd one is failing")
        }
    )

    t.testGeneric(
        {
            doNotTranslate : true
        }, 
        function (t) {
            t.waitFor(
                function () {
                    throw 'wtf';
                }, 
                function () {
                    topTest.fail("Should never get here")
                },
                null,
                200
            )
        }, 
        function (test) {
            t.is(test.getAssertionCount(), 1, 'A failing assertion was added - exception was detected')
            t.notOk(test.results.itemAt(0).passed)
        }
    )
    
    t.testGeneric(
        {
            doNotTranslate : true
        }, 
        function (t) {
            var waiter   = t.waitFor(
                function () {
                }, 
                function () {
                    t.pass("Reached callback")
                },
                null,
                200
            )
            
            waiter.force()
        }, 
        function (test) {
            t.is(test.getAssertionCount(), 2, 'An assertion was added - for wait for')
            t.ok(test.results.itemAt(0).passed, "and its passed because of force")
            t.ok(test.results.itemAt(0).isWaitFor, "and its passed because of force")
            t.ok(test.results.itemAt(1).passed, "Reached callback")
        }
    )    

    t.expectPass(function(t) {
        t.isGreater(2, 1, 'isGreater')
        t.isGreaterOrEqual(2, 1, 'isGreaterOrEqual')
        t.isGreaterOrEqual(2, 2, 'isGreaterOrEqual')
        t.isLessOrEqual(1, 2, 'isLessOrEqual')
        t.isLessOrEqual(2, 2, 'isLessOrEqual')
        t.isApprox(1, 2, 1, 'isApprox')

        t.like('foot', 'foo', 'like');
        t.unlike('foo', 'var', 'like');

        t.throwsOk(function() {
            throw 'foo';
        }, 'fo')

        t.livesOk(function() {
        })

        t.throwsOk(function() {
            throw 'foo';
        }, /foo/)

        t.isInstanceOf(new String("foo"), String)
        t.isInstanceOf(new String("foo"), "String")

        t.isString("2")
        t.isObject({})
        t.isArray([])
        t.isNumber(2)
        t.isBoolean(false)
        t.isDate(new Date())
        t.isRegExp(/./)
        t.isFunction(function() {})

        t.ok("foo")
        t.notOk("")
        t.is(1, 1)
        t.isNot(1, 2)
        t.isStrict(1, 1)
        t.isNotStrict(1, "1")

        t.wait('foo');

        t.throwsOk(function() {
            t.wait('foo');
        }, 'Already waiting with title [foo]')

        t.endWait('foo');

        t.throwsOk(function() {
            t.endWait('foo');
        }, 'There is no ongoing `wait` action with title [foo]')
    })

    t.expectFail(function(t) {
        t.isGreater(1, 2, 'isGreater')
        t.isGreaterOrEqual(1, 2, 'isGreaterOrEqual')
        t.isLessOrEqual(2, 1, 'isLessOrEqual')
        t.isApprox(1, 3, 1, 'isApprox')
        t.like('foo', 'bar', 'like');
        t.unlike('foot', 'foo', 'unlike');

        t.throwsOk(function() {
        }, 'bar')

        t.throwsOk(function() {
            throw 'foo';
        }, 'bar')

        t.throwsOk(function() {
            throw 'foo';
        }, /bar/)

        t.livesOk(function() {
            throw 'foo';
        })

        t.isInstanceOf(2, 'invalid')
        t.isInstanceOf(2, String)

        t.isString(2)
        t.isObject(2)
        t.isArray(2)
        t.isNumber(null)
        t.isBoolean(null)
        t.isDate("2")
        t.isRegExp(3)
        t.isFunction(3)
        t.ok("")
        t.notOk("foo")
        t.is(1, 2)
        t.isNot(1, 1)
        t.isStrict(1, "1")
        t.isNotStrict(1, 1)
    })
})
