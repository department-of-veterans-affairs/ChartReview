Ext.define('CR.ux.CRFitToParent',
    {
        alias: 'plugin.crfittoparent',

        extend : 'Ext.AbstractPlugin',

        /**
         * @cfg {HTMLElement/Ext.Element/String} parent The element to fit the component size to (defaults to the element the component is rendered to).
         */
        /**
         * @cfg {Boolean} fitWidth If the plugin should fit the width of the component to the parent element (default <tt>true</tt>).
         */
        fitWidth: true,

        /**
         * @cfg {Boolean} fitHeight If the plugin should fit the height of the component to the parent element (default <tt>true</tt>).
         */
        fitHeight: true,
        /**
         * @cfg {Boolean} offsets Decreases the final size with [width, height] (default <tt>[0, 0]</tt>).
         * CHART REVIEW HEIGHT OFFSET ALLOWS ROOM FOR THE BANNER AT THE TOP OF THE CHART REVIEW APPLICATION
         * NOTE this value should be three pixels less than the margin-top of the parent div of the appContent div in chart-review.gsp
         */
        offsets: [0, 43],
        /**
         * @constructor
         * @param {HTMLElement/Ext.Element/String/Object} config The parent element or configuration options.
         * @ptype fittoparent
         */
        constructor: function(config)
        {
            config = config || {};
            if (config.tagName || config.dom || Ext.isString(config)){
                config = {parent: config};
            }
            Ext.apply(this, config);
        },
        init: function(c)
        {
            this.component = c;
            c.on('render', function(c)
            {
                this.parent = Ext.get(this.parent || c.getPositionEl().dom.parentNode);
                if (c.doLayout)
                {
                    c.monitorResize = true;
                    c.doLayout = Ext.Function.createInterceptor(c.doLayout, this.fitSize, this);
                }
                this.fitSize();
                Ext.EventManager.onWindowResize(this.fitSize, this);
            }, this, {single: true});
        },
        fitSize: function()
        {
            var pos = this.component.getPosition(true),
                size = this.parent.getViewSize();
            this.component.setSize(
                this.fitWidth ? size.width - pos[0] - this.offsets[0] : undefined,
                this.fitHeight ? size.height - pos[1] - this.offsets[1]: undefined);
        }
    });
