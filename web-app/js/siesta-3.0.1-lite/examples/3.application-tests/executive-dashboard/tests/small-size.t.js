StartTest(function(t) {
    t.chain(
        { click : "tool[type=gear] => .x-tool-img" },

        { click : "menuitem[text=Performance] => .x-menu-item-text" },

        { click : "tool[type=gear] => .x-tool-img" },

        { click : "menuitem[text=Profit & Loss] => .x-menu-item-text" },

        { click : "tool[type=gear] => .x-tool-img" },

        { click : "menuitem[text=Company News] => .x-menu-item-text" }
    );
})    
