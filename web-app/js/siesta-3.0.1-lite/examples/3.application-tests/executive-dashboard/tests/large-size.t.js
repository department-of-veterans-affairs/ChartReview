StartTest(function(t) {
    t.chain(
        { click : "tab[text=Performance] => .x-tab-inner" },

        { click : "tab[text=Profit & Loss] => .x-tab-inner" },

        { click : "tab[text=Company News] => .x-tab-inner", offset : [47, 12] },

        { click : "[itemId=news] cycle[text=All Posts] => .x-btn-split", offset : ['90%', '50%'] },

        { click : "#news-menu{isVisible()} [itemId=news] => .x-menu-item-text" },

        { click : "[itemId=news] cycle[text=News] => .x-btn-split", offset : [133, 6] },

        { click : "#news-menu{isVisible()} [itemId=forum] => .x-menu-item-text" }
    );
})    
