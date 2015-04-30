/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.AssertionTreeColumn', {

    extend : 'Ext.tree.Column',
    alias  : 'widget.assertiontreecolumn',

    imgWithOffsetText : '<img src="{1}" class="{0}" style="left:{2}px" />',
    tdCls             : 'tr-tree-column',
    resultTpl         : null,
    dataIndex         : 'folderStatus',
    flex              : 1,
    menuDisabled      : true,
    sortable          : false,

    descriptionTpl : '<span class="assertion-text">{text}</span>',

    initComponent : function () {

        this.descriptionTpl = this.descriptionTpl instanceof Ext.XTemplate ? this.descriptionTpl : new Ext.XTemplate(this.descriptionTpl);

        Ext.apply(this, {
            scope     : this
        });

        this.callParent(arguments);
    },

    renderer      : function (value, metaData, record, rowIndex, colIndex, store) {
        var retVal = '';
        var result = record.data.result;
        var annotation = result.annotation;

        if (result instanceof Siesta.Result.Summary) {
            return record.data.result.description.join('<br>');
        }

        retVal = this.descriptionTpl.apply({
            text : Ext.String.htmlEncode(result.isWarning ? 'WARN: ' + result.description : result.description)
        });

        if (annotation) {
            retVal += '<pre title="' + annotation.replace(/"/g, "'") + '" style="margin-left:' + record.data.depth * 16 + 'px" class="tr-assert-row-annontation">' + Ext.String.htmlEncode(annotation) + '</pre>';
        }

        return retVal;
    },

    // TODO
    _treeRenderer : function (value, metaData, record, rowIdx, colIdx, store, view) {
        var me = this,
            buf = [],
            format = Ext.String.format,
            depth = record.getDepth(),
            treePrefix = me.treePrefix,
            elbowPrefix = me.elbowPrefix,
            expanderCls = me.expanderCls,
            imgText = me.imgText,
            checkboxText = me.checkboxText,
            formattedValue = me.origRenderer.apply(me.origScope, arguments),
            blank = Ext.BLANK_IMAGE_URL,
            href = record.get('href'),
            target = record.get('hrefTarget'),
            cls = record.get('cls');

        while (record) {
            if (!record.isRoot() || (record.isRoot() && view.rootVisible)) {
                if (record.getDepth() === depth) {
                    buf.unshift(format(imgText,
                        treePrefix + 'icon ' +
                        treePrefix + 'icon' + (record.get('icon') ? '-inline ' : (record.isLeaf() ? '-leaf ' : '-parent ')) +
                        (record.get('iconCls') || ''),
                        record.get('icon') || blank
                    ));
                    if (record.get('checked') !== null) {
                        buf.unshift(format(
                            checkboxText,
                            (treePrefix + 'checkbox') + (record.get('checked') ? ' ' + treePrefix + 'checkbox-checked' : ''),
                            record.get('checked') ? 'aria-checked="true"' : ''
                        ));
                        if (record.get('checked')) {
                            metaData.tdCls += (' ' + treePrefix + 'checked');
                        }
                    }
                    if (record.isLast()) {
                        if (record.isExpandable()) {
                            buf.unshift(format(imgText, (elbowPrefix + 'end-plus ' + expanderCls), blank));
                        } else {
                            buf.unshift(format(imgText, (elbowPrefix + 'end'), blank));
                        }

                    } else {
                        if (record.isExpandable()) {
                            buf.unshift(format(imgText, (elbowPrefix + 'plus ' + expanderCls), blank));
                        } else {
                            buf.unshift(format(imgText, (treePrefix + 'elbow'), blank));
                            buf.unshift(format(this.imgWithOffsetText, (treePrefix + 'elbow-line tr-elbow-line'), blank, (record.getDepth() - 1) * 16));
                        }
                    }
                } else {
                    if (record.isLast() || record.getDepth() === 0) {
                        buf.unshift(format(imgText, (elbowPrefix + 'empty'), blank));
                    } else if (record.getDepth() !== 0) {
                        buf.unshift(format(imgText, (elbowPrefix + 'line'), blank));
                        buf.unshift(format(imgText, (elbowPrefix + 'line tr-elbow-line'), blank));
                    }
                }
            }
            record = record.parentNode;
        }
        if (href) {
            buf.push('<a href="', href, '" target="', target, '">', formattedValue, '</a>');
        } else {
            buf.push(formattedValue);
        }
        if (cls) {
            metaData.tdCls += ' ' + cls;
        }
        return buf.join('');
    }
});
