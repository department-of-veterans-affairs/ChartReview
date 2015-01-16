/**
 * @class Ext.app.PortalColumn
 * @extends Ext.container.Container
 * A layout column class used internally be {@link Ext.app.PortalPanel}.
 */
Ext.define('CR.app.view.PortalColumn', {
    id: 'app-portal-col-1',
    itemId: 'app-portal-col-1',
    alias: 'widget.portalcolumn',
    extend: 'Ext.container.Container',

    requires: [
        'Ext.layout.container.Anchor',
        'CR.app.view.Portlet'
    ],

    layout: 'anchor',
    defaultType: 'portlet',
    cls: 'x-portal-column'

    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
});