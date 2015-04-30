;!function () {;
var Joose = {}

// configuration hash

Joose.C             = typeof JOOSE_CFG != 'undefined' ? JOOSE_CFG : {}

Joose.is_IE         = '\v' == 'v'
Joose.is_NodeJS     = Boolean(typeof process != 'undefined' && process.pid)


Joose.top           = Joose.is_NodeJS && global || this

Joose.stub          = function () {
    return function () { throw new Error("Modules can not be instantiated") }
}


Joose.VERSION       = ({ /*PKGVERSION*/VERSION : '3.50.1' }).VERSION


if (typeof module != 'undefined') module.exports = Joose
/*if (!Joose.is_NodeJS) */
this.Joose = Joose


// Static helpers for Arrays
Joose.A = {

    each : function (array, func, scope) {
        scope = scope || this
        
        for (var i = 0, len = array.length; i < len; i++) 
            if (func.call(scope, array[i], i) === false) return false
    },
    
    
    eachR : function (array, func, scope) {
        scope = scope || this

        for (var i = array.length - 1; i >= 0; i--) 
            if (func.call(scope, array[i], i) === false) return false
    },
    
    
    exists : function (array, value) {
        for (var i = 0, len = array.length; i < len; i++) if (array[i] == value) return true
            
        return false
    },
    
    
    map : function (array, func, scope) {
        scope = scope || this
        
        var res = []
        
        for (var i = 0, len = array.length; i < len; i++) 
            res.push( func.call(scope, array[i], i) )
            
        return res
    },
    

    grep : function (array, func) {
        var a = []
        
        Joose.A.each(array, function (t) {
            if (func(t)) a.push(t)
        })
        
        return a
    },
    
    
    remove : function (array, removeEle) {
        var a = []
        
        Joose.A.each(array, function (t) {
            if (t !== removeEle) a.push(t)
        })
        
        return a
    }
    
}

// Static helpers for Strings
Joose.S = {
    
    saneSplit : function (str, delimeter) {
        var res = (str || '').split(delimeter)
        
        if (res.length == 1 && !res[0]) res.shift()
        
        return res
    },
    

    uppercaseFirst : function (string) { 
        return string.substr(0, 1).toUpperCase() + string.substr(1, string.length - 1)
    },
    
    
    strToClass : function (name, top) {
        var current = top || Joose.top
        
        Joose.A.each(name.split('.'), function (segment) {
            if (current) 
                current = current[ segment ]
            else
                return false
        })
        
        return current
    }
}

var baseFunc    = function () {}

var enumProps   = [ 'hasOwnProperty', 'valueOf', 'toString', 'constructor' ]

var manualEnum  = true

for (var i in { toString : 1 }) manualEnum = false


// Static helpers for objects
Joose.O = {

    each : function (object, func, scope) {
        scope = scope || this
        
        for (var i in object) 
            if (func.call(scope, object[i], i) === false) return false
        
        if (manualEnum) 
            return Joose.A.each(enumProps, function (el) {
                
                if (object.hasOwnProperty(el)) return func.call(scope, object[el], el)
            })
    },
    
    
    eachOwn : function (object, func, scope) {
        scope = scope || this
        
        return Joose.O.each(object, function (value, name) {
            if (object.hasOwnProperty(name)) return func.call(scope, value, name)
        }, scope)
    },
    
    
    copy : function (source, target) {
        target = target || {}
        
        Joose.O.each(source, function (value, name) { target[name] = value })
        
        return target
    },
    
    
    copyOwn : function (source, target) {
        target = target || {}
        
        Joose.O.eachOwn(source, function (value, name) { target[name] = value })
        
        return target
    },
    
    
    getMutableCopy : function (object) {
        baseFunc.prototype = object
        
        return new baseFunc()
    },
    
    
    extend : function (target, source) {
        return Joose.O.copy(source, target)
    },
    
    
    isEmpty : function (object) {
        for (var i in object) if (object.hasOwnProperty(i)) return false
        
        return true
    },
    
    
    isInstance: function (obj) {
        return obj && obj.meta && obj.constructor == obj.meta.c
    },
    
    
    isClass : function (obj) {
        return obj && obj.meta && obj.meta.c == obj
    },
    
    
    wantArray : function (obj) {
        if (obj instanceof Array) return obj
        
        return [ obj ]
    },
    
    
    // this was a bug in WebKit, which gives typeof / / == 'function'
    // should be monitored and removed at some point in the future
    isFunction : function (obj) {
        return typeof obj == 'function' && obj.constructor != / /.constructor
    }
}


//initializers

Joose.I = {
    Array       : function () { return [] },
    Object      : function () { return {} },
    Function    : function () { return arguments.callee },
    Now         : function () { return new Date() }
};
Joose.Proto = Joose.stub()

Joose.Proto.Empty = Joose.stub()
    
Joose.Proto.Empty.meta = {};
;(function () {

    Joose.Proto.Object = Joose.stub()
    
    
    var SUPER = function () {
        var self = SUPER.caller
        
        if (self == SUPERARG) self = self.caller
        
        if (!self.SUPER) throw "Invalid call to SUPER"
        
        return self.SUPER[self.methodName].apply(this, arguments)
    }
    
    
    var SUPERARG = function () {
        return this.SUPER.apply(this, arguments[0])
    }
    
    
    
    Joose.Proto.Object.prototype = {
        
        SUPERARG : SUPERARG,
        SUPER : SUPER,
        
        INNER : function () {
            throw "Invalid call to INNER"
        },                
        
        
        BUILD : function (config) {
            return arguments.length == 1 && typeof config == 'object' && config || {}
        },
        
        
        initialize: function () {
        },
        
        
        toString: function () {
            return "a " + this.meta.name
        }
        
    }
        
    Joose.Proto.Object.meta = {
        constructor     : Joose.Proto.Object,
        
        methods         : Joose.O.copy(Joose.Proto.Object.prototype),
        attributes      : {}
    }
    
    Joose.Proto.Object.prototype.meta = Joose.Proto.Object.meta

})();
;(function () {

    Joose.Proto.Class = function () {
        return this.initialize(this.BUILD.apply(this, arguments)) || this
    }
    
    var bootstrap = {
        
        VERSION             : null,
        AUTHORITY           : null,
        
        constructor         : Joose.Proto.Class,
        superClass          : null,
        
        name                : null,
        
        attributes          : null,
        methods             : null,
        
        meta                : null,
        c                   : null,
        
        defaultSuperClass   : Joose.Proto.Object,
        
        
        BUILD : function (name, extend) {
            this.name = name
            
            return { __extend__ : extend || {} }
        },
        
        
        initialize: function (props) {
            var extend      = props.__extend__
            
            this.VERSION    = extend.VERSION
            this.AUTHORITY  = extend.AUTHORITY
            
            delete extend.VERSION
            delete extend.AUTHORITY
            
            this.c = this.extractConstructor(extend)
            
            this.adaptConstructor(this.c)
            
            if (extend.constructorOnly) {
                delete extend.constructorOnly
                return
            }
            
            this.construct(extend)
        },
        
        
        construct : function (extend) {
            if (!this.prepareProps(extend)) return
            
            var superClass = this.superClass = this.extractSuperClass(extend)
            
            this.processSuperClass(superClass)
            
            this.adaptPrototype(this.c.prototype)
            
            this.finalize(extend)
        },
        
        
        finalize : function (extend) {
            this.processStem(extend)
            
            this.extend(extend)
        },
        
        
        //if the extension returns false from this method it should re-enter 'construct'
        prepareProps : function (extend) {
            return true
        },
        
        
        extractConstructor : function (extend) {
            var res = extend.hasOwnProperty('constructor') ? extend.constructor : this.defaultConstructor()
            
            delete extend.constructor
            
            return res
        },
        
        
        extractSuperClass : function (extend) {
            if (extend.hasOwnProperty('isa') && !extend.isa) throw new Error("Attempt to inherit from undefined superclass [" + this.name + "]")
            
            var res = extend.isa || this.defaultSuperClass
            
            delete extend.isa
            
            return res
        },
        
        
        processStem : function () {
            var superMeta       = this.superClass.meta
            
            this.methods        = Joose.O.getMutableCopy(superMeta.methods || {})
            this.attributes     = Joose.O.getMutableCopy(superMeta.attributes || {})
        },
        
        
        initInstance : function (instance, props) {
            Joose.O.copyOwn(props, instance)
        },
        
        
        defaultConstructor: function () {
            return function (arg) {
                var BUILD = this.BUILD
                
                var args = BUILD && BUILD.apply(this, arguments) || arg || {}
                
                var thisMeta    = this.meta
                
                thisMeta.initInstance(this, args)
                
                return thisMeta.hasMethod('initialize') && this.initialize(args) || this
            }
        },
        
        
        processSuperClass: function (superClass) {
            var superProto      = superClass.prototype
            
            //non-Joose superclasses
            if (!superClass.meta) {
                
                var extend = Joose.O.copy(superProto)
                
                extend.isa = Joose.Proto.Empty
                // clear potential value in the `extend.constructor` to prevent it from being modified
                delete extend.constructor
                
                var meta = new this.defaultSuperClass.meta.constructor(null, extend)
                
                superClass.meta = superProto.meta = meta
                
                meta.c = superClass
            }
            
            this.c.prototype    = Joose.O.getMutableCopy(superProto)
            this.c.superClass   = superProto
        },
        
        
        adaptConstructor: function (c) {
            c.meta = this
            
            if (!c.hasOwnProperty('toString')) c.toString = function () { return this.meta.name }
        },
    
        
        adaptPrototype: function (proto) {
            //this will fix weird semantic of native "constructor" property to more intuitive (idea borrowed from Ext)
            proto.constructor   = this.c
            proto.meta          = this
        },
        
        
        addMethod: function (name, func) {
            func.SUPER = this.superClass.prototype
            
            //chrome don't allow to redefine the "name" property
            func.methodName = name
            
            this.methods[name] = func
            this.c.prototype[name] = func
        },
        
        
        addAttribute: function (name, init) {
            this.attributes[name] = init
            this.c.prototype[name] = init
        },
        
        
        removeMethod : function (name) {
            delete this.methods[name]
            delete this.c.prototype[name]
        },
    
        
        removeAttribute: function (name) {
            delete this.attributes[name]
            delete this.c.prototype[name]
        },
        
        
        hasMethod: function (name) { 
            return Boolean(this.methods[name])
        },
        
        
        hasAttribute: function (name) { 
            return this.attributes[name] !== undefined
        },
        
    
        hasOwnMethod: function (name) { 
            return this.hasMethod(name) && this.methods.hasOwnProperty(name)
        },
        
        
        hasOwnAttribute: function (name) { 
            return this.hasAttribute(name) && this.attributes.hasOwnProperty(name)
        },
        
        
        extend : function (props) {
            Joose.O.eachOwn(props, function (value, name) {
                if (name != 'meta' && name != 'constructor') 
                    if (Joose.O.isFunction(value) && !value.meta) 
                        this.addMethod(name, value) 
                    else 
                        this.addAttribute(name, value)
            }, this)
        },
        
        
        subClassOf : function (classObject, extend) {
            return this.subClass(extend, null, classObject)
        },
    
    
        subClass : function (extend, name, classObject) {
            extend      = extend        || {}
            extend.isa  = classObject   || this.c
            
            return new this.constructor(name, extend).c
        },
        
        
        instantiate : function () {
            var f = function () {}
            
            f.prototype = this.c.prototype
            
            var obj = new f()
            
            return this.c.apply(obj, arguments) || obj
        }
    }
    
    //micro bootstraping
    
    Joose.Proto.Class.prototype = Joose.O.getMutableCopy(Joose.Proto.Object.prototype)
    
    Joose.O.extend(Joose.Proto.Class.prototype, bootstrap)
    
    Joose.Proto.Class.prototype.meta = new Joose.Proto.Class('Joose.Proto.Class', bootstrap)
    
    
    
    Joose.Proto.Class.meta.addMethod('isa', function (someClass) {
        var f = function () {}
        
        f.prototype = this.c.prototype
        
        return new f() instanceof someClass
    })
})();
Joose.Managed = Joose.stub()

Joose.Managed.Property = new Joose.Proto.Class('Joose.Managed.Property', {
    
    name            : null,
    
    init            : null,
    value           : null,
    
    definedIn       : null,
    
    
    initialize : function (props) {
        Joose.Managed.Property.superClass.initialize.call(this, props)
        
        this.computeValue()
    },
    
    
    computeValue : function () {
        this.value = this.init
    },    
    
    
    //targetClass is still open at this stage
    preApply : function (targetClass) {
    },
    

    //targetClass is already open at this stage
    postUnApply : function (targetClass) {
    },
    
    
    apply : function (target) {
        target[this.name] = this.value
    },
    
    
    isAppliedTo : function (target) {
        return target[this.name] == this.value
    },
    
    
    unapply : function (from) {
        if (!this.isAppliedTo(from)) throw "Unapply of property [" + this.name + "] from [" + from + "] failed"
        
        delete from[this.name]
    },
    
    
    cloneProps : function () {
        return {
            name        : this.name, 
            init        : this.init,
            definedIn   : this.definedIn
        }
    },

    
    clone : function (name) {
        var props = this.cloneProps()
        
        props.name = name || props.name
        
        return new this.constructor(props)
    }
    
    
}).c;
Joose.Managed.Property.ConflictMarker = new Joose.Proto.Class('Joose.Managed.Property.ConflictMarker', {
    
    isa : Joose.Managed.Property,

    apply : function (target) {
        throw new Error("Attempt to apply ConflictMarker [" + this.name + "] to [" + target + "]")
    }
    
}).c;
Joose.Managed.Property.Requirement = new Joose.Proto.Class('Joose.Managed.Property.Requirement', {
    
    isa : Joose.Managed.Property,

    
    apply : function (target) {
        if (!target.meta.hasMethod(this.name)) 
            throw new Error("Requirement [" + this.name + "], defined in [" + this.definedIn.definedIn.name + "] is not satisfied for class [" + target + "]")
    },
    
    
    unapply : function (from) {
    }
    
}).c;
Joose.Managed.Property.Attribute = new Joose.Proto.Class('Joose.Managed.Property.Attribute', {
    
    isa : Joose.Managed.Property,
    
    slot                : null,
    
    
    initialize : function () {
        Joose.Managed.Property.Attribute.superClass.initialize.apply(this, arguments)
        
        this.slot = this.name
    },
    
    
    apply : function (target) {
        target.prototype[ this.slot ] = this.value
    },
    
    
    isAppliedTo : function (target) {
        return target.prototype[ this.slot ] == this.value
    },
    
    
    unapply : function (from) {
        if (!this.isAppliedTo(from)) throw "Unapply of property [" + this.name + "] from [" + from + "] failed"
        
        delete from.prototype[this.slot]
    },
    
    
    clearValue : function (instance) {
        delete instance[ this.slot ]
    },
    
    
    hasValue : function (instance) {
        return instance.hasOwnProperty(this.slot)
    },
        
        
    getRawValueFrom : function (instance) {
        return instance[ this.slot ]
    },
    
    
    setRawValueTo : function (instance, value) {
        instance[ this.slot ] = value
        
        return this
    }
    
}).c;
Joose.Managed.Property.MethodModifier = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier', {
    
    isa : Joose.Managed.Property,

    
    prepareWrapper : function () {
        throw "Abstract method [prepareWrapper] of " + this + " was called"
    },
    
    
    apply : function (target) {
        var name            = this.name
        var targetProto     = target.prototype
        var isOwn           = targetProto.hasOwnProperty(name)
        var original        = targetProto[name]
        var superProto      = target.meta.superClass.prototype
        
        
        var originalCall = isOwn ? original : function () { 
            return superProto[name].apply(this, arguments) 
        }
        
        var methodWrapper = this.prepareWrapper({
            name            : name,
            modifier        : this.value, 
            
            isOwn           : isOwn,
            originalCall    : originalCall, 
            
            superProto      : superProto,
            
            target          : target
        })
        
        if (isOwn) methodWrapper.__ORIGINAL__ = original
        
        methodWrapper.__CONTAIN__   = this.value
        methodWrapper.__METHOD__    = this
        this.value.displayName      = this.getDisplayName(target)
        methodWrapper.displayName   = 'internal wrapper' 
        
        targetProto[name] = methodWrapper
    },
    
    
    getDisplayName : function (target) {
        return target.meta.name + '[' + this.name + ']'
    },
    
    
    isAppliedTo : function (target) {
        var targetCont = target.prototype[this.name]
        
        return targetCont && targetCont.__CONTAIN__ == this.value
    },
    
    
    unapply : function (from) {
        var name = this.name
        var fromProto = from.prototype
        var original = fromProto[name].__ORIGINAL__
        
        if (!this.isAppliedTo(from)) throw "Unapply of method [" + name + "] from class [" + from + "] failed"
        
        //if modifier was applied to own method - restore it
        if (original) 
            fromProto[name] = original
        //otherwise - just delete it, to reveal the inherited method 
        else
            delete fromProto[name]
    }
    
}).c;
Joose.Managed.Property.MethodModifier.Override = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.Override', {
    
    isa : Joose.Managed.Property.MethodModifier,

    
    prepareWrapper : function (params) {
        
        var modifier        = params.modifier
        var originalCall    = params.originalCall
        var superProto      = params.superProto
        var superMetaConst  = superProto.meta.constructor
        
        //call to Joose.Proto level, require some additional processing
        var isCallToProto = (superMetaConst == Joose.Proto.Class || superMetaConst == Joose.Proto.Object) && !(params.isOwn && originalCall.IS_OVERRIDE) 
        
        var original = originalCall
        
        if (isCallToProto) original = function () {
            var beforeSUPER = this.SUPER
            
            this.SUPER  = superProto.SUPER
            
            var res = originalCall.apply(this, arguments)
            
            this.SUPER = beforeSUPER
            
            return res
        }

        var override = function () {
            
            var beforeSUPER = this.SUPER
            
            this.SUPER  = original
            
            var res = modifier.apply(this, arguments)
            
            this.SUPER = beforeSUPER
            
            return res
        }
        
        override.IS_OVERRIDE = true
        
        return override
    },
    
    getDisplayName : function (target) {
        return target.meta.name + '[override ' + this.name + ']'
    }
    
    
}).c;
Joose.Managed.Property.MethodModifier.Put = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.Put', {
    
    isa : Joose.Managed.Property.MethodModifier.Override,


    prepareWrapper : function (params) {
        
        if (params.isOwn) throw "Method [" + params.name + "] is applying over something [" + params.originalCall + "] in class [" + params.target + "]"
        
        return Joose.Managed.Property.MethodModifier.Put.superClass.prepareWrapper.call(this, params)
    },
    
    getDisplayName : function (target) {
        return target.meta.name + '[' + this.name + ']'
    }
    
    
}).c;
Joose.Managed.Property.MethodModifier.After = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.After', {
    
    isa : Joose.Managed.Property.MethodModifier,

    
    prepareWrapper : function (params) {
        
        var modifier        = params.modifier
        var originalCall    = params.originalCall
        
        return function () {
            var res = originalCall.apply(this, arguments)
            modifier.apply(this, arguments)
            return res
        }
    },
    
    getDisplayName : function (target) {
        return target.meta.name + '[after ' + this.name + ']'
    }
    
}).c;
Joose.Managed.Property.MethodModifier.Before = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.Before', {
    
    isa : Joose.Managed.Property.MethodModifier,

    
    prepareWrapper : function (params) {
        
        var modifier        = params.modifier
        var originalCall    = params.originalCall
        
        return function () {
            modifier.apply(this, arguments)
            return originalCall.apply(this, arguments)
        }
    },
    
    getDisplayName : function (target) {
        return target.meta.name + '[before ' + this.name + ']'
    }
    
}).c;
Joose.Managed.Property.MethodModifier.Around = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.Around', {
    
    isa : Joose.Managed.Property.MethodModifier,

    prepareWrapper : function (params) {
        
        var modifier        = params.modifier
        var originalCall    = params.originalCall
        
        var me
        
        var bound = function () {
            return originalCall.apply(me, arguments)
        }
            
        return function () {
            me = this
            
            var boundArr = [ bound ]
            boundArr.push.apply(boundArr, arguments)
            
            return modifier.apply(this, boundArr)
        }
    },
    
    getDisplayName : function (target) {
        return target.meta.name + '[around ' + this.name + ']'
    }
    
}).c;
Joose.Managed.Property.MethodModifier.Augment = new Joose.Proto.Class('Joose.Managed.Property.MethodModifier.Augment', {
    
    isa : Joose.Managed.Property.MethodModifier,

    
    prepareWrapper : function (params) {
        
        var AUGMENT = function () {
            
            //populate callstack to the most deep non-augment method
            var callstack = []
            
            var self = AUGMENT
            
            do {
                callstack.push(self.IS_AUGMENT ? self.__CONTAIN__ : self)
                
                self = self.IS_AUGMENT && (self.__ORIGINAL__ || self.SUPER[self.methodName])
            } while (self)
            
            
            //save previous INNER
            var beforeINNER = this.INNER
            
            //create new INNER
            this.INNER = function () {
                var innerCall = callstack.pop()
                
                return innerCall ? innerCall.apply(this, arguments) : undefined
            }
            
            //augment modifier results in hypotetical INNER call of the same method in subclass 
            var res = this.INNER.apply(this, arguments)
            
            //restore previous INNER chain
            this.INNER = beforeINNER
            
            return res
        }
        
        AUGMENT.methodName  = params.name
        AUGMENT.SUPER       = params.superProto
        AUGMENT.IS_AUGMENT  = true
        
        return AUGMENT
    },
    
    getDisplayName : function (target) {
        return target.meta.name + '[augment ' + this.name + ']'
    }
    
}).c;
Joose.Managed.PropertySet = new Joose.Proto.Class('Joose.Managed.PropertySet', {
    
    isa                       : Joose.Managed.Property,

    properties                : null,
    
    propertyMetaClass         : Joose.Managed.Property,
    
    
    initialize : function (props) {
        Joose.Managed.PropertySet.superClass.initialize.call(this, props)
        
        //XXX this guards the meta roles :)
        this.properties = props.properties || {}
    },
    
    
    addProperty : function (name, props) {
        var metaClass = props.meta || this.propertyMetaClass
        delete props.meta
        
        props.definedIn     = this
        props.name          = name
        
        return this.properties[name] = new metaClass(props)
    },
    
    
    addPropertyObject : function (object) {
        return this.properties[object.name] = object
    },
    
    
    removeProperty : function (name) {
        var prop = this.properties[name]
        
        delete this.properties[name]
        
        return prop
    },
    
    
    haveProperty : function (name) {
        return this.properties[name] != null
    },
    

    haveOwnProperty : function (name) {
        return this.haveProperty(name) && this.properties.hasOwnProperty(name)
    },
    
    
    getProperty : function (name) {
        return this.properties[name]
    },
    
    
    //includes inherited properties (probably you wants 'eachOwn', which process only "own" (including consumed from Roles) properties) 
    each : function (func, scope) {
        Joose.O.each(this.properties, func, scope || this)
    },
    
    
    eachOwn : function (func, scope) {
        Joose.O.eachOwn(this.properties, func, scope || this)
    },
    
    
    //synonym for each
    eachAll : function (func, scope) {
        this.each(func, scope)
    },
    
    
    cloneProps : function () {
        var props = Joose.Managed.PropertySet.superClass.cloneProps.call(this)
        
        props.propertyMetaClass     = this.propertyMetaClass
        
        return props
    },
    
    
    clone : function (name) {
        var clone = this.cleanClone(name)
        
        clone.properties = Joose.O.copyOwn(this.properties)
        
        return clone
    },
    
    
    cleanClone : function (name) {
        var props = this.cloneProps()
        
        props.name = name || props.name
        
        return new this.constructor(props)
    },
    
    
    alias : function (what) {
        var props = this.properties
        
        Joose.O.each(what, function (aliasName, originalName) {
            var original = props[originalName]
            
            if (original) this.addPropertyObject(original.clone(aliasName))
        }, this)
    },
    
    
    exclude : function (what) {
        var props = this.properties
        
        Joose.A.each(what, function (name) {
            delete props[name]
        })
    },
    
    
    beforeConsumedBy : function () {
    },
    
    
    flattenTo : function (target) {
        var targetProps = target.properties
        
        this.eachOwn(function (property, name) {
            var targetProperty = targetProps[name]
            
            if (targetProperty instanceof Joose.Managed.Property.ConflictMarker) return
            
            if (!targetProps.hasOwnProperty(name) || targetProperty == null) {
                target.addPropertyObject(property)
                return
            }
            
            if (targetProperty == property) return
            
            target.removeProperty(name)
            target.addProperty(name, {
                meta : Joose.Managed.Property.ConflictMarker
            })
        }, this)
    },
    
    
    composeTo : function (target) {
        this.eachOwn(function (property, name) {
            if (!target.haveOwnProperty(name)) target.addPropertyObject(property)
        })
    },
    
    
    composeFrom : function () {
        if (!arguments.length) return
        
        var flattening = this.cleanClone()
        
        Joose.A.each(arguments, function (arg) {
            var isDescriptor    = !(arg instanceof Joose.Managed.PropertySet)
            var propSet         = isDescriptor ? arg.propertySet : arg
            
            propSet.beforeConsumedBy(this, flattening)
            
            if (isDescriptor) {
                if (arg.alias || arg.exclude)   propSet = propSet.clone()
                if (arg.alias)                  propSet.alias(arg.alias)
                if (arg.exclude)                propSet.exclude(arg.exclude)
            }
            
            propSet.flattenTo(flattening)
        }, this)
        
        flattening.composeTo(this)
    },
    
    
    preApply : function (target) {
        this.eachOwn(function (property) {
            property.preApply(target)
        })
    },
    
    
    apply : function (target) {
        this.eachOwn(function (property) {
            property.apply(target)
        })
    },
    
    
    unapply : function (from) {
        this.eachOwn(function (property) {
            property.unapply(from)
        })
    },
    
    
    postUnApply : function (target) {
        this.eachOwn(function (property) {
            property.postUnApply(target)
        })
    }
    
}).c
;
var __ID__ = 1


Joose.Managed.PropertySet.Mutable = new Joose.Proto.Class('Joose.Managed.PropertySet.Mutable', {
    
    isa                 : Joose.Managed.PropertySet,

    ID                  : null,
    
    derivatives         : null,
    
    opened              : null,
    
    composedFrom        : null,
    
    
    initialize : function (props) {
        Joose.Managed.PropertySet.Mutable.superClass.initialize.call(this, props)
        
        //initially opened
        this.opened             = 1
        this.derivatives        = {}
        this.ID                 = __ID__++
        this.composedFrom       = []
    },
    
    
    addComposeInfo : function () {
        this.ensureOpen()
        
        Joose.A.each(arguments, function (arg) {
            this.composedFrom.push(arg)
            
            var propSet = arg instanceof Joose.Managed.PropertySet ? arg : arg.propertySet
                
            propSet.derivatives[this.ID] = this
        }, this)
    },
    
    
    removeComposeInfo : function () {
        this.ensureOpen()
        
        Joose.A.each(arguments, function (arg) {
            
            var i = 0
            
            while (i < this.composedFrom.length) {
                var propSet = this.composedFrom[i]
                propSet = propSet instanceof Joose.Managed.PropertySet ? propSet : propSet.propertySet
                
                if (arg == propSet) {
                    delete propSet.derivatives[this.ID]
                    this.composedFrom.splice(i, 1)
                } else i++
            }
            
        }, this)
    },
    
    
    ensureOpen : function () {
        if (!this.opened) throw "Mutation of closed property set: [" + this.name + "]"
    },
    
    
    addProperty : function (name, props) {
        this.ensureOpen()
        
        return Joose.Managed.PropertySet.Mutable.superClass.addProperty.call(this, name, props)
    },
    

    addPropertyObject : function (object) {
        this.ensureOpen()
        
        return Joose.Managed.PropertySet.Mutable.superClass.addPropertyObject.call(this, object)
    },
    
    
    removeProperty : function (name) {
        this.ensureOpen()
        
        return Joose.Managed.PropertySet.Mutable.superClass.removeProperty.call(this, name)
    },
    
    
    composeFrom : function () {
        this.ensureOpen()
        
        return Joose.Managed.PropertySet.Mutable.superClass.composeFrom.apply(this, this.composedFrom)
    },
    
    
    open : function () {
        this.opened++
        
        if (this.opened == 1) {
        
            Joose.O.each(this.derivatives, function (propSet) {
                propSet.open()
            })
            
            this.deCompose()
        }
    },
    
    
    close : function () {
        if (!this.opened) throw "Unmatched 'close' operation on property set: [" + this.name + "]"
        
        if (this.opened == 1) {
            this.reCompose()
            
            Joose.O.each(this.derivatives, function (propSet) {
                propSet.close()
            })
        }
        this.opened--
    },
    
    
    reCompose : function () {
        this.composeFrom()
    },
    
    
    deCompose : function () {
        this.eachOwn(function (property, name) {
            if (property.definedIn != this) this.removeProperty(name)
        }, this)
    }
    
}).c;
Joose.Managed.StemElement = function () { throw "Modules may not be instantiated." }

Joose.Managed.StemElement.Attributes = new Joose.Proto.Class('Joose.Managed.StemElement.Attributes', {
    
    isa                     : Joose.Managed.PropertySet.Mutable,
    
    propertyMetaClass       : Joose.Managed.Property.Attribute
    
}).c
;
Joose.Managed.StemElement.Methods = new Joose.Proto.Class('Joose.Managed.StemElement.Methods', {
    
    isa : Joose.Managed.PropertySet.Mutable,
    
    propertyMetaClass : Joose.Managed.Property.MethodModifier.Put,

    
    preApply : function () {
    },
    
    
    postUnApply : function () {
    }
    
}).c;
Joose.Managed.StemElement.Requirements = new Joose.Proto.Class('Joose.Managed.StemElement.Requirements', {

    isa                     : Joose.Managed.PropertySet.Mutable,
    
    propertyMetaClass       : Joose.Managed.Property.Requirement,
    
    
    
    alias : function () {
    },
    
    
    exclude : function () {
    },
    
    
    flattenTo : function (target) {
        this.each(function (property, name) {
            if (!target.haveProperty(name)) target.addPropertyObject(property)
        })
    },
    
    
    composeTo : function (target) {
        this.flattenTo(target)
    },
    
    
    preApply : function () {
    },
    
    
    postUnApply : function () {
    }
    
}).c;
Joose.Managed.StemElement.MethodModifiers = new Joose.Proto.Class('Joose.Managed.StemElement.MethodModifiers', {

    isa                     : Joose.Managed.PropertySet.Mutable,
    
    propertyMetaClass       : null,
    
    
    addProperty : function (name, props) {
        var metaClass = props.meta
        delete props.meta
        
        props.definedIn         = this
        props.name              = name
        
        var modifier            = new metaClass(props)
        var properties          = this.properties
        
        if (!properties[name]) properties[ name ] = []
        
        properties[name].push(modifier)
        
        return modifier
    },
    

    addPropertyObject : function (object) {
        var name            = object.name
        var properties      = this.properties
        
        if (!properties[name]) properties[name] = []
        
        properties[name].push(object)
        
        return object
    },
    
    
    //remove only the last modifier
    removeProperty : function (name) {
        if (!this.haveProperty(name)) return undefined
        
        var properties      = this.properties
        var modifier        = properties[ name ].pop()
        
        //if all modifiers were removed - clearing the properties
        if (!properties[name].length) Joose.Managed.StemElement.MethodModifiers.superClass.removeProperty.call(this, name)
        
        return modifier
    },
    
    
    alias : function () {
    },
    
    
    exclude : function () {
    },
    
    
    flattenTo : function (target) {
        var targetProps = target.properties
        
        this.each(function (modifiersArr, name) {
            var targetModifiersArr = targetProps[name]
            
            if (targetModifiersArr == null) targetModifiersArr = targetProps[name] = []
            
            Joose.A.each(modifiersArr, function (modifier) {
                if (!Joose.A.exists(targetModifiersArr, modifier)) targetModifiersArr.push(modifier)
            })
            
        })
    },
    
    
    composeTo : function (target) {
        this.flattenTo(target)
    },

    
    deCompose : function () {
        this.each(function (modifiersArr, name) {
            var i = 0
            
            while (i < modifiersArr.length) 
                if (modifiersArr[i].definedIn != this) 
                    modifiersArr.splice(i, 1)
                else 
                    i++
        })
    },
    
    
    preApply : function (target) {
    },

    
    postUnApply : function (target) {
    },
    
    
    apply : function (target) {
        this.each(function (modifiersArr, name) {
            Joose.A.each(modifiersArr, function (modifier) {
                modifier.apply(target)
            })
        })
    },
    
    
    unapply : function (from) {
        this.each(function (modifiersArr, name) {
            for (var i = modifiersArr.length - 1; i >=0 ; i--) modifiersArr[i].unapply(from)
        })
    }
    
    
    
}).c;
Joose.Managed.PropertySet.Composition = new Joose.Proto.Class('Joose.Managed.PropertySet.Composition', {
    
    isa                         : Joose.Managed.PropertySet.Mutable,
    
    propertyMetaClass           : Joose.Managed.PropertySet.Mutable,
    
    processOrder                : null,

    
    each : function (func, scope) {
        var props   = this.properties
        var scope   = scope || this
        
        Joose.A.each(this.processOrder, function (name) {
            func.call(scope, props[name], name)
        })
    },
    
    
    eachR : function (func, scope) {
        var props   = this.properties
        var scope   = scope || this
        
        Joose.A.eachR(this.processOrder, function (name) {
            func.call(scope, props[name], name)
        })
        
        
//        var props           = this.properties
//        var processOrder    = this.processOrder
//        
//        for(var i = processOrder.length - 1; i >= 0; i--) 
//            func.call(scope || this, props[ processOrder[i] ], processOrder[i])
    },
    
    
    clone : function (name) {
        var clone = this.cleanClone(name)
        
        this.each(function (property) {
            clone.addPropertyObject(property.clone())
        })
        
        return clone
    },
    
    
    alias : function (what) {
        this.each(function (property) {
            property.alias(what)
        })
    },
    
    
    exclude : function (what) {
        this.each(function (property) {
            property.exclude(what)
        })
    },
    
    
    flattenTo : function (target) {
        var targetProps = target.properties
        
        this.each(function (property, name) {
            var subTarget = targetProps[name] || target.addProperty(name, {
                meta : property.constructor
            })
            
            property.flattenTo(subTarget)
        })
    },
    
    
    composeTo : function (target) {
        var targetProps = target.properties
        
        this.each(function (property, name) {
            var subTarget = targetProps[name] || target.addProperty(name, {
                meta : property.constructor
            })
            
            property.composeTo(subTarget)
        })
    },
    
    
    
    deCompose : function () {
        this.eachR(function (property) {
            property.open()
        })
        
        Joose.Managed.PropertySet.Composition.superClass.deCompose.call(this)
    },
    
    
    reCompose : function () {
        Joose.Managed.PropertySet.Composition.superClass.reCompose.call(this)
        
        this.each(function (property) {
            property.close()
        })
    },
    
    
    unapply : function (from) {
        this.eachR(function (property) {
            property.unapply(from)
        })
    }
    
}).c
;
Joose.Managed.Stem = new Joose.Proto.Class('Joose.Managed.Stem', {
    
    isa                  : Joose.Managed.PropertySet.Composition,
    
    targetMeta           : null,
    
    attributesMC         : Joose.Managed.StemElement.Attributes,
    methodsMC            : Joose.Managed.StemElement.Methods,
    requirementsMC       : Joose.Managed.StemElement.Requirements,
    methodsModifiersMC   : Joose.Managed.StemElement.MethodModifiers,
    
    processOrder         : [ 'attributes', 'methods', 'requirements', 'methodsModifiers' ],
    
    
    initialize : function (props) {
        Joose.Managed.Stem.superClass.initialize.call(this, props)
        
        var targetMeta = this.targetMeta
        
        this.addProperty('attributes', {
            meta : this.attributesMC,
            
            //it can be no 'targetMeta' in clones
            properties : targetMeta ? targetMeta.attributes : {}
        })
        
        
        this.addProperty('methods', {
            meta : this.methodsMC,
            
            properties : targetMeta ? targetMeta.methods : {}
        })
        
        
        this.addProperty('requirements', {
            meta : this.requirementsMC
        })
        
        
        this.addProperty('methodsModifiers', {
            meta : this.methodsModifiersMC
        })
    },
    
    
    reCompose : function () {
        var c       = this.targetMeta.c
        
        this.preApply(c)
        
        Joose.Managed.Stem.superClass.reCompose.call(this)
        
        this.apply(c)
    },
    
    
    deCompose : function () {
        var c       = this.targetMeta.c
        
        this.unapply(c)
        
        Joose.Managed.Stem.superClass.deCompose.call(this)
        
        this.postUnApply(c)
    }
    
    
}).c
;
Joose.Managed.Builder = new Joose.Proto.Class('Joose.Managed.Builder', {
    
    targetMeta          : null,
    
    
    _buildStart : function (targetMeta, props) {
        targetMeta.stem.open()
        
        Joose.A.each([ 'trait', 'traits', 'removeTrait', 'removeTraits', 'does', 'doesnot', 'doesnt' ], function (builder) {
            if (props[builder]) {
                this[builder](targetMeta, props[builder])
                delete props[builder]
            }
        }, this)
    },
    
    
    _extend : function (props) {
        if (Joose.O.isEmpty(props)) return
        
        var targetMeta = this.targetMeta
        
        this._buildStart(targetMeta, props)
        
        Joose.O.eachOwn(props, function (value, name) {
            var handler = this[name]
            
            if (!handler) throw new Error("Unknown builder [" + name + "] was used during extending of [" + targetMeta.c + "]")
            
            handler.call(this, targetMeta, value)
        }, this)
        
        this._buildComplete(targetMeta, props)
    },
    

    _buildComplete : function (targetMeta, props) {
        targetMeta.stem.close()
    },
    
    
    methods : function (targetMeta, info) {
        Joose.O.eachOwn(info, function (value, name) {
            targetMeta.addMethod(name, value)
        })
    },
    

    removeMethods : function (targetMeta, info) {
        Joose.A.each(info, function (name) {
            targetMeta.removeMethod(name)
        })
    },
    
    
    have : function (targetMeta, info) {
        Joose.O.eachOwn(info, function (value, name) {
            targetMeta.addAttribute(name, value)
        })
    },
    
    
    havenot : function (targetMeta, info) {
        Joose.A.each(info, function (name) {
            targetMeta.removeAttribute(name)
        })
    },
    

    havent : function (targetMeta, info) {
        this.havenot(targetMeta, info)
    },
    
    
    after : function (targetMeta, info) {
        Joose.O.each(info, function (value, name) {
            targetMeta.addMethodModifier(name, value, Joose.Managed.Property.MethodModifier.After)
        })
    },
    
    
    before : function (targetMeta, info) {
        Joose.O.each(info, function (value, name) {
            targetMeta.addMethodModifier(name, value, Joose.Managed.Property.MethodModifier.Before)
        })
    },
    
    
    override : function (targetMeta, info) {
        Joose.O.each(info, function (value, name) {
            targetMeta.addMethodModifier(name, value, Joose.Managed.Property.MethodModifier.Override)
        })
    },
    
    
    around : function (targetMeta, info) {
        Joose.O.each(info, function (value, name) {
            targetMeta.addMethodModifier(name, value, Joose.Managed.Property.MethodModifier.Around)
        })
    },
    
    
    augment : function (targetMeta, info) {
        Joose.O.each(info, function (value, name) {
            targetMeta.addMethodModifier(name, value, Joose.Managed.Property.MethodModifier.Augment)
        })
    },
    
    
    removeModifier : function (targetMeta, info) {
        Joose.A.each(info, function (name) {
            targetMeta.removeMethodModifier(name)
        })
    },
    
    
    does : function (targetMeta, info) {
        Joose.A.each(Joose.O.wantArray(info), function (desc) {
            targetMeta.addRole(desc)
        })
    },
    

    doesnot : function (targetMeta, info) {
        Joose.A.each(Joose.O.wantArray(info), function (desc) {
            targetMeta.removeRole(desc)
        })
    },
    
    
    doesnt : function (targetMeta, info) {
        this.doesnot(targetMeta, info)
    },
    
    
    trait : function () {
        this.traits.apply(this, arguments)
    },
    
    
    traits : function (targetMeta, info) {
        if (targetMeta.firstPass) return
        
        if (!targetMeta.meta.isDetached) throw "Can't apply trait to not detached class"
        
        targetMeta.meta.extend({
            does : info
        })
    },
    
    
    removeTrait : function () {
        this.removeTraits.apply(this, arguments)
    },
     
    
    removeTraits : function (targetMeta, info) {
        if (!targetMeta.meta.isDetached) throw "Can't remove trait from not detached class"
        
        targetMeta.meta.extend({
            doesnot : info
        })
    },
    
    name : function (targetMeta, name) {
        targetMeta.name     = name
    }
    
}).c;
Joose.Managed.Class = new Joose.Proto.Class('Joose.Managed.Class', {
    
    isa                         : Joose.Proto.Class,
    
    stem                        : null,
    stemClass                   : Joose.Managed.Stem,
    stemClassCreated            : false,
    
    builder                     : null,
    builderClass                : Joose.Managed.Builder,
    builderClassCreated         : false,
    
    isDetached                  : false,
    firstPass                   : true,
    
    // a special instance, which, when passed as 1st argument to constructor, signifies that constructor should
    // skips traits processing for this instance
    skipTraitsAnchor            : {},
    
    
    //build for metaclasses - collects traits from roles
    BUILD : function () {
        var sup = Joose.Managed.Class.superClass.BUILD.apply(this, arguments)
        
        var props   = sup.__extend__
        
        var traits = Joose.O.wantArray(props.trait || props.traits || [])
        delete props.trait
        delete props.traits
        
        Joose.A.each(Joose.O.wantArray(props.does || []), function (arg) {
            var role = (arg.meta instanceof Joose.Managed.Class) ? arg : arg.role
            
            if (role.meta.meta.isDetached) traits.push(role.meta.constructor)
        })
        
        if (traits.length) props.traits = traits 
        
        return sup
    },
    
    
    initInstance : function (instance, props) {
        Joose.O.each(this.attributes, function (attribute, name) {
            
            if (attribute instanceof Joose.Managed.Attribute) 
                attribute.initFromConfig(instance, props)
            else 
                if (props.hasOwnProperty(name)) instance[name] = props[name]
        })
    },
    
    
    // we are using the same constructor for usual and meta- classes
    defaultConstructor: function () {
        return function (skipTraitsAnchor, params) {
            
            var thisMeta    = this.meta
            var skipTraits  = skipTraitsAnchor == thisMeta.skipTraitsAnchor
            
            var BUILD       = this.BUILD
            
            var props       = BUILD && BUILD.apply(this, skipTraits ? params : arguments) || (skipTraits ? params[0] : skipTraitsAnchor) || {}
            
            
            // either looking for traits in __extend__ (meta-class) or in usual props (usual class)
            var extend  = props.__extend__ || props
            
            var traits = extend.trait || extend.traits
            
            if (traits || extend.detached) {
                delete extend.trait
                delete extend.traits
                delete extend.detached
                
                if (!skipTraits) {
                    var classWithTrait  = thisMeta.subClass({ does : traits || [] }, thisMeta.name)
                    var meta            = classWithTrait.meta
                    meta.isDetached     = true
                    
                    return meta.instantiate(thisMeta.skipTraitsAnchor, arguments)
                }
            }
            
            thisMeta.initInstance(this, props)
            
            return thisMeta.hasMethod('initialize') && this.initialize(props) || this
        }
    },
    
    
    finalize: function (extend) {
        Joose.Managed.Class.superClass.finalize.call(this, extend)
        
        this.stem.close()
        
        this.afterMutate()
    },
    
    
    processStem : function () {
        Joose.Managed.Class.superClass.processStem.call(this)
        
        this.builder    = new this.builderClass({ targetMeta : this })
        this.stem       = new this.stemClass({ name : this.name, targetMeta : this })
        
        var builderClass = this.getClassInAttribute('builderClass')
        
        if (builderClass) {
            this.builderClassCreated = true
            this.addAttribute('builderClass', this.subClassOf(builderClass))
        }
        
        
        var stemClass = this.getClassInAttribute('stemClass')
        
        if (stemClass) {
            this.stemClassCreated = true
            this.addAttribute('stemClass', this.subClassOf(stemClass))
        }
    },
    
    
    extend : function (props) {
        if (props.builder) {
            this.getBuilderTarget().meta.extend(props.builder)
            delete props.builder
        }
        
        if (props.stem) {
            this.getStemTarget().meta.extend(props.stem)
            delete props.stem
        }
        
        this.builder._extend(props)
        
        this.firstPass = false
        
        if (!this.stem.opened) this.afterMutate()
    },
    
    
    getBuilderTarget : function () {
        var builderClass = this.getClassInAttribute('builderClass')
        if (!builderClass) throw "Attempt to extend a builder on non-meta class"
        
        return builderClass
    },
    

    getStemTarget : function () {
        var stemClass = this.getClassInAttribute('stemClass')
        if (!stemClass) throw "Attempt to extend a stem on non-meta class"
        
        return stemClass
    },
    
    
    getClassInAttribute : function (attributeName) {
        var attrClass = this.getAttribute(attributeName)
        if (attrClass instanceof Joose.Managed.Property.Attribute) attrClass = attrClass.value
        
        return attrClass
    },
    
    
    addMethodModifier: function (name, func, type) {
        var props = {}
        
        props.init = func
        props.meta = type
        
        return this.stem.properties.methodsModifiers.addProperty(name, props)
    },
    
    
    removeMethodModifier: function (name) {
        return this.stem.properties.methodsModifiers.removeProperty(name)
    },
    
    
    addMethod: function (name, func, props) {
        props = props || {}
        props.init = func
        
        return this.stem.properties.methods.addProperty(name, props)
    },
    
    
    addAttribute: function (name, init, props) {
        props = props || {}
        props.init = init
        
        return this.stem.properties.attributes.addProperty(name, props)
    },
    
    
    removeMethod : function (name) {
        return this.stem.properties.methods.removeProperty(name)
    },

    
    removeAttribute: function (name) {
        return this.stem.properties.attributes.removeProperty(name)
    },
    
    
    hasMethod: function (name) {
        return this.stem.properties.methods.haveProperty(name)
    },
    
    
    hasAttribute: function (name) { 
        return this.stem.properties.attributes.haveProperty(name)
    },
    
    
    hasMethodModifiersFor : function (name) {
        return this.stem.properties.methodsModifiers.haveProperty(name)
    },
    
    
    hasOwnMethod: function (name) {
        return this.stem.properties.methods.haveOwnProperty(name)
    },
    
    
    hasOwnAttribute: function (name) { 
        return this.stem.properties.attributes.haveOwnProperty(name)
    },
    

    getMethod : function (name) {
        return this.stem.properties.methods.getProperty(name)
    },
    
    
    getAttribute : function (name) {
        return this.stem.properties.attributes.getProperty(name)
    },
    
    
    eachRole : function (roles, func, scope) {
        Joose.A.each(roles, function (arg, index) {
            var role = (arg.meta instanceof Joose.Managed.Class) ? arg : arg.role
            
            func.call(scope || this, arg, role, index)
        }, this)
    },
    
    
    addRole : function () {
        
        this.eachRole(arguments, function (arg, role) {
            
            this.beforeRoleAdd(role)
            
            var desc = arg
            
            //compose descriptor can contain 'alias' and 'exclude' fields, in this case actual reference should be stored
            //into 'propertySet' field
            if (role != arg) {
                desc.propertySet = role.meta.stem
                delete desc.role
            } else
                desc = desc.meta.stem
            
            this.stem.addComposeInfo(desc)
            
        }, this)
    },
    
    
    beforeRoleAdd : function (role) {
        var roleMeta = role.meta
        
        if (roleMeta.builderClassCreated) this.getBuilderTarget().meta.extend({
            does : [ roleMeta.getBuilderTarget() ]
        })
        
        if (roleMeta.stemClassCreated) this.getStemTarget().meta.extend({
            does : [ roleMeta.getStemTarget() ]
        })
        
        if (roleMeta.meta.isDetached && !this.firstPass) this.builder.traits(this, roleMeta.constructor)
    },
    
    
    beforeRoleRemove : function (role) {
        var roleMeta = role.meta
        
        if (roleMeta.builderClassCreated) this.getBuilderTarget().meta.extend({
            doesnt : [ roleMeta.getBuilderTarget() ]
        })
        
        if (roleMeta.stemClassCreated) this.getStemTarget().meta.extend({
            doesnt : [ roleMeta.getStemTarget() ]
        })
        
        if (roleMeta.meta.isDetached && !this.firstPass) this.builder.removeTraits(this, roleMeta.constructor)
    },
    
    
    removeRole : function () {
        this.eachRole(arguments, function (arg, role) {
            this.beforeRoleRemove(role)
            
            this.stem.removeComposeInfo(role.meta.stem)
        }, this)
    },
    
    
    getRoles : function () {
        
        return Joose.A.map(this.stem.composedFrom, function (composeDesc) {
            //compose descriptor can contain 'alias' and 'exclude' fields, in this case actual reference is stored
            //into 'propertySet' field
            if (!(composeDesc instanceof Joose.Managed.PropertySet)) return composeDesc.propertySet
            
            return composeDesc.targetMeta.c
        })
    },
    
    
    does : function (role) {
        var myRoles = this.getRoles()
        
        for (var i = 0; i < myRoles.length; i++) if (role == myRoles[i]) return true
        for (var i = 0; i < myRoles.length; i++) if (myRoles[i].meta.does(role)) return true
        
        var superMeta = this.superClass.meta
        
        // considering the case of inheriting from non-Joose classes
        if (this.superClass != Joose.Proto.Empty && superMeta && superMeta.meta && superMeta.meta.hasMethod('does')) return superMeta.does(role)
        
        return false
    },
    
    
    getMethods : function () {
        return this.stem.properties.methods
    },
    
    
    getAttributes : function () {
        return this.stem.properties.attributes
    },
    
    
    afterMutate : function () {
    },
    
    
    getCurrentMethod : function () {
        for (var wrapper = arguments.callee.caller, count = 0; wrapper && count < 5; wrapper = wrapper.caller, count++)
            if (wrapper.__METHOD__) return wrapper.__METHOD__
        
        return null
    }
    
    
}).c;
Joose.Managed.Role = new Joose.Managed.Class('Joose.Managed.Role', {
    
    isa                         : Joose.Managed.Class,
    
    have : {
        defaultSuperClass       : Joose.Proto.Empty,
        
        builderRole             : null,
        stemRole                : null
    },
    
    
    methods : {
        
        defaultConstructor : function () {
            return function () {
                throw new Error("Roles cant be instantiated")
            }
        },
        

        processSuperClass : function () {
            if (this.superClass != this.defaultSuperClass) throw new Error("Roles can't inherit from anything")
        },
        
        
        getBuilderTarget : function () {
            if (!this.builderRole) {
                this.builderRole = new this.constructor().c
                this.builderClassCreated = true
            }
            
            return this.builderRole
        },
        
    
        getStemTarget : function () {
            if (!this.stemRole) {
                this.stemRole = new this.constructor().c
                this.stemClassCreated = true
            }
            
            return this.stemRole
        },
        
    
        addRequirement : function (methodName) {
            this.stem.properties.requirements.addProperty(methodName, {})
        }
        
    },
    

    stem : {
        methods : {
            
            apply : function () {
            },
            
            
            unapply : function () {
            }
        }
    },
    
    
    builder : {
        methods : {
            requires : function (targetClassMeta, info) {
                Joose.A.each(Joose.O.wantArray(info), function (methodName) {
                    targetClassMeta.addRequirement(methodName)
                }, this)
            }
        }
    }
    
}).c;
Joose.Managed.Attribute = new Joose.Managed.Class('Joose.Managed.Attribute', {
    
    isa : Joose.Managed.Property.Attribute,
    
    have : {
        is              : null,
        
        builder         : null,
        
        isPrivate       : false,
        
        role            : null,
        
        publicName      : null,
        setterName      : null,
        getterName      : null,
        
        //indicates the logical readableness/writeableness of the attribute
        readable        : false,
        writeable       : false,
        
        //indicates the physical presense of the accessor (may be absent for "combined" accessors for example)
        hasGetter       : false,
        hasSetter       : false,
        
        required        : false,
        
        canInlineSetRaw : true,
        canInlineGetRaw : true
    },
    
    
    after : {
        initialize : function () {
            var name = this.name
            
            this.publicName = name.replace(/^_+/, '')
            
            this.slot = this.isPrivate ? '$' + name : name
            
            this.setterName = this.setterName || this.getSetterName()
            this.getterName = this.getterName || this.getGetterName()
            
            this.readable  = this.hasGetter = /^r/i.test(this.is)
            this.writeable = this.hasSetter = /^.w/i.test(this.is)
        }
    },
    
    
    override : {
        
        computeValue : function () {
            var init    = this.init
            
            if (Joose.O.isClass(init) || !Joose.O.isFunction(init)) this.SUPER()
        },
        
        
        preApply : function (targetClass) {
            targetClass.meta.extend({
                methods : this.getAccessorsFor(targetClass)
            })
        },
        
        
        postUnApply : function (from) {
            from.meta.extend({
                removeMethods : this.getAccessorsFrom(from)
            })
        }
        
    },
    
    
    methods : {
        
        getAccessorsFor : function (targetClass) {
            var targetMeta = targetClass.meta
            var setterName = this.setterName
            var getterName = this.getterName
            
            var methods = {}
            
            if (this.hasSetter && !targetMeta.hasMethod(setterName)) {
                methods[setterName] = this.getSetter()
                methods[setterName].ACCESSOR_FROM = this
            }
            
            if (this.hasGetter && !targetMeta.hasMethod(getterName)) {
                methods[getterName] = this.getGetter()
                methods[getterName].ACCESSOR_FROM = this
            }
            
            return methods
        },
        
        
        getAccessorsFrom : function (from) {
            var targetMeta = from.meta
            var setterName = this.setterName
            var getterName = this.getterName
            
            var setter = this.hasSetter && targetMeta.getMethod(setterName)
            var getter = this.hasGetter && targetMeta.getMethod(getterName)
            
            var removeMethods = []
            
            if (setter && setter.value.ACCESSOR_FROM == this) removeMethods.push(setterName)
            if (getter && getter.value.ACCESSOR_FROM == this) removeMethods.push(getterName)
            
            return removeMethods
        },
        
        
        getGetterName : function () {
            return 'get' + Joose.S.uppercaseFirst(this.publicName)
        },


        getSetterName : function () {
            return 'set' + Joose.S.uppercaseFirst(this.publicName)
        },
        
        
        getSetter : function () {
            var me      = this
            var slot    = me.slot
            
            if (me.canInlineSetRaw)
                return function (value) {
                    this[ slot ] = value
                    
                    return this
                }
            else
                return function () {
                    return me.setRawValueTo.apply(this, arguments)
                }
        },
        
        
        getGetter : function () {
            var me      = this
            var slot    = me.slot
            
            if (me.canInlineGetRaw)
                return function (value) {
                    return this[ slot ]
                }
            else
                return function () {
                    return me.getRawValueFrom.apply(this, arguments)
                }
        },
        
        
        getValueFrom : function (instance) {
            var getterName      = this.getterName
            
            if (this.readable && instance.meta.hasMethod(getterName)) return instance[ getterName ]()
            
            return this.getRawValueFrom(instance)
        },
        
        
        setValueTo : function (instance, value) {
            var setterName      = this.setterName
            
            if (this.writeable && instance.meta.hasMethod(setterName)) 
                instance[ setterName ](value)
            else
                this.setRawValueTo(instance, value)
        },
        
        
        initFromConfig : function (instance, config) {
            var name            = this.name
            
            var value, isSet = false
            
            if (config.hasOwnProperty(name)) {
                value = config[name]
                isSet = true
            } else {
                var init    = this.init
                
                // simple function (not class) has been used as "init" value
                if (Joose.O.isFunction(init) && !Joose.O.isClass(init)) {
                    
                    value = init.call(instance, config, name)
                    
                    isSet = true
                    
                } else if (this.builder) {
                    
                    value = instance[ this.builder.replace(/^this\./, '') ](config, name)
                    isSet = true
                }
            }
            
            if (isSet)
                this.setRawValueTo(instance, value)
            else 
                if (this.required) throw new Error("Required attribute [" + name + "] is missed during initialization of " + instance)
        }
    }

}).c
;
Joose.Managed.Attribute.Builder = new Joose.Managed.Role('Joose.Managed.Attribute.Builder', {
    
    
    have : {
        defaultAttributeClass : Joose.Managed.Attribute
    },
    
    builder : {
        
        methods : {
            
            has : function (targetClassMeta, info) {
                Joose.O.eachOwn(info, function (props, name) {
                    if (typeof props != 'object' || props == null || props.constructor == / /.constructor) props = { init : props }
                    
                    props.meta = props.meta || targetClassMeta.defaultAttributeClass
                    
                    if (/^__/.test(name)) {
                        name = name.replace(/^_+/, '')
                        
                        props.isPrivate = true
                    }
                    
                    targetClassMeta.addAttribute(name, props.init, props)
                }, this)
            },
            
            
            hasnot : function (targetClassMeta, info) {
                this.havenot(targetClassMeta, info)
            },
            
            
            hasnt : function (targetClassMeta, info) {
                this.hasnot(targetClassMeta, info)
            }
        }
            
    }
    
}).c
;
Joose.Managed.My = new Joose.Managed.Role('Joose.Managed.My', {
    
    have : {
        myClass                         : null,
        
        needToReAlias                   : false
    },
    
    
    methods : {
        createMy : function (extend) {
            var thisMeta        = this.meta
            var isRole          = this instanceof Joose.Managed.Role
            
            var myExtend        = extend.my || {}
            delete extend.my
            
            // Symbiont will generally have the same meta class as its hoster, excepting the cases, when the superclass also have the symbiont. 
            // In such cases, the meta class for symbiont will be inherited (unless explicitly specified)
            var superClassMy    = this.superClass.meta.myClass
            
            if (!isRole && !myExtend.isa && superClassMy) myExtend.isa = superClassMy
            

            if (!myExtend.meta && !myExtend.isa) myExtend.meta = this.constructor
            
            myExtend.name       = this.name + '.my'
            
            var createdClass    = this.myClass = Class(myExtend)
            
            var c               = this.c
            
            c.prototype.my      = c.my = isRole ? createdClass : new createdClass({ HOST : c })
            
            this.needToReAlias = true
        },
        
        
        aliasStaticMethods : function () {
            this.needToReAlias = false
            
            var c           = this.c
            var myProto     = this.myClass.prototype
            
            Joose.O.eachOwn(c, function (property, name) {
                if (property.IS_ALIAS) delete c[ name ] 
            })
            
            this.myClass.meta.stem.properties.methods.each(function (method, name) {
                
                if (!c[ name ])
                    (c[ name ] = function () {
                        return myProto[ name ].apply(c.my, arguments)
                    }).IS_ALIAS = true
            })
        }
    },
    
    
    override : {
        
        extend : function (props) {
            var myClass = this.myClass
            
            if (!myClass && this.superClass.meta.myClass) this.createMy(props)
            
            if (props.my) {
                if (!myClass) 
                    this.createMy(props)
                else {
                    this.needToReAlias = true
                    
                    myClass.meta.extend(props.my)
                    delete props.my
                }
            }
            
            this.SUPER(props)
            
            if (this.needToReAlias && !(this instanceof Joose.Managed.Role)) this.aliasStaticMethods()
        }  
    },
    
    
    before : {
        
        addRole : function () {
            var myStem
            
            Joose.A.each(arguments, function (arg) {
                
                if (!arg) throw new Error("Attempt to consume an undefined Role into [" + this.name + "]")
                
                //instanceof Class to allow treat classes as roles
                var role = (arg.meta instanceof Joose.Managed.Class) ? arg : arg.role
                
                if (role.meta.meta.hasAttribute('myClass') && role.meta.myClass) {
                    
                    if (!this.myClass) {
                        this.createMy({
                            my : {
                                does : role.meta.myClass
                            }
                        })
                        return
                    }
                    
                    myStem = this.myClass.meta.stem
                    if (!myStem.opened) myStem.open()
                    
                    myStem.addComposeInfo(role.my.meta.stem)
                }
            }, this)
            
            if (myStem) {
                myStem.close()
                
                this.needToReAlias = true
            }
        },
        
        
        removeRole : function () {
            if (!this.myClass) return
            
            var myStem = this.myClass.meta.stem
            myStem.open()
            
            Joose.A.each(arguments, function (role) {
                if (role.meta.meta.hasAttribute('myClass') && role.meta.myClass) {
                    myStem.removeComposeInfo(role.my.meta.stem)
                    
                    this.needToReAlias = true
                }
            }, this)
            
            myStem.close()
        }
        
    }
    
}).c;
Joose.Namespace = Joose.stub()

Joose.Namespace.Able = new Joose.Managed.Role('Joose.Namespace.Able', {

    have : {
        bodyFunc                : null
    },
    
    
    before : {
        extend : function (extend) {
            if (extend.body) {
                this.bodyFunc = extend.body
                delete extend.body
            }
        }
    },
    
    
    after: {
        
        afterMutate : function () {
            var bodyFunc = this.bodyFunc
            delete this.bodyFunc
            
            if (bodyFunc) Joose.Namespace.Manager.my.executeIn(this.c, bodyFunc)
        }
    }
    
}).c;
Joose.Managed.Bootstrap = new Joose.Managed.Role('Joose.Managed.Bootstrap', {
    
    does   : [ Joose.Namespace.Able, Joose.Managed.My, Joose.Managed.Attribute.Builder ]
    
}).c
;
Joose.Meta = Joose.stub()


Joose.Meta.Object = new Joose.Proto.Class('Joose.Meta.Object', {
    
    isa             : Joose.Proto.Object
    
}).c


;
Joose.Meta.Class = new Joose.Managed.Class('Joose.Meta.Class', {
    
    isa                         : Joose.Managed.Class,
    
    does                        : Joose.Managed.Bootstrap,
    
    have : {
        defaultSuperClass       : Joose.Meta.Object
    }
    
}).c

;
Joose.Meta.Role = new Joose.Meta.Class('Joose.Meta.Role', {
    
    isa                         : Joose.Managed.Role,
    
    does                        : Joose.Managed.Bootstrap
    
}).c;
Joose.Namespace.Keeper = new Joose.Meta.Class('Joose.Namespace.Keeper', {
    
    isa         : Joose.Meta.Class,
    
    have        : {
        externalConstructor             : null
    },
    
    
    methods: {
        
        defaultConstructor: function () {
            
            return function () {
                //constructors should assume that meta is attached to 'arguments.callee' (not to 'this') 
                var thisMeta = arguments.callee.meta
                
                if (thisMeta instanceof Joose.Namespace.Keeper) throw new Error("Module [" + thisMeta.c + "] may not be instantiated. Forgot to 'use' the class with the same name?")
                
                var externalConstructor = thisMeta.externalConstructor
                
                if (typeof externalConstructor == 'function') {
                    
                    externalConstructor.meta = thisMeta
                    
                    return externalConstructor.apply(this, arguments)
                }
                
                throw "NamespaceKeeper of [" + thisMeta.name + "] was planted incorrectly."
            }
        },
        
        
        //withClass should be not constructed yet on this stage (see Joose.Proto.Class.construct)
        //it should be on the 'constructorOnly' life stage (should already have constructor)
        plant: function (withClass) {
            var keeper = this.c
            
            keeper.meta = withClass.meta
            
            keeper.meta.c = keeper
            keeper.meta.externalConstructor = withClass
        }
    }
    
}).c


;
Joose.Namespace.Manager = new Joose.Managed.Class('Joose.Namespace.Manager', {
    
    have : {
        current     : null
    },
    
    
    methods : {
        
        initialize : function () {
            this.current    = [ Joose.top ]
        },
        
        
        getCurrent: function () {
            return this.current[0]
        },
        
        
        executeIn : function (ns, func) {
            var current = this.current
            
            current.unshift(ns)
            var res = func.call(ns, ns)
            current.shift()
            
            return res
        },
        
        
        earlyCreate : function (name, metaClass, props) {
            props.constructorOnly = true
            
            return new metaClass(name, props).c
        },
        
        
        //this function establishing the full "namespace chain" (including the last element)
        create : function (nsName, metaClass, extend) {
            
            //if no name provided, then we creating an anonymous class, so just skip all the namespace manipulations
            if (!nsName) return new metaClass(nsName, extend).c
            
            var me = this
            
            if (/^\./.test(nsName)) return this.executeIn(Joose.top, function () {
                return me.create(nsName.replace(/^\./, ''), metaClass, extend)
            })
            
            var props   = extend || {}
            
            var parts   = Joose.S.saneSplit(nsName, '.')
            var object  = this.getCurrent()
            var soFar   = object == Joose.top ? [] : Joose.S.saneSplit(object.meta.name, '.')
            
            for (var i = 0; i < parts.length; i++) {
                var part        = parts[i]
                var isLast      = i == parts.length - 1
                
                if (part == "meta" || part == "my" || !part) throw "Module name [" + nsName + "] may not include a part called 'meta' or 'my' or empty part."
                
                var cur =   object[part]
                
                soFar.push(part)
                
                var soFarName       = soFar.join(".")
                var needFinalize    = false
                var nsKeeper
                
                // if the namespace segment is empty
                if (typeof cur == "undefined") {
                    if (isLast) {
                        // perform "early create" which just fills the namespace segment with right constructor
                        // this allows us to have a right constructor in the namespace segment when the `body` will be called
                        nsKeeper        = this.earlyCreate(soFarName, metaClass, props)
                        needFinalize    = true
                    } else
                        nsKeeper        = new Joose.Namespace.Keeper(soFarName).c
                    
                    object[part] = nsKeeper
                    
                    cur = nsKeeper
                    
                } else if (isLast && cur && cur.meta) {
                    
                    var currentMeta = cur.meta
                    
                    if (metaClass == Joose.Namespace.Keeper)
                        //`Module` over something case - extend the original
                        currentMeta.extend(props)
                    else {
                        
                        if (currentMeta instanceof Joose.Namespace.Keeper) {
                            
                            currentMeta.plant(this.earlyCreate(soFarName, metaClass, props))
                            
                            needFinalize = true
                        } else
                            throw new Error("Double declaration of [" + soFarName + "]")
                    }
                    
                } else 
                    if (isLast && !(cur && cur.meta && cur.meta.meta)) throw "Trying to setup module " + soFarName + " failed. There is already something: " + cur

                // hook to allow embedd resource into meta
                if (isLast) this.prepareMeta(cur.meta)
                    
                if (needFinalize) cur.meta.construct(props)
                    
                object = cur
            }
            
            return object
        },
        
        
        prepareMeta : function () {
        },
        
        
        prepareProperties : function (name, props, defaultMeta, callback) {
            if (name && typeof name != 'string') {
                props   = name
                name    = null
            }
            
            var meta
            
            if (props && props.meta) {
                meta = props.meta
                delete props.meta
            }
            
            if (!meta)
                if (props && typeof props.isa == 'function' && props.isa.meta)
                    meta = props.isa.meta.constructor
                else
                    meta = defaultMeta
            
            return callback.call(this, name, meta, props)
        },
        
        
        getDefaultHelperFor : function (metaClass) {
            var me = this
            
            return function (name, props) {
                return me.prepareProperties(name, props, metaClass, function (name, meta, props) {
                    return me.create(name, meta, props)
                })
            }
        },
        
        
        register : function (helperName, metaClass, func) {
            var me = this
            
            if (this.meta.hasMethod(helperName)) {
                
                var helper = function () {
                    return me[ helperName ].apply(me, arguments)
                }
                
                if (!Joose.top[ helperName ])   Joose.top[ helperName ]         = helper
                if (!Joose[ helperName ])       Joose[ helperName ]             = helper
                
                if (Joose.is_NodeJS && typeof exports != 'undefined')            exports[ helperName ]    = helper
                
            } else {
                var methods = {}
                
                methods[ helperName ] = func || this.getDefaultHelperFor(metaClass)
                
                this.meta.extend({
                    methods : methods
                })
                
                this.register(helperName)
            }
        },
        
        
        Module : function (name, props) {
            return this.prepareProperties(name, props, Joose.Namespace.Keeper, function (name, meta, props) {
                if (typeof props == 'function') props = { body : props }    
                
                return this.create(name, meta, props)
            })
        }
    }
    
}).c

Joose.Namespace.Manager.my = new Joose.Namespace.Manager()

Joose.Namespace.Manager.my.register('Class', Joose.Meta.Class)
Joose.Namespace.Manager.my.register('Role', Joose.Meta.Role)
Joose.Namespace.Manager.my.register('Module')


// for the rest of the package
var Class       = Joose.Class
var Role        = Joose.Role
;
Role('Joose.Attribute.Delegate', {
    
    have : {
        handles : null
    },
    
    
    override : {
        
        eachDelegate : function (handles, func, scope) {
            if (typeof handles == 'string') return func.call(scope, handles, handles)
            
            if (handles instanceof Array)
                return Joose.A.each(handles, function (delegateTo) {
                    
                    func.call(scope, delegateTo, delegateTo)
                })
                
            if (handles === Object(handles))
                Joose.O.eachOwn(handles, function (delegateTo, handleAs) {
                    
                    func.call(scope, handleAs, delegateTo)
                })
        },
        
        
        getAccessorsFor : function (targetClass) {
            var targetMeta  = targetClass.meta
            var methods     = this.SUPER(targetClass)
            
            var me      = this
            
            this.eachDelegate(this.handles, function (handleAs, delegateTo) {
                
                if (!targetMeta.hasMethod(handleAs)) {
                    var handler = methods[ handleAs ] = function () {
                        var attrValue = me.getValueFrom(this)
                        
                        return attrValue[ delegateTo ].apply(attrValue, arguments)
                    }
                    
                    handler.ACCESSOR_FROM = me
                }
            })
            
            return methods
        },
        
        
        getAccessorsFrom : function (from) {
            var methods = this.SUPER(from)
            
            var me          = this
            var targetMeta  = from.meta
            
            this.eachDelegate(this.handles, function (handleAs) {
                
                var handler = targetMeta.getMethod(handleAs)
                
                if (handler && handler.value.ACCESSOR_FROM == me) methods.push(handleAs)
            })
            
            return methods
        }
    }
})

;
Role('Joose.Attribute.Trigger', {
    
    have : {
        trigger        : null
    }, 

    
    after : {
        initialize : function() {
            if (this.trigger) {
                if (!this.writeable) throw new Error("Can't use `trigger` for read-only attributes")
                
                this.hasSetter = true
            }
        }
    },
    
    
    override : {
        
        getSetter : function() {
            var original    = this.SUPER()
            var trigger     = this.trigger
            
            if (!trigger) return original
            
            var me      = this
            var init    = Joose.O.isFunction(me.init) ? null : me.init
            
            return function () {
                var oldValue    = me.hasValue(this) ? me.getValueFrom(this) : init
                
                var res         = original.apply(this, arguments)
                
                trigger.call(this, me.getValueFrom(this), oldValue)
                
                return res
            }
        }
    }
})    

;
Role('Joose.Attribute.Lazy', {
    
    
    have : {
        lazy        : null
    }, 
    
    
    before : {
        computeValue : function () {
            if (typeof this.init == 'function' && this.lazy) {
                this.lazy = this.init    
                delete this.init    
            }
        }
    },
    
    
    after : {
        initialize : function () {
            if (this.lazy) this.readable = this.hasGetter = true
        }
    },
    
    
    override : {
        
        getGetter : function () {
            var original    = this.SUPER()
            var lazy        = this.lazy
            
            if (!lazy) return original
            
            var me      = this    
            
            return function () {
                if (!me.hasValue(this)) {
                    var initializer = typeof lazy == 'function' ? lazy : this[ lazy.replace(/^this\./, '') ]
                    
                    me.setValueTo(this, initializer.apply(this, arguments))
                }
                
                return original.call(this)    
            }
        }
    }
})

;
Role('Joose.Attribute.Accessor.Combined', {
    
    
    have : {
        isCombined        : false
    }, 
    
    
    after : {
        initialize : function() {
            this.isCombined = this.isCombined || /..c/i.test(this.is)
            
            if (this.isCombined) {
                this.slot = '$$' + this.name
                
                this.hasGetter = true
                this.hasSetter = false
                
                this.setterName = this.getterName = this.publicName
            }
        }
    },
    
    
    override : {
        
        getGetter : function() {
            var getter    = this.SUPER()
            
            if (!this.isCombined) return getter
            
            var setter    = this.getSetter()
            
            var me = this
            
            return function () {
                
                if (!arguments.length) {
                    if (me.readable) return getter.call(this)
                    throw new Error("Call to getter of unreadable attribute: [" + me.name + "]")
                }
                
                if (me.writeable) return setter.apply(this, arguments)
                
                throw new Error("Call to setter of read-only attribute: [" + me.name + "]")    
            }
        }
    }
    
})

;
Joose.Managed.Attribute.meta.extend({
    does : [ Joose.Attribute.Delegate, Joose.Attribute.Trigger, Joose.Attribute.Lazy, Joose.Attribute.Accessor.Combined ]
})            

;
Role('Joose.Meta.Singleton', {
    
    has : {
        forceInstance           : Joose.I.Object,
        instance                : null
    },
    
    
    
    override : {
        
        defaultConstructor : function () {
            var meta        = this
            var previous    = this.SUPER()
            
            this.adaptConstructor(previous)
            
            return function (forceInstance, params) {
                if (forceInstance == meta.forceInstance) return previous.apply(this, params) || this
                
                var instance = meta.instance
                
                if (instance) {
                    if (meta.hasMethod('configure')) instance.configure.apply(instance, arguments)
                } else
                    meta.instance = new meta.c(meta.forceInstance, arguments)
                    
                return meta.instance
            }
        }        
    }
    

})


Joose.Namespace.Manager.my.register('Singleton', Class({
    isa     : Joose.Meta.Class,
    meta    : Joose.Meta.Class,
    
    does    : Joose.Meta.Singleton
}))
;
;
}();;
;
Role('Siesta.Util.Role.CanFormatStrings', {
    
    has     : {
        serializeFormatingPlaceholders      : true
    },
    
    methods : {
        
        formatString: function (string, data) {
            if (!data) return string
            
            var match
            var variables           = []
            var isRaw               = []
            var regexp              = /\{(\!)?((?:\w|-|_)+?)\}/g
            
            while (match = regexp.exec(string)) {
                isRaw.push(match[ 1 ])
                variables.push(match[ 2 ])
            }
            
            var result              = string
            
            Joose.A.each(variables, function (variable, index) {
                var varIsRaw        = isRaw[ index ]
                
                result              = result.replace(
                    new RegExp('\\{' + (varIsRaw ? '!' : '') + variable + '\\}', 'g'), 
                    data.hasOwnProperty(variable) ? 
                        varIsRaw || !this.serializeFormatingPlaceholders ? data[ variable ] + '' : Siesta.Util.Serializer.stringify(data[ variable ]) 
                    : 
                        ''
                )
            }, this)
            
            return result
        }
    }
})
;
(function () {
    var config = {
        idProperty : 'id',

        fields : [
            'id',
            'url',
            'text',
            'reportNode'
        ]
    };
    
    var isSenchaTouch = Ext.getVersion && Ext.getVersion('touch')

    Ext.define(
        'Siesta.Harness.Browser.Model.CoverageUnit',
        
        Ext.apply({
            extend      : 'Ext.data.Model',

            getLineCoverage : function() {
                return this.getCoverageInPercent('lines');
            },

            getStatementCoverage : function() {
                return this.getCoverageInPercent('statements');
            },

            getBranchCoverage : function() {
                return this.getCoverageInPercent('branches');
            },

            getFunctionCoverage : function() {
                return this.getCoverageInPercent('functions');
            },

            getCoverageInPercent : function(type) {
                var node = this.data.reportNode;

                if (node) {
                    return node.metrics[type].pct;
                }
            }
//            ,
            
//            init        : function () {
//                this.internalId = this.getId() || this.internalId
//            },
//    
//            computeFolderStatus : function () {
//                if (!this.childNodes.length) return 'yellow'
//    
//                var isWorking = false
//                var hasFailed = false
//                var allGreen = true
//    
//                Joose.A.each(this.childNodes, function (childNode) {
//    
//                    if (childNode.isLeaf()) {
//                        var test = childNode.get('test')
//    
//                        if (test && test.isFailed()) {
//                            allGreen = false
//                            hasFailed = true
//    
//                            // stop iteration
//                            return false
//                        }
//    
//                        if (!test && childNode.get('isStarting'))    isWorking = true
//                        if (test && !test.isFinished())     isWorking = true
//                        if (test && !test.isPassed())       allGreen = false
//                        if (!test)                          allGreen = false
//    
//                    } else {
//                        var status = childNode.computeFolderStatus()
//    
//                        if (status == 'red') {
//                            allGreen = false
//                            hasFailed = true
//    
//                            // stop iteration
//                            return false
//                        }
//    
//                        if (status == 'working') {
//                            isWorking = true
//    
//                            // stop iteration
//                            return false
//                        }
//    
//                        if (status == 'yellow')         allGreen = false
//                    }
//                })
//    
//                if (isWorking)  return 'working'
//                if (hasFailed)  return 'red'
//                if (allGreen)   return 'green'
//    
//                return 'yellow'
//            },
//    
//    
//            updateFolderStatus : function () {
//                this.set('folderStatus', this.computeFolderStatus())
//    
//                var parentNode = this.parentNode
//    
//                if (parentNode && !parentNode.isRoot()) parentNode.updateFolderStatus()
//            }
        }, isSenchaTouch ? { config : config } : config),
        // eof Ext.apply
        
        function () {
            if (!isSenchaTouch) {
                Ext.data.NodeInterface.decorate(this);
    
                this.override({
                    expand : function () {
                        Ext.suspendLayouts();
                        this.callParent(arguments);
                        Ext.resumeLayouts();
                    }
                });
            }
        }
    )
})();
;
Ext.define("Sch.data.mixin.FilterableTreeStore", {

    isFilteredFlag                      : false,
    isHiddenFlag                        : false,

    // ref to the last filter applied
    lastTreeFilter                      : null,
    lastTreeHiding                      : null,

    /**
     * @cfg {Boolean} allowExpandCollapseWhileFiltered When enabled (by default), tree store allows user to expand/collapse nodes while it is
     * filtered with the {@link #filterTreeBy} method. Please set it explicitly to `false` to restore the previous behavior,
     * where collapse/expand operations were disabled.
     */
    allowExpandCollapseWhileFiltered    : true,

    /**
     * @cfg {Boolean} reApplyFilterOnDataChange When enabled (by default), tree store will update the filtering (both {@link #filterTreeBy}
     * and {@link #hideNodesBy}) after new data is added to the tree or removed from it. Please set it explicitly to `false` to restore the previous behavior,
     * where this feature did not exist.
     */
    reApplyFilterOnDataChange           : true,

    suspendIncrementalFilterRefresh     : 0,

    filterGeneration                    : 0,
    currentFilterGeneration             : null,

    dataChangeListeners                 : null,
    monitoringDataChange                : false,

    onClassMixedIn : function (cls) {
        cls.override(Sch.data.mixin.FilterableTreeStore.prototype.inheritables() || {});
    },

    // Events (private)
    //    'filter-set',
    //    'filter-clear',
    //    'nodestore-datachange-start',
    //    'nodestore-datachange-end'

    /**
     * Should be called in the constructor of the consuming class, to activate the filtering functionality.
     */
    initTreeFiltering : function () {
        this.treeFilter = new Ext.util.Filter({
            filterFn    : this.isNodeFilteredIn,
            scope       : this
        });

        this.dataChangeListeners    = {
            nodeappend  : this.onNeedToUpdateFilter,
            nodeinsert  : this.onNeedToUpdateFilter,

            scope       : this
        };
    },

    startDataChangeMonitoring : function () {
        if (this.monitoringDataChange) return;

        this.monitoringDataChange   = true;

        this.on(this.dataChangeListeners);
    },


    stopDataChangeMonitoring : function () {
        if (!this.monitoringDataChange) return;

        this.monitoringDataChange   = false;

        this.un(this.dataChangeListeners);
    },


    onNeedToUpdateFilter : function () {
        if (this.reApplyFilterOnDataChange && !this.suspendIncrementalFilterRefresh) this.reApplyFilter();
    },


    /**
     * Clears the current filter (if any).
     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     */
    clearTreeFilter : function () {
        if (!this.isTreeFiltered()) return;

        this.currentFilterGeneration = null;
        this.isFilteredFlag     = false;
        this.lastTreeFilter     = null;

        if (!this.isTreeFiltered(true)) this.stopDataChangeMonitoring();

        this.refreshNodeStoreContent();

        this.fireEvent('filter-clear', this);
    },


    reApplyFilter : function () {
        // bypass the nodeStore content refresh if store has both hiding and filtering
        if (this.isHiddenFlag) this.hideNodesBy.apply(this, this.lastTreeHiding.concat(this.isFilteredFlag));

        if (this.isFilteredFlag) this.filterTreeBy(this.lastTreeFilter);
    },


    refreshNodeStoreContent : function () {
        var me      = this,
            filters = me.getFilters();

        if (filters.indexOf(me.treeFilter) < 0) {
            me.addFilter(me.treeFilter);
        } else {
            this.getFilters().fireEvent('endupdate', this.getFilters());
        }
    },


    getIndexInTotalDataset : function (record) {
        var root            = this.getRootNode(),
            index           = -1;

        var rootVisible     = this.rootVisible;

        if (!rootVisible && record == root) return -1;

        var isFiltered      = this.isTreeFiltered();
        var currentFilterGeneration = this.currentFilterGeneration;

        var collectNodes    = function (node) {
            if (isFiltered && node.__filterGen != currentFilterGeneration || node.hidden)
            // stop scanning if record we are looking for is hidden
                if (node == record) return false;

            if (rootVisible || node != root) index++;

            // stop scanning if we found the record
            if (node == record) return false;

            if (!node.data.leaf && node.isExpanded()) {
                var childNodes  = node.childNodes,
                    length      = childNodes.length;

                for (var k = 0; k < length; k++)
                    if (collectNodes(childNodes[ k ]) === false) return false;
            }
        };

        collectNodes(root);

        return index;
    },

    /**
     * Returns true if this store is currently filtered
     *
     * @return {Boolean}
     */
    isTreeFiltered : function (orHasHiddenNodes) {
        return this.isFilteredFlag || orHasHiddenNodes && this.isHiddenFlag;
    },

    markFilteredNodes : function (top, params) {
        var me                  = this;
        var filterGen           = this.currentFilterGeneration;
        var visibleNodes        = {};

        var root                = this.getRootNode(),
            rootVisible         = this.rootVisible;

        var includeParentNodesInResults = function (node) {
            var parent  = node.parentNode;

            while (parent && !visibleNodes[ parent.internalId ]) {
                visibleNodes[ parent.internalId ] = true;

                parent = parent.parentNode;
            }
        };

        var filter                  = params.filter;
        var scope                   = params.scope || this;
        var shallowScan             = params.shallow;
        var checkParents            = params.checkParents || shallowScan;
        var fullMatchingParents     = params.fullMatchingParents;
        var onlyParents             = params.onlyParents || fullMatchingParents;

        if (onlyParents && checkParents) throw new Error("Can't combine `onlyParents` and `checkParents` options");

        if (rootVisible) visibleNodes[ root.internalId ] = true;

        var collectNodes    = function (node) {
            if (node.hidden) return;

            var nodeMatches, childNodes, length, k;

            // `collectNodes` should not be called for leafs at all
            if (node.data.leaf) {
                if (filter.call(scope, node, visibleNodes)) {
                    visibleNodes[ node.internalId ] = true;

                    includeParentNodesInResults(node);
                }
            } else {
                if (onlyParents) {
                    nodeMatches     = filter.call(scope, node);

                    childNodes      = node.childNodes;
                    length          = childNodes.length;

                    if (nodeMatches) {
                        visibleNodes[ node.internalId ] = true;

                        includeParentNodesInResults(node);

                        // if "fullMatchingParents" option enabled we gather all matched parent's sub-tree
                        if (fullMatchingParents) {
                            node.cascadeBy(function (currentNode) {
                                visibleNodes[ currentNode.internalId ] = true;
                            });

                            return;
                        }
                    }

                    // at this point nodeMatches and fullMatchingParents can't be both true
                    for (k = 0; k < length; k++)
                        if (nodeMatches && childNodes[ k ].data.leaf)
                            visibleNodes[ childNodes[ k ].internalId ] = true;
                        else if (!childNodes[ k ].data.leaf)
                            collectNodes(childNodes[ k ]);

                } else {
                    // mark matching nodes to be kept in results
                    if (checkParents) {
                        nodeMatches = filter.call(scope, node, visibleNodes);

                        if (nodeMatches) {
                            visibleNodes[ node.internalId ] = true;

                            includeParentNodesInResults(node);
                        }
                    }

                    // recurse if
                    // - we don't check parents
                    // - shallow scan is not enabled
                    // - shallow scan is enabled and parent node matches the filter or it does not, but its and invisible root, so we don't care
                    if (!checkParents || !shallowScan || shallowScan && (nodeMatches || node == root && !rootVisible)) {
                        childNodes      = node.childNodes;
                        length          = childNodes.length;

                        for (k = 0; k < length; k++) collectNodes(childNodes[ k ]);
                    }
                }
            }
        };

        collectNodes(top);

        // additional filtering of the result set
        // removes parent nodes which do not match filter themselves and have no matching children


        root.cascadeBy(function (node) {
            if (visibleNodes[ node.internalId ]) {
                node.__filterGen = filterGen;

                if (me.allowExpandCollapseWhileFiltered && !node.data.leaf) node.expand();
            }
        });

    },


    /**
     * This method filters the tree store. It accepts an object with the following properties:
     *
     * - `filter` - a function to check if a node should be included in the result. It will be called for each **leaf** node in the tree and will receive the current node as the first argument.
     * It should return `true` if the node should remain visible, `false` otherwise. The result will also contain all parents nodes of all matching leafs. Results will not include
     * parent nodes, which do not have at least one matching child.
     * To call this method for parent nodes too, pass an additional parameter - `checkParents` (see below).
     * - `scope` - a scope to call the filter with (optional)
     * - `checkParents` - when set to `true` will also call the `filter` function for each parent node. If the function returns `false` for some parent node,
     * it could still be included in the filtered result if some of its children match the `filter` (see also "shallow" option below). If the function returns `true` for a parent node, it will be
     * included in the filtering results even if it does not have any matching child nodes.
     * - `shallow` - implies `checkParents`. When set to `true`, it will stop checking child nodes if the `filter` function return `false` for a parent node. The whole sub-tree, starting
     * from a non-matching parent, will be excluded from the result in such case.
     * - `onlyParents` - alternative to `checkParents`. When set to `true` it will only call the provided `filter` function for parent tasks. If
     * the filter returns `true`, the parent and all its direct child leaf nodes will be included in the results. If the `filter` returns `false`, a parent node still can
     * be included in the results (w/o direct children leafs), if some of its child nodes matches the filter.
     * - `fullMatchingParents` - implies `onlyParents`. In this mode, if a parent node matches the filter, then not only its direct children
     * will be included in the results, but the whole sub-tree, starting from the matching node.
     *
     * Repeated calls to this method will clear previous filters.
     *
     * This function can be also called with 2 arguments, which should be the `filter` function and `scope` in such case.
     *
     * For example:

     treeStore.filterTreeBy({
        filter          : function (node) { return node.get('name').match(/some regexp/) },
        checkParents    : true
    })

     // or, if you don't need to set any options:
     treeStore.filterTreeBy(function (node) { return node.get('name').match(/some regexp/) })

     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     *
     * @param {Object} params
     */
    filterTreeBy : function (params, scope) {
        this.currentFilterGeneration = this.filterGeneration++;

        var filter;

        if (arguments.length == 1 && Ext.isObject(arguments[ 0 ])) {
            scope       = params.scope;
            filter      = params.filter;
        } else {
            filter      = params;
            params      = { filter : filter, scope : scope };
        }

        this.fireEvent('nodestore-datachange-start', this);

        params                      = params || {};

        this.markFilteredNodes(this.getRootNode(), params);

        this.startDataChangeMonitoring();

        this.isFilteredFlag     = true;
        this.lastTreeFilter     = params;

        this.refreshNodeStoreContent();
        
        this.fireEvent('nodestore-datachange-end', this);

        this.fireEvent('filter-set', this);
    },


    isNodeFilteredIn : function (node) {
        var isFiltered              = this.isTreeFiltered();
        var currentFilterGeneration = this.currentFilterGeneration;

        return this.loading || !Boolean(isFiltered && node.__filterGen != currentFilterGeneration || node.hidden);
    },


    hasNativeFilters : function () {
        var me      = this,
            filters = me.getFilters(),
            count   = filters.getCount();

        return (count && count > 1) || filters.indexOf(me.treeFilter) < 0;
    },


    /**
     * Hide nodes from the visual presentation of tree store (they still remain in the store).
     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     *
     * @param {Function} filter - A filtering function. Will be called for each node in the tree store and receive
     * the current node as the 1st argument. Should return `true` to **hide** the node
     * and `false`, to **keep it visible**.
     * @param {Object} scope (optional).
     */
    hideNodesBy : function (filter, scope, skipNodeStoreRefresh) {
        var me      = this;

        if (me.isFiltered() && me.hasNativeFilters()) throw new Error("Can't hide nodes of the filtered tree store");

        scope       = scope || me;

        me.getRootNode().cascadeBy(function (node) {
            node.hidden = Boolean(filter.call(scope, node, me));
        });

        me.startDataChangeMonitoring();

        me.isHiddenFlag     = true;
        me.lastTreeHiding   = [ filter, scope ];

        if (!skipNodeStoreRefresh) me.refreshNodeStoreContent();
    },


    /**
     * Shows all nodes that was previously hidden with {@link #hideNodesBy}
     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     */
    showAllNodes : function (skipNodeStoreRefresh) {
        this.getRootNode().cascadeBy(function (node) {
            node.hidden     = false;
        });

        this.isHiddenFlag       = false;
        this.lastTreeHiding     = null;

        if (!this.isTreeFiltered(true)) this.stopDataChangeMonitoring();

        if (!skipNodeStoreRefresh) this.refreshNodeStoreContent();
    },


    inheritables : function () {
        return {
            // @OVERRIDE
            onNodeExpand: function (parent, records, suppressEvent) {
                if (this.isTreeFiltered(true) && parent == this.getRoot()) {
                    this.callParent(arguments);
                    // the expand of the root node - most probably its the data loading
                    this.reApplyFilter();
                } else
                    return this.callParent(arguments);
            },

            // @OVERRIDE
            onNodeCollapse: function (parent, records, suppressEvent, callback, scope) {
                var me                      = this;
                var data                    = me.data;
                var prevContains            = data.contains;

                var isFiltered              = me.isTreeFiltered();
                var currentFilterGeneration = me.currentFilterGeneration;

                // the default implementation of `onNodeCollapse` only checks if the 1st record from collapsed nodes
                // exists in the node store. Meanwhile, that 1st node can be hidden, so we need to check all of them
                // thats what we do in the `for` loop below
                // then, if we found a node, we want to do actual removing of nodes and we override the original code from NodeStore
                // by always returning `false` from our `data.contains` override
                data.contains           = function () {
                    var node, sibling, lastNodeIndexPlus;

                    var collapseIndex   = me.indexOf(parent) + 1;
                    var found           = false;

                    for (var i = 0; i < records.length; i++)
                        if (
                            !(records[ i ].hidden || isFiltered && records[ i ].__filterGen != currentFilterGeneration) &&
                            prevContains.call(this, records[ i ])
                        ) {
                            // this is our override for internal part of `onNodeCollapse` method

                            // Calculate the index *one beyond* the last node we are going to remove
                            // Need to loop up the tree to find the nearest view sibling, since it could
                            // exist at some level above the current node.
                            node = parent;
                            while (node.parentNode) {
                                sibling = node;
                                do {
                                    sibling = sibling.nextSibling;
                                } while (sibling && (sibling.hidden || isFiltered && sibling.__filterGen != currentFilterGeneration));

                                if (sibling) {
                                    found = true;
                                    lastNodeIndexPlus = me.indexOf(sibling);
                                    break;
                                } else {
                                    node = node.parentNode;
                                }
                            }
                            if (!found) {
                                lastNodeIndexPlus = me.getCount();
                            }

                            // Remove the whole collapsed node set.
                            me.removeAt(collapseIndex, lastNodeIndexPlus - collapseIndex);

                            break;
                        }

                    // always return `false`, so original NodeStore code won't execute
                    return false;
                };

                this.callParent(arguments);

                data.contains           = prevContains;
            },

            // @OVERRIDE
            handleNodeExpand : function (parent, records, toAdd) {
                var me                      = this;
                var visibleRecords          = [];
                var isFiltered              = me.isTreeFiltered();
                var currentFilterGeneration = me.currentFilterGeneration;

                for (var i = 0; i < records.length; i++) {
                    var record          = records[ i ];

                    if (
                        !(isFiltered && record.__filterGen != currentFilterGeneration || record.hidden)
                    ) {
                        visibleRecords[ visibleRecords.length ] = record;
                    }
                }

                return this.callParent([ parent, visibleRecords, toAdd ]);
            },

            // @OVERRIDE
            onNodeInsert: function(parent, node, index) {
                var me = this,
                    refNode,
                    sibling,
                    storeReader,
                    nodeProxy,
                    nodeReader,
                    reader,
                    data = node.raw || node.data,
                    dataRoot,
                    isVisible,
                    childType;

                if (me.filterFn) {
                    isVisible = me.filterFn(node);
                    node.set('visible', isVisible);

                    // If a node which passes the filter is added to a parent node
                    if (isVisible) {
                        parent.set('visible', me.filterFn(parent));
                    }
                }

                // Register node by its IDs
                me.registerNode(node, true);

                me.beginUpdate();

                // Only react to a node append if it is to a node which is expanded.
                if (me.isVisible(node)) {
                    if (index === 0 || !node.previousSibling) {
                        refNode = parent;
                    } else {
                        // Find the previous visible sibling (filtering may have knocked out intervening nodes)
                        for (sibling = node.previousSibling; sibling && !sibling.get('visible'); sibling = sibling.previousSibling);
                        if (!sibling) {
                            refNode = parent;
                        } else {
                            while (sibling.isExpanded() && sibling.lastChild) {
                                sibling = sibling.lastChild;
                            }
                            refNode = sibling;
                        }
                    }

                    // The reaction to collection add joins the node to this Store
                    me.insert(me.indexOf(refNode) + 1, node);
                    if (!node.isLeaf() && node.isExpanded()) {
                        if (node.isLoaded()) {
                            // Take a shortcut
                            me.onNodeExpand(node, node.childNodes);
                        } else if (!me.fillCount) {
                            // If the node has been marked as expanded, it means the children
                            // should be provided as part of the raw data. If we're filling the nodes,
                            // the children may not have been loaded yet, so only do this if we're
                            // not in the middle of populating the nodes.
                            node.set('expanded', false);
                            node.expand();
                        }
                    }
                }

                // Set sync flag if the record needs syncing.
                else {
                    me.needsSync = me.needsSync || node.phantom || node.dirty;
                }

                if (!node.isLeaf() && !node.isLoaded() && !me.lazyFill) {
                    // With heterogeneous nodes, different levels may require differently configured readers to extract children.
                    // For example a "Disk" node type may configure it's proxy reader with root: 'folders', while a "Folder" node type
                    // might configure its proxy reader with root: 'files'. Or the root property could be a configured-in accessor.
                    storeReader = me.getProxy().getReader();
                    nodeProxy = node.getProxy();
                    nodeReader = nodeProxy ? nodeProxy.getReader() : null;

                    // If the node's reader was configured with a special root (property name which defines the children array) use that.
                    reader = nodeReader && nodeReader.initialConfig.rootProperty ? nodeReader : storeReader;

                    dataRoot = reader.getRoot(data);
                    if (dataRoot) {
                        childType = node.childType;
                        me.fillNode(node, reader.extractData(dataRoot, childType ? {
                            model: childType
                        } : undefined));
                    }
                }
                me.endUpdate();
            },

            isFiltered : function () {
                return this.callParent(arguments) || this.isTreeFiltered();
            }
        };
    }

});
;
Ext.define('Siesta.Harness.Browser.Model.FilterableTreeStore', {
    extend          : 'Ext.data.TreeStore',

    mixins          : [
        'Sch.data.mixin.FilterableTreeStore'
    ],

    constructor     : function () {
        this.callParent(arguments)
        
        this.initTreeFiltering()
    },

    forEach : function(fn, scope) {
        this.getRootNode().cascadeBy(fn, scope);
    }
});
// !XXX when adding new methods to this mixing need to also update the 
// `setupLockableTree` method in the Sch.mixin.Lockable
Ext.define("Sch.mixin.FilterableTreeView", {
    
    filterableTreeStore             : null,
    treeStoreFilteringListeners     : null,
    
    
    initTreeFiltering : function () {
        this.treeStoreFilteringListeners = {
            'nodestore-datachange-start'        : this.onFilterChangeStart,
            'nodestore-datachange-end'          : this.onFilterChangeEnd,
            
            'filter-clear'                      : this.onFilterCleared,
            'filter-set'                        : this.onFilterSet,
            'forcedrefresh'                     : this.onForcedRefresh,
            
            scope                               : this
        }
        
        var doInit  = function () {
            var treeStore       = this.up('tablepanel').store;

            this.bindFilterableTreeStore(treeStore)
        };
        
        if (this.rendered)
            doInit.call(this);
        else
            this.on('beforerender', doInit, this, { single : true });
    },
    
    
    bindFilterableTreeStore : function (store) {
        if (this.filterableTreeStore) this.mun(this.filterableTreeStore, this.treeStoreFilteringListeners)
        
        this.filterableTreeStore        = store
        
        if (store) this.mon(store, this.treeStoreFilteringListeners)
    },
    
    
    onForcedRefresh : function () {
        this.focusRow       = function () {}
        
        this.refresh()
        
        delete this.focusRow
    },
    
    
    onFilterChangeStart : function () {
        Ext.suspendLayouts();
    },
    
    
    onFilterChangeEnd : function () {
        Ext.resumeLayouts(true);
    },
    
    
    onFilterCleared : function () {
    },
    
    
    onFilterSet : function () {
    }
});;
Ext.define('Siesta.Harness.Browser.UI.FilterableTreeView', {
    extend          : 'Ext.tree.View',
    alias           : 'widget.filterabletreeview',
    
    mixins          : [
        'Sch.mixin.FilterableTreeView'
    ],
    
    
    constructor     : function () {
        this.callParent(arguments)
        
        this.initTreeFiltering()
    },
    
    
    bindStore : function (store, initial, propName) {
        if (store instanceof Ext.data.TreeStore) {
            this.bindFilterableTreeStore(store)
            
            this.callParent([ store.nodeStore || store, initial, propName ])
        } else
            this.callParent(arguments)
    }
})
;
Ext.define('Siesta.Harness.Browser.UI.TreeFilterField', {
    extend : 'Ext.form.field.Text',
    alias  : 'widget.treefilter',

    filterGroups : false,
    cls          : 'filterfield',

    store : null,

    filterField : 'text',

    hasAndCheck     : null,
    andChecker      : null,
    andCheckerScope : null,

    triggerLeafCls  : 'icon-file-2',
    triggerGroupCls : 'icon-folder',
    tipText         : null,

    constructor : function (config) {
        var me = this;

        Ext.apply(config, {
            triggers : {
                clear : {
                    cls     : 'icon-close',
                    handler : function () {
                        me.store.clearTreeFilter()
                        me.reset()
                    }
                },

                leafOrGroup : {
                    cls     : me.triggerLeafCls,
                    handler : function () {
                        me.setFilterGroups(!me.getFilterGroups())
                    }
                }
            },

            listeners : {
                change     : {
                    fn         : this.onFilterChange,
                    buffer     : 400,
                    scope      : this
                },

                specialkey : this.onFilterSpecialKey,
                scope      : this
            }
        })

        this.callParent(arguments);
    },


    afterRender : function () {
        this.callParent(arguments)

        this.tipText && this.inputEl.set({ title : this.tipText })

        if (this.filterGroups) {
            this.triggerEl.item(1).addCls(this.triggerGroupCls)
            this.triggerEl.item(1).removeCls(this.triggerLeafCls)
        }
    },


    onFilterSpecialKey : function (field, e, t) {
        if (e.keyCode === e.ESC) {
            this.store.clearTreeFilter()
            field.reset();
        }
    },


    setFilterGroups : function (value) {
        if (value != this.filterGroups) {
            this.filterGroups = value

            if (this.rendered) {
                var el = this.triggerEl.item(1)

                if (value) {
                    el.addCls(this.triggerGroupCls)
                    el.removeCls(this.triggerLeafCls)
                } else {
                    el.removeCls(this.triggerGroupCls)
                    el.addCls(this.triggerLeafCls)
                }
            }

            this.refreshFilter()

            this.fireEvent('filter-group-change', this)
        }
    },


    getFilterGroups : function () {
        return this.filterGroups
    },


    refreshFilter : function () {
        this.onFilterChange(this, this.getValue())
    },
    
    
    // split term by | first, then by whitespace
    splitTermByPipe : function (term) {
        var parts           = term.split(/\s*\|\s*/);
        var regexps         = []

        for (var i = 0; i < parts.length; i++) {
            // ignore empty
            if (parts[ i ]) {
                regexps.push(
                    Ext.Array.map(parts[ i ].split(/\s+/), function (token) {
                        return new RegExp(Ext.String.escapeRegex(token), 'i')
                    })
                )
            }
        }
        
        return regexps
    },
    
    
    matchAnyOfRegExps : function (string, regexps) {
        for (var p = 0; p < regexps.length; p++) {
            var groupMatch  = true
            var len         = regexps[ p ].length

            // blazing fast "for" loop! :)
            for (var i = 0; i < len; i++)
                if (!regexps[ p ][ i ].test(string)) {
                    groupMatch = false
                    break
                }

            if (groupMatch) return true
        }
        
        return false
    },


    onFilterChange : function (field, filterValue) {
        if (filterValue || this.hasAndCheck && this.hasAndCheck()) {
            var fieldName       = this.filterField

            var parts, groupFilter
            var filterGroups    = this.filterGroups
            
            if (!filterGroups) {
                parts           = filterValue.split(/\s*\>\s*/)
                groupFilter     = parts.length > 1 ? parts[ 0 ] : ''
                filterValue     = parts.length > 1 ? parts[ 1 ] : parts[ 0 ]
            }

            parts               = filterValue.split(/\s*\|\s*/);
            
            var testFilterRegexps   = this.splitTermByPipe(filterValue)
            var groupFilterRegexps  = groupFilter ? this.splitTermByPipe(groupFilter) : null
            
            var andChecker          = this.andChecker
            var andCheckerScope     = this.andCheckerScope || this
            
            var me                  = this

            this.store.filterTreeBy({
                filter               : function (node) {
                    if (andChecker && !andChecker.call(andCheckerScope, node)) return false

                    if (!filterGroups && groupFilter) {
                        var currentNode     = node
                        var isInGroup       = false

                        while (currentNode && currentNode.parentNode) {
                            var parent      = currentNode.parentNode

                            if (me.matchAnyOfRegExps(parent.get(fieldName), groupFilterRegexps)) {
                                isInGroup   = true
                                break
                            }

                            currentNode     = parent
                        }

                        if (!isInGroup) return false
                    }

                    var title   = node.get(fieldName)
                    
                    if (me.matchAnyOfRegExps(title, testFilterRegexps)) return true

                    // if there's no name filtering testFilterRegexps - return true (show all elements)
                    return !testFilterRegexps.length
                },
                fullMatchingParents : filterGroups
            })
        } else {
            this.store.clearTreeFilter()
        }
    }
})
;
Ext.define('Siesta.Harness.Browser.UI.CoverageChart', {
    extend : 'Ext.chart.Chart',
    alias  : 'widget.coveragechart',

    margin  : '35% 35%',
    animate : {
        easing   : 'bounceOut',
        duration : 600
    },

    store : {
        stype  : 'jsonstore',
        fields : ['name', 'value']
    },

    gradients : [
        {
            'id'    : 'v-1',
            'angle' : 0,
            stops   : {
                0   : {
                    color : 'rgb(212, 40, 40)'
                },
                100 : {
                    color : 'rgb(188, 35, 35)'
                }
            }
        },
        {
            'id'    : 'v-2',
            'angle' : 0,
            stops   : {
                0   : {
                    color : 'rgb(180, 216, 42)'
                },
                100 : {
                    color : 'rgb(168, 185, 35)'
                }
            }
        },
        {
            'id'    : 'v-3',
            'angle' : 0,
            stops   : {
                0   : {
                    color : 'rgb(43, 221, 115)'
                },
                100 : {
                    color : 'rgb(33, 190, 100)'
                }
            }
        },
        {
            'id'    : 'v-4',
            'angle' : 0,
            stops   : {
                0   : {
                    color : 'rgb(45, 117, 226)'
                },
                100 : {
                    color : 'rgb(38, 104, 190)'
                }
            }
        }
    ],

    axes : [
        {
            type     : 'Numeric',
            position : 'left',
            fields   : ['value'],
            minimum  : 0,
            maximum  : 100,
            label    : {
                renderer : Ext.util.Format.numberRenderer('0'),
                fill     : '#555'
            },
            grid     : {
                odd  : {
                    stroke : '#efefef'
                },
                even : {
                    stroke : '#efefef'
                }
            }
        },
        {
            type     : 'Category',
            position : 'bottom',
            fields   : ['name'],
            label    : {
                fill : '#555'
            }
        }
    ],

    series : [{
        type     : 'column',
        axis     : 'left',
        yField   : 'value',
        colors : ['url(#v-1)', 'url(#v-2)', 'url(#v-3)', 'url(#v-4)', 'url(#v-5)'],

        label    : {
            display       : 'outside',
            'text-anchor' : 'middle',
            field         : 'value',
            orientation   : 'horizontal',
            fill          : '#aaa',
            renderer      : function (value, label, storeItem, item, i, display, animate, index) {
                return value + '%';
            }
        },

        renderer : function (sprite, storeItem, barAttr, i, store) {
            barAttr.fill = this.colors[i % this.colors.length];
            return barAttr;
        }
    }]
});;
Ext.define('Siesta.Harness.Browser.UI.CoverageReport', {
    extend : 'Ext.Container',
    alias  : 'widget.coveragereport',

    requires : [
        'Ext.tree.Panel',

        'Siesta.Harness.Browser.UI.TreeFilterField',
        'Siesta.Harness.Browser.UI.CoverageChart'
    ],

    cls    : 'st-cov-report-panel',
    layout : 'border',

    htmlReport       : null,
    treePanel        : null,
    treeStore        : null,
    chart            : null,
    sourcePanel      : null,
    contentContainer : null,
    toggleButtons    : null,
    standalone       : false,
    dataUrl          : null,
    harness          : null,

    // Number of levels in the coverage class/file tree to expand by default
    expandLevels : 2,

    initComponent : function () {
        var me = this
        var standalone = this.standalone

        var store = this.treeStore = new Siesta.Harness.Browser.Model.FilterableTreeStore({
            model       : 'Siesta.Harness.Browser.Model.CoverageUnit',
            proxy       : 'memory',
            rootVisible : true
        })

        Ext.apply(this, {

            border : !this.standalone,
            items  : [
                {
                    xtype              : 'treepanel',
                    border             : false,
                    region             : 'west',
                    enableColumnHide   : false,
                    enableColumnMove   : false,
                    enableColumnResize : false,
                    sortableColumns    : false,
                    rowLines           : false,
                    tbar               : {
                        cls    : 'siesta-toolbar',
                        height : 45,
                        border : false,
                        items  : [
                            standalone ? null : {
                                text    : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'closeText'),
                                scale   : 'medium',
                                style   : 'margin:0 10px 0 0;',
                                handler : this.onBackToMainUI,
                                scope   : this
                            },
                            {
                                xtype           : 'treefilter',
                                cls             : 'filterfield',
                                hasAndCheck     : function () {
                                    var states = Ext.pluck(me.toggleButtons, 'pressed')

                                    return !states[0] || !states[1] || !states[2]
                                },
                                andChecker      : this.levelFilter,
                                andCheckerScope : this,
                                margin          : '3 0 0 0',
                                store           : store,
                                filterField     : 'text',
                                width           : 180
                            },
                            '->',
                            {
                                xtype  : 'label',
                                text   : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'showText'),
                                margin : '0 5 0 0'
                            },
                            {
                                text          : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'highText'),
                                level         : 'high',
                                enableToggle  : true,
                                pressed       : true,
                                scale         : 'medium',
                                cls           : 'st-cov-level-high',
                                toggleHandler : this.toggleLevels,
                                scope         : this,
                                margin        : '0 5 0 0'
                            },
                            {
                                text          : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'mediumText'),
                                level         : 'med',
                                enableToggle  : true,
                                scale         : 'medium',
                                pressed       : true,
                                cls           : 'st-cov-level-medium',
                                toggleHandler : this.toggleLevels,
                                scope         : this,
                                margin        : '0 5 0 0'
                            },
                            {
                                text          : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'lowText'),
                                level         : 'low',
                                enableToggle  : true,
                                scale         : 'medium',
                                pressed       : true,
                                cls           : 'st-cov-level-low',
                                toggleHandler : this.toggleLevels,
                                scope         : this,
                                style         : 'margin:0 5px 0 0'
                            }
                        ]
                    },

                    viewType   : 'filterabletreeview',
                    viewConfig : {
                        store       : store.nodeStore,
                        trackOver   : false,
                        rootVisible : true
                    },

                    cls : 'st-cov-report-tree-panel',

                    flex        : 1,
                    split       : true,
                    rootVisible : true,

                    columns : [
                        {
                            xtype        : 'treecolumn',
                            dataIndex    : 'text',
                            menuDisabled : true,
                            flex         : 3
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'statementsText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('statements')
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'branchesText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('branches')
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'functionsText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('functions')
                        },
                        {
                            text         : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'linesText'),
                            flex         : 1,
                            menuDisabled : true,
                            tdCls        : 'cov-result-cell',
                            renderer     : this.getMetricsRenderer('lines')
                        }
                    ],

                    store : store,

                    listeners : {
                        selectionchange : this.onClassSelected,
                        scope     : this
                    }
                },
                {
                    xtype  : 'container',
                    cls    : 'coveragechart-container',
                    slot   : 'contentContainer',
                    region : 'center',
                    layout : {
                        type                : 'card',
                        deferredRendering   : true
                    },

                    items : [
                        {
                            xtype : 'coveragechart'
                        },
                        {
                            xtype       : 'panel',
                            slot        : 'sourcePanel',
                            flex        : 1,
                            autoScroll  : true,
                            bodyPadding : '4 0 4 10',
                            border      : false,
                            cls         : 'st-cov-report-source-panel'
                        }
                    ]

                }
            ]
        })

        this.callParent()

        this.contentContainer = this.down('[slot=contentContainer]')
        this.chart            = this.down('chart')
        this.sourcePanel      = this.down('[slot=sourcePanel]')
        this.toggleButtons    = this.query('button[level]')
        this.treePanel        = this.down('treepanel')

        if (standalone) {
            // `loadingMask.show()` throws exception when called with non-rendered target
            this.on('afterrender', function () {
                var loadingMask = new Ext.LoadMask({
                    target : this,
                    msg    : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'loadingText')
                });

                loadingMask.show()

//                use this code for testing
//                setTimeout(function () {
//                    loadingMask.hide()
//                    
//                    me.loadHtmlReport(me.htmlReport)
//                }, 2000)

                Ext.Ajax.request({
                    url : this.dataUrl,

                    success : function (response) {
                        loadingMask.hide()
                        me.loadHtmlReport(Ext.JSON.decode(response.responseText))
                    },

                    failure : function () {
                        loadingMask.hide()
                        Ext.Msg.show({
                            title   : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'loadingErrorText'),
                            msg     : Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'loadingErrorMessageText') + me.dataUrl,
                            buttons : Ext.MessageBox.OK,
                            icon    : Ext.MessageBox.ERROR
                        })
                    }
                })
            }, this, { single : true })
        } else if (this.htmlReport) {
            this.loadHtmlReport(this.htmlReport);
        }

        // Refresh data is user reruns a test with coverage panel open
        if (this.harness) {
            this.harness.on('testsuiteend', this.onTestSuiteEnd, this)
        }
    },

    onTestSuiteEnd : function (descriptors) {

        if (this.harness && this.isVisible()) {
            // Load new data into coverage report
            this.loadHtmlReport(this.harness.generateCoverageHtmlReport(false));
        }
    },

    loadHtmlReport : function (report) {
        this.htmlReport = report

        var treeStore = this.treeStore
        var isFile = report.coverageUnit == 'file'
        var treeFilter = this.down('treefilter')
        var selModel = this.treePanel.getSelectionModel();
        var selected = selModel.getSelected();
        var oldSelectedId = selected.length > 0 ? selected.first().getId() : null;

        treeStore.setRootNode(this.generateFilesTree(report.htmlReport.root))

        if (oldSelectedId && treeStore.getNodeById(oldSelectedId)){
            selModel.select(treeStore.getNodeById(oldSelectedId));
        }

        this.down('treecolumn').setText(isFile ? 'File name' : 'Class name')

        treeFilter.emptyText = isFile ? 'Filter files' : 'Filter classes'

        treeFilter.applyEmptyText();

        this.loadChartData(treeStore.getRootNode());
    },


    levelFilter : function (node) {
        var coverage = node.getStatementCoverage();

        if (coverage === undefined) return false;

        return this.toggleButtons[coverage >= 80 ? 0 : coverage >= 50 ? 1 : 2].pressed
    },


    toggleLevels : function () {
        this.down('treefilter').refreshFilter()
    },


    getCoverageLevelClass : function (coveragePct) {
        if (typeof coveragePct == 'number')
            return 'st-cov-level-' + (coveragePct >= 80 ? 'high' : coveragePct >= 50 ? 'medium' : 'low');
        else
            return ''
    },


    getMetricsRenderer : function (property) {
        var me = this

        return function (value, metaData, preloadFile) {
            var reportNode = preloadFile.get('reportNode')
            if (!reportNode) return ''

            var metrics = reportNode.metrics[property]

            metaData.tdCls = me.getCoverageLevelClass(metrics.pct)

            return '<span class="st-cov-stat-pct-' + property + '">' + Math.round(metrics.pct) + '%</span> ' +
                '<span class="st-cov-stat-abs-' + property + '">(' + metrics.covered + '/' + metrics.total + ')</span>'
        }
    },


    generateFilesTree : function (node, depth) {
        var me = this
        depth = depth || 0;

        // in this method "node" should be treated as a raw JSON object and not an instance of Node from Istanbul
        // (even that in UI usage scenario it will be a Node)
        // since for the standalone report we load a JSON blob with the tree report
        // so we should not call any methods on "node"
        if (node.kind === 'dir') {
            var text = node.relativeName || node.fullName

            return {
                id       : node.fullName,
                url      : node.fullName,
                leaf     : false,
                expanded : depth < this.expandLevels,

                text : text == '/' && this.htmlReport.coverageUnit == 'extjs_class' ? Siesta.Resource('Siesta.Harness.Browser.UI.CoverageReport', 'globalNamespaceText') : text,

                reportNode : node,

                children : Ext.Array.map(node.children, function (childNode) {
                    return me.generateFilesTree(childNode, depth + 1)
                }).sort(this.treeSorterFn)
            }
        } else {
            return {
                id   : node.fullName,
                url  : node.fullName,
                leaf : true,

                text : node.relativeName,

                reportNode : node
            }
        }
    },

    treeSorterFn : function (node1, node2) {
        if (!node1.leaf && node2.leaf) return -1;

        if (node1.leaf && !node2.leaf) return 1;

        if (node1.leaf === node2.leaf) return node1.text < node2.text ? -1 : 1;
    },

    onClassSelected : function (view, records) {
        var record = records[0];

        if (!record) return;

        if (record.isLeaf() && !this.htmlReport.coverageNoSource) {
            this.sourcePanel.update(record.get('reportNode').html)
            prettyPrint()
            this.contentContainer.getLayout().setActiveItem(1)
        } else {
            this.loadChartData(record)
            this.contentContainer.getLayout().setActiveItem(0)
        }
    },


    onBackToMainUI : function () {
        this.fireEvent('backtomainui', this)
    },


    loadChartData : function (node) {
        this.chart.store.loadData([
            { name : 'Statements', value : Math.round(node.getStatementCoverage()) },
            { name : 'Branches', value : Math.round(node.getBranchCoverage()) },
            { name : 'Functions', value : Math.round(node.getFunctionCoverage()) },
            { name : 'Lines', value : Math.round(node.getLineCoverage()) }
        ])
    }
});
;
Siesta.CurrentLocale = Siesta.CurrentLocale || {

    "Siesta.Harness.Browser.UI.AboutWindow" : {

        upgradeText : 'Upgrade to Siesta Standard',
        closeText   : 'Close',
        titleText   : 'ABOUT SIESTA (v. {VERSION})',

        bodyText    : '<img height="35" src="http://www.bryntum.com/bryntum-logo.png"/>\
             <p>Siesta is a JavaScript unit and functional test tool made by <a target="_blank" href="http://www.bryntum.com">Bryntum</a>. You can test any web page or JavaScript code, including Ext JS, jQuery or NodeJS. \
             Siesta comes in two versions: <strong>Lite</strong> and <strong>Standard</strong>. With Lite, you can launch your tests in the browser UI. \
             With the Standard version, you can also automate your tests and use the automation scripts together with tools like PhantomJS or Selenium WebDriver. </p>\
             Siesta would not be possible without these awesome products & libraries: <br>\
                     <ul style="padding:0 0 0 30px">\
                       <li><a href="http://sencha.com/extjs">Ext JS</a></li> \
                       <li><a href="http://jquery.com">jQuery</a></li> \
                       <li><a href="http://http://alexgorbatchev.com/SyntaxHighlighter/">SyntaxHighlighter</a></li> \
                       <li><a href="http://joose.it/">Joose</a></li> \
                       <li><a href="https://github.com/gotwarlost/istanbul">Istanbul</a></li> \
                    </ul>'
    },

    "Siesta.Harness.Browser.UI.AssertionGrid" : {
        initializingText    : 'Initializing test...'
    },

    "Siesta.Harness.Browser.UI.CoverageReport" : {
        closeText               : 'Close',
        showText                : 'Show: ',
        lowText                 : 'Low',
        mediumText              : 'Med',
        highText                : 'High',
        statementsText          : 'Statements',
        branchesText            : 'Branches',
        functionsText           : 'Functions',
        linesText               : 'Lines',
        loadingText             : "Loading coverage data...",
        loadingErrorText        : 'Loading error',
        loadingErrorMessageText : 'Could not load the report data from this url: ',
        globalNamespaceText     : '[Global namespace]'
    },

    "Siesta.Harness.Browser.UI.DomContainer" : {
        title                   : 'DOM Panel',
        viewDocsText            : 'View documentation for ',
        docsUrlText             : 'http://docs.sencha.com/{0}/apidocs/#!/api/{1}'
    },

    "Siesta.Harness.Browser.UI.ResultPanel" : {
        rerunText               : 'Run test',
        toggleDomVisibleText    : 'Toggle DOM visible',
        viewSourceText          : 'View source',
        showFailedOnlyText      : 'Show failed only',
        componentInspectorText  : 'Toggle Ext Component Inspector',
        eventRecorderText       : 'Event Recorder',
        closeText               : 'Close'
    },

    "Siesta.Harness.Browser.UI.TestGrid" : {
        title                   : 'Test list',
        nameText                : 'Name',
        filterTestsText         : 'Filter tests',
        expandCollapseAllText   : 'Expand / Collapse all',
        runCheckedText          : 'Run checked',
        runFailedText           : 'Run failed',
        runAllText              : 'Run all',
        showCoverageReportText  : 'Show coverage report',
        passText                : 'Pass',
        failText                : 'Fail',
        optionsText             : 'Options...',
        todoPassedText          : 'todo assertion(s) passed',
        todoFailedText          : 'todo assertion(s) failed',
        viewDomText             : 'View DOM',
        transparentExText       : 'Transparent exceptions',
        cachePreloadsText       : 'Cache preloads',
        autoLaunchText          : 'Auto launch',
        speedRunText            : 'Speed run',
        breakOnFailText         : 'Break on fail',
        debuggerOnFailText      : 'Debugger on fail',
        aboutText               : 'About Siesta',
        documentationText       : 'Siesta Documentation',
        siestaDocsUrl           : 'http://bryntum.com/docs/siesta',
        filterFieldTooltip      : 'Supported formats for tests filtering:\n1) TERM1 TERM2 - both "TERM1" and "TERM2" should present in the test url\n' +
            '2) TERM1 TERM2 | TERM3 TERM4 | ... - both "TERM1" and "TERM2" should present in the test url, OR both TERM3 and TERM4, etc, can be ' +
            'repeated indefinitely\n' +
            '3) GROUP_TERM > TEST_TERM - filters only withing the specified `group`',
        landscape               : 'Landscape'
    },

    "Siesta.Harness.Browser.UI.VersionUpdateButton" : {

        newUpdateText           : 'New Update Available...',
        updateWindowTitleText   : 'New version available for download! Current version: ',
        cancelText              : 'Cancel',
        changelogLoadFailedText : 'Bummer! Failed to fetch changelog.',
        downloadText            : 'Download ',
        liteText                : ' (Lite)',
        standardText            : ' (Standard)',
        loadingChangelogText    : 'Loading changelog...'
    },

    "Siesta.Harness.Browser.UI.Viewport" : {
        apiLinkText       : 'API Documentation',
        apiLinkUrl        : 'http://bryntum.com/docs/siesta',
        uncheckOthersText : 'Uncheck others (and check this)',
        uncheckAllText    : 'Uncheck all',
        checkAllText      : 'Check all',
        runThisText       : 'Run this',
        expandAll           : 'Expand all',
        collapseAll         : 'Collapse all',
        filterToCurrentGroup    : 'Filter to current group',
        filterToFailed          : 'Filter to failed',
        httpWarningTitle  : 'You must use a web server',
        httpWarningDesc   : 'You must run Siesta in a web server context, and not using the file:/// protocol'
    },


    "Siesta.Harness.Browser" : {
        codeCoverageWarningText : "Can not enable code coverage - did you forget to include the `siesta-coverage-all.js` on the harness page?",
        noJasmine               : "No `jasmine` object found on spec runner page",
        noJasmineSiestaReporter : "Can't find SiestaReporter in Jasmine. \nDid you add the `siesta/bin/jasmine-siesta-reporter.js` file to your spec runner page?"
    },

    "Siesta.Result.Assertion" : {
        todoText        : 'TODO: ',
        passText        : 'ok',
        failText        : 'fail'
    },

    "Siesta.Role.ConsoleReporter" : {
        passText            : 'PASS',
        failText            : 'FAIL',
        warnText            : 'WARN',
        missingFileText     : 'Test file [{URL}] not found.',
        allTestsPassedText  : 'All tests passed',
        failuresFoundText   : 'There are failures'
    },

    "Siesta.Test.Action.Drag" : {
        byOrToMissingText   : 'Either "to" or "by" configuration option is required for "drag" step',
        byAndToDefinedText  : 'Exactly one of "to" or "by" configuration options is required for "drag" step, not both'
    },

    "Siesta.Test.Action.Eval" : {
        invalidMethodNameText : "Invalid method name: ",
        wrongFormatText       : "Wrong format of the action string: ",
        parseErrorText        : "Can't parse arguments: "
    },

    "Siesta.Test.Action.Wait" : {
        missingMethodText     : 'Could not find a waitFor method named '
    },

    "Siesta.Test.BDD.Expectation" : {
        expectText                  : 'Expect',
        needNotText                 : 'Need not',
        needText                    : 'Need',
        needMatchingText            : 'Need matching',
        needNotMatchingText         : 'Need not matching',
        needStringNotContainingText : 'Need string not containing',
        needStringContainingText    : 'Need string containing',
        needArrayNotContainingText  : 'Need array not containing',
        needArrayContainingText     : 'Need array containing',
        needGreaterEqualThanText    : 'Need value greater or equal than',
        needGreaterThanText         : 'Need value greater than',
        needLessThanText            : 'Need value less than',
        needLessEqualThanText       : 'Need value less or equal than',
        needValueNotCloseToText     : 'Need value not close to',
        needValueCloseToText        : 'Need value close to',
        toBeText                    : 'to be',
        toBeDefinedText             : 'to be defined',
        toBeUndefinedText           : 'to be undefined',
        toBeEqualToText             : 'to be equal to',
        toBeTruthyText              : 'to be truthy',
        toBeFalsyText               : 'to be falsy',
        toMatchText                 : 'to match',
        toContainText               : 'to contain',
        toBeLessThanText            : 'to be less than',
        toBeGreaterThanText         : 'to be greater than',
        toBeCloseToText             : 'to be close to',
        toThrowText                 : 'to throw exception',
        thresholdIsText             : 'Threshold is ',
        exactMatchText              : 'Exact match text',
        thrownExceptionText         : 'Thrown exception',
        noExceptionThrownText       : 'No exception thrown',
        wrongSpy                    : 'Incorrect spy instance',
        toHaveBeenCalledDescTpl     : 'Expect method {methodName} to have been called {need} times',
        actualNbrOfCalls            : 'Actual number of calls',
        expectedNbrOfCalls          : 'Expected number of calls',
        toHaveBeenCalledWithDescTpl : 'Expect method {methodName} to have been called at least once with the specified arguments'
    },

    "Siesta.Test.ExtJS.Ajax"        : {
        ajaxIsLoading               : 'An Ajax call is currently loading',
        allAjaxRequestsToComplete   : 'all ajax requests to complete',
        ajaxRequest                 : 'ajax request',
        toComplete                  : 'to complete'
    },

    "Siesta.Test.ExtJS.Component"   : {
        badInputText                : 'Expected an Ext.Component, got',
        toBeVisible                 : 'to be visible',
        toNotBeVisible              : 'to not be visible',
        component                   : 'component',
        Component                   : 'Component',
        componentQuery              : 'componentQuery',
        compositeQuery              : 'composite query',
        toReturnEmptyArray          : 'to return an empty array',
        toReturnEmpty               : 'to return empty',
        toReturnAVisibleComponent   : 'to return a visible component',
        toReturnHiddenCmp           : 'to return a hidden/missing component',
        invalidDestroysOkInput      : 'No components provided, or component query returned empty result',
        exception                   : 'Exception',
        exceptionAnnotation         : 'Exception thrown while calling "destroy" method of',
        destroyFailed               : 'was not destroyed (probably destroy was canceled in the `beforedestroy` listener)',
        destroyPassed               : 'All passed components were destroyed ok'
    },

    "Siesta.Test.ExtJS.DataView"    : {
        view                        : 'view',
        toRender                    : 'to render'
    },

    "Siesta.Test.ExtJS.Element"     : {
        top                         : 'top',
        left                        : 'left',
        bottom                      : 'bottom',
        right                       : 'right'
    },

    "Siesta.Test.ExtJS.Grid"     : {
        waitForRowsVisible          : 'rows to show for panel with id'
    },

    "Siesta.Test.ExtJS.Observable" : {
        hasListenerInvalid           : '1st argument for `t.hasListener` should be an observable instance',
        hasListenerPass              : 'Observable has listener for {eventName}',
        hasListenerFail              : 'Provided observable has no listeners for event',

        isFiredWithSignatureNotFired : 'event was not fired during the test"',
        observableFired              : 'Observable fired',
        correctSignature             : 'with correct signature',
        incorrectSignature           : 'with incorrect signature'
    },

    "Siesta.Test.ExtJS.Store"        : {
        storesToLoad                 : 'stores to load',
        failedToLoadStore            : 'Failed to load the store',
        URL                          : 'URL'
    },

    "Siesta.Test.Action"             : {
        missingTestAction            : 'Action [{0}] requires `{1}` method in your test class'
    },

    "Siesta.Test.BDD"                : {
        codeBodyMissing              : 'Code body is not provided for',
        codeBodyOf                   : 'Code body of',
        missingFirstArg              : 'does not declare a test instance as 1st argument',
        iitFound                     : 't.iit should only be used during debugging',
        noObject                     : 'No object to spy on'
    },

    "Siesta.Test.BDD.Spy"                : {
        spyingNotOnFunction          : 'Trying to create a spy over a non-function property'
    },
    
    "Siesta.Test.Browser"            : {
        noDomElementFound            : 'No DOM element found for CSS selector',
        noActionTargetFound          : 'No action target found for',
        waitForEvent                 : 'observable to fire its',
        event                        : 'event',
        wrongFormat                  : 'Wrong format for expected number of events',
        unrecognizedSignature        : 'Unrecognized signature for `firesOk`',
        observableFired              : 'Observable fired',
        observableFiredOk            : 'Observable fired expected number of',
        actualNbrEvents              : 'Actual number of events',
        expectedNbrEvents            : 'Expected number of events',
        events                       : 'events',
        noElementFound               : 'Could not find any element at',
        targetElementOfAction        : 'Target element of action',
        targetElementOfSomeAction    : 'Target element of some action',
        isNotVisible                 : 'is not visible or not reachable',
        text                         : 'text',
        toBePresent                  : 'to be present',
        toNotBePresent               : 'to not be present',
        target                       : 'target',
        toAppear                     : 'to appear'
    },

    "Siesta.Test.Date"               :  {
        isEqualTo                    : 'is equal to',
        Got                          : 'Got'
    },

    "Siesta.Test.Element"            : {
        elementContent               : 'element content',
        toAppear                     : 'to appear',
        toDisappear                  : 'to disappear',
        monkeyException              : 'Monkey testing action did not complete properly - probably an exception was thrown',
        monkeyNoExceptions           : 'No exceptions thrown during monkey test',
        monkeyActionLog              : 'Monkey action log',
        elementHasClass              : 'Element has the CSS class',
        elementHasNoClass            : 'Element has no CSS class',
        elementClasses               : 'Classes of element',
        needClass                    : 'Need CSS class',

        hasStyleDescTpl              : 'Element has correct {value} for CSS style {property}',
        elementStyles                : 'Styles of element',
        needStyle                    : 'Need style',

        hasNotStyleDescTpl           : 'Element does not have: {value} for CSS style {property}',
        hasTheStyle                  : 'Element has the style',

        element                      : 'element',
        toBeTopEl                    : 'to be the top element at its position',
        toNotBeTopEl                 : 'to not be the top element at its position',

        selector                     : 'selector',
        selectors                    : 'selectors',
        toAppear                     : 'to appear',
        toAppearAt                   : 'to appear at',
        noCssSelector                : 'A CSS selector must be supplied',

        waitForSelectorsBadInput     : 'An array of CSS selectors must be supplied',

        Position                     : 'Position',
        noElementAtPosition          : 'No element found at the specified position',
        elementIsAtDescTpl           : 'DOM element or its child is at [ {x}, {y} ] coordinates',
        topElement                   : 'Top element',
        elementIsAtPassTpl           : 'DOM element is at [ {x}, {y} ] coordinates',
        allowChildrenDesc            : 'Need exactly this or its child',
        allowChildrenAnnotation      : 'Passed element is not the top-most one and not the child of one',
        shouldBe                     : 'Should be',
        noChildrenFailAnnotation     : 'Passed element is not the top-most one',

        topLeft                      : '(t-l)',
        bottomLeft                   : '(b-l)',
        topRight                     : '(t-r)',
        bottomRight                  : '(b-r)',

        elementIsNotTopElementPassTpl: 'Element is not the top element on the screen',
        selectorIsAtPassTpl          : 'Found element matching CSS selector {selector} at [ {xy} ]',
        elementMatching              : 'Element matching',
        selectorIsAtFailAnnotation   : 'Passed selector does not match any selector at',
        selectorExistsFailTpl        : 'No element matching the passed selector found',
        selectorExistsPassTpl        : 'Found DOM element(s) matching CSS selector {selector}',

        selectorNotExistsFailTpl     : 'Elements found matching the passed selector',
        selectorNotExistsPassTpl     : 'Did not find any DOM element(s) matching CSS selector {selector}',

        toChangeForElement           : 'to change for element',

        selectorCountIsPassTpl       : 'Found exactly {count} elements matching {selector}',
        selectorCountIsFailTpl       : 'Found {got} elements matching the selector {selector}, expected {need}',
        isInViewPassTpl              : 'Passed element is within the visible viewport',

        toAppearInTheViewport        : 'to appear in the viewport',

        elementIsEmptyPassTpl        : 'Passed element is empty',
        elementIsNotEmptyPassTpl     : 'Passed element is not empty',
        elementToBeEmpty             : 'element to be empty',
        elementToNotBeEmpty          : 'element to not be empty'
    },

    "Siesta.Test.ExtJS"              : {
        bundleUrlNotFound                   : 'Cannot find Ext JS bundle url',
        assertNoGlobalExtOverridesInvalid   : 'Was not able to find the Ext JS bundle URL in the `assertNoGlobalExtOverrides` assertion',
        assertNoGlobalExtOverridesPassTpl   : 'No global Ext overrides found',
        assertNoGlobalExtOverridesGotDesc   : 'Number of overrides found',
        foundOverridesFor                   : 'Found overrides for',
        animationsToFinalize                : 'animations to finalize',
        extOverridesInvalid                 : 'Was not able to find the ExtJS bundle URL in the `assertMaxNumberOfGlobalExtOverrides` assertion)',
        foundLessOrEqualThan                : 'Found less or equal than',
        nbrOverridesFound                   : 'Number of overrides found',
        globalOverrides                     : 'Ext JS global overrides'
    },

    "Siesta.Test.ExtJSCore"          : {
        waitedForRequires           : 'Waiting for required classes took too long - \nCheck the `Net` tab in Firebug and the `loaderPath` config',
        waitedForExt                 : 'Waiting for Ext.onReady took too long - probably some dependency could not be loaded. \nCheck the `Net` tab in Firebug and the `loaderPath` config',
        waitedForApp                 : 'Waiting for MVC application launch took too long - no MVC application on test page? \nYou may need to disable the `waitForAppReady` config option',
        noComponentMatch             : 'Your component query: "{component}" returned no components',
        multipleComponentMatch       : 'Your component query: "{component}" returned more than 1 component',
        noComponentFound             : 'No component found for CQ',
        knownBugIn                   : 'Known bug in',
        Class                        : 'Class',
        wasLoaded                    : 'was loaded',
        wasNotLoaded                 : 'was not loaded',
        invalidCompositeQuery        : 'Invalid composite query selector',
        ComponentQuery               : 'ComponentQuery',
        CompositeQuery               : 'CompositeQuery',
        matchedNoCmp                 : 'matched no Ext.Component',
        messageBoxVisible            : 'Message box is visible',
        messageBoxHidden             : 'Message box is hidden'
    },

    "Siesta.Test.Function"           : {
        Need                         : 'need',
        atLeast                      : 'at least',
        exactly                      : 'exactly',
        methodCalledExactly          : 'method was called exactly {n} times',
        exceptionEvalutingClass      : 'Exception [{e}] caught while evaluating the class name'
    },

    "Siesta.Test.More"               : {
        isGreaterPassTpl             : '`{value1}` is greater than `{value2}`',
        isLessPassTpl                : '`{value1}` is less than `{value2}`',
        isGreaterEqualPassTpl        : '`{value1}` is greater or equal to`{value2}`',
        isLessEqualPassTpl           : '`{value1}` is less or equal to`{value2}`',
        isApproxToPassTpl            : '`{value1}` is approximately equal to `{value2}`',

        needGreaterThan              : 'Need greater than',
        needGreaterEqualTo           : 'Need greater or equal to',
        needLessThan                 : 'Need less than',
        needLessEqualTo              : 'Need less or equal to',

        exactMatch                   : 'Exact match',
        withinThreshold              : 'Match within treshhold',
        needApprox                   : 'Need approx',
        thresholdIs                  : 'Threshold is',

        stringMatchesRe              : '`{string}` matches regexp {regex}',
        stringNotMatchesRe           : '`{string}` does not match regexp {regex}',
        needStringMatching           : 'Need string matching',
        needStringNotMatching        : 'Need string not matching',
        needStringContaining         : 'Need string containing',
        needStringNotContaining      : 'Need string not containing',
        stringHasSubstring           : '`{string}` has a substring: `{regex}`',
        stringHasNoSubstring         : '`{string}` does not have a substring: `{regex}`',

        throwsOkInvalid              : 'throws_ok accepts a function as 1st argument',
        didntThrow                   : 'Function did not throw an exception',
        exMatchesRe                  : 'Function throws exception matching to {expected}',
        exceptionStringifiesTo       : 'Exception stringifies to',
        exContainsSubstring          : 'Function throws exception containing a substring: {expected}',

        fnDoesntThrow                : 'Function does not throw any exceptions',
        fnThrew                      : 'Function threw an exception',

        isInstanceOfPass             : 'Object is an instance of the specified class',
        needInstanceOf               : 'Need instance of',
        isAString                    : '{value} is a string',
        aStringValue                 : 'AStringValue',
        isAnObject                   : '{value} is an object',
        anObject                     : 'An object value',
        isAnArray                    : '{value} is an array',
        anArrayValue                 : 'An array value',
        isANumber                    : '{value} is a number',
        aNumberValue                 : 'a number value',
        isABoolean                   : '{value} is a boolean',
        aBooleanValue                : 'a number value',
        isADate                      : '{value} is a date',
        aDateValue                   : 'a date value',
        isARe                        : '{value} is a regular expression',
        aReValue                     : 'a regular expression',
        isAFunction                  : '{value} is a function',
        aFunctionValue               : 'a function',
        isDeeplyPassTpl              : '{obj1} is deeply equal to {obj2}',
        isDeeplyStrictPassTpl        : '{obj1} is strictly deeply equal to {obj2}',
        globalCheckNotSupported      : 'Testing leakage of global variables is not supported on this platform',
        globalVariables              : 'Global Variables',
        noGlobalsFound               : 'No unexpected global variables found',
        globalFound                  : 'Unexpected global found',
        globalName                   : 'Global name',
        value                        : 'value',

        conditionToBeFulfilled       : 'condition to be fulfilled',
        ms                           : 'ms',
        waitingFor                   : 'Waiting for',
        waitedTooLong                : 'Waited too long for',
        conditionNotFulfilled        : 'Condition was not fullfilled during',
        waitingAborted               : 'Waiting aborted',
        Waited                       : 'Waited',
        checkerException             : 'checker threw an exception',
        Exception                    : 'Exception',
        msFor                        : 'ms for',
        forcedWaitFinalization       : 'Forced finalization of waiting for',
        chainStepNotCompleted        : 'The step in `t.chain()` call did not complete within required timeframe, chain can not proceed',
        stepNumber                   : 'Step number',
        oneBased                     : '(1-based)',
        atLine                       : 'At line',
        chainStepEx                  : 'Chain step threw an exception',
        stepFn                       : 'Step function',
        notUsingNext                 : 'does not use the provided "next" function anywhere',
        calledMoreThanOnce           : 'The `next` callback of {num} step (1-based) of `t.chain()` call at line {line} is called more than once.'
    },


    "Siesta.Test.SenchaTouch"               : {
        STSetupFailed                       : 'Waiting for Ext.setup took too long - some dependency could not be loaded? Check the `Net` tab in Firebug',
        invalidSwipeDir                     : 'Invalid swipe direction',
        moveFingerByInvalidInput            : 'Trying to call moveFingerBy without relative distances',
        scrollUntilFailed                   : 'scrollUntil failed to achieve its mission',
        scrollUntilElementVisibleInvalid    : 'scrollUntilElementVisible: target or scrollable not provided',
        scrollerReachPos                    : 'scroller to reach position'
    },

    "Siesta.Test"                           : {
        noCodeProvidedToTest                : 'No code provided to test',
        addingAssertionsAfterDone           : 'Adding assertions after the test has finished',
        testFailedAndAborted                : 'Assertion failed, test execution aborted',
        atLine                              : 'at line',
        of                                  : 'of',
        character                           : 'character',
        isTruthy                            : '`{value}` is a "truthy" value',
        needTruthy                          : 'Need "truthy" value',
        isFalsy                             : '`{value}` is a "falsy" value',
        needFalsy                           : 'Need "falsy" value',
        isEqualTo                           : '`{got}` is equal to `{expected}`',
        isNotEqualTo                        : '`{got}` is not equal to `{expected}`',
        needNot                             : 'Need not',
        isStrictlyEqual                     : '`{got}` is strictly equal to `{expected}`',
        needStrictly                        : 'Need strictly',
        isStrictlyNotEqual                  : '`{got}` is strictly not equal to `{expected}`',
        needStrictlyNot                     : 'Need strictly not',
        alreadyWaiting                      : 'Already waiting with title',
        noOngoingWait                       : 'There is no ongoing `wait` action with title',
        noMatchingEndAsync                  : 'No matching `endAsync` call within',
        endAsyncMisuse                      : 'Calls to endAsync without argument should only be performed if you have single beginAsync statement',
        codeBodyMissingForSubTest           : 'Code body is not provided for sub test',
        codeBodyMissingTestArg              : 'Code body of sub test [{name}] does not declare a test instance as 1st argument',
        Subtest                             : 'Subtest',
        Test                                : 'Test',
        failedToFinishWithin                : 'failed to finish within',
        threwException                      : 'threw an exception',
        testAlreadyStarted                  : 'Test has already been started',
        setupTookTooLong                    : '`setup` method took too long to complete',
        errorBeforeTestStarted              : 'Error happened before the test started',
        testStillRunning                    : 'Your test is still considered to be running, if this is unexpected please see console for more information',
        testNotFinalized                    : 'Your test [{url}] has not finalized, most likely since a timer (setTimeout) is still active. ' +
                                              'If this is the expected behavior, try setting "overrideSetTimeout : false" on your Harness configuration.',
        missingDoneCall                     : 'Test has completed, but there was no `t.done()` call. Add it at the bottom, or use `t.beginAsync()` for asynchronous code',
        allTestsPassed                      : 'All tests passed',
        
        'Snoozed until'                     : 'Snoozed until',
        testTearDownTimeout                 : "Test's tear down process has timeout out"
    },

    "Siesta.Recorder.Editor.Code"           : {
        invalidSyntax                       : 'Invalid syntax'
    },

    "Siesta.Recorder.Editor.DragTarget"     : {
        targetLabel                         : 'Target',
        toLabel                             : 'To',
        byLabel                             : 'By',
        cancelButtonText                    : 'Cancel',
        saveButtonText                      : 'Save',
        
        dragVariantTitle                    : 'Edit `drag` action',
        moveCursorVariantTitle              : 'Edit `moveCursor` action'
    },

    "Siesta.Recorder.UI.EventView"          : {
        actionColumnHeader                  : 'Action',
        offsetColumnHeader                  : 'Offset'
    },

    "Siesta.Recorder.UI.RecorderPanel"      : {
        queryMatchesNothing                 : 'Query matches no DOM elements or components',
        queryMatchesMultiple                : 'Query matches multiple components',
        noVisibleElsFound                   : 'No visible elements found for target',
        noTestDetected                      : 'No test detected',
        noTestStarted                       : 'You need to run a test first',
        recordTooltip                       : 'Record',
        stopTooltip                         : 'Stop',
        playTooltip                         : 'Play',
        clearTooltip                        : 'Clear all',
        codeWindowTitle                     : 'Code',
        addNewTooltip                       : 'Add a new step',
        removeAllPromptTitle                : 'Remove all?',
        removeAllPromptMessage              : 'Do you want to clear the recorded events?',
        Error                               : 'Error'
    },

    "Siesta.Recorder.UI.TargetColumn"       : {
        headerText                          : 'Target / Value',
        by                                  : 'by',
        to                                  : 'to'
    }
};

;
// Localization helper
Siesta.Resource = (function () {
    
    var Resource    = Class({
        does    : Siesta.Util.Role.CanFormatStrings,
        
        has     : {
            dict        : null
        },
        
        methods : {
            'get' : function (key, data) {
                var text = this.dict[ key ];
        
                if (text) return this.formatString(text, data);
        
                if (window.console && console.error) {
                    window.top.console.error('TEXT_NOT_DEFINED: ' + key);
                }
        
                return 'TEXT_NOT_DEFINED: ' + key;
            }
        }
    
    })
    

    return function (namespace, key) {
        var dictionary  = Siesta.CurrentLocale[ namespace ];

        if (!dictionary) {
            throw 'Missing dictionary for namespace: ' + namespace;
        }
        
        var resource    = new Resource({ dict : dictionary, serializeFormatingPlaceholders : false })

        if (key) return resource.get(key)

        return resource
    }
})();
;
window.PR_SHOULD_USE_CONTINUATION=true;(function(){var h=["break,continue,do,else,for,if,return,while"];var u=[h,"auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"];var p=[u,"catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"];var l=[p,"alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"];var x=[p,"abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient"];var R=[x,"as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var"];var r="all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,true,try,unless,until,when,while,yes";var w=[p,"debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"];var s="caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END";var I=[h,"and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"];var f=[h,"alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"];var H=[h,"case,done,elif,esac,eval,fi,function,in,local,set,then,until"];var A=[l,R,w,s+I,f,H];var e=/^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/;var C="str";var z="kwd";var j="com";var O="typ";var G="lit";var L="pun";var F="pln";var m="tag";var E="dec";var J="src";var P="atn";var n="atv";var N="nocode";var M="(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\-=|\\->|\\/|\\/=|:|::|\\;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\@|\\[|\\^|\\^=|\\^\\^|\\^\\^=|\\{|\\||\\|=|\\|\\||\\|\\|=|\\~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*";function k(Z){var ad=0;var S=false;var ac=false;for(var V=0,U=Z.length;V<U;++V){var ae=Z[V];if(ae.ignoreCase){ac=true}else{if(/[a-z]/i.test(ae.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi,""))){S=true;ac=false;break}}}var Y={b:8,t:9,n:10,v:11,f:12,r:13};function ab(ah){var ag=ah.charCodeAt(0);if(ag!==92){return ag}var af=ah.charAt(1);ag=Y[af];if(ag){return ag}else{if("0"<=af&&af<="7"){return parseInt(ah.substring(1),8)}else{if(af==="u"||af==="x"){return parseInt(ah.substring(2),16)}else{return ah.charCodeAt(1)}}}}function T(af){if(af<32){return(af<16?"\\x0":"\\x")+af.toString(16)}var ag=String.fromCharCode(af);if(ag==="\\"||ag==="-"||ag==="["||ag==="]"){ag="\\"+ag}return ag}function X(am){var aq=am.substring(1,am.length-1).match(new RegExp("\\\\u[0-9A-Fa-f]{4}|\\\\x[0-9A-Fa-f]{2}|\\\\[0-3][0-7]{0,2}|\\\\[0-7]{1,2}|\\\\[\\s\\S]|-|[^-\\\\]","g"));var ak=[];var af=[];var ao=aq[0]==="^";for(var ar=ao?1:0,aj=aq.length;ar<aj;++ar){var ah=aq[ar];if(/\\[bdsw]/i.test(ah)){ak.push(ah)}else{var ag=ab(ah);var al;if(ar+2<aj&&"-"===aq[ar+1]){al=ab(aq[ar+2]);ar+=2}else{al=ag}af.push([ag,al]);if(!(al<65||ag>122)){if(!(al<65||ag>90)){af.push([Math.max(65,ag)|32,Math.min(al,90)|32])}if(!(al<97||ag>122)){af.push([Math.max(97,ag)&~32,Math.min(al,122)&~32])}}}}af.sort(function(av,au){return(av[0]-au[0])||(au[1]-av[1])});var ai=[];var ap=[NaN,NaN];for(var ar=0;ar<af.length;++ar){var at=af[ar];if(at[0]<=ap[1]+1){ap[1]=Math.max(ap[1],at[1])}else{ai.push(ap=at)}}var an=["["];if(ao){an.push("^")}an.push.apply(an,ak);for(var ar=0;ar<ai.length;++ar){var at=ai[ar];an.push(T(at[0]));if(at[1]>at[0]){if(at[1]+1>at[0]){an.push("-")}an.push(T(at[1]))}}an.push("]");return an.join("")}function W(al){var aj=al.source.match(new RegExp("(?:\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]|\\\\u[A-Fa-f0-9]{4}|\\\\x[A-Fa-f0-9]{2}|\\\\[0-9]+|\\\\[^ux0-9]|\\(\\?[:!=]|[\\(\\)\\^]|[^\\x5B\\x5C\\(\\)\\^]+)","g"));var ah=aj.length;var an=[];for(var ak=0,am=0;ak<ah;++ak){var ag=aj[ak];if(ag==="("){++am}else{if("\\"===ag.charAt(0)){var af=+ag.substring(1);if(af&&af<=am){an[af]=-1}}}}for(var ak=1;ak<an.length;++ak){if(-1===an[ak]){an[ak]=++ad}}for(var ak=0,am=0;ak<ah;++ak){var ag=aj[ak];if(ag==="("){++am;if(an[am]===undefined){aj[ak]="(?:"}}else{if("\\"===ag.charAt(0)){var af=+ag.substring(1);if(af&&af<=am){aj[ak]="\\"+an[am]}}}}for(var ak=0,am=0;ak<ah;++ak){if("^"===aj[ak]&&"^"!==aj[ak+1]){aj[ak]=""}}if(al.ignoreCase&&S){for(var ak=0;ak<ah;++ak){var ag=aj[ak];var ai=ag.charAt(0);if(ag.length>=2&&ai==="["){aj[ak]=X(ag)}else{if(ai!=="\\"){aj[ak]=ag.replace(/[a-zA-Z]/g,function(ao){var ap=ao.charCodeAt(0);return"["+String.fromCharCode(ap&~32,ap|32)+"]"})}}}}return aj.join("")}var aa=[];for(var V=0,U=Z.length;V<U;++V){var ae=Z[V];if(ae.global||ae.multiline){throw new Error(""+ae)}aa.push("(?:"+W(ae)+")")}return new RegExp(aa.join("|"),ac?"gi":"g")}function a(V){var U=/(?:^|\s)nocode(?:\s|$)/;var X=[];var T=0;var Z=[];var W=0;var S;if(V.currentStyle){S=V.currentStyle.whiteSpace}else{if(window.getComputedStyle){S=document.defaultView.getComputedStyle(V,null).getPropertyValue("white-space")}}var Y=S&&"pre"===S.substring(0,3);function aa(ab){switch(ab.nodeType){case 1:if(U.test(ab.className)){return}for(var ae=ab.firstChild;ae;ae=ae.nextSibling){aa(ae)}var ad=ab.nodeName;if("BR"===ad||"LI"===ad){X[W]="\n";Z[W<<1]=T++;Z[(W++<<1)|1]=ab}break;case 3:case 4:var ac=ab.nodeValue;if(ac.length){if(!Y){ac=ac.replace(/[ \t\r\n]+/g," ")}else{ac=ac.replace(/\r\n?/g,"\n")}X[W]=ac;Z[W<<1]=T;T+=ac.length;Z[(W++<<1)|1]=ab}break}}aa(V);return{sourceCode:X.join("").replace(/\n$/,""),spans:Z}}function B(S,U,W,T){if(!U){return}var V={sourceCode:U,basePos:S};W(V);T.push.apply(T,V.decorations)}var v=/\S/;function o(S){var V=undefined;for(var U=S.firstChild;U;U=U.nextSibling){var T=U.nodeType;V=(T===1)?(V?S:U):(T===3)?(v.test(U.nodeValue)?S:V):V}return V===S?undefined:V}function g(U,T){var S={};var V;(function(){var ad=U.concat(T);var ah=[];var ag={};for(var ab=0,Z=ad.length;ab<Z;++ab){var Y=ad[ab];var ac=Y[3];if(ac){for(var ae=ac.length;--ae>=0;){S[ac.charAt(ae)]=Y}}var af=Y[1];var aa=""+af;if(!ag.hasOwnProperty(aa)){ah.push(af);ag[aa]=null}}ah.push(/[\0-\uffff]/);V=k(ah)})();var X=T.length;var W=function(ah){var Z=ah.sourceCode,Y=ah.basePos;var ad=[Y,F];var af=0;var an=Z.match(V)||[];var aj={};for(var ae=0,aq=an.length;ae<aq;++ae){var ag=an[ae];var ap=aj[ag];var ai=void 0;var am;if(typeof ap==="string"){am=false}else{var aa=S[ag.charAt(0)];if(aa){ai=ag.match(aa[1]);ap=aa[0]}else{for(var ao=0;ao<X;++ao){aa=T[ao];ai=ag.match(aa[1]);if(ai){ap=aa[0];break}}if(!ai){ap=F}}am=ap.length>=5&&"lang-"===ap.substring(0,5);if(am&&!(ai&&typeof ai[1]==="string")){am=false;ap=J}if(!am){aj[ag]=ap}}var ab=af;af+=ag.length;if(!am){ad.push(Y+ab,ap)}else{var al=ai[1];var ak=ag.indexOf(al);var ac=ak+al.length;if(ai[2]){ac=ag.length-ai[2].length;ak=ac-al.length}var ar=ap.substring(5);B(Y+ab,ag.substring(0,ak),W,ad);B(Y+ab+ak,al,q(ar,al),ad);B(Y+ab+ac,ag.substring(ac),W,ad)}}ah.decorations=ad};return W}function i(T){var W=[],S=[];if(T.tripleQuotedStrings){W.push([C,/^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,null,"'\""])}else{if(T.multiLineStrings){W.push([C,/^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,null,"'\"`"])}else{W.push([C,/^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,null,"\"'"])}}if(T.verbatimStrings){S.push([C,/^@\"(?:[^\"]|\"\")*(?:\"|$)/,null])}var Y=T.hashComments;if(Y){if(T.cStyleComments){if(Y>1){W.push([j,/^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/,null,"#"])}else{W.push([j,/^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/,null,"#"])}S.push([C,/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/,null])}else{W.push([j,/^#[^\r\n]*/,null,"#"])}}if(T.cStyleComments){S.push([j,/^\/\/[^\r\n]*/,null]);S.push([j,/^\/\*[\s\S]*?(?:\*\/|$)/,null])}if(T.regexLiterals){var X=("/(?=[^/*])(?:[^/\\x5B\\x5C]|\\x5C[\\s\\S]|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+/");S.push(["lang-regex",new RegExp("^"+M+"("+X+")")])}var V=T.types;if(V){S.push([O,V])}var U=(""+T.keywords).replace(/^ | $/g,"");if(U.length){S.push([z,new RegExp("^(?:"+U.replace(/[\s,]+/g,"|")+")\\b"),null])}W.push([F,/^\s+/,null," \r\n\t\xA0"]);S.push([G,/^@[a-z_$][a-z_$@0-9]*/i,null],[O,/^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/,null],[F,/^[a-z_$][a-z_$@0-9]*/i,null],[G,new RegExp("^(?:0x[a-f0-9]+|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)(?:e[+\\-]?\\d+)?)[a-z]*","i"),null,"0123456789"],[F,/^\\[\s\S]?/,null],[L,/^.[^\s\w\.$@\'\"\`\/\#\\]*/,null]);return g(W,S)}var K=i({keywords:A,hashComments:true,cStyleComments:true,multiLineStrings:true,regexLiterals:true});function Q(V,ag){var U=/(?:^|\s)nocode(?:\s|$)/;var ab=/\r\n?|\n/;var ac=V.ownerDocument;var S;if(V.currentStyle){S=V.currentStyle.whiteSpace}else{if(window.getComputedStyle){S=ac.defaultView.getComputedStyle(V,null).getPropertyValue("white-space")}}var Z=S&&"pre"===S.substring(0,3);var af=ac.createElement("LI");while(V.firstChild){af.appendChild(V.firstChild)}var W=[af];function ae(al){switch(al.nodeType){case 1:if(U.test(al.className)){break}if("BR"===al.nodeName){ad(al);if(al.parentNode){al.parentNode.removeChild(al)}}else{for(var an=al.firstChild;an;an=an.nextSibling){ae(an)}}break;case 3:case 4:if(Z){var am=al.nodeValue;var aj=am.match(ab);if(aj){var ai=am.substring(0,aj.index);al.nodeValue=ai;var ah=am.substring(aj.index+aj[0].length);if(ah){var ak=al.parentNode;ak.insertBefore(ac.createTextNode(ah),al.nextSibling)}ad(al);if(!ai){al.parentNode.removeChild(al)}}}break}}function ad(ak){while(!ak.nextSibling){ak=ak.parentNode;if(!ak){return}}function ai(al,ar){var aq=ar?al.cloneNode(false):al;var ao=al.parentNode;if(ao){var ap=ai(ao,1);var an=al.nextSibling;ap.appendChild(aq);for(var am=an;am;am=an){an=am.nextSibling;ap.appendChild(am)}}return aq}var ah=ai(ak.nextSibling,0);for(var aj;(aj=ah.parentNode)&&aj.nodeType===1;){ah=aj}W.push(ah)}for(var Y=0;Y<W.length;++Y){ae(W[Y])}if(ag===(ag|0)){W[0].setAttribute("value",ag)}var aa=ac.createElement("OL");aa.className="linenums";var X=Math.max(0,((ag-1))|0)||0;for(var Y=0,T=W.length;Y<T;++Y){af=W[Y];af.className="L"+((Y+X)%10);if(!af.firstChild){af.appendChild(ac.createTextNode("\xA0"))}aa.appendChild(af)}V.appendChild(aa)}function D(ac){var aj=/\bMSIE\b/.test(navigator.userAgent);var am=/\n/g;var al=ac.sourceCode;var an=al.length;var V=0;var aa=ac.spans;var T=aa.length;var ah=0;var X=ac.decorations;var Y=X.length;var Z=0;X[Y]=an;var ar,aq;for(aq=ar=0;aq<Y;){if(X[aq]!==X[aq+2]){X[ar++]=X[aq++];X[ar++]=X[aq++]}else{aq+=2}}Y=ar;for(aq=ar=0;aq<Y;){var at=X[aq];var ab=X[aq+1];var W=aq+2;while(W+2<=Y&&X[W+1]===ab){W+=2}X[ar++]=at;X[ar++]=ab;aq=W}Y=X.length=ar;var ae=null;while(ah<T){var af=aa[ah];var S=aa[ah+2]||an;var ag=X[Z];var ap=X[Z+2]||an;var W=Math.min(S,ap);var ak=aa[ah+1];var U;if(ak.nodeType!==1&&(U=al.substring(V,W))){if(aj){U=U.replace(am,"\r")}ak.nodeValue=U;var ai=ak.ownerDocument;var ao=ai.createElement("SPAN");ao.className=X[Z+1];var ad=ak.parentNode;ad.replaceChild(ao,ak);ao.appendChild(ak);if(V<S){aa[ah+1]=ak=ai.createTextNode(al.substring(W,S));ad.insertBefore(ak,ao.nextSibling)}}V=W;if(V>=S){ah+=2}if(V>=ap){Z+=2}}}var t={};function c(U,V){for(var S=V.length;--S>=0;){var T=V[S];if(!t.hasOwnProperty(T)){t[T]=U}else{if(window.console){console.warn("cannot override language handler %s",T)}}}}function q(T,S){if(!(T&&t.hasOwnProperty(T))){T=/^\s*</.test(S)?"default-markup":"default-code"}return t[T]}c(K,["default-code"]);c(g([],[[F,/^[^<?]+/],[E,/^<!\w[^>]*(?:>|$)/],[j,/^<\!--[\s\S]*?(?:-\->|$)/],["lang-",/^<\?([\s\S]+?)(?:\?>|$)/],["lang-",/^<%([\s\S]+?)(?:%>|$)/],[L,/^(?:<[%?]|[%?]>)/],["lang-",/^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],["lang-js",/^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],["lang-css",/^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],["lang-in.tag",/^(<\/?[a-z][^<>]*>)/i]]),["default-markup","htm","html","mxml","xhtml","xml","xsl"]);c(g([[F,/^[\s]+/,null," \t\r\n"],[n,/^(?:\"[^\"]*\"?|\'[^\']*\'?)/,null,"\"'"]],[[m,/^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],[P,/^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],["lang-uq.val",/^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],[L,/^[=<>\/]+/],["lang-js",/^on\w+\s*=\s*\"([^\"]+)\"/i],["lang-js",/^on\w+\s*=\s*\'([^\']+)\'/i],["lang-js",/^on\w+\s*=\s*([^\"\'>\s]+)/i],["lang-css",/^style\s*=\s*\"([^\"]+)\"/i],["lang-css",/^style\s*=\s*\'([^\']+)\'/i],["lang-css",/^style\s*=\s*([^\"\'>\s]+)/i]]),["in.tag"]);c(g([],[[n,/^[\s\S]+/]]),["uq.val"]);c(i({keywords:l,hashComments:true,cStyleComments:true,types:e}),["c","cc","cpp","cxx","cyc","m"]);c(i({keywords:"null,true,false"}),["json"]);c(i({keywords:R,hashComments:true,cStyleComments:true,verbatimStrings:true,types:e}),["cs"]);c(i({keywords:x,cStyleComments:true}),["java"]);c(i({keywords:H,hashComments:true,multiLineStrings:true}),["bsh","csh","sh"]);c(i({keywords:I,hashComments:true,multiLineStrings:true,tripleQuotedStrings:true}),["cv","py"]);c(i({keywords:s,hashComments:true,multiLineStrings:true,regexLiterals:true}),["perl","pl","pm"]);c(i({keywords:f,hashComments:true,multiLineStrings:true,regexLiterals:true}),["rb"]);c(i({keywords:w,cStyleComments:true,regexLiterals:true}),["js"]);c(i({keywords:r,hashComments:3,cStyleComments:true,multilineStrings:true,tripleQuotedStrings:true,regexLiterals:true}),["coffee"]);c(g([],[[C,/^[\s\S]+/]]),["regex"]);function d(V){var U=V.langExtension;try{var S=a(V.sourceNode);var T=S.sourceCode;V.sourceCode=T;V.spans=S.spans;V.basePos=0;q(U,T)(V);D(V)}catch(W){if("console" in window){console.log(W&&W.stack?W.stack:W)}}}function y(W,V,U){var S=document.createElement("PRE");S.innerHTML=W;if(U){Q(S,U)}var T={langExtension:V,numberLines:U,sourceNode:S};d(T);return S.innerHTML}function b(ad){function Y(af){return document.getElementsByTagName(af)}var ac=[Y("pre"),Y("code"),Y("xmp")];var T=[];for(var aa=0;aa<ac.length;++aa){for(var Z=0,V=ac[aa].length;Z<V;++Z){T.push(ac[aa][Z])}}ac=null;var W=Date;if(!W.now){W={now:function(){return +(new Date)}}}var X=0;var S;var ab=/\blang(?:uage)?-([\w.]+)(?!\S)/;var ae=/\bprettyprint\b/;function U(){var ag=(window.PR_SHOULD_USE_CONTINUATION?W.now()+250:Infinity);for(;X<T.length&&W.now()<ag;X++){var aj=T[X];var ai=aj.className;if(ai.indexOf("prettyprint")>=0){var ah=ai.match(ab);var am;if(!ah&&(am=o(aj))&&"CODE"===am.tagName){ah=am.className.match(ab)}if(ah){ah=ah[1]}var al=false;for(var ak=aj.parentNode;ak;ak=ak.parentNode){if((ak.tagName==="pre"||ak.tagName==="code"||ak.tagName==="xmp")&&ak.className&&ak.className.indexOf("prettyprint")>=0){al=true;break}}if(!al){var af=aj.className.match(/\blinenums\b(?::(\d+))?/);af=af?af[1]&&af[1].length?+af[1]:true:false;if(af){Q(aj,af)}S={langExtension:ah,sourceNode:aj,numberLines:af};d(S)}}}if(X<T.length){setTimeout(U,250)}else{if(ad){ad()}}}U()}window.prettyPrintOne=y;window.prettyPrint=b;window.PR={createSimpleLexer:g,registerLangHandler:c,sourceDecorator:i,PR_ATTRIB_NAME:P,PR_ATTRIB_VALUE:n,PR_COMMENT:j,PR_DECLARATION:E,PR_KEYWORD:z,PR_LITERAL:G,PR_NOCODE:N,PR_PLAIN:F,PR_PUNCTUATION:L,PR_SOURCE:J,PR_STRING:C,PR_TAG:m,PR_TYPE:O}})();PR.registerLangHandler(PR.createSimpleLexer([],[[PR.PR_DECLARATION,/^<!\w[^>]*(?:>|$)/],[PR.PR_COMMENT,/^<\!--[\s\S]*?(?:-\->|$)/],[PR.PR_PUNCTUATION,/^(?:<[%?]|[%?]>)/],["lang-",/^<\?([\s\S]+?)(?:\?>|$)/],["lang-",/^<%([\s\S]+?)(?:%>|$)/],["lang-",/^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],["lang-handlebars",/^<script\b[^>]*type\s*=\s*['"]?text\/x-handlebars-template['"]?\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],["lang-js",/^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],["lang-css",/^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],["lang-in.tag",/^(<\/?[a-z][^<>]*>)/i],[PR.PR_DECLARATION,/^{{[#^>/]?\s*[\w.][^}]*}}/],[PR.PR_DECLARATION,/^{{&?\s*[\w.][^}]*}}/],[PR.PR_DECLARATION,/^{{{>?\s*[\w.][^}]*}}}/],[PR.PR_COMMENT,/^{{![^}]*}}/]]),["handlebars","hbs"]);PR.registerLangHandler(PR.createSimpleLexer([[PR.PR_PLAIN,/^[ \t\r\n\f]+/,null," \t\r\n\f"]],[[PR.PR_STRING,/^\"(?:[^\n\r\f\\\"]|\\(?:\r\n?|\n|\f)|\\[\s\S])*\"/,null],[PR.PR_STRING,/^\'(?:[^\n\r\f\\\']|\\(?:\r\n?|\n|\f)|\\[\s\S])*\'/,null],["lang-css-str",/^url\(([^\)\"\']*)\)/i],[PR.PR_KEYWORD,/^(?:url|rgb|\!important|@import|@page|@media|@charset|inherit)(?=[^\-\w]|$)/i,null],["lang-css-kw",/^(-?(?:[_a-z]|(?:\\[0-9a-f]+ ?))(?:[_a-z0-9\-]|\\(?:\\[0-9a-f]+ ?))*)\s*:/i],[PR.PR_COMMENT,/^\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//],[PR.PR_COMMENT,/^(?:<!--|-->)/],[PR.PR_LITERAL,/^(?:\d+|\d*\.\d+)(?:%|[a-z]+)?/i],[PR.PR_LITERAL,/^#(?:[0-9a-f]{3}){1,2}/i],[PR.PR_PLAIN,/^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i],[PR.PR_PUNCTUATION,/^[^\s\w\'\"]+/]]),["css"]);PR.registerLangHandler(PR.createSimpleLexer([],[[PR.PR_KEYWORD,/^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i]]),["css-kw"]);PR.registerLangHandler(PR.createSimpleLexer([],[[PR.PR_STRING,/^[^\)\"\']+/]]),["css-str"]);
;
