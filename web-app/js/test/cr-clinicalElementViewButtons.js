/**
 * Created by bradadams on 2/4/2015.
 */
StartTest(function(t) {
    t.diag("CR Clinical Element View Buttons");
    var viewDetail = "[clinicalElementConfigurationId='a57ba2f0-e55d-4f4a-848e-9bd7d2c233de']";
    t.chain(

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(4) .cellTextNowrap", offset : [87, 11] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail [itemId=itemlistdetail-1046-viewInNewTab] => .x-btn-button", offset : [36, 15] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo tabbar tab[text=Pulse 1] => .x-tab-close-btn", offset : [7, 5] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid button[text=Description] => .x-btn-button", offset : [43, 6] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid button[text=Description] => .x-btn-button", offset : [43, 6] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid button[text=Wrap] => .x-btn-button", offset : [24, 10] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid button[text=Wrap] => .x-btn-button", offset : [24, 10] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail button[text=Done] => .x-btn-button", offset : [36, 9] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail button[text=Done] => .x-btn-button", offset : [36, 9] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(6) .cellTextNowrap", offset : [114, 13] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail button[text=Done] => .x-btn-button", offset : [30, 4] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail button[text=Done] => .x-btn-button", offset : [30, 4] },

        { moveCursorTo : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(5)", offset : [20, 17] }

    );
})
