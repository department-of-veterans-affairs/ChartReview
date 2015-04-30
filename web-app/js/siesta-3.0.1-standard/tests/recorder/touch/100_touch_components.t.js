StartTest(function (t) {

    var getRecorder = function () {
        var extractor   = new Siesta.Recorder.TargetExtractor.ExtJS({
            componentIdentifiers : [
                'my',
                'id',
                'itemId',
                'iconCls',      // button/menuitem
                'type',         // Panel header tools
                'name'          // form fields
            ],

            Ext : function () {
                return t.Ext();
            }
        })

        var recorder = new Siesta.Recorder.Recorder({
            extractor       : extractor
        });

        recorder.attach($('#frame')[0].contentWindow);

        recorder.ignoreSynthetic = false;
        recorder.start();

        return recorder;
    }

    // Using an extra frame since it seems we cannot have both Touch + Ext in the same page

    document.body.innerHTML = '<iframe id="frame" width=500 height=500 src="recorder/touch/100_touch_components.html"/>'
//
//    t.it('Text field', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { waitFor : function() { return $('#frame')[0].contentWindow.Ext; }},
//
//            { click : '>> textfield[name=someField]' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 1);
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets textfield[name=someField] => .x-form-text');
//            }
//        )
//    })
//
//    t.it('Combo field', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '>> combobox[my=combo]' },
//            { click : '[my=combo] => .x-form-arrow-trigger' },
//            { click : '[my=combo].getPicker() => .x-boundlist-item:contains(Bar)' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 3);
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets combobox[my=combo] => .x-form-text');
//
//                t.is(recorderActions[ 1 ].action, 'click');
//                t.is(recorderActions[ 1 ].getTarget().target, '#form-widgets combobox[my=combo] => .x-form-trigger');
//
//                t.is(recorderActions[ 2 ].action, 'click');
//                t.is(recorderActions[ 2 ].getTarget().target, /*#form-widgets */'combobox[my=combo].getPicker() => .x-boundlist-item:contains(Bar)');
//            }
//        )
//    })
//
//    t.it('Combo field loaded remotely', function (t) {
//        t.requireOk('Ext.ux.ajax.SimManager', function () {
//
//            Ext.ux.ajax.SimManager.init({
//                delay : 300
//            }).register(
//                {
//                    'foo' : {
//                        stype : 'json',  // use JsonSimlet (stype is like xtype for components)
//                        data  : [
//                            { id : 1, name : 'user1', age : 25 },
//                            { id : 2, name : 'user2', age : 35 },
//                            { id : 3, name : 'user3', age : 45 }
//                        ]
//                    }
//                }
//            );
//
//            var recorder = getRecorder();
//
//            t.chain(
//                { click : '>> combobox[my=combo2]' },
//                { click : '[my=combo2] => .x-form-arrow-trigger' },
//                { click : '[my=combo2].getPicker() => .x-boundlist-item:contains(user2)' },
//
//                function () {
//                    var recorderEvents = recorder.getRecordedActions();
//
//                    recorder.stop();
//
//                    t.is(recorderEvents.length, 3);
//                    t.is(recorderEvents[0].action, 'click');
//                    t.is(recorderEvents[0].getTarget().target, '#form-widgets combobox[my=combo2] => .x-form-text');
//
//                    t.is(recorderEvents[1].action, 'click');
//                    t.is(recorderEvents[1].getTarget().target, '#form-widgets combobox[my=combo2] => .x-form-trigger');
//
//                    t.is(recorderEvents[2].action, 'click');
//                    t.is(recorderEvents[2].getTarget().target, /*#form-widgets */'combobox[my=combo2].getPicker() => .x-boundlist-item:contains(user2)');
//                }
//            )
//        })
//    })
//
//    t.it('Date field', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '>> datefield' },
//            { click : 'datefield => .x-form-trigger' },
//            { click : 'datefield[name=date].getPicker() => .x-datepicker-cell:contains(15)' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 3);
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets datefield[name=date] => .x-form-text');
//
//                t.is(recorderActions[ 1 ].action, 'click');
//                t.is(recorderActions[ 1 ].getTarget().target, '#form-widgets datefield[name=date] => .x-form-trigger');
//
//                t.is(recorderActions[ 2 ].action, 'click');
//                t.is(recorderActions[ 2 ].getTarget().target, 'datefield[name=date].getPicker() => .x-datepicker-date:contains(15)');
//            }
//        )
//    })
//
//    t.it('Time field', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '>> timefield' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 1);
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets timefield[name=time] => .x-form-text');
//            }
//        )
//    })
//
//    t.it('Number field', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '>> numberfield' },
//            { click : 'numberfield => .x-form-spinner-up' },
//            { click : 'numberfield => .x-form-spinner-down' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 3);
//
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets numberfield[name=number] => .x-form-text');
//
//                t.is(recorderActions[ 1 ].action, 'click');
//                t.is(recorderActions[ 1 ].getTarget().target, '#form-widgets numberfield[name=number] => .x-form-spinner-up');
//
//                t.is(recorderActions[ 2 ].action, 'click');
//                t.is(recorderActions[ 2 ].getTarget().target, '#form-widgets numberfield[name=number] => .x-form-spinner-down');
//            }
//        )
//    })
//
//    t.it('Text area', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '>> textareafield[name=message]' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 1);
//
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets textareafield[name=message] => .x-form-text');
//            }
//        )
//    })
//
//    t.it('Checkboxes', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '#fooChkInput' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 1);
//
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#fooChkInput');
//            }
//        )
//    })
//
//    t.it('Radio', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : '>>[name=radios]' },
//
//            function () {
//
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 1);
//
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets radiogroup radiofield[name=radios] => .x-form-radio');
//            }
//        )
//    })
//
//    t.it('Field set', function (t) {
//        var recorder = getRecorder();
//
//        t.chain(
//            { click : 'fieldset tool[type=toggle] => .x-tool-img' },
//            { click : 'fieldset tool[type=toggle] => .x-tool-img' },
//            { click : '>>[baa] checkboxfield' },
//
//            function () {
//                var recorderActions = recorder.getRecordedActions();
//
//                recorder.stop();
//
//                t.is(recorderActions.length, 3);
//
//                t.is(recorderActions[ 0 ].action, 'click');
//                t.is(recorderActions[ 1 ].action, 'click');
//                t.is(recorderActions[ 2 ].action, 'click');
//
//                t.is(recorderActions[ 0 ].getTarget().target, '#form-widgets fieldset[my=checkboxfieldset] tool[type=toggle] => .x-tool-img');
//                t.is(recorderActions[ 1 ].getTarget().target, '#form-widgets fieldset[my=checkboxfieldset] tool[type=toggle] => .x-tool-img');
//                t.is(recorderActions[ 2 ].getTarget().target, '#form-widgets fieldset[my=checkboxfieldset] checkbox => .x-form-checkbox');
//            }
//        )
//    })
})