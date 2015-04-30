StartTest(function (t) {

    var tbar = Ext.Viewport.add(new Ext.Toolbar({
    }));

    t.it('waitForComponent tests', function (t) {

        var btn = new Ext.Button({ id : 'btn', text : 'wait' });

        setTimeout(function () {
            tbar.add(btn);

        }, 500)

        t.chain(
            { waitFor : 'componentVisible', args : btn },

            function(next) {
                t.waitForComponentNotVisible(btn, next);

                btn.hide();
            }
        )
    })

    t.it('waitForComponentQuery tests', function (t) {
        Ext.define('Ext.foo', {
            extend : 'Ext.Button',
            alias  : 'widget.foo'
        })
        var btn = new Ext.foo();

        setTimeout(function () {
            tbar.add(btn);

        }, 500)

        t.chain(
            { waitFor : 'ComponentQueryVisible', args : 'foo' },

            function(next) {
                t.waitForComponentQueryNotVisible('foo', next);

                btn.hide();
            }
        )
    })
});
