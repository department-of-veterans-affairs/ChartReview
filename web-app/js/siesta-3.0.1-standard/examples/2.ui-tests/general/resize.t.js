StartTest(function (t) {

    t.it("Testing resizing a Window component.", function (t) {

        var extWin = new Ext.Window({
            width  : 200,
            height : 200,
            title  : 'Resize sample',
            html   : 'Hello world',
            x      : 100,
            y      : 100
        }).show();

        t.chain(
            { drag : 'window[title=Resize sample] => .x-resizable-handle-west', by : [-50, 0] },
            { drag : 'window[title=Resize sample] => .x-resizable-handle-east', by : [50, 0] },
            { drag : 'window[title=Resize sample] => .x-resizable-handle-north', by : [0, -50] },
            { drag : 'window[title=Resize sample] => .x-resizable-handle-south', by : [0, 50] },

            function () {
                var newSize = extWin.getSize();

                // on Linux there's 1px mismatch, passes precisely on Mac and Windows
                t.isApprox(newSize.width, 300, 1, 'Width updated correctly');
                t.isApprox(newSize.height, 300, 1, 'Height updated correctly');
            }
        );
    });
});