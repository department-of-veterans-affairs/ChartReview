/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.Header', {

    extend : 'Ext.Component',

    xtype : 'siesta-header',
    cls   : 'siesta-header',

    afterRender : function () {
        var R = Siesta.Resource('Siesta.Harness.Browser.UI.Viewport');

        this.callParent(arguments);

        this.getEl().createChild([
            {
                tag  : 'a',
                cls  : "logo-link",
                href : "#",
                cn   : [
                    {
                        tag  : 'span',
                        html : (Siesta.meta.VERSION || "1.0.0"),
                        cls  : 'tr-version-indicator'
                    }
                ]
            },
            {
                tag : 'div',
                cls : "right-top-area",
                cn  : [
                    {
                        tag    : 'a',
                        id     : "bryntum-logo",
                        href   : "http://bryntum.com/",
                        target : "_blank",
                        cls  : "bryntum-logo"
                    },
                    {
                        tag    : 'a',
                        cls    : 'apidocs-link',
                        href   : R.get('apiLinkUrl'),
                        target : '_blank',
                        html   : R.get('apiLinkText')
                    }
                ]
            },

            {
                tag : 'div',
                id  : 'update-ct'
            }
        ]);
    }
})
