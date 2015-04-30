StartTest(function(t) {
    
    //==================================================================================================================================================================================
    t.diag("Clicking on elements inside of an iframe");
    
    // seems in IE, iframes are added to global scope under index
    if (Ext.isIE) t.autoCheckGlobals = false;

    var counter;

    function setup(callback) {
        counter                 = 0

        var iframe          = document.createElement('iframe')

        iframe.id            = 'frame1';
        iframe.style.margin  = '50px'
        iframe.style.width  = '300px'
        iframe.style.height = '300px'
        iframe.src          = 'about:blank'

        var async           = t.beginAsync()

        var cont            = function () {
            t.endAsync(async)

            var iframeDoc       = iframe.contentWindow.document

            var div             = iframeDoc.createElement('div')
            var script          = iframeDoc.createElement('script')

            div.setAttribute('style', 'width : 100px; height : 100px; left : 100px; top : 100px; position : absolute; border : 1px solid black')
            div.setAttribute('class', 'foo');

            div.innerHTML       = 'INNER'

            script.setAttribute('src', '../../extjs-4.2.1/ext-all.js');
            script.setAttribute('type', 'text/javascript');

            var input           = iframeDoc.createElement('input')

            iframeDoc.body.appendChild(div)
            iframeDoc.body.appendChild(script)
            iframeDoc.body.appendChild(input)


            div.onclick = function (e) {
                t.isApprox(e.clientX, 150, 1, 'event coordinates should always be local to containing frame');
                t.isApprox(e.clientY, 150, 1, 'event coordinates should always be local to containing frame');
                counter++
            }

            callback();
        }

        if (iframe.attachEvent)
            iframe.attachEvent('onload', cont)
        else
            iframe.onload = cont

        document.body.appendChild(iframe)

    }

    function tearDown(t, callback) {
        t.moveCursorTo([0, 0], function() {
            document.body.innerHTML = '';

            callback();
        });
    }

    t.it('Should be able to adjust scope to the relevant frame and reset it back to the old global', function(t) {

        t.chain(
            setup,

            { waitForSelector : '#frame1' },

            function (next) {
                var oldGlobal = t.global;

                t.adjustScope('#frame1 -> div');

                t.is(t.global, document.getElementById('frame1').contentWindow);

                t.resetScope();

                t.is(t.global, oldGlobal);

                tearDown(t, next);
            }
        );
    });

    t.it('DOM Element targeting should support element in iframes', function(t) {

        t.chain(
            setup,

            { waitForSelector : '#frame1' },

            function (next) {
                var oldGlobal = t.global;

                var el = t.normalizeElement('#frame1 -> div');

                t.is(el.innerHTML, 'INNER');

                t.is(t.global, oldGlobal, 'Should find sane scope after operation');
                tearDown(t, next);
            }
        );
    });

    t.it('Ext Component targeting should support Ext in iframes', function(t) {

        t.chain(
            setup,

            {
                waitFor : function() {
                    var frame = document.getElementById('frame1');
                    return frame && frame.contentWindow && frame.contentWindow.Ext && frame.contentWindow.Ext.isReady;
                }
            },

            function (next) {
                var oldGlobal = t.global;
                var frame = document.getElementById('frame1');
                var Ext = frame.contentWindow.Ext;

                var btn = new Ext.Button({ text : 'BUTTON', foo : 'bar', renderTo : Ext.getBody(), cls : 'foo' })

                t.willFireNTimes(btn, 'click', 2);

                var el = t.normalizeElement('#frame1 -> >>button[foo=bar]', false, true);
                t.is(el, btn.el.dom, '#frame1 -> >>button[foo=bar]');
                t.is(t.global, oldGlobal, 'Should find sane scope after operation');

                var el = t.normalizeElement('#frame1 -> button[foo=bar] => span', false, true);
                t.is(el, btn.el.down('span').dom, '#frame1 -> button[foo=bar] => span');
                t.is(t.global, oldGlobal, 'Should find sane scope after operation');

                var cmp = t.normalizeActionTarget('#frame1 -> >>button[foo=bar]');
                t.is(cmp, btn, '#frame1 -> >>button[foo=bar]');
                t.is(t.global, oldGlobal, 'Should find sane scope after normalizeActionTarget operation');

                var el = t.normalizeElement('#frame1 -> >>button[foo=bar]', false, false);
                t.ok(Ext.fly(el).up('.foo'), '#frame1 -> >>button[foo=bar]');
                t.is(t.global, oldGlobal, 'Should find sane scope after operation');

                next()
            },

            { click : '#frame1 -> >>button[foo=bar]' },

            { click : '#frame1 -> button[foo=bar] => span' },

            function(next) {
                tearDown(t, next);
            }
        );
    });

    t.it('Should be able to click targets expressed as strings using -> to match elements in an iframe', function(t){

        t.chain(
            setup,

            { waitForSelector : '#frame1' },

            { click : '#frame1 -> div' },

            function (next) {
                t.is(counter, 1, 'One click event detected')
                t.isApprox(t.currentPosition[0], 200, 1, 'Current X-position should be relative to top scope');
                t.isApprox(t.currentPosition[1], 200, 1, 'Current Y-position should be relative to top scope');

                tearDown(t, next);
            }
        );
    });
});

