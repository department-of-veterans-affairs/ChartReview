/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
!function () {
    
var ID      = 1

Class('Siesta.Recorder.Action', {
    
    has : {
        id                  : function () { return ID++ },
        action              : null,
        
        value               : null,
        
        /*
            Possible type of targets:
            - 'xy'      XY coordinates
            - 'css'     css selector
            - 'cq'      component query
            - 'csq'     composite query
            - 'user'    user-provided text
        */
        target              : null,
        
        toTarget            : null,
        by                  : null,
        waitForPageLoad     : false,
        options             : null,
        
        sourceEvent         : null
    },
    
    
    methods : {
        
        initialize : function () {
            var target      = this.target

            if (target && !(target instanceof Siesta.Recorder.Target)) {
                this.target = new Siesta.Recorder.Target({ targets : target })
            }
            
            var toTarget    = this.toTarget
            
            if (toTarget && !(toTarget instanceof Siesta.Recorder.Target)) 
                this.toTarget = new Siesta.Recorder.Target({ targets : toTarget })
        },
        
        
        setAction : function (newAction) {
            this.action     = newAction

            if (!this.hasTarget()) {
                this.target && this.target.clear()
                this.toTarget && this.toTarget.clear()
            }
        },
        
        
        hasTarget : function () {
            return this.isMouseAction()
        },
        
        
        getTarget : function (asInstance) {
            var target      = this.target
            
            return asInstance ? target : target && this.target.getTarget()
        },
        
        
        isMouseAction : function () {
            return (this.action || '').toLowerCase() in {
                click           : 1,
                contextmenu     : 1,
                dblclick        : 1,
                drag            : 1,
                mousedown       : 1,
                mouseup         : 1,
                movecursorby    : 1,
                movecursorto    : 1
            }
        },
        
        
        resetValues : function () {
            this.target         = null
            this.value          = null
            this.toTarget       = null
            this.by             = null
            this.options        = null
            this.sourceEvent    = null
        },
        
        
        parseOffset : function (offsetString) {
            var values  = offsetString.split(',');
    
            if (values.length < 2) return;
    
            if (!values[ 0 ].match('%')) {
                values[ 0 ] = parseInt(values[ 0 ], 10);
    
                if (isNaN(values[ 0 ])) return;
            }
    
            if (!values[ 1 ].match('%')) {
                values[ 1 ] = parseInt(values[ 1 ], 10);
    
                if (isNaN(values[ 1 ])) return;
            }
    
            return values;
        },
        
        
        clearTargetOffset : function () {
            this.setTargetOffset(null)
        },
    
    
        setTargetOffset : function (value) {
            var target  = this.target
            
            if (target) target.setOffset(value)
        },
    
    
        getTargetOffset : function () {
            var target  = this.target
            
            if (target) return target.getOffset()
        },
        
        
        objectToSource : function (obj) {
            var me = this;
            var result = '';
            var prependComma;
            var convertFn = function (key, value) {
                value = value || obj[key];

                if (value instanceof Array) {
                    return key + ' : [' + value.join(', ') + ']';
                } else if (typeof value === 'object') {
                    return key + ' : ' + me.objectToSource(value);
                } else {
                    return key + ' : ' + (typeof (value) === 'string' ? '"' + value + '"' : value);
                }
            };

            // Use brief action description, do this manually to make sure action + target is
            // the first item in the object descriptor
            if (obj.target) {
                result = convertFn(obj.action, obj.target);
                prependComma = true;

                delete obj.target;
                delete obj.action;
            }

            var keys = Object.keys(obj);

            if (keys.length > 0) {
                result = result + (prependComma ? ', ' : '') + keys.map(function(key) { return convertFn(key); }).join(', ');
            }

            return '{ ' + result + ' }';
        },


        asCode : function () {
            var step        = this.asStep()
            
            if (!step) return null
            
            return typeof step == 'function' ? step : this.objectToSource(step)
        },
        
        
        asStep : function (test) {
            var actionName      = this.action

            if (!actionName) return null
            
            var step            = { action : this.action };
            
            var target          = this.getTarget()
            var value           = this.value
            
            var hasTarget       = this.hasTarget()

            if (hasTarget) {
                if (!target) {
                    // If target is required but not filled in, just leave it blank
                    step.target = '';
                } else if (target.type == 'cq') {
                    var splitPos = target.target.indexOf('->');
                    step.target     = splitPos > 0 ? target.target.split('->').splice(1, 0, '>>').join() : '>>' + target.target
                } else {
                    step.target     = target.target
                }

                if (target && target.offset)
                    step.offset = target.offset.slice()
            }
    
    //        if (!actionName.match('waitFor') && target && typeof target !== "string" && !target.length) {
    //            throw 'Invalid target for ' + actionName + ' actionRecord: ' + target;
    //        }
    //
            if (this.options && !Joose.O.isEmpty(this.options)) {
                step.options    = this.options;
            }
    
            if (actionName.match(/^waitFor/)) {
                switch (actionName) {
                    case 'waitForFn':
                        // After this statement, t will be available in the evaled function below just as a regular local variable
                        if (test) var t   = test;
                        return { waitFor : eval("(function() {\n        " + value.replace(/\n/g, "\n        ") + "\n    })") };
    
                    case 'waitForMs':
                        var val = parseInt(value, 10);
    
                        return { waitFor : 'Ms', args : val };
    
                    default:
                        var obj = { waitFor : actionName.split('waitFor')[ 1 ], args : [] };
    
                        if (value) obj.args = value;
    
                        return obj;
                }
            } else {
                switch (actionName) {
                    case 'click':
                    case 'dblclick':
                    case 'contextmenu':
                    case 'mousedown':
                    case 'mouseup':
                    case 'moveCursorTo':
                        break
    
                    case 'moveCursor':
                        if (this.by) step.by     = this.by;
                        break;
    
                    case 'type':
                        step.text   = value;
                        delete step.target;
    
                        break;
    
                    case 'drag':
                        var toTarget    = this.toTarget
                        
                        if (toTarget && !toTarget.isTooGeneric()) {
                            step.to                             = toTarget.target;
                            if (toTarget.offset) step.toOffset  = toTarget.offset;
                            
                            break;
                        }
                        
                        step.by = this.by;
    
                        break;
    
                    case 'fn':
                        // After this statement, t will be available in the evaled function below just as a regular local variable
                        if (test) var t   = test;
    
                        return eval("(function(next) {\n        " + value.replace(/\n/g, "\n        ") + "\n        next();\n    })");
    
                    default:
                        return null;
                }
            }
    
            return this.waitForPageLoad ? { waitFor : 'PageLoad', args : [], trigger : step } : step;
        }
        
    }
});

}();