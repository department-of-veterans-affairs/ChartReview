StartTest(function (t) {

    Ext.define('Ext.Company', {
        extend : 'Ext.data.Model',
        fields : [
            {name : 'company'},
            {name : 'price', type : 'float'}
        ]
    });
    
    var store, grid1
    
    var setupStore  = function () {
        return store = Ext.create('Ext.data.ArrayStore', {
            model : 'Ext.Company',
            data  : [
                ['A', 71.72, 0.02, 0.03, '9/1 12:00am', 'Manufacturing'],
                ['B', 29.01, 0.42, 1.47, '9/1 12:00am', 'Manufacturing'],
                ['C', 83.81, 0.28, 0.34, '9/1 12:00am', 'Manufacturing']
            ]
        });
    }
    
    
    var setup = function (config) {
        grid1 && grid1.destroy()
        
        grid1 = new Ext.grid.Panel(Ext.apply({
            id         : 'grid',
            store      : setupStore(),
            columns    : [
                { text : "Company", flex : 1, width : 100, dataIndex : 'company', tdCls : 'firstCol', editor : { xtype : 'combobox', store : { model : Ext.Company } } },
                { text : "Price", dataIndex : 'price', width : 100 }
            ],
            viewConfig : {
                getRowClass : function (rec) {
                    return rec.get('company') === 'C' ? 'FOO' : '';
                }
            },
            plugins    : 'cellediting',
            width      : 300,
            height     : 120,
            iconCls    : 'icon-grid',
            renderTo   : Ext.getBody()
        }, config));
    }


    t.it('Grid column header', function (t) {
        setup()

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { click : '#grid gridcolumn[dataIndex=company] => .x-column-header-text' },
            { click : '#grid gridcolumn[dataIndex=company] => .x-column-header-trigger' },
            { click : '>> #descItem' },

            function () {
                var recordedActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recordedActions.length, 3);

                t.is(recordedActions[ 0 ].action, 'click');
                t.is(recordedActions[ 1 ].action, 'click');
                t.is(recordedActions[ 2 ].action, 'click');

                // in Ext5 when column header is focused a "::before" element is added, so the following "click" event happens
                // on ".x-column-header-inner" element
                t.like(recordedActions[ 0 ].getTarget().target, /#grid gridcolumn\[text=Company\] => \.x-column-header-(text|inner)/);
                t.is(recordedActions[ 1 ].getTarget().target, '#grid gridcolumn[text=Company] => .x-column-header-trigger');
                t.is(recordedActions[ 2 ].getTarget().target, '[itemId=descItem] => .x-menu-item-text');
            }
        )
    })

    t.it('Grid rows', function (t) {
        setup()

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();
        
        var rowContainerSelector    = Ext.grid.View.prototype.itemSelector

        t.chain(
            { click : '#grid => ' + rowContainerSelector + ':nth-child(2) .x-grid-cell:nth-child(2)' },
            { click : '#grid => .FOO .firstCol' },
            { doubleclick : '#grid => .FOO .firstCol' },

            function () {
                var recordedActions     = recorder.getRecordedActions();

                recorder.stop();

                t.is(recordedActions.length, 3);
                t.is(recordedActions[ 0 ].action, 'click');
                t.is(recordedActions[ 0 ].getTarget().target, '#grid => ' + rowContainerSelector + ':nth-child(2) .x-grid-cell:nth-child(2)');

                t.is(recordedActions[ 1 ].action, 'click');
                t.is(recordedActions[ 1 ].getTarget().target, '#grid => .FOO .firstCol');
                
                t.is(recordedActions[ 2 ].action, 'dblclick');
                t.is(recordedActions[ 2 ].getTarget().target, '#grid => .FOO .firstCol');
            }
        )
    })


    t.it('Grid editors 1 click', function (t) {
        setup({
            plugins : { ptype : 'cellediting', clicksToEdit : 1 }
        });

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { waitForRowsVisible : grid1 },

            { dblclick : '#grid => .FOO .firstCol' },

            function () {
                recorder.stop();
                
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 1);
                t.is(recordedActions[ 0 ].action, 'dblclick');
                t.is(recordedActions[ 0 ].getTarget().target, '#grid => .FOO .firstCol');
            }
        )
    })

    t.it('Grid column drag', function (t) {
        setup({
            id      : 'grid3',
            columns    : [
                { text : "Company", dataIndex : 'company', width : 100 },
                { text : "Price", dataIndex : 'price', width : 100 }
            ]
        });

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : '>>#grid3 [dataIndex=company]', by : [100, 0] },

            function () {
                recorder.stop();
                
                var recordedActions     = recorder.getRecordedActions();

                t.is(recordedActions.length, 1);
                t.is(recordedActions[ 0 ].action, 'drag');
                t.is(recordedActions[ 0 ].getTarget().target, '#grid3 gridcolumn[text=Company] => .x-column-header-text');
            }
        )
    })

    t.it('Grid column resize', function (t) {
        setup({
            id          : 'grid4',
            columns     : [
                { text : "Company", width : 50, dataIndex : 'company' },
                { text : "Price", width : 50, dataIndex : 'price' }
            ]
        });

        var recorder            = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);
        recorder.start();

        t.chain(
            { drag : '>>#grid4 [dataIndex=price]', by : [ 50, 0 ], offset : [ 0, 10 ] },

            function (next) {
                var recordedActions     = recorder.getRecordedActions();
                
                t.is(recordedActions.length, 1);
                
                t.is(recordedActions[ 0 ].action, 'drag');                
                t.is(recordedActions[ 0 ].getTarget().target, '#grid4 gridcolumn[text=Price] => .x-column-header-inner');
                t.isDeeply(recordedActions[ 0 ].getTarget().offset, [ 0, 10 ], 'Correct offset for targets');
                
                next()
            },

            { drag : '>>#grid4 [dataIndex=company]', by : [ -50, 0 ], offset : [ '100%-4', 10 ] },

            function (next) {
                var recordedActions     = recorder.getRecordedActions();
                
                t.is(recordedActions.length, 2);
                
                t.is(recordedActions[ 1 ].action, 'drag');                
                t.is(recordedActions[ 1 ].getTarget().target, '#grid4 gridcolumn[text=Company] => .x-column-header-trigger');
                t.isDeeply(
                    recordedActions[ 1 ].getTarget().offset, 
                    [ t.compositeQuery('#grid4 gridcolumn[text=Company] => .x-column-header-trigger')[ 0 ].offsetWidth - 4, 10 ], 
                    'Correct offset for targets'
                );
                
                recorder.stop();
                
                next()
            }
        )
    })
})