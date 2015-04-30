/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.DomContainer', {
    extend : 'Ext.Panel',
    alias  : 'widget.domcontainer',

    cls                     : 'siesta-domcontainer',
    header                  : false,
    collapsible             : true,
    animCollapse            : false,
    padding                 : 10,

    test                    : null,
    testListeners           : null,
    maintainViewportSize    : true,
    canManageDOM            : true,
    suspendAfterLayoutAlign : false,
    inspector               : null,

    initComponent : function () {
        var me = this;

        this.testListeners = []

        this.title = Siesta.Resource('Siesta.Harness.Browser.UI.DomContainer', 'title');

        //this.addEvents(
        //    'inspectionstart',
        //    'inspectionstop',
        //    'targethover',
        //    'targetselected'
        //)

        Ext.apply(this, {

            dockedItems : this.consoleCt = {
                xtype     : 'component',
                dock      : 'bottom',
                hidden    : true,
                height    : 20,
                cls       : 'domcontainer-console',
                renderTpl : '<div><input type="text" /></div>'
            }
        });

        this.callParent()

        this.on({
            afterlayout : this.onAfterLayout,
            expand      : this.onExpand,
            collapse    : this.onCollapse,

            scope : this
        });

        this.inspector = new Siesta.Harness.Browser.UI.ComponentInspector({
            resolveTarget : function (target) {
                return me.test.normalizeElement(target);
            }
        });

        this.inspector.on({
            start : this.onInspectionStart,
            stop  : this.onInspectionStop,
            scope : this
        });

        this.relayEvents(this.inspector, ['start', 'stop'], 'inspection')
    },

    afterRender : function () {
        this.callParent(arguments);

        var input = this.consoleInput = this.el.down('.domcontainer-console input');

        this.inspector.on('targethover', function (dc, cmp) {
            input.dom.value = 'Ext.getCmp("' + cmp.id + '").';
        });

        this.inspector.on('targetselected', function (dc, cmp) {
            input.focus(true);
        });

        input.on({
            keyup : function (e, t) {
                var val = input.dom.value;

                if (e.getKey() === e.ENTER && val) {
                    var frame = this.getIFrame();

                    try {
                        var retVal = frame.contentWindow.eval(val);
                        if (window.console) {
                            console.log(retVal);
                        }
                    } catch (e) {
                        window.console && console.log(e.message);
                    }
                }
            },
            scope : this
        });
    },

    setCanManageDOM : function (value) {
        this.canManageDOM = value

        if (value && !this.hidden) this.alignIFrame()
    },


    getIFrameWrapper : function () {
        var test = this.test;

        if (test)
            return this.canManageDOM && test.scopeProvider && test.scopeProvider.wrapper || null
        else
            return null;
    },


    getIFrame : function () {
        var test = this.test;

        if (test)
            return this.canManageDOM && test.scopeProvider && test.scopeProvider.iframe || null
        else
            return null;
    },


    onAfterLayout : function () {
        if (!this.suspendAfterLayoutAlign) this.alignIFrame();
    },


    alignIFrame : function () {
        var wrapper = this.getIFrameWrapper();

        if (!this.isFrameVisible() || !wrapper) return

        Ext.fly(wrapper).removeCls('tr-iframe-hidden')
        Ext.fly(wrapper).removeCls('tr-iframe-forced')

        var box = this.body.getBox()

        Ext.fly(wrapper).setBox(box)

        if (!this.maintainViewportSize) {
            Ext.fly(this.getIFrame()).setSize(this.body.getSize())
        }

        var test = this.test

        test && test.fireEvent('testframeshow')
    },


    onCollapse : function () {
        this.hideIFrame();
    },


    onExpand : function () {
        this.alignIFrame();
    },


    hideIFrame : function () {
        var iframe = this.getIFrameWrapper()

        iframe && Ext.fly(iframe).setStyle({
            left : '-10000px',
            top  : '-10000px'
        })

        var test = this.test

        test && test.fireEvent('testframehide')
    },


    isFrameVisible : function () {
        return !(this.hidden || this.collapsed)
    },


    showTest : function (test, assertionsStore) {
        this.stopInspection();

        if (this.test) {
            Joose.A.each(this.testListeners, function (listener) {
                listener.remove()
            })

            this.testListeners = []

            this.hideIFrame()
        }

        this.test = test

        this.testListeners = [
            test.on('testfinalize', this.onTestFinalize, this)
        ]

        // when starting the test with forcedIframe - do not allow the assertion grid to change the location of the iframe
        // (canManageDOM is set to false)
        this.setCanManageDOM(!test.hasForcedIframe())

        this.alignIFrame();
    },


    onTestFinalize : function (event, test) {
        this.setCanManageDOM(true)

        // this prevents harness from hiding the iframe, because "test.hasForcedIframe()" will return null
        // we've moved the iframe to the correct position, and it can never be "forced" again anyway
        if (this.isFrameVisible()) {
            test.forceDOMVisible = false
            test.isDOMForced = false
        }
    },


    destroy                 : function () {
        Ext.destroy(this.boxIndicator);
        this.boxIndicator = null;

        // just in case
        this.hideIFrame()

        Joose.A.each(this.testListeners, function (listener) {
            listener.remove()
        })

        this.test = null

        this.callParent(arguments)
    },

    // BEGIN Inspection related code
    // -----------------------------
    inspectedComponent      : null,
    inspectedComponentXType : null,
    boxIndicator            : null,

    inspecting : false,

    toggleInspectionMode : function (on) {
        if (!this.test) return;

        if (on) {
            this.startInspection();

        } else {
            this.stopInspection();
        }
    },

    startInspection : function (showConsole) {
        this.inspector.start(this.test.global, this.getIFrameWrapper());

        var wrap = Ext.get(this.getIFrameWrapper());
        wrap.un('mouseout', this.onMouseLeave, this);
        wrap.on('mouseout', this.onMouseLeave, this);

        if (showConsole !== false) {
            if (!(this.consoleCt instanceof Ext.Component)) {
                this.consoleCt = Ext.widget(this.consoleCt);
            }
            this.consoleCt.show();
        }
        this.addCls('inspection-mode');
    },

    stopInspection : function () {
        this.inspector.stop();

        this.removeCls('inspection-mode');

        if (this.consoleCt.rendered) {
            this.consoleCt.hide();
        }
    },

    onMouseLeave : function (e, t) {
        if (!this.el.contains(e.relatedTarget) && !Ext.fly(this.getIFrameWrapper()).contains(e.relatedTarget)) {
            this.stopInspection();
        }
    },

    onInspectionStart : function () {
        var wrap = Ext.get(this.getIFrameWrapper());

        if (wrap) {
            wrap.on('mouseout', this.onMouseLeave, this);
        }
    },

    onInspectionStop : function () {
        var wrap = Ext.get(this.getIFrameWrapper());

        if (wrap) {
            wrap.un('mouseout', this.onMouseLeave, this);
        }
    },

    clearHighlight : function () {
        this.stopInspection();
    },

    highlightTarget : function (target, content) {
        if (!this.inspector.active) {
            this.startInspection();
        }
        this.inspector.highlightTarget(target, content);
    }
});