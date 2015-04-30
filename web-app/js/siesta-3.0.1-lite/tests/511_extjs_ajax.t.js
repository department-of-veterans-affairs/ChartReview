StartTest(function(t) {
    
    t.testExtJS(function (t) {

        t.it('Wait for a single request', function(t) {
            var o = Ext.Ajax.request({
                url : '/'
            });

            t.waitForAjaxRequest(o, function() {
                t.pass('Ok single')
            })
        })

        t.it('Wait for multiple requests', function(t) {
            var r1 = Ext.Ajax.request({
                url : '/'
            });

            t.isAjaxLoading(r1);

            var r2 = Ext.Ajax.request({
                url : 'html-pages/basic1.html'
            });

            var r3 = Ext.Ajax.request({
                url : 'html-pages/basic2.html'
            });

            t.waitForAjaxRequest(function() {
                t.notOk(Ext.Ajax.isLoading(r1))
                t.notOk(Ext.Ajax.isLoading(r2))
                t.notOk(Ext.Ajax.isLoading(r3))
            })
        })

        t.it('ajaxRequestAndThen', function(t) {
            var as = t.beginAsync();

            t.ajaxRequestAndThen('html-pages/basic2.html', function() {
                t.endAsync(as);

                t.pass('Called');
            })
        });
    });
});