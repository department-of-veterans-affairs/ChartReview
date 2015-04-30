StartTest(function(topTest) {
    
    topTest.testExtJS({
        doNotTranslate  : true,
        defaultTimeout  : 300,
        waitForTimeout  : 300
    },function (t) {

        Ext.getBody().appendChild(Ext.DomHelper.createDom({
            id          : 'test',
            style       : 'display:none',
            text        : 'some content'
        }))

        t.chain(
            {
                action      : 'click',
                target      : '#test'
            }
        )
    }, function (test) {
        // 3 assertions will be added - `waitForAnimation`, failed waitFor target and failed chain step
        topTest.is(test.getAssertionCount(), 3, "One result was added to test, when clicking on not visible element")
        
        topTest.notok(test.results.itemAt(1).isPassed(), "And this result is a failing assertion")
    });
});

