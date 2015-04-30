StartTest(function (t) {

    function getMockEvent(type, target) {
        var event = t.createEvent(type, null, target);

        return Ext.applyIf({
            target : target
        }, event);
    }

    t.it('Password field', function (t) {
        var extractor = new Siesta.Recorder.TargetExtractor.ExtJS()

        extractor.setExt(document.body);

        var field = new Ext.form.TextField({
            renderTo  : document.body
        });

        var field2 = new Ext.form.TextField({
            renderTo  : document.body,
            inputType : 'password'
        });

        t.is(extractor.findCompositeQueryFor(field.el.down('input').dom).query, 'textfield[inputType=password] => input', 'Correct composite query found')

    })

    t.iit('Password field in a window', function (t) {
        var extractor = new Siesta.Recorder.TargetExtractor.ExtJS()

        extractor.setExt(document.body);

        var win = new Ext.Window({
            height      : 200,
            width       : 350,
            layout      : 'form',
            autoShow    : true,
            defaultType : 'textfield',

            items : [{
                fieldLabel : 'Name',
                name       : 'name'
            }, {
                fieldLabel : 'Password',
                inputType  : 'password'
            }]
        });

        var dom = win.down('[inputType=password]').el.down('input').dom;
        var clickEvent = getMockEvent('click', dom)

        var targets = extractor.getTargets(clickEvent);

        t.is(targets.length, 4, 'CSQ, CQ, CSS, Array options extracted');

    })
})