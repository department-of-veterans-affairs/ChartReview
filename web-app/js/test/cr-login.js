StartTest(function(t) {
    t.diag("CR Login");
    t.chain(

        { click : "#username", offset : [49, 10] },

        { action : "type", text : "u1[TAB]u1" },

        { click : "#submit", offset : [29, 17] },

        { action: 'done' }

    );
})