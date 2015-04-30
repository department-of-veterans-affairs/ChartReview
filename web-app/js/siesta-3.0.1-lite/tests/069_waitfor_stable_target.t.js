StartTest(function (t) {

    function basicClickTest(name) {

        t.it(name, function (t) {

            var btn = new Ext.Button({ id : name, text : name });

            setTimeout(function () {
                btn.render(Ext.getBody());

                t.firesOnce(btn.el, name);
            }, 500)

            t.chain(
                { action : name, target : '#' + name }
            )
        })

    }

    Ext.Array.each([
        'click',
        'dblclick',
        'contextmenu'
    ], basicClickTest)

    t.it('moveMouseTo', function (t) {

        var btn = new Ext.Button({ id : 'moveMouseTo', text : 'moveMouseTo' });

        setTimeout(function () {
            btn.render(Ext.getBody());

            t.firesOnce(btn.el, 'mouseenter');
        }, 500)

        t.chain(
            { moveCursorTo : '#moveMouseTo' }
        )
    })

    t.it('dragBy', function (t) {

        var btn = new Ext.Button({ id : 'dragBy', text : 'dragBy' });

        setTimeout(function () {
            btn.render(Ext.getBody());

            t.firesOnce(btn.el, 'mousedown');
        }, 500)

        t.chain(
            { drag : '#dragBy', by : [2,2] }
        )
    })

    t.it('dragTo', function (t) {

        var btn = new Ext.Button({ id : 'dragTo', text : 'dragTo' });

        setTimeout(function () {
            btn.render(Ext.getBody());

            t.firesOnce(btn.el, 'mousedown');
        }, 500)

        t.chain(
            { drag : '#dragTo', to : [2,2] }
        )
    })
    
    t.it('Should wait until target el becomes top', function (t) {
        var el1     = document.createElement('div')
        
        el1.id              = 'one'
        el1.style.position  = 'absolute'
        el1.style.left      = '0'
        el1.style.top       = '100px'
        el1.style.zIndex    = 5
        el1.innerHTML       = 'TEXT ONE'
        
        document.body.appendChild(el1)
        
        var el2     = document.createElement('div')
        
        el2.id              = 'two'
        el2.style.position  = 'absolute'
        el2.style.left      = '0'
        el2.style.top       = '100px'
        el2.style.zIndex    = 1
        el2.innerHTML       = 'TEXT TWO'
        
        var el2Clicked      = false
        
        Ext.get(el2).on('click', function () {
            el2Clicked      = true
        })
        
        var async           = t.beginAsync()
        
        setTimeout(function () {
            document.body.appendChild(el2)
            
            setTimeout(function () {
                t.notOk(el2Clicked, "Click not happened yet, even that `el2` is already in DOM")
                
                el2.style.zIndex    = 10
                
                t.endAsync(async)
            }, 500)
        }, 100)
        
        t.chain(
            { click : '#two' },
            function () {
                t.ok(el2Clicked, "Click registered")
            }
        )
    })
    
});
