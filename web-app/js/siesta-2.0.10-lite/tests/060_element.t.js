StartTest(function(t) {
    
    t.testJQuery(function (t) {

        t.it('Visibility tests', function(t) {

            t.$('body').html('<div id="div" style="display:none; height:20px;width:20px"></div>');

            t.selectorExists('#div', 'selectorExists OK');

            t.waitForElementVisible('#div', function() {
                t.pass('waitForElementVisible')

                t.waitForElementNotVisible('#div', function() {
                    t.pass('waitForElementNotVisible')

                    t.elementIsNotVisible('#div', 'Not visible');

                    t.$('body').html('<div id="div" style="height:20px;width:20px"></div>');
                    t.elementIsVisible('#div', 'Not visible');

                    t.$('body').html('<div id="div" class="cls" style="height:20px;width:20px">foo</div>');
                    t.elementIsVisible('#div', 'Not visible');
                })

                t.$('#div').css('display', 'none');
            })

            t.$('#div').css('display', 'block');
        })

        t.it('Content matching tests', function(t) {
            t.$('body').html('<div class="bar" style="height:100px;width:100px">foo</div>');

            t.contentLike(t.$('div'), 'foo', '"foo" found in div');
            t.contentNotLike(t.$('div'), 'foof', '"foof" not found in div');

            t.waitForContentLike(t.$('div'), 'bar', function() {
                t.pass('"bar" found in div');
            });

            t.$('div').html('bar');
        });

        t.it('CSS class and style detection', function(t) {
            t.$('body').html('<div class="cls" style="display:none;height:20px;width:20px"></div>');

            t.hasNotCls($('div'), 'abc', '"abc" CSS class not found');
            t.hasCls($('div'), 'cls', '"cls" CSS class found');

            t.hasNotStyle($('div'), "height", '21px', 'Height 21px not found');
            t.hasStyle($('div'), "height", '20px', 'Height 20px found');
        });

        t.it('waitForSelector', function(t) {
            t.$('body').html('<div class="bar" style="height:100px;width:100px">foo</div>');

            t.chain(
                { waitFor : 'SelectorAt', args : [[50, 50], 'div.bar'] },

                function(next) {
                    t.pass('waitForSelectorAt did its job');

                    next();

                    setTimeout(function() {
                        t.$('body').html('');
                    }, 200)
                },

                { waitFor : 'waitForContentNotLike', args : [document.body, 'foo'] },

                function(next) {
                    t.pass('waitForContentNotLike did its job');

                    next();

                    setTimeout(function() {
                        t.$('body').html('<p class="qwerty"></p>');
                    }, 200)
                },

                { waitFor : 'selector', args : ['.qwerty', document.body] },

                function(next) {
                    t.pass('waitForSelector did its job');

                    t.$('body').html('<div class="z1" style="height:100px;width:100px;position:absolute;z-index:1">foo</div><div class="z2" style="height:100px;width:100px;position:absolute;z-index:2">foo2</div>');

                    next();

                    setTimeout(function() {
                        t.$('.z1').css('z-index', 3);
                    }, 200)
                },

                { waitFor : 'ElementTop', args : 'div.z1' },

                function(next) {
                    t.pass('waitForElementTop did its job');

                    next();

                    setTimeout(function() {
                        t.$('.z1').css('z-index', 1);
                    }, 200);
                },


                { waitFor : 'ElementNotTop', args : ['div.z1'] },

                function(next) {
                    t.pass('waitForElementNotTop did its job');

                    t.elementIsTopElement(t.$('.z2'), false, 'elementIsTopElement worked');
                    t.elementIsNotTopElement(t.$('.z1'), false, 'elementIsNotTopElement worked');

                    t.elementIsAt(t.$('.z2'), [20, 20], false, 'elementIsAt worked');
                    t.selectorIsAt(t.$('.z2'), [20, 20], 'selectorIsAt worked');

                    t.monkeyTest($('div'), 5, null, function() {});
                }
            );
        });
    });

    t.it('Failing assertions', function(t) {
        t.expectFail(function(t) {
            document.body.className = 'foo';

            t.hasNotCls(document.body, 'foo');
            t.hasStyle(document.body, 'color', 'bacon');

            t.$(document.body).css("text-align", "right");

            t.hasNotStyle(document.body, 'text-align', 'right');
        })
    })
});
