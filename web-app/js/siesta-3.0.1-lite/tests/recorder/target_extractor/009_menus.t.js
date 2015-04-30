StartTest(function (t) {

    t.it('Menu test', function (t) {
        // Menus require a bit of special treatment since a submenu doesn't open sync,
        // We may actually need to automatically inject a 'waitForTarget' statement before clicking a menu item
        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });
        recorder.attach(window);
        recorder.start();

        new Ext.SplitButton({
            renderTo : document.body,
            text : 'Button with menu',
            width : 130,
            menu : {
                items : [
                    {
                        text    : 'Foo',
                        handler : function () {
                        }
                    },
                    {
                        text    : 'Bar',
                        handler : function () {},
                        menu    : {
                            items : [
                                { text : 'Bacon' }
                            ]
                        }
                    }
                ]
            }
        });

        //one more button with the same menu items, so that extractor will generate queries including the menu component itself
        new Ext.SplitButton({
            renderTo : document.body,
            text : 'Button with another menu',
            width : 130,
            menu : {
                items : [
                    {
                        text    : 'Foo',
                        handler : function () {
                        }
                    },
                    {
                        text    : 'Bar',
                        handler : function () {},
                        menu    : {
                            items : [
                                { text : 'Bacon' }
                            ]
                        }
                    }
                ]
            }
        });
        
        var recorderManager, recorder;

        t.chain(
            { click : 'splitbutton[text=Button with menu] => .x-btn-split', offset : [115, 5] },
            { moveCursorTo : 'menu{isVisible()} menuitem[text=Bar] => .x-menu-item-text', offset : [10, 10] },
            { waitFor : 3500 },
            { waitFor : 'target', args : 'menu{isVisible()} menuitem[text=Bacon] => .x-menu-item-text' },
            { click : 'menu{isVisible()} menuitem[text=Bacon] => .x-menu-item-text', offset : [10, 10] },

            function () {
                var steps = recorder.getRecordedActionsAsSteps();

                recorder.stop();

                t.is(steps.length, 3)
                
                t.isDeeply(steps[ 0 ], { action : "click", target : "splitbutton[text=Button with menu] => .x-btn-split", offset : [115, 5] })
                t.isDeeply(steps[ 1 ], { action : "moveCursorTo", target : 'menuitem[text=Bar] => .x-menu-item-text', offset : [10, 10]  })
                t.isDeeply(steps[ 2 ], { action : "click", target : "menuitem[text=Bacon] => .x-menu-item-text", offset : [10, 10] })
            }
        )
    })
})