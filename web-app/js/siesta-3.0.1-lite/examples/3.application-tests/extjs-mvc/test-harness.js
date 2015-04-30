var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'MVC Test Suite',
    loaderPath  : { 'AM' : 'app' },
    
    preload : [
        "http://cdn.sencha.io/ext/gpl/4.2.0/resources/css/ext-all.css",
        "http://cdn.sencha.io/ext/gpl/4.2.0/ext-all-debug.js"
    ]
    
});

Harness.start(
    {
        group               : 'Sanity',
        items               : [
            'tests/sanity.t.js'
        ]
    },
    {
        group               : 'Model',
        items               : [
            'tests/usermodel.t.js'
        ]
    },
    {
        group               : 'Views',
        items               : [
            'tests/userlist_view.t.js',
            'tests/useredit_view.t.js'
        ]
    },
    {
        group               : 'Application',
        
        // need to set the `preload` to empty array - to avoid the double loading of dependencies
        preload             : [],
        
        items : [
            {
                hostPageUrl         : 'app.html',
                url                 : 'tests/app.t.js'
            }
        ]
    }
);

