StartTest(function(t) {

    // Monkey testing is a great way to find hidden bugs as random events (clicks, drag etc)
    // could trigger unhandled exceptions in your application

    t.monkeyTest(document.body, 20);
})    