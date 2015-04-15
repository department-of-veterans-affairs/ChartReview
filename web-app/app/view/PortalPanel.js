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
    stateful: false, // MAYBE use this to save the layout by user
    layout: 'column', // only one shown
    //layout: 'card', // only one shown
    //layout: 'anchor', // pretty good - can drag to left, not right, RESIZES WITH WINDOW HORIZONTALLY!!
    //layout: 'border', // weird - all show up but overlayed in CENTER? can resize, but not move apart
    //layout: 'box', // horizontal layout - drag looses windows, add view adds to right side, way past blank spots from dragged things
    //layout: 'center', // vertical layout centered horizontally.  can resize vertically, but not horizontally; drag overlays cant separate vertically
    //layout: 'checkboxgroup', // kind of like box, but drag can go down one or more rows.  not bad but still too weird
    //layout: 'container', // kind of like column, but no better; does not resize with window horizontally; after drag resizes to window width and cannot be resized down; can still be vertically resized
    //layout: 'fit', // WORKS WELL, ONE PORTAL PER SCREEN, vertical scroll - CAN SCROLL DOWN each portal is sized to browser window size; cannot be resized horizontally; after drag can be resized vertially, not horizontally
    //layout: 'form', // Pretty good.  Initial layout is vertical, not auto expand horizontal.  drag is nice, but resizes horizontally to screen width on drop, cannot resize horizontally after; vertial resize of non dragged portals moves top of dragged portal
    //layout: 'table', // Pretty good.  Initial layout is horizontal, not auto expand horizontal.  drag is nice, but resizes horizontally to screen width on drop, cannot resize horizontally after; vertial resize of non dragged portals moves top of dragged portal
    //bodyPadding: 3,
    //padding: '5 5 5 5',
    //margin: '5 5 5 5',
    //shrinkWrap: 3,
    //draggable: true,
    //simpleDrag: true,
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
