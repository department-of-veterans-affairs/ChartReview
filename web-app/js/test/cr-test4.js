//title : 'CR Text Annotation',
StartTest(function(t) {
    t.diag("CR Test 1");
    var viewDetail = "[clinicalElementConfigurationId='37aa90bb-be98-4e2d-aefb-153716cd493f']";
    t.chain(
        { waitFor: 5000 },
        { click : "#annotationspanel-body tr.x-grid-row:nth-child(2) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [78, 9] },

        { waitFor: 5000 },
        { click : "#app-portal-col-1 .itemlist-grid tr.x-grid-row:nth-child(1) .x-grid-cell:nth-child(2)", offset : [10, 10] },

        { waitFor: 5000 },
        { click : "#app-portal-col-1 clinicalelementportlet[title=Lab Element] iteminfo itemlist[title=List (72 of 72)] panel itemlistdetail panel button[text=Classify] => .x-btn-icon-el", offset : [26, 5] },

        { waitFor: 5000 },
        { click : "#holdNextButton-btnInnerEl", offset : [31, 3] },
        { action : "type", text : "asbc" },
        { click : "[itemId=ok] => .x-btn-icon-el", offset : [48, 12] }
    );
})
