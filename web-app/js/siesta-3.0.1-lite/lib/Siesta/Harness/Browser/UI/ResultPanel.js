/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.ResultPanel', {
    extend : 'Ext.Panel',
    alias  : 'widget.resultpanel',

    requires        : [
        'Siesta.Harness.Browser.UI.AssertionGrid',
        'Siesta.Harness.Browser.UI.DomContainer'
    ],

    slots : true,

    test          : null,
    testListeners : null,

    maintainViewportSize : true,

    viewDOM      : false,
    border       : false,
    canManageDOM : true,

    harness : null,

    isStandalone : false,
    showToolbar  : true,

    minWidth : 100,
    layout   : 'border',

    sourceButton     : null,
    filterButton     : null,
    inspectionButton : null,
    recorderPanel    : null,
    recorderConfig   : null,

    initComponent : function () {
        var me = this;
        var R = Siesta.Resource('Siesta.Harness.Browser.UI.ResultPanel');

        Ext.apply(this, {
            cls   : 'tr-container',
            tbar  : {
                cls      : 'resultpanel-toolbar',
                defaults : {
                    tooltipType : 'title',
                    scope       : this
                },
                items    : !this.showToolbar ? null : [
                    {
                        text    : R.get('rerunText'),
                        padding : '0 10',
                        cls     : 'rerun-button',
                        glyph   : 0xE60f,
                        scale   : 'medium',
                        handler : this.onRerun
                    },
                    {
                        xtype  : 'label',
                        cls    : 'resultpanel-testtitle',
                        itemId : 'resultpanel-testtitle',
                        margin : '0 0 0 10',
                        text   : ' '
                    },
                    '->',

                    this.viewDomButton = new Ext.Button({
                        tooltip      : R.get('toggleDomVisibleText'),
                        cls          : 'testaction-button',
                        action       : 'view-dom',
                        scale        : 'medium',
                        glyph        : 0xE619,
                        enableToggle : true,
                        scope        : this,
                        pressed      : this.viewDOM,
                        handler      : function (btn) {
                            this.setViewDOM(!this.viewDOM);
                        }
                    }),
                    this.sourceButton = new Ext.Button({
                        tooltip      : R.get('viewSourceText'),
                        action       : 'view-source',
                        cls          : 'testaction-button',
                        glyph        : 0xE600,
                        scale        : 'medium',
                        tooltipType  : 'title',
                        disabled     : true,
                        enableToggle : true,
                        scope        : this,

                        handler      : function (btn) {
                            if (btn.pressed) {
                                this.showSource();
                            } else {
                                this.hideSource()
                            }
                        }
                    }),
                    this.filterButton = new Ext.Button({
                        tooltip     : R.get('showFailedOnlyText'),
                        action       : 'show-failed-only',
                        cls         : 'testaction-button',
                        scale       : 'medium',
                        glyph       : 0xE622,
                        tooltipType : 'title',
                        scope        : this,
                        enableToggle : true,
                        handler      : this.onAssertionFilterClick
                    }),
                    this.inspectionButton = new Ext.Button({
                        glyph        : 0xE613,
                        cls          : 'testaction-button cmp-inspector',
                        action       : 'toggle-cmp-inspector',
                        scale        : 'medium',
                        tooltip      : R.get('componentInspectorText'),
                        tooltipType  : 'title',
                        handler      : this.toggleComponentInspectionMode,
                        scope        : this,
                        enableToggle : true
                    }),
                    this.recorderButton = new Ext.Button({
                        glyph        : 0xE614,
                        action       : 'toggle-recorder',
                        cls          : 'testaction-button',
                        scale        : 'medium',
                        disabled     : !Siesta.Recorder || Ext.isIE9m,
                        tooltip      : R.get('eventRecorderText'),
                        handler      : this.onRecorderClick,
                        margin       : '0 30 0 0',
                        scope        : this,
                        enableToggle : true
                    }),
                    {
                        xtype : 'versionupdatebutton'
                    },
                    {
                        xtype : 'component',
                        id    : 'siesta-logo'
                    }
                ]
            },
            items : [
                // a card container
                {
                    region     : 'center',
                    slot       : 'cardContainer',
                    xtype      : 'container',
                    layout     : {
                        type           : 'card',
                        deferredRender : true
                    },
                    activeItem : 0,
                    minWidth   : 100,

                    items : [
                        // grid with assertion
                        {
                            xtype : 'assertiongrid',
                            slot  : 'grid',

                            isStandalone : this.isStandalone,
                            listeners    : {
                                itemdblclick : this.onAssertionDoubleClick,
                                scope        : this
                            }

                        },
                        // eof grid with assertion
                        {
                            xtype : 'sourcepanel',
                            slot  : 'source',
                            tbar  : {
                                cls     : 'siesta-toolbar',
                                padding : '6 10',
                                items   : [
                                    {
                                        text    : Siesta.Resource('Siesta.Harness.Browser.UI.ResultPanel', 'closeText'),
                                        scope   : this,
                                        scale   : 'medium',
                                        handler : this.hideSource
                                    }
                                ]
                            }
                        }
                    ].concat(
                        Ext.ClassManager.getByAlias('widget.coveragereport') ?
                        {
                            xtype   : 'coveragereport',
                            slot    : 'coverageReport',
                            harness : this.harness
                        } : []
                    )
                },
                {
                    xtype       : 'domcontainer',
                    region      : 'east',
                    collapsible : true,
                    split       : {
                        size : 7
                    },

                    bodyStyle : 'text-align : center',

                    slot     : 'domContainer',
                    stateful : true,             // Turn off for recursive siesta demo

                    id    : this.id + '-domContainer',
                    width : '50%',
                    cls   : 'siesta-domcontainer',

                    collapsed : !this.viewDOM
                }
            ]
        })

        this.callParent()

        this.slots.domContainer.on({
            expand   : this.onDomContainerExpand,
            collapse : this.onDomContainerCollapse,

            inspectionstart : function () {
                this.inspectionButton.toggle(true);
            },
            inspectionstop  : function () {
                this.inspectionButton.toggle(false);
            },

            scope : this
        });


    },


    // This method makes sure that the min width of the card panel is respected when
    // the width of this class changes (after resizing Test TreePanel).
    ensureLayout  : function () {
        var availableWidth = this.getWidth();
        var cardPanel = this.slots.cardContainer;
        var domContainer = this.slots.domContainer;
        var domContainerWidth = domContainer.getWidth();
        var minimumForCard = cardPanel.minWidth + 20; // Some splitter space

        if (availableWidth - domContainerWidth < minimumForCard) {
            domContainer.setWidth(Math.max(0, availableWidth - minimumForCard));
        }
    },


    showSource : function (lineNbr) {
        var test = this.test

        if (!this.test) return;

        var sourceLines = [];
        var slots = this.slots
        var cardContainer = slots.cardContainer
        var sourceCt = slots.source;

        // Do this first since rendering is deferred
        cardContainer.layout.setActiveItem(sourceCt);

        if (arguments.length === 0) {
            // Highlight all failed rows
            Ext.each(test.getFailedAssertions(), function (assertion) {
                if (assertion.sourceLine != null) {
                    sourceLines.push(assertion.sourceLine)
                }
            });
        }
        else {
            // Highlight just a single row (user double clicked a failed row)
            sourceLines = [lineNbr];
        }

        sourceCt.setSource(test.getSource(), sourceLines);
    },


    hideSource : function (btn) {
        var slots = this.slots

        var cardContainer = slots.cardContainer

        if (cardContainer.layout.getActiveItem() === slots.source) {
            cardContainer.layout.setActiveItem(slots.grid);
        }
    },


    setViewDOM : function (value) {
        var domContainer = this.slots.domContainer

        if (value)
            domContainer.expand(false)
        else
            domContainer.collapse(Ext.Component.DIRECTION_RIGHT, false)
    },


    onDomContainerCollapse : function () {
        this.viewDOM = false;
        this.viewDomButton.toggle(false);
        this.fireEvent('viewdomchange', this, false);
    },


    onDomContainerExpand : function () {
        this.viewDOM = true;
        this.viewDomButton.toggle(true);
        this.fireEvent('viewdomchange', this, true);
    },


    onRerun : function () {
        this.fireEvent('rerun', this);
    },


    showTest : function (test, assertionsStore) {
        var recorder = this.slots.recorderPanel;

        this.slots.source.clear();

        this.filterButton && this.filterButton.toggle(false)
        this.hideSource();

        this.sourceButton && this.sourceButton.enable()

        var url = test.url

        Ext.suspendLayouts();

        this.slots.grid.showTest(test, assertionsStore)
        this.slots.domContainer.showTest(test, assertionsStore)

        if (recorder) {
            recorder.stop();
            recorder.attachTo(test);

            if (this.test && test.url !== this.test.url) {
                this.slots.cardContainer.layout.setActiveItem(0);
            }
        }

        this.setTestTitle(url);

        Ext.resumeLayouts();

        this.test = test;
    },

    setTestTitle : function (url) {
        this.testTitle.setText(url);
    },

    onAssertionFilterClick : function (btn) {
        var grid = this.slots.grid;
        var assertionsStore = grid.store;

        // need this check for cases when users clicks on the button
        // before running any test - in this case assertion grid will have an empty Ext.data.TreeStore instance
        if (!assertionsStore.filterTreeBy) return

        if (btn.pressed) {
            grid.addCls('assertiongrid-filtered');
            assertionsStore.filterTreeBy(function (resultRecord) {
                var result = resultRecord.getResult()

                // this covers the cases when "result" is a summary record, diagnostic record, etc
                return result.passed === false && !result.isTodo
            })
        } else {
            grid.removeCls('assertiongrid-filtered');
            assertionsStore.clearTreeFilter()
        }
    },


    alignIFrame : function () {
        this.slots.domContainer.alignIFrame()
    },


    hideIFrame : function () {
        this.slots.domContainer.hideIFrame()
    },


    setInitializing : function (initializing) {
        this.slots.grid.setInitializing(initializing)
    },


    onAssertionDoubleClick : function (view, record) {
        var result = record.getResult()

        if ((result instanceof Siesta.Result.Assertion) && !result.isPassed(true)) {
            this.showSource(result.sourceLine);
        }
    },


    toggleComponentInspectionMode : function (btn) {
        this.slots.domContainer.toggleInspectionMode(btn.pressed);
    },


    onRecorderClick : function () {
        var cardContainer = this.slots.cardContainer

        if (!this.recorderPanel) {
            this.recorderPanel = new Siesta.Recorder.UI.RecorderPanel({
                slot           : 'recorderPanel',
                harness        : this.harness,
                domContainer   : this.slots.domContainer,
                recorderConfig : this.recorderConfig,
                closeButton    : {
                    text    : Siesta.Resource('Siesta.Harness.Browser.UI.ResultPanel', 'closeText'),
                    handler : function () {
                        cardContainer.layout.setActiveItem(0);
                    }
                },
                listeners      : {
                    startrecord : function (pnl) {
                        this.fireEvent('startrecord', pnl);
                    },
                    show        : function() {
                        this.recorderButton.toggle(true);
                    },
                    hide        : function() {
                        this.recorderButton.toggle(false);
                    },
                    scope       : this
                }
            });
            this.slots.cardContainer.add(this.recorderPanel);

            if (this.test) {
                this.slots.recorderPanel.attachTo(this.test);
            }
        }

        if (cardContainer.layout.getActiveItem() === this.recorderPanel) {
            cardContainer.layout.setActiveItem(this.slots.grid);
        } else{
            cardContainer.layout.setActiveItem(this.recorderPanel);
        }
    },

    afterRender : function () {
        this.callParent(arguments);

        this.testTitle = this.down('#resultpanel-testtitle');

        // To avoid the DOM container splitter getting stuck
        this.child('bordersplitter').tracker.tolerance = 0;
    }
});
