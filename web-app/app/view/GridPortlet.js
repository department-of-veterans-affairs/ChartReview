Ext.define('CR.app.view.GridPortlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.gridportlet',
    uses: [
        'Ext.data.ArrayStore'
    ],
    height: 300,
    myData: [
        ['Demo data 123', 71.72, 0.02,  0.03,  '9/1 12:00am']
    ],

    /**
     * Custom function used for column renderer
     * @param {Object} val
     */
    change: function(val) {
        if (val > 0) {
            return '<span style="color:green;">' + val + '</span>';
        } else if (val < 0) {
            return '<span style="color:red;">' + val + '</span>';
        }
        return val;
    },

    /**
     * Custom function used for column renderer
     * @param {Object} val
     */
    pctChange: function(val) {
        if (val > 0) {
            return '<span style="color:green;">' + val + '%</span>';
        } else if (val < 0) {
            return '<span style="color:red;">' + val + '%</span>';
        }
        return val;
    },

    initComponent: function(){

        var store = Ext.create('Ext.data.ArrayStore', {
            fields: [
               {name: 'company'},
               {name: 'change',     type: 'float'},
               {name: 'pctChange',  type: 'float'}
            ],
            data: this.myData
        });

        Ext.apply(this, {
            //height: 300,
            height: this.height,
            store: store,
            stripeRows: true,
            columnLines: true,
            columns: [{
                id       :'company',
                text   : 'Company',
                //width: 120,
                flex: 1,
                sortable : true,
                dataIndex: 'company'
            },{
                text   : 'Change',
                width    : 75,
                sortable : true,
                renderer : this.change,
                dataIndex: 'change'
            },{
                text   : '% Change',
                width    : 75,
                sortable : true,
                renderer : this.pctChange,
                dataIndex: 'pctChange'
            }]
        });

        this.callParent(arguments);
    }
});
