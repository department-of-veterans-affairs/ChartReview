StartTest(function(t) {
    t.diag('Testing buttons');

    Ext.Viewport.add({
        xtype: 'toolbar',
        docked: 'top',

        items: [
            { ui: 'back', text: 'Back' },
            { text: 'Default' },
            { ui: 'round', text: 'Round' },
            { ui: 'action', text: 'Action' }
        ]
    });

    // Simulate an async UI generation flow
    setTimeout(function() {
        Ext.Viewport.down('toolbar').add({ ui: 'forward', text: 'Forward' });
    }, 2000);
    
    Ext.each(Ext.ComponentQuery.query('button'), function(btn) {
        t.willFireNTimes(btn, 'tap', 1);
    });

    t.chain({
        waitFor : 'CQ', args : 'button[ui=forward]' 
    },{
        action : 'tap',
        target : '>>button[ui="back"]'
    },{
        action : 'tap',
        target : '>>button[text=Default]'
    }, {
        action : 'tap',
        target : '>>button[ui="round"]'
    },{
        action : 'tap',
        target : '>>button[ui="action"]'
    }, {
        action : 'tap',
        target : '>>button[ui="forward"]'
    });
});
