/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.AboutWindow', {
    extend      : 'Ext.Window',

    id          : 'aboutwindow',
    bodyPadding : 20,
    modal       : true,
    width       : 500,
    height      : 380,
    closeAction : 'destroy',
    bodyStyle   : 'background: #fff',
    autoScroll  : true,

    initComponent : function() {

        this.title = Siesta.Resource('Siesta.Harness.Browser.UI.AboutWindow', 'titleText').replace('{VERSION}', Siesta.meta.VERSION || '1.0.0');
        this.html = Siesta.Resource('Siesta.Harness.Browser.UI.AboutWindow', 'bodyText');

        this.buttons = {
            padding : '10 13',
            style   : 'background: transparent',

            items   : [
                {
                    hidden  : !Siesta.Harness.Browser.Automation,
                    text    : Siesta.Resource('Siesta.Harness.Browser.UI.AboutWindow', 'upgradeText'),
                    handler : function () {
                        window.open('http://bryntum.com/store/siesta');
                    }
                },
                {
                    text    : Siesta.Resource('Siesta.Harness.Browser.UI.AboutWindow', 'closeText'),
                    handler : function () {
                        this.up('window').close();
                    }
                }
            ]
        };

        this.callParent(arguments);
    }
});

