/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.VersionUpdateButton', {
    extend        : 'Ext.Button',
    xtype         : 'versionupdatebutton',

    text          : Siesta.Resource('Siesta.Harness.Browser.UI.VersionUpdateButton', 'newUpdateText'),
    action        : 'upgrade-siesta',
    hidden        : true,
    latestVersion : null,
    scale         : 'medium',

    constructor : function () {
        this.callParent(arguments);
        this.scope = this;

        if (Siesta.meta.VERSION && !window.location.href.match('^https')) {
            this.fetchVersionInfo();
        }
    },

    fetchVersionInfo : function () {

        Ext.data.JsonP.request({
            url      : '//bryntum.com/siesta_version',
            params   : { v : Siesta.meta.VERSION },
            scope    : this,
            callback : this.onRequestCompleted
        });
    },

    onRequestCompleted : function (success, data) {
        if (success &&
            data &&
            data.name &&
            new Ext.Version(data.name).isGreaterThan(Siesta.meta.VERSION || '1.0.0')) {

            this.latestVersion = data.name;

            this.show();
        }
    },

    handler : function () {
        var me = this;
        var R = Siesta.Resource('Siesta.Harness.Browser.UI.VersionUpdateButton');

        var win = new Ext.Window({
            cls         : 'changelog-window',
            title       : R.get('updateWindowTitleText') + (Siesta.meta.VERSION || '1.0.0'),
            bodyPadding : 5,
            modal       : true,
            width       : 500,
            height      : 380,
            closeAction : 'destroy',
            plain       : true,
            autoScroll  : true,
            buttons     : {
                padding : '10 13',
                style   : 'background: transparent',

                items : [
                    {
                        cls        : 'light-button',
                        href       : 'http://www.bryntum.com/products/siesta/download-lite',
                        hrefTarget : '_blank',
                        scale      : 'medium',
                        text       : R.get('downloadText') + this.latestVersion + R.get('liteText')
                    },
                    {
                        cls        : 'light-button',
                        href       : 'http://bryntum.com/customerzone',
                        hrefTarget : '_blank',
                        scale      : 'medium',
                        text       : R.get('downloadText') + this.latestVersion + R.get('standardText')
                    },
                    {
                        text    : R.get('cancelText'),
                        scale   : 'medium',
                        handler : function () {
                            win.close();
                        }
                    }
                ]
            }
        })

        win.show();
        win.body.mask(R.get('loadingChangelogText'));
        Ext.data.Connection.prototype.useDefaultXhrHeader = false;

        Ext.Ajax.request({
            url      : 'http://bryntum.com/changelogs/_siesta.php',
            callback : function (o, success, response) {
                win.body.unmask();

                if (success && response && response.responseText) {
                    win.body.update(response.responseText);
                } else {
                    win.body.update(Siesta.Resource('Siesta.Harness.Browser.UI.ResultPanel', 'changelogLoadFailedText'));
                }
            }
        })

        Ext.data.Connection.prototype.useDefaultXhrHeader = true;
    }
});