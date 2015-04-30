/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Singleton('Siesta.Test.ActionRegistry', {
    
    has : {
        actionClasses       : Joose.I.Object
    },

    
    methods : {
        
        registerAction : function (name, constructor) {
            this.actionClasses[ name.toLowerCase() ] = constructor
        },

        
        getActionClass : function (name) {
            return this.actionClasses[ name.toLowerCase() ]
        },
        
        
        create : function (obj, test, defaultArgs) {
            if (obj !== Object(obj)) throw "Action configuration should be an Object instance"
            
            if (!obj.action) {
                var actionClasses       = this.actionClasses
                var methods             = {}
                
                if (test) {
                    methods             = test.getActionableMethods()    
                }
                
                Joose.O.eachOwn(obj, function (value, key) {
                    var shortcut        = key.toLowerCase()
                    
                    if (actionClasses[ shortcut ]) {
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
                            obj.args        = value || []
                        } else {
                            obj.action      = 'methodCall'
                            obj.methodName  = methods[ shortcut ]
                            obj.args        = value || []
                        }
                        
                        return false
                    }
                })
            }
            
            if (!obj.action) throw "Need to include `action` property or shortcut property in the step config"
            
            // Don't get the arguments from the previous step if it is a waitFor action, 
            // it does not make sense and messes up the arguments
            if (obj.action != 'wait' && obj.action != 'waitfor' && obj.action != 'delay' && obj.action != 'methodCall') {
                if (!obj.args && defaultArgs) obj.args = defaultArgs
            }
            
            var actionClass = this.getActionClass(obj.action)

            return new actionClass(obj)
        }
    }
});
