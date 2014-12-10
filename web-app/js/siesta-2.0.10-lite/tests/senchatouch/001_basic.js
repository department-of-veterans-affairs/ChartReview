StartTest(function (t) {
    t.it('tap / doubletap / longpress', function (t) {

        t.expectGlobal('ListItem');

        var data = {
            text  : 'Groceries',
            items : [
                { text : 'Drinks', leaf : true }
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

        var list = Ext.create('Ext.NestedList', {
            fullscreen   : true,
            displayField : 'text',
            store        : store
        });
        Ext.Viewport.add(list);

        t.willFireNTimes(Ext.getBody(), 'doubletap', 1);
        t.willFireNTimes(Ext.getBody(), 'longpress', 1);

        t.waitForScrollerPosition({ position : { x : 0, y : 0 }}, { x : 0, y : 0 }, function() {})

        t.chain(
            { waitFor : 'animations' },

            {
                waitFor : 'selector',
                args    : '.x-list-item'
            },
            {
                action : 'tap',
                target : '.x-list-item'
            },

            function (next) {
                var sel = list.getActiveItem().selected;

                t.is(sel.getCount(), 1, '1 item selected');

                next();
            },
            {
                action : 'doubletap'
            },

            { waitFor : 500 },

            {
                action : 'longpress'
            }
        );
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