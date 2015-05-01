/**
 * Created by bradadams on 2/4/2015.
 */
StartTest(function(t) {
    t.diag("CR Portlets");
    var viewDetail = "[clinicalElementConfigurationId='a57ba2f0-e55d-4f4a-848e-9bd7d2c233de']";
    t.chain(
        { click : "#annotationpanel_header tool[type=collapse-left] => .x-tool-img", offset : [10, 9] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Patient] header tool[type=close] => .x-tool-img", offset : [11, 10] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] header tool[type=collapse-top] => .x-tool-img", offset : [8, 6] },

        { click : "#app-header-clinical-view-menu-btnInnerEl", offset : [1, 5] },

        { click : "menuitem[text=Public Health Lab1] => .x-menu-item-text", offset : [2, 11] },

        { drag : [1418, 232], by : [12, 345] },

        { click : [832, 312] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] header => .x-box-inner", offset : [1358, 13] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] header tool[type=expand-bottom] => .x-tool-img", offset : [10, 8] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(5) .x-grid-cell:nth-child(6) .cellTextNowrap", offset : [14, 5] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(4) .cellTextNowrap", offset : [28, 5] },

        { moveCursorTo : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid button[text=Auto-select] => .x-btn-button", offset : [59, 5] },

        { drag : ">>#app-portal clinicalelementportlet[title=Public Health Lab1]", offset : [1397, 203], by : [-1042, -9] },

        { drag : ">>#app-portal clinicalelementportlet[title=Public Health Lab1]", offset : [355, 194], by : [506, -5] },

        { click : "#app-portal-innerCt .x-tool-img.x-tool-close", offset : [11, 8] },

        { click : ">>#app-header-clinical-view-menu", offset : [3, 10] },

        { click : ">>menuitem[text=Public Health Patient]", offset : [2, 13] },

        { drag : ">>#app-portal clinicalelementportlet[title=Public Health Lab1]", offset : [860, 57], by : [537, 45] },

        { click : "#annotationpanel header tool[type=expand-right] => .x-tool-img", offset : [5, 4] }
    );
})
