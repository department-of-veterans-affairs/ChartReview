StartTest(function (t) {
    t.it('tap / doubletap / longpress', function (t) {

        t.expectGlobal('ListItem');

        var data = {
            text  : 'Groceries',
            items : [
                { text : 'Drinks', leaf : true },
                { text : 'Foods', leaf : true }
            ]
        };

        Ext.define('ListItem', {
            extend : 'Ext.data.Model',
            config : {
                fields : [
                    {
                        name : 'text',
                        type : 'string'
                    }
                ]
            }
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model               : 'ListItem',
            defaultRootProperty : 'items',
            root                : data
        });

        var list = Ext.create('Ext.dataview.NestedList', {
            fullscreen   : true,
            displayField : 'text',
            store        : store
        });

        t.willFireNTimes(Ext.getBody(), 'doubletap', 1);
        t.willFireNTimes(Ext.getBody(), 'longpress', 1);

        t.waitForScrollerPosition({ position : { x : 0, y : 0 }}, { x : 0, y : 0 }, function() {})

        t.chain(
            { waitForEvent : [ list, 'painted' ] },
            
            { tap     : '.x-list-item' },

            function (next) {
                t.is(list.getActiveItem().getSelection().length, 1, '1 item selected');

                next();
            },
            { doubletap : '.x-list-item' },
            { waitFor : 500 },
            { longpress : '.x-list-item' },
            
            { waitFor : 'animations' }
        );
        
        Ext.Viewport.add(list);
    });

    t.it('moveFingerBy', function(t) {
        t.throwsOk(function() {
            t.moveFingerBy();

        }, 'Trying to call moveFingerBy without relative distances')
    })

    t.it('scrollUntil', function(t) {
        t.throwsOk(function() {
            t.scrollUntil(document.body, 'wrong');

        }, 'Invalid swipe direction');

    })
});