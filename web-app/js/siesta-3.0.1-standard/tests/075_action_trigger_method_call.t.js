StartTest(function(t) {
    
    t.testExtJS(function (t) {
        var observable  = new Ext.util.Observable()
        
        // frame : false is required as of ExtJS 4.2.0
        var btn = new Ext.button.Button({ 
            text            : 'text', 
            id              : 'bar', 
            cls             : 'foo', 
            renderTo        : Ext.getBody(), 
            frame           : false,
            listeners       : {
                click   : function () {
                    observable.fireEvent('someevent')
                }
            }
        });
        
        t.chain(
            {
                waitFor     : 'Event', args : [ observable, 'someevent' ],
                
                trigger     : { click : btn }
            },
            function () {
                var btn2 = new Ext.button.Button({ 
                    text            : 'text', 
                    renderTo        : Ext.getBody(), 
                    frame           : false
                });
                
                t.chain(
                    {
                        waitForEvent    : [ btn2, 'click' ]
                    }
                )
                
                t.click(btn2)
            }
        )
        

    });
});
