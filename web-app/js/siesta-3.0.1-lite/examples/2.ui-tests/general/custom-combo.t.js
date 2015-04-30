StartTest(function (t) {

    function setup() {
        Ext.define("Post", {
            extend : 'Ext.data.Model',
            proxy  : {
                type   : 'memory',
                reader : {
                    type          : 'json',
                    root          : 'topics',
                    totalProperty : 'totalCount'
                },
                data   : {
                    "totalCount" : "10",
                    "topics"     : [{
                        "post_id"     : "604220",
                        "topic_title" : "Status bar error with IFrames",
                        "topic_id"    : "134120",
                        "author"      : "Daz",
                        "post_time"   : "1305857168",
                        "post_text"   : "Ext version tested:\n\n Ext 3.3.3\n\nAdapter used:\next\n \ncss used:\ndefault ext-all.css\n \nBrowser versions tested against:\nFF4 (firebug 1.7.1 installed)\n \n...",
                        "forum_title" : "Ext 3.x: Bugs",
                        "forumid"     : "41",
                        "reply_count" : "0"
                    }, {
                        "post_id"     : "604153",
                        "topic_title" : "Using XTemplate to send XML",
                        "topic_id"    : "134102",
                        "author"      : "cayenne_08",
                        "post_time"   : "1305841170",
                        "post_text"   : "This is what I am trying to do to post custom XML on editor form submit:\r\n\r\n\n\r\n(function() {\r\n Q.dxi.QXmlWriter = Ext.extend(Ext.data.XmlWriter, ...",
                        "forum_title" : "Ext 3.x: Help",
                        "forumid"     : "40",
                        "reply_count" : "0"
                    }]
                }
            },

            fields : [
                { name : 'id', mapping : 'post_id' },
                { name : 'title', mapping : 'topic_title' },
                { name : 'topicId', mapping : 'topic_id' },
                { name : 'author', mapping : 'author' },
                { name : 'lastPost', mapping : 'post_time', type : 'date', dateFormat : 'timestamp' },
                { name : 'excerpt', mapping : 'post_text' }
            ]
        });

        var ds = Ext.create('Ext.data.Store', {
            model : 'Post'
        });


        var panel = Ext.create('Ext.panel.Panel', {
            renderTo    : Ext.getBody(),
            title       : 'Search the Ext Forums',
            width       : 600,
            bodyPadding : 10,
            layout      : 'anchor',

            items : [{
                xtype        : 'combo',
                store        : ds,
                displayField : 'title',
                typeAhead    : false,
                hideLabel    : true,
                hideTrigger  : true,
                anchor       : '100%',

                listConfig : {
                    loadingText : 'Searching...',
                    emptyText   : 'No matching posts found.',

                    // Custom rendering template for each item
                    getInnerTpl : function () {
                        return '<div class="search-item">' +
                            '<h3><span>{[Ext.Date.format(values.lastPost, "M j, Y")]}<br />by {author}</span>{title}</h3>' +
                            '{excerpt}' +
                            '</div>';
                    }
                }
            }, {
                xtype : 'component',
                style : 'margin-top:10px',
                html  : 'Live search requires a minimum of 4 characters.'
            }]
        });
    }

    setup();

    t.diag("Testing one of the Ext JS examples.");
    var loadTriggered;

    t.chain(
        { waitForXType : 'combobox' },

        function (next, foundComponents) {
            var combo = foundComponents[0],
                store = combo.store;

            t.is(store.getCount(), 0, 'Store is empty before we start typing');

            store.on('beforeload', function () {
                loadTriggered = true;
            });

            next();
        },

        { click : '>>combobox' },

        // 'gri' is not enough to trigger a load
        { type : 'gri', target : '>>combobox' },

        function (next) {
            t.notOk(loadTriggered, 'Store load not triggered when typing < 4 chars');

            next();
        },

        { type : 'd', target : '>>combobox' },

        // Waiting for the custom drop down list to appear
        { waitForSelector : '.x-boundlist-item' },

        // move cursor to the 2nd item in the list
        { moveCursorTo : '.x-boundlist-item:nth-child(2)' }
    );
});