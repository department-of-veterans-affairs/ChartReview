Ext.define('CR.app.view.AnnotationTaskPanel',
{
    id: 'taskpanel',
    itemId: 'taskpanel',
    alias: 'widget.taskpanel',
	extend: 'Ext.panel.Panel',
	requires: ['Ext.button.Button','CR.app.controller.AnnotationNatureController'],
    mixins: {
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    autoSaveInterval: null,
    layout:
    {
        type: 'vbox',
        align: 'stretch',
        padding: '0 0 0 0'
    },
    flex: 40,

    initComponent: function()
    {
        Ext.apply(this,
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch',
                padding: '0 0 0 0'
            },
            items:
            [
                {
                    xtype: 'toolbar',
                    id: 'taskinfosavebuttonpanel',
                    scrollable: false,
                    flex: 0,
                    height: 32,
                    layout: {
                        type: 'hbox',
                        align: 'stretch',
                        padding: '0 0 0 0'
                    },
                    items:
                    [
                        {
                            xtype: 'button',
                            id: 'doneButton',
                            cls: 'doneButton',
                            text: 'Done',
                            focusCls: '', // work around for button staying focused - sencha bug
                            iconCls: 'doneTask',
                            iconAlign: 'left',
                            margin: '2 1 1 2',
                            tooltip: CR.app.model.CRAppData.readOnly ? 'Exit chart review' : 'Prompt for mark as completed, then save and exit chart review',
                            handler: this.onDone
                        },
                        {
                            xtype: 'button',
                            id: 'saveButton',
                            cls: 'saveButton',
                            text: 'Save',
                            focusCls: '', // work around for button staying focused - sencha bug
                            iconCls: 'saveTask',
                            iconAlign: 'left',
                            margin: '2 1 1 2',
                            tooltip: 'Save annotations, but keep the current task active.',
                            disabled: CR.app.model.CRAppData.readOnly ? true : false,
                            handler: this.onSave
                        },
                        {
                            xtype: 'button',
                            id: 'holdNextButton',
                            text: 'Hold/Next',
                            focusCls: '', // work around for button staying focused - sencha bug
                            iconCls: 'holdTask',
                            iconAlign: 'left',
                            margin: '2 1 1 2',
                            tooltip: 'Save annotations and submit the task as being on-hold until later.  Get the next task.',
                            disabled: CR.app.model.CRAppData.readOnly ? true : false,
                            handler: this.onHoldNext
                        },
                        {
                            xtype: 'button',
                            id: 'submitNextButton',
                            text: 'Submit/Next',
                            focusCls: '', // work around for button staying focused - sencha bug
                            iconCls: 'submitTask',
                            iconAlign: 'left',
                            margin: '2 1 1 2',
                            tooltip: 'Save annotations and submit the task as completed. Get the next task.',
                            disabled: CR.app.model.CRAppData.readOnly ? true : false,
                            handler: this.onSubmitNext
                        },
                        {
                            xtype: 'button',
                            text: 'Task Info',
                            iconCls: 'taskInfo',
                            iconAlign: 'left',
                            margin: '2 1 1 2',
                            tooltip: 'View the task information',
                            handler: this.showTaskInfoWindow
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    id: 'taskinfoinlinepanel',
                    scrollable: true,
                    flex: 100
//                    id: 'taskinfoinlinecontainer',
//                    flex: 70,
//                    layout: {
//                        type: 'vbox',
//                        align: 'stretch',
//                        padding: '0 0 0 0'
//                    },
//                    bodyStyle: {
//                        background: '#550000'
//                    },
//                    items:
//                    [
//                        {
//                            xtype: 'panel',
//                            flex: 100,
////                            layout: {
////                                type: 'vbox',
////                                align: 'stretch',
////                                padding: '0 0 0 0'
////                            },
//                            items:
//                            [
//                                {
//                                    id: 'taskinfoinlinepanel',
//                                    xtype: 'panel',
//                                    scrollable: true,
//                                    flex: 100
//                                }
//                            ]
//                        }
//                    ]
                }
            ]
        });
        this.callParent(arguments);
    },
	listeners:
	{
        beforerender: function()  // &nbsp;
        {
            var html = this.rebuildTaskInfoInlineHtml();
            this.down('#taskinfoinlinepanel').html = html;
        },
        principalClinicalElementSelectedByUser: function()
        {
            var html = this.rebuildTaskInfoInlineHtml();
            Ext.getCmp('taskinfoinlinepanel').update(html);
        },
        principalClinicalElementSelectedAutomatically: function()
        {
            var html = this.rebuildTaskInfoInlineHtml();
            Ext.getCmp('taskinfoinlinepanel').update(html);
        },
        principalClinicalElementLoaded: function()
        {
            // This happens after the tasks and schema have been loaded, after the principal clinical element has been created from the first (or only) given task
            // and after the annotations for the principal clinical element have benn loaded.
            //
            // NOTE: This is where a principal clinical element gets auto-selected in the current design
            // which does not dispay this tasks list to the user.  THIS FUNCTION USED TO BE I THE TASK LIST.  The selected principal clinical element gets
            // set after the schema has been loaded, in setTaskAux.  This event is fired there and this
            // component sets that principal clinical element id as its clinical element, so the annotations
            // fill will find the principal clinical element set on some component when it goes to fill the
            // list.
            //
            // The annotation list will fill in with annotations from the clinicalElementIds of the
            // components that have an clinicalElementId set.  Since we are not guaranteed to have
            // a principal clinicalElement portlet open, we set this list as having an clinicalElementId
            // of the selected principal clinicalElement so that it will be certain to be in the
            // list of clinicalElements whose annotations may be shown in the annotations list.
            this.clinicalElementId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.id;

            // Now that the principal clinical element has been loaded and set as the clinicalElementId on a component,
            CR.app.controller.AnnotationNatureController.fireAnnotationAwareEvent('principalClinicalElementSelectedAutomatically');
        }
    },
    showTaskInfoWindow: function() {
        if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement != null)
        {
            var taskProjectDocument = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskProjectDocument;
            if(taskProjectDocument != null)
            {
                window.open('http://localhost:8080'+taskProjectDocument);
            }
            else
            {
                var pnl = this;
                if(!pnl.win)
                {
                    var html = '';
                    html += '<div>'
                    html += '<table border="0" cellspacing="0" cellpadding="0" class="taskInfoTable">';
                    if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement != null)
                    {
                        var name = 'unknown';
                        var taskName = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskName;
                        var taskId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskId;
                        if(taskName != null)
                        {
                            name = taskName;
                        }
                        else if(taskId != null)
                        {
                            name = taskId;
                        }
                        html += '<tr><td class="taskInfoTableTD">Task Name:  </td><td class="taskInfoTableTD"><b>'+name+' ('+taskId+')</b></td></tr>';
//                            html += '<tr><td class="taskInfoTableTD">Task Id:  </td><td class="taskInfoTableTD"><b>'+taskId+'</b></td></tr>';
                        html += '<tr><td class="taskInfoTableTD">Principal:  </td><td class="taskInfoTableTD"><b>'+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.clinicalElementConfigurationName+'</b></td></tr>';
//                        html += '<tr><td class="taskInfoTableTD">Documentation:  </td><td class="taskInfoTableTD"><a href='+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskProjectDocument+' target="_blank">'+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskProjectDocument+'</a></td></tr>';
                        var detailedDescription = 'no detailed description';
                        var tDetailedDescription = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskDetailedDescription;
                        if(tDetailedDescription != null)
                        {
                            detailedDescription = tDetailedDescription;
                        }
                        html += '<tr><td class="taskInfoTableTD">Description:  </td><td class="taskInfoTableTD"><b>'+detailedDescription+'</b></td></tr>';
                    }
//                        html += '<tr><td>Project:  </td><td><b>'+CR.app.model.CRAppData.projectId+'</b></td></tr>';
//                        html += '<tr><td>Process:  </td><td><b>'+CR.app.model.CRAppData.processId+'</b></td></tr>';
                    html += '</table>';
//                if(success)
//                {
//                    if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement != null)
//                    {
//                        html += '<br/><iframe src="' + response + '" width="400" height="300" />';
////                                var projectDocumentContents = response;
////                                html += projectDocumentContents;
//                    }
//                }
                    html += '</div>';
                    pnl.win = Ext.widget('window', {
                        title: 'Task Info',
                        iconCls: 'taskInfo',
                        closeAction: 'hide',
                        width: 800,
                        height: 700,
                        layout: 'border',
                        resizable: true,
                        modal: false,
                        items: [
                            {
                                id: 'taskInfoWindowPanel',
                                xtype: 'panel',
                                region: 'center',
                                scrollable: true,
                                width: '100%',
                                height: '100%',
                                html: html
                            },
//                    { THIS OPENS THE PDF IN THE EXTJS WINDOW - WHICH IS MODAL, BUT CANNOT BE DRAGGED OUT OF THE BROWSER...COOL BUT NOT WHAT IS WANTED, MAYBE...
//                        xtype: 'component',
//                        region: 'center',
//                        autoEl: {
//                            tag: 'iframe',
//                            style: 'height: 100%; width: 100%; border: none',
//                            src: 'http://localhost:8080'+taskProjectDocument
//                        }
//                    },
                            {
                                id: 'taskInfoButtonPanel',
                                xtype: 'container',
                                width: '100%',
                                region: 'south',
                                layout: {
                                    type: 'hbox',
                                    align: 'middle',
                                    pack: 'center'
                                },
                                items: [
                                    {
                                        xtype: 'button',
                                        text: 'Close',
                                        margin:'5 5 5 5',
                                        tooltip: 'Close the task information window.',
                                        handler: function() {
                                            this.up('.window').close();
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                }
                pnl.win.show();
            }
        }
    },
    onSave: function() {
        CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'in-progress';
        CR.app.controller.AnnotationNatureController.doSync(false, false);
        var comp = Ext.ComponentQuery.query('[id=taskpanel]')[0];
        comp.resetAutoSaveInterval();
    },
    onDone: function(btn){
        if(CR.app.model.CRAppData.readOnly)
        {
            var baseUrl = window.location.origin + "/chart-review/report/annotationsByAnnotatorDetail";
            window.top.location.assign(baseUrl);
        }
        else
        {
//            var newAnnotations = CR.app.controller.AnnotationNatureController.getNewAnnotations();
//            if(newAnnotations.length > 0)
//            {
//                Ext.MessageBox.show({
//                    title: 'Save Changes?',
//                    msg: 'Save new annotations before exiting?',
//                    buttons: Ext.Msg.YESNOCANCEL,
//                    closable:false,
//                    icon: Ext.MessageBox.QUESTION,
//                    fn: function(btn)
//                    {
//                        var saveAnnotations = true;
//                        if(btn == "cancel")
//                        {
//                            return;
//                        }
//                        if(btn == "no")
//                        {
//                            saveAnnotations = false;
//                        }
//                        if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement != null &&
//                            CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status == 'completed')
//                        {
//                            if(saveAnnotations == false)
//                            {
//                                var newAnnotationsById = [];
//                                for(var key1 in CR.app.controller.AnnotationNatureController.annotationsById) {
//                                    var annotations = CR.app.controller.AnnotationNatureController.annotationsById[key1];
//                                    var newAnnotations = [];
//                                    for(var key2 in annotations) {
//                                        var annotation = annotations[key2];
//                                        if(annotation.isNew == false)
//                                        {
//                                            newAnnotations[key2] = annotation;
//                                        }
//                                    }
//                                    if(annotations.length > 0)
//                                    {
//                                        newAnnotationsById[key1] = newAnnotations;
//                                    }
//                                }
//                                CR.app.controller.AnnotationNatureController.annotationsById = newAnnotationsById;
//                                CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
//                            }
//                            CR.app.controller.AnnotationNatureController.doSync(true, true); // Jump to home page after and reset annotation aware
//                        }
//                        else
//                        {
//                            Ext.MessageBox.show({
//                                title: 'Mark as Completed?',
//                                msg: 'Mark this task as completed?',
//                                buttons: Ext.Msg.YESNOCANCEL,
//                                closable:false,
//                                icon: Ext.MessageBox.QUESTION,
//                                fn: function(btn)
//                                {
//                                    if(btn == "cancel")
//                                    {
//                                        return;
//                                    }
//                                    if(btn == "yes")
//                                    {
//                                        CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'completed';
//                                    }
//                                    if(btn == "no")
//                                    {
//                                        if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status == "todo")
//                                        {
//                                            CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'in-progress';
//                                        }
//                                    }
//                                    if(saveAnnotations == false)
//                                    {
//                                        var newAnnotationsById = [];
//                                        for(var key1 in CR.app.controller.AnnotationNatureController.annotationsById) {
//                                            var annotations = CR.app.controller.AnnotationNatureController.annotationsById[key1];
//                                            var newAnnotations = [];
//                                            for(var key2 in annotations) {
//                                                var annotation = annotations[key2];
//                                                if(annotation.isNew == false)
//                                                {
//                                                    newAnnotations[key2] = annotation;
//                                                }
//                                            }
//                                            if(annotations.length > 0)
//                                            {
//                                                newAnnotationsById[key1] = newAnnotations;
//                                            }
//                                        }
//                                        CR.app.controller.AnnotationNatureController.annotationsById = newAnnotationsById;
//                                        CR.app.controller.AnnotationNatureController.setSelectedAnnotation(null);
//                                    }
//                                    CR.app.controller.AnnotationNatureController.doSync(true, true); // Jump to home page after and reset annotation aware
//                                }
//                            });
//                        }
//                    }
//                });
//            }
//            else
            {
                if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status == 'completed')
                {
                    CR.app.controller.AnnotationNatureController.doSync(true, true);// Jump to home page after and reset annotation aware
                }
                else
                {
                    Ext.MessageBox.show({
                        title: 'Mark as Completed?',
                        msg: 'Mark this task as completed?',
                        buttons: Ext.Msg.YESNOCANCEL,
                        closable:false,
                        icon: Ext.MessageBox.QUESTION,
                        fn: function(btn)
                        {
                            if(btn == "cancel")
                            {
                                return;
                            }
                            if(btn == "yes")
                            {
                                CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'completed';
                            }
                            if(btn == "no")
                            {
                                if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status == "todo")
                                {
                                    CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'in-progress';
                                }
                            }
                            CR.app.controller.AnnotationNatureController.doSync(true, true);// Jump to home page after and reset annotation aware
                        }
                    });
                }
            }
        }
    },
    doExit: function ()
    {
    },
    onSubmitNext: function () {
        CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'completed';
        CR.app.controller.AnnotationNatureController.doSync(false, true); // Do not jump to home page and do reset annotation aware
        var comp = Ext.ComponentQuery.query('[id=taskpanel]')[0];
        comp.resetAutoSaveInterval();
    },
    onHoldNext: function () {
        var msgbox = Ext.MessageBox.show({
            title: 'Comment',
            msg: 'Hold comment:',
            width: 300,
            buttons: Ext.MessageBox.OKCANCEL,
            multiline: true,
            fn: function (btn, text, cfg) {
                if (btn == 'ok') {
                    if (Ext.isEmpty(text)) {
                        var newMsg = '<span style="color:red">Please enter a hold comment</span>';
                        Ext.Msg.show(Ext.apply({}, { msg: newMsg }));
                    }
                    else {
                        CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'hold';
                        CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElementStatusComment = text;
                        CR.app.controller.AnnotationNatureController.doSync(false, true); // Do not jump to home page and do reset annotation aware
                        var comp = Ext.ComponentQuery.query('[id=taskpanel]')[0];
                        comp.resetAutoSaveInterval();
                    }
                }
            }
        });
        msgbox.textArea.inputEl.dom.type = 'text';
    },
    rebuildTaskInfoInlineHtml: function()
    {
        var html = '';
//        html += '<div style="height:102px;overflow:auto;">';
        html += '<div>'
        html += '<table border="0" cellspacing="0" cellpadding="0" class="taskInfoTable">';
        if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement != null)
        {
            var name = 'unknown';
            var taskName = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskName;
            var taskId = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskId;
            if(taskName != null)
            {
                name = taskName;
            }
            else if(taskId != null)
            {
                name = taskId;
            }
            var description = 'no description';
            html += '<tr><td class="taskInfoTableTD">Task Name:  </td><td class="taskInfoTableTD"><b>'+name+' ('+taskId+')</b></td></tr>';
//            html += '<tr><td class="taskInfoTableTD">Task Id:  </td><td class="taskInfoTableTD"><b>'+taskId+'</b></td></tr>';
            html += '<tr><td class="taskInfoTableTD">Principal:  </td><td class="taskInfoTableTD"><b>'+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.clinicalElementConfigurationName+'</b></td></tr>';
//            html += '<tr><td class="taskInfoTableTD">Documentation:  </td><td class="taskInfoTableTD"><a href='+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskProjectDocument+' target="_blank">'+CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskProjectDocument+'</a></td></tr>';
            var detailedDescription = 'no detailed description';
            var tDetailedDescription = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskDetailedDescription;
            if(tDetailedDescription != null)
            {
                detailedDescription = tDetailedDescription;
            }
            html += '<tr><td class="taskInfoTableTD">Description:  </td><td class="taskInfoTableTD"><b>'+detailedDescription+'</b></td></tr>';
        }
//        html += '<tr><td>Project:  </td><td><b>'+CR.app.model.CRAppData.projectId+'</b></td></tr>';
//        html += '<tr><td>Process:  </td><td><b>'+CR.app.model.CRAppData.processId+'</b></td></tr>';
        html += '</table>';
        html += '</div>';
        return html;
    },
    constructor: function(config) {
        this.callParent(config);
//        this.mixins.annotationaware.constructor.call(this);
        this.resetAutoSaveInterval();
    },
    resetAutoSaveInterval: function() {
        if(this.autoSaveInterval)
        {
            // Throw away the old timer.
            clearInterval(this.autoSaveInterval);
        }
        // Create a new timer.
        this.autoSaveInterval = setInterval(function () {
            if (CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement) {
                CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'in-progress';
                CR.app.controller.AnnotationNatureController.doSync(false, false); // Do not jump to home page and do not reset annotation aware
            }
        }, 3600000); // Hourly 3600000; Half hourly 1080000
    }
});
