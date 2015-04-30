StartTest(function (t) {
    t.expectGlobals('0', '1', '604_extjs_components.t.js')

    var innerWin, innerExt, innerTest;

    var Harness = t.getHarness([
        {
            preload     : [
                '../../../extjs-4.2.1/resources/css/ext-all.css',
                '../../../extjs-4.2.1/ext-all-debug.js'
            ],
            url         : 'testfiles/604_extjs_components.t.js'
        }
    ]);

    function waitForSizeMatch(target, callback) {
        var el = innerTest.normalizeElement(target);
        var highlighterEl = Ext.getBody().down('.target-inspector-box');

        var widthDiff = Math.abs(highlighterEl.getWidth() - 5 - innerExt.get(el).getWidth())
        var heightDiff = Math.abs(highlighterEl.getHeight() - 5 - innerExt.get(el).getHeight())

        if (widthDiff <=3 && heightDiff <=3) {
            t.isLessOrEqual(widthDiff, 3, 'width match')
            t.isLessOrEqual(heightDiff, 3, 'height match')
            callback();
        }
    }

    t.chain(
        { waitFor : 'harnessReady' },

        function (next) {
            t.waitForHarnessEvent('testsuiteend', next)
            Harness.on('teststart', function(ev, test) {
                innerWin = t.getActiveTestWindow();
                innerExt = innerWin.Ext;
                innerTest = test;
            })
            t.runFirstTest();
        },

        function (next) {

            t.cq1('resultpanel').onRecorderClick();

            var recorderPanel = t.cq1('recorderpanel');

            recorderPanel.highlightTarget('>>button[text=Foo]');

            waitForSizeMatch('>>button[text=Foo]', next)
        },

        function (next) {

            var recorderPanel = t.cq1('recorderpanel');

            // highlighting broken query
            recorderPanel.highlightTarget('>>button[')

            // Should keep size if resolving fails
            waitForSizeMatch('>>button[text=Foo]', next)
        },

        function (next) {
            var recorderPanel = t.cq1('recorderpanel');

            recorderPanel.highlightTarget('button[text=Foo] => span');
            waitForSizeMatch('button[text=Foo] => span', next)
        }
    );
})