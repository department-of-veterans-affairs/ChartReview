/**
 * Created by bradadams on 11/14/14.
 */
var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'ChartReview Test Suite',

    preload     : [
        // version of ExtJS used by your application
        '../../packages/chart-review-theme/build/resources/chart-review-theme-all-debug.css',
        '../../css/chartReviewer.css',

        // version of ExtJS used by your application
        '../../ext/build/ext-all-debug.js',
        '../../js/application.js'
    ],

    //runInPopup: true,
    viewportHeight: 1000,
    viewportWidth: 2000
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
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        items : [
            {
                title : 'CR Save',
                url : 'cr-save.js'
            }
        ]
    },
    {
        group : 'CR Submit/Hold',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        items : [
            {
                title : 'CR Submit/Hold',
                url : 'cr-submitHold.js'
            }
        ]
    },
    {
        group : 'CR Submit/Next',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        items : [
            {
                title : 'CR Submit/Next',
                url : 'cr-submitNext.js'
            }
        ]
    },
    {
        group : 'CR Annotation List Buttons',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        //runInPopup: true,
        items : [
            {
                title : 'CR Annotation List Buttons',
                url : 'cr-annotationListButtons.js'
            }
        ]
    },
    {
        group : 'CR Clinical Element View Buttons',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        //runInPopup: true,
        items : [
            {
                title : 'CR Clinical Element View Buttons',
                url : 'cr-clinicalElementViewButtons.js'
            }
        ]
    },
    {
        group : 'CR Portlets',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        //runInPopup: true,
        items : [
            {
                title : 'CR Portlets',
                url : 'cr-portlets.js'
            }
        ]
    },
    {
        group : 'CR Text Annotation',
        hostPageUrl: 'http://localhost:8080/chart-review/chart-review?projectId=de1eb12c-984d-4cd3-9941-0983567a5e81&processId=singleStepChartReview:1:4::50ff8b8e-8091-4f22-8ace-e02a8924efdd&taskId=33081&taskType=COMPLETED',
        items : [
            {
                title : 'CR Text Annotation',
                url : 'cr-textAnnotation.js'
            }
        ]
    }
);