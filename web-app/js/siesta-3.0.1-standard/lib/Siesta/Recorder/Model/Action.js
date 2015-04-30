/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Recorder.Model.Action', {
    extend      : 'Ext.data.Model',
    
    fields      : [
    ],
    
    
    $action     : null,
    
    
    constructor : function (data) {
        if (!(data instanceof Siesta.Recorder.Action)) {
            data        = new Siesta.Recorder.Action(data)
        }

        // surprisingly the change in "data" variable will be reflected in "arguments"
        this.callParent(arguments)

        this.$action = this.data = data; //TODO = this.raw
    }
//    ,
    
    
//    setTargetByType : function (targetType, target) {
//        return this.$action.setTargetByType()
//    },


//    resetValues : function () {
//        this.$action.resetValues()
//        
//        this.afterEdit([ 'targets', 'value', '__offset__' ])
//    },
//
//    
//    clearTargetOffset : function () {
//        this.$action.clearTargetOffset()
//        
//        this.afterEdit([ 'targets' ])
//    },
//    
//    
//    setTargetOffset : function (value) {
//        this.$action.setTargetOffset(value)
//        
//        this.afterEdit([ '__offset__' ])
//    }
    
    
}, function () {
    var prototype   = this.prototype

    var attributeNames  = [];
    Siesta.Recorder.Action.meta.getAttributes().each(function(attr){ attributeNames.push(attr.name)});

    if (this.addFields) {
        this.addFields(attributeNames);
    } else {
        var fields      = prototype.fields
        fields.addAll(attributeNames);
    }

    Joose.A.each([ 
        'getTargetOffset', 'isMouseAction', 'parseOffset', 'getTarget', 'getTargets', 'hasTarget', 'asStep', 'asCode'
    ], function (methodName) {
        prototype[ methodName ] = function () {
            return this.$action[ methodName ].apply(this.$action, arguments)
        }
    })
    
    Joose.O.each({
        clearTargetOffset       : [ 'target' ],
        setTargetOffset         : [ 'target' ],
        resetValues             : [ 'target', 'value' ],
        setAction               : [ 'action', 'target' ]
    }, function (fields, methodName) {
        prototype[ methodName ] = function () {
            var res     = this.$action[ methodName ].apply(this.$action, arguments)

            // TODO not needed since we do refreshNode
            //this.afterEdit(fields)

            return res
        }
    })
    
});
