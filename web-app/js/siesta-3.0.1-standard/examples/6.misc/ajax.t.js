StartTest(function(t) {
    
    Ext.Ajax.request({
        url : 'browse-all-desktop.js'   // Just grab some file
    });

    // Waits until Ext.data.Connection.isLoading returns false
    t.waitForAjaxRequest(function() {
        t.pass('Nice');
    });

    var req = Ext.Ajax.request({
        url : '/'   // Just grab some file
    });

    // Or wait for a specific request
    t.waitForAjaxRequest(req, function(requestObj) {
        t.is(requestObj.options.url, '/', 'Grabbed root document');
    });

    //t.ajaxRequestAndThen('index.html', function(options, success, response) {
    //    t.ok(response.responseText.match('siesta-all.js'), 'Found siesta-all.js in the index.html, seems reasonable.');
    //});
});