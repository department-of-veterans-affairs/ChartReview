StartTest(function(t) {
    t.diag("CR Login");
    t.chain(

        { click : "#username", offset : [49, 10] },

        { action : "type", text : "admin[TAB]admin" },

        { click : "#submit", offset : [29, 17] }
        //{ click : "#a:contains(Help)", offset : [29, 17] }
        //
        //function (next) {
        //    t.waitForPageLoad(next)
        //
        //    t.click('>>a:contains(Home)', function () {})
        //}
        //
    );
})