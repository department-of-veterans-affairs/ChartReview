StartTest(function(t) {

    t.expectPass(function(t) {
        t.$('body').append('<div id="div"></div>');

        t.elementIsEmpty('#div')

        t.waitForElementEmpty('#div', function() {
            t.pass('waitForElementEmpty')
        })

        t.$('#div')[0].innerHTML = "   ";
        t.elementIsEmpty('#div');


    })

    t.expectFail(function(t) {
        t.$('body').append('<div id="div2">a</div>');

        t.elementIsEmpty('#div2')
    })

    t.expectPass(function(t) {
        t.$('body').append('<div id="div3" style="width:100px;height:30px;background:red;overflow:scroll"><div style="width:200px;">asf</div></div>');
        t.elementIsNotEmpty('#div3', 'elementIsNotEmpty PASS');

        t.waitForElementNotEmpty('#div3', function() {
            t.pass('waitForElementNotEmpty')
        })

        t.isInView('#div3', 'isInView PASS');

        t.waitForScrollChange('#div3', 'left', function() {
            t.pass('waitForScrollChange PASS')
        });

        document.getElementById('div3').scrollLeft = 20;
    })

    t.expectFail(function(t) {
        t.waitForTimeout = 300;

        t.$('body').append('<div id="div4"></div>');
        t.$('body').append('<div id="div5" style="position:absolute;width:10px;left:-1000px"></div>');

//        t.isInView('#div5', 'isInView FAIL');

        t.elementIsNotEmpty('#div4', 'elementIsNotEmpty FAIL');

        t.waitForScrollChange('#div4', 'left', function() {
            t.pass('waitForScrollChange FAIL')
        })

    })
});
