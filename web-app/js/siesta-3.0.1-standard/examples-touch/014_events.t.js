StartTest(function(t) {

    Ext.Viewport.add({
        xtype: 'panel',
        html : 'Hello world...'
    });

    var panel   = Ext.Viewport.down('panel');
            
    t.firesOk(panel.element, {
        doubletap       : 1,
        dragstart       : 1,
        dragend         : 1,
        longpress       : 1
    });
            
    // ...or via chainged config objects to avoid nested callbacks
    t.chain({
        action : 'doubletap',
        target : panel
    }, {
        action : 'tap',
        target : panel
    },{
        action : 'swipe',
        target : panel
    },{
        action : 'longpress',
        target : panel
    },
    function() {
        t.pass('Test ended');
    });
});
