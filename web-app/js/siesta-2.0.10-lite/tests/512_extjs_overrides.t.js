StartTest(function(t) {
    // TODO Ext5 is using this feature testing (see below), which fails because of `view.getComputedStyle`
    // return `null`. This only happens in FF and looks like a bug in that browser (probably because of
    // using that method for an element from the iframe with "display:none"
    // just disabling this test for FF for now
//    {
//        name: 'RightMargin',
//        ready: true,
//        fn: function(doc, div) {
//            var view = doc.defaultView;
//            return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight != '0px');
//        }
//    }

    if (Ext.isFirefox && Ext.getVersion('extjs') && Ext.versions.extjs.getMajor() == 5) return

    t.expectGlobals("0", "1");

    t.it('override detection', function(t) {

        t.assertNoGlobalExtOverrides('assertNoGlobalExtOverrides', function() {

            Ext.menu.ColorPicker.override({
                hidePickerOnSelect  : function() {},
                initComponent       : function() {}
            })

            t.globalExtOverrides = null;

            t.getNumberOfGlobalExtOverrides(function(length) {
                t.is(length, 2, 'getNumberOfGlobalExtOverrides');

                t.assertMaxNumberOfGlobalExtOverrides(2, 'foo')
            })

        })

    });
});