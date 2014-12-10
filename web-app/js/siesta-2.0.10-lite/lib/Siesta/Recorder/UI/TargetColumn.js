/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.UI.TargetColumn', {
    extend       : 'Ext.grid.Column',
    alias        : 'widget.targetcolumn',
    
    header       : Siesta.Resource('Siesta.Recorder.UI.TargetColumn', 'headerText'),
    dataIndex    : 'target',
    flex         : 1,
    sortable     : false,
    menuDisabled : true,
    field        : {},
    tdCls        : 'eventview-targetcolumn',

    // API for highlighting typed target text, supplied by owner/creator
    highlightTarget : null,

    
    renderer : function (value, meta, record) {
        // we are not interested in the default value which is a "target" field value
        value               = ''
        
        var actionName      = (record.data.action || '').toLowerCase()
        var isMoveCursor    = actionName === 'movecursor'
        
        if (record.hasTarget() || isMoveCursor) {
            var target      = record.getTarget()
            
            if (target || isMoveCursor) {
                value               = isMoveCursor ? '' : target.target
                
                if (target && target.type == 'cq') value = '>>' + value
            
                if (actionName === 'drag' || isMoveCursor) {
                    var R           = Siesta.Resource('Siesta.Recorder.UI.TargetColumn');
                    
                    var toTarget    = record.data.toTarget
                    var by          = record.data.by
        
                    if (toTarget && toTarget.targets.length && (!toTarget.isTooGeneric() || !by))
                        value       += ' ' + R.get('to') + ': ' + toTarget.getTarget().target;
                    else if (by)
                        value       += ' ' + R.get('by') + ': [' + by + ']';
                }
            }
        } else {
            value           = record.get('value')
        }
        
        return value;
    },

    // HACK, some dirt since Ext JS doesn't allow to re-bind a new editor to a column
    bindEditor : function (editor, actionRecord) {
        editor.alignment = 'tl-c?';

        var newField = this.getTargetEditor(actionRecord);

        // Not all actions have target editors
        if (!newField) {
            return false;
        }

        var oldField = editor.field;

        this.setEditor(newField);

        editor.removeAll(true);
        editor.add(newField);
        editor.field = newField;

        Ext.apply(newField, {
            inEditor  : true,
            msgTarget : newField.msgTarget == 'title' ? 'title' : 'qtip'
        });

        editor.mun(oldField, {
            scope      : editor,
            blur       : editor.onFieldBlur,
            specialkey : editor.onSpecialKey
        });

        editor.mon(newField, {
            scope      : editor,
            blur       : editor.onFieldBlur,
            specialkey : editor.onSpecialKey
        });

        editor.mun(oldField, 'autosize', editor.onFieldAutosize, editor, { delay : 1 });

        if (newField.grow) {
            editor.mon(newField, 'autosize', editor.onFieldAutosize, editor, { delay : 1 });
        }
    },
    

    getTargetEditor : function (record) {
        var me          = this;
        var action      = record.get('action');

        if (action.match(/^waitFor/)) {
            if (action === 'waitForAnimations') return null;
            if (action === 'waitForFn') return new Siesta.Recorder.Editor.Code();
            
            if (action === 'waitForMs') 
                return new Ext.form.field.Number({
                    
                    getEditorValue : function (record) {
                        return record.get('value')
                    },
                    
                    applyChanges : function (actionRecord) {
                        actionRecord.set('value', this.getValue())
                    }
                })

            // Default waitFor editor will just be a text field
            return new Ext.form.field.Text({
                getEditorValue : function (record) {
                    return record.get('value')
                },
                applyChanges : function (actionRecord) {
                    actionRecord.set('value', this.getValue())
                }
            });
        }

        if (action === 'drag') {
            return new Siesta.Recorder.Editor.DragTarget({
                onTargetChange : function () {
                    me.onTargetChange.apply(me, arguments);
                }
            });
        }

        if (action === 'moveCursor') {
            return new Siesta.Recorder.Editor.MoveCursorTarget({
                onTargetChange : function () {
                    me.onTargetChange.apply(me, arguments);
                }
            });
        }
        
        if (action === 'fn') {
            return new Siesta.Recorder.Editor.Code();
        }

        // Assume it's a target action
        var editor = new Siesta.Recorder.Editor.Target({
            listeners : {
                select : this.onTargetChange,
                keyup  : this.onTargetChange,
                focus  : this.onTargetChange,
                buffer : 50,
                scope  : this
            }
        });
        editor.populate(record.data.target);

        return editor;
    },

    
    onTargetChange : function (field) {
        var target      = field.getTarget();

        if (!target) return;
        
        var textTarget  = target.target
        
        if (target.type == 'cq') textTarget = '>>' + textTarget

        var result      = this.highlightTarget(textTarget);

        if (result.success) {
            field.clearInvalid()
        } else {
            field.markInvalid(result.message);
        }
    }
});
