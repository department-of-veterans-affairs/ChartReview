/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TestNameColumn', {
    extend       : 'Ext.tree.Column',
    xtype        : 'testnamecolumn',
    
    sortable     : false,
    dataIndex    : 'title',
    menuDisabled : true,
    flex         : 1,
    tdCls        : 'test-name-cell',
    
    scope        : this,
    filterGroups : null,
    store        : null,

    initComponent : function () {

        var R = Siesta.Resource('Siesta.Harness.Browser.UI.TestGrid');

        Ext.apply(this, {
            items : [
                {
                    xtype        : 'treefilter',
                    emptyText    : R.get('filterTestsText'),
                    margins      : '0 0 0 10',
                    itemId       : 'trigger',
                    filterGroups : this.filterGroups,
                    filterField  : 'title',
                    store        : this.store,
                    tipText      : R.get('filterFieldTooltip')
                }
            ]
        });

        this.callParent(arguments);
    },

    renderer : function (value, metaData, testFile) {
        var cls = '';
        var folderIcon = '';

        metaData.tdCls = 'tr-test-status '

        if (testFile.isLeaf()) {

            var test = testFile.get('test')

            if (test) {

                if (testFile.get('isFailed'))
                    cls = 'icon-flag'

                else if (testFile.get('isRunning') && !test.isFinished())
                    cls = 'icon-lightning'
                else if (test.isFinished()) {

                    if (test.isPassed())
                        cls = 'icon-checkmark'
                    else
                        cls = 'icon-bug'
                } else
                    cls = 'icon-busy'

            } else {

                if (testFile.get('isMissing'))
                    cls = 'icon-close'
                else if (testFile.get('isStarting'))
                    cls = 'icon-busy'
                else
                    cls = 'icon-file-2'
            }
        } else {
            var status = testFile.get('folderStatus');

            if (testFile.data.expanded) {
                cls += ' icon-folder-open';
            } else {
                cls += ' icon-folder';
            }

            if (status == 'working') {
                cls += ' icon-busy';
            } else {
                if (status == 'working') {
                    cls += ' icon-busy';
                } else if (status == 'green') {
                    folderIcon += ' <span class="folder-status-icon icon-checkmark"></span>';
                }
                //else if (status == 'red') {
                //    folderIcon += ' <span class="folder-status-icon icon-bug"></span>';
                //}
            }

            cls += ' tr-folder-' + status;

        }
        return '<span class="test-icon ' + cls + '"></span>' + folderIcon + value;
    }
})
