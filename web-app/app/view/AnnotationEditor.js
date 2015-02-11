Ext.define('CR.app.view.AnnotationEditor', {
	id: 'annotationeditor',
    itemId: 'annotationeditor',
    alias: 'widget.annotationeditor',
	multiSelect: true,
	mixins: {
		annotationaware: 'CR.app.controller.AnnotationNatureController'
	},
	store: {type: 'annotationeditorstore'},
	requires: ['Ext.data.*'],
    extend: 'Ext.panel.Panel',
    autoScroll: true,
    layout:
    {
        type: 'vbox',
        align: 'stretch',
        padding: '0 0 0 0' // top right bottom left
    },
    border: true,
    split: true,
    flex:20,
    items: [
        {
            xtype:'textfield',
            fieldLabel: 'hi'
        }
    ],
    clipFieldName: function(fieldName)
    {
    	var clippedFieldName = fieldName;
    	if(fieldName.length > 25)
    	{
    		clippedFieldName = fieldName.substring(0, 25) + "...";
    	}
    	return clippedFieldName;
    },
    addEditorWidgets: function(drawEyeToSelectedAnnotationResult){
        this.removeAll(true);
      	var attributes = CR.app.controller.AnnotationNatureControllerAnnotations.getAttributesForSelectedAnnotation();
      	if(attributes.length > 0)
      	{
			for (key in attributes)
			{
                var attribute = attributes[key];
                if(typeof attribute != 'undefined')
                {
                    var fld;
                    if(attribute.attributeDef.options != null)
                    {
                        fld = this.createOptionField(attribute);
                    }
                    else if (Number(attribute.attributeDef.type) == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_DATE)
                    {
                        fld = this.createDateField(attribute);
                    }
                    else if (Number(attribute.attributeDef.type) == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_BLOB)
                    {
                        fld = this.createTextAreaField(attribute);
                    }
                    else
                    {
                        fld = this.createTextField(attribute);
                    }
                    this.add(fld);
                    if(drawEyeToSelectedAnnotationResult)
                    {
                        var runner = new Ext.util.TaskRunner(),
                            task = runner.start({
                                counter: 0,
                                colors: ['#FF0000', '#FF2929', '#FF4E4E', '#FF6868', '#FF8E8E', '#FFB2B2', '#FFC8C8', '#FFEEEE', '#FFFFFF', '#FFFFFF'],
                                run: function () {
                                    fld.setStyle({
                                        backgroundColor: this.colors[this.counter++]
                                    });
                                },
                                interval: 50,
                                repeat: 10
                            });
                    }
                }
			}
      	}
        this.doLayout();
    },
    createOptionField: function(attribute){
        var options = [];
        for (key2 in attribute.attributeDef.options)
        {
            var option = attribute.attributeDef.options[key2];
            options.push([key2, option]);
        }
        var store = new Ext.data.SimpleStore({
            fields:[
                'field1',
                'field2'
            ],
            data:options
        });
        var cf = new Ext.form.field.ComboBox({
            id: 'comboField-' + attribute.attributeDef.id,
            name: 'comboField-' + attribute.attributeDef.id,
            store: store,
            valueField: 'field1',
            displayField: 'field2',
            mode: 'local',
            fieldLabel: attribute.attributeDef.name,//this.clipFieldName(attribute.attributeDef.name),
            myAttr: attribute,
            typeAhead: false,
            editable: false,
            disabled: CR.app.model.CRAppData.readOnly ? true : false,
            triggerAction: 'all',
            fieldStyle: "font-size: 12px; padding: 0px 2px 0px 2px; ", // The bottom padding of zero (top, left, bottom, right) is key to getting the text to not be cut-off on the bottom in these ext form field text widgets...
            labelStyle: {
                'fontSize'     : '11px'
            },
            labelAlign: 'top',
            style: 'padding-left:10px;',
            width: 300, // NOTE - I tried everything to make this fill the 100% All it did is default to something small, so I set it to a decent size...
            minWidth: 300,
            forceSelection: true
        });
        cf.setValue(attribute.value);
        cf.on('select', this.onComboBoxSelect, this);  // Set this BEFORE the listener gets added or we may proliferate annotations on updateAnnotation
        return cf;
    },
    createDateField: function(attribute){
        var dateTimePanel = Ext.create('Ext.panel.Panel', {
            width: '100%',
            layout: 'vbox',
            border: false
        });
        var date = null;
        if(attribute.value != null)
        {
            date = this.strToDate(attribute.value);
        }

        var df = Ext.create('Ext.form.field.Date', {
            id: 'dateField-' + attribute.attributeDef.id,
            name: 'dateField-' + attribute.attributeDef.id,
            fieldLabel: attribute.attributeDef.name,//this.clipFieldName(attribute.attributeDef.name),
            myAttr: attribute,
            anchor: '100%',
            fieldStyle: "font-size: 12px; padding: 0px 2px 0px 2px; ", // The bottom padding of zero (top, left, bottom, right) is key to getting the text to not be cut-off on the bottom in these ext form field text widgets...
            labelStyle: {
                'fontSize'     : '11px'
            },
            labelAlign: 'top',
            disabled: CR.app.model.CRAppData.readOnly ? true : false,
            isDate: function(obj) {
                var isDate = false;
                var dateValue = new Date(obj);
                if(dateValue instanceof Date && !isNaN(dateValue.valueOf()))
                {
                    isDate = true;
                }
                return isDate;
            },
            validator: function(value){
                var valid = true;
                var isDateType = Number(this.myAttr.attributeDef.type) == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_DATE;
                if(isDateType)
                {
                    var annotationEditorCmp = Ext.getCmp('annotationeditor');
                    var dateValue = annotationEditorCmp.getNewDate(this.myAttr);
                    if(dateValue && dateValue < this.myAttr.attributeDef.minDate || dateValue > this.myAttr.attributeDef.maxDate)
                    {
                        valid = "Value must be between " + this.myAttr.attributeDef.minDate + " and " + this.myAttr.attributeDef.maxDate;
                    }
                }
                return valid;
            }
        });
        df.setValue(date);  // Set this BEFORE the listener gets added or we may proliferate annotations on updateAnnotation
        df.on('change', this.onDateChange, this);
//                    df.on('keypress', this.onDateKeypress(), this);
        df.on('blur', this.onDateBlur, this);
        df.enableKeyEvents = true;
        dateTimePanel.add(df);

        var tf = Ext.create('Ext.form.field.Time', {
            id: 'timeField-' + attribute.attributeDef.id,
            name: 'timeField-' + attribute.attributeDef.id,
            myAttr: attribute,
            anchor: '100%',
            fieldStyle: "font-size: 12px; padding: 0px 2px 0px 2px; ", // The bottom padding of zero (top, left, bottom, right) is key to getting the text to not be cut-off on the bottom in these ext form field text widgets...
            labelStyle: {
                'fontSize'     : '11px'
            },
            labelAlign: 'top',
            disabled: CR.app.model.CRAppData.readOnly ? true : false,
            isDate: function(obj) {
                var isDate = false;
                var annotationEditorCmp = Ext.getCmp('annotationeditor');
                var dateValue = annotationEditorCmp.getNewDate(this.myAttr);
                if(dateValue instanceof Date && !isNaN(dateValue.valueOf()))
                {
                    isDate = true;
                }
                return isDate;
            },
            validator: function(value){
                var valid = true;
                var isDateType = Number(this.myAttr.attributeDef.type) == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_DATE;
                if(isDateType)
                {
                    var annotationEditorCmp = Ext.getCmp('annotationeditor');
                    var dateValue = annotationEditorCmp.getNewDate(this.myAttr);
                    if(dateValue && dateValue < this.myAttr.attributeDef.minDate || dateValue > this.myAttr.attributeDef.maxDate)
                    {
                        valid = "Value must be between " + this.myAttr.attributeDef.minDate + " and " + this.myAttr.attributeDef.maxDate;
                    }
                }
                return valid;
            }
        });
        tf.setValue(date);  // Set this BEFORE the listener gets added or we may proliferate annotations on updateAnnotation
        tf.on('change', this.onTimeChange, this);
//        tf.on('keypress', this.onTimeKeypress(), this);
        tf.on('blur', this.onTimeBlur, this);
        tf.enableKeyEvents = true;
        dateTimePanel.add(tf);
        return dateTimePanel;
    },
    // Creates a text are field
    createTextAreaField: function(attribute)
    {
        var tf = Ext.create('Ext.form.field.TextArea', {
            id: 'textAreaField-' + attribute.attributeDef.id,
            name: 'textAreaField-' + attribute.attributeDef.id,
            fieldLabel: attribute.attributeDef.name,//this.clipFieldName(attribute.attributeDef.name),
            myAttr: attribute,
            fieldStyle: "font-size: 12px;", // The bottom padding of zero (top, left, bottom, right) is key to getting the text to not be cut-off on the bottom in these ext form field text widgets...
//            labelStyle: {
//                'fontSize'     : '11px'
//            },
            labelAlign: 'top',
            disabled: CR.app.model.CRAppData.readOnly ? true : false
        });
        tf.setValue(attribute.value);  // Set this BEFORE the listener gets added or we may proliferate annotations on updateAnnotation
        tf.on('change', this.onTextChange, this);
        tf.on('keypress', this.onTextKeypress, this);
        tf.on('blur', this.onTextBlur, this);
        tf.enableKeyEvents = true;
        return tf;
    },
    // Creates a text field
    createTextField: function(attribute)
    {
        var tf = Ext.create('Ext.form.field.Text', {
            id: 'textField-' + attribute.attributeDef.id,
            name: 'textField-' + attribute.attributeDef.id,
            fieldLabel: attribute.attributeDef.name,//this.clipFieldName(attribute.attributeDef.name),
            myAttr: attribute,
            fieldStyle: "font-size: 12px;", // The bottom padding of zero (top, left, bottom, right) is key to getting the text to not be cut-off on the bottom in these ext form field text widgets...
//            labelStyle: {
//                'fontSize'     : '11px'
//            },
            labelAlign: 'top',
            disabled: CR.app.model.CRAppData.readOnly ? true : false,
            isNumber: function(obj) {
                var isNumber = false;
                var numValue = new Number(obj);
                if(!isNaN(numValue) && isFinite(numValue))
                {
                    isNumber = true;
                }
                return isNumber;
            },
            validator: function(value){
                var valid = true;
                var isNumberType = Number(this.myAttr.attributeDef.type) == CR.app.controller.AnnotationNatureController.ATTRIBUTE_DEF_TYPE_NUMERIC;
                if(isNumberType)
                {
                    var valueIsNumeric = this.isNumber(value);
                    var numValue = Number(value);
                    if(!valueIsNumeric || numValue < this.myAttr.attributeDef.numericLow || numValue > this.myAttr.attributeDef.numericHigh)
                    {
                        valid = "Value must be between " + this.myAttr.attributeDef.numericLow + " and " + this.myAttr.attributeDef.numericHigh;
                    }
                }
                return valid;
            }
        });
        tf.setValue(attribute.value);  // Set this BEFORE the listener gets added or we may proliferate annotations on updateAnnotation
        tf.on('change', this.onTextChange, this);
        tf.on('keypress', this.onTextKeypress, this);
        tf.on('blur', this.onTextBlur, this);
        tf.enableKeyEvents = true;
        return tf;
    },
    onComboBoxSelect: function(cmp, record, index){
    	CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, record.data.field1);
    },
    onTextChange: function(cmp, newValue, oldValue){
        CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newValue);
    },
    onTextKeypress: function(cmp, e, eOpts){
        if (Ext.EventObject.ENTER == e.getKey())
        {
            CR.app.controller.AnnotationNatureControllerAnnotations.updateFeatureAttributes(cmp.myAttr, cmp.lastValue);
        }
    },
    onTextBlur: function(cmp, e, eOpts){
        CR.app.controller.AnnotationNatureControllerAnnotations.updateFeatureAttributes(cmp.myAttr, cmp.lastValue);
    },
    onDateChange: function(cmp, newValue, oldValue){
        var newDate = this.getNewDate(cmp.myAttr);
        var newDateStr = this.dateToStr(newDate);
        var timeCmp = Ext.getCmp('timeField-' + cmp.myAttr.attributeDef.id);
        if(timeCmp)
        {
            timeCmp.setValue(newDate);
        }
        CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newDateStr);
    },
    onDateKeypress: function(cmp, e, eOpts){
        if (Ext.EventObject.ENTER == e.getKey())
        {
            var newDate = this.getNewDate(cmp.myAttr);
            var newDateStr = this.dateToStr(newDate);
            CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newDateStr);
        }
    },
    onDateBlur: function(cmp, e, eOpts){
        var newDate = this.getNewDate(cmp.myAttr);
        var newDateStr = this.dateToStr(newDate);
        var timeCmp = Ext.getCmp('timeField-' + cmp.myAttr.attributeDef.id);
        if(timeCmp)
        {
            timeCmp.setValue(newDate);
        }
        CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newDateStr);
    },
    onTimeChange: function(cmp, newValue, oldValue){
        var newDate = this.getNewDate(cmp.myAttr);
        var newDateStr = this.dateToStr(newDate);
        CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newDateStr);
    },
    onTimeKeypress: function(cmp, e, eOpts){
        if (Ext.EventObject.ENTER == e.getKey())
        {
            var newDate = this.getNewDate(cmp.myAttr);
            var newDateStr = this.dateToStr(newDate);
            CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newDateStr);
        }
    },
    onTimeBlur: function(cmp, e, eOpts){
        var newDate = this.getNewDate(cmp.myAttr);
        var newDateStr = this.dateToStr(newDate);
        var dateCmp = Ext.getCmp('dateField-' + cmp.myAttr.attributeDef.id);
        if(dateCmp)
        {
            dateCmp.setValue(newDate);
        }
        CR.app.controller.AnnotationNatureControllerAnnotations.updateAttributeFeatureForSelectedAnnotation(cmp.myAttr, newDateStr);
    },
    listeners: {
    	render: function() {
    	},
        beforeSync: function()
        {
            this.addEditorWidgets(false);
        },
        principalClinicalElementLoaded: function()
        {
            this.addEditorWidgets(false);
        },
        annotationSelectedByUserInList: function(drawEyeToSelectedAnnotationResult)
    	{
    		this.addEditorWidgets(drawEyeToSelectedAnnotationResult);
    	}
    },
    getNewDate: function(attribute){
        var curDate = null;
        var dateCmp = Ext.getCmp('dateField-' + attribute.attributeDef.id);
        var timeCmp = Ext.getCmp('timeField-' + attribute.attributeDef.id);
        if(dateCmp && timeCmp)
        {
            curDate = new Date();
            var dateDateStr = dateCmp.getValue();
            var dateDate = new Date(dateDateStr ? dateDateStr : 0);
            var timeDateStr = timeCmp.getValue();
            var timeDate = new Date(timeDateStr ? timeDateStr : 0);
            var newYear = dateDate.getFullYear();
            var newMonth = dateDate.getMonth();
            var newDate = dateDate.getDate();
            var newHours = timeDate.getHours();
            var newMin = timeDate.getMinutes();
            var newSec = timeDate.getSeconds();
            curDate.setFullYear(newYear ? newYear : 0);
            curDate.setMonth(newMonth ? newMonth : 0);
            curDate.setDate(newDate ? newDate : 0);
            curDate.setHours(newHours ? newHours : 0);
            curDate.setMinutes(newMin ? newMin : 0);
            curDate.setSeconds(newSec ? newSec : 0);
        }
        return curDate;
    },
    dateToStr: function(date){
        var str = date.format('Y-m-d h:i:s');
        return str;
    },
    strToDate: function(str){
        var date = null;
        try
        {
            if(str != null)
            {
                var curDate = new Date();
                var dateTimeParts = str.split(' ');
                if(dateTimeParts.length == 2)
                {
                    var dateParts = dateTimeParts[0].split('-');
                    if(dateParts.length == 3)
                    {
                        var newYear = dateParts[0];
                        var newMonth = dateParts[1];
                        var newDate = dateParts[2];
                        curDate.setFullYear(newYear ? newYear : 0);
                        curDate.setMonth(newMonth ? newMonth : 0);
                        curDate.setDate(newDate ? newDate : 0);
                    }
                    date = curDate;
                    var timeParts = dateTimeParts[1].split(':');
                    if(timeParts.length == 3)
                    {
                        var newHours = timeParts[0];
                        var newMin = timeParts[1];
                        var newSec = timeParts[2];
                        curDate.setHours(newHours ? newHours : 0);
                        curDate.setMinutes(newMin ? newMin : 0);
                        curDate.setSeconds(newSec ? newSec : 0);
                    }
                }
            }
        }
        catch(err)
        {
            date = null; // We need to set this back to null in case there was a badly constructed date given.
            console.log("Date Error:" + err.msg);
        }
        return date;
    },
    constructor: function(config) {
        this.callParent(config);
        this.mixins.annotationaware.constructor.call(this);
    }
});

// Simulates PHP's date function
Date.prototype.format = function(format) {
    var returnStr = '';
    var replace = Date.replaceChars;
    for (var i = 0; i < format.length; i++) {       var curChar = format.charAt(i);         if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
        returnStr += curChar;
    }
    else if (replace[curChar]) {
        returnStr += replace[curChar].call(this);
    } else if (curChar != "\\"){
        returnStr += curChar;
    }
    }
    return returnStr;
};

Date.replaceChars = {
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    // Day
    d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
    D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
    j: function() { return this.getDate(); },
    l: function() { return Date.replaceChars.longDays[this.getDay()]; },
    N: function() { return this.getDay() + 1; },
    S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
    w: function() { return this.getDay(); },
    z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
    // Week
    W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
    // Month
    F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
    m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
    M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
    n: function() { return this.getMonth() + 1; },
    t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
    // Year
    L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
    o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
    Y: function() { return this.getFullYear(); },
    y: function() { return ('' + this.getFullYear()).substr(2); },
    // Time
    a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
    g: function() { return this.getHours() % 12 || 12; },
    G: function() { return this.getHours(); },
    h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
    H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
    i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
    s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
    u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
        '0' : '')) + m; },
    // Timezone
    e: function() { return "Not Yet Supported"; },
    I: function() {
        var DST = null;
        for (var i = 0; i < 12; ++i) {
            var d = new Date(this.getFullYear(), i, 1);
            var offset = d.getTimezoneOffset();

            if (DST === null) DST = offset;
            else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
        }
        return (this.getTimezoneOffset() == DST) | 0;
    },
    O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
    P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
    T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
    Z: function() { return -this.getTimezoneOffset() * 60; },
    // Full Date/Time
    c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
    r: function() { return this.toString(); },
    U: function() { return this.getTime() / 1000; }
};