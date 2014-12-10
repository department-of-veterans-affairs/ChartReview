var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'Siesta Examples',
    
    viewDOM     : true
});

Harness.start(
    {
        group       : 'Basics',
        autoCheckGlobals : true,
        
        testClass   : Siesta.Test.Browser,
        
        items       : [
            '010-basics/010_basic_assertions.t.js',
            '010-basics/020_async_code.t.js',
            
            // and object with `url` property and its own "preload" option
            {
                url : '010-basics/030_global_variables.t.js',
                name : 'Global variables',  // You can also use the name config if your urls are hard to read
                preload : [
                    // Jquery CDN
                    'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
                ]
            },
            '010-basics/040_todo_tests.t.js',
            '010-basics/050_wait_for.t.js',
            '010-basics/060_bdd.t.js'
        ]
    },
    
    {
        group       : 'Generic browser tests',
        
        testClass   : Siesta.Test.Browser,
        
        items       : [
            '011-basic-browser/010_text_selection.t.js'
        ]
    },
    
    // sencha examples
    {
        group       : 'Sencha Ext JS examples',
        
        testClass   : Siesta.Test.ExtJS,
        preload : [
            "http://cdn.sencha.io/ext/gpl/4.2.0/resources/css/ext-all.css",
            "http://cdn.sencha.io/ext/gpl/4.2.0/ext-all.js"

            // Uncomment these to try running the tests using Ext JS 5
//            "http://dev.sencha.com/ext/5.0.0/packages/ext-theme-classic/build/resources/ext-theme-classic-all-debug.css",
//            "http://dev.sencha.com/ext/5.0.0/ext-all-debug.js"

        ],

        items       : [
            {
                group       : 'General',
                
                items       : [
                    '020-extjs-general/010_ext-bug.t.js',
                    '020-extjs-general/015_ext-combo.t.js',
                    {
                        url : '020-extjs-general/020_ext-custom-combo.t.js',
                        useStrictMode   : false        // You can also use quirks mode for tests
                    },
                    {
                        url : '020-extjs-general/030_ext-resize.t.js'
                    },
                    '020-extjs-general/040_ext-window.t.js',
                    '020-extjs-general/060_extjs_targeting_buttons.t.js',
                    '020-extjs-general/070_detecting_ext_overrides.t.js'
                ]
            },
            {
                group       : 'Basic drag drop',
        
                items       : [
                    {
                        // Specify your own HTML page if you want
                        hostPageUrl     : '021-extjs-drag-drop/cats.html',
                        url             : '021-extjs-drag-drop/010_drag-drop.t.js',
                        preload         : []
                    },
                    '021-extjs-drag-drop/020_dd-tree.t.js'
                ]
            },
            {
                group       : 'Forms',
        
                items       : [
                    '022-extjs-form/010_basic_form.t.js',
                    '022-extjs-form/020_checkboxes.t.js'
                ]
            },
            {
                group       : 'Grid',
                
                testClass : Your.Test.Class,
        
                items       : [
                    '023-extjs-grid/010_basic.t.js',
                    '023-extjs-grid/011_waitfor_grid.t.js',
                    '023-extjs-grid/020_mouseover.t.js',
                    '023-extjs-grid/030_sel_model.t.js',
                    '023-extjs-grid/040_editing.t.js',
                    '023-extjs-grid/041_editing_with_row_editor.t.js',
                    '023-extjs-grid/050_resizing.t.js'
                ]
            },
            {
                group       : 'MVC',  
                loaderPath  : { 'AM' : '025-extjs-mvc/app'},
                items               : [
                    {
                        group               : 'Sanity',
                        items               : [
                            '025-extjs-mvc/tests/010_sanity.t.js'
                        ]
                    },
                    {
                        group               : 'Model',
                        items               : [
                            '025-extjs-mvc/tests/011_usermodel.t.js'
                        ]
                    },
                    {
                        group               : 'Application',
                        loaderPath          : { 'AM' : 'app' },
                        // need to set the `preload` to empty array - to avoid the double loading of dependencies
                        preload             : [],
                        items : [
                            {
                                hostPageUrl         : '025-extjs-mvc/app.html',
                                url                 : '025-extjs-mvc/tests/014_app.t.js'
                            }
                        ]
                    }
                ]
            },

            {
                group       : 'Ext JS 3',
                preload : [
                    "http://cdn.sencha.io/ext-3.4.0/resources/css/ext-all.css",
                    "http://cdn.sencha.io/ext-3.4.0/adapter/ext/ext-base-debug.js",
                    "http://cdn.sencha.io/ext-3.4.0/ext-all-debug.js"
                ],

                items       : [
                    $.browser.msie ? null : '026-extjs3/010_ext-resize.t.js',
                    $.browser.msie ? null : '026-extjs3/020_ext-window.t.js',
                    '026-extjs3/030_ext-grid.t.js'
                ]
            },

            {
                group       : 'Ext JS 5 examples',
                
                preload     : [
                    "http://dev.sencha.com/ext/5.0.0/packages/ext-theme-classic/build/resources/ext-theme-classic-all-debug.css",
                    "http://dev.sencha.com/ext/5.0.0/ext-all-debug.js"
                ],

                items       : [
                    {
                        testClass   : Your.Test.Class,
                        url         : '023-extjs-grid/020_mouseover.t.js?Ext5'
                    },
                    // Testing one of the sample applications inside the Ext 5 SDK
                    {
                        hostPageUrl : '027-extjs5/ticket-app/',
                        url         : '027-extjs5/001_smoke_test.t.js'
                    }
                ]
            }
        ]
    },
    // eof sencha examples
    
    {
        group       : 'jQuery',
        testClass   : Siesta.Test.jQuery,
        
        preload : [
            // Jquery CDN
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
        ],
        
        items       : [
            '040-jquery/010_hello_world.t.js',
            {
                hostPageUrl         : '040-jquery/020_jquery_ui.html',
                preload             : 'inherit',
                alsoPreload         : [
                    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.min.js',
                    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/themes/black-tie/jquery-ui.css'
                ],
                url : '040-jquery/020_jquery_ui_selectable.t.js'
            },
            {
                url : '040-jquery/030_monkey.t.js'
            }
        ]
    },
    {
        group       : 'PrototypeJS',
        
        testClass   : Siesta.Test.Browser,
        
        preload : [
            "050-prototypejs/prototype.js"
        ],
        items       : [
            '050-prototypejs/hello_world.t.js'
        ]
    },
    !Siesta.Harness.Browser.Automation 
        ? 
    // do not show these example in Lite version
    [] 
        : 
    {
        group       : 'Standard package features',
        
        preload     : [],
        items       : [
            {
                // make sure we'll reach the correct exit point
                needDone            : true,
                separateContext     : true,
                hostPageUrl         : '100-standardpkg-page-redirect/source_page.html',         
                url                 : '100-standardpkg-page-redirect/010_page_redirect.t.js'
            }
        ]
    }
);
// eof Harness.start
