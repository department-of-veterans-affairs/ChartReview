var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title              : 'Siesta Examples',
    viewDOM            : true,
    
    enableCodeCoverage : Siesta.Harness.Browser.Automation, // Only in full version of Siesta
    coverageUnit       : 'extjs_class', // can be "file" or "extjs_class"

    // Define any global JS and CSS dependencies, these files will be injected into each test.
    preload            : [],

    // If your tests use dynamic loading, you can setup your paths using the 'loaderPath' config.
    loaderPath         : { 'Ext.ux' : '//cdn.sencha.com/ext/gpl/5.1.0/examples/ux' }
});

Harness.start(
    // Start here, and learn the basic unit testing functionality in Siesta
    {
        group            : 'Unit tests',
        autoCheckGlobals : true,
        sandbox          : false, // speeds it up, sharing the same iframe for tests in this group

        items : [
            '1.unit-tests/basic_assertions.t.js',
            '1.unit-tests/async_code.t.js',
            '1.unit-tests/todo_tests.t.js',
            '1.unit-tests/wait_for.t.js',
            '1.unit-tests/bdd.t.js',
            '1.unit-tests/spies.t.js',

            // A test descriptor can also be an object with `url` property and its own config options
            {
                autoCheckGlobals    : true,
                url                 : '1.unit-tests/global_variables.t.js',
                name                : 'global variables'
            },
            // Siesta can also run a Jasmine test suite
            {
                name            : 'Jasmine tests',
                jasmine         : true,
                expectedGlobals : ['Player', 'Song'],
                // url should point to the specs runner html page in this case
                url             : '1.unit-tests/jasmine_suite/SpecRunner.html'
            }
        ]
    },

    {
        group   : 'UI tests',
        preload : [
            "//cdn.sencha.com/ext/gpl/5.1.0/packages/ext-theme-crisp/build/resources/ext-theme-crisp-all.css",
            "//cdn.sencha.com/ext/gpl/5.1.0/build/ext-all.js"
        ],
        items   : [
            {
                group : 'General',

                items : [
                    '2.ui-tests/general/resize.t.js',
                    '2.ui-tests/general/window.t.js',
                    '2.ui-tests/general/targeting_buttons.t.js',
                    '2.ui-tests/general/ext-bug.t.js',
                    {
                        runCore : 'sequential',
                        url     : '2.ui-tests/general/combo.t.js'
                    },
                    {
                        runCore : 'sequential',
                        url     : '2.ui-tests/general/custom-combo.t.js'
                    }
                ]
            },
            {
                group : 'Drag and drop',

                items : [
                    {
                        // Specify your own HTML page if you want
                        hostPageUrl : '2.ui-tests/drag-drop/cats.html',
                        url         : '2.ui-tests/drag-drop/drag-drop.t.js'
                    },
                    '2.ui-tests/drag-drop/dd-tree.t.js'
                ]
            },
            {
                group : 'Forms',

                items : [
                    '2.ui-tests/form/basic_form.t.js',
                    '2.ui-tests/form/checkboxes.t.js'
                ]
            },
            {
                group     : 'Grid',
                testClass : Your.Test.Class,

                items : [
                    '2.ui-tests/grid/basic.t.js',
                    '2.ui-tests/grid/waitfor_grid.t.js',
                    '2.ui-tests/grid/mouseover.t.js',
                    '2.ui-tests/grid/sel_model.t.js',
                    '2.ui-tests/grid/resizing.t.js',
                    // Tests that rely on browser focus should be run sequentially to prevent different
                    // tests stealing focus from each other
                    {
                        url     : '2.ui-tests/grid/editing.t.js',
                        runCore : 'sequential'
                    },
                    {
                        url     : '2.ui-tests/grid/editing_with_row_editor.t.js',
                        runCore : 'sequential'
                    }
                ]
            }
        ]
    },

    {
        group   : 'Application tests',
        runCore : 'sequential',
        // uncomment to run the tests in popup
        //runInPopup  : true,
        items   : [
            {
                name        : 'Basic Ext JS MVC app',
                loaderPath  : { 'AM' : '3.application-tests/extjs-mvc/app' },
                hostPageUrl : '3.application-tests/extjs-mvc/app.html',
                url         : '3.application-tests/extjs-mvc/tests/app.t.js'
            },
            {
                name        : 'Ext JS Ticket app',
                hostPageUrl : '3.application-tests/ticket-app/',
                url         : '3.application-tests/ticket-app/tests/smoke_test.t.js'
            },
            {
                name           : 'Responsive app test - landscape',
                viewportWidth  : 1024,
                viewportHeight : 768,
                hostPageUrl    : '3.application-tests/executive-dashboard/',
                url            : '3.application-tests/executive-dashboard/tests/large-size.t.js'
            },
            {
                name           : 'Responsive app test - portrait',
                viewportWidth  : 500,
                viewportHeight : 700,
                hostPageUrl    : '3.application-tests/executive-dashboard/',
                url            : '3.application-tests/executive-dashboard/tests/small-size.t.js'
            },
            {
                name        : 'Portal application',
                hostPageUrl : '3.application-tests/portal/',
                url         : '3.application-tests/portal/tests/smoke_test.t.js'
            },
            {
                name        : 'Monkey testing',
                hostPageUrl : '3.application-tests/portal/',
                url         : '3.application-tests/portal/tests/monkey_test.t.js'
            },
            // do not show this example in Lite version
            !Harness.isStandardPackage() ? null :
            {
                // make sure we'll reach the correct exit point
                name            : 'Page redirect',
                needDone        : true,
                separateContext : true,
                hostPageUrl     : '3.application-tests/page-redirect/source_page.html',
                url             : '3.application-tests/page-redirect/page_redirect.t.js'
            }
        ]
    },

    /**
     * Siesta can test any JavaScript or web page, here are some samples of other JS frameworks
     */
    {
        group : '3rd party JS-libraries',
        items : [
            {
                group       : 'Angular',
                preload     : [
                    '4.testing-3rd-party-libraries/angularjs/angular.min.js',
                    '4.testing-3rd-party-libraries/angularjs/angular-mocks.js',
                    '4.testing-3rd-party-libraries/angularjs/app.js'
                ],
                items       : [
                    '4.testing-3rd-party-libraries/angularjs/angular.t.js'
                ]
            },
            {
                group     : 'jQuery',
                testClass : Siesta.Test.jQuery,

                preload : [
                    // Jquery CDN
                    'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
                ],

                items : [
                    '4.testing-3rd-party-libraries/jquery/hello_world.t.js',
                    {
                        hostPageUrl : '4.testing-3rd-party-libraries/jquery/jquery_ui.html',
                        preload     : 'inherit',
                        alsoPreload : [
                            'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.min.js',
                            'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/themes/black-tie/jquery-ui.css'
                        ],
                        url         : '4.testing-3rd-party-libraries/jquery/jquery_ui_selectable.t.js'
                    },
                    {
                        url : '4.testing-3rd-party-libraries/jquery/monkey.t.js'
                    }
                ]
            },
            {
                group       : 'Polymer',
                hostPageUrl : '4.testing-3rd-party-libraries/polymer/finished',
                items       : [
                    '4.testing-3rd-party-libraries/polymer/polymer.t.js'
                ]
            },
            {
                group     : 'PrototypeJS',
                testClass : Siesta.Test.Browser,
                preload   : [
                    "4.testing-3rd-party-libraries/prototypejs/prototype.js"
                ],
                items     : [
                    '4.testing-3rd-party-libraries/prototypejs/hello_world.t.js'
                ]
            },
            // react example throws exception in IE10 - this is not Siesta's fault, so we just hide it in IE10
            $.browser.msie && $.browser.version == 10 ? null :
            {
                group       : 'React',
                hostPageUrl : '4.testing-3rd-party-libraries/react/',
                items       : [
                    '4.testing-3rd-party-libraries/react/react.t.js'
                ]
            }
        ]
    },
    !Harness.isStandardPackage() ? null :  
    {
        group   : 'Code coverage',
        preload : [
            "//cdn.sencha.com/ext/gpl/4.2.0/resources/css/ext-all.css",
            "//cdn.sencha.com/ext/gpl/4.2.0/ext-all-debug.js",
            {
                url        : "5.code_coverage/several_classes_in_one_file.js",
                instrument : true
            },
            {
                url        : "5.code_coverage/some_folder/preload_file.js",
                instrument : true
            },
            {
                url        : "5.code_coverage/some_folder/folder2/preload_file.js",
                instrument : true
            }
        ],
        items   : [
            {
                group : 'Static loading',

                items : [
                    '5.code_coverage/010_range.t.js',
                    '5.code_coverage/020_event.t.js'
                ]
            },
            {
                group : 'Dynamic loading',

                loaderPath : {
                    My : '5.code_coverage/lib/My'
                },

                preload : [
                    "//cdn.sencha.com/ext/gpl/4.2.0/resources/css/ext-all.css",
                    "//cdn.sencha.com/ext/gpl/4.2.0/ext-all-debug.js",
                    {
                        url        : "5.code_coverage/several_classes_in_one_file.js",
                        instrument : true
                    }
                ],

                items : [
                    '5.code_coverage/030_loader.t.js'
                ]
            },
            {
                // example of getting code coverage for application
                group : 'Code coverage for application code',

                hostPageUrl : '5.code_coverage/hostPageUrl.html',

                items : [
                    '5.code_coverage/040_hostPageUrl.t.js'
                ]
            }
        ]
    },
    {
        group   : 'Misc',
        preload : [
            "//cdn.sencha.com/ext/gpl/5.1.0/packages/ext-theme-crisp/build/resources/ext-theme-crisp-all.css",
            "//cdn.sencha.com/ext/gpl/5.1.0/build/ext-all.js"
        ],
        items   : [
            '6.misc/ajax.t.js',
            {
                requires : ['Ext.ux.ajax.SimManager'],
                url      : '6.misc/ajax-mock.t.js'
            }
        ]
    }
);
// eof Harness.start
