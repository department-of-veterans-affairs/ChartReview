StartTest(function (t) {

    t.describe('Label field click (triggers extra click)', function (t) {
        document.body.innerHTML = '<label id="lab" for="foo">BAR</label><input id="foo">'

        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);

        t.it('click', function (t) {
            recorder.clear();
            recorder.start();

            t.click('#lab');

            var actions = recorder.getRecordedActions();

            t.is(actions.length, 1);
            t.is(actions[0].action, 'click');
            t.isDeeply(actions[0].getTarget(), { type : 'css', target : '#lab', offset : t.any() });

            recorder.stop();
        })

        t.it('right click', function (t) {
            recorder.clear();
            recorder.start();

            t.rightClick('#lab');
            var actions = recorder.getRecordedActions();

            t.is(actions.length, 1);
            t.is(actions[0].action, 'contextmenu');
            t.isDeeply(actions[0].getTarget(), { type : 'css', target : '#lab', offset : t.any() });

            recorder.stop();

        });

        t.it('double click', function (t) {
            recorder.clear();
            recorder.start();

            t.doubleClick('#lab');

            var actions = recorder.getRecordedActions();

            t.is(actions.length, 1);
            t.is(actions[0].action, 'dblclick');
            t.isDeeply(actions[0].getTarget(), { type : 'css', target : '#lab', offset : t.any() });

            recorder.stop();
            recorder.clear();
        })
    })

    t.describe('Should record text content of A tag', function (t) {

        var recorder = new Siesta.Recorder.Recorder({ ignoreSynthetic : false });

        recorder.attach(window);

        t.it('simple click', function (t) {
            document.body.innerHTML = '<a>BAR</a>'

            recorder.clear();
            recorder.start();

            t.click('a:contains(BAR)');

            var actions = recorder.getRecordedActions();

            t.is(actions.length, 1);
            t.is(actions[0].action, 'click');
            t.isDeeply(actions[0].getTarget(), { type : 'css', target : 'a:contains(BAR)', offset : t.any() });

            recorder.stop();
        })

        t.it('ignore if A tag contains markup', function (t) {
            document.body.innerHTML = '<a><span>BAR</span></a>'
            recorder.clear();
            recorder.start();

            t.click('a:contains(BAR)');

            var actions = recorder.getRecordedActions();

            t.is(actions.length, 1);
            t.is(actions[0].action, 'click');
            t.is(actions[0].getTarget().type, 'xy');

            recorder.stop();
        })
    })

    t.describe('Should support configuring which unique attribute to prioritize', function (t) {
        document.body.innerHTML = '<div id="foo"><span id="DONT_USE" other_id="USE_ME">Hello</span></div>'
        document.body.innerHTML += '<div other_id="someId"><span class="cls">Hello</span></div>'

        var recorder = new Siesta.Recorder.Recorder({
            extractorConfig : {
                uniqueDomNodeProperty : 'other_id'
            },
            ignoreSynthetic : false
        });

        recorder.attach(window);
        recorder.start();

        t.click('#DONT_USE');

        var actions = recorder.getRecordedActions();

        t.is(actions.length, 1);
        t.is(actions[0].action, 'click');
        t.isDeeply(actions[0].getTarget(), {
            type   : 'css',
            target : '[other_id=\'USE_ME\']',
            offset : t.any()
        });

        recorder.stop();
        recorder.clear();
        recorder.start();

        t.click('.cls');

        var actions = recorder.getRecordedActions();

        t.is(actions.length, 1);
        t.is(actions[0].action, 'click');
        t.isDeeply(actions[0].getTarget(), {
            type   : 'css',
            target : '[other_id=\'someId\'] .cls',
            offset : t.any()
        });

        recorder.stop();
    })
})