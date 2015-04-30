StartTest(function (t) {

    // frame created by htmleditor
    t.expectGlobals('0', /ext-/)

    var getRecorder = function () {
        var recorder = new Siesta.Recorder.Recorder({
            ignoreSynthetic         : false,
            uniqueComponentProperty : [
                'my'
            ]
        });

        recorder.attach(window);

        recorder.start();

        return recorder;
    }

    new Ext.form.Panel({
        id          : 'form-widgets',
        title       : 'Form Widgets',
        frame       : true,
        collapsible : true,
        width       : 500,
        renderTo    : document.body,
        tools       : [
            {type : 'toggle'},
            {type : 'close'}
        ],

        bodyPadding : '10 20',

        defaults : {
            anchor     : '98%',
            msgTarget  : 'side',
            allowBlank : false
        },

        items : [
            {
                xtype : 'label',
                text  : 'Plain Label'
            },
            {
                fieldLabel : 'TextField',
                xtype      : 'textfield',
                name       : 'someField',
                emptyText  : 'Enter a value'
            },
            {
                fieldLabel : 'ComboBox',
                xtype      : 'combobox',
                my         : 'combo',
                store      : ['Foo', 'Bar']
            },
            {
                fieldLabel   : 'Remote ComboBox',
                xtype        : 'combobox',
                my           : 'combo2',
                displayField : 'name',
                valueField   : 'id',
                store        : new Ext.data.JsonStore({
                    fields : ['id', 'name'],
                    proxy  : {
                        type : 'ajax',
                        url  : 'foo'
                    }
                })
            },
            {
                fieldLabel : 'DateField',
                xtype      : 'datefield',
                name       : 'date',
                value      : new Date()
            },
            {
                fieldLabel : 'TimeField',
                name       : 'time',
                xtype      : 'timefield'
            },
            {
                fieldLabel : 'NumberField',
                xtype      : 'numberfield',
                name       : 'number',
                emptyText  : '(This field is optional)',
                allowBlank : true
            },
            {
                fieldLabel : 'TextArea',
                xtype      : 'textareafield',
                name       : 'message',
                cls        : 'x-form-valid',
                value      : 'This field is hard-coded to have the "valid" style'
            },
            {
                fieldLabel : 'Checkboxes',
                xtype      : 'checkboxgroup',
                columns    : [100, 100],
                items      : [
                    {boxLabel : 'Foo', checked : true, id : 'fooChk', inputId : 'fooChkInput'},
                    {boxLabel : 'Bar'}
                ]
            },
            {
                fieldLabel : 'Radios',
                xtype      : 'radiogroup',
                columns    : [100, 100],
                items      : [
                    {boxLabel : 'Foo', checked : true, name : 'radios'},
                    {boxLabel : 'Bar'}
                ]
            },
            {
                hideLabel    : true,
                id           : 'htmleditor',
                xtype        : 'htmleditor',
                name         : 'html',
                enableColors : false,
                value        : 'Mouse over toolbar for tooltips.<br /><br />',
                height       : 110
            },
            {
                xtype : 'fieldset',
                title : 'Plain Fieldset',
                items : [
                    {
                        hideLabel : true,
                        xtype     : 'radiogroup',
                        items     : [
                            {boxLabel : 'Radio A', checked : true, name : 'radiogrp2'},
                            {boxLabel : 'Radio B', name : 'radiogrp2'}
                        ]
                    }
                ]
            },
            {
                xtype       : 'fieldset',
                title       : 'Collapsible Fieldset',
                baa         : 'baa',
                my          : 'checkboxfieldset',
                collapsible : true,
                items       : [
                    {xtype : 'checkbox', boxLabel : 'Checkbox 1'},
                    {xtype : 'checkbox', boxLabel : 'Checkbox 2'}
                ]
            },
            {
                xtype          : 'fieldset',
                title          : 'Checkbox Fieldset',
                checkboxToggle : true,
                items          : [
                    {xtype : 'radio', boxLabel : 'Radio 1', name : 'radiongrp1'},
                    {xtype : 'radio', boxLabel : 'Radio 2', name : 'radiongrp1'}
                ]
            }
        ],

        buttons : [
            {
                text    : 'Toggle Enabled',
                handler : function () {
                    this.up('form').items.each(function (item) {
                        item.setDisabled(!item.disabled);
                    });
                }
            },
            {
                text    : 'Reset Form',
                handler : function () {
                    Ext.getCmp('form-widgets').getForm().reset();
                }
            },
            {
                text    : 'Validate',
                handler : function () {
                    Ext.getCmp('form-widgets').getForm().isValid();
                }
            }
        ]
    });

    t.it('Text field', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>> textfield[name=someField]'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 1);
                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets textfield[name=someField] => .x-form-text');
            }
        )
    })

    t.it('Combo field', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>> combobox[my=combo]'},
            {click : '[my=combo] => .x-form-arrow-trigger'},
            {click : '[my=combo].getPicker() => .x-boundlist-item:contains(Bar)'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 3);
                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets combobox[my=combo] => .x-form-text');

                t.is(recorderActions[1].action, 'click');
                t.is(recorderActions[1].getTarget().target, '#form-widgets combobox[my=combo] => .x-form-trigger');

                t.is(recorderActions[2].action, 'click');
                t.is(recorderActions[2].getTarget().target, /*#form-widgets */'combobox[my=combo].getPicker() => .x-boundlist-item:contains(Bar)');
            }
        )
    })

    t.it('Combo field loaded remotely', function (t) {
        Ext.ux.ajax.SimManager.init({
            delay : 300
        }).register(
            {
                'foo' : {
                    stype : 'json',  // use JsonSimlet (stype is like xtype for components)
                    data  : [
                        {id : 1, name : 'user1', age : 25},
                        {id : 2, name : 'user2', age : 35},
                        {id : 3, name : 'user3', age : 45}
                    ]
                }
            }
        );

        var recorder = getRecorder();

        t.chain(
            {click : '>> combobox[my=combo2]'},
            {click : '[my=combo2] => .x-form-arrow-trigger'},
            {click : '[my=combo2].getPicker() => .x-boundlist-item:contains(user2)'},

            function () {
                var recorderEvents = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderEvents.length, 3);
                t.is(recorderEvents[0].action, 'click');
                t.is(recorderEvents[0].getTarget().target, '#form-widgets combobox[my=combo2] => .x-form-text');

                t.is(recorderEvents[1].action, 'click');
                t.is(recorderEvents[1].getTarget().target, '#form-widgets combobox[my=combo2] => .x-form-trigger');

                t.is(recorderEvents[2].action, 'click');
                t.is(recorderEvents[2].getTarget().target, /*#form-widgets */'combobox[my=combo2].getPicker() => .x-boundlist-item:contains(user2)');
            }
        )
    })

    t.it('Date field', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>> datefield'},
            {click : 'datefield => .x-form-trigger'},
            {click : 'datefield[name=date].getPicker() => .x-datepicker-cell:contains(15)'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 3);
                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets datefield[name=date] => .x-form-text');

                t.is(recorderActions[1].action, 'click');
                t.is(recorderActions[1].getTarget().target, '#form-widgets datefield[name=date] => .x-form-trigger');

                t.is(recorderActions[2].action, 'click');
                t.is(recorderActions[2].getTarget().target, 'datefield[name=date].getPicker() => .x-datepicker-date:contains(15)');
            }
        )
    })

    t.it('Time field', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>> timefield'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 1);
                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets timefield[name=time] => .x-form-text');
            }
        )
    })

    t.it('Number field', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>> numberfield'},
            {click : 'numberfield => .x-form-spinner-up'},
            {click : 'numberfield => .x-form-spinner-down'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 3);

                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets numberfield[name=number] => .x-form-text');

                t.is(recorderActions[1].action, 'click');
                t.is(recorderActions[1].getTarget().target, '#form-widgets numberfield[name=number] => .x-form-spinner-up');

                t.is(recorderActions[2].action, 'click');
                t.is(recorderActions[2].getTarget().target, '#form-widgets numberfield[name=number] => .x-form-spinner-down');
            }
        )
    })

    t.it('Text area', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>> textareafield[name=message]'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 1);

                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets textareafield[name=message] => .x-form-text');
            }
        )
    })

    t.it('Checkboxes', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '#fooChkInput'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 1);

                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#fooChkInput');
            }
        )
    })

    t.it('Radio', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : '>>[name=radios]'},

            function () {

                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 1);

                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[0].getTarget().target, '#form-widgets radiogroup[fieldLabel=Radios] radiofield[name=radios] => .x-form-radio');
            }
        )
    })

    t.it('Field set', function (t) {
        var recorder = getRecorder();

        t.chain(
            {click : 'fieldset tool[type=toggle] => .x-tool-img'},
            {click : 'fieldset tool[type=toggle] => .x-tool-img'},
            {click : '>>[baa] checkboxfield[boxLabel="Checkbox 1"]'},

            function () {
                var recorderActions = recorder.getRecordedActions();

                recorder.stop();

                t.is(recorderActions.length, 3);

                t.is(recorderActions[0].action, 'click');
                t.is(recorderActions[1].action, 'click');
                t.is(recorderActions[2].action, 'click');

                t.is(recorderActions[0].getTarget().target, '#form-widgets fieldset[my=checkboxfieldset] tool[type=toggle] => .x-tool-img');
                t.is(recorderActions[1].getTarget().target, '#form-widgets fieldset[my=checkboxfieldset] tool[type=toggle] => .x-tool-img');
                t.is(recorderActions[2].getTarget().target, '#form-widgets fieldset[my=checkboxfieldset] checkboxfield[inputType=checkbox] => .x-form-checkbox');
            }
        )
    })
})