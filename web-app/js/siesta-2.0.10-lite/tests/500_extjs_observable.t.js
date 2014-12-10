StartTest(function(t) {
    
    t.testExtJS(function (t) {
        var panel = new Ext.Panel({
            html    : 'foo',
            title   : 'bar'
        });

        t.firesOk(panel, 'render', 1, 0, function() {
            panel.render(Ext.getBody());
        }, 'firesOk reported correctly');

        t.willFireNTimes(panel, 'hide', 2)
        t.willFireNTimes(panel, 'show', 2)
        
        panel.hide();
        panel.show();
        
        t.firesOk({
            observable      : panel,
            events          : {
                hide            : 1,
                show            : '<= 1',
                destroy         : '> 0'
            },
            during          : function () {
                panel.hide();
                panel.show();
                panel.destroy()
            }
        })
        
        
        var panel2 = new Ext.Panel({
            html    : 'foo',
            title   : 'bar'
        });
        
        t.waitForEvent(panel2, 'render', function () {
            t.ok(panel2.rendered, 'waitForEvent OK')
        })
        
        panel2.render(Ext.getBody());
    });


    t.expectPass(function(t2) {
        var obs = new Ext.util.Observable();
        
        obs.on('foo', function() {});
        
        t.hasListener(obs, 'foo', 'Found "foo" listener');

        t.isFiredWithSignature(obs, 'foo', function() { return true; }, 'Some desc');

        obs.fireEvent('foo')
    })
    

    t.expectFail(function(t) {
        var obs = new Ext.util.Observable();
        
        t.hasListener(obs, 'bar', 'Did not find "bar" listener');

        t.isFiredWithSignature(obs, 'foo', function() { return false; }, 'Some desc');
        t.isFiredWithSignature(obs, 'bar', function() { return false; }, 'Not fired at all');

        obs.fireEvent('foo');
    });


    t.expectFail(function(t2) {
        var obs2 = new Ext.util.Observable();
        
        t2.wontFire(obs2, 'foo', 'Should not fire');
        t2.firesAtLeastNTimes(obs2, 'foo', 3);
        
        obs2.fireEvent('foo');
        obs2.fireEvent('foo');
    });

});
