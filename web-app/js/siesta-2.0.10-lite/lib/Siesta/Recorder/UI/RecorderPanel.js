/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.UI.RecorderPanel', {
    extend          : 'Ext.panel.Panel',

    alias           : 'widget.recorderpanel',

    layout          : 'fit',
    buttonAlign     : 'left',
    border          : false,
    bodyBorder      : false,

    newActionDefaults : {
        action          : 'click'
    },
    
    eventView       : null,
    test            : null,
    recorder        : null,
    harness         : null,
    domContainer    : null,

    extractorClass  : Siesta.Recorder.TargetExtractor.ExtJS,
    extractorConfig : null,
    
    
    initComponent : function () {
        var me              = this;

        this.store          = new Ext.data.Store({
            proxy   : 'memory',
            model   : 'Siesta.Recorder.Model.Action'
        });

        me.createToolbars();
        
        me.items            = this.eventView = new Siesta.Recorder.UI.EventView({
            border          : false,
            style           : 'border-top:1px solid #ddd',
            itemId          : 'eventView',
            store           : me.store,
            highlightTarget : me.highlightTarget.bind(me)
        });

        this.eventView.on({
            beforeedit : function (ed, ctx) {
                if (ctx.column.dataIndex === 'target') {
                    me.domContainer.startInspection(false);
                }
            }
        });

        this.eventView.on({
            afteredit : function () {
                if (!me.eventView.editing.getActiveEditor()) {
                    me.hideHighlighter();
                }
            },
            scope     : this,
            buffer    : 200
        });

        var recorder        = me.recorder = me.recorder || new Siesta.Recorder.Recorder({
            extractor       : new this.extractorClass(this.extractorConfig)
        });

        recorder.on("actionadd", this.onActionAdded, this)
        recorder.on("actionremove", this.onActionRemoved, this)
        recorder.on("actionupdate", this.onActionUpdated, this)
        recorder.on("clear", this.onRecorderClear, this)
        
        recorder.on("start", this.onRecorderStart, this)
        recorder.on("stop", this.onRecorderStop, this)

        me.callParent();

        Ext.getBody().on('mousedown', this.onBodyMouseDown, this, { delegate : '.cmp-inspector-label' })
    },
    
    
    onBodyMouseDown : function (e, t) {
        var focusedEl           = document.activeElement;

        if (Ext.fly(focusedEl).up('.siesta-targeteditor')) {
            e.stopEvent();
            e.preventDefault();
            focusedEl.value     = Ext.htmlDecode(t.innerHTML);
        }
    },
    
    
    onRecorderStart : function () {
        /**
         * @event startrecord
         * Fires when a recording is started
         * @param {Siesta.Recorder.RecorderManager} this
         */
        this.fireEvent('startrecord', this);

        this.addCls('recorder-recording');
    },
    
    
    onRecorderStop : function () {
        /**
         * @event stoprecord
         * Fires when a recording is stopped
         * @param {Siesta.Recorder.RecorderManager} this
         */
        this.fireEvent('stoprecord', this);
        
        this.removeCls('recorder-recording');
    },
    
    
    hideHighlighter : function () {
        if (this.test) {
            this.domContainer.clearHighlight();
        }
    },
    

    highlightTarget : function (target) {
        if (!target) {
            // Pass no target => simply hide highlighter
            this.hideHighlighter();
            return;
        }
        
        var test    = this.test;
        var R       = Siesta.Resource('Siesta.Recorder.UI.RecorderPanel');

        if (!test) {
            this.hideHighlighter();
            return { success : true }
        }
        
        var resolved, el

        try {
            resolved    = this.test.normalizeElement(target, true, true, true);
            
            el          = resolved.el
        } catch (e) {
            // sizzle may break on various characters in the query (=, $, etc)
        } finally {
            if (!el) {
                return { success : false, warning : R.get('queryMatchesNothing') }
            }
        }
        
        var warning     = resolved.matchingMultiple ? R.get('queryMatchesMultiple') : ''

        if (test.isElementVisible(el)) {
            this.domContainer.highlightTarget(el, '<span class="cmp-inspector-label">' + target + '</span>');
        } else {
            // If target was provided but no element could be located, return false so
            // caller can get a hint there is potential trouble
            warning     = warning || R.get('noVisibleElsFound')
        }

        return {
            success : !warning,
            message : warning
        };
    },


    createToolbars : function () {
        var me      = this;
        var R       = Siesta.Resource('Siesta.Recorder.UI.RecorderPanel');

        me.tbar = [
            {
                iconCls     : 'recorder-tool-icon icon-record',
                action      : 'recorder-start',
                cls         : 'recorder-tool',
                whenIdle    : true,
                tooltip     : R.get('recordTooltip'),
                tooltipType : 'title',
                handler     : me.onRecordClick,
                scope       : me
            },
            {
                iconCls     : 'recorder-tool-icon icon-stop-2',
                action      : 'recorder-stop',
                cls         : 'recorder-tool',
                handler     : me.stop,
                tooltip     : R.get('stopTooltip'),
                tooltipType : 'title',
                scope       : me
            },
            {
                iconCls     : 'recorder-tool-icon icon-play-2',
                action      : 'recorder-play',
                cls         : 'recorder-tool',
                handler     : me.onPlayClick,
                tooltip     : R.get('playTooltip'),
                tooltipType : 'title',
                scope       : me
            },
            {
                iconCls     : 'recorder-tool-icon icon-close',
                action      : 'recorder-remove-all',
                cls         : 'recorder-tool',
                handler     : function () {
                    if (this.store.getCount() === 0) return;

                    Ext.Msg.confirm('Remove all?', 'Do you want to clear the recorded events?', function (btn) {
                        if (btn == 'yes') {
                            // process text value and close...
                            me.clear();
                        }
                        this.close();
                    });
                },
                tooltip     : R.get('clearTooltip'),
                tooltipType : 'title',
                scope       : me
            },
            '->',
            {
                text    : 'Generate code',
                handler : function () {

                    var win = new Ext.Window({
                        title      : R.get('codeWindowTitle'),
                        layout     : 'fit',
                        height     : 400,
                        width      : 600,
                        autoScroll : true,
                        constrain  : true,
                        items      : {
                            xtype : 'jseditor',
                            mode  : 'text/javascript'
                        }
                    }).show();

                    win.items.first().setValue('t.chain(\n    ' + me.generateCodeForSteps().join(',\n\n    ') + '\n);')
                }
            },
            {
                text            : '+',
                action          : 'recorder-add-step',
                tooltip         : R.get('addNewTooltip'),
                tooltipType     : 'title',
                scope           : me,
                handler         : function () {
                    if (!me.test) {
                        Ext.Msg.alert(R.get('noTestDetected'), R.get('noTestStarted'));
                        return;
                    }
                    var store       = me.store;
                    var grid        = me.getEventView();
                    var selected    = grid.getSelectionModel().selected.first();
                    var model       = new store.model(new Siesta.Recorder.Action(this.newActionDefaults));

                    if (selected) {
                        store.insert(store.indexOf(selected) + 1, model);
                    } else {
                        store.add(model);
                    }

                    grid.editing.startEdit(model, 0);
                }
            },

            me.closeButton
        ];

        me.bbar = {
            xtype  : 'component',
            cls    : 'cheatsheet',
            height : 70,
            html   : '<table><tr><td class="cheatsheet-type">CSS Query:</td><td class="cheatsheet-sample"> .x-btn</td></tr>' +
                '<tr><td class="cheatsheet-type">Component Query:</td><td class="cheatsheet-sample"> &gt;&gt;toolbar button</td></tr>' +
                '<tr><td class="cheatsheet-type">Composite Query:</td><td class="cheatsheet-sample"> toolbar =&gt; .x-btn</td></tr></table>'
        };
    },

    // Attach to a test (and optionally a specific iframe, only used for testing)
    attachTo : function (test, iframe) {
        var me          = this;
        var doClear     = me.test && me.test.url !== test.url;
        var recorder    = this.recorder

        this.setTest(test);
        
        var frame       = iframe || test.scopeProvider.iframe;

        if (frame) {
            me.recorder.attach(frame.contentWindow);
        }

        if (doClear) me.clear();
    },

    
    getEventView : function () {
        return this.eventView;
    },

    
    onRecordClick : function () {
        var test    = this.test;
        var R       = Siesta.Resource('Siesta.Recorder.UI.RecorderPanel');

        if (this.recorder && test && test.global) {
            this.attachTo(test);
            this.recorder.start();
        } else {
            Ext.Msg.alert('Error', R.get('noTestStarted'))
        }
    },

    
    onPlayClick : function () {
        var me      = this;
        var test    = this.test;
        
        if (me.recorder && test) {
            me.recorder.stop();

            if (me.store.getCount() > 0) {
                var harness     = this.harness;

                harness.on('beforetestfinalizeearly', function (ev, test2) {
                    if (test2.url === test.url) {
                        // important, need to update our reference to the test
                        me.setTest(test2);

                        // Run test first, and before it ends - fire off the recorded steps
                        harness.getTestByURL(test.url).chain(me.generateSteps());
                    }
                }, null, { single : true });

                harness.launch([ harness.getScriptDescriptor(test.url) ]);
            }
        }
    },

    
    stop : function () {
        this.recorder.stop();
    },

    
    clear : function () {
        this.recorder.clear();
    },
    
    
    onRecorderClear : function () {
        this.store.removeAll();
    },
    

    setTest : function(test) {
        this.test               = test;
        this.eventView.test     = test;
    },
    

    generateSteps : function (events) {
        var steps       = [];
        var t           = this.test;

        this.store.each(function (ev) {
            var step    = ev.asStep(t);

            // Can be empty if the line is empty and hasn't been filled out yet
            if (step) steps.push(step);
        }, this);

        return steps;
    },


    onActionAdded : function (event, action) {
        var actionModel     = new Siesta.Recorder.Model.Action(action);
        
//            if (recordedEvent.type === 'type') {
//            var KC              = Siesta.Test.Simulate.KeyCodes();
//            var isSpecial       = KC.isSpecial(recordedEvent.keyCode) || KC.isNav(recordedEvent.keyCode);
//            var text            = isSpecial ? '[' + KC.fromCharCode(recordedEvent.charCode) + ']': String.fromCharCode(recordedEvent.charCode);
//
////            if (isSpecial) {
////                var keys        = KC.keys,
////                    charCode    = recordedEvent.charCode;
////
////                for (var p in keys) {
////                    if (keys[ p ] === charCode && p.length > 1) {
////                        text = '[' + p + ']';
////                        break;
////                    }
////                }
////            }
        
        this.store.add(actionModel)
        this.getEventView().scrollToBottom()
    },
    
    
    onActionRemoved : function (event, action) {
        this.store.remove(this.store.getById(action.id))
        
        this.getEventView().scrollToBottom()
    },
    
    
    onActionUpdated : function (event, action) {
        this.store.getById(action.id).afterEdit([ 'target', 'action', '__offset__' ])
    },
    
    
    generateCodeForSteps : function () {
        var steps       = [];

        this.store.each(function (ev) {
            var step    = ev.asCode();

            // Can be empty if the line is empty and hasn't been filled out yet
            if (step) steps.push(step);
        }, this);

        return steps;
    },

    
    getActions : function (asJooseInstances) {
        var actionModels    = this.store.getRange()
        
        return asJooseInstances ? Ext.Array.pluck(actionModels, 'data') : actionModels
    },

    
    onDestroy : function () {
        this.recorder.stop();
        
        this.callParent(arguments);
    }

});
