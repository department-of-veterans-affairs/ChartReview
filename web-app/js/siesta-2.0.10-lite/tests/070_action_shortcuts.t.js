StartTest(function(t) {
    
    t.testExtJS(function (t) {
        
        var action      = Siesta.Test.ActionRegistry().create({
            action          : 'click',
            target          : '.target',
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.Click, 'Correct action instance class')
        t.is(action.target, '.target', 'Correct action target')
        
        
        var action      = Siesta.Test.ActionRegistry().create({
            action          : 'drag',
            target          : '.target',
            
            by              : [ 1, 1 ],
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.Drag, 'Correct action instance class')
        t.is(action.target, '.target', 'Correct action target')
        t.isDeeply(action.by, [ 1, 1 ], 'Correct additional data')
        
        
        var action      = Siesta.Test.ActionRegistry().create({
            waitFor         : 'Something',
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.Wait, 'Correct action instance class')

        
        var action      = Siesta.Test.ActionRegistry().create({
            click           : '.target',
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.Click, 'Correct action instance class')
        t.is(action.target, '.target', 'Correct action target')
        
        
        var action      = Siesta.Test.ActionRegistry().create({
            DouBleCliCk     : '.target',
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.DoubleClick, 'Correct action instance class, regardless of shortcut property case')
        t.is(action.target, '.target', 'Correct action target')

        
        var action      = Siesta.Test.ActionRegistry().create({
            doUbleclick     : '.target',
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.DoubleClick, 'Correct action instance class, regardless of shortcut property case')
        t.is(action.target, '.target', 'Correct action target')

        
        var action      = Siesta.Test.ActionRegistry().create({
            drag            : '.target',
            
            by              : [ 1, 1 ],
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.Drag, 'Correct action instance class')
        t.is(action.target, '.target', 'Correct action target')
        t.isDeeply(action.by, [ 1, 1 ], 'Correct additional data')
        
        
        var action      = Siesta.Test.ActionRegistry().create({
            type            : 'text',
            target          : '.target',
            
            test            : t,
            next            : function () {}
        })
        
        t.isaOk(action, Siesta.Test.Action.Type, 'Correct action instance class')
        t.is(action.target, '.target', 'Correct action target')
        t.is(action.text, 'text', 'Correct additional data')
        
        
        var action      = Siesta.Test.ActionRegistry().create({
            waitforselector : '.target',
            
            test            : t,
            next            : function () {}
        }, t)
        
        t.isaOk(action, Siesta.Test.Action.Wait, 'Correct action instance class')
        t.is(action.waitFor, 'waitForSelector', 'Correct method name')
        t.is(action.args, '.target', 'Correct arguments')

        
        var action      = Siesta.Test.ActionRegistry().create({
            waitforEvent    : [ 1, 2 ],
            
            test            : t,
            next            : function () {}
        }, t)
        
        t.isaOk(action, Siesta.Test.Action.Wait, 'Correct action instance class')
        t.is(action.waitFor, 'waitForEvent', 'Correct method name')
        t.isDeeply(action.args, [ 1, 2 ], 'Correct arguments')
        
        var action      = Siesta.Test.ActionRegistry().create({
            setup           : '.target',
            
            test            : t,
            next            : function () {}
        }, t)
        
        t.isaOk(action, Siesta.Test.Action.MethodCall, 'Correct action instance class')
        t.is(action.methodName, 'setup', 'Correct method name')
        t.is(action.args, '.target', 'Correct arguments')
    });
});
