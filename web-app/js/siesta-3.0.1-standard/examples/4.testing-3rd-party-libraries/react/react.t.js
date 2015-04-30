StartTest(function(t) {
    t.chain(
        { click : "#new-todo" },

        { action : "type", text : "some task[RETURN]" },

        { action : "type", text : "other task[RETURN]" },

        { action : "type", text : "yet another task[RETURN]" },

        { click : "#toggle-all" },

        { click : "#clear-completed" }
    );
});
