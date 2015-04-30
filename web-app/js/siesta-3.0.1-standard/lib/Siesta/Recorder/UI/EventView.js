/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.UI.EventView', {
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.eventview',
    cls         : 'siesta-eventview',

    editing             : null,
    test                : null,

    enableColumnMove    : false,
    
    typeEditor          : null,
    
    // Provided by instantiator
    highlightTarget     : function () { return { success : true } },
    

    initComponent : function () {
        var me      = this;
        var R       = Siesta.Resource('Siesta.Recorder.UI.EventView');

        me.plugins  = me.plugins || [];

        me.editing  = new Ext.grid.plugin.CellEditing({
            clicksToEdit : 1,
            
            startEdit : function (record, column, context) {
                this.completeEdit();

                column = typeof column === 'number' ? me.headerCt.items.getAt(column) : column;
                
                var editor

                if (column.xtype === "targetcolumn") {
                    record      = typeof record === 'number' ? me.store.getAt(record) : record;

                    if (column.setTargetEditor(record) === false) {
                        return;
                    }
                }
                
                var res     = Ext.grid.plugin.CellEditing.prototype.startEdit.apply(this, arguments);

                return res
            }
        });

        me.editing.on({
            beforeedit   : me.onBeforeEdit,
            validateedit : me.onValidateEdit,
            edit         : me.afterEdit,
            canceledit   : me.afterEdit,
            scope        : me
        });

        me.editing.on({
            beforeedit : function () {
                // Can't populate until we have a test bound
                this.typeEditor.populate(me.test);
            },
            scope      : me
        });

        this.relayEvents(me.editing, [ 'beforeedit', 'afteredit', 'validateedit' ])

        me.plugins.push(me.editing);

        Ext.apply(me, {
            
            viewConfig : {
                forceFit   : true,
                markDirty  : false,
                stripeRows : false,
                allowCopy  : true,
                plugins    : 'gridviewdragdrop'
            },

            columns : [
                {
                    header          : R.get('actionColumnHeader'),
                    dataIndex       : 'action',
                    width           : 100,
                    sortable        : false,
                    menuDisabled    : true,
                    tdCls           : 'eventview-typecolumn',
                    editor          : this.typeEditor = new Siesta.Recorder.Editor.ActionName()
                },
                new Siesta.Recorder.UI.TargetColumn({
                    cellEditing     : me.editing,
                    highlightTarget : this.highlightTarget
                }),
                {
                    header          : R.get('offsetColumnHeader'),
                    dataIndex       : '__offset__',
                    width           : 50,
                    sortable        : false,
                    menuDisabled    : true,
                    tdCls           : 'eventview-offsetcolumn',
                    renderer        : function (value, meta, record) {
                        var target      = record.getTarget()

                        if (target && target.offset) {
                            return target.offset + '<div class="eventview-clearoffset"></div>'
                        }
                    },
                    editor          : {}
                },
                {
                    xtype           : 'actioncolumn',
                    width           : 18,
                    sortable        : false,
                    menuDisabled    : true,
                    tdCls           : 'eventview-actioncolumn',

                    items           : [
                        {
                            iconCls : 'icon-delete',
                            handler : function (grid, rowIndex, colIndex) {
                                me.editing.completeEdit();

                                grid.store.removeAt(rowIndex);
                            }
                        }
                    ]
                }
            ]
        });

        this.callParent();
    },


    scrollToBottom  : function () {
        if (this.view.rendered) {
            this.view.el.dom.scrollTop = this.view.el.dom.scrollHeight;
        }
    },

    
    onBeforeEdit : function (cellEditing, e) {
        // Offset only relevant for mouseinput actions
        return e.field !== '__offset__' || e.record.isMouseAction();
    },
    

    afterEdit : function (plug, e) {

        if (e.field === 'action') {
            var store = e.column.field.store;
            store.clearFilter();

            if (store.getById(e.value).get('type') !== store.getById(e.originalValue).get('type')) {
                e.record.resetValues();
            }
        }
    },
    

    onValidateEdit : function (plug, e) {
        var value       = e.value;

        if (e.field === '__offset__') {
            e.cancel    = true;

            if (value) {
                var parsed  = e.record.parseOffset(value);

                if (parsed) {
                    e.record.setTargetOffset(parsed);
                }
            } else {
                e.record.clearTargetOffset();
            }
        } else if (e.column.getEditor().applyChanges) {
            e.cancel    = true;

            e.column.getEditor().applyChanges(e.record);
        }

        // Trigger manual refresh of node when 'set' operation is more complex
        if (e.cancel) {
            this.afterEdit(plug, e);
            this.getView().refreshNode(e.record);
        }
    },
    

    afterRender : function () {
        this.callParent(arguments);
        
        var view        = this.view

        view.el.on({
            mousedown : function (e, t) {
                var record = view.getRecord(view.findItemByChild(t));

                record.clearTargetOffset()
                this.getView().refreshNode(record);

                e.stopEvent();
            },
            scope     : this,
            delegate  : '.eventview-clearoffset'
        })
    }
});
