/**
 * ChartReviewPanel->PortalPanel(center)->Portlet(ClinicalElementPortlet)->ItemInfo->ItemSummary/ItemList->ItemSummaryDetail/ItemListGrid&ItemListDetail
 * @class Portal.view.PortalPanel
 * @extends Ext.panel.Panel
 * A {@link Ext.panel.Panel Panel} class used for providing drag-drop-enabled portal layouts.
 */
Ext.define('CR.app.view.PortalPanel', {
    id: 'portalpanel',
    extend: 'Ext.dashboard.Dashboard',
    alias: 'widget.portalpanel',
    requires: [
        'Ext.layout.container.Border',
        'Ext.dashboard.Dashboard'
    ],
    stateful: false,
    layout: 'column',
    columnWidths: [
        0.50,
        0.50
    ],
    //bodyPadding: 3,
    parts: {
        portlet: {
            viewTemplate: {
                layout: 'fit',
                items: [{
                    xtype: 'portlet'
                }]
            }
        }
    }
});
