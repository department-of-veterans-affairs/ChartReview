/**
 * Created by bradadams on 11/14/14.
 */
// also supports: startTest(function(t) {
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
        { click : "#saveButton-btnInnerEl", offset : [22, 7] },

        { waitFor: 5000 },
        { click : "#annotationspanel-body tr.x-grid-row:nth-child(1) .x-grid-cell:nth-child(2)", offset : [44, 17] },

        { waitFor: 5000 },
        { click : "#annotationlistbuttontoolbar-targetEl .annotationDelete", offset : [10, 9] },

        { waitFor: 5000 },
        { click : "#saveButton-btnInnerEl", offset : [27, 9] }
//        function(next){
//            t.waitForComponentQuery("button",
//                function secondPart(comp){
////                    comp[2].body.dom.select();
//                    comp.
//                }, null, 10000);
//            next();
//        },
//        function ()
//        {
//            t.expect(true)
//        }
//        {
//            action : 'ok',
//            value : true,
//            description : "test1"
//        }
//        {
//            action : 'waitForComponentQuery',
//            query : "itemlistdetail [clinicalElementConfigurationId='37aa90bb-be98-4e2d-aefb-153716cd493f']",
//            callback : function (t, viewDetail) {
//                t.chain(
////                    {
////                        action : 'ok',
////                        value : true,
////                        description : "test2"
////                    },
//                    {
//                        action : 'selectText',
//                        target : viewDetail,
//                        start : 2,
//                        end : 3
//                    }
//                );
//            }
//        }
//        {
//            action : 'ok',
//            value : true,
//            description : "test3"
//        }

    );
})
//
//function sleep(milliseconds) {
//    var start = new Date().getTime();
//    for (var i = 0; i < 1e7; i++) {
//        if ((new Date().getTime() - start) > milliseconds){
//            break;
//        }
//    }
//}
//
//function secondPart(t, viewDetail){
//    t.wait(2200);
//}
