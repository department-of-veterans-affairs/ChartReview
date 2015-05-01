StartTest(function(topTest) {
    topTest.diag("Siesta.Test.More chaining")

    topTest.testBrowser(function (t) {
        var document = t.global.document;
        
        t.ok(
            t.analyzeChainStep(function (next) { next++; }),
            'Correctly found usage of 1st argument in step function'
        )
        
        t.ok(
            t.analyzeChainStep(function ( next ) { next++; }),
            'Correctly found usage of 1st argument in step function'
        )        
        
        t.ok(
            t.analyzeChainStep(function (abc123_11, zxc, zz) { abc123_11++; }),
            'Correctly found usage of 1st argument in step function'
        )
        
        t.notOk(
            t.analyzeChainStep(function funcName() { next() }),
            'Correctly found the absence of usage of 1st argument in step function'
        )
        
        t.notOk(
            t.analyzeChainStep(function funcName(next) { var a = 1 }),
            'Correctly found the absence of usage of 1st argument in step function'
        )
        

        t.chain(
            function (next) {
                t.is(arguments.length, 1, 'Only 1 argument for 1st step')
                
                next(1, 1, 2)
            },
            function (next) {
                t.is(arguments.length, 4, '4 arguments for 2nd step')
                
                t.isDeeply(Array.prototype.slice.call(arguments, 1), [ 1, 1, 2 ], 'Correct arguments received from previous step' )
                    
                // not just `setTimeout(next, 100)` because in FF, next will receive 1 argument
                setTimeout(function () {
                    next()
                }, 100)
            },
            function (next) {
                document.body.innerHTML = '<span id="foo" class="foo">bar</span>';
                t.is(arguments.length, 1, '1 argument')
                next()
            },

            { waitFor : 'selector', args : ['span.foo'] },
            
            function (next, prevResult) {
                t.is(arguments.length, 2, '2 arguments')
                t.is(prevResult[0], document.getElementById('foo'), 'Correct arg passed to next fn')
                next()
            },

            { action : 'click', target : document.body },

            function (next, prevResult) {
                t.is(arguments.length, 2, '2 arguments')
                //t.is(prevResult[0], document.body, 'Correct arg passed to next fn')
            }
        )
    })
    
    
    topTest.testBrowser(
        {
            doNotTranslate  : true,
            defaultTimeout  : 1000
        },
        function (t) {
            t.transparentEx = false
            
            t.chain(
                function (next) { throw "ex"; next() },
                function () {}
            )
        },
        function (test) {
            topTest.is(test.getAssertionCount(), 2, "2 assertions in test")
            
            topTest.notOk(test.results.itemAt(0).passed, "1st one is failing")
            topTest.like(test.results.itemAt(0).description, "Chain step", "And it was generated by the exception from the chain step")
            
            topTest.notOk(test.results.itemAt(1).passed, "2nd too")
            topTest.like(test.results.itemAt(1).description, "did not complete within required timeframe", "And it was generated by the failed waiting for the `next` call in step")
        }
    )
    
    topTest.testBrowser(function (t) {
        var callbackCalled      = false
        
        var chainLog            = []
        
        t.chainForArray([ 0, 1, 2, 3, 4 ], function (el) {
            if (el == 1) 
                return [
                    function (next) {
                        chainLog.push('one')
                        next()
                    },
                    function (next) {
                        chainLog.push(el)
                        next()
                    }
                ]
            else if (el == 2)
                return 
            else
                return {
                    action : function (next) {
                        chainLog.push(el)
                        next()
                    }
                }
            
        }, function () { callbackCalled = true })
        
        t.ok(callbackCalled, "Callback has been called")
        
        t.isDeeply(chainLog, [ 0, 'one', 1, 3, 4 ])
    })
    
    topTest.testBrowser(
        {
            doNotTranslate  : true,
            defaultTimeout  : 1000
        },
        function (t) {
            
            t.chain(
                function (next) {
                    next()
                    
                    setTimeout(next, 1)
                },
                { waitFor : 100 }
            )
        },
        function (test) {
            topTest.is(test.getAssertionCount(), 2, "2 assertions in test")
            
            topTest.notOk(test.results.itemAt(0).passed, "Failed assertion from the warning")
            topTest.like(test.results.itemAt(0).description, "is called more than once", "Failed assertion from the warning")
            
            topTest.ok(test.results.itemAt(1).passed, "Passing waitFor assertion")
            topTest.like(test.results.itemAt(1).description, /wait/i, "Passing waitFor assertion")
        }
    )
})