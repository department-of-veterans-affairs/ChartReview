/**
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
//        'Ext.ux.dashboard.GoogleRssPart',
        'Ext.dashboard.Dashboard'
    ],
    layout: {
        type: 'border'
    },
//    listeners: {
//        resize: function(comp, width, height, oldWidth, oldHeight, eOpts )
//        {
//            alert('width='+width+' height='+height+' oldWidth='+oldWidth+' oldHeight='+oldHeight);
//
//        }
//    },
    initComponent: function(){
        this.dashboard = Ext.create({
            xtype: 'dashboard',
            reference: 'dashboard',
            id: 'dashboard',
            region: 'center',
            stateful: true,
            layout: {
                type: 'column',
                padding: '3 3 3 3'
            },
            columnWidth: 0.5
//            listeners: {
//                resize: function (comp, width, height, oldWidth, oldHeight, eOpts) {
//                    alert('222 width=' + width + ' height=' + height + ' oldWidth=' + oldWidth + ' oldHeight=' + oldHeight);
//
//                }
//            }
//            parts: {
//                justpanel: {
//                    viewTemplate: {
//                        title: 'Panel',
//                        items: [{
//                            xtype: 'panel',
//                            width: 200,
//                            height: 200
//                        }]
//                    }
//                }
//            rss: 'google-rss'
//
//            stocks: {
//                viewTemplate: {
//                    title: 'Markets',
//                    items: [{
//                        xtype: 'markets'
//                    }]
//                }
//            },
//
//            stockTicker: {
//                viewTemplate: {
//                    title: 'Stocks',
//                    items: [{
//                        xtype: 'stocks'
//                    }]
//                }
//            },
//            defaultContent: [
//                {
//                    type: 'justpanel',
//                    columnIndex: 0
////                    width: 1000,
////                    height: 300
//                },
//                {
//                    type: 'justpanel',
//                    columnIndex: 1
////                    width: 1000,
////                    height: 300
//                },
//                {
//                    type: 'justpanel',
//                    columnIndex: 1
////                    width: 1000,
////                    height: 300
//                }
//            ]
//         {
//            type: 'rss',
//            columnIndex: 0,
//            height: 500,
//            feedUrl: 'http://feeds.feedburner.com/extblog'
//        }, {
//            type: 'stockTicker',
//            columnIndex: 1,
//            height: 300
//        }, {
//            type: 'stocks',
//            columnIndex: 1,
//            height: 300
//        }, {
//            type: 'rss',
//            columnIndex: 2,
//            height: 350,
//            feedUrl: 'http://rss.cnn.com/rss/edition.rss'
//        }
        });
        Ext.apply(this, {
            items: [this.dashboard]
        });
        this.callParent(arguments);
    }
});
