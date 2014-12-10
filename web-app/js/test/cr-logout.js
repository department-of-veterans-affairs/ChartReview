StartTest(function(t) {
    t.diag("CR Logout");
    t.chain(

        { click : ".nav.pull-right", offset : [191, 19] },

        { action: 'done' }

    );
})