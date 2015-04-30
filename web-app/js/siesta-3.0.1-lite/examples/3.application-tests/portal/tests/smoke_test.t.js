StartTest(function (t) {
    t.chain(
        { drag : "#dashboard-1015_stockTicker2_header title[text=Stocks] => .x-title-text", by : [-275, -1] },

        { click : "#dashboard-1015_stockTicker2_header tool[type=collapse-top] => .x-tool-img" },

        { waitForAnimations : [] },

        { click : "#dashboard-1015_rss1_header tool[type=close] => .x-tool-img" },

        { click : "#app-options_header splitbutton[text=Add Feed] => .x-btn-split", offset : [76, 4] },

        { click : ">>menuitem[text=Ajaxian]" }
    );
});
