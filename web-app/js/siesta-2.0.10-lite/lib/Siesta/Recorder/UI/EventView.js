/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
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

                if (column.dataIndex === "target") {
                    record      = typeof record === 'number' ? me.store.getAt(record) : record;
                    
                    editor      = this.getEditor(record, column)

                    if (column.bindEditor(editor, record) === false) {
                        return;
                    }
                }
                
                if (editor && editor.field.getEditorValue) {
                    var override    = function (dataIndex) {
                        delete record.get
                        
                        var res     = editor.field.getEditorValue(record)
                        
                        record.get  = override
                        
                        return res
                    }
                    
                    record.get      = override
                }
                
                var res     = Ext.grid.plugin.CellEditing.prototype.startEdit.apply(this, arguments);

                if (editor && editor.field.getEditorValue) delete record.get
                
                return res
            },
            
            onEditComplete : function (ed, value, startValue) {
                var me = this, record, restore;
        
                // if field instance contains applyChanges() method
                // then we delegate saving to it
                if (ed.field.applyChanges) {
                    record      = me.context.record;
                    restore     = true;
                    // overwrite original set() method to use applyChanges() instead
                    record.set  = function() {
                        // restore original method
                        delete record.set;
                        restore = false;
        
                        ed.field.applyChanges(record);
                    };
                }
        
                Ext.grid.plugin.CellEditing.prototype.onEditComplete.apply(this, arguments);
        
                // restore original set() method
                if (restore) {
                    delete record.set;
                }
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

        this.relayEvents(me.editing, [ 'beforeedit', 'afteredit' ])

        me.plugins.push(me.editing);

        Ext.apply(me, {
            
            viewConfig : {
                forceFit   : true,
                markDirty  : false,
                stripeRows : false,
                allowCopy  : true,
                plugins    : {
                    ptype : 'gridviewdragdrop'
                }
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
                        
                        if (target && target.offset) return '<div class="eventview-clearoffset"></div>' + target.offset
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

            if (store.getById(e.value).get('action') !== store.getById(e.originalValue).get('action')) {
                e.record.resetValues();
            }
        }
    },
    

    onValidateEdit : function (plug, e) {
        var value       = e.value;

        if (value && e.field === '__offset__') {
            e.cancel    = true;

            var parsed  = e.record.parseOffset(value);

            if (parsed) e.record.setTargetOffset(parsed);
        }
    },
    

    afterRender : function () {
        this.callParent(arguments);
        
        var view        = this.view

        view.el.on({
            mousedown : function (e, t) {
                var record = view.getRecord(view.findItemByChild(t));
                
                record.clearTargetOffset()
                
                e.stopEvent();
            },
            scope     : this,
            delegate  : '.eventview-clearoffset'
        })
    }
});
