/*

Siesta 2.0.10
Copyright(c) 2009-2014 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Singleton('Siesta.Test.ActionRegistry', {
    
    has : {
        actionClasses       : Joose.I.Object,
        
        actions     : function () {
            var actions     = {}
            
            Joose.A.each([ 
                'waitFor', 
                'click', 
                'rightClick', 
                'doubleClick', 
                'dblClick',
                'doubleTap', 
                'drag', 
                'longpress', 
                'mouseDown', 
                'mouseUp', 
                'moveCursorTo', 
                'swipe', 
                'tap', 
                'type' 
            ], function (value) {
                actions[ value.toLowerCase() ] = value
            })
            
            return actions
        }
    },

    
    methods : {
        
        registerAction : function (name, constructor) {
            this.actionClasses[ name.toLowerCase() ] = constructor
        },

        
        getActionClass : function (name) {
            return this.actionClasses[ name.toLowerCase() ]
        },
        
        
        create : function (obj, test) {
            if (obj !== Object(obj)) throw "Action configuration should be an Object instance"
            
            if (!obj.action) {
                var actions             = this.actions
                var methods             = {}
                
                if (test) {
                    methods             = test.getActionableMethods()    
                }
                
                Joose.O.eachOwn(obj, function (value, key) {
                    var shortcut        = key.toLowerCase()
                    
                    if (actions[ shortcut ]) {
                        obj.action      = shortcut
                        
                        switch (shortcut) {
                            case 'waitfor'  : 
                            // do nothing 
                            break
                            
                            case 'type'     :
                                obj.text        = value
                            break
                                
                            default         : 
                                obj.target      = value
                        }
                        
                        return false
                    } else if (methods[ shortcut ]) {
                        if (shortcut.match(/^waitFor/i)) {
                            obj.action      = 'wait'
                            obj.waitFor     = methods[ shortcut ]
                            obj.args        = value
                        } else {
                            obj.action      = 'methodCall'
                            obj.methodName  = methods[ shortcut ]
                            obj.args        = value
                        }
                        
                        return false
                    }
                })
            }
            
            if (!obj.action) throw "Need to include `action` property or shortcut property in the step config"
            
            var actionClass = this.getActionClass(obj.action)

            return new actionClass(obj)
        }
    }
});
