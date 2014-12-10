/**
 * Created by bradadams on 11/14/14.
 */
var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'ChartReview Test Suite',

    preload     : [
        // version of ExtJS used by your application
        '../packages/chart-review-theme/build/resources/chart-review-theme-all-debug.css',
        '../../css/chartReviewer.css',

        // version of ExtJS used by your application
        '../ext/ext-all-debug.js',
        '../chart-review/app.js'
    ]
});

Harness.start(
    {
        group : 'CR Logout',
        hostPageUrl: 'http://localhost:8080/chart-review/',
        items : [
            {
                title : 'CR Logout',
                url : 'cr-logout.js'
            }
        ]
    },
    {
        group : 'CR Login',
        hostPageUrl: 'http://localhost:8080/chart-review/',
        items : [
            {
                title : 'CR Login',
                url : 'cr-login.js'
            }
        ]
    },
    {
        group : 'CR Save',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=57746c68-ff35-410a-ae56-ccf9e1eb3c18&processId=singleStepChartReview:1:4::85165c0d-7f67-45b0-a88b-7f6bedf21bb6&taskId=2828&taskType=COMPLETED',
        items : [
            {
                title : 'CR Save',
                url : 'cr-test1.js'
            }
        ]
    },
    {
        group : 'CR Submit/Next',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=57746c68-ff35-410a-ae56-ccf9e1eb3c18&processId=singleStepChartReview:1:4::85165c0d-7f67-45b0-a88b-7f6bedf21bb6&taskId=2828&taskType=COMPLETED',
        items : [
            {
                title : 'CR Submit/Next',
                url : 'cr-test2.js'
            }
        ]
    },
    {
        group : 'CR Submit/Hold',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=57746c68-ff35-410a-ae56-ccf9e1eb3c18&processId=singleStepChartReview:1:4::85165c0d-7f67-45b0-a88b-7f6bedf21bb6&taskId=2828&taskType=COMPLETED',
        items : [
            {
                title : 'CR Submit/Hold',
                url : 'cr-test3.js'
            }
        ]
    },
    {
        group : 'CR Text Annotation',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=57746c68-ff35-410a-ae56-ccf9e1eb3c18&processId=singleStepChartReview:1:4::85165c0d-7f67-45b0-a88b-7f6bedf21bb6&taskId=2828&taskType=COMPLETED',
        items : [
            {
                title : 'CR Text Annotation',
                url : 'cr-test4.js'
            }
        ]
    }
);