Ext.define('CR.app.view.AnnotationSchemaPopupWindow',
{
    id: 'annotationschemapopupwindow',
    itemId: 'annotationschemapopupwindow',
    alias: 'widget.annotationschemapopupwindow',
    extend: 'Ext.window.Window',
    mixins: {
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    requires: [],
    title: 'Choose Classification',
    closeAction: 'hide',
    width: 300,
    height: 300,
    layout: 'border',
    resizable: true,
    modal: false,
    listeners: {
        close: function() {
            this.fireEvent('cleanupClassificationChosen');
        }
    },
    items: [
        {
            xtype: 'annotationschemapopuppanel',
            region: 'center',
            scrollable: true,
            width: '100%',
            height: '100%'
        },
        {
            xtype: 'container',
            width: '100%',
            region: 'south',
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'center'
            },
            items: [
                {
                    xtype: 'button',
                    text: 'OK',
                    margin:'5 5 5 5',
                    tooltip: 'Annotate the selection with the chosen classification.',
                    handler: function() {
                        var schemaPopupPanel = this.up('window').getComponent('annotationschemapopuppanel');
                        var schemaElement = schemaPopupPanel.getSelectedSchemaElement();
                        this.up('window').fireEvent('classificationChosen', schemaElement);
                        this.up('window').close();
                    }
                },
                {
                    xtype: 'button',
                    text: 'Cancel',
                    margin:'5 5 5 5',
                    tooltip: 'Cancel the annotation.',
                    handler: function() {
                        this.up('window').close();  // See close listener.
                    }
                }
            ]
        }
    ]
});
