/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.CoverageReport', {
    extend : 'Ext.Container',
    alias  : 'widget.coveragereport',

    requires : [
        'Ext.tree.Panel',

        'Siesta.Harness.Browser.UI.TreeFilterField',
        'Siesta.Harness.Browser.UI.CoverageChart'
    ],

    cls    : 'st-cov-report-panel',
    layout : 'border',

    htmlReport       : null,
    treePanel        : null,
    treeStore        : null,
    chart            : null,
    sourcePanel      : null,
    contentContainer : null,
    toggleButtons    : null,
    standalone       : false,
    dataUrl          : null,
    harness          : null,

    // Number of levels in the coverage class/file tree to expand by default
    expandLevels : 2,

    initComponent : function () {
        var me = this
        var standalone = this.standalone

        var store = this.treeStore = new Siesta.Harness.Browser.Model.FilterableTreeStore({
            model       : 'Siesta.Harness.Browser.Model.CoverageUnit',
            proxy       : 'memory',
            rootVisible : true
        })

        Ext.apply(this, {

            border : !this.standalone,
            items  : [
                {
                    xtype              : 'treepanel',
                    border             : false,
                    region             : 'west',
                    enableColumnHide   : false,
                    enableColumnMove   : false,
                    enableColumnResize : false,
                    sortableColumns    : false,
                    rowLines           : false,
                    tbar               : {
                        cls    : 'siesta-toolbar',
                        height : 45,
                        border : false,
                        items  : [
                            standalone ? null : {
                                text    : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'closeText'),
                                scale   : 'medium',
                                style   : 'margin:0 10px 0 0;',
                                handler : this.onBackToMainUI,
                                scope   : this
                            },
                            {
                                xtype           : 'treefilter',
                                cls             : 'filterfield',
                                hasAndCheck     : function () {
                                    var states = Ext.pluck(me.toggleButtons, 'pressed')

                                    return !states[0] || !states[1] || !states[2]
                                },
                                andChecker      : this.levelFilter,
                                andCheckerScope : this,
                                margin          : '3 0 0 0',
                                store           : store,
                                filterField     : 'text',
                                width           : 180
                            },
                            '->',
                            {
                                xtype  : 'label',
                                text   : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'showText'),
                                margin : '0 5 0 0'
                            },
                            {
                                text          : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'highText'),
                                level         : 'high',
                                enableToggle  : true,
                                pressed       : true,
                                scale         : 'medium',
                                cls           : 'st-cov-level-high',
                                toggleHandler : this.toggleLevels,
                                scope         : this,
                                margin        : '0 5 0 0'
                            },
                            {
                                text          : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'mediumText'),
                                level         : 'med',
                                enableToggle  : true,
                                scale         : 'medium',
                                pressed       : true,
                                cls           : 'st-cov-level-medium',
                                toggleHandler : this.toggleLevels,
                                scope         : this,
                                margin        : '0 5 0 0'
                            },
                            {
                                text          : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'lowText'),
                                level         : 'low',
                                enableToggle  : true,
                                scale         : 'medium',
                                pressed       : true,
                                cls           : 'st-cov-level-low',
                                toggleHandler : this.toggleLevels,
                                scope         : this,
                                style         : 'margin:0 5px 0 0'
                            }
                        ]
                    },

                    viewType   : 'filterabletreeview',
                    viewConfig : {
                        store       : store.nodeStore,
                        trackOver   : false,
                        rootVisible : true
                    },

                    cls : 'st-cov-report-tree-panel',

                    flex        : 1,
                    split       : true,
                    rootVisible : true,

                    columns : [
                        {
                            xtype        : 'treecolumn',
                            dataIndex    : 'text',
                            menuDisabled : true,
                            flex         : 3
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'statementsText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('statements')
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'branchesText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('branches')
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'functionsText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('functions')
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'linesText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('lines')
                        }
                    ],

                    store : store,

                    listeners : {
                        selectionchange : this.onClassSelected,
                        scope     : this
                    }
                },
                {
                    xtype  : 'container',
                    cls    : 'coveragechart-container',
                    slot   : 'contentContainer',
                    region : 'center',
                    layout : {
                        type                : 'card',
                        deferredRendering   : true
                    },

                    items : [
                        {
                            xtype : 'coveragechart'
                        },
                        {
                            xtype       : 'panel',
                            slot        : 'sourcePanel',
                            flex        : 1,
                            autoScroll  : true,
                            bodyPadding : '4 0 4 10',
                            border      : false,
                            cls         : 'st-cov-report-source-panel'
                        }
                    ]

                }
            ]
        })

        this.callParent()

        this.contentContainer = this.down('[slot=contentContainer]')
        this.chart            = this.down('chart')
        this.sourcePanel      = this.down('[slot=sourcePanel]')
        this.toggleButtons    = this.query('button[level]')
        this.treePanel        = this.down('treepanel')

        if (standalone) {
            // `loadingMask.show()` throws exception when called with non-rendered target
            this.on('afterrender', function () {
                var loadingMask = new Ext.LoadMask({
                    target : this,
                    msg    : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'loadingText')
                });

                loadingMask.show()

//                use this code for testing
//                setTimeout(function () {
//                    loadingMask.hide()
//                    
//                    me.loadHtmlReport(me.htmlReport)
//                }, 2000)

                Ext.Ajax.request({
                    url : this.dataUrl,

                    success : function (response) {
                        loadingMask.hide()
                        me.loadHtmlReport(Ext.JSON.decode(response.responseText))
                    },

                    failure : function () {
                        loadingMask.hide()
                        Ext.Msg.show({
                            title   : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'loadingErrorText'),
                            msg     : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'loadingErrorMessageText') + me.dataUrl,
                            buttons : Ext.MessageBox.OK,
                            icon    : Ext.MessageBox.ERROR
                        })
                    }
                })
            }, this, { single : true })
        } else if (this.htmlReport) {
            this.loadHtmlReport(this.htmlReport);
        }

        // Refresh data is user reruns a test with coverage panel open
        if (this.harness) {
            this.harness.on('testsuiteend', this.onTestSuiteEnd, this)
        }
    },

    onTestSuiteEnd : function (descriptors) {

        if (this.harness && this.isVisible()) {
            // Load new data into coverage report
            this.loadHtmlReport(this.harness.generateCoverageHtmlReport(false));
        }
    },

    loadHtmlReport : function (report) {
        this.htmlReport = report

        var treeStore = this.treeStore
        var isFile = report.coverageUnit == 'file'
        var treeFilter = this.down('treefilter')
        var selModel = this.treePanel.getSelectionModel();
        var selected = selModel.getSelected();
        var oldSelectedId = selected.length > 0 ? selected.first().getId() : null;

        treeStore.setRootNode(this.generateFilesTree(report.htmlReport.root))

        if (oldSelectedId && treeStore.getNodeById(oldSelectedId)){
            selModel.select(treeStore.getNodeById(oldSelectedId));
        }

        this.down('treecolumn').setText(isFile ? 'File name' : 'Class name')

        treeFilter.emptyText = isFile ? 'Filter files' : 'Filter classes'

        treeFilter.applyEmptyText();

        this.loadChartData(treeStore.getRootNode());
    },


    levelFilter : function (node) {
        var coverage = node.getStatementCoverage();

        if (coverage === undefined) return false;

        return this.toggleButtons[coverage >= 80 ? 0 : coverage >= 50 ? 1 : 2].pressed
    },


    toggleLevels : function () {
        this.down('treefilter').refreshFilter()
    },


    getCoverageLevelClass : function (coveragePct) {
        if (typeof coveragePct == 'number')
            return 'st-cov-level-' + (coveragePct >= 80 ? 'high' : coveragePct >= 50 ? 'medium' : 'low');
        else
            return ''
    },


    getMetricsRenderer : function (property) {
        var me = this

        return function (value, metaData, preloadFile) {
            var reportNode = preloadFile.get('reportNode')
            if (!reportNode) return ''

            var metrics = reportNode.metrics[property]

            metaData.tdCls = me.getCoverageLevelClass(metrics.pct)

            return '<span class="st-cov-stat-pct-' + property + '">' + Math.round(metrics.pct) + '%</span> ' +
                '<span class="st-cov-stat-abs-' + property + '">(' + metrics.covered + '/' + metrics.total + ')</span>'
        }
    },


    generateFilesTree : function (node, depth) {
        var me = this
        depth = depth || 0;

        // in this method "node" should be treated as a raw JSON object and not an instance of Node from Istanbul
        // (even that in UI usage scenario it will be a Node)
        // since for the standalone report we load a JSON blob with the tree report
        // so we should not call any methods on "node"
        if (node.kind === 'dir') {
            var text = node.relativeName || node.fullName

            return {
                id       : node.fullName,
                url      : node.fullName,
                leaf     : false,
                expanded : depth < this.expandLevels,

                text : text == '/' && this.htmlReport.coverageUnit == 'extjs_class' ? Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'globalNamespaceText') : text,

                reportNode : node,

                children : Ext.Array.map(node.children, function (childNode) {
                    return me.generateFilesTree(childNode, depth + 1)
                }).sort(this.treeSorterFn)
            }
        } else {
            return {
                id   : node.fullName,
                url  : node.fullName,
                leaf : true,

                text : node.relativeName,

                reportNode : node
            }
        }
    },

    treeSorterFn : function (node1, node2) {
        if (!node1.leaf && node2.leaf) return -1;

        if (node1.leaf && !node2.leaf) return 1;

        if (node1.leaf === node2.leaf) return node1.text < node2.text ? -1 : 1;
    },

    onClassSelected : function (view, records) {
        var record = records[0];

        if (!record) return;

        if (record.isLeaf() && !this.htmlReport.coverageNoSource) {
            this.sourcePanel.update(record.get('reportNode').html)
            prettyPrint()
            this.contentContainer.getLayout().setActiveItem(1)
        } else {
            this.loadChartData(record)
            this.contentContainer.getLayout().setActiveItem(0)
        }
    },


    onBackToMainUI : function () {
        this.fireEvent('backtomainui', this)
    },


    loadChartData : function (node) {
        this.chart.store.loadData([
            { name : 'Statements', value : Math.round(node.getStatementCoverage()) },
            { name : 'Branches', value : Math.round(node.getBranchCoverage()) },
            { name : 'Functions', value : Math.round(node.getFunctionCoverage()) },
            { name : 'Lines', value : Math.round(node.getLineCoverage()) }
        ])
    }
});
