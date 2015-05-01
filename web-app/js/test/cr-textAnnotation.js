//title : 'CR Text Annotation',
StartTest(function(t) {
    t.diag("CR Text/Annotation");
    var viewDetail = "[clinicalElementConfigurationId='a57ba2f0-e55d-4f4a-848e-9bd7d2c233de']";
    t.chain(
    //    document.body.innerHTML = '<input type="text" style="width:200px" value="This field contains some text" /><textarea rows="3" cols="20">This textarea also contains some text blablablablablablabla</textarea>';
    //
    //var textInput = document.getElementsByTagName('input')[0],
    //    textArea  = document.getElementsByTagName('textarea')[0];
    //t.selectText(textInput, 5, 10);
    //t.is(t.getSelectedText(textInput), 'field', 'Correct textfield phrase selected');
    //
    //t.selectText(textArea, 0, 4);
    //t.is(t.getSelectedText(textArea), 'This', 'Correct textarea phrase selected');
        { click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] itemlistgrid [itemId=view] => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextNowrap", offset : [59, 8] },

        //{ click : "#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail panel button[text=Classify] => .x-btn-button", offset : [34, 6] },
        //{ drag : ">>#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail", offset : [56, 92], by : [21, 0] },

        function (next) {
            //alert('textArea1');
            var textArea = t.cq1('#app-portal clinicalelementportlet[title=Public Health Lab1] iteminfo itemlist[title=List (48 of 48)] panel itemlistdetail');
            if(textArea)
            {
                //alert('textArea='+textArea);
                //var textAreaEl = textArea.getEl();
                //textArea.update('HEY HEY HEY HEY HEY HEY HEY HEY HEY');
                // NOTE - this does not work.  The documentation says that textArea needs to be an <input>
                t.selectText(textArea.getEl(), 0, 10);
            }
            var popup = t.cq1('annotationschemapopupwindow');
            if(popup)
            {
                popup.show();
            }
            next();
        },

        { click : "#annotationschemapopuppanel => table.x-grid-item:nth-child(2) .x-grid-cell:nth-child(1) .x-tree-node-text", offset : [42, 4] },

        { click : "#annotationschemapopupwindow button[text=OK] => .x-btn-button", offset : [12, 11] },

        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(4) .cellTextWrap", offset : [6, 12] },

        { click : "#saveButton-btnInnerEl", offset : [28, 10] },

        { click : "#annotationlist => table.x-grid-item:nth-child(1) .x-grid-cell:nth-child(2) .cellTextWrap", offset : [57, 19] },

        { click : "#annotationlistbuttontoolbar button[iconCls=annotationDelete] => .annotationDelete", offset : [9, 10] },

        { click : "#saveButton-btnInnerEl", offset : [22, 7] }
    );
})
