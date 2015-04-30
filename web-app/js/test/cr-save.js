/**
 * Created by bradadams on 2/4/2015.
 */
StartTest(function(t) {
    t.diag("CR Test 1");
    var viewDetail = "[clinicalElementConfigurationId='a57ba2f0-e55d-4f4a-848e-9bd7d2c233de']";
    t.chain(
        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextNowrap", offset : [131, 12] },

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail panel button[text=Classify] => .x-btn-button", offset : [34, 6] },

        function (next) {
            var popup = t.cq1('annotationschemapopupwindow');
            if(popup)
            {
                popup.show();
            }
            next();
        },

        { click : "#annotationschemapopuppanel => table.x-grid-item:nth-child(2) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [42, 4] },

        { click : "#annotationschemapopupwindow button[text=OK] => .x-btn-button", offset : [12, 11] },

        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(4) .cellTextWrap", offset : [6, 12] },

        { click : "#saveButton-btnInnerEl", offset : [28, 10] },

        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextWrap", offset : [57, 19] },

        { click : "#annotationlistbuttontoolbar button[iconCls=annotationDelete] => .annotationDelete", offset : [9, 10] },

        { click : "#saveButton-btnInnerEl", offset : [22, 7] }
    );
})
