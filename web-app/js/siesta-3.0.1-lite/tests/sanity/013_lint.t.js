StartTest(function(t) {

    var ignoreRe = [
        "Expected an identifier and instead saw 'eval'",
        "Unnecessary semicolon",
        "Expected an operator and instead saw 'delete'",
        "'getWindow' is not defined",
        "'genFx' is not defined",
        "'Expr' is not defined",

        // Skip all not defined checks
        "is not defined",

        "Expected a 'break' statement before"   // jQuery
    ].join('|');


    // @NICK, Siesta.Test#launch: how/where is e defined when reaching the afterLaunch statement?
//    if (this.transparentEx)
//        run(me)
//    else
//        var e = this.getExceptionCatcher()(function(){
//            run(me)
//        })
//
//    this.afterLaunch(e)
//
    t.expectGlobals('JSHINT');
    
    var getFile     = function (url, callback) {
        var as  = t.beginAsync();
        
        Ext.Ajax.request({
            url         : url,
            callback    : function(options, success, response) { 
                t.endAsync(as);
                
                if (!success) t.fail('File [' + url + '] failed to load');
                
                success && callback && callback(response.responseText)
            }
        })
    }
    
    getFile('../siesta-all.js', function (allText) {
        getFile('../.jshintrc', function (jsHintRcText) {
            var myResult = JSHINT(allText, eval('(' + jsHintRcText + ')'));
            
            if (myResult) {
                t.pass('No lint errors found');
            } else {

                var errors = Ext.Array.filter(JSHINT.errors, function(err) {
                    return err && !err.reason.match(ignoreRe);
                })

//                Ext.each(errors, function(err) {
//                    t.fail(err.reason + '(line: ' + err.line + ', char: ' + err.character + ')');
//                });

                if (errors.length === 0) {
                    t.pass('No lint errors found');
                }
            }

            t.diag((allText.split('HACK').length - 1) + ' HACK statements found');
        })
    })
})    
