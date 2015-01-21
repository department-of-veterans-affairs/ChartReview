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
    items: [
    {
        xtype: 'dashboard',
        reference: 'dashboard',
        id: 'dashboard',
        region: 'center',
        stateful: false,
        columnWidths: [
            0.50,
            0.50
        ],
        parts: {
//            rss: 'google-rss',
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
//            }
        }

//        defaultContent: [
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
//        ]
    }
    ]
});
