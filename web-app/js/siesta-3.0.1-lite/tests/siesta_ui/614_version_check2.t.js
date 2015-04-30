StartTest(function (t) {
    t.it('Should show upgrade button if you are on old version', function (t) {
        Siesta.meta.VERSION = '12.3.4';

        Ext.ux.ajax.SimManager.init({
            delay : 100
        }).register(
            {
                '//bryntum.com/siesta_version'              : {
                    responseText : '{ "name" : "12.3.5" }'
                },
                'http://bryntum.com/changelogs/_siesta.php' : {
                    responseText : 'some changelog data HTML here'
                }
            }
        );

        t.getHarness(
            { viewDOM : true },
            ['testfiles/601_siesta_ui_passing.t.js']
        );

        t.chain(
            { waitForCQ : 'button[action=upgrade-siesta]' },

            { click : '>> button[action=upgrade-siesta]' },
            { waitForTextPresent : 'Download 12.3.5 (Lite)' },
            { waitForTextPresent : 'Download 12.3.5 (Standard)' }
        );
    })
});