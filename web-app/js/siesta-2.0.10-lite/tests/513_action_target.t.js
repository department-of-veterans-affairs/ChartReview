StartTest(function(t) {
    
    t.it('normalizeActionTarget tests', function(t) {

        var txt = new Ext.form.TextField({
            foo      : 'bar',
            renderTo : document.body
        });

        t.is(t.normalizeActionTarget(txt), txt, 'Component');

        t.is(t.normalizeActionTarget('>>[foo=bar]'), txt, 'CQ')

        t.is(t.normalizeActionTarget(txt.el), txt.el, 'Ext el')

        t.is(t.normalizeActionTarget(txt.el.dom), txt.el.dom, 'DOM')

        t.throwsOk(function() {
            t.warn = function() {};

            t.normalizeActionTarget('>>crap', false)
        }, 'No component found')
    });

    t.it('Should warn when multiple visible components are found', function (t) {
        var pnl = new Ext.Panel({
            renderTo : document.body,
            bar      : 'baz',
            title    : 'foo'
        });

        var pnl2 = new Ext.Panel({
            renderTo : document.body,
            title    : 'foo'
        });

        t.warn = function() {}; // We don't want this test truly warning

        t.isCalled('warn', t, 'Should warn when many components are matched');

        t.normalizeActionTarget('>>[title=foo]');
    })

    t.it('Should find only the rendered component if multiple CQ matches are found but only one is visible', function (t) {
        var pnl = new Ext.Panel({
            renderTo : document.body,
            hidden   : true,
            bar      : 'baz',
            some     : 'prop'
        });

        var visiblePanel = new Ext.Panel({
            renderTo : document.body,
            some     : 'prop'
        });

        var pnl3 = new Ext.Panel({
            renderTo : document.body,
            hidden   : true,
            some     : 'prop'
        });

        t.warn = function() {}; // We don't want this test truly warning

        t.isntCalled('warn', t, 'Should not warn when many components are matched but only one is visible');

        t.is(t.normalizeActionTarget('>>[some=prop]'), visiblePanel);
    })
});