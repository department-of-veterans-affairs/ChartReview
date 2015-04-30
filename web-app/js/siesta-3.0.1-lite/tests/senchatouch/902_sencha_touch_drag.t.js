StartTest(function (t) {
    // only support IE11+ for now
    if (Ext.browser.is.IE && Ext.browser.version.getMajor() < 11) return

    document.body.innerHTML = '<div id="div" style="width:50px;height:50px">FOO</div>'

    var div = Ext.get('div');

    new Ext.util.Draggable({
        element : div
    });
    
    t.it('Should detect dragged element at correct position', function (t) {

        t.isDeeply(div.getXY(), [ 0, 0 ], 'Div at 0,0 originally')

        t.chain(
            {
                touchDrag   : div,
                by          : [ 50, 50 ]
            },

            function(next) {
                t.isDeeply(div.getXY(), [ 50, 50 ])
            }
        );
    })
});