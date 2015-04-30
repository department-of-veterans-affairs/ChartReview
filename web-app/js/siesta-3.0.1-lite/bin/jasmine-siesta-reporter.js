// wrapper
!function () {
    
var currentTest

var actionsLog      = []

var idsToTest       = {}
var doneById        = {}
var asyncById       = {}

var isLive          = false

var SiestaReporter = {
    
    processAction       : function (action) {
        if (isLive)
            action()
        else
            actionsLog.push(action)
    },
    
    jasmineStarted: function (suiteInfo) {
        this.processAction(function () {
            currentTest.diag('Launching Jasmine test suite, total specs: ' + suiteInfo.totalSpecsDefined)
        })
    },
    
    
    suiteStarted: function (result) {
        this.processAction(function () {
            var currentCopy = currentTest
            
            var subTest     = currentCopy.getSubTest({
                name        : result.description,
                run         : function (t) {
                    asyncById[ result.id ] = t.beginAsync(null, function () {
                        subTest.fail("Suite " + result.description + " has failed to complete within " + t.defaultTimeout + "ms")
                    })
                },
                specType    : 'describe',
                timeout     : 10 * 60 * 1000
            })
            
            currentTest     = subTest
            
            idsToTest[ result.id ]  = subTest
            
            currentCopy.launchSubTest(subTest)
        })
    },
    
    
    specStarted: function (result) {
        this.processAction(function () {
            var currentCopy = currentTest
            
            var subTest     = currentCopy.getSubTest({
                name        : result.description,
                run         : function (t) {
                    asyncById[ result.id ] = t.beginAsync(null, function () {
                        subTest.fail("Spec " + result.description + " has failed to complete within " + t.defaultTimeout + "ms")
                    })
                },
                specType    : 'it',
                timeout     : 10 * 60 * 1000
            })
            
            currentTest     = subTest
            
            idsToTest[ result.id ]  = subTest
            
            currentCopy.launchSubTest(subTest)
        })
    },

    
    specDone : function (result) {
        doneById[ result.id ]   = true
        
        this.processAction(function () {
            var doneSpec    = idsToTest[ result.id ]
            var failedExp   = result.failedExpectations
            
            for (var i = 0; i < failedExp.length; i++) {
                doneSpec.fail(failedExp[ i ].message, failedExp[ i ].stack)
            }
            
            if (!failedExp.length && result.passedExpectations.length) 
                doneSpec.pass(result.passedExpectations.length + " expectations passed")
            
            currentTest     = doneSpec.parent
            
            if (asyncById[ result.id ]) doneSpec.endAsync(asyncById[ result.id ])
        })
    },

    
    suiteDone: function (result) {
        doneById[ result.id ]   = true
        
        this.processAction(function () {
            var doneSpec    = idsToTest[ result.id ]
            var failedExp   = result.failedExpectations
            
            for (var i = 0; i < failedExp.length; i++) {
                doneSpec.fail(failedExp[ i ].message, failedExp[ i ].stack)
            }
            
            currentTest     = doneSpec.parent
            
            if (asyncById[ result.id ]) doneSpec.endAsync(asyncById[ result.id ])
        })
    },
    
    
    jasmineDone: function () {
    },
    
    
    importResults : function (t) {
        currentTest     = t
        
        for (var i = 0; i < actionsLog.length; i++) {
            actionsLog[ i ]()
        }
        
        isLive          = true
    }
}

if (window.jasmine) {
    jasmine.currentEnv_.addReporter(SiestaReporter)
    
    jasmine.SiestaReporter  = SiestaReporter
}


// wrapper
}();
