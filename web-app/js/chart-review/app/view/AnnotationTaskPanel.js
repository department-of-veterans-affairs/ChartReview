Ext.define('CR.app.view.AnnotationTaskPanel',
{
	extend: 'Ext.panel.Panel',
	requires: ['Ext.button.Button','CR.app.controller.AnnotationNatureController'],
	alias: 'widget.taskpanel',
    layout:
    {
        type: 'border',
        padding: '0 0 0 0'
//        margins: '5 5 5 5'
    },
    width:'100%',
    height:'100%',
    mixins: {
        annotationaware: 'CR.app.controller.AnnotationNatureController'
    },
    autoSaveInterval: null,

    initComponent: function(){
        Ext.apply(this,
        {
            layout: {
                type: 'border',
                padding: '0 0 0 0'
//        margins: '5 5 5 5'
            },
            items: [
                {
                    xtype: 'toolbar',
                    id: 'taskinfosavebuttonpanel',
                    region: 'north',
                    autoScroll: true,
                    width: '100%',
                    //            height: '100%',
                    layout: {
                        type: 'hbox'
                        //                align: 'stretch'
                    },
                    items: [
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
                    xtype: 'container',
                    id: 'taskinfoinlinecontainer',
                    region: 'center',
                    width: '100%',
                    height: '100%',
                    layout: 'border',
                    items: [
                        {
                            xtype: 'container',
                            region: 'center',
                            width: '100%',
                            height: '100%',
                            layout: 'border',
                            items: [
                                {
                                    id: 'taskInfoInlinePanel',
                                    xtype: 'panel',
                                    autoScroll: true,
                                    region: 'center',
                                    width: '100%',
                                    height: '100%'
                                }
                            ]
                        }
                    ]
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
            this.down('#taskInfoInlinePanel').html = html;
        },
        principalClinicalElementSelectedByUser: function()
        {
            var html = this.rebuildTaskInfoInlineHtml();
            Ext.getCmp('taskInfoInlinePanel').update(html);
        },
        principalClinicalElementSelectedAutomatically: function()
        {
            var html = this.rebuildTaskInfoInlineHtml();
            Ext.getCmp('taskInfoInlinePanel').update(html);
        }
	},
    showTaskInfoWindow: function() {
        if(CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement != null)
        {
            var projectDocumentContents = 'no project document';
            var taskProjectDocument = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskProjectDocument;
            if(taskProjectDocument != null)
            {
                projectDocumentContents = taskProjectDocument;
            }
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
                    var detailedDescription = 'no detailed description';
                    var tDetailedDescription = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskDetailedDescription;
                    if(tDetailedDescription != null)
                    {
                        detailedDescription = tDetailedDescription;
                    }
                    html += '<tr><td class="taskInfoTableTD">Documentation:  </td><td class="taskInfoTableTD"><b>'+detailedDescription+'</b></td></tr>';
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
                            autoScroll: true,
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
            if(taskProjectDocument)
            {
                window.open('http://localhost:8080'+taskProjectDocument);
            }
        }
    },
    onSave: function() {
        CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.status = 'in-progress';
        CR.app.controller.AnnotationNatureController.doSync(false, false);
        var comps = Ext.ComponentQuery.query('[id=taskpanel]');
        for(var key1 in comps) {
            var comp = comps[key1];
            comp.resetAutoSaveInterval();
        }
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
        var comps = Ext.ComponentQuery.query('[id=taskpanel]');
        for (var key1 in comps) {
            var comp = comps[key1];
            comp.resetAutoSaveInterval();
        }
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
                        var comps = Ext.ComponentQuery.query('[id=taskpanel]');
                        for (var key1 in comps) {
                            var comp = comps[key1];
                            comp.resetAutoSaveInterval();
                        }
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
            var detailedDescription = 'no detailed description';
            var tDetailedDescription = CR.app.controller.AnnotationNatureController.selectedPrincipalClinicalElement.taskDetailedDescription;
            if(tDetailedDescription != null)
            {
                detailedDescription = tDetailedDescription;
            }
            html += '<tr><td class="taskInfoTableTD">Documentation:  </td><td class="taskInfoTableTD"><b>'+detailedDescription+'</b></td></tr>';
        }
//        html += '<tr><td>Project:  </td><td><b>'+CR.app.model.CRAppData.projectId+'</b></td></tr>';
//        html += '<tr><td>Process:  </td><td><b>'+CR.app.model.CRAppData.processId+'</b></td></tr>';
        html += '</table>';
        html += '</div>';
        return html;
    },
    constructor: function(config) {
        this.callParent(arguments);
        this.mixins.annotationaware.constructor.call(this);
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
