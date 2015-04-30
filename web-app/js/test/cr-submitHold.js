/**
 * Created by bradadams on 11/14/14.
 */
StartTest(function(t) {
    t.diag("CR Test 2");
    var viewDetail = "[clinicalElementConfigurationId='a57ba2f0-e55d-4f4a-848e-9bd7d2c233de']";
    t.chain(
        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextNowrap", offset : [59, 8] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail panel button[text=Classify] => .x-btn-button", offset : [37, 9] },

        function (next) {
            var popup = t.cq1('annotationschemapopupwindow');
            if(popup)
            {
                popup.show();
            }
            next();
        },

        { click : "#annotationschemapopuppanel => table.x-grid-item:nth-child(2) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [47, 9] },

        { click : "#annotationschemapopupwindow button[text=OK] => .x-btn-button", offset : [17, 6] },

        { click : "#holdNextButton-btnInnerEl", offset : [32, 10] },

        { click : "#messagebox-1001-textarea-inputEl", offset : [45, 12] },

        { action : "type", options : { shiftKey : true }, text : "Hello" },

        { click : "[itemId=ok] => .x-btn-button", offset : [21, 10] },

        { moveCursorTo : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextWrap", offset : [65, 21] },

        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextWrap", offset : [65, 21] },

        { click : "#annotationlistbuttontoolbar button[iconCls=annotationDelete] => .annotationDelete", offset : [7, 12] },

        { click : "#saveButton-btnInnerEl", offset : [16, 12] }    );
})
