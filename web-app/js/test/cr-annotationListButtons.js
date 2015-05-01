/**
 * Created by bradadams on 2/4/2015.
 */
StartTest(function(t) {
    t.diag("CR Annotation List Buttons");
    var viewDetail = "[clinicalElementConfigurationId='a57ba2f0-e55d-4f4a-848e-9bd7d2c233de']";
    t.chain(

        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextNowrap", offset : [160, 9] },



        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail panel button[text=Classify] => .x-btn-button", offset : [41, 11] },



        function (next) {
            var popup = t.cq1('annotationschemapopupwindow');
            if(popup)
            {
                popup.show();
            }
            next();
        },

        { dblclick : "#annotationschemapopuppanel => table.x-grid-item:nth-child(2) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [51, 8] },



        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(2) .x-grid-cell:nth-child(6) .cellTextNowrap", offset : [42, 4] },



        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail panel button[text=Classify] => .x-btn-button", offset : [45, 8] },



        function (next) {
            var popup = t.cq1('annotationschemapopupwindow');
            if(popup)
            {
                popup.show();
            }
            next();
        },

        { dblclick : "#annotationschemapopuppanel => table.x-grid-item:nth-child(3) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [38, 3] },



        { click : "#annotationlist-body", offset : [411, 111] },



        { click : "#annotationlistbuttontoolbar button[iconCls=filterDelete] => .filterDelete", offset : [8, 6] },



        { click : "#annotationlistbuttontoolbar button[iconCls=annotationsRefresh] => .annotationsRefresh", offset : [12, 7] },



        { click : "#annotationlistbuttontoolbar button[text=Wrap] => .x-btn-button", offset : [25, 6] },



        { click : "#annotationlistbuttontoolbar button[text=Wrap] => .x-btn-button", offset : [25, 6] },



        { click : "#annotationlistbuttontoolbar button[iconCls=annotationDelete] => .annotationDelete", offset : [14, 7] },



        { click : "#annotationlistbuttontoolbar cycle[text=All Annotations] => .x-btn-split", offset : [133, 6] },



        { click : "#level-menu{isVisible()} menucheckitem[text=Selected Document Annotations] => .x-menu-item-text", offset : [77, 14] },



        { click : "#annotationlistbuttontoolbar cycle[text=Selected Document Annotations] => .x-btn-button", offset : [142, 7] },



        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextWrap", offset : [29, 15] },



        { click : "#annotationlistbuttontoolbar button[iconCls=annotationDelete] => .annotationDelete", offset : [10, 13] },



        { click : "#saveButton-btnInnerEl", offset : [20, 13] }

    );
})
