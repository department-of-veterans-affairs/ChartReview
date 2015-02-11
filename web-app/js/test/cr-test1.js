/**
 * Created by bradadams on 2/4/2015.
 */
// also supports: startTest(function(t) {
StartTest(function(t) {
    t.diag("CR Test 1");
    var viewDetail = "[clinicalElementConfigurationId='37aa90bb-be98-4e2d-aefb-153716cd493f']";
    t.chain(
        { waitFor: 2000 },
        { click : ">>#dashboard clinicalelementportlet[title=Lab Element] iteminfo itemlist[title=List (9 of 9)] itemlistgrid [itemId=view]", offset : [25, 21] },

        { waitFor: 2000 },
        { dblclick : ">>#dashboard clinicalelementportlet[title=Lab Element] iteminfo itemlist[title=List (9 of 9)] panel itemlistdetail", offset : [59, 85] },

        { waitFor: 2000 },
        { dblclick : "#annotationschemapopuppanel => table.x-grid-item:nth-child(2) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [36, 10] },

        { waitFor: 2000 },
        { moveCursorTo : "#saveButton-btnInnerEl", offset : [11, 4] },

        { waitFor: 2000 },
        { click : "#saveButton-btnInnerEl", offset : [11, 5] },

        { waitFor: 2000 },
        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(1)", offset : [97, 13] },

        { waitFor: 2000 },
        { click : "#annotationlistbuttontoolbar button[iconCls=annotationDelete] => .annotationDelete", offset : [13, 12] },

        { waitFor: 2000 },
        { click : "#saveButton-btnInnerEl", offset : [17, 2] }
    );
})
