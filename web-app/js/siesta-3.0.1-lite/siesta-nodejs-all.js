/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
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
Class('Scope.Provider', {
    
    /*PKGVERSION*/VERSION : 0.12,
    
    has     : {
        name                : null,
        
        scope               : null,
        
        seedingCode         : null,
        seedingScript       : null,
        
        preload             : {
            is      : 'ro',
            init    : Joose.I.Array
        },
        
        cleanupCallback         : null,
        beforeCleanupCallback   : null
    },
    
        
    methods : {
        
        isCSS : function (url) {
            return /\.css(\?.*)?$/i.test(url)
        },
        
        
        isAlreadySetUp : function () {
            return Boolean(this.scope)
        },
        
        
        addPreload : function (preloadDesc) {
            if (this.isAlreadySetUp()) throw new Error("Can't use `addPreload` - scope is already setup. Use `runCode/runScript` instead")
            
            if (typeof preloadDesc == 'string')
                
                if (this.isCSS(preloadDesc)) 
                    preloadDesc = {
                        type        : 'css',
                        url         : preloadDesc
                    }
                else
                    preloadDesc = {
                        type        : 'js',
                        url         : preloadDesc
                    }
            else
            
                if (preloadDesc.text) 
                    preloadDesc = {
                        type        : 'js',
                        content     : preloadDesc.text
                    }
                    
            if (!preloadDesc.type) throw new Error("Preload descriptor must have the `type` property")
                
            this.preload.push(preloadDesc)
        },
        
        
        addOnErrorHandler : function (handler, callback) {
            throw "Abstract method `addOnErrorHandler` of Scope.Provider called"
        },
        
        
        create : function () {
            throw "Abstract method `create` of Scope.Provider called"
        },
        
        
        setup : function (callback) {
            throw "Abstract method `setup` of Scope.Provider called"
        },
        
        
        cleanup : function (callback) {
            throw "Abstract method `cleanup` of Scope.Provider called"
        },
        
        
        runCode : function (text, callback) {
            throw "Abstract method `runCode` of Scope.Provider called"
        },
        
        
        runScript : function (url, callback) {
            throw "Abstract method `runScript` of Scope.Provider called"
        }
    }
})


Scope.Provider.__ONLOAD__   = {}
Scope.Provider.__ONERROR__  = {};
Role('Scope.Provider.Role.WithDOM', {
    
    requires    : [ 'getDocument', 'create', 'getPreload', 'isAlreadySetUp', 'setViewportSize' ],
    
    has : {
        useStrictMode   : true,
        sourceURL       : null,
        
        minViewportSize : null,
        
        parentWindow    : function () { return window },
        scopeId         : function () { return Math.round(Math.random() * 1e10) },
        
        //                init function
        attachToOnError : function () {
            
            // returns the value of the attribute
            // the "handler" argument is no longer used, its now being taken from the __ONERROR__ handler every time
            return function (window, scopeId, handler, preventDefault) {
                
                var prevHandler         = window.onerror
                if (prevHandler && prevHandler.__SP_MANAGED__) return
                
                // this, "managed" handler is basically a wrapper around the current value in the "__ONERROR__" hash
                window.onerror = function (message, url, lineNumber) {
                    handler     = (window.opener || window.parent).Scope.Provider.__ONERROR__[ scopeId  ]
                    
                    // prevent recursive calls if other authors politely has not overwrite the handler and call it
                    if (handler.__CALLING__) return
                    
                    handler.__CALLING__ = true
                    
                    prevHandler && prevHandler.apply(this, arguments)
                
                    handler.apply(this, arguments)
                    
                    handler.__CALLING__ = false
                    
                    // in FF/IE need to return `true` to prevent default action
                    if (preventDefault !== false) return window.WebKitPoint ? false : true 
                }
                
                window.onerror.__SP_MANAGED__ = true
            } 
        },
        
        // this is a "cached" onerror handler - a handler which was provided before the scope
        // has started the creation process - should be installed ASAP in the creation process
        // to allow catching of the exceptions in the scope with `sourceURL` 
        cachedOnError   : null
    },
    
    
    override : {
        
        cleanup : function () {
            this.cachedOnError  = null
            
            // can throw exceptions for cross-domain case
            try {
                this.scope.onerror  = null
            } catch (e) {
            }
            
            this.SUPERARG(arguments)
            
            this.scope          = null
        }
    },
    
    
    methods : {
        
        cleanupHanlders : function () {
            var scopeProvider   = this.parentWindow.Scope.Provider
            
            delete scopeProvider.__ONLOAD__[ this.scopeId ]
            delete scopeProvider.__ONERROR__[ this.scopeId ]
        },
        
        
        getHead : function () {
            return this.getDocument().getElementsByTagName('head')[ 0 ]
        },
        
        
        installOnErrorHandler : function (handler) {
            if (!this.isAlreadySetUp()) throw "Scope should be already set up"
            
            this.attachToOnError(this.scope, this.scopeId, handler)
        },
        
        
        addOnErrorHandler : function (handler, preventDefault) {
            handler.__SP_MANAGED__  = true
            
            this.cachedOnError      = handler
            
            var scopeId     = this.scopeId
            
            this.parentWindow.Scope.Provider.__ONERROR__[ scopeId ] = handler
            
            var attachToOnError = ';(' + this.attachToOnError.toString() + ')(window, ' + scopeId + ', (window.opener || window.parent).Scope.Provider.__ONERROR__[ ' + scopeId + ' ], ' + preventDefault + ');'
            
            if (this.isAlreadySetUp()) 
                this.runCode(attachToOnError)
            else {
                // this is a fallback - run the "attachToOnError" from inside of scope
                this.getPreload().unshift({
                    type        : 'js',
                    content     : attachToOnError,
                    unordered   : true
                })
            }
        },
        
        
        addSeedingToPreload : function () {
            var preload             = this.getPreload()
                
            if (this.seedingCode) preload.unshift({
                type        : 'js',
                content     : this.seedingCode
            })
            
            if (this.seedingScript) preload.push({
                type        : 'js',
                url         : this.seedingScript
            })
        },
        
        
        setup : function (callback) {
            var isIE                = 'v' == '\v' || Boolean(this.parentWindow.msWriteProfilerMark)
//            var isOpera             = Object.prototype.toString.call(this.parentWindow.opera) == '[object Opera]'
            var hasInlineScript     = false
            
            Joose.A.each(this.getPreload(), function (preloadDesc) {
                // IE will execute the inline scripts ASAP, this might be not what we want (inline script might be need executed only after some url script)
                // its however ok in some cases (like adding `onerror` handler
                // such inline scripts should be marked with `unordered` - true
                if (preloadDesc.type == 'js' && preloadDesc.content && !preloadDesc.unordered) {
                    hasInlineScript = true
                    
                    return false
                } 
            })
            
            if (this.sourceURL || isIE && hasInlineScript) {
                this.addSeedingToPreload()
                
                this.setupIncrementally(callback)
                
            } else {
                // for sane browsers just add the seeding code and seeding script to preloads
                if (!isIE) this.addSeedingToPreload()
                
                // seeding scripts are included only for sane browsers (not IE)
                this.setupWithDocWrite(callback, isIE)
            }
        },
        
        
        setupWithDocWrite : function (callback, needToSeed) {
            var html        = []
            var me          = this
            
            Joose.A.each(this.getPreload(), function (preloadDesc) {
                
                if (preloadDesc.type == 'js') 
                    html.push(me.getScriptTagString(preloadDesc.url, preloadDesc.content))
                    
                else if (preloadDesc.type == 'css') 
                    html.push(me.getLinkTagString(preloadDesc.url, preloadDesc.content))
                
                else throw "Incorrect preload descriptor " + preloadDesc
            })
            
            // no need to wait for DOM ready - we'll overwrite it anyway
            this.create()
            
            var scopeId              = this.scopeId
            
            this.parentWindow.Scope.Provider.__ONLOAD__[ scopeId ]    = function () {

                var cont = function () { callback && callback(me) }
                
                // sane browsers - seeding code and script has been already added
                if (!needToSeed) { cont(); return }
                
                // our beloved IE - manually seeding the scope
                
                if (me.seedingCode) me.runCode(me.seedingCode)
                
                if (me.seedingScript) 
                    me.runScript(me.seedingScript, cont)
                else
                    cont()
            }
            
            var doc             = this.getDocument()
            
            doc.open()
            
            doc.write([
                this.useStrictMode ? '<!DOCTYPE html>' : '',
                '<html style="width: 100%; height: 100%; margin : 0; padding : 0;">',
                    '<head>',
                        html.join(''),
                    '</head>',
    
                    '<body style="margin : 0; padding : 0; width: 100%; height: 100%" onload="(window.opener || window.parent).Scope.Provider.__ONLOAD__[' + scopeId + ']()">',
                    '</body>',
                '</html>'
            ].join(''))
            
            doc.close()
            
            // Chrome (Webkit?) will clear the `onerror` after "doc.open()/.close()" so need to re-install it
            if (me.cachedOnError) me.installOnErrorHandler(me.cachedOnError)
        },
        
        
        setupIncrementally : function (callback) {
            var me      = this
            
            // here the "onerror" should be included early in the "preloads" 
            this.create(function () {
                
                var loadScripts     = function (preloads, callback) {
                    
                    var cont = function () { loadScripts(preloads, callback) }
                    
                    if (!preloads.length) 
                        callback && callback()
                    else {
                        var preloadDesc     = preloads.shift()
                        
                        if (preloadDesc.url) 
                            me.runScript(preloadDesc.url, cont)
                        else 
                            if (preloadDesc.type == 'js')
                                me.runCode(preloadDesc.content, cont)
                            else {
                                me.addStyleTag(preloadDesc.content)
                                
                                cont()
                            }
                    }
                }
                
                loadScripts(me.getPreload().slice(), callback)
            })
        },        
        
        
        getScriptTagString : function (url, text) {
            var res = '<script type="text/javascript"'
            
            if (url) 
                res     += ' src="' + url + '"></script>'
            else
                res     += '>' + text.replace(/<\/script>/gi, '\\x3C/script>') + '</script>'
                
            return res
        },
        
        
        getLinkTagString : function (url, text) {
            if (url) return '<link href="' + url + '" rel="stylesheet" type="text/css" />'
            
            if (text) return '<style>' + text + '</style>'
        },
        
        

        loadCSS : function (url, callback) {
            var doc         = this.getDocument()
            var link        = doc.createElement('link')
            
            link.type       = 'text/css'
            link.rel        = 'stylesheet'
            link.href       = url
        
            this.getHead().appendChild(link)
            
            var hasContinued    = false
            
            var cont            = function () {
                // just in case some crazy JS engine calls `onerror` even after node removal
                if (hasContinued) return
                hasContinued    = true
                clearTimeout(forcedTimeout)
                
                if (callback) callback()
                
                doc.body.removeChild(img)
            }
            
            var forcedTimeout   = setTimeout(cont, 3000)
        
            var img             = doc.createElement('img')
            
            img.onerror         = cont
        
            doc.body.appendChild(img)
            
            img.src             = url
        },
        
        
        runCode : function (text, callback) {
            this.getHead().appendChild(this.createScriptTag(text))
            
            callback && callback()
        },
        
        
        runScript : function (url, callback) {
            if (this.isCSS(url))
                this.loadCSS(url, callback)
            else
                this.getHead().appendChild(this.createScriptTag(null, url, callback))
        },
        
        
        createScriptTag : function (text, url, callback) {
            var node = this.getDocument().createElement("script")
            
            node.setAttribute("type", "text/javascript")
            
            if (url) node.setAttribute("src", url)
            
            if (text) node.text = text
            
            if (callback) node.onload = node.onreadystatechange = function() {
                if (!node.readyState || node.readyState == "loaded" || node.readyState == "complete" || node.readyState == 4 && node.status == 200) {
                    node.onload = node.onreadystatechange = null
                    
                    //surely for IE6..
                    if ('v' == '\v') 
                        setTimeout(callback, 0)
                    else
                        callback()
                }
            }
            
            return node
        },
        
        
        addStyleTag : function (text) {
            var document    = this.getDocument()
            var node        = document.createElement('style')
            
            node.setAttribute("type", "text/css")
            
            var head = document.getElementsByTagName('head')[0]
            head.appendChild(node)
            
            if (node.styleSheet) {   // IE
                node.styleSheet.cssText = text
            } else {                // the world
                node.appendChild(document.createTextNode(text))
            }
        }        
    }
})


/**

Name
====

Scope.Provider.Role.WithDOM - role for scope provider, which uses `script` tag for running the code.


SYNOPSIS
========

        Class('Scope.Provider.IFrame', {
            
            isa     : Scope.Provider,
            
            does    : Scope.Provider.Role.WithDOM,
            
            ...
        })

DESCRIPTION
===========

`Scope.Provider.Role.WithDOM` requires the implementation of the `getDocument` method, which should return the
document into which the `script` tags will be created.

In return, this role provides the implementation of `runCode` and `runScript`.




GETTING HELP
============

This extension is supported via github issues tracker: <http://github.com/SamuraiJack/Scope-Provider/issues>

For general Joose questions you can also visit [#joose](http://webchat.freenode.net/?randomnick=1&channels=joose&prompt=1) 
on irc.freenode.org or the forum at: <http://joose.it/forum>
 


SEE ALSO
========

Web page of this module: <http://github.com/SamuraiJack/Scope-Provider/>

General documentation for Joose: <http://joose.github.com/Joose>


BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <http://github.com/SamuraiJack/Scope-Provider/issues>



AUTHORS
=======

Nickolay Platonov <nplatonov@cpan.org>





COPYRIGHT AND LICENSE
=====================

This software is Copyright (c) 2010 by Nickolay Platonov <nplatonov@cpan.org>.

This is free software, licensed under:

  The GNU Lesser General Public License, Version 3, June 2007

*/;
Class('Scope.Provider.IFrame', {
    
    isa     : Scope.Provider,
    
    does    : Scope.Provider.Role.WithDOM,
    
    
    have : {
        iframe          : null,
        cls             : null,
        
        performWrap     : false,
        wrapCls         : null,
        wrapper         : null,
        
        parentEl        : null,
        
        cleanupDelay    : 1000
    },
    

    methods : {
        
        getDocument : function () {
            return this.iframe.contentWindow.document
        },
        
        
        setViewportSize : function (width, height) {
            var iframe              = this.iframe
            
            if (!iframe) return
            
            iframe.style.width      = width + 'px'
            iframe.style.height     = height + 'px'
        },
        
        
        create : function (onLoadCallback) {
            var me                  = this
            var doc                 = this.parentWindow.document
            var iframe              = this.iframe = doc.createElement('iframe')
            
            var minViewportSize     = this.minViewportSize
            
            iframe.className        = this.cls || ''
            iframe.style.width      = (minViewportSize && minViewportSize.width || 1024) + 'px'
            iframe.style.height     = (minViewportSize && minViewportSize.height || 768) + 'px'
            iframe.setAttribute('frameborder', 0)
            
            if (this.name) iframe.setAttribute('name', this.name)

            var ignoreOnLoad        = false    
            
            var callback = function () {
                if (ignoreOnLoad) return
                
                if (iframe.detachEvent) 
                    iframe.detachEvent('onload', callback)
                else
                    iframe.onload = null
                
                onLoadCallback && onLoadCallback(me)
            }
            
            if (iframe.attachEvent) 
                iframe.attachEvent('onload', callback)
            else
                iframe.onload   = callback
            
            iframe.src = this.sourceURL || 'about:blank'
            
            if (this.performWrap) {
                var wrapper         = this.wrapper  = this.wrapper || doc.createElement('div')
                
                wrapper.className   = this.wrapCls || ''
                
                wrapper.appendChild(iframe)
            } 
            
            ;(this.parentEl || doc.body).appendChild(wrapper || iframe)
            
            var scope   = this.scope = iframe.contentWindow
            var doc     = this.getDocument()
            
            // dances with tambourine around the IE, somehow fixes the cross-domain limits
            if ('v' == '\v' || Boolean(this.parentWindow.msWriteProfilerMark)) {
                // only ignore the 1st call to callback when there is a `sourceURL` config
                // which will later be assigned to `iframe.src` and will trigger a new iframe loading
                if (this.sourceURL) ignoreOnLoad = true
                
                doc.open()
                doc.write('')
                doc.close()
                
                ignoreOnLoad = false
                
                iframe.onreadystatechange = function () {
                    if (iframe.readyState == 'complete') iframe.onreadystatechange = null
                    
                    // trying to add the "early" onerror handler on each "readyState" change
                    // for some mystical reasons can't use `me.installOnErrorHandler` need to inline the call
                    if (me.cachedOnError) me.attachToOnError(scope, me.scopeId, me.cachedOnError)
                }
                
                if (this.sourceURL) iframe.src = this.sourceURL
            }
            
            // trying to add the "early" onerror handler - installing it in this stage will only work in FF 
            // (other browsers will clear on varios stages)
            if (me.cachedOnError) me.installOnErrorHandler(me.cachedOnError)
        },
        
        
        cleanup : function () {
            var wrapper     = this.wrapper || this.iframe
            var iframe      = this.iframe
            var me          = this
            
            wrapper.style.display    = 'none'
            
            var onUnloadChecker = function () {
                if (!window.onunload) window.onunload = function () { return 'something' }
            }
            
            // add the `onunload` handler if there's no any - attempting to prevent browser from caching the iframe
            // trying to create the handler from inside of the scope
            this.runCode(';(' + onUnloadChecker.toString() + ')();')

            this.iframe     = null
            this.scope      = null
            this.wrapper    = null

            // wait for 1000ms to allow time for possible `setTimeout` in the scope of iframe
            setTimeout(function () {
                
                if (me.beforeCleanupCallback) me.beforeCleanupCallback()
                me.beforeCleanupCallback    = null
                
                // chaging the page, triggering `onunload` and hopefully preventing browser from caching the content of iframe
                iframe.src      = 'javascript:false'
                
                // wait again before removing iframe from the DOM, as recommended by some online sources
                setTimeout(function () {
                    ;(me.parentEl || me.parentWindow.document.body).removeChild(wrapper)
                    
                    wrapper     = null
                    iframe      = null
                    
                    me.parentEl = null
                    
                    me.cleanupHanlders()
                    
                    if (me.cleanupCallback) me.cleanupCallback()
                    me.cleanupCallback  = null
                    
                }, me.cleanupDelay)
            }, me.cleanupDelay)
        }
    }
})

/**

Name
====

Scope.Provider.IFrame - scope provider, which uses the iframe.


SYNOPSIS
========

        var provider = new Scope.Provider.IFrame()
        
        provider.setup(function () {
        
            if (provider.scope.SOME_GLOBAL == 'some_value') {
                ...
            }
            
            provider.runCode(text, callback)
            
            ...
            
            provider.runScript(url, callback)
            
            ...
            
            provider.cleanup()        
        })


DESCRIPTION
===========

`Scope.Provider.IFrame` is an implementation of the scope provider, which uses the iframe, 
to create a new scope.


ISA
===

[Scope.Provider](../Provider.html)


DOES
====

[Scope.Provider.Role.WithDOM](Role/WithDOM.html)



GETTING HELP
============

This extension is supported via github issues tracker: <http://github.com/SamuraiJack/Scope-Provider/issues>

You can also ask questions at IRC channel : [#joose](http://webchat.freenode.net/?randomnick=1&channels=joose&prompt=1)
 
Or the mailing list: <http://groups.google.com/group/joose-js>
 


SEE ALSO
========

Web page of this module: <http://github.com/SamuraiJack/Scope-Provider/>

General documentation for Joose: <http://joose.github.com/Joose>


BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <http://github.com/SamuraiJack/Scope-Provider/issues>



AUTHORS
=======

Nickolay Platonov <nplatonov@cpan.org>





COPYRIGHT AND LICENSE
=====================

This software is Copyright (c) 2010 by Nickolay Platonov <nplatonov@cpan.org>.

This is free software, licensed under:

  The GNU Lesser General Public License, Version 3, June 2007

*/;
Class('Scope.Provider.Window', {
    
    isa     : Scope.Provider,

    does    : Scope.Provider.Role.WithDOM,
    
    
    has     : {
        popupWindow     : null
    },
    

    methods : {
        
        setViewportSize : function (width, height) {
            var popupWindow     = this.popupWindow
            
            if (!popupWindow) return
            
            // is not guaranteed to work
            popupWindow.resizeTo(width, height)
        },
        
        
        create : function (onLoadCallback) {
            var minViewportSize     = this.minViewportSize
            
            var width       = minViewportSize && minViewportSize.width || 1024
            var height      = minViewportSize && minViewportSize.height || 768
            
            var popup       = this.scope = this.popupWindow = this.parentWindow.open(
                // left/top is set to > 0 value with intent to keep the mouse cursor outside of the popup
                // its always recommened to set the mousecursor position to 0, 0 in the automation script
                this.sourceURL || 'about:blank', 
                '_blank', 
                "left=10,top=10,width=" + width + ",height=" + height
            )
            
            if (!popup) {
                alert('Please enable popups for the host with this test suite running: ' + this.parentWindow.location.host)
                throw 'Please enable popups for the host with this test suite running: ' + this.parentWindow.location.host
            }
            
            var isIE = 'v' == '\v' || Boolean(this.parentWindow.msWriteProfilerMark)
            
            // dances with tambourine around the IE
            if (isIE && !this.sourceURL) {
                var doc = this.getDocument()
                
                doc.open()
                doc.write('')
                doc.close()
            }
            
            // trying to add the "early" onerror handler - will probably only work in FF
            if (this.cachedOnError) this.installOnErrorHandler(this.cachedOnError)
            
            /*!
             * contentloaded.js
             *
             * Author: Diego Perini (diego.perini at gmail.com)
             * Summary: cross-browser wrapper for DOMContentLoaded
             * Updated: 20101020
             * License: MIT
             * Version: 1.2
             *
             * URL:
             * http://javascript.nwbox.com/ContentLoaded/
             * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
             *
             */
            
            // @win window reference
            // @fn function reference
            var contentLoaded = function (win, fn) {
            
                var done = false, top = true,
            
                doc = win.document, root = doc.documentElement,
            
                add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
                rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
                pre = doc.addEventListener ? '' : 'on',
            
                init = function(e) {
                    if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                    
                    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                    
                    if (!done && (done = true)) fn.call(win, e.type || e);
                },
            
                poll = function() {
                    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
                    
                    init('poll');
                };
                
                if (doc.readyState == 'complete') 
                    fn.call(win, 'lazy');
                else {
                    if (doc.createEventObject && root.doScroll) {
                        try { top = !win.frameElement; } catch(e) { }
                        if (top) poll();
                    }
                    doc[add](pre + 'DOMContentLoaded', init, false);
                    doc[add](pre + 'readystatechange', init, false);
                    win[add](pre + 'load', init, false);
                }
            }
            
            if (this.sourceURL)
                // seems the "doc.readyState" is set before the DOM is created on the page
                // if one will start interact with page immediately he can overwrite the page content
                setTimeout(function () {
                    contentLoaded(popup, onLoadCallback || function () {})    
                }, 10)
            else
                contentLoaded(popup, onLoadCallback || function () {})
        },
        
        
        getDocument : function () {
            return this.popupWindow.document
        },
        
        
        cleanup : function () {
            if (this.beforeCleanupCallback) this.beforeCleanupCallback()
            this.beforeCleanupCallback      = null
            
            this.popupWindow.close()
            
            this.popupWindow = null
            
            this.cleanupHanlders()
            
            if (this.cleanupCallback) this.cleanupCallback()
            this.cleanupCallback            = null
        }
    }
})

/**

Name
====

Scope.Provider.Window - scope provider, which uses the popup browser window.


SYNOPSIS
========

        var provider = new Scope.Provider.Window()
        
        provider.setup(function () {
        
            if (provider.scope.SOME_GLOBAL == 'some_value') {
                ...
            }
            
            provider.runCode(text, callback)
            
            ...
            
            provider.runScript(url, callback)
            
            ...
            
            provider.cleanup()        
        })


DESCRIPTION
===========

`Scope.Provider.Window` is an implementation of the scope provider, which uses the popup browser window, 
to create a new scope.


ISA
===

[Scope.Provider](../Provider.html)


DOES
====

[Scope.Provider.Role.WithDOM](Role/WithDOM.html)



GETTING HELP
============

This extension is supported via github issues tracker: <http://github.com/SamuraiJack/Scope-Provider/issues>

You can also ask questions at IRC channel : [#joose](http://webchat.freenode.net/?randomnick=1&channels=joose&prompt=1)
 
Or the mailing list: <http://groups.google.com/group/joose-js>
 


SEE ALSO
========

Web page of this module: <http://github.com/SamuraiJack/Scope-Provider/>

General documentation for Joose: <http://joose.github.com/Joose>


BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <http://github.com/SamuraiJack/Scope-Provider/issues>



AUTHORS
=======

Nickolay Platonov <nplatonov@cpan.org>





COPYRIGHT AND LICENSE
=====================

This software is Copyright (c) 2010 by Nickolay Platonov <nplatonov@cpan.org>.

This is free software, licensed under:

  The GNU Lesser General Public License, Version 3, June 2007

*/;
Class('Scope.Provider.NodeJS', {
    
    isa     : Scope.Provider,

    
    has     : {
        sourceURL       : null
    },
    

    methods : {
        
        compile : function (module, content, filename) {
            var Module    = require('module')
            var path      = require('path')
            
            var self      = module;
            // remove shebang
            content       = content.replace(/^\#\!.*/, '');
        
            var modRequire     = function (path) {
                return self.require(path);
            }
        
            modRequire.resolve = function(request) {
                return Module._resolveFilename(request, self)[1];
            };
        
            Object.defineProperty(modRequire, 'paths', { get: function() {
                throw new Error('modRequire.paths is removed. Use ' +
                            'node_modules folders, or the NODE_PATH '+
                            'environment variable instead.');
            }});
        
            modRequire.main = process.mainModule;
        
            // Enable support to add extra extension types
            modRequire.extensions = Module._extensions;
            modRequire.registerExtension = function() {
                throw new Error('modRequire.registerExtension() removed. Use ' +
                            'modRequire.extensions instead.');
            };
        
            modRequire.cache = Module._cache;
        
            var dirname = path.dirname(filename);
        
            // create wrapper function
            var wrapper = Module.wrap(content);
            
            var compiledWrapper = require('vm').runInContext(wrapper, this.scope, filename);
            
            return compiledWrapper.apply(self.exports, [self.exports, modRequire, self, filename, dirname]);
        },        
        
        
        addOnErrorHandler : function (handler, callback) {
        },

        
        create : function (callback) {
            var vm          = require('vm')
            var sandbox     = {}

            Joose.O.extend(sandbox, {
//                __PROVIDER__    : true,
                
                process         : process,
                
                global          : sandbox,
                root            : root,
                
                setTimeout      : setTimeout,
                clearTimeout    : clearTimeout,
                setInterval     : setInterval,
                clearInterval   : clearInterval
//                ,
//                
//                __filename      : __filename,
//                __dirname       : __dirname,
//                module          : module
            })
            
            var scope       = this.scope    = vm.createContext(sandbox)
            
            callback && callback()
        },
        
        
        setup : function (callback) {
            this.create()
            
            var me      = this
            
            if (this.seedingCode) require('vm').runInContext(this.seedingCode, this.scope)
            
            Joose.A.each(this.getPreload(), function (preloadDesc) {
                
                if (preloadDesc.type == 'js')
                    if (preloadDesc.url)
                        me.runScript(preloadDesc.url)
                    else
                        me.runCode(preloadDesc.content)
            })
            
            if (this.seedingScript) {
                var Module          = require('module')
                var path            = require('path')
                
                var module          = new Module('./' + this.sourceURL, require.main)
                
                var filename        = module.filename = path.join(path.dirname(require.main.filename), this.sourceURL)
                
                var content         = require('fs').readFileSync(filename, 'utf8')
                // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
                // because the buffer-to-string conversion in `fs.readFileSync()`
                // translates it to FEFF, the UTF-16 BOM.
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1)
  
                this.compile(module, content, filename)
            }
            
            callback && callback()
        },
        
        
        runCode : function (text, callback) {
            var res = require('vm').runInContext(text, this.scope)
            
            callback && callback(res)
            
            return res
        },
        
        
        runScript : function (url, callback) {
            var content = require('fs').readFileSync(url, 'utf8')
            
            var res = require('vm').runInContext(content, this.scope, url)
            
            callback && callback(res)
            
            return res
        },
        
        
        cleanup : function () {
            if (this.beforeCleanupCallback) this.beforeCleanupCallback()
            if (this.cleanupCallback) this.cleanupCallback()
        }
    }
})


/**

Name
====

Scope.Provider.NodeJS - scope provider, which uses the `Script.runInNewContext` call of the NodeJS.


SYNOPSIS
========

        var provider = new Scope.Provider.NodeJS()
        
        provider.setup(function () {
        
            if (provider.scope.SOME_GLOBAL == 'some_value') {
                ...
            }
            
            provider.runCode(text, callback)
            
            ...
            
            provider.runScript(url, callback)
            
            ...
            
            provider.cleanup()        
        })


DESCRIPTION
===========

`Scope.Provider.NodeJS` is an implementation of the scope provider, 
which uses the `Script.runInNewContext` call of the NodeJS platform.


ISA
===

[Scope.Provider](../Provider.html)



GETTING HELP
============

This extension is supported via github issues tracker: <http://github.com/SamuraiJack/Scope-Provider/issues>

You can also ask questions at IRC channel : [#joose](http://webchat.freenode.net/?randomnick=1&channels=joose&prompt=1)
 
Or the mailing list: <http://groups.google.com/group/joose-js>
 


SEE ALSO
========

Web page of this module: <http://github.com/SamuraiJack/Scope-Provider/>

General documentation for Joose: <http://joose.github.com/Joose>


BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <http://github.com/SamuraiJack/Scope-Provider/issues>



AUTHORS
=======

Nickolay Platonov <nplatonov@cpan.org>





COPYRIGHT AND LICENSE
=====================

This software is Copyright (c) 2010 by Nickolay Platonov <nplatonov@cpan.org>.

This is free software, licensed under:

  The GNU Lesser General Public License, Version 3, June 2007

*/;
;
Class('JooseX.Observable.Event', {
    
    has : {
        name        : { required : true },
        args        : { required : true },
        
        source      : { required : true },
        
        splat       : null,
        current     : null,
        
        bubbling    : true
    },
    
        
    methods : {
        
        stopPropagation : function () {
            this.bubbling = false
        }
    }
})


;
Class('JooseX.Observable.Listener', {

    has : {
        channel     : { required : true },
        eventName   : { required : true },
        
        func        : { required : true },
        scope       : null,
        
        single          : false,
        
        buffer          : null,
        bufferMax       : null,
        
        bufferStartedAt : null,
        bufferTimeout   : null,
        
        delayTimeout    : null,
        
        delay           : null
    },
    
        
    methods : {
        
        activate : function (event, args) {
            var me      = this
            
            if (me.buffer != null) {
                
                if (me.bufferMax != null)
                    if (!me.bufferStartedAt) 
                        me.bufferStartedAt = new Date()
                    else
                        if (new Date - me.bufferStartedAt > me.bufferMax) return
                
                        
                if (me.bufferTimeout) clearTimeout(me.bufferTimeout)
                
                me.bufferTimeout = setTimeout(function () {
                    
                    delete me.bufferStartedAt
                    delete me.bufferTimeout
                    
                    me.doActivate(event, args)
                    
                }, me.buffer)
                
                return
            }
            
            if (me.delay != null) {
                
                me.delayTimeout = setTimeout(function () {
                    
                    delete me.delayTimeout
                    
                    me.doActivate(event, args)
                    
                }, me.delay)
                
                return
            }
            
            return me.doActivate(event, args)
        },
        
        
        doActivate : function (event, args) {
            if (this.single) this.remove()
            
            return this.func.apply(this.scope || event.source, [ event ].concat(args) ) !== false
        },
        
        
        cancel  : function () {
            if (this.buffer) {
                clearTimeout(this.bufferTimeout)
                
                delete this.bufferTimeout
                delete this.bufferStartedAt
            }
            
            if (this.delay) clearTimeout(this.delayTimeout)
        },
        
        
        remove : function () {
            this.channel.removeListener(this)
        }
    }
})


;
Class('JooseX.Observable.Channel', {
    
    has : {
        channels    : Joose.I.Object,
        
        listeners   : Joose.I.Object
    },
    
        
    methods : {
        
        destroy : function () {
            Joose.O.each(this.channels, function (channel, name) {
                channel.purgeListeners()
            })
            
            this.channels   = null
            
            // cleanup paranoya
            Joose.O.each(this.listeners, function (value, name) {
                this.listeners[ name ]  = null
            }, this)
            
            this.listeners  = null
        },
        
        
        // (!) segments array will be destroyed in this method
        getListenersFor : function (segments, name, activators) {
            var listeners = this.listeners
            
            if (listeners[ '**' ]) {
                
                var splat       = segments.concat(name)
                
                Joose.A.each(listeners[ '**' ], function (listener) {
                    activators.push({
                        listener    : listener,
                        splat       : splat
                    })
                })
            }
            
            if (segments.length) {
                var next = this.getSingleChannel(segments.shift(), true)
                
                if (next) next.getListenersFor(segments, name, activators)
            } else {
                
                if (listeners[ '*' ])
                    Joose.A.each(listeners[ '*' ], function (listener) {
                        
                        activators.push({
                            listener    : listener,
                            splat       : name
                        })
                    })
                
                if (listeners[ name ])  
                    Joose.A.each(listeners[ name ], function (listener) {
                        
                        activators.push({
                            listener    : listener
                        })
                    })
            }
        },
        
        
        hasListenerFor : function (segments, name) {
            var listeners = this.listeners
            
            if (listeners[ '**' ] && listeners[ '**' ].length) return true
            
            if (segments.length)  {
                var next = this.getSingleChannel(segments.shift(), true)
                
                if (next) return next.hasListenerFor(segments, name)
                
            } else {
                
                if (listeners[ '*' ] && listeners[ '*' ].length) return true
                
                if (listeners[ name ] && listeners[ name ].length) return true  
            }
            
            return false
        },
        
        
        addListener : function (listener) {
            var eventName   = listener.eventName
            var listeners   = this.listeners
            
            listeners[ eventName ] = listeners[ eventName ] || []
            
            listeners[ eventName ].push(listener)
        },
        
        
        removeListener : function (listenerToRemove) {
            // already purged
            if (!this.listeners) return
            
            var eventListeners      = this.listeners[ listenerToRemove.eventName ]
            
            eventListeners && Joose.A.each(eventListeners, function (listener, index) {
                
                if (listener == listenerToRemove) {
                    
                    eventListeners.splice(index, 1)
                    
                    return false
                }
            })
        },
        
        
        removeListenerByHandler : function (eventName, func, scope) {
            var eventListeners      = this.listeners[ eventName ]
            
            eventListeners && Joose.A.each(eventListeners, function (listener, index) {
                
                if (listener.func == func && listener.scope == scope) {
                    
                    eventListeners.splice(index, 1)
                    
                    return false
                }
            })
        },
        
        
        getSingleChannel : function (name, doNotCreate) {
            var channels    = this.channels
            
            if (channels[ name ]) return channels[ name ]
            
            if (doNotCreate) return null
            
            return channels[ name ] = new JooseX.Observable.Channel()
        },
        
        
        // (!) segments array will be destroyed in this method
        getChannel : function (segments, doNotCreate) {
            if (!segments.length) return this
            
            var next    = this.getSingleChannel(segments.shift(), doNotCreate)
            
            if (doNotCreate && !next) return null
            
            return next.getChannel(segments, doNotCreate)
        }
    }
})


;
Role('JooseX.Observable', {
    
    /*PKGVERSION*/VERSION : 0.04,
    
//    use : [ 
//        'JooseX.Observable.Channel',    
//        'JooseX.Observable.Listener', 
//        'JooseX.Observable.Event'    
//    ],
    
    
//    trait   : 'JooseX.Observable.Meta',
    
    
    has : {
        rootChannel             : {
            is          : 'rw',
            init        : function () { return new JooseX.Observable.Channel() }
        },
        
        suspendCounter          : 0
    },
    
        
    methods : {
        
        getBubbleTarget : function () {
        },
        
        
        parseEventPath : function (path) {
            var channels    = path.split('/')
            var eventName   = channels.pop()
            
            if (channels.length && !channels[ 0 ]) channels.shift()
            
            return {
                channels        : channels,
                eventName       : eventName
            }
        },
        
        
        on : function (path, func, scope, options) {
            if (!func) throw "Not valid listener function provided when subsribing on event: " + path
            
            var parsed      = this.parseEventPath(path)
            var channel     = this.getRootChannel().getChannel(parsed.channels)
            
            var listener    = new JooseX.Observable.Listener(Joose.O.extend(options || {}, {
                channel     : channel,
                eventName   : parsed.eventName,
                
                func        : func,
                scope       : scope
            }))
            
            channel.addListener(listener)
            
            return listener
        },
        
        
        un : function (path, func, scope) {
            
            if (path instanceof JooseX.Observable.Listener) {
                
                path.remove()
                
                return
            }
            
            var parsed      = this.parseEventPath(path)
            var channel     = this.getRootChannel().getChannel(parsed.channels, true)
            
            if (channel) channel.removeListenerByHandler(parsed.eventName, func, scope)
        },
        
        
        emit : function () {
            return this.fireEvent.apply(this, arguments)
        },
        
        
        fireEvent : function (path) {
            if (this.suspendCounter) return
            
            var args        = Array.prototype.slice.call(arguments, 1)

            var event       = new JooseX.Observable.Event({
                name        : path,
                args        : args,
                
                source      : this
            }) 
            
            return this.propagateEvent(event, path, args)
        },
        
        
        propagateEvent : function (event, path, args) {
            if (this.suspendCounter) return
            
            var parsed      = this.parseEventPath(path)
            var eventName   = parsed.eventName
            
            if (!eventName == '*' || eventName == '**') throw new Error("Can't fire an empty event or event with `*`, `**` names ")
            
            var activators  = []
            
            this.getRootChannel().getListenersFor(parsed.channels, eventName, activators)
            
            var res             = true
            
            event.current       = this
            
            if (activators.length) Joose.A.each(activators, function (activator) {
                event.splat = activator.splat
                
                res = activator.listener.activate(event, args) !== false && res
            })
            
            if (event.bubbling) {
                
                var further = this.getBubbleTarget()
                
                if (further) res = further.propagateEvent(event, path, args) !== false && res
            } 
                
            return res
        },
        
        
        hasListenerFor : function (path) {
            var parsed      = this.parseEventPath(path)
            
            return this.getRootChannel().hasListenerFor(parsed.channels, parsed.eventName)
        },
        
        
        purgeListeners  : function () {
            this.rootChannel.destroy()
            
            this.rootChannel = new JooseX.Observable.Channel()
        },
        
        
        suspendEvents : function () {
            this.suspendCounter++
        },
        
        
        resumeEvents : function () {
            this.suspendCounter--
            
            if (this.suspendCounter < 0) this.suspendCounter = 0
        }
    }
});
;
/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
;
!function () {
    
    var REF      = 1    

    Class('Data.Visitor2', {
        
        has : {
            seenPlaceholder : {
                init        : {}
            },
            
            outOfDepthPlaceholder : {
                init        : {}
            },
            
            seen            : Joose.I.Object,
            
            maxDepth        : null
        },
            
        methods : {
            
            getClassNameFor : function (object) {
                if (Joose.O.isInstance(object))      return object.meta.name
                
                return Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/\]$/, '')
            },
            
            
            getRefAdr : function () {
                return REF++
            },
            
            
            assignRefAdrTo : function (object) {
                if (!object.__REFADR__) 
                    if (Object.defineProperty)
                        Object.defineProperty(object, '__REFADR__', { value : REF++ })
                    else
                        object.__REFADR__ = REF++
                
                return object.__REFADR__
            },
                
                
            isSeen : function (object) {
                return object.__REFADR__ && this.seen.hasOwnProperty(object.__REFADR__)
            },
            
            
            markSeenAs : function (object, result) {
                return this.seen[ object.__REFADR__ ] = result
            },
            
            
            hasSeenResultFor : function (object) {
                var ref = object.__REFADR__
                
                return this.seen.hasOwnProperty(ref) && this.seen[ ref ] != this.seenPlaceholder
            },
            
            
            visit : function (value, depth) {
                // will be false for NaN values
                if (depth > this.maxDepth)
                    return this.visitOutOfDepthValue(value, depth + 1)
                else
                    if (Object(value) === value)
                        if (this.isSeen(value)) 
                            return this.visitSeen(value, depth + 1)
                        else                        
                            return this.visitNotSeen(value, depth + 1)
                    else
                        return this.visitValue(value, depth + 1)
            },
            
            
            visitOutOfDepthValue : function (value, depth) {
                return this.outOfDepthPlaceholder
            },
            
            
            visitValue : function (value, depth) {
                return value
            },
            
            
            visitSeen : function (value, depth) {
                return this.seen[ value.__REFADR__ ]
            },
            
            
            getInitialSeenMarker : function (object, depth) {
                return this.seenPlaceholder
            },
            
            
            visitNotSeen : function (object, depth) {
                this.assignRefAdrTo(object)
                
                this.markSeenAs(object, this.getInitialSeenMarker(object, depth))
    
                
                if (Joose.O.isInstance(object)) return this.markSeenAs(object, this.visitJooseInstance(object, depth))
                
                
                var methodName = 'visit' + this.getClassNameFor(object)
                
                if (!this.meta.hasMethod(methodName)) methodName = 'visitObject' 
                
                return this.markSeenAs(object, this[ methodName ](object, depth))
            },
            
            
            visitArray  : function (array, depth) {
                Joose.A.each(array, function (value, index) {
                    
                    this.visitArrayEntry(value, index, array, depth)
                    
                }, this)
                
                return array
            },
            
            
            visitArrayEntry  : function (entry, index, array, depth) {
                return this.visit(entry, depth)
            },
            
            
            visitObject : function (object, depth) {
                
                Joose.O.eachOwn(object, function (value, key) {
                    
                    if (key != '__REFADR__') {
                        this.visitObjectKey(key, value, object, depth)
                        this.visitObjectValue(value, key, object, depth)
                    }
                    
                }, this)
                
                return object
            },
            
            
            visitJooseInstance : function (value, depth) {
                return this.visitObject(value, depth)
            },
            
            
            visitObjectKey : function (key, value, object, depth) {
                return this.visitValue(key, depth)
            },
            
            
            visitObjectValue : function (value, key, object, depth) {
                return this.visit(value, depth)
            }
        },
        
        
        my : {
            
            has : {
                HOST        : null
            },
            
            
            methods : {
                
                visit : function (value, maxDepth) {
                    var visitor     = new this.HOST({
                        maxDepth        : maxDepth || Infinity
                    })
                    
                    return visitor.visit(value, 0)
                }
            }
        }
    })    
    
}()


;
;
;
Class('Siesta.Util.Serializer', {
    
    isa : Data.Visitor2,
    
    has     : {
        result                  : Joose.I.Array,
        manualEnum              : function () {
            for (var i in { toString : 1 }) return false
            
            return true
        }
    },
    
    
    methods : {
        
        assignRefAdrTo : function (object) {
            try {
                return this.SUPER(object)
            } catch (e) {
                if (!object.__REFADR__) object.__REFADR__ = this.getRefAdr()
            }
            
            return object.__REFADR__
        },
        
        
        write : function (str) {
            this.result.push(str)
        },
        
        
        visitOutOfDepthValue : function (value, depth) {
            this.write('...')
        },
        
        
        visitValue : function (value) {
            if (value == null)
                // `null` and `undefined`
                this.write(value + '')
            else
                this.write(typeof value == 'string' ? '"' + value.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"' : value + '')
        },
        
        
        visitObjectKey : function (key, value, object) {
            this.write('"' + key + '": ')
        },
        
        
        getClassNameFor : function (object) {
            if (object.nodeType != null && object.nodeName != null && object.tagName) return 'DOMElement'
            
            // trying to detect and not dive into global window
            if (object.document != null && object.location != null && object.location.href != null) return 'Window'
            
            return this.SUPER(object)
        },
        
        
        visitSeen : function (value, depth) {
            this.write('[Circular]')
        },
        
        
        visitRegExp : function (value, depth) {
            this.write(value + '')
        },
        
        
        visitFunction : function (value, depth) {
            this.write('function ' + (value.name || '') + '() { ... }')
        },
        
        
        visitDate : function (value, depth) {
            this.write('"' + value + '"')
        },
        

        // safer alternative to parent's implementation of `visitObject` - some host objects has no "hasOwnProperty" method
        visitObject : function (object, depth) {
            for (var key in object) {
                if (key != '__REFADR__' && (!object.hasOwnProperty || object.hasOwnProperty(key))) {
                    var value   = object[ key ]
                    
                    this.visitObjectKey(key, value, object, depth)
                    this.visitObjectValue(value, key, object, depth)
                }
            }

            var me  = this
            
            if (this.manualEnum) 
                Joose.A.each([ 'hasOwnProperty', 'valueOf', 'toString', 'constructor' ], function (key) {
                    if (object.hasOwnProperty && object.hasOwnProperty(key)) {
                        var value   = object[ key ]
                        
                        me.visitObjectKey(key, value, object, depth)
                        me.visitObjectValue(value, key, object, depth)
                    }
                })
            
            return object
        },
        
        
        visitJooseInstance : function (value, depth) {
            if (value.meta.hasMethod('toString')) {
                this.write(value.toString())
                
                return value
            }
            
            return this.SUPERARG(arguments)
        },
        
        
        visitDOMElement : function (object, depth) {
            var output  = '&lt;' + object.tagName
            
            if (object.id) output += ' id="' + object.id + '"'
            if (object.className) output += ' class="' + object.className + '"'
            
            this.write(output + '&gt;')
        },
        
        
        visitDOMStringMap : function () {
            this.write('[DOMStringMap]')
        },
        
        
        // the Object.prototype.toString.call(window) for FF
        visitWindow : function () {
            this.write('[window]')
        },
        
        
        // window.location type in FF
        visitLocation : function () {
            this.write('[window.location]')
        }
    },
    
    
    before : {
        visitObject : function () {
            this.write('{')
        },
        
        
        visitArray : function () {
            this.write('[')
        }
    },
    
    
    after : {
        visitObject : function () {
            var result = this.result
            
            if (result[ result.length - 1 ] == ', ') result.pop()
            
            this.write('}')
        },
        
        
        visitArray : function () {
            var result = this.result
            
            if (result[ result.length - 1 ] == ', ') result.pop()
            
            this.write(']')
        },
        
        
        visitObjectValue : function () {
            this.write(', ')
        },
        
        
        visitArrayEntry : function () {
            this.write(', ')
        }
    },
    
    
    my : {
        
        has : {
            HOST        : null
        },
        
        
        methods : {
            
            stringify : function (value, maxDepth) {
                try {
                    if (value.foobar) visitor = null
                } catch (e) {
                    if (value) return 'Value from cross-domain context'
                }
                
                var visitor     = new this.HOST({
                    maxDepth        : maxDepth || 4
                })
                
                visitor.visit(value, 0)
                
                return visitor.result.join('')
            }
        }
    }
})
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
Role('Siesta.Util.Role.CanGetType', {
    
    methods : {
        
        /**
         * This method returns a result of `Object.prototype.toString` applied to the passed argument. The `[object` and trailing `]` are trimmed.
         *
         * @param {Mixed} object
         * @return {String} The name of the "type" for this object.
         */
        typeOf : function (object) {
            return Object.prototype.toString.call(object).slice(8, -1)
        }
    }
})
;
Class('Siesta.Util.Queue', {
    
    has     : {
        // array of Objects, each containing arbitrary data about queue step. Possibly keys:
        // `processor` - an individual processor function for this step
        // can also be provided for whole queue
        // will receive the: (stepData, index, queue)
        // `isAsync` - when provided, the `next` function will be also embedded,
        // which should be called manually
        // `interval` - the delay after step (except for asynchronous)
        steps                   : Joose.I.Array,

        interval                : 100,
        callbackDelay           : 0,
        // setTimeout
        deferer                 : { required : true },
        // clearTimeout - only required when "abort" is planned / possible
        deferClearer            : null,
        
        processor               : null,
        processorScope          : null,
        
        currentTimeout          : null,
        callback                : null,
        scope                   : null,
        isAborted               : false,
        
        observeTest             : null,

        currentDelayStepId      : null,
        
        isDestroyed             : false
    },
    
    
    methods : {
        
        // step is an object with
        // { 
        //      processor : func, 
        //      processorScope : obj,
        //      next : func (in case of async step, will be populated by queue)
        // }
        
        addStep : function (stepData) {
            this.addSyncStep(stepData)
        },
        
        
        addSyncStep : function (stepData) {
            this.steps.push(stepData)
        },
        
        
        addAsyncStep : function (stepData) {
            stepData.isAsync = true
            
            this.steps.push(stepData)
        },

        addDelayStep : function (delayMs) {
            var origSetTimeout = this.deferer;
            var me = this;

            this.addAsyncStep({
                processor : function(data) {
                    me.currentDelayStepId = origSetTimeout(data.next, delayMs || 500);
                }
            });
        },
        
        
        run : function (callback, scope) {
            this.callback   = callback
            this.scope      = scope
            
            // abort the queue, if the provided test instance has finalized (probably because of exception)
            this.observeTest && this.observeTest.on('testfinalize', function () { this.abort(true) }, this, { single : true })
            
            this.doSteps(this.steps.slice(), callback, scope)
        },
        
        
        abort : function (ignoreCallback) {
            if (this.isDestroyed) return
            
            this.isAborted      = true
            
            var deferClearer    = this.deferClearer
            
            if (!deferClearer) throw "Need `deferClearer` to be able to `abort` the queue"

            deferClearer(this.currentDelayStepId);
            deferClearer(this.currentTimeout)
            
            if (!ignoreCallback) this.callback.call(this.scope || this)
            
            this.destroy()
        },
        
        
        doSteps : function (steps, callback, scope) {
            this.currentTimeout = null
            
            var me          = this
            var deferer     = this.deferer
            var step        = steps.shift()
            
            if (this.isAborted) return
            
            if (step) {
                // Normally, the `doSteps` is called recursively for every step in the chain
                // but, steps may complete synchronously, which means, stack will grow
                // since some version, FF has smaller stack size than other browsers
                // and it starts behaving unstable when stack grows
                // because of that, we perform a special check if step has completed synchronously
                // and processing the next step in the same `doStep` context (in the loop), avoiding recursion
                
                // if `doOneStep` has returned `true`, then step has completed synchronously
                // and the flow did not recurse into `doSteps`
                // in this case we continue processing to the next step
                while (this.doOneStep(step, steps, callback, scope) && !this.isAborted) {
                    if (steps.length)
                        step = steps.shift()
                    else {
                        this.doSteps(steps, callback, scope)
                        break;
                    }
                }
            } else {
                if (callback)
                    if (this.callbackDelay)
                        deferer(function () {
                            if (!me.isAborted) { callback.call(scope || this); me.destroy() }
                        }, this.callbackDelay)
                    else {
                        callback.call(scope || this)
                        me.destroy()
                    }
            }
        },
        
        
        doOneStep : function (step, steps, callback, scope) {
            var me              = this
            var deferer         = this.deferer
            
            var processor       = step.processor || this.processor
            var processorScope  = step.processorScope || this.processorScope
            
            var index           = this.steps.length - steps.length - 1
            
            if (!processor) throw new Error("No process function found for step: " + index)
            
            if (step.isAsync) {
                var stepHasCompletedSynchronously   = false
                var processorHasCompleted           = false
                
                var next = step.next = function () {
                    // if at this point `processorHasCompleted` is still `false`, that means that "next" function
                    // has been called before the `processor` function has returned, and thus, step has completed 
                    // synchronously
                    // see the comment in `doSteps` why we treat this case differently
                    if (!processorHasCompleted)
                        stepHasCompletedSynchronously   = true
                    else
                        me.doSteps(steps, callback, scope)
                }
                
                // processor should call `next` to continue
                processor.call(processorScope || me, step, index, this, next)
                
                processorHasCompleted               = true
                
                if (stepHasCompletedSynchronously) return true
            } else {
                processor.call(processorScope || me, step, index, this)
                
                if (this.isAborted) return
                
                var interval = step.interval || me.interval
                
                if (interval) 
                    this.currentTimeout = deferer(function () {
                        me.doSteps(steps, callback, scope)    
                    }, interval)
                else
                    me.doSteps(steps, callback, scope)
            }
        },
        
        
        // help garbage collector to release the memory 
        destroy : function () {
            if (this.isDestroyed) return
            
            this.callback   = this.observeTest      = this.deferer = this.deferClearer = null
            this.processor  = this.processorScope   = null
            
            // cleanup paranoya, this shouldn't matter in general, since "next" here is from the same context
            for (var i = 0; i < this.steps.length; i++) this.steps[ i ].next = null
            this.steps          = null
            
            this.isDestroyed    = true
        }
    }
})
;
Class('Siesta.Util.XMLNode', {
    
    has     : {
        children        : Joose.I.Array,
        
        tag             : { required : true },
        attributes      : Joose.I.Object,
        
        textContent     : null,
        
        escapeTable     : {
            
            init    : {
                '&'     : '&amp;', 
                '<'     : '&lt;', 
                '>'     : '&gt;', 
                '"'     : '&quot;'
            }
        }
        
    },
    
    
    methods : {
        
        escapeXml : function (s) {
            var me = this
            
            return typeof s != 'string' ? s : s.replace(/[&<>"]/g, function (match) {
                return me.escapeTable[ match ]
            })
        },
        
        
        toString : function () {
            var me                  = this
            var childrenContent     = []
            
            Joose.A.each(this.children, function (child) {
                childrenContent.push(child.toString())
            })
            
            var attributesContent       = []
            
            Joose.O.each(this.attributes, function (value, name) {
                attributesContent.push(name + '="' + me.escapeXml(value) + '"')
            })
            
            // to have predictable order of attributes in tests
            attributesContent.sort()
            
            attributesContent.unshift(this.tag)
            
            
            return '<' + attributesContent.join(' ') + '>' + (this.textContent != null ? this.escapeXml(this.textContent) : '') + childrenContent.join('') + '</' + this.tag + '>' 
        },
        
        
        appendChild : function (child) {
            if (child instanceof Siesta.Util.XMLNode)
                child.parent    = this
            else
                child           = new Siesta.Util.XMLNode(Joose.O.extend(child, { parent : this }))
                
            this.children.push(child)
            
            return child
        },
        
        
        setAttribute : function (name, value) {
            this.attributes[ name ] = value
        }
    }
})
;
Class('Siesta.Util.Rect', {
    
    has     : {
        left            : null,
        top             : null,
        width           : null,
        height          : null,
        
        right           : null,
        bottom          : null
    },
    
    
    methods : {
        
        initialize : function () {
            var left        = this.left
            var width       = this.width
            var right       = this.right
            
            if (right == null && left != null && width != null) this.right = left + width - 1
            
            if (width == null && left != null && right != null) this.width = right - left + 1
            
            var top         = this.top
            var height      = this.height
            var bottom      = this.bottom
            
            if (bottom == null && top != null && height != null) this.bottom = top + height - 1
            
            if (height == null && top != null && bottom != null) this.height = bottom - top + 1
        },
        
        
        isEmpty : function () {
            return this.left == null
        },
        
        
        intersect : function (rect) {
            if (
                rect.isEmpty() || this.isEmpty()
                    ||
                rect.left > this.right || rect.right < this.left
                    ||
                rect.top > this.bottom || rect.bottom < this.top
            ) return this.my.getEmpty()
            
            return new this.constructor({
                left        : Math.max(this.left, rect.left),
                right       : Math.min(this.right, rect.right),
                top         : Math.max(this.top, rect.top),
                bottom      : Math.min(this.bottom, rect.bottom)
            })
        },
        
        
        contains : function (left, top) {
            return this.left <= left && left <= this.right 
                    && 
                this.top <= top && top <= this.bottom
        },
        
        
        cropLeftRight : function (rect) {
            return this.intersect(new this.constructor({
                left        : rect.left,
                right       : rect.right,
                top         : this.top,
                bottom      : this.bottom
            }))
        },
        
        
        cropTopBottom : function (rect) {
            return this.intersect(new this.constructor({
                left        : this.left,
                right       : this.right,
                top         : rect.top,
                bottom      : rect.bottom
            }))
        },
        
        
        equalsTo : function (rect) {
            return this.left == rect.left && this.right == rect.right && this.top == rect.top && this.bottom == rect.bottom
        }
    },
    
    
    // static methods/props
    my : {
        has : {
            HOST        : null
        }, 
        
        methods : {
            
            getEmpty : function () {
                return new this.HOST()
            }
        }
    }
})
;
Class('Siesta.Content.Resource', {
    
    has : {
        url             : null,
        
        content         : null
    },
    
    
    methods : {
        
        asHTML : function () {
            throw "Abstract method called"
        },
        
        
        asDescriptor : function () {
            throw "Abstract method called"
        },
        
        
        // todo should check same-origin 
        canCache : function () {
        }
        
    }
        
})
//eof Siesta.Result

;
Class('Siesta.Content.Resource.CSS', {
    
    isa     : Siesta.Content.Resource,
    
    has     : {
    },
    
    
    methods : {
        
        asHTML : function () {
        },
        
        
        asDescriptor : function () {
            var res = {
                type        : 'css'
            }
            
            if (this.url)       res.url         = this.url
            if (this.content)   res.content     = this.content
            
            return res
        }
    }
        
})
//eof Siesta.Result

;
Class('Siesta.Content.Resource.JavaScript', {
    
    isa     : Siesta.Content.Resource,
    
    has     : {
        instrument          : false
    },
    
    
    methods : {
        
        asHTML : function () {
        },
        
        
        asDescriptor : function () {
            var res = {
                type        : 'js'
            }
            
            if (this.url)       res.url         = this.url
            if (this.content)   res.content     = this.content
            
            return res
        }
    }
        
})
//eof Siesta.Result

;
Class('Siesta.Content.Preset', {
    
    has : {
        preload                 : Joose.I.Array,
        
        resources               : Joose.I.Array
    },
    
    
    methods : {
        
        initialize : function () {
            var me              = this
            
            Joose.A.each(this.preload, function (preloadDesc) {
                
                me.addResource(preloadDesc)
            })
        },
        
        
        isCSS : function (url) {
            return /\.css(\?.*)?$/i.test(url)
        },
        
        
        getResourceFromDescriptor : function (desc) {
            var constructor, config
            
            var CSS
            
            if (typeof desc == 'string') {
                constructor     = this.isCSS(desc) ? Siesta.Content.Resource.CSS : Siesta.Content.Resource.JavaScript
                
                config          = { url     : desc }
            } else if (desc.text) {
                constructor     = Siesta.Content.Resource.JavaScript
                config          = { content : desc.text }
                
            } else {
                if (!desc.url && !desc.content) throw "Incorrect preload descriptor:" + desc
                
                constructor     = desc.type && desc.type == 'css' || this.isCSS(desc.url) ? Siesta.Content.Resource.CSS : Siesta.Content.Resource.JavaScript
                
                config          = {}
                
                if (desc.url)           config.url          = desc.url
                if (desc.content)       config.content      = desc.content
                if (desc.instrument)    config.instrument   = desc.instrument
            }
            
            return new constructor(config)
        },
        
        
        addResource : function (desc) {
            var resource    = (desc instanceof Siesta.Content.Resource) && desc || this.getResourceFromDescriptor(desc)
            
            this.resources.push(resource)
            
            return resource
        },
        
        
        eachResource : function (func, scope) {
            return Joose.A.each(this.resources, func, scope || this)
        },
        
        
        // deprecated - seems preset doesn't need to know about scope providers
        prepareScope : function (scopeProvider, contentManager) {
            
            this.eachResource(function (resource) {
                
                if (contentManager.hasContentOf(resource))
                    scopeProvider.addPreload({
                        type        : (resource instanceof Siesta.Content.Resource.CSS) ? 'css' : 'js', 
                        content     : contentManager.getContentOf(resource)
                    })
                else 
                    scopeProvider.addPreload(resource.asDescriptor())
            })
        }
    }
        
})

;
Class('Siesta.Content.Manager', {
    
    has : {
        disabled        : false,
        
        presets         : {
            required    : true
        },
        
        urls            : Joose.I.Object,
        
        maxLoads        : 5,
        
        harness         : null
    },
    
    
    methods : {
        
        cache : function (callback, errback, ignoreErrors) {
            if (this.disabled) {
                callback && callback()
                
                return
            }
            
            var urls    = this.urls
            var me      = this
            
            Joose.A.each(this.presets, function (preset) {
                preset.eachResource(function (resource) {
                    if (resource.url) urls[ resource.url ] = null
                })
            })
            
            var loadCount   = 0
            var errorCount  = 0
            
            var urlsArray   = []
            
            Joose.O.each(urls, function (value, url) {
                // if some content has been already provided - skip it from caching
                if (!me.hasContentOf(url)) urlsArray.push(url) 
            })
            
            var total       = urlsArray.length
            
            if (total) {
                
                var loadSingle = function () {
                    if (!urlsArray.length) return
                    
                    var url     = urlsArray.shift()
                    
                    me.load(url, function (content) {
                        if (errorCount) return
                        
                        urls[ url ] = content
                        
                        if (++loadCount == total) 
                            callback && callback()
                        else
                            loadSingle()
                    
                    }, ignoreErrors ? function () {
                        
                        if (++loadCount == total) 
                            callback && callback()
                        else
                            loadSingle()
                        
                    } : function () {
                        errorCount++
                        
                        errback && errback(url)
                    })
                }
                
                // running only `maxLoads` "loading threads" at the same time
                for (var i = 0; i < this.maxLoads; i++) loadSingle()
                
            } else
                callback && callback()
        },
        
        
        load : function (url, callback, errback) {
            throw "abstract method `load` called"
        },
        
        
        addContent : function (url, content) {
            this.urls[ url ]    = content
        },
        
        
        hasContentOf : function (url) {
            if (url instanceof Siesta.Content.Resource) url = url.url
            
            return typeof this.urls[ url ] == 'string'
        },
        
        
        getContentOf : function (url) {
            if (url instanceof Siesta.Content.Resource) url = url.url
            
            return this.urls[ url ]
        }
    }
})

;
;
Class('Siesta', {
    /*PKGVERSION*/VERSION : '3.0.1',

    // "my" should been named "static"
    my : {
        
        has : {
            config          : null,
            activeHarness   : null
        },
        
        methods : {
        
            getConfigForTestScript : function (text) {
                try {
                    eval(text)
                    
                    return this.config
                } catch (e) {
                    return null
                }
            },
            
            
            StartTest : function (arg1, arg2) {
                if (typeof arg1 == 'object') 
                    this.config = arg1
                else if (typeof arg2 == 'object')
                    this.config = arg2
                else
                    this.config = null
            }
        }
    }
})

// fake StartTest function to extract test configs
if (typeof StartTest == 'undefined') StartTest = Siesta.StartTest
if (typeof startTest == 'undefined') startTest = Siesta.StartTest
if (typeof describe == 'undefined') describe = Siesta.StartTest;
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
;(function () {
    
var ID = 0

Class('Siesta.Result', {
    
    has : {
        description     : null,
        
        children        : Joose.I.Array,
        
        length          : 0,
        
        id              : function () {
            return ++ID
        },
        
        parent          : null
    },
    
    
    methods : {
        
        itemAt : function (i) {
            return this.children[ i ]
        },
        
        
        push        : function (result) {
            this.children.push(result)
            
            result.parent   = this
            
            this.length     = this.children.length
        },
        
        
        each : function (func, scope) {
            var children        = this.children
            
            if (func.call(scope || this, this) === false) return false
            
            for (var i = 0; i < children.length; i++)
                if (children[ i ].each(func, scope) === false) return false
        },
        
        
        eachChild : function (func, scope) {
            var children        = this.children
            
            for (var i = 0; i < children.length; i++)
                if (func.call(scope, children[ i ]) === false) return false
        },
        
        
        toString : function () {
            return this.description
        },
        
        
        toJSON : function () {
            return {
                type        : this.meta.name,
                description : this.description
            }
        },
        
        
        findChildById : function (id) {
            var child
            
            this.each(function (node) {
                if (node.id == id) { child = node; return false } 
            })
            
            return child
        }
    },
    
    // used for self-testing when we need different ids for outer context and context being tested
    my : {
        methods     : {
            seedID : function (value) {
                ID          = value
            }
        }
    }
        
})


})();
Class('Siesta.Result.Diagnostic', {
    
    isa : Siesta.Result,
    
    has : {
        isWarning           : false
    },

    methods : {
        
        toString : function () {
            return '# ' + this.description
        },
        
        
        toJSON : function () {
            var info        = {
                type            : this.meta.name,
                description     : this.description
            }
            
            if (this.isWarning) info.isWarning = true
            
            return info
        }
    }    
});

;
Class('Siesta.Result.Summary', {
    
    isa         : Siesta.Result,
    
    has         : {
        isFailed            : false
    },
    
    methods : {
        
        // summary should belong only to the top level Siesta.Result.SubTest instance
        getTest : function () {
            return this.parent.test
        },
        
        
        toString : function () {
            
        }
    }    
});

;
Class('Siesta.Result.Assertion', {
    
    isa : Siesta.Result,

    has : {
        name            : null,
        
        passed          : null,
        
        annotation      : null,
        
        index           : null,
        // stored as string
        sourceLine      : null,
        
        isSkipped       : false,
        isTodo          : false,
        
        isException     : false,
        exceptionType   : null,
        
        isWaitFor       : false,
        completed       : false      // for waitFor assertions
    },
    
    
    methods : {

        isPassed : function (raw) {
            if (raw) return this.passed
            
            if (this.isTodo) return true
            
            if (this.isWaitFor && !this.completed) return true
            
            return this.passed
        },
        
        
        toString : function () {
            var R = Siesta.Resource('Siesta.Result.Assertion');
            var text = (this.isTodo ? R.get('todoText') : '') + (this.passed ? R.get('passText') : R.get('failText')) + ' ' + this.index + ' - ' + this.description
            
            if (this.annotation) text += '\n' + this.annotation
            
            return text
        },
        
        
        toJSON : function () {
            var me      = this
            
            var info    = {
                type            : this.meta.name,
                passed          : this.passed,
                description     : String(this.description) || 'No description',
                annotation      : String(this.annotation)
            }
            
            // copy if true
            Joose.A.each([ 'isTodo', 'isWaitFor', 'isException', 'sourceLine', 'name' ], function (name) {
                if (me[ name ]) info[ name ] = me[ name ]
            })
            
            if (this.isException)   {
                info.exceptionType  = this.exceptionType
            }
            
            return info
        }
    }
})

;
Class('Siesta.Result.SubTest', {
    
    isa : Siesta.Result,
    

    has : {
        // reference to a test it belongs to
        // SubTests result instances will be set as `results` for sub tests instances
        test            : null
    },
    
    
    methods : {
        
        isWorking : function () {
            return !this.test.isFinished()
        },
        
        
        toJSON : function () {
            var test            = this.test
            
            // a flag that test instance does not belongs to the current context
            // this only happens during self-testing
            // if this is the case, in IE, calling any method from the test context will throw exception
            // "can't execute script from freed context", so we avoid calling any methods on the test in such case
            // accessing properties is ok though
            var isCrossContext  = !(test instanceof Object)
            
            var report      = {
                type            : this.meta.name,
                name            : test.name,
                
                startDate       : test.startDate,
                endDate         : test.endDate || (new Date() - 0),
                
                passed          : isCrossContext ? null : test.isPassed()
            }
            
            // top level test
            if (!test.parent)   {
                report.url          = test.url
                report.jUnitClass   = test.getJUnitClass()
                report.groups       = test.groups
            }
            
            if (test.specType)  report.bddSpecType  = test.specType
            
            var isFailed    = false
            var assertions  = []
            
            Joose.A.each(this.children, function (result) {
                if ((result instanceof Siesta.Result.Assertion) || (result instanceof Siesta.Result.Diagnostic) || (result instanceof Siesta.Result.SubTest)) {
                    var assertion   = result.toJSON()
                    
                    if (!assertion.passed && !assertion.isTodo) isFailed = true
                    
                    assertions.push(assertion)
                }
            })
            
            report.assertions       = assertions
            
            // see a comment above
            if (isCrossContext) {
                report.passed       = !(isFailed || test.failed || !test.endDate)
            }
            
            return report
        }
        
    }
})

;
/**
@class Siesta.Test.Function

This is a mixin, with helper methods for testing functionality relating to Functions (such as spies). This mixin is consumed by {@link Siesta.Test}

*/
Role('Siesta.Test.Function', {
    
    methods : {
         /**
         * This assertion passes if the function is called at least one time during the test life span.
         * 
         * @param {Function/String} fn The function itself or the name of the function on the host object (2nd argument)
         * @param {Object} host The "owner" of the method
         * @param {String} desc The description of the assertion.
         */
        isCalled : function(fn, obj, desc) {
            this.isCalledNTimes(fn, obj, 1, desc, true);
        },

        /**
         * This assertion passes if the function is called exactly one time during the test life span.
         *
         * @param {Function/String} fn The function itself or the name of the function on the host object (2nd argument)
         * @param {Object} host The "owner" of the method
         * @param {String} desc The description of the assertion.
         */
        isCalledOnce : function(fn, obj, desc) {
            this.isCalledNTimes(fn, obj, 1, desc, false);
        },

        /**
         * This assertion passes if the function is called exactly (n) times during the test life span.
         * 
         * @param {Function/String} fn The function itself or the name of the function on the host object (2nd argument)
         * @param {Object} host The "owner" of the method
         * @param {Number} n The expected number of calls
         * @param {String} desc The description of the assertion.
         */
        isCalledNTimes : function(fn, obj, n, desc, isGreaterEqual) {
            var me      = this,
                prop    = typeof fn === "string" ? fn : me.getPropertyName(obj, fn);

            var counter = 0;
            var R       = Siesta.Resource('Siesta.Test.Function');

            desc        = desc ? (desc + ' ') : '';

            this.on('beforetestfinalizeearly', function () {
                if (counter === n || (isGreaterEqual && counter > n)) {
                    me.pass(desc || (prop + ' ' + R.get('methodCalledExactly').replace('{n}', n)));
                } else {

                    me.fail(desc || prop, {
                        assertionName       : 'isCalledNTimes ' + prop,
                        got                 : counter, 
                        need                : n,
                        needDesc            : R.get("Need") + " " + (isGreaterEqual ? R.get('atLeast') : R.get('exactly')) + " "
                    });
                }
            });

            fn = obj[prop];
            obj[prop] = function () { counter++; return fn.apply(this, arguments); };
        },

        /**
         * This assertion passes if the function is not called during the test life span.
         * 
         * @param {Function/String} fn The function itself or the name of the function on the host object (2nd argument)
         * @param {Object} host The "owner" of the method
         * @param {Number} n The expected number of calls
         * @param {String} desc The description of the assertion.
         */
        isntCalled : function(fn, obj, desc) {
            this.isCalledNTimes(fn, obj, 0, desc);
        },

        getPropertyName : function(host, obj) {
            for (var o in host) {
                if (host[o] === obj) return o;
            }
        },

        /**
         * This assertion passes when the supplied class method is called exactly (n) times during the test life span.
         * Under "class method" here we mean the function in the prototype. Note, that this assertion counts calls to the method in *any* class instance.
         * 
         * The `className` parameter can be supplied as a class constructor function or as a string, representing the class
         * name. In the latter case the `class` will be eval'ed to get a reference to the class constructor.
         * 
         * For example:

    StartTest(function (t) {
    
        function machine(type, version) {
            this.machineInfo = {
                type        : type,
                version     : version
            };
        };
        
        machine.prototype.update = function (type, version) {
            this.setVersion(type);
            this.setType(version);
        };
        
        machine.prototype.setVersion = function (data) {
            this.machineInfo.version = data;
        };
        
        machine.prototype.setType = function (data) {
            this.machineInfo.type = data;
        };
        
        t.methodIsCalled("setVersion", machine, "Checking if method 'setVersion' has been called");
        t.methodIsCalled("setType", machine, "Checking if method 'setType' has been called");
        
        var m = new machine('rover', '0.1.2');
        
        m.update('3.2.1', 'New Rover');
    });
    
         *
         * This assertion is useful when testing for example an Ext JS class where event listeners are added during
         * class instantiation time, which means you need to observe the prototype method before instantiation.
         *
         * @param {Function/String} fn The function itself or the name of the method on the class (2nd argument)
         * @param {Function/String} className The constructor function or the name of the class that contains the method
         * @param {Number} n The expected number of calls
         * @param {String} desc The description of the assertion
         */
        methodIsCalledNTimes: function(fn, className, n, desc, isGreaterEqual){
            var me          = this,
                counter     = 0;
            var R           = Siesta.Resource('Siesta.Test.Function');

            desc            = desc ? (desc + ' ') : '';
            
            try {
                if (me.typeOf(className) == 'String') className = me.global.eval(className)
            } catch (e) {
                me.fail(desc, {
                    assertionName       : 'isMethodCalled',
                    annotation          : R.get('exceptionEvalutingClass').replace('{e}', e) + "[" + className + "]"
                })

                return
            }

            var prototype   = className.prototype;
            var prop        = typeof fn === "string" ? fn : me.getPropertyName(prototype, fn);

            me.on('beforetestfinalizeearly', function () {
                if (counter === n || (isGreaterEqual && counter > n)) {
                    me.pass(desc || (prop + ' ' + R.get('methodCalledExactly').replace('{n}', n)));
                } else {
                    me.fail(desc || prop, {
                        assertionName       : 'methodIsCalledNTimes ' + prop,
                        got                 : counter,
                        need                : n ,
                        needDesc            : R.get("Need") + " " + (isGreaterEqual ? R.get('atLeast') : R.get('exactly')) + " "
                    });
                }
            });

            fn                  = prototype[ prop ];
            prototype[ prop ]   = function () { counter++; return fn.apply(this, arguments); };
        },

        /**
         * This assertion passes if the class method is called at least one time during the test life span.
         * 
         * See {@link #methodIsCalledNTimes} for more details.
         *
         * @param {Function/String} fn The function itself or the name of the method on the class (2nd argument)
         * @param {Function/String} className The class constructor function or name of the class that contains the method
         * @param {String} desc The description of the assertion.
         */
        methodIsCalled : function(fn, className, desc) {
            this.methodIsCalledNTimes(fn, className, 1, desc, true);
        },

        /**
         * This assertion passes if the class method is not called during the test life span.
         * 
         * See {@link #methodIsCalledNTimes} for more details.
         *
         * @param {Function/String} fn The function itself or the name of the method on the class (2nd argument)
         * @param {Function/String} className The class constructor function or name of the class that contains the method
         * @param {String} desc The description of the assertion.
         */
        methodIsntCalled : function(fn, className, desc) {
            this.methodIsCalledNTimes(fn, className, 0, desc);
        }
    }
});
;
/**
@class Siesta.Test.Date

A mixin with the additinal assertions for dates. Being consumed by {@link Siesta.Test}

*/
Role('Siesta.Test.Date', {
    
    methods : {
        
        isDateEq: function (got, expectedDate, description) {
            this.isDateEqual.apply(this, arguments);
        },

        
        /**
         * This assertion passes when the 2 provided dates are equal and fails otherwise.
         * 
         * It has a synonym: `isDateEq`
         * 
         * @param {Date} got The 1st date to compare
         * @param {Date} expectedDate The 2nd date to compare
         * @param {String} [description] The description of the assertion
         */
        isDateEqual: function (got, expectedDate, description) {
            var R = Siesta.Resource('Siesta.Test.Date');

            if (got - expectedDate === 0) {
                this.pass(description, {
                    descTpl         : '{got} ' + R.get('isEqualTo') + ' {expectedDate}',
                    got             : got,
                    expectedDate    : expectedDate
                });
            } else {
                this.fail(description, {
                    assertionName   : 'isDateEqual',
                    
                    got             : got ? got.toString() : '',
                    gotDesc         : R.get('Got'),
                    
                    need            : expectedDate.toString()
                });
            }
        }
    }
});
;
/**
@class Siesta.Test.More

A mixin with additional generic assertion methods, which can work cross-platform between browsers and NodeJS. 
Is being consumed by {@link Siesta.Test}, so all of them are available in all tests. 

*/
Role('Siesta.Test.More', {
    
    requires        : [ 'isFailed', 'typeOf', 'on' ],
    
    
    has : {
        autoCheckGlobals        : false,
        expectedGlobals         : Joose.I.Array,

        disableGlobalsCheck     : false,
        
        browserGlobals : { 
            init : [
                'console',
                'getInterface',
                'ExtBox1',
                '__IE_DEVTOOLBAR_CONSOLE_COMMAND_LINE',
                /__BROWSERTOOLS/, // IE11 with console open
                'seleniumAlert',
                '_phantom', // phantomJS
                'callPhantom', // phantomJS
                'onload',
                'onerror', 
                'StartTest',
                'startTest',
                '__loaderInstrumentationHookInstalled__',
                'describe',
                // will be reported in IE8 after overriding
                'setTimeout',
                'clearTimeout',
                'requestAnimationFrame',
                'cancelAnimationFrame',
                '__coverage__',
                /__cov_\d+/
            ]
        },
        
        /**
         * @cfg {Number} waitForTimeout Default timeout for `waitFor` (in milliseconds). Default value is 10000. 
         */
        waitForTimeout          : 10000,
        
        waitForPollInterval     : 100
    },
    
    
    methods : {
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `>` operator will return `true` and fails otherwise. 
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isGreater : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 > value2)
                this.pass(desc, {
                    descTpl             : R.get('isGreaterPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isGreater',
                    
                    got                 : value1,
                    need                : value2,
                    
                    needDesc            : R.get('needGreaterThan')
                })
        },
        
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `<` operator will return `true` and fails otherwise. 
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isLess : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 < value2)
                this.pass(desc, {
                    descTpl             : R.get('isLessPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isLess',
                    
                    got                 : value1,
                    need                : value2,
                    
                    needDesc            : R.get('needLessThan')
                })
        },
        

        isGE : function () {
            this.isGreaterOrEqual.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `>=` operator will return `true` and fails otherwise. 
         * 
         * It has a synonym - `isGE`.
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isGreaterOrEqual : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 >= value2)
                this.pass(desc, {
                    descTpl             : R.get('isGreaterEqualPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isGreaterOrEqual',
                    
                    got                 : value1,
                    need                : value2,

                    needDesc            : R.get('needGreaterEqualTo')
                })
        },
        

        
        isLE : function () {
            this.isLessOrEqual.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the comparison of 1st with 2nd, using `<=` operator will return `true` and fails otherwise. 
         * 
         * It has a synonym - `isLE`.
         * 
         * @param {Number/Date} value1 The 1st value to compare
         * @param {Number/Date} value2 The 2nd value to compare
         * @param {String} desc The description of the assertion
         */
        isLessOrEqual : function (value1, value2, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (value1 <= value2)
                this.pass(desc, {
                    descTpl             : R.get('isLessEqualPassTpl'),
                    value1              : value1,
                    value2              : value2
                })
            else
                this.fail(desc, {
                    assertionName       : 'isLessOrEqual',
                    
                    got                 : value1,
                    need                : value2,

                    needDesc            : R.get('needLessEqualTo')
                })
        },
        
        
        /**
         * This assertion suppose to compare the numeric values. It passes when the passed values are approximately the same (the difference 
         * is withing a threshold). A threshold can be provided explicitly (when assertion is called with 4 arguments), 
         * or it will be set to 5% from the 1st value (when calling assertion with 3 arguments).
         * 
         * @param {Number} value1 The 1st value to compare
         * @param {Number} value2 The 2nd value to compare
         * @param {Number} threshHold The maximum allowed difference between values. This argument can be omited. 
         * @param {String} desc The description of the assertion
         */
        isApprox : function (value1, value2, threshHold, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (arguments.length == 2) threshHold  = Math.abs(value1 * 0.05)
            
            if (arguments.length == 3) {
                if (this.typeOf(threshHold) == 'String') {
                    desc            = threshHold
                    threshHold      = Math.abs(value1 * 0.05)
                }
            }
            
            // this function normalizes the fractional numbers to fixed point presentation
            // for example in JS: 1.05 - 1 = 0.050000000000000044
            // so what we do is: (1.05 * 10^2 - 1 * 10^2) / 10^2 = (105 - 100) / 100 = 0.05
            var subtract    = function (value1, value2) {
                var fractionalLength    = function (v) {
                    var afterPointPart = (v + '').split('.')[ 1 ]
                    
                    return afterPointPart && afterPointPart.length || 0
                }
                
                var maxLength           = Math.max(fractionalLength(value1), fractionalLength(value2))
                var k                   = Math.pow(10, maxLength);

                return (value1 * k - value2 * k) / k;
            };            
            
            if (Math.abs(subtract(value2, value1)) <= threshHold)
                this.pass(desc, {
                    descTpl             : R.get('isApproxToPassTpl'),
                    value1              : value1,
                    value2              : value2,
                    annotation          : value2 == value1 ? R.get('exactMatch') : (R.get('withinThreshold') + ': ' + threshHold)
                })
            else
                this.fail(desc, {
                    assertionName       : 'isApprox', 
                    got                 : value1, 
                    need                : value2, 
                    needDesc            : R.get('needApprox'),
                    annotation          : R.get('thresholdIs') + ': ' + threshHold
                })
        },
        
        
        /**
         * This assertion passes when the passed `string` matches to a regular expression `regex`. When `regex` is a string, 
         * assertion will check that it is a substring of `string`
         * 
         * @param {String} string The string to check for "likeness"
         * @param {String/RegExp} regex The regex against which to test the string, can be also a plain string
         * @param {String} desc The description of the assertion
         */
        like : function (string, regex, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(regex) == "RegExp")
            
                if (string.match(regex))
                    this.pass(desc, {
                        descTpl             : R.get('stringMatchesRe'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'like', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringMatching')
                    })
            else
             
                if (string.indexOf(regex) != -1)
                    this.pass(desc, {
                        descTpl             : R.get('stringHasSubstring'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'like', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringContaining')
                    })
        },
        
        /**
         * This method is the opposite of 'like', it adds failed assertion, when the string matches the passed regex.
         * 
         * @param {String} string The string to check for "unlikeness"
         * @param {String/RegExp} regex The regex against which to test the string, can be also a plain string
         * @param {String} desc The description of the assertion
         */
        unlike : function(string, regex, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(regex) == "RegExp")
            
                if (!string.match(regex))
                    this.pass(desc, {
                        descTpl             : R.get('stringNotMatchesRe'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'unlike', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringNotMatching')
                    })
            else
             
                if (string.indexOf(regex) == -1)
                    this.pass(desc, {
                        descTpl             : R.get('stringHasNoSubstring'),
                        string              : string,
                        regex               : regex
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'unlike', 
                        got                 : string, 
                        need                : regex, 
                        needDesc            : R.get('needStringNotContaining')
                    })
        },
        
        
        "throws" : function () {
            this.throwsOk.apply(this, arguments)
        },
        
        throws_ok : function () {
            this.throwsOk.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the `func` function throws the exception during executing, and the
         * stringified exception passes the 'like' assertion (with 'expected' parameter).
         * 
         * It has synonyms - `throws_ok` and `throws`.
         * 
         * @param {Function} func The function which supposed to throw an exception
         * @param {String/RegExp} expected The regex against which to test the stringified exception, can be also a plain string
         * @param {String} desc The description of the assertion
         */
        throwsOk : function (func, expected, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(func) != 'Function') throw new Error(R.get('throwsOkInvalid'))
            
            var e = this.getExceptionCatcher()(func)
            
            // assuming no one will throw undefined exception..
            if (e === undefined) {
                this.fail(desc, {
                    assertionName       : 'throws_ok', 
                    annotation          : R.get('didntThrow')
                })
                
                return
            }
            
            if (e instanceof this.getTestErrorClass())
                //IE uses non-standard 'description' property for error msg
                e = e.message || e.description
                
            e = '' + e
                
            if (this.typeOf(expected) == "RegExp")
            
                if (e.match(expected))
                    this.pass(desc, {
                        descTpl             : R.get('exMatchesRe'),
                        expected            : expected
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'throws_ok', 
                        got                 : e, 
                        gotDesc             : R.get('exceptionStringifiesTo'),
                        need                : expected, 
                        needDesc            : R.get('needStringMatching')
                    })
            else
             
                if (e.indexOf(expected) != -1)
                    this.pass(desc, {
                        descTpl             : R.get('exContainsSubstring'),
                        expected            : expected
                    })
                else
                    this.fail(desc, {
                        assertionName       : 'throws_ok', 
                        got                 : e,
                        gotDesc             : R.get('exceptionStringifiesTo'),
                        need                : expected,
                        needDesc            : R.get('needStringContaining')
                    })
        },
        
        
        
        lives_ok : function () {
            this.livesOk.apply(this, arguments)
        },
        
        lives : function () {
            this.livesOk.apply(this, arguments)
        },
        
        /**
         * This assertion passes, when the supplied `func` function doesn't throw an exception during execution.
         * 
         * This method has two synonyms: `lives_ok` and `lives`
         * 
         * @param {Function} func The function which is not supposed to throw an exception
         * @param {String} desc The description of the assertion
         */
        livesOk : function (func, desc) {
            if (this.typeOf(func) != 'Function') {
                func = [ desc, desc = func ][ 0 ]
            }

            var R       = Siesta.Resource('Siesta.Test.More');
            var e       = this.getExceptionCatcher()(func)
            
            if (e === undefined) 
                this.pass(desc, {
                    descTpl             : R.get('fnDoesntThrow')
                })
            else
                this.fail(desc, {
                    assertionName       : 'lives_ok', 
                    annotation          : R.get('fnThrew') + ': ' + e
                })
        },
        
        
        isa_ok : function (value, className, desc) {
            this.isInstanceOf(value, className, desc)
        },
        

        isaOk : function (value, className, desc) {
            this.isInstanceOf(value, className, desc)
        },
        
        /**
         * This assertion passes, when the supplied `value` is the instance of the `className`. The check is performed with
         * `instanceof` operator. The `className` parameter can be supplied as class constructor or as string, representing the class
         * name. In the latter case the `class` will eval'ed to receive the class constructor.
         * 
         * This method has synonyms: `isaOk`, `isa_ok`
         * 
         * @param {Mixed} value The value to check for 'isa' relationship
         * @param {Class/String} className The class to check for 'isa' relationship with `value`
         * @param {String} desc The description of the assertion
         */
        isInstanceOf : function (value, className, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            try {
                if (this.typeOf(className) == 'String') className = this.global.eval(className)
            } catch (e) {
                this.fail(desc, {
                    assertionName       : 'isa_ok', 
                    annotation          : Siesta.Resource('Siesta.Test.Function', 'exceptionEvalutingClass')
                })
                
                return
            }
            
            if (value instanceof className) 
                this.pass(desc, {
                    descTpl             : R.get('isInstanceOfPass')
                })
            else
                this.fail(desc, {
                    assertionName       : 'isa_ok', 
                    got                 : value, 
                    need                : String(className), 
                    needDesc            : R.get('needInstanceOf')
                })
        },
        
        
        /**
         * This assertion passes, if supplied value is a String.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isString : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'String')
                this.pass(desc, {
                    descTpl     : R.get('isAString'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aStringValue')
                })
        },
        
        
        /**
         * This assertion passes, if supplied value is an Object
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isObject : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Object')
                this.pass(desc, {
                    descTpl     : R.get('isAnObject'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('anObject')
                })
        },
        

        /**
         * This assertion passes, if supplied value is an Array
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isArray : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Array')
                this.pass(desc, {
                    descTpl     : R.get('isAnArray'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('anArrayValue')
                })
        },


        /**
         * This assertion passes, if supplied value is a Number.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isNumber : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Number')
                this.pass(desc, {
                    descTpl     : R.get('isANumber'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aNumberValue')
                })
        },


        /**
         * This assertion passes, if supplied value is a Boolean.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isBoolean : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Boolean')
                this.pass(desc, {
                    descTpl     : R.get('isABoolean'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aBooleanValue')
                })
        },

        
        /**
         * This assertion passes, if supplied value is a Date.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isDate : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Date')
                this.pass(desc, {
                    descTpl     : R.get('isADate'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aDateValue')
                })
        },

        
        /**
         * This assertion passes, if supplied value is a RegExp.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isRegExp : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'RegExp')
                this.pass(desc, {
                    descTpl     : R.get('isARe'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aReValue')
                })
        },
        
        
        /**
         * This assertion passes, if supplied value is a Function.
         * 
         * @param {Mixed} value The value to check.
         * @param {String} desc The description of the assertion
         */
        isFunction : function (value, desc) {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.typeOf(value) == 'Function')
                this.pass(desc, {
                    descTpl     : R.get('isAFunction'),
                    value       : value
                })
            else
                this.fail(desc, {
                    got         : value,
                    need        : R.get('aFunctionValue')
                })
        },        
        
        
        is_deeply : function (obj1, obj2, desc) {
            this.isDeeply.apply(this, arguments)
        },
        
        /**
         * This assertion passes when in-depth comparison of 1st and 2nd arguments (which are assumed to be JSON objects) shows that they are equal.
         * Comparison is performed with '==' operator, so `[ 1 ]` and `[ "1" ] objects will be equal. The objects should not contain cyclic references.
         * 
         * This method works correctly with the *placeholders* generated with method {@link #any}.
         * 
         * This method has a synonym: `is_deeply`
         * 
         * @param {Object} obj1 The 1st object to compare
         * @param {Object} obj2 The 2nd object to compare
         * @param {String} desc The description of the assertion
         */
        isDeeply : function (obj1, obj2, desc) {

            if (this.typeOf(obj1) === this.typeOf(obj2) && this.compareObjects(obj1, obj2)) {
                var R       = Siesta.Resource('Siesta.Test.More');

                this.pass(desc, {
                    descTpl             : R.get('isDeeplyPassTpl'),
                    obj1                : obj1,
                    obj2                : obj2
                })
            }
            else
                this.fail(desc, {
                    assertionName       : 'isDeeply', 
                    got                 : obj1, 
                    need                : obj2 
                })
        },
        
        
        /**
         * This assertion passes when in-depth comparison of 1st and 2nd arguments (which are assumed to be JSON objects) shows that they are equal.
         * Comparison is performed with '===' operator, so `[ 1 ]` and `[ "1" ] objects will be different. The objects should not contain cyclic references.
         * 
         * This method works correctly with the *placeholders* generated with method {@link #any}.
         * 
         * @param {Object} obj1 The 1st object to compare
         * @param {Object} obj2 The 2nd object to compare
         * @param {String} desc The description of the assertion
         */
        isDeeplyStrict : function (obj1, obj2, desc) {
            if (this.typeOf(obj1) === this.typeOf(obj2) && this.compareObjects(obj1, obj2, true)) {

                var R       = Siesta.Resource('Siesta.Test.More');

                this.pass(desc, {
                    descTpl             : R.get('isDeeplyStrictPassTpl'),
                    obj1                : obj1,
                    obj2                : obj2
                })
            }
            else
                this.fail(desc, {
                    assertionName       : 'isDeeplyStrict', 
                    got                 : obj1, 
                    need                : obj2 
                })
        },
        
        expectGlobal : function () {
            this.expectGlobals.apply(this, arguments)
        },
        
        
        /**
         * This method accepts a variable number of names of expected properties in the global scope. When verifying the globals with {@link #verifyGlobals}
         * assertions, the expected gloabls will not be counted as failed assertions.
         * 
         * This method has a synonym with singular name: `expectGlobal`
         * 
         * @param {String/RegExp} name1 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} name2 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} nameN The name of global property or the regular expression to match several properties
         */
        expectGlobals : function () {
            this.expectedGlobals.push.apply(this.expectedGlobals, arguments)
        },
        
        
        isGlobalExpected : function (name, index) {
            var me                  = this
            
            if (!index || index && !index.expectedStrings) {
                if (!index) index   = {}
                
                Joose.O.extend(index, {
                    expectedStrings     : {},
                    expectedRegExps     : []
                })
                
                Joose.A.each(this.expectedGlobals.concat(this.browserGlobals), function (value) {
                    if (me.typeOf(value) == 'RegExp')
                        index.expectedRegExps.push(value)
                    else
                        index.expectedStrings[ value ] = true 
                })
            }
            
            if (index.expectedStrings[ name ]) return true
            
            var imageWithIdCreatesGlobalEnumerable  = Siesta.Harness.Browser.FeatureSupport().supports.imageWithIdCreatesGlobalEnumerable;
            
            // remove after https://bugzilla.mozilla.org/show_bug.cgi?id=959992 will be fixed
            if (imageWithIdCreatesGlobalEnumerable) {
                var domEl       = this.global.document.getElementById(name)
                
                if (domEl && domEl.tagName.toLowerCase() == 'img') return true;
            }
                
            for (var i = 0; i < index.expectedRegExps.length; i++)
                if (index.expectedRegExps[ i ].test(name)) return true
            
            return false
        },
        
        
        forEachUnexpectedGlobal : function (func, scope) {
            scope                   = scope || this
            
            var index               = {}
            
            for (var name in this.global) 
                if (!this.isGlobalExpected(name, index)) func.call(scope, name)
        },
        
        
        /**
         * This method accepts a variable number of names of expected properties in the global scope and then performs a globals check. 
         *
         * It will scan all globals properties in the scope of test and compare them with the list of expected globals. Expected globals can be provided with:
         * {@link #expectGlobals} method or {@link Siesta.Harness#expectedGlobals expectedGlobals} configuration option of harness.
         * 
         * You can enable this assertion to automatically happen at the end of each test, using {@link Siesta.Harness#autoCheckGlobals autoCheckGlobals} option of the harness.
         * 
         * @param {String/RegExp} name1 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} name2 The name of global property or the regular expression to match several properties
         * @param {String/RegExp} nameN The name of global property or the regular expression to match several properties
         */
        verifyGlobals : function () {
            var R       = Siesta.Resource('Siesta.Test.More');

            if (this.disableGlobalsCheck) {
                this.diag(R.get('globalCheckNotSupported'));
                
                return
            }
            
            this.expectGlobals.apply(this, arguments)
            
            this.diag(R.get('globalVariables'))
            
            var failed          = false
            
            this.forEachUnexpectedGlobal(function (name) {
                this.fail(
                    R.get('globalFound'), 
                    R.get('globalName') + ': ' + name + ', ' + R.get('value') + ': ' + Siesta.Util.Serializer.stringify(this.global[ name ])
                )
                
                failed      = true
            })
            
            if (!failed) this.pass(R.get('noGlobalsFound'))
        },
        
        
        // will create a half-realized, "phantom", "isWaitFor" assertion, which is only purposed
        // for user to get the instant feedback about "waitFor" actions
        // this assertion will be "finalized" and added to the test results in the "finalizeWaiting"
        startWaiting : function (description, sourceLine) {
            var result = new Siesta.Result.Assertion({
                description     : description,
                isWaitFor       : true,
                sourceLine      : sourceLine
            });
            
            this.fireEvent('testupdate', this, result, this.getResults())
            
            return result;
        },
        
        
        finalizeWaiting : function (result, passed, desc, annotation, errback) {
            // Treat this is an ordinary assertion from now on
            result.completed = true;
            
            if (passed)
                this.pass(desc, annotation, result)
            else {
                this.fail(desc, annotation, result);
                
                errback && errback()
            }
        },
        
        
        /**
         * Waits for passed checker method to return true (or any non-false value, like for example DOM element or array), and calls the callback when this happens.
         * As an additional feature, the callback will receive the result from the checker method as the 1st argument.
         * 

    t.waitFor(
        function () { return document.getElementById('someEl') },
        function (el) {
            // waited for element #someEl to appear
            // element will be available in the callback as 1st argument "el"
        }
    )

         * You can also call this method with a single Object having the following properties: `method`, `callback`, `scope`, `timeout`, `interval`:

    t.waitFor({
        method      : function () { return document.getElementById('someEl') },
        callback    : function (el) {
            // waited for element #someEl to appear
            // element will be available in the callback as 1st argument "el"
        }
    })

         * 
         * @param {Object/Function/Number} method Either a function which should return true when a certain condition has been fulfilled, or a number of ms to wait before calling the callback. 
         * @param {Function} callback A function to call when the condition has been met. Will receive a result from checker function.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time (in milliseconds) to wait for the condition to be fulfilled. 
         * Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. If condition is not fullfilled within this time, a failed assertion will be added to the test. 
         * @param {Int} [interval=100] The polling interval (in milliseconds)
         * 
         * @return {Object} An object with the following properties:
         * @return {Function} return.force A function, that will force this wait operation to immediately complete (and call the callback). 
         * No call to checker will be performed and callback will not receive a result from it. 
         */
        waitFor : function (method, callback, scope, timeout, interval)  {
            var R                       = Siesta.Resource('Siesta.Test.More');
            var description             = ' ' + R.get('conditionToBeFulfilled');
            var assertionName           = 'waitFor';
            var me                      = this;
            var sourceLine              = me.getSourceLine();
            var originalSetTimeout      = me.originalSetTimeout;
            var originalClearTimeout    = me.originalClearTimeout;
            var errback;

            if (arguments.length === 1 && this.typeOf(method) == 'Object') {
                var options     = method;
                
                method          = options.method;
                callback        = options.callback;
                scope           = options.scope;
                timeout         = options.timeout;
                interval        = options.interval
                
                description     = options.description || description;
                assertionName   = options.assertionName || assertionName;
                
                // errback is called in case "waitFor" has failed
                errback         = options.errback
            }
            
            var isWaitingForTime        = this.typeOf(method) == 'Number'

            callback                    = callback || function () {}
            description                 = isWaitingForTime ? (method + ' ' + R.get('ms')) : description;

            var pollTimeout
            
            // early notification about the started "waitFor" operation
            var waitAssertion           = me.startWaiting(R.get('waitingFor') + ' ' + description, sourceLine);
            
            interval                    = interval || this.waitForPollInterval
            timeout                     = timeout || this.waitForTimeout
            
            // this async frame is not supposed to fail, because it's delayed to `timeout + 3 * interval`
            // failure supposed to be generated in the "pollFunc" and this async frame to be closed
            // however, in IE the async frame may end earlier than failure from "pollFunc"
            // in such case we report the same error as in "pollFunc"
            var async                   = this.beginAsync((isWaitingForTime ? method : timeout) + 3 * interval, function () {
                originalClearTimeout(pollTimeout)
                
                me.finalizeWaiting(waitAssertion, false, R.get('waitedTooLong') + ': ' + description, {
                    assertionName       : assertionName,
                    annotation          : R.get('conditionNotFulfilled') + ' ' + timeout + R.get('ms')
                }, errback)
                
                return true
            })
            
            var isDone      = false

            // stop polling, if this test instance has finalized (probably because of exception)
            this.on('beforetestfinalize', function () {
                if (!isDone) {
                    isDone      = true
                    
                    me.finalizeWaiting(waitAssertion, false, R.get('waitingAborted'));
                    me.endAsync(async)
                    
                    originalClearTimeout(pollTimeout)
                }
            }, null, { single : true })

            if (isWaitingForTime) {
                pollTimeout = originalSetTimeout(function() {
                    isDone      = true
                    
                    me.finalizeWaiting(waitAssertion, true, R.get('Waited') + ' ' + method + ' ' + R.get('ms'));
                    me.endAsync(async);
                    me.processCallbackFromTest(callback, [], scope || me)
                }, method);
                
            } else {

                var result;
                var startDate   = new Date()
            
                var pollFunc    = function () {
                    var time = new Date() - startDate;
                    
                    if (time > timeout) {
                        me.endAsync(async);

                        me.finalizeWaiting(waitAssertion, false, R.get('waitedTooLong') + ': ' + description, {
                            assertionName       : assertionName,
                            annotation          : R.get('conditionNotFulfilled') + ' ' + timeout + R.get('ms')
                        }, errback)
                        
                        isDone      = true
                    
                        return
                    }
                
                    try {
                        result = method.call(scope || me);
                    } catch (e) {
                        me.endAsync(async);
                    
                        me.finalizeWaiting(waitAssertion, false, assertionName + ' ' + R.get('checkerException'), {
                            assertionName       : assertionName,
                            got                 : e.toString(),
                            gotDesc             : R.get('Exception')
                        }, errback)
                    
                        isDone      = true
                        
                        return
                    }
                
                    if (result != null && result !== false) {
                        me.endAsync(async);
                        
                        isDone      = true
                        
                        me.finalizeWaiting(waitAssertion, true, R.get('Waited') + ' ' + time + ' ' + R.get('msFor') + ' ' + description);
                        
                        me.processCallbackFromTest(callback, [ result ], scope || me)
                    } else 
                        pollTimeout = originalSetTimeout(pollFunc, interval)
                }
            
                pollFunc()
            }
            
            return {
                force : function () {
                    // wait operation already completed 
                    if (isDone) return
                    
                    isDone      = true
                    
                    originalClearTimeout(pollTimeout)
                    
                    me.endAsync(async);
                    
                    me.finalizeWaiting(waitAssertion, true, R.get('forcedWaitFinalization') + ' ' + description);
                    
                    me.processCallbackFromTest(callback, [], scope || me)
                }
            }
        },

        /**
         * Waits for the number of a number millseconds and calls the callback when after waiting. This is just a convenience synonym for the {@link #waitFor} method.

         t.waitForMs(1500, callback)

         *
         * @param {Number} method The number of ms to wait before calling the callback.
         * @param {Function} callback A function to call when the condition has been met. Will receive a result from checker function.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time (in milliseconds) to wait for the condition to be fulfilled.
         * Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. If condition is not fullfilled within this time, a failed assertion will be added to the test.
         * @param {Int} [interval=100] The polling interval (in milliseconds)
         *
         * @return {Object} An object with the following properties:
         * @return {Function} return.force A function, that will force this wait operation to immediately complete (and call the callback).
         * No call to checker will be performed and callback will not receive a result from it.
         */
        waitForMs : function() {
            return this.waitFor.apply(this, arguments);
        },
        

        /**
         * Waits for the passed checker method to return true (or any non-false value, like for example DOM element or array), and calls the callback when this happens.
         * This is just a convenience synonym for the {@link #waitFor} method.
         *

         t.waitForFn(function() { return true; }, callback)

         *
         * @param {Function} fn The checker function.
         * @param {Function} callback A function to call when the condition has been met. Will receive a result from checker function.
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time (in milliseconds) to wait for the condition to be fulfilled.
         * Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. If condition is not fullfilled within this time, a failed assertion will be added to the test.
         * @param {Int} [interval=100] The polling interval (in milliseconds)
         *
         * @return {Object} An object with the following properties:
         * @return {Function} return.force A function, that will force this wait operation to immediately complete (and call the callback).
         * No call to checker will be performed and callback will not receive a result from it.
         */
        waitForFn : function() {
            return this.waitFor.apply(this, arguments);
        },
        
        // takes the step function and tries to analyze if it is missing the call to "next"
        // returns "true" if "next" is used, 
        analyzeChainStep : function (func) {
            var sources         = func.toString()
            var firstArg        = sources.match(/function\s*[^(]*\(\s*(.*?)\s*(?:,|\))/)[ 1 ]
                        
            if (!firstArg) return false
            
            var body            = sources.match(/\{([\s\S]*)\}/)[ 1 ]
            
            return body.indexOf(firstArg) != -1
        },
        
        
        /**
         * This method accepts a variable number of steps, either as individual arguments or as a single array containing them. Steps and arrays
         * of steps are handled just fine, and any step-arrays passed will be flattened. Each step should be either a function or configuration 
         * object for {@link Siesta.Test.Action test actions}. These functions / actions will be executed in order.
         * 
         * 1) For a function step, it will receive a callback as the 1st argument, to call when the step is completed.
         * As the 2nd and further arguments, the step function will receive the arguments passed to the previous callback.
         * 
         * The last step will receive a no-op callback, which can be ignored or still called. **Note**, that last step is assumed to
         * complete synchronously! If you need to launch some asynchronous process in the last step, you may need to add another empty function step
         * to the end of the chain.
         * 
         * 2) For Siesta.Test.Action objects, the callback will be called by the action class automatically,
         * there's no need to provide any callback manually. The configuration object should contain an "action" property, specifying the action class
         * along with other config options depending on the action class. For brevity, instead of using the "action" property, the configuration
         * object can contain the property corresponding to the action name itself, with the action's target (or even a test method with arguments).
         * See the following examples and also refer to the documentation of the action classes. 
         * 
         * If the configuration object will contain a "desc" property, a passing assertion with its value will be added to the test, after this step has completed.
         * 
         * 3) If a step is a sub test instance, created with {@link #getSubTest} method, then the step will launch it.
         * 
         * It's better to see how it works in action. For example, when using using only functions:
         
    t.chain(
        // function receives a callback as 1st argument
        function (next) {
            // we pass that callback to the "click" method
            t.click(buttonEl, next)
        },
        function (next) {
            t.type(fieldEl, 'Something', next)
        },
        function (next) {
            t.is(fieldEl.value == 'Something', 'Correct value in the field')
            
            // call the callback with some arguments
            next('foo', 'bar')  
        }, 
        // those arguments are now available as arguments of next step
        function (next, value1, value2) {
            t.is(value1, 'foo', 'The arguments for the callback are translated to the arguments of the step')
            t.is(value2, 'bar', 'The arguments for the callback are translated to the arguments of the step')
        }
    )

         * 
         * The same example, using action configuration objects for first 2 steps. For the list of available actions 
         * please refer to the classes in the `Siesta.Test.Action` namespace.
         
    t.chain(
        {
            action      : 'click',
            target      : buttonEl,
            desc        : "Clicked on the button"
        },
        // or
        {
            click       : buttonEl,
            desc        : "Clicked on the button"
        },

        {
            action      : 'type',
            target      : fieldEl,
            text        : 'Something',
            desc        : "Typed in the field"
        },
        // or
        {
            type        : 'Something',
            target      : fieldEl,
            desc        : "Typed in the field"
        },
        
        {
            waitFor     : 'Selector',
            args        : '.selector'
        }
        // or, using Siesta.Test.Action.MethodCall notation:
        {
            waitForSelector : '.selector'
        }
        
        function (next) {
            t.is(fieldEl.value == 'Something', 'Correct value in the field')
            
            next('foo', 'bar')  
        }, 
        ...
    )
    
         * Please note, that by default, each step is expected to complete within the {@link Siesta.Harness#defaultTimeout} time. 
         * You can change this with the `timeout` property of the step configuration object, allowing some steps to last longer.
         * Steps with sub-tests are expected to complete within {@link Siesta.Harness#subTestTimeout}.
         * 
         * In a special case, `action` property of the step configuration object can be a function. In this case you can also 
         * provide a `timeout` property, otherwise this case is identical to using functions:
         *  

    t.chain(
        {
            action      : function (next) { ... },
            // allow 50s for the function to call "next" before step will be considered timed-out
            timeout     : 50000
        },
        ...
    )
    
         *  **Tip**:
         *  
         *  If a step is presented with a `null` or `undefined` value it will be ignored. Additionally, a step can be
         *  an array of steps - all arrays passed to t.chain will be flattened.
         *  
         *  These tips allows us to implement conditional steps processing, like this:
         *  

    var el1IsInDom          = t.$('.some-class1')[ 0 ]
    var el2IsInDom          = t.$('.some-class2')[ 0 ]
    
    t.chain(
        { click : '.some-other-el' },
        
        el1IsInDom ? [
            { click : el1IsInDom },
            
            el2IsInDom ? [
                { click : el1IsInDom }
            ] : null,
        ] : null,
        
        ...
    )

         *
         *  See also : {@link #chainForArray}.
         *  
         *  @param {Function/Object/Array} step1 The function to execute or action configuration, or an array of steps
         *  @param {Function/Object} step2 The function to execute or action configuration
         *  @param {Function/Object} stepN The function to execute or action configuration
         */
        chain : function () {
            // inline any arrays in the arguments into one array
            var steps       = this.flattenArray(arguments)
            var R           = Siesta.Resource('Siesta.Test.More');

            var nonEmpty    = []
            Joose.A.each(steps, function (step) { if (step) nonEmpty.push(step) })
            
            steps           = nonEmpty
            
            var len         = steps.length
            
            // do nothing
            if (!len) return;
            
            var me          = this
            var self        = arguments.callee
            
            var queue       = new Siesta.Util.Queue({
                deferer         : this.originalSetTimeout,
                deferClearer    : this.originalClearTimeout,
                
                interval        : self.hasOwnProperty('actionDelay') ? self.actionDelay : this.actionDelay,
                
                observeTest     : this
            })
            
            // hack to allow configuration of `actionDelay`...
            delete self.actionDelay
            
            var sourceLine  = me.getSourceLine();
            
            var args        = []
            
            Joose.A.each(steps, function (step, index) {
                
                var isLast      = index == len - 1
                
                queue.addAsyncStep({
                    processor : function (data) {
                        var isStepWithOwnAsyncFrame  = step.action == 'wait' || step.waitFor || (step instanceof Siesta.Test)
                        
                        if (!isStepWithOwnAsyncFrame) {
                            var timeout     = step.timeout || me.defaultTimeout
                            
                            // + 100 to allow `waitFor` steps (which will be waiting the `timeout` time) to
                            // generate their own failures
                            var async       = me.beginAsync(timeout + 100, function () {
                                me.fail(
                                    R.get('chainStepNotCompleted'),
                                    {
                                        sourceLine      : sourceLine,
                                        annotation      : R.get('stepNumber') + ': ' + (index + 1) + ' ' + R.get('oneBased') + (sourceLine ? ('\n' + R.get('atLine') + ': ' + sourceLine) : ''),
                                        ownTextOnly     : true
                                    }
                                )
                                
                                return true
                            })
                        }
                        
                        var nextFunc    = function () {
                            var self    = arguments.callee
                            if (self.__CALLED__) me.fail(R.get('calledMoreThanOnce', { num : index + 1, line : sourceLine }))
                            
                            self.__CALLED__ = true
                            
                            if (!isStepWithOwnAsyncFrame) me.endAsync(async)
                            
                            args    =  Array.prototype.slice.call(arguments);
                            
                            if (step.desc) {
                                me.pass(step.desc);
                            }
                            data.next()
                        }
                        
                        if (step instanceof Siesta.Test) {
                            me.launchSubTest(step, nextFunc)
                        } else if (me.typeOf(step) == 'Function' || me.typeOf(step.action) == 'Function') {
                            var func    = me.typeOf(step) == 'Function' ? step : step.action
                            
                            // if the last step is a function - then provide "null" as the "next" callback for it
                            args.unshift(isLast ? function () {} : nextFunc)
                            
                            if (!isLast && !me.analyzeChainStep(func)) me.fail(R.get('stepFn') + ' [' + func.toString() + '] ' + R.get('notUsingNext'))
                            
                            if (me.transparentEx)
                                func.apply(me, args)
                            else {
                                var e = me.getExceptionCatcher()(function () {
                                    func.apply(me, args)
                                })
                                
                                if (e !== undefined) {
                                    me.fail(R.get('chainStepEx'), { annotation : me.stringifyException(e) })
                                }
                            }
                            
                            // and finalize the async frame manually, as the "nextFunc" for last step will never be called
                            isLast && me.endAsync(async)
                            
                        } else if (me.typeOf(step) == 'String') {
                            var action      = new Siesta.Test.Action.Eval({
                                actionString        : step,
                                next                : nextFunc,
                                test                : me
                            })
                            
                            action.process()
                            
                        } else {
                            step.next       = nextFunc
                            step.test       = me
                            
                            var action      = Siesta.Test.ActionRegistry().create(step, me, args)
                            
                            action.process()
                        }
                    } 
                })
            })
            
            queue.run()
        },
        
        
        /**
         * This is a wrapper around the {@link #chain} method, which allows you to run the chain over the steps, generated from the elements
         * of some array. For example, if in some step of outer chain, we need to click the elements with ids, given as the array, we can do:
         *

    function (next) {
        var ids     = [ 'button-1', 'button-2', 'button-3' ]
        
        t.chainForArray(ids, function (elId) {
            return { click : '#' + elId }
        }, next)
    }
         * 
         * @param {Array} array An array with arbitrary elements
         * @param {Function} generator A function, which will be called for every element of the `array`. It should return
         * a chain step, generated from that element. This function can return an array of steps as well. If generator will return `null` or 
         * `undefined` nothing will be added to the chain.
         * @param {Function} generator.el An element of the `array`
         * @param {Function} generator.index An index of the element
         * @param {Function} [callback] A function to call, once the chain is completed.
         */
        chainForArray : function (array, generator, callback, reverse) {
            var me          = this
            var steps       = []
            
            Joose.A[ reverse ? 'eachR' : 'each' ](array, function (el, index) {
                var res     = generator.call(me, el, index)
                
                if (me.typeOf(res) == 'Array') 
                    steps.push.apply(steps, res)
                else
                    if (res) steps.push(res)
            })
            
            if (callback) steps.push(function () {
                me.processCallbackFromTest(callback)
            })
            
            this.chain(steps)
        },
        
        
        verifyExpectedNumber : function (actual, expected) {
            var operator        = '=='
            
            if (this.typeOf(expected) == 'String') {
                var match       = /([<>=]=?)\s*(\d+)/.exec(expected)
                var R               = Siesta.Resource('Siesta.Test.Browser');

                if (!match) throw new Error(R.get('wrongFormat')  + ": " + expected)
                
                operator        = match[ 1 ]
                expected        = Number(match[ 2 ])
            }
            
            switch (operator) {
                case '==' : return actual == expected
                case '<=' : return actual <= expected
                case '>=' : return actual >= expected
                case '<' : return actual < expected
                case '>' : return actual > expected
            }
        }
    },
    
    
    after : {
        
        initialize        : function () {
            
            this.on('beforetestfinalize', function () {
                
                if (this.autoCheckGlobals && !this.isFailed() && !this.parent) this.verifyGlobals()
                
            }, this)
        }
    }
        
})
//eof Siesta.Test.More
;
Role('Siesta.Test.Role.Placeholder', {
    
    requires    : [
        'equalsTo'
    ]
})
;
/**
@class Siesta.Test.BDD.Spy

This class implements a "spy" - function wrapper which tracks the calls to itself. Spy can be installed
instead of a method in some object or can be used standalone.

Note, that spies "belongs" to a spec and once the spec is completed all spies that were installed during it
will be removed. 

*/
Class('Siesta.Test.BDD.Spy', {
    
    does        : [
        Siesta.Util.Role.CanGetType
    ],

    has         : {
        name                    : null,
        
        processor               : {
            lazy        : 'this.buildProcessor'
        },
        
        hostObject              : null,
        propertyName            : null,
        
        hasOwnOriginalValue     : false,
        originalValue           : null,
        
        strategy                : 'returnValue',
        
        returnValueObj          : undefined,
        fakeFunc                : null,
        throwErrorObj           : null,
        
        // array of { object : scope, args : [], returnValue : }
        callsLog                : Joose.I.Array,
        
        /**
         * @property {Object} calls This is an object property with several helper methods, related to the calls 
         * tracking information. It is assigned to the wrapper function of spy.
         * 
         * @property {Function} calls.any Returns `true` if spy was called at least once, `false` otherwise
         * @property {Function} calls.count Returns the number of times this spy was called
         * @property {Function} calls.argsFor Accepts an number of the call (0-based) and return an array of arguments 
         * for that call. 
         * @property {Function} calls.allArgs Returns an array with the arguments for every tracked function call. 
         * Every element of the array is, in turn, an array of arguments. 
         * @property {Function} calls.all Returns an array with the context for every tracked function call. 
         * Every element of the array is an object of the following structure:

    { object : this, args : [ 0, 1, 2 ], returnValue : undefined }

         * @property {Function} calls.mostRecent Returns a context object of the most-recent tracked function call. 
         * @property {Function} calls.first Returns a context object of the first tracked function call. 
         * @property {Function} calls.reset Reset all tracking data.
         *
         * 
         * Example:

    t.spyOn(obj, 'someMethod').callThrough()
    
    obj.someMethod(0, 1)
    obj.someMethod(1, 2)
    
    t.expect(obj.someMethod.calls.any()).toBe(true)
    t.expect(obj.someMethod.calls.count()).toBe(2)
    t.expect(obj.someMethod.calls.first()).toEqual({ object : obj, args : [ 0, 1 ], returnValue : undefined })

         */
        calls                   : null,
        
        t                       : null,
        
        /**
         * @property {Siesta.Test.BDD.Spy} and This is just a reference to itself, to add some syntax sugar. 
         * 
         * This property is also assigned to the wrapper function of spy.
         * 

    t.spyOn(obj, 'someMethod').callThrough()

    // same thing as above
    t.spyOn(obj, 'someMethod').and.callThrough()
    
    // returns spy instance
    obj.someMethod.and 

         */
        and                     : function () { return this }
    },
    
    
    methods     : {
        
        initialize : function () {
            var me              = this
            
            this.calls          = {
                any         : function () { return me.callsLog.length > 0 },
                count       : function () { return me.callsLog.length },
                argsFor     : function (i) { return me.callsLog[ i ].args },
                
                allArgs     : function (i) { return Joose.A.map(me.callsLog, function (call) { return call.args } ) },
                all         : function () { return me.callsLog },
                
                mostRecent  : function () { return me.callsLog[ me.callsLog.length - 1 ] },
                first       : function () { return me.callsLog[ 0 ] },
                
                reset       : function () { me.reset() }
            }
            
            var R       = Siesta.Resource('Siesta.Test.BDD.Spy')
            
            var hostObject      = this.hostObject
            var propertyName    = this.propertyName
            
            if (hostObject) {
                if (this.typeOf(hostObject[ propertyName ]) != 'Function') throw R.get("spyingNotOnFunction")
                
                this.hasOwnOriginalValue    = hostObject.hasOwnProperty(propertyName)
                this.originalValue          = hostObject[ propertyName ]
                
                if (this.originalValue.__SIESTA_SPY__) this.originalValue.__SIESTA_SPY__.remove()
                
                hostObject[ propertyName ]  = this.getProcessor()
            }
            
            if (this.t) this.t.spies.push(this)
        },
        
        
        buildProcessor : function () {
            var me          = this
            
            var processor   = function () {
                var args        = Array.prototype.slice.call(arguments)
                var log         = { object : this, args : args }
                
                me.callsLog.push(log)
                
                return log.returnValue = me[ me.strategy + 'Strategy' ](this, args) 
            }
            
            processor.__SIESTA_SPY__    = processor.and = me
            processor.calls             = me.calls
            
            return processor
        },
        
        
        returnValueStrategy : function (obj, args) {
            return this.returnValueObj
        },
        
        
        callThroughStrategy : function (obj, args) {
            return this.originalValue.apply(obj, args)
        },
        
        
        callFakeStrategy : function (obj, args) {
            return this.fakeFunc.apply(obj, args)
        },
        
        
        throwErrorStrategy : function (obj, args) {
            var error       = this.throwErrorObj
            var ERROR       = this.t && this.t.global ? this.t.global.Error : Error
            
            if (!(error instanceof ERROR)) error = new ERROR(error)
            
            throw error
        },
        
        
        /**
         * This method makes the spy to also execute the original function it has been installed over. The
         * value returned from original function is returned from the spy.
         * 
         * @return {Siesta.Test.BDD.Spy} This spy instance
         */
        callThrough : function () {
            if (!this.hostObject) throw "Need the host object to call through to original method"
            
            this.strategy       = 'callThrough'
            
            return this
        },
        
        
        /**
         * This method makes the spy to just return the `undefined` and not execute the original function.
         * 
         * @return {Siesta.Test.BDD.Spy} This spy instance
         */
        stub : function () {
            this.returnValue()
            
            return this
        },
        
        
        /**
         * This method makes the spy to return the value provided and not execute the original function.
         * 
         * @param {Object} value The value that will be returned from the spy.
         * 
         * @return {Siesta.Test.BDD.Spy} This spy instance
         */
        returnValue : function (value) {
            this.strategy       = 'returnValue'
            
            this.returnValueObj = value
            
            return this
        },

        
        /**
         * This method makes the spy to call the provided function and return the value from it, instead of the original function.
         * 
         * @param {Function} func The function to call instead of the original function
         * 
         * @return {Siesta.Test.BDD.Spy} This spy instance
         */
        callFake : function (func) {
            this.strategy   = 'callFake'
            
            this.fakeFunc   = func
            
            return this
        },
        
        
        /**
         * This method makes the spy to throw the specified `error` value (instead of calling the original function).
         * 
         * @param {Object} error The error value to throw. If it is not an `Error` instance, it will be passed to `Error` constructor first.
         * 
         * @return {Siesta.Test.BDD.Spy} This spy instance
         */
        throwError : function (error) {
            this.strategy       = 'throwError'
            
            this.throwErrorObj  = error
            
            return this
        },
        
        
        remove : function () {
            var hostObject      = this.hostObject
            
            if (hostObject) {
                if (this.hasOwnOriginalValue) 
                    hostObject[ this.propertyName ] = this.originalValue
                else
                    delete hostObject[ this.propertyName ]
            }
            
            // cleanup paranoya
            this.originalValue  = this.hostObject = hostObject = null
            this.callsLog       = []
            
            this.returnValueObj = this.fakeFunc = this.throwErrorObj = null
            
            var processor       = this.getProcessor()
            processor.and       = processor.calls   = processor.__SIESTA_SPY__ = null
            
            this.processor      = null
        },
        
        
        /**
         * This method resets all calls tracking data. Spy will report as it has never been called yet. 
         */
        reset : function () {
            this.callsLog      = []
        }
    }
})
;
Class('Siesta.Test.BDD.Placeholder', {
    
    does        : Siesta.Test.Role.Placeholder,
    
    has         : {
        clsConstructor  : { required : true },
        t               : null,
        context         : null,
        
        globals         : {
            init            : [
                'String',
                'Boolean',
                'Number',
                'Date',
                'RegExp',
                'Function',
                'Array',
                'Object'
            ]
        }
    },
    
    
    methods     : {
        
        getClassName : function (onlyGlobals) {
            var clsConstructor      = this.getClassConstructor()
            var context             = this.context

            var clsName
            
            Joose.A.each(this.globals, function (property) {
                if (clsConstructor == context[ property ]) { clsName = property; return false }    
            })
            
            return onlyGlobals ? clsName : clsName || (clsConstructor ? clsConstructor + '' : '')
        },
        
        
        getClassConstructor : function () {
            return this.clsConstructor
        },
        
        
        equalsTo : function (value) {
            var clsConstructor      = this.getClassConstructor()
            
            if (!clsConstructor) return true
            
            if (value instanceof Siesta.Test.BDD.Placeholder) {
                var ownClassName    = this.getClassName(true)
                
                if (
                    value.getClassName(true) == 'Object' && (
                        ownClassName == 'Date' ||
                        ownClassName == 'RegExp' ||
                        ownClassName == 'Function'||
                        ownClassName == 'Array'
                    )
                ) {
                    return true
                }
                
                return clsConstructor == value.getClassConstructor()
            }
            
            var isEqual             = false
            
            var globalCls           = this.getClassName(true)
            
            if (globalCls)
                isEqual             = this.t.typeOf(value) == globalCls || (value instanceof this.context[ globalCls ])
            
            return isEqual || (value instanceof clsConstructor)
        },
        
        
        toString : function () {
            return 'any ' + (this.getClassName() || 'value')
        }
    }
})
;
Class('Siesta.Test.BDD.NumberPlaceholder', {
    
    does        : Siesta.Test.Role.Placeholder,
    
    has         : {
        value           : { required : true },
        threshold       : null
    },
    
    
    methods     : {
        
        initialize : function () {
            if (this.threshold == null) this.threshold = this.value * 0.05
        },
        
        
        equalsTo : function (value) {
            return Math.abs(value - this.value) <= this.threshold
        },
        
        
        toString : function () {
            return 'any number approximately equal to ' + this.value
        }
    }
})
;
Class('Siesta.Test.BDD.StringPlaceholder', {
    
    does        : Siesta.Test.Role.Placeholder,
    
    has         : {
        value           : { required : true }
    },
    
    
    methods     : {
        
        equalsTo : function (string) {
            if (Object.prototype.toString(this.value) == '[object RegExp]')
                return this.value.test(string)
            else
                return String(string).indexOf(this.value) > -1
        },
        
        
        toString : function () {
            if (Object.prototype.toString(this.value) == '[object RegExp]')
                return 'any string matching: ' + this.value
            else
                return 'any string containing: ' + this.value
        }
    }
})
;
/**
@class Siesta.Test.BDD.Expectation

This class is the central point for writing assertions in BDD style. Instances of this class can be generated with the {@link Siesta.Test#expect expect}
method. Then, calling some method on the instance will create a new assertion in the test.

* **Note**, that to negate any assertion, you can use a special property {@link #not}, that contains an expectation instance with the opposite meaning.

For example:

    t.expect(1).toBe(1)
    t.expect(1).not.toBe(2)
    
    t.expect('Foo').toContain('oo')
    t.expect('Foo').not.toContain('bar')


*/
Class('Siesta.Test.BDD.Expectation', {
    
    does        : [
        Siesta.Util.Role.CanGetType
    ],

    has         : {
        value           : null,
        
        isNot           : false,
        
        /**
         * @property {Siesta.Test.BDD.Expectation} not Another expectation instance with the negated meaning. 
         */
        not             : null,
        
        t               : null
    },
    
    
    methods     : {
        
        initialize : function () {

            if (!this.isNot) this.not = new this.constructor({
                isNot           : true,
                t               : this.t,
                
                value           : this.value
            })
        },
        
        
        process : function (passed, config) {
            var isNot       = this.isNot
            config          = config || {}
            
            config.not      = config.not || isNot ? 'not ' : ''
            config.got      = config.hasOwnProperty('got') ? config.got : this.value
            
            if (config.noGot) delete config.got
            
            var assertionName   = config.assertionName
            
            if (assertionName && isNot) config.assertionName = assertionName.replace(/^(expect\(.+?\)\.)/, '$1not.')
            
            passed          = isNot ? !passed : passed
            
            this.t[ passed ? 'pass' : 'fail' ](null, config)
        },
        
        
        /**
         * This assertion compares the value provided to the {@link Siesta.Test#expect expect} method with the `expectedValue` argument.
         * Comparison is done with `===` operator, so it should be used only with the primitivies - numbers, strings, booleans etc.
         * To deeply compare JSON objects and arrays, use {@link #toEqual} method.
         * 
         * This method works correctly with the placeholders generated with {@link Siesta.Test#any any} method
         * 
         * @param {Primitive} expectedValue An expected value 
         */
        toBe : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.compareObjects(this.value, expectedValue, true, true), {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeText') + ' {need}',
                assertionName       : 'expect(got).toBe(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },
        
        
        /**
         * This assertion compares the value provided to the {@link Siesta.Test#expect expect} method with the `expectedValue` argument.
         * Comparison works for JSON objects and/or arrays, it is performed "deeply". Right now the values should not contain cyclic references.
         * 
         * This method works correctly with the placeholders generated with {@link Siesta.Test#any any} method
         * 
         * @param {Mixed} expectedValue An expected value 
         */
        toEqual : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.compareObjects(this.value, expectedValue, true), {
                descTpl             : R.get('expectText') +' {got} {!not}' + R.get('toBeEqualToText') + ' {need}',
                assertionName       : 'expect(got).toEqual(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is `null`.
         */
        toBeNull : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.compareObjects(this.value, null, true, true), {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeText') + ' null',
                assertionName       : 'expect(got).toBeNull()',
                need                : null,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is `NaN`.
         */
        toBeNaN : function () {
            var value   = this.value
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.t.typeOf(value) == 'Number' && value != value, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeText') + ' NaN',
                assertionName       : 'expect(got).toBeNaN()',
                need                : NaN,
                needDesc            : this.isNot ? R.get('needNotText') : R.get('needText')
            })
        },

        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is not the `undefined` value.
         */
        toBeDefined : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value !== undefined, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeDefinedText'),
                assertionName       : 'expect(got).toBeDefined()'
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is the `undefined` value.
         */
        toBeUndefined : function (value) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value === undefined, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeUndefinedText'),
                assertionName       : 'expect(got).toBeUndefined()'
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is "truthy" - evaluates to `true`.
         * For example - non empty strings, numbers except the 0, objects, arrays etc.
         */
        toBeTruthy : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeTruthyText'),
                assertionName       : 'expect(got).toBeTruthy()'
            })
        },
        
        
        /**
         * This assertion passes, when value provided to the {@link Siesta.Test#expect expect} method is "falsy" - evaluates to `false`.
         * For example - empty strings, number 0, `null`, `undefined`, etc.
         */
        toBeFalsy : function () {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(!this.value, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeFalsyText'),
                assertionName       : 'expect(got).toBeFalsy()'
            })
        },
        
        
        /**
         * This assertion passes, when the string provided to the {@link Siesta.Test#expect expect} method matches the regular expression.
         * 
         * @param {RegExp} regexp The regular expression to match the string against
         */
        toMatch : function (regexp) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (this.t.typeOf(regexp) != 'RegExp') throw new Error("`expect().toMatch()` matcher expects a regular expression")
            
            this.process(new RegExp(regexp).test(this.value), {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toMatchText') + ' {need}',
                assertionName       : 'expect(got).toMatch(need)',
                need                : regexp,
                needDesc            : this.isNot ? R.get('needNotMatchingText') : R.get('needMatchingText')
            })
        },
        
        
        /**
         * This assertion passes in 2 cases:
         * 
         * 1) When the value provided to the {@link Siesta.Test#expect expect} method is a string, and it contains a passed substring.
         * 2) When the value provided to the {@link Siesta.Test#expect expect} method is an array (or array-like), and it contains a passed element.
         * 
         * @param {String/Mixed} element The element of the array or a sub-string
         */
        toContain : function (element) {
            var value       = this.value
            var t           = this.t
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            var passed      = false

            if (t.typeOf(value) == 'String') {
                this.process(value.indexOf(element) >= 0, {
                    descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toContainText') + ' {need}',
                    assertionName       : 'expect(got).toContain(need)',
                    need                : element,
                    needDesc            : this.isNot ? R.get('needStringNotContainingText') : R.get('needStringContainingText')
                })
            } else {
                // Normalize to allow NodeList, Arguments etc.
                value = Array.prototype.slice.call(value);

                for (var i = 0; i < value.length; i++)
                    if (t.compareObjects(element, value[ i ], true)) {
                        passed      = true
                        break
                    }

                this.process(passed, {
                    descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toContainText') + ' {need}',
                    assertionName       : 'expect(got).toContain(need)',
                    need                : element,
                    needDesc            : this.isNot ? R.get('needArrayNotContainingText') : R.get('needArrayContainingText')
                })

            }
        },
        
        
        /**
         * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is less than the
         * expected number.
         * 
         * @param {Number} expectedValue The number to compare with
         */
        toBeLessThan : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value < expectedValue, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeLessThanText') + ' {need}',
                assertionName       : 'expect(got).toBeLessThan(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needGreaterEqualThanText') : R.get('needLessThanText')
            })
        },
        
        
        /**
         * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is greater than the
         * expected number.
         * 
         * @param {Number} expectedValue The number to compare with
         */
        toBeGreaterThan : function (expectedValue) {
            var R = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(this.value > expectedValue, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeGreaterThanText') + ' {need}',
                assertionName       : 'expect(got).toBeGreaterThan(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needLessEqualThanText') : R.get('needGreaterThanText')
            })
        },
        
        
        /**
         * This assertion passes, when the number provided to the {@link Siesta.Test#expect expect} method is approximately equal
         * the given number. The proximity can be defined as the `precision` argument  
         * 
         * @param {Number} expectedValue The number to compare with
         * @param {Number} [precision=2] The number of digits after dot (comma) that should be same in both numbers.
         */
        toBeCloseTo : function (expectedValue, precision) {
            precision       = precision != null ? precision : 2
            
            // not sure why we divide the precision by 2, but jasmine does that for some reason
            var threshold   = Math.pow(10, -precision) / 2
            var delta       = Math.abs(this.value - expectedValue)
            var R           = Siesta.Resource('Siesta.Test.BDD.Expectation');

            this.process(delta < threshold, {
                descTpl             : R.get('expectText') + ' {got} {!not}' + R.get('toBeCloseToText') +' {need}',
                assertionName       : 'expect(got).toBeCloseTo(need)',
                need                : expectedValue,
                needDesc            : this.isNot ? R.get('needValueNotCloseToText') : R.get('needValueCloseToText'),
                annotation          : delta ? R.get('thresholdIsText') + threshold : R.get('exactMatchText')
            })        
        },
        
        
        /**
         * This assertion passes when the function, provided to the {@link Siesta.Test#expect expect} method, throws any exception
         * during its execution.
         */
        toThrow : function () {
            var func    = this.value
            var t       = this.t
            var R       = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (t.typeOf(func) != 'Function') throw new Error("`expect().toMatch()` matcher expects a function")
            
            var e       = t.getExceptionCatcher()(func)
            
            if (e instanceof t.getTestErrorClass())
                //IE uses non-standard 'description' property for error msg
                e = e.message || e.description
                
            this.process(e !== undefined, {
                descTpl             : R.get('expectText') + ' function {!not}' + R.get('toThrowText'),
                assertionName       : 'expect(func).toThrow()',
                annotation          : e ? (R.get('thrownExceptionText') + ': ' + Siesta.Util.Serializer.stringify(e)) : R.get('noExceptionThrownText'),
                
                noGot               : true
            })
        },
        
        
        /**
         * This assertion passes, if a spy, provided to the {@link Siesta.Test#expect expect} method have been 
         * called expected number of times. The expected number of times can be provided as the 1st argument and by default
         * is 1.
         * 
         * One can also provide the function, spied on, to the {@link Siesta.Test#expect expect} method.
         * 
         * Examples:
         * 
    var spy = t.spyOn(obj, 'process')
    
    // call the method 2 times
    obj.process()
    obj.process()

    // following 2 calls are equivalent
    t.expect(spy).toHaveBeenCalled();
    t.expect(obj.process).toHaveBeenCalled();
    
    // one can also use exact number of calls or comparison operators
    t.expect(obj.process).toHaveBeenCalled(2);
    t.expect(obj.process).toHaveBeenCalled('>1');
    t.expect(obj.process).toHaveBeenCalled('<3');

         * 
         * See also {@link #toHaveBeenCalledWith}
         * 
         * @param {Number/String} expectedNumber Expected number of calls. Can be either a number, specifying the exact
         * number of calls, or a string. In the latter case one can include a comparison operator in front of the number.
         * 
         */
        toHaveBeenCalled : function (expectedNumber) {
            expectedNumber  = expectedNumber != null ? expectedNumber : '>=1'
            
            var spy         = this.value
            var t           = this.t
            var R           = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (this.typeOf(spy) == 'Function') {
                if (!spy.__SIESTA_SPY__) throw new Error(R.get('wrongSpy'))
                
                spy         = spy.__SIESTA_SPY__
            }
            
            if (!(spy instanceof Siesta.Test.BDD.Spy)) throw new Error(R.get('wrongSpy'))
            
            this.process(t.verifyExpectedNumber(spy.callsLog.length, expectedNumber), {
                descTpl             : R.get('toHaveBeenCalledDescTpl'),
                assertionName       : 'expect(func).toHaveBeenCalled()',
                methodName          : spy.propertyName,
                got                 : spy.callsLog.length,
                gotDesc             : R.get('actualNbrOfCalls'),
                need                : expectedNumber,
                needDesc            : R.get('expectedNbrOfCalls')
            })
        },
        
        
        /**
         * This assertion passes, if a spy, provided to the {@link Siesta.Test#expect expect} method have been 
         * called at least once with the specified arguments. 
         * 
         * One can also provide the function, spied on, to the {@link Siesta.Test#expect expect} method.
         * 
         * One can use placeholders, generated with the {@link Siesta.Test.BDD#any any} method to verify the arguments.
         * 
         * Example:
         * 

    var spy = t.spyOn(obj, 'process')
    
    // call the method 2 times with different arguments
    obj.build('development', '1.0.0')
    obj.build('release', '1.0.1')

    t.expect(spy).toHaveBeenCalledWith('development', '1.0.0');
    // or
    t.expect(obj.process).toHaveBeenCalledWith('development', t.any(String));

         * 
         * See also {@link #toHaveBeenCalled}
         * 
         * @param {Object} arg1 Argument to a call
         * @param {Object} arg2 Argument to a call
         * @param {Object} argN Argument to a call
         */
        toHaveBeenCalledWith : function () {
            var spy         = this.value
            var t           = this.t
            var R           = Siesta.Resource('Siesta.Test.BDD.Expectation');

            if (this.typeOf(spy) == 'Function') {
                if (!spy.__SIESTA_SPY__) throw new Error(R.get('wrongSpy'))
                
                spy         = spy.__SIESTA_SPY__
            }
            
            if (!(spy instanceof Siesta.Test.BDD.Spy)) throw new Error(R.get('wrongSpy'))
            
            var args                        = Array.prototype.slice.call(arguments)
            var foundCallWithMatchingArgs   = false
            
            Joose.A.each(spy.callsLog, function (call) {
                if (t.compareObjects(call.args, args)) { foundCallWithMatchingArgs = true; return false }
            })
            
            this.process(foundCallWithMatchingArgs, {
                descTpl             : R.get('toHaveBeenCalledWithDescTpl'),
                assertionName       : 'expect(func).toHaveBeenCalledWith()',
                methodName          : spy.propertyName,
                noGot               : true
            })
        }
    }
})
;
/**
@class Siesta.Test.BDD

A mixin providing a BDD style layer for most of the assertion methods.
It is consumed by {@link Siesta.Test}, so all of its methods are available in all tests. 

*/
Role('Siesta.Test.BDD', {
    
    requires    : [
        'getSubTest', 'chain'
    ],
    
    has         : {
        specType                : null, // `describe` or `it`
        
        beforeEachHooks         : Joose.I.Array,
        afterEachHooks          : Joose.I.Array,
        
        sequentialSubTests      : Joose.I.Array,
        
        // flag, whether the "run" function of the test (containing actual test code) have been already run
        codeProcessed           : false,
        
        launchTimeout           : null,
        
        // Siesta.Test.BDD.Expectation should already present on the page
        expectationClass        : Siesta.Test.BDD.Expectation,
        
        failOnExclusiveSpecsWhenAutomated   : false,
        
        spies                   : Joose.I.Array
    },
    
    
    methods     : {
        
        checkSpecFunction : function (func, type, name) {
            if (!func)          throw new Error(Siesta.Resource('Siesta.Test.BDD', 'codeBodyMissing') + " " + (type == 'describe' ? 'suite' : 'spec') + ' [' + name + ']')
            if (!func.length)   throw new Error(Siesta.Resource('Siesta.Test.BDD', 'codeBodyOf') + " " + (type == 'describe' ? 'suite' : 'spec') + ' [' + name + '] ' + Siesta.Resource('Siesta.Test.BDD', 'missingFirstArg'))
        },
        
        
        /**
         * This is an "exclusive" version of the regular {@link #describe} suite. When such suites presents in some test file,
         * the other regular suites at the same level will not be executed, only "exclusive" ones.
         * 
         * @param {String} name The name or description of the suite
         * @param {Function} code The code function for this suite. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this suite. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        ddescribe : function (name, code, timeout) {
            this.describe(name, code, timeout, true)
        },
        
        
        /**
         * This is a no-op method, allowing you to quickly ignore some suites. 
         */
        xdescribe : function () {
        },
        
        
        /**
         * This method starts a sub test with *suite* (in BDD terms). Such suite consists from one or more *specs* (see method {@link #it}} or other suites.
         * The number of nesting levels is not limited. All suites of the same nesting level are executed sequentially. 
         * 
         * For example:
         * 
    t.describe('A product', function (t) {
    
        t.it('should have feature X', function (t) {
            ...
        })
        
        t.describe('feature X', function (t) {
            t.it('should be cool', function (t) {
                ...
            })
        })
    })
         *
         * See also {@link #beforeEach}, {@link #afterEach}, {@link #xdescribe}, {@link #ddescribe}
         * 
         * @param {String} name The name or description of the suite
         * @param {Function} code The code function for this suite. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this suite. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        describe : function (name, code, timeout, isExclusive) {
            this.checkSpecFunction(code, 'describe', name)
            
            var subTest     = this.getSubTest({
                name            : name,
                run             : code,
                
                isExclusive     : isExclusive,
                
                specType        : 'describe',
                timeout         : timeout
            })
            
            if (this.codeProcessed) this.scheduleSpecsLaunch()
            
            this.sequentialSubTests.push(subTest)
        },
        
        
        /**
         * This is an "exclusive" version of the regular {@link #it} spec. When such specs presents in some suite,
         * the other regular specs at the same level will not be executed, only "exclusive" ones. Note, that even "regular" suites (`t.describe`) sections
         * will be ignored, if they are on the same level with the exclusive `iit` section.
         * 
         * @param {String} name The name or description of the spec
         * @param {Function} code The code function for this spec. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this spec. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        iit : function (name, code, timeout) {
            if (this.harness.isAutomated) {
                if (this.failOnExclusiveSpecsWhenAutomated) this.fail(Siesta.Resource('Siesta.Test.BDD', 'iitFound'));
            }
            this.it(name, code, timeout, true)
        },
        
        
        /**
         * This is a no-op method, allowing you to quickly ignore some specs. 
         */
        xit : function () {
        },
        
        
        /**
         * This method starts a sub test with *spec* (in BDD terms). Such spec consists from one or more assertions (or *expectations*, *matchers*, etc) or other nested specs
         * and/or suites. See the {@link #expect} method. The number of nesting levels is not limited. All specs of the same nesting level are executed sequentially. 
         * 
         * For example:
         * 
    t.describe('A product', function (t) {
    
        t.it('should have feature X', function (t) {
            ...
        })
        
        t.it('should have feature Y', function (t) {
            ...
        })
    })
         *
         * See also {@link #beforeEach}, {@link #afterEach}, {@link #xit}, {@link #iit}
         * 
         * @param {String} name The name or description of the spec
         * @param {Function} code The code function for this spec. It will receive a test instance as the first argument which should be used for all assertion methods.
         * @param {Number} [timeout] A maximum duration for this spec. If not provided {@link Siesta.Harness#subTestTimeout} value is used.
         */
        it : function (name, code, timeout, isExclusive) {
            this.checkSpecFunction(code, 'it', name)
            
            var subTest     = this.getSubTest({
                name            : name,
                run             : code,
                
                isExclusive     : isExclusive,
                
                specType        : 'it',
                timeout         : timeout
            })
            
            if (this.codeProcessed) this.scheduleSpecsLaunch()
            
            this.sequentialSubTests.push(subTest)
        },
        
        
        /**
         * This method returns an "expectation" instance, which can be used to check various assertions about the passed value.
         * 
         * **Note**, that every expectation has a special property `not`, that contains another expectation, but with the negated meaning.
         * 
         * For example:
         * 

    t.expect(1).toBe(1)
    t.expect(1).not.toBe(2)
    
    t.expect('Foo').toContain('oo')
    t.expect('Foo').not.toContain('bar')
 
 
         * Please refer to the documentation of the {@link Siesta.Test.BDD.Expectation} class for the list of available methods.
         * 
         * @param {Mixed} value Any value, that will be assert about
         * @return {Siesta.Test.BDD.Expectation} Expectation instance
         */
        expect : function (value) {
            return new this.expectationClass({
                t           : this,
                value       : value
            })
        },
        
        
        /**
         * This method returns a *placeholder*, denoting any instance of the provided class constructor. Such placeholder can be used in various
         * comparison assertions, like {@link #is}, {@link #isDeeply}, {@link Siesta.Test.BDD.Expectation#toBe expect().toBe()}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toEqual()} and so on.
         * 
         * For example:

    t.is(1, t.any(Number))
    
    t.expect(1).toBe(t.any(Number))
    
    t.isDeeply({ name : 'John', age : 45 }, { name : 'John', age : t.any(Number))
    
    t.expect({ name : 'John', age : 45 }).toEqual({ name : 'John', age : t.any(Number))
    
    t.is(NaN, t.any(), 'When class constructor is not provided `t.any()` should match anything')

         * 
         * See also {@link #anyNumberApprox}, {@link #anyStringLike}.
         * 
         * @param {Function} clsConstructor A class constructor instances of which are denoted with this placeholder. As a special case if this argument
         * is not provided, a placeholder will match any value. 
         * 
         * @return {Object} A placeholder object
         */
        any : function (clsConstructor) {
            return new Siesta.Test.BDD.Placeholder({
                clsConstructor      : clsConstructor,
                t                   : this,
                context             : this.global
            })
        },
        
        /**
         * This method returns a *placeholder*, denoting any number approximately equal to the provided value. 
         * Such placeholder can be used in various comparison assertions, like {@link #is}, {@link #isDeeply}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toBe()}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toEqual()} and so on.
         * 
         * For example:

    t.is(1, t.anyNumberApprox(1.2, 0.5))
    
    t.expect(1).toBe(t.anyNumberApprox(1.2, 0.5))
    
         * 
         * @param {Number} value The approximate value
         * @param {Number} [threshold] The threshold. If omitted, it is set to 5% from the `value`.
         *  
         * @return {Object} A placeholder object
         */
        anyNumberApprox : function (value, threshold) {
            return new Siesta.Test.BDD.NumberPlaceholder({
                value               : value,
                threshold           : threshold
            })
        },
        
        
        /**
         * This method returns a *placeholder*, denoting any string that matches provided value. 
         * Such placeholder can be used in various comparison assertions, like {@link #is}, {@link #isDeeply},
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toBe()}, 
         * {@link Siesta.Test.BDD.Expectation#toBe expect().toEqual()} and so on.
         * 
         * For example:

    t.is('foo', t.anyStringLike('oo'))
    
    t.expect('bar').toBe(t.anyStringLike(/ar$/))
    
         * 
         * @param {String/RegExp} value If given as string will denote a substring a string being checked should contain,
         * if given as RegExp instance then string being checked should match this RegExp
         *  
         * @return {Object} A placeholder object
         */
        anyStringLike : function (value) {
            return new Siesta.Test.BDD.StringPlaceholder({ value : value })
        },
        
        
        scheduleSpecsLaunch : function () {
            if (this.launchTimeout) return
            
            var async                   = this.beginAsync()
            var originalSetTimeout      = this.originalSetTimeout
            var me                      = this
            
            this.launchTimeout          = originalSetTimeout(function () {
                me.endAsync(async)
                me.launchTimeout        = null
                
                me.launchSpecs()
            }, 0)
        },
        
        
        runBeforeSpecHooks : function (done) {
            var me          = this
            
            var runOwnHooks = function (done) {
                me.chainForArray(me.beforeEachHooks, function (hook) {
                    return hook.isAsync ? hook.code : function (next) {
                        hook.code()
                        next()
                    }
                }, done)                    
            }
            
            if (this.parent)
                this.parent.runBeforeSpecHooks(function () {
                    runOwnHooks(done)
                })
            else
                runOwnHooks(done)
        },
                
            
        runAfterSpecHooks : function (done) {
            var me      = this
            
            me.chainForArray(
                this.afterEachHooks, function (hook) {
                    return hook.isAsync ? hook.code : function (next) {
                        hook.code()
                        next()
                    }
                }, function () {
                    me.parent ? me.parent.runAfterSpecHooks(done) : done()
                },
                // reverse
                true
            )
        },
        
        
        launchSpecs : function () {
            var me                  = this
            var sequentialSubTests  = this.sequentialSubTests
            
            this.sequentialSubTests = []
            
            // hackish way to pass a config to `t.chain`
            this.chain.actionDelay  = 0
            
            var exclusiveSubTests   = []
            
            Joose.A.each(sequentialSubTests, function (subTest) {
                if (subTest.isExclusive) exclusiveSubTests.push(subTest)
            })
            
            this.chainForArray(exclusiveSubTests.length ? exclusiveSubTests : sequentialSubTests, function (subTest) {
                return [
                    subTest.specType == 'it' ? function (next) { me.runBeforeSpecHooks(next) } : null,
                    subTest,
                    subTest.specType == 'it' ? function (next) { me.runAfterSpecHooks(next) } : null
                ]
            })
        },
        
        
        /**
         * This method allows you to execute some "setup" code before every spec of the current test. Note, that specs can be nested
         * and all `beforeEach` methods are executed in order, starting from the most-nested one.
         * 
         * By default the setup code is supposed to be synchronous, but you can change it with the `isAsync` argument. 
         * This method can be called several times, providing several "setup" functions. Note, that `beforeEach` code is not
         * executed for the sub-tests generated with the {@link Siesta.Test#getSubTest getSubTest} method.
         * 
         * For example:

    StartTest(function (t) {
        var baz     = 0
        
        t.beforeEach(function () {
            baz     = 0
        })
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         * 
         * @param {Function} code A function to execute before every spec
         * @param {Function} code.next A callback to call when the `beforeEach` method completes. This argument is only provided
         * when the `isAsync` argument is passed as `true`
         * @param {Boolean} isAsync When passed as `true` this argument makes the `beforeEach` method asynchronous. In this case,
         * the `code` function will receive a callback argument, which should be called once the method has completed it's work. 
         * Note, that `beforeEach` method should complete within {@link Siesta.Test#defaultTimeout defaultTimeout} time, otherwise
         * failing assertion will be added to the test. 
         * 
         * Example:

    StartTest(function (t) {
        var baz     = 0
    
        // asynchronous setup code
        t.beforeEach(function (next) {
            
            // `beforeEach` will complete in 100ms 
            setTimeout(function () {
                baz     = 0
                next()
            }, 100)
        }, true)
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         */
        beforeEach : function (code, isAsync) {
            this.beforeEachHooks.push({ code : code, isAsync : isAsync })
        },
        
        
        /**
         * This method allows you to execute some "tear down" code after every spec of the current test. Note, that specs can be nested
         * and all `afterEach` methods are executed in order, starting from the most-nested one.
         * 
         * By default the tear down code is supposed to be synchronous, but you can change it with the `isAsync` argument. 
         * This method can be called several times, providing several "tear down" functions. Note, that `afterEach` code is not
         * executed for the sub-tests generated with the {@link Siesta.Test#getSubTest getSubTest} method.
         * 
         * For example:

    StartTest(function (t) {
        var baz     = 0
        
        t.afterEach(function () {
            baz     = 0
        })
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         * 
         * @param {Function} code A function to execute after every spec
         * @param {Function} code.next A callback to call when the `afterEach` method completes. This argument is only provided
         * when the `isAsync` argument is passed as `true`
         * @param {Boolean} isAsync When passed as `true` this argument makes the `afterEach` method asynchronous. In this case,
         * the `code` function will receive a callback argument, which should be called once the method has completed it's work. 
         * Note, that `afterEach` method should complete within {@link Siesta.Test#defaultTimeout defaultTimeout} time, otherwise
         * failing assertion will be added to the test. 
         * 
         * Example:

    StartTest(function (t) {
        var baz     = 0
    
        // asynchronous setup code
        t.afterEach(function (next) {
            
            // `afterEach` will complete in 100ms 
            setTimeout(function () {
                baz     = 0
                next()
            }, 100)
        }, true)
        
        t.describe("This feature should work", function (t) {
            t.expect(myFunction(baz++)).toEqual('someResult')
        })
    })

         */
        afterEach : function (code, isAsync) {
            this.afterEachHooks.push({ code : code, isAsync : isAsync })
        },
        

        /**
         * This method installs a "spy" instead of normal function in some object. The "spy" is basically another function,
         * which tracks the calls to itself. With spies, one can verify that some function was called and that
         * it was called with certain arguments.
         * 
         * Note, that by default, spy will not call the original method. To enable that, use {@link Siesta.Test.BDD.Spy#callThrough} method.
         * 

    var spy = t.spyOn(obj, 'process')
    // or, if you need to call the original 'process' method
    var spy = t.spyOn(obj, 'process').and.callThrough()
    
    // call the method
    obj.process('fast', 1)

    t.expect(spy).toHaveBeenCalled();
    t.expect(spy).toHaveBeenCalledWith('fast', 1);

         *
         * See also {@link #createSpy}, {@link #createSpyObj}, {@link Siesta.Test.BDD.Expectation#toHaveBeenCalled toHaveBeenCalled}, 
         * {@link Siesta.Test.BDD.Expectation#toHaveBeenCalledWith toHaveBeenCalledWith}
         * 
         * See also the {@link Siesta.Test.BDD.Spy} class for additional details.
         * 
         * @param {Object} object An object which property is being spied
         * @param {String} propertyName A name of the property over which to install the spy. 
         * 
         * @return {Siesta.Test.BDD.Spy} spy Created spy instance
         */
        spyOn : function (object, propertyName) {
            var R       = Siesta.Resource('Siesta.Test.BDD')
            
            if (!object) { this.warn(R.get('noObject')); return; }
            
            return new Siesta.Test.BDD.Spy({
                name            : propertyName,
                
                t               : this,
                hostObject      : object,
                propertyName    : propertyName
            })
        },
        
        /**
         * This method create a standalone spy function, which tracks all calls to it. Tracking is done using the associated 
         * spy instance, which is available as `and` property. One can use the {@link Siesta.Test.BDD.Spy} class API to
         * verify the calls to the spy function.
         * 
         * Example:

    var spyFunc     = t.createSpy('onadd listener')
    
    myObservable.addEventListener('add', spyFunc)
    
    // do something that triggers the `add` event on the `myObservable`

    t.expect(spyFunc).toHaveBeenCalled()
    
    t.expect(spyFunc.calls.argsFor(1)).toEqual([ 'Arg1', 'Arg2' ])
    
         * 
         * See also: {@link #spyOn}
         * 
         * @param {String} [spyName='James Bond'] A name of the spy for debugging purposes
         * 
         * @return {Function} Created function. The associated spy instance is assigned to it as the `and` property 
         */
        createSpy : function (spyName) {
            return (new Siesta.Test.BDD.Spy({
                name            : spyName || 'James Bond',
                t               : this
            })).getProcessor()
        },
        
        
        /**
         * This method creates an object, which properties are spy functions. Such object can later be used as a mockup.
         * 
         * This method can be called with one argument only, which should be an array of properties.
         * 
         * Example:

    var mockup      = t.createSpyObj('encoder-mockup', [ 'encode', 'decode' ])
    // or just
    var mockup      = t.createSpyObj([ 'encode', 'decode' ])
    
    mockup.encode('string')
    mockup.decode('string')
    
    t.expect(mockup.encode).toHaveBeenCalled()
    

         * 
         * See also: {@link #createSpy}
         * 
         * @param {String} spyName A name of the spy object. Can be omitted.
         * @param {Array[String]} properties An array of the property names. For each property name a spy function will be created.
         * 
         * @return {Object} A mockup object
         */
        createSpyObj : function (spyName, properties) {
            if (arguments.length == 1) { properties = spyName; spyName = null }
            
            spyName     = spyName || 'spyObject'
            
            var me      = this
            var obj     = {}
            
            Joose.A.each(properties, function (propertyName) {
                obj[ propertyName ] = me.createSpy(spyName) 
            })
            
            return obj
        }
    },
    
    
    override : {
        onTestFinalize : function () {
            Joose.A.each(this.spies, function (spy) { spy.remove() })
            
            this.spies  = null
            
            this.SUPER()
        },
        
        
        afterLaunch : function () {
            this.codeProcessed      = true
            
            this.launchSpecs()
            
            this.SUPERARG(arguments)
        }
    }
        
})
//eof Siesta.Test.BDD
;
Role('Siesta.Test.Sub', {
    
    has : {
        isExclusive         : false,
        parent              : { required : true }
    },
    
    
    methods : {
        
        getExceptionCatcher : function () {
            return this.parent.getExceptionCatcher()
        },
        
        
        getTestErrorClass : function () {
            return this.parent.getTestErrorClass()
        },
        
        
        getStartTestAnchor : function () {
            return this.parent.getStartTestAnchor()
        },
        
        
        expectGlobals : function () {
            return this.parent.expectGlobals.apply(this.parent, arguments)
        }
    }
        
})
//eof Siesta.Test
;
/**
@class Siesta.Test
@mixin Siesta.Test.More
@mixin Siesta.Test.Date
@mixin Siesta.Test.Function
@mixin Siesta.Test.BDD

`Siesta.Test` is a base testing class in Siesta hierarchy. Its not supposed to be created manually, instead, the harness will create it for you.

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

Please note: Each test will be run in **its own**, completely **isolated** and **clean** global scope (created with the iframe).
**There is no need to cleanup anything**.

SYNOPSIS
========

    StartTest(function(t) {
        t.diag("Sanity")

        t.ok($, 'jQuery is here')

        t.ok(Your.Project, 'My project is here')
        t.ok(Your.Project.Util, '.. indeed')

        setTimeout(function () {

            t.ok(true, "True is ok")

        }, 500)
    })


*/

Class('Siesta.Test', {

    does        : [
        Siesta.Util.Role.CanFormatStrings,
        Siesta.Util.Role.CanGetType,
        Siesta.Test.More,
        Siesta.Test.Date,
        Siesta.Test.Function,
        Siesta.Test.BDD,
        JooseX.Observable
    ],


    has        : {
        name                : null,

        /**
         * @property url The url of this test, as given to the {@link Siesta.Harness#start start} method. All subtests of some top-level test shares the same url.
         */
        url                 : { required : true },
        urlExtractRegex     : {
            is      : 'rwc',
            lazy    : function () {
                return new RegExp(this.url.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1") + ':(\\d+)')
            }
        },

        assertPlanned       : null,
        assertCount         : 0,

        // whether this test contains only "todo" assertions
        isTodo              : false,

        results             : {
            lazy    : function () {
                return new Siesta.Result.SubTest({ description  : this.name || 'Root', test : this })
            }
        },

        run                 : null,
        startTestAnchor     : null,
        exceptionCatcher    : null,
        testErrorClass      : null,

        generation          : function () {
            return Math.random()
        },

        parent              : null,
        harness             : null,

        /**
         * @cfg {Number} isReadyTimeout
         *
         * Timeout in milliseconds to wait for test start. Default value is 10000. See also {@link #isReady}
         */
        isReadyTimeout      : 10000,

        // indicates that a test has thrown an exception (not related to failed assertions)
        failed              : false,
        failedException     : null, // stringified exception
        failedExceptionType : null, // type of exception

        // start and end date are stored as numbers (new Date() - 0)
        // this is to allow sharing date instances between different contexts
        startDate           : null,
        endDate             : null,
        lastActivityDate    : null,
        contentManager      : null,

        // the scope provider for the context of the test page
        scopeProvider       : null,
        // the context of the test page
        global              : null,

        reusingSandbox                      : false,
        sandboxCleanup     : true,

        // the scope provider for the context of the test script
        // usually the same as the `scopeProvider`, but may be different in case of using `separateContext` option
        scriptScopeProvider : null,

        transparentEx       : false,

        needDone            : false,
        isDone              : false,

        defaultTimeout      : 15000,
        // a default timeout for sub tests
        subTestTimeout      : null,
        // a timeout of this particular test
        timeout             : null,

        timeoutsCount       : function () {
            return { counter : 1 }
        },
        timeoutIds          : Joose.I.Object,
        idsToIndex          : Joose.I.Object,
        waitTitles          : Joose.I.Object,


        // indicates that test function has completed the execution (test may be still running due to async)
        processed           : false,
        // indicates that test has started finalization process ("tearDown" method). At this point, test is considered
        // finished, but the failing assertion (if "tearDown" fails) may still be added
        finalizationStarted : false,

        callback            : null,

        // Nbr of exceptions detected while running the test
        nbrExceptions       : 0,
        testEndReported     : false,

        // only used for testing itself, otherwise should be always `true`
        needToCleanup               : true,

        overrideSetTimeout          : false,

        overrideForSetTimeout       : null,
        overrideForClearTimeout     : null,
        
        originalSetTimeout          : null,
        originalClearTimeout        : null,

        sourceLineForAllAssertions  : false,

        $passCount                  : null,
        $failCount                  : null,

        actionableMethods           : {
            lazy        : 'buildActionableMethods'
        },

        jUnitClass                  : null,
        groups                      : null,

        // user-provided config values
        config                      : null
    },


    methods : {

        initialize : function () {
            // suppress bubblings of some events (JooseX.Observable does not provide better mechanism for that, yet)
            this.on('teststart', function (event) {
                if (this.parent) event.stopPropagation()
            })

            this.on('testfinalize', function (event) {
                if (this.parent) event.stopPropagation()
            })

            this.on('beforetestfinalize', function (event) {
                if (this.parent) event.stopPropagation()
            })

            this.on('beforetestfinalizeearly', function (event) {
                if (this.parent) event.stopPropagation()
            })

            this.subTestTimeout     = this.subTestTimeout || 2 * this.defaultTimeout

            // Potentially may overwrite default properties and break test instance, should be used with care
            if (this.config) Joose.O.extend(this, this.config)
        },

        /**
         * This method allows you to delay the start of the test, for example for performing some asynchronous setup code (like login into an application).
         * Note, that you may want to use the {@link #setup} method instead, as it is a bit simpler to implement.
         *
         * It is supposed to be overridden in a subclass of the Siesta.Test class and should return an object with two properties: "ready" and "reason"
         * ("reason" is only meaningful for the case where "ready : false"). The Test instance will poll this method and will only launch
         * the test after this method returns "ready : true". If waiting for this condition takes longer than {@link #isReadyTimeout}, the test
         * will be launched anyway, but a failing assertion will be added to it.
         *
         * **Important** This method should always check the value returned by a `this.SUPER` call.
         *
         * A typical example of using this method can be seen below:
         *

    Class('My.Test.Class', {

        isa         : Siesta.Test.Browser,

        has         : {
            isCustomSetupDone           : false
        },

        override : {

            isReady : function () {
                var result = this.SUPERARG(arguments);

                if (!result.ready) return result;

                if (!this.isCustomSetupDone) return {
                    ready       : false,
                    reason      : "Waiting for `isCustomSetupDone` took too long - something wrong?"
                }

                return {
                    ready       : true
                }
            },


            start : function () {
                var me      = this;

                Ext.Ajax.request({
                    url     : 'do_login.php',

                    params  : { ... },

                    success : function () {
                        me.isCustomSetupDone    = true
                    }
                })

                this.SUPERARG(arguments)
            }
        },

        ....
    })

         *
         * @return {Object} Object with properties `{ ready : true/false, reason : 'description' }`
         */
        isReady: function() {
            var R = Siesta.Resource('Siesta.Test');

            // this should allow us to wait until the presense of "run" function
            // it will become available after call to StartTest method
            // which some users may call asynchronously, after some delay
            // see https://www.assembla.com/spaces/bryntum/tickets/379
            // in this case test can not be configured using object as 1st argument for StartTest
            this.run    = this.run || this.getStartTestAnchor().args && this.getStartTestAnchor().args[ 0 ]

            return {
                ready   : this.typeOf(this.run) == 'Function',
                reason  : R.get('noCodeProvidedToTest')
            }
        },


        isFromTheSameGeneration : function (test2) {
            return this.generation == test2.generation
        },


        toString : function() {
            return this.url
        },


        // deprecated
        plan : function (value) {
            if (this.assertPlanned != null) throw new Error("Test plan can't be changed")

            this.assertPlanned = value
        },


        addResult : function (result) {
            var isAssertion = result instanceof Siesta.Result.Assertion

            if (isAssertion) result.isTodo = this.isTodo

            // only allow to add diagnostic results and todo results after the end of test
            // and only if "needDone" is enabled
            if (isAssertion && (this.isDone || this.isFinished()) && !result.isTodo) {
                if (!this.testEndReported) {
                    this.testEndReported = true
                    var R = Siesta.Resource('Siesta.Test');

                    this.fail(R.get('addingAssertionsAfterDone'))
                }
            }

            if (isAssertion && !result.index) {
                result.index = ++this.assertCount
            }

            this.getResults().push(result)

            // clear the cache
            this.$passCount     = this.$failCount   = null

            /**
             * This event is fired when an individual test case receives a new result (assertion or diagnostic message).
             *
             * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
             *
             * @event testupdate
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just has started
             * @param {Siesta.Result} result The new result. Instance of Siesta.Result.Assertion or Siesta.Result.Diagnostic classes
             */
            this.fireEvent('testupdate', this, result, this.getResults())

            this.lastActivityDate = new Date();
        },


        /**
         * This method output the diagnostic message.
         * @param {String} desc The text of diagnostic message
         */
        diag : function (desc) {
            this.addResult(new Siesta.Result.Diagnostic({
                // protection from user passing some arbitrary JSON object instead of string
                // (which can be circular and then test report will fail with "Converting circular structure to JSON"
                description : String(desc || '')
            }))
        },


        /**
         * This method add the passed assertion to this test.
         *
         * @param {String} desc The description of the assertion
         * @param {String/Object} annotation The string with additional description how exactly this assertion passes. Will be shown with monospace font.
         * Can be also an object with the following properties:
         * @param {String} annotation.annotation The actual annotation text
         * @param {String} annotation.descTpl The template for the default description text. Will be used if user did not provide any description for
         * assertion. Template can contain variables in braces. The values for variables are taken as properties of `annotation` parameters with the same name:
         *

    this.pass(desc, {
        descTpl         : '{value1} sounds like {value2}',
        value1          : '1',
        value2          : 'one
    })

         *
         */
        pass : function (desc, annotation, result) {
            if (annotation && this.typeOf(annotation) != 'String') {
                // create a default assertion description
                if (!desc && annotation.descTpl) desc = this.formatString(annotation.descTpl, annotation)

                // actual annotation
                annotation          = annotation.annotation
            }

            if (result) {
                result.passed       = true
                result.description  = String(desc || '')
                result.annotation   = annotation
            }

            this.addResult(result || new Siesta.Result.Assertion({
                passed          : true,

                // protection from user passing some arbitrary JSON object instead of string
                // (which can be circular and then test report will fail with "Converting circular structure to JSON"
                annotation      : String(annotation || ''),
                description     : String(desc || ''),
                sourceLine      : (result && result.sourceLine) || (annotation && annotation.sourceLine) || this.sourceLineForAllAssertions && this.getSourceLine() || null
            }))
        },


        /**
         * This method add the failed assertion to this test.
         *
         * @param {String} desc The description of the assertion
         * @param {String/Object} annotation The additional description how exactly this assertion fails. Will be shown with monospace font.
         *
         * Can be either string or an object with the following properties. In the latter case a string will be constructed from the properties of the object.
         *
         * - `assertionName` - the name of assertion, will be shown in the 1st line, along with originating source line (in FF and Chrome only)
         * - `got` - an arbitrary JavaScript object, when provided will be shown on the next line
         * - `need` - an arbitrary JavaScript object, when provided will be shown on the next line
         * - `gotDesc` - a prompt for "got", default value is "Got", but can be for example: "We have"
         * - `needDesc` - a prompt for "need", default value is "Need", but can be for example: "We need"
         * - `annotation` - A text to append on the last line, can contain some additional explanations
         *
         *  The "got" and "need" values will be stringified to the "not quite JSON" notation. Notably the points of circular references will be
         *  marked with `[Circular]` marks and the values at 4th (and following) level of depth will be marked with triple points: `[ [ [ ... ] ] ]`
         */
        fail : function (desc, annotation, result) {
            var sourceLine          = (result && result.sourceLine) || (annotation && annotation.sourceLine) || this.getSourceLine()
            var assertionName       = '';

            if (annotation && this.typeOf(annotation) != 'String') {
                if (!desc && annotation.descTpl) desc = this.formatString(annotation.descTpl, annotation)

                var strings             = []

                var params              = annotation
                var hasGot              = params.hasOwnProperty('got')
                var hasNeed             = params.hasOwnProperty('need')
                var gotDesc             = params.gotDesc || 'Got'
                var needDesc            = params.needDesc || 'Need'

                assertionName           = params.assertionName
                annotation              = params.annotation

                if (!params.ownTextOnly && (assertionName || sourceLine)) strings.push(
                    'Failed assertion ' + (assertionName ? '`' + assertionName + '` ' : '') + this.formatSourceLine(sourceLine)
                )

                if (hasGot && hasNeed) {
                    var max         = Math.max(gotDesc.length, needDesc.length)

                    gotDesc         = this.appendSpaces(gotDesc, max - gotDesc.length + 1)
                    needDesc        = this.appendSpaces(needDesc, max - needDesc.length + 1)
                }

                if (hasGot)     strings.push(gotDesc   + ': ' + Siesta.Util.Serializer.stringify(params.got))
                if (hasNeed)    strings.push(needDesc  + ': ' + Siesta.Util.Serializer.stringify(params.need))

                if (annotation) strings.push(annotation)

                annotation      = strings.join('\n')
            }

            if (result) {
                // Failing a pending waitFor operation
                result.name         = assertionName;
                result.passed       = false;
                result.annotation   = annotation;
                result.description  = desc;
            }

            this.addResult(result || new Siesta.Result.Assertion({
                name        : assertionName,
                passed      : false,
                sourceLine  : sourceLine,

                // protection from user passing some arbitrary JSON object instead of string
                // (which can be circular and then test report will fail with "Converting circular structure to JSON"
                annotation  : String(annotation || ''),
                description : String(desc || '')
            }))

            if (!this.isTodo) {
                if (this.harness.debuggerOnFail) {
                    eval("debugger");
                }

                if (this.harness.breakOnFail) {
                    var R = Siesta.Resource('Siesta.Test');

                    this.finalize(true);
                    throw R.get('testFailedAndAborted');
                }
            }
        },


        getSource : function () {
            return this.contentManager.getContentOf(this.url)
        },


        getSourceLine : function () {
            try {
                throw new Error()
            } catch (e) {
                if (e.stack) {
                    var match       = e.stack.match(this.urlExtractRegex())

                    if (match) return match[ 1 ]
                }

                return null
            }
        },


        getStartTestAnchor : function () {
            return this.startTestAnchor
        },


        getExceptionCatcher : function () {
            return this.exceptionCatcher
        },


        getTestErrorClass : function () {
            return this.testErrorClass
        },


        processCallbackFromTest : function (callback, args, scope) {
            var me      = this

            if (!callback) return true;

            if (this.transparentEx) {
                callback.apply(scope || this.global, args || [])
            } else {
                var e = this.getExceptionCatcher()(function(){
                    callback.apply(scope || me.global, args || [])
                })

                if (e) {
                    this.failWithException(e)

                    // flow should be interrupted - exception detected
                    return false
                }
            }

            // flow can be continued
            return true
        },


        getStackTrace : function (e) {
            if (Object(e) !== e)    return null
            if (!e.stack)           return null

            var text            = e.stack + '';
            var isFirefox       = /^@/.test(text)
            var lines           = text.split('\n')
            var R               = Siesta.Resource('Siesta.Test');

            var result          = []
            var match

            for (var i = 0; i < lines.length; i++) {
                if (!lines[ i ]) continue

                if (!i) {
                    if (isFirefox)
                        result.push(e + '')
                    else {
                        result.push(lines[ i ])
                        continue;
                    }
                }

                if (isFirefox) {
                    match       = /(.*?):(\d+):(\d+)$/.exec(lines[ i ]);

                    // the format of stack trace in Firefox has changed, 080_exception_parsing should fail
                    if (!match) return null

                    result.push('    ' + R.get('atLine') + ' ' + match[ 2 ] + ' ' + R.get('of') + ' ' + match[ 1 ])
                } else {
                    match       = /\s*at\s(.*?):(\d+):(\d+)/.exec(lines[ i ]);

                    // the format of stack trace in Chrome has changed, 080_exception_parsing should fail
                    if (!match) return null

                    result.push('    ' + R.get('atLine') + ' ' + match[ 2 ] + ', ' + R.get('character') + ' ' + match[ 3 ] + ', ' + R.get('of') + ' ' + match[ 1 ])
                }
            }

            if (!result.length) return null

            return result
        },


        formatSourceLine : function (sourceLine) {
            var R               = Siesta.Resource('Siesta.Test');

            return sourceLine ? (R.get('atLine') + ' ' + sourceLine + ' ' + R.get('of') + ' ' + this.url) : ''
        },


        appendSpaces : function (str, num) {
            var spaces      = ''

            while (num--) spaces += ' '

            return str + spaces
        },


        eachAssertion : function (func, scope) {
            scope       = scope || this

            this.getResults().each(function (result) {
                if (result instanceof Siesta.Result.Assertion) func.call(scope, result)
            })
        },


        eachSubTest : function (func, scope) {
            scope       = scope || this

            this.getResults().each(function (result) {
                if (result instanceof Siesta.Result.SubTest) 
                    if (func.call(scope, result.test) === false) return false
            })
        },


        eachChildTest : function (func, scope) {
            scope       = scope || this

            this.getResults().eachChild(function (result) {
                if (result instanceof Siesta.Result.SubTest) 
                    if (func.call(scope, result.test) === false) return false
            })
        },


        countKeys : function (object) {
            var counter = 0

            Joose.O.eachOwn(object, function () {
                counter++
            })

            return counter
        },


        /**
         * This method performs a deep comparison of the passed JSON objects. Objects must not contain cyclic references.
         * You can use this method in your own assertions.
         *
         * @param {Mixed} obj1 The 1st object to compare
         * @param {Mixed} obj2 The 2nd object to compare
         * @param {Boolean} strict When passed the `true` value, the comparison of the primitive values will be performed with the
         * `===` operator (so [ 1 ] and [ "1" ] object will be different). Additionally, when this flag is set to `true`, then
         * when comparing Function, RegExp and Date instances, additional check that objects contains the same set of own properties ("hasOwnProperty")
         * will be performed.
         * @param {Boolean} onlyPrimitives When set to `true`, the function will not recurse into composite objects (like [] or {}) and will just report that
         * objects are different. Use this mode when you are only interested in comparison of primitive values (numbers, strings, etc).
         * @param {Boolean} asObjects When set to `true`, the function will compare various special Object instances, like Functions, RegExp etc,
         * by comparison of their properties only and not taking the anything else into account.
         * @return {Boolean} `true` if the passed objects are equal
         */
        compareObjects : function (obj1, obj2, strict, onlyPrimitives, asObjects) {
            var obj1IsPlaceholder       = Joose.O.isInstance(obj1) && obj1.meta.does(Siesta.Test.Role.Placeholder)
            var obj2IsPlaceholder       = Joose.O.isInstance(obj2) && obj2.meta.does(Siesta.Test.Role.Placeholder)

            if (strict) {
                if (obj1 === obj2) return true
            } else
                if (obj1 == obj2) return true

            if (obj1IsPlaceholder && obj2IsPlaceholder)
                return obj1.equalsTo(obj2)
            else if (obj2IsPlaceholder)
                return obj2.equalsTo(obj1)
            else if (obj1IsPlaceholder)
                return obj1.equalsTo(obj2)

            if (onlyPrimitives) return false

            var type1 = this.typeOf(obj1)
            var type2 = this.typeOf(obj2)

            if (type1 != type2) return false

            var me = this

            if (type1 == 'Object' || asObjects)
                if (this.countKeys(obj1) != this.countKeys(obj2))
                    return false
                else {
                    var res = Joose.O.eachOwn(obj1, function (value, name) {

                        if (!me.compareObjects(value, obj2[ name ], strict)) return false
                    })

                    return res === false ? false : true
                }

            if (type1 == 'Array')
                if (obj1.length != obj2.length)
                    return false
                else {
                    for (var i = 0; i < obj1.length; i++)
                        if (!this.compareObjects(obj1[ i ], obj2[ i ], strict)) return false

                    return true
                }

            if (type1 == 'Function')
                return obj1.toString() == obj2.toString() && (!strict || this.compareObjects(obj1, obj2, strict, false, true))

            if (type1 == 'RegExp')
                return obj1.source == obj2.source && obj1.global == obj2.global && obj1.ignoreCase == obj2.ignoreCase
                    && obj1.multiline == obj2.multiline && (!strict || this.compareObjects(obj1, obj2, strict, false, true))

            if (type1 == 'Date') return !Boolean(obj1 - obj2) && (!strict || this.compareObjects(obj1, obj2, strict, false, true))

            return false
        },


        /**
         * This assertion passes when the supplied `value` evalutes to `true` and fails otherwise.
         *
         * @param {Mixed} value The value, indicating wheter assertions passes or fails
         * @param {String} desc The description of the assertion
         */
        ok : function (value, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (value)
                this.pass(desc, {
                    descTpl             : R.get('isTruthy'),
                    value               : value
                })
            else
                this.fail(desc, {
                    assertionName       : 'ok',
                    got                 : value,
                    annotation          : R.get('needTruthy')
                })
        },


        notok : function () {
            this.notOk.apply(this, arguments)
        },

        /**
         * This assertion passes when the supplied `value` evalutes to `false` and fails otherwise.
         *
         * It has a synonym - `notok`.
         *
         * @param {Mixed} value The value, indicating wheter assertions passes or fails
         * @param {String} desc The description of the assertion
         */
        notOk : function (value, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!value)
                this.pass(desc, {
                    descTpl             : R.get('isFalsy'),
                    value               : value
                })
            else
                this.fail(desc, {
                    assertionName       : 'notOk',
                    got                 : value,
                    annotation          : R.get('needFalsy')
                })
        },


        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `==` operator returns true and fails otherwise.
         *
         * As a special case, one or both arguments can be *placeholders*, generated with method {@link #any}.
         *
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        is : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (expected && got instanceof this.global.Date) {
                this.isDateEqual(got, expected, desc);
            } else if (this.compareObjects(got, expected, false, true))
                this.pass(desc, {
                    descTpl             : R.get('isEqualTo'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'is',
                    got                 : got,
                    need                : expected
                })
        },



        isnot : function () {
            this.isNot.apply(this, arguments)
        },

        isnt : function () {
            this.isNot.apply(this, arguments)
        },


        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `!=` operator returns true and fails otherwise.
         * It has synonyms - `isnot` and `isnt`.
         *
         * As a special case, one or both arguments can be instance of {@link Siesta.Test.BDD.Placeholder} class, generated with method {@link #any}.
         *
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        isNot : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!this.compareObjects(got, expected, false, true))
                this.pass(desc, {
                    descTpl             : R.get('isNotEqualTo'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'isnt',
                    got                 : got,
                    need                : expected,
                    needDesc            : R.get('needNot')
                })
        },


        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `===` operator returns true and fails otherwise.
         *
         * As a special case, one or both arguments can be instance of {@link Siesta.Test.BDD.Placeholder} class, generated with method {@link #any}.
         *
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        isStrict : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (this.compareObjects(got, expected, true, true))
                this.pass(desc, {
                    descTpl             : R.get('isStrictlyEqual'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'isStrict',
                    got                 : got,
                    need                : expected,
                    needDesc            : R.get('needStrictly')
                })
        },


        isntStrict : function () {
            this.isNotStrict.apply(this, arguments)
        },

        /**
         * This assertion passes when the comparison of 1st and 2nd arguments with `!==` operator returns true and fails otherwise.
         * It has synonyms - `isntStrict`.
         *
         * As a special case, one or both arguments can be instance of {@link Siesta.Test.BDD.Placeholder} class, generated with method {@link #any}.
         *
         * @param {Mixed} got The value "we have" - will be shown as "Got:" in case of failure
         * @param {Mixed} expected The value "we expect" - will be shown as "Need:" in case of failure
         * @param {String} desc The description of the assertion
         */
        isNotStrict : function (got, expected, desc) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!this.compareObjects(got, expected, true, true))
                this.pass(desc, {
                    descTpl             : R.get('isStrictlyNotEqual'),
                    got                 : got,
                    expected            : expected
                })
            else
                this.fail(desc, {
                    assertionName       : 'isntStrict',
                    got                 : got,
                    need                : expected,
                    needDesc            : R.get('needStrictlyNot')
                })
        },


        /**
         * This method starts the "asynchronous frame". The test will wait for all asynchronous frames to complete before it will finalize.
         * The frame can be finished with the {@link #endWait} call. Unlike the {@link #beginAsync}, this method requires you to provide
         * the unique id for the asynchronous frame.
         *
         * For example:
         *
         *      t.wait("require")
         *
         *      Ext.require('Some.Class', function () {
         *
         *          t.ok(Some.Class, 'Some class was loaded')
         *
         *          t.endWait("require")
         *      })
         *
         *
         * @param {String} title The unique id for the asynchronous frame.
         * @param {String} howLong The maximum time (in ms) to wait until force the finalization of this async frame. Optional. Default time is 15000 ms.
         */
        wait : function (title, howLong) {
            var R               = Siesta.Resource('Siesta.Test');

            if (this.waitTitles.hasOwnProperty(title)) throw new Error(R.get('alreadyWaiting')+ " [" + title + "]")

            return this.waitTitles[ title ] = this.beginAsync(howLong)
        },


        /**
         * This method finalize the "asynchronous frame" started with {@link #wait}.
         *
         * @param {String} title The id of frame to finalize, which was previously passed to {@link #wait} method
         */
        endWait : function (title) {
            var R               = Siesta.Resource('Siesta.Test');

            if (!this.waitTitles.hasOwnProperty(title)) throw new Error(R.get('noOngoingWait') + " [" + title + "]")

            this.endAsync(this.waitTitles[ title ])

            delete this.waitTitles[ title ]
        },



        /**
         * This method starts the "asynchronous frame". The test will wait for all asynchronous frames to complete before it will finalize.
         * The frame should be finished with the {@link #endAsync} call within the provided `time`, otherwise a failure will be reported.
         *
         * For example:
         *
         *      var async = t.beginAsync()
         *
         *      Ext.require('Some.Class', function () {
         *
         *          t.ok(Some.Class, 'Some class was loaded')
         *
         *          t.endAsync(async)
         *      })
         *
         *
         * @param {Number} time The maximum time (in ms) to wait until force the finalization of this async frame. Optional. Default time is 15000 ms.
         * @param {Function} errback Optional. The function to call in case the call to {@link #endAsync} was not detected withing `time`. If function
         * will return any "truthy" value, the failure will not be reported (you can report own failure with this errback).
         *
         * @return {Object} The frame object, which can be used in {@link #endAsync} call
         */
        beginAsync : function (time, errback) {
            time                        = time || this.defaultTimeout

            var R                       = Siesta.Resource('Siesta.Test');
            var me                      = this
            var originalSetTimeout      = this.originalSetTimeout

            var index                   = this.timeoutsCount.counter++

            // in NodeJS `setTimeout` returns an object and not a simple ID, so we try hard to store that object under unique index
            // also using `setTimeout` from the scope of test - as timeouts in different scopes in browsers are mis-synchronized
            // can't just use `this.originalSetTimeout` because of scoping issues
            var timeoutId               = originalSetTimeout(function () {

                if (me.hasAsyncFrame(index)) {
                    if (!errback || !errback.call(me, me)) me.fail(R.get('noMatchingEndAsync') + ' ' + time + ' ' + Siesta.Resource('Siesta.Test.More', 'ms'))

                    me.endAsync(index)
                }
            }, time)

            this.timeoutIds[ index ]    = timeoutId

            return index
        },
        
        
        timeoutIdToIndex : function (id) {
            var index
            
            if (typeof id == 'object') {
                index       = id.__index
            } else {
                index       = this.idsToIndex[ id ]
            }
            
            return index
        },


        hasAsyncFrame : function (index) {
            return this.timeoutIds.hasOwnProperty(index)
        },

        
        hasAsyncFrameByTimeoutId : function (id) {
            return this.timeoutIds.hasOwnProperty(this.timeoutIdToIndex(id))
        },
        

        /**
         * This method finalize the "asynchronous frame" started with {@link #beginAsync}.
         *
         * @param {Object} frame The frame to finalize (returned by {@link #beginAsync} method
         */
        endAsync : function (index) {
            var originalSetTimeout      = this.originalSetTimeout
            var originalClearTimeout    = this.originalClearTimeout || this.global.clearTimeout
            var counter                 = 0
            var R                       = Siesta.Resource('Siesta.Test');

            if (index == null) Joose.O.each(this.timeoutIds, function (timeoutId, indx) {
                index = indx
                if (counter++) throw new Error(R.get('endAsyncMisuse'))
            })

            var timeoutId               = this.timeoutIds[ index ]

            // need to call in this way for IE < 9
            originalClearTimeout(timeoutId)
            delete this.timeoutIds[ index ]

            var me = this

            if (this.processed && !this.isFinished())
                // to allow potential call to `done` after `endAsync`
                originalSetTimeout(function () {
                    me.finalize()
                }, 1)
        },


        clearTimeouts : function () {
            var originalClearTimeout    = this.originalClearTimeout

            Joose.O.each(this.timeoutIds, function (value, id) {
                originalClearTimeout(value)
            })

            this.timeoutIds = {}
        },


        // deprecated
        skipIf : function (condition, why, code, howMany) {
            howMany = howMany || 1

            if (condition) {

                for (var i = 1; i <= howMany; i++) this.addResult(new Siesta.Result.Assertion({
                    passed      : true,
                    isSkipped   : true,

                    description : 'SKIPPED: ' + why
                }))

            } else
                code()
        },


        // deprecated
        skip : function (why, code, howMany) {
            this.skipIf(true, why, code, howMany)
        },


        processSubTestConfig : function (config) {
            return Joose.O.extend({
                trait                   : Siesta.Test.Sub,

                parent                  : this,

                isTodo                  : this.isTodo,
                transparentEx           : this.transparentEx,

                waitForTimeout          : this.waitForTimeout,
                waitForPollInterval     : this.waitForPollInterval,
                defaultTimeout          : this.defaultTimeout,
                timeout                 : this.subTestTimeout,
                subTestTimeout          : this.subTestTimeout,

                global                  : this.global,
                url                     : this.url,
                scopeProvider           : this.scopeProvider,
                harness                 : this.harness,
                generation              : this.generation,

                overrideSetTimeout      : this.overrideSetTimeout,
                originalSetTimeout      : this.originalSetTimeout,
                originalClearTimeout    : this.originalClearTimeout,
                
                // share the same counter for the whole subtests tree
                timeoutsCount           : this.timeoutsCount,

                autoCheckGlobals        : false,
                needToCleanup           : false
            }, config)
        },


        /**
         * Returns a new instance of the test class, configured as being a "sub test" of the current test.
         *
         * The number of nesting levels is not limited - ie sub-tests may have own sub-tests.
         *
         * Note, that this method does not starts the sub test, but only instatiate it. To start the sub test, 
         * use the {@link #launchSubTest} method or the {@link #subTest} helper method.
         *
         * @param {String} name The name of the test. Will be used in the UI, as the parent node name in the assertions tree
         * @param {Function} code A function with test code. Will receive a test instance as the 1st argument.
         * @param {Number} [timeout] A maximum duration (in ms) for this sub test. If test will not complete within this time,
         * it will be considered failed. If not provided, the {@link Siesta.Harness#subTestTimeout} value is used.
         *
         * @return {Siesta.Test} A sub test instance
         */
        getSubTest : function (arg1, arg2, arg3) {
            var config
            var R = Siesta.Resource('Siesta.Test');

            if (arguments.length == 2 || arguments.length == 3)
                config = {
                    name        : arg1,
                    run         : arg2,
                    timeout     : arg3
                }
            else if (arguments.length == 1 && this.typeOf(arg1) == 'Function')
                config  = {
                    name        : 'Sub test',
                    run         : arg1
                }

            config              = config || arg1 || {}

            // pass-through only valid timeout values
            if (config.timeout == null) delete config.timeout

            var name            = config.name

            if (!config.run) {
                this.failWithException(R.get('codeBodyMissingForSubTest') + " [" + name + "]")
                throw new Error(R.get('codeBodyMissingForSubTest') + " [" + name + "]")
            }
            if (!config.run.length) {
                this.failWithException(R.get('codeBodyMissingTestArg').replace('{name}', name))
                throw new Error(R.get('codeBodyMissingTestArg').replace('{name}', name))
            }

            return new (config.meta || this.constructor)(this.processSubTestConfig(config))
        },


        /**
         * This method launch the provided sub test instance.
         *
         * @param {Siesta.Test} subTest A test instance to launch
         * @param {Function} callback A function to call, after the test is completed. This function is called regardless from the test execution result.
         */
        launchSubTest : function (subTest, callback) {
            var me          = this
            var R           = Siesta.Resource('Siesta.Test');
            var timeout     = subTest.timeout || this.subTestTimeout

            var async       = this.beginAsync(timeout, function () {
                me.fail(R.get('Subtest') + ' ' + (subTest.name ? '[' + subTest.name + ']' : '') + ' ' + R.get('failedToFinishWithin') + ' ' + timeout + ' ' + Siesta.Resource('Siesta.Test.More', 'ms'))

                me.restoreTimeoutOverrides()
                
                testEndListener.remove()

                subTest.finalize(true)

                callback && callback(subTest)

                return true
            })

            var testEndListener = subTest.on('testfinalize', function () {
                me.endAsync(async)
                
                me.restoreTimeoutOverrides()

                callback && callback(subTest)
            })

            this.addResult(subTest.getResults())

            subTest.start()
        },


        /**
         * With this method you can mark a group of assertions as "todo", assuming they most likely will fail,
         * but it's still worth to try to run them.
         * The supplied `code` function will be run, it will receive a new test instance as the 1st argument,
         * which should be used for assertion checks (and not the primary test instance, received from `StartTest`).
         *
         * Assertions, failed inside of the `code` block will be still treated by harness as "green".
         * Assertions, passed inside of the `code` block will be treated by harness as bonus ones and highlighted.
         *
         * See also {@link Siesta.Test.ExtJS#knownBugIn} and {@link Siesta.Test.ExtJS#snooze} methods. Note, that this method will start a new {@link #subTest sub test}.
         *
         * For example:

            t.todo('Scheduled for 4.1.x release', function (todo) {

                var treePanel    = new Ext.tree.Panel()

                todo.is(treePanel.getView().store, treePanel.store, 'NodeStore and TreeStore have been merged and there is only 1 store now');
            })

         * @param {String} why The reason/description for the todo
         * @param {Function} code A function, wrapping the "todo" assertions. This function will receive a special test class instance
         * which should be used for assertion checks
         */
        todo : function (why, code, callback) {
            if (this.typeOf(why) == 'Function') why = [ code, code = why ][ 0 ]

            var todo        = this.getSubTest({
                name            : why,

                run             : code,

                isTodo          : true,
                transparentEx   : false
            })

            this.launchSubTest(todo, callback)
        },


        /**
         * This method allows you to "snooze" the failing test (make it a {@link Siesta.Test#todo todo test} until certain date.
         * After that date, test will become "normal" again. Use with care :)
         *
            t.snooze('2014-10-10', function (todo) {

                var treePanel    = new Ext.tree.Panel()

                todo.is(treePanel.getView().store, treePanel.store, 'NodeStore and TreeStore have been merged and there is only 1 store now');
            })
         *
         * @param {String/Date} snoozeUntilDate The date until which we don't want to hear about this test. Can be provided as `Date` instance or a string, recognized by `Date` constructor
         * @param {Function} fn The function body of the test
         * @param {String} reason The reason or explanation why this test is "snoozed"
         */
        snooze : function(snoozeUntilDate, fn, reason) {
            var R       = Siesta.Resource('Siesta.Test');

            if (new Date() > new Date(snoozeUntilDate)) {
                fn.call(this.global, this);
            } else {
                this.todo(R.get('Snoozed until') + ' ' + new Date(snoozeUntilDate) + ': ' + (reason || ''), fn);
            }
        },



        /**
         * This method starts a new sub test. Sub tests have separate order of assertions. In the browser UI,
         * sub tests are presented with the "parent" node of the assertions tree. Sub tests are useful if you want to test
         * several asynchronous processes in parallel, and would like to see assertions from every process separated.
         *
         * Sub tests may have their own sub tests, the number of nesting levels is not limited.
         *
         * Sub test can contain asynchronous methods as any other tests. Sub tests are considered completed
         * only when all of its asynchronous methods have completed *and* all of its sub-tests are completed too.
         *
         * For example:
         *

    t.subTest('Load 1st store', function (t) {
        var async   = t.beginAsync()

        store1.load({
            callback : function () {
                t.endAsync(async);
                t.isGreater(store1.getCount(), 0, "Store1 has been loaded")
            }
        })
    })

    t.subTest('Load 2nd store', function (t) {
        var async   = t.beginAsync()

        store2.load({
            callback : function () {
                t.endAsync(async);
                t.isGreater(store2.getCount(), 0, "Store2 has been loaded")
            }
        })
    })

         * Note, that sub test starts right away, w/o waiting for any previous sub tests to complete. If you'd like to run several sub-tests
         * sequentially, use {@link #chain} method in combination with {@link #getSubTest} method.
         *
         * @param {String} desc The name of the sub test. Will be shown as the name of the parent node in assertion tree.
         * @param {Function} code The test function to execute. It will receive a test instance as 1st argument. This test instance *must* be
         * used for assertions inside of the test function
         * @param {Function} callback The callback to execute after the sub test completes (either successfully or not)
         * @param {Number} [timeout] A maximum duration (in ms) for this sub test. If test will not complete within this time,
         * it will be considered failed. If not provided, the {@link Siesta.Harness#subTestTimeout} value is used.
         */
        subTest : function (desc, code, callback, timeout) {
            var subTest     = this.getSubTest({
                name            : desc || Siesta.Resource('Siesta.Test', 'Subtest'),
                timeout         : timeout,
                run             : code
            })

            this.launchSubTest(subTest, callback)
            
            return subTest
        },
        
        
        stringifyException : function (e, stackTrace) {
            var stringified             = e + ''
            var annotation              = (stackTrace || this.getStackTrace(e) || []).join('\n')

            // prepend the exception message to the stack trace if its not already there
            if (annotation.indexOf(stringified) == -1) annotation = stringified + annotation
            
            return annotation
        },


        failWithException : function (e) {
            var R                       = Siesta.Resource('Siesta.Test');
            
            this.failed                 = true

            this.failedException        = e + ''
            this.failedExceptionType    = this.typeOf(e)
            
            var stackTrace              = this.getStackTrace(e)

            this.addResult(new Siesta.Result.Assertion({
                isException     : true,
                exceptionType   : this.failedExceptionType,
                passed          : false,
                description     : (this.parent ? R.get('Subtest') + " `" + this.name + "`" : R.get('Test') + ' ') + ' ' + R.get('threwException'),
                annotation      : this.stringifyException(e, stackTrace)
            }))


            /**
             * This event is fired when an individual test case has thrown an exception.
             *
             * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
             *
             * @event testfailedwithexception
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just threw an exception
             * @param {Object} exception The exception thrown
             */
            this.fireEvent('testfailedwithexception', this, e, stackTrace);

            this.finalize(true)
        },
        
        
        restoreTimeoutOverrides : function () {
            if (this.overrideSetTimeout) {
                this.global.setTimeout      = this.overrideForSetTimeout
                this.global.clearTimeout    = this.overrideForClearTimeout
            }
        },


        start : function (alreadyFailedWithException) {
            var R = Siesta.Resource('Siesta.Test');

            if (this.startDate) {
                throw R.get('testAlreadyStarted');
            }

            this.startDate  = new Date() - 0

            /**
             * This event is fired when an individual test case starts. When *started*, the test may still be waiting for the {@link #isReady} condition
             * to be fullfilled. Once all conditions are fullfilled the test will be *launched*.
             *
             * This event bubbles up to the {@link Siesta.Harness harness}, you can observe it on harness as well.
             *
             * @event teststart
             * @member Siesta.Test
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Test} test The test instance that just has started
             */
            this.fireEvent('teststart', this);

            if (alreadyFailedWithException) {
                this.failWithException(alreadyFailedWithException)

                return
            }

            // Sub-tests should not perform the `setup` or wait for `isReady` readyness
            if (this.parent || this.reusingSandbox) {
                this.launch()
                return
            }

            var me              = this;
            var errorMessage;

            // Note, that `setTimeout, setInterval` and similar methods here are from the harness context

            var cont            = function (isReadyError) {
                var hasTimedOut     = false

                var setupTimeout    = setTimeout(function () {
                    hasTimedOut     = true
                    me.launch(R.get('setupTookTooLong'))
                }, me.isReadyTimeout)

                me.setup(
                    function () {
                        if (!hasTimedOut) {
                            clearTimeout(setupTimeout)
                            me.launch()
                        }
                    },
                    function (setupError) {
                        if (!hasTimedOut) {
                            clearTimeout(setupTimeout)
                            me.launch(setupError)
                        }
                    }
                );
            }

            var readyRes        = me.isReady();

            if (readyRes.ready) {
                // We're ready to go
                cont();
            } else {
                // Need to wait for isReady to give green light
                var timeout         = setTimeout(function () {
                    clearInterval(interval)
                    cont(errorMessage)

                }, me.isReadyTimeout)

                var interval = setInterval(function(){
                    readyRes = me.isReady();

                    if (readyRes.ready) {
                        clearInterval(interval)
                        clearTimeout(timeout)
                        cont();
                    } else {
                        errorMessage = readyRes.reason || errorMessage;
                    }
                }, 100);
            }
        },


        /**
         * This method can perform any setup code your tests need. It is called before the begining of every test and receives
         * a callback and errback, either of those should be called once the setup has completed (or failed). 
         * See also {@link #tearDown}.
         *  
         * Typical usage for this method can be for example to log in into the application, before interacting with it:
         *

    Class('My.Test.Class', {

        isa         : Siesta.Test.Browser,

        override : {

            setup : function (callback, errback) {
                Ext.Ajax.request({
                    url     : 'do_login.php',

                    params  : { ... },

                    success : function () {
                        callback()
                    },
                    failure : function () {
                        errback('Login failed')
                    }
                })
            }
        },

        ....
    })

         *
         * This method will be called *after* the {@link #isReady} method has reported that the test is ready to start.
         *
         * If the setup has failed for some reason, then an errback should be called and a failing assertion will be added to the test
         * (though the test will be lauched anyway). A text of the failed assertion can be given as the 1st argument for the errback.
         *
         * Note, that the setup is supposed to be completed within the {@link #isReadyTimeout} timeout, otherwise it will be
         * considered failed and the test will be launched with a failed assertion.
         * 
         * If you need to perform a setup at an earlier point, check the {@link #earlySetup} method.
         *
         * @param {Function} callback A function to call when the setup has completed successfully
         * @param {Function} errback A function to call when the setup has completed with an error
         */
        setup : function (callback, errback) {
            callback.call(this)
        },


        /**
         * This method can perform any asynchronous finalization code your tests need. It is called after the test has
         * been finished (or finalized externally by any reason, for example if user re-starts the test).
         * This method receives a callback and errback, either of those should be called once the tear down has completed 
         * (or has failed). Typical usage for this method can be for example to clear the database or release some other resource.
         * 
         * **Note** though, that if test suite has experienced a hard failure, this method may not be called.
         *

    Class('My.Test.Class', {

        isa         : Siesta.Test.Browser,

        override : {

            tearDown : function (callback, errback) {
                Ext.Ajax.request({
                    url     : 'clear_the_db.php',

                    params  : { ... },

                    success : function () {
                        callback()
                    },
                    failure : function () {
                        errback("Error message")
                    }
                })
            }
        },

        ....
    })

         *
         * If the tearDown has failed for some reason, then an errback should be called and a failing assertion will be added to the test
         * (though the test will be lauched anyway). A text of the failed assertion can be given as the 1st argument for the errback.
         *
         * Note, that the tear down process is supposed to be completed within the {@link #isReadyTimeout} timeout, after this
         * timeout a failing assertion will be added to the test and test suite will just continue execution.
         * 
         * @param {Function} callback A function to call when the tear down process has completed successfully
         * @param {Function} errback A function to call when the tear down process has failed.
         * @param {String} [errback.errorMessage] An error message which will be added as a failing assertion to the test.
         */
        tearDown : function (callback, errback) {
            callback.call(this)
        },
        
        
        /**
         * This method can perform any setup code your tests need. It is the earliest point for doing setup, it is called
         * even before the iframe of the test is created and started loading. Normally, you should use the {@link #setup} method
         * for tests initialization purposes.
         * 
         * Typical usage for this method can be  for example to clear the database, before starting to 
         * load the {@link Siesta.Harness.Browser#hostPageUrl hostPageUrl} link.  
         * 
         * This method receives a callback and errback, either of these should be called once the setup has completed (or failed). 
         *

    Class('My.Test.Class', {

        isa         : Siesta.Test.Browser,

        override : {

            earlySetup : function (callback, errback) {
                Ext.Ajax.request({
                    url     : 'clear_test_db.php',

                    params  : { ... },

                    success : function () {
                        callback()
                    },
                    failure : function () {
                        errback('Reseting DB has failed')
                    }
                })
            }
        },

        ....
    })

         *
         * If the setup has failed for some reason, then an errback should be called and a failing assertion will be added to the test
         * (though the test will be lauched anyway). A text of the failed assertion can be given as the 1st argument for the errback.
         *
         * Note, that the setup is supposed to be completed within the {@link #isReadyTimeout} timeout, otherwise it will be
         * considered failed and the test will be launched with a failed assertion. Also, this method is not called for the
         * re-used iframes (see the {@link Siesta.Harness.Browser#sandbox sandbox} option).
         *
         * @param {Function} callback A function to call when the setup has completed successfully
         * @param {Function} errback A function to call when the setup has completed with an error
         */
        earlySetup : function (callback, errback) {
            callback.call(this)
        },
        
        
        // only called for the re-used contexts
        cleanupContextBeforeStart : function () {
            var global      = this.global

            this.forEachUnexpectedGlobal(function (name) {
                try {
                    // can throw exception in IE8
                    delete global[ name ]
                } catch (e) {
                }
            })
        },
        
        
        // this method assumes "overrideSetTimeout" option is enabled
        clearAsyncFrameGlobally : function (id) {
            var topTest     = this
            
            while (topTest.parent) topTest = topTest.parent
            
            topTest.eachSubTest(function (subTest) {
                if (subTest.hasAsyncFrameByTimeoutId(id)) {
                    subTest.overrideForClearTimeout(id)
                    return false
                }
            })
        },


        launch : function (errorMessage) {
            if (errorMessage) {
                var R = Siesta.Resource('Siesta.Test');

                this.fail(R.get('errorBeforeTestStarted'), {
                    annotation      : errorMessage
                })
            }

            var me                      = this
            var global                  = this.global

            var scopeProvider           = this.scopeProvider

            var originalSetTimeout      = this.originalSetTimeout
            var originalClearTimeout    = this.originalClearTimeout

            if (this.overrideSetTimeout) {
                // see http://www.adequatelygood.com/2011/4/Replacing-setTimeout-Globally
                if (!this.reusingSandbox) scopeProvider.runCode('var setTimeout, clearTimeout;')

                global.setTimeout = this.overrideForSetTimeout = function (func, delay) {

                    var index = me.timeoutsCount.counter++

                    // in NodeJS `setTimeout` returns an object and not a simple ID, so we try hard to store that object under unique index
                    // also using `setTimeout` from the scope of test - as timeouts in different scopes in browsers are mis-synchronized
                    var timeoutId = originalSetTimeout(function () {
                        originalClearTimeout(timeoutId)
                        delete me.timeoutIds[ index ]

                        // if the test func has been executed, but the test was not finalized yet - then we should try to finalize it
                        if (me.processed && !me.isFinished())
                            // we are doing that after slight delay, potentially allowing to setup some other async frames in the "func" below
                            originalSetTimeout(function () {
                                me.finalize()
                            }, 1)

                        func()

                    }, delay)

                    // in NodeJS saves the index of the timeout descriptor to the descriptor
                    if (typeof timeoutId == 'object')
                        timeoutId.__index = index
                    else
                        // in browser (where `timeoutId` is a number) - to the `idsToIndex` hash
                        me.idsToIndex[ timeoutId ] = index

                    return me.timeoutIds[ index ] = timeoutId
                }

                global.clearTimeout = this.overrideForClearTimeout = function (id) {
                    if (id == null) return
                    
                    // if there's no timeout id with this index, that probably means
                    // that this "clearTimeout" call corresponds to the "setTimeout" from some other
                    // sub test - parent most probably (or sibling sub test)
                    // strictly that may not be true, because user can launch several sub tests
                    // simultaneously, but, "overrideSetTimeout" for that case can not be supported reliably
                    // anyway, as we need to know from what test the "setTimeout" call comes (to keep it
                    // active) and we can't override it twice
                    if (!me.hasAsyncFrameByTimeoutId(id)) {
                        me.clearAsyncFrameGlobally(id)
                        
                        return
                    }

                    originalClearTimeout(id)
                    
                    var index       = me.timeoutIdToIndex(id)

                    if (index != null) delete me.timeoutIds[ index ]

                    // if the test func has been executed, but the test was not finalized yet - then we should try to finalize it
                    if (me.processed && !me.isFinished())
                        // we are doing that after slight delay, potentially allowing to setup some other async frames after the "clearTimeout" will complete
                        originalSetTimeout(function () {
                            me.finalize()
                        }, 1)
                }
            }
            // eof this.overrideSetTimeout

            // we only don't need to cleanup up when doing a self-testing or for sub-tests
            if (this.needToCleanup) {
                scopeProvider.beforeCleanupCallback = function () {
                    // if scope cleanup happens most probably user has restarted the test and is not interested in the results
                    // of previous launch
                    // finalizing the previous test in such case
                    if (!me.isFinished()) me.finalize(true)

                    if (me.overrideSetTimeout) {
                        global.setTimeout           = originalSetTimeout
                        global.clearTimeout         = originalClearTimeout
                    }

                    // cleanup the closures just in case (probably useful for IE)
                    originalSetTimeout          = originalClearTimeout  = null
                    global                      = null

                    // this iterator will also process "this" test instance too
                    me.eachSubTest(function (subTest) {
                        subTest.cleanup()
                    })
                }
            }

            if (this.reusingSandbox && this.sandboxCleanup) {
                this.cleanupContextBeforeStart()
            }

            // trying to focus the window (hopefully fixes the tab key issues)
            global.focus && global.focus()

            var run     = this.run

            if (this.transparentEx)
                run(me)
            else
                var e = this.getExceptionCatcher()(function(){
                    run(me)
                })

            this.afterLaunch(e)
        },


        // called before the iframe of the test is removed from DOM
        cleanup : function () {
            this.overrideForSetTimeout  = this.overrideForClearTimeout  = null
            this.originalSetTimeout     = this.originalClearTimeout     = null
            this.global                 = this.run                      = null
            this.exceptionCatcher       = this.testErrorClass           = null
            this.startTestAnchor                                        = null
            
            this.scopeProvider          = null
            
            this.purgeListeners()
        },


        // a method executed after the "run" function has been ran - used in BDD role for example
        afterLaunch : function (e) {
            if (e)
                this.failWithException(e)
            else
                this.finalize()
        },


        finalize : function (force) {
            var me          = this
            var R           = Siesta.Resource('Siesta.Test');
            
            if (me.finalizationStarted || me.isFinished()) return

            me.processed = true

            if (force) {
                me.clearTimeouts()

                me.eachChildTest(function (childTest) { childTest.finalize(true) })
            }

            if (!Joose.O.isEmpty(me.timeoutIds)) {
                if (
                    !me.__timeoutWarning && me.overrideSetTimeout && me.lastActivityDate &&
                    new Date() - me.lastActivityDate > me.defaultTimeout * 2
                ) {
                    me.diag(R.get('testStillRunning'));
                    me.warn(R.get('testNotFinalized').replace('{url}', me.url));
                    me.__timeoutWarning = true;
                }

                return
            }

            if (!me.needDone && !me.isDone) {
                // this is the early "testfinalize" hook, we need "early" and "regular" hooks, since we want the globals check to be the last assertion
                me.fireEvent('beforetestfinalizeearly', me)

                // Firing the `beforetestfinalizeearly` events may trigger additional test actions
                if (!Joose.O.isEmpty(me.timeoutIds)) {
                    if (force)
                        me.clearTimeouts()
                    else
                        return
                }

                /**
                 * This event is fired before each individual test case ends (no any corresponding Harness actions will have been run yet).
                 *
                 * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
                 *
                 * @event beforetestfinalize
                 * @member Siesta.Test
                 * @param {JooseX.Observable.Event} event The event instance
                 * @param {Siesta.Test} test The test instance that is about to finalize
                 */
                me.fireEvent('beforetestfinalize', me);
            }
            
            me.finalizationStarted  = true

            var finalizationCode    = function (tearDownError) {
                if (tearDownError) me.fail(tearDownError)
                
                me.endDate = new Date() - 0
    
                if (!me.parent) me.addResult(new Siesta.Result.Summary({
                    isFailed            : me.isFailed(),
                    description         : me.getSummaryMessage()
                }))
                
                me.onTestFinalize()
                
                /**
                 * This event is fired when an individual test case ends (either because it has completed correctly or thrown an exception).
                 *
                 * This event bubbles up to the {@link Siesta.Harness harness}, so you can observe it on the harness as well.
                 *
                 * @event testfinalize
                 * @member Siesta.Test
                 * @param {JooseX.Observable.Event} event The event instance
                 * @param {Siesta.Test} test The test instance that just has completed
                 */
                me.fireEvent('testfinalize', me);
    
                // a test end event that bubbles
                me.fireEvent('testendbubbling', me);
    
                me.callback && me.callback()
                
                // help garbage collector to cleanup all the context of this callback (huge impact)
                me.callback     = null
            }
            
            // sub-tests don't do the "tearDown" process
            if (me.parent || me.reusingSandbox) {
                finalizationCode()
                
                return
            }
            
            var originalSetTimeout      = me.originalSetTimeout
            var originalClearTimeout    = me.originalClearTimeout
            
            var hasTimedOut     = false
            
            var timeout         = originalSetTimeout(function () {
                hasTimedOut     = true
                
                finalizationCode(R.get('testTearDownTimeout'))
            }, me.isReadyTimeout)
            
            me.tearDown(function () {
                originalClearTimeout(timeout)
                
                if (!hasTimedOut) finalizationCode()
            }, function (error) {
                originalClearTimeout(timeout)
                
                if (!hasTimedOut) finalizationCode(error)
            })
        },
        
        
        onTestFinalize : function () {
        },


        getSummaryMessage : function (lineBreaks) {
            var res             = []

            var passCount       = this.getPassCount()
            var failCount       = this.getFailCount()
            var assertPlanned   = this.assertPlanned
            var total           = failCount + passCount

            res.push('Passed: ' + passCount)
            res.push('Failed: ' + failCount)

            if (!this.failed) {
                // there was a t.plan() call
                if (assertPlanned != null) {
                    if (total < assertPlanned)
                        res.push('Looks like you planned ' + assertPlanned + ' tests, but ran only ' + total)

                    if (total > assertPlanned)
                        res.push('Looks like you planned ' + assertPlanned + ' tests, but ran ' +  (total - assertPlanned) + ' extra tests, ' + total + ' total.')

                    if (total == assertPlanned && !failCount) res.push('All tests passed')
                } else {
                    var R = Siesta.Resource('Siesta.Test');

                    if (!this.isDoneCorrectly()) res.push(R.get('missingDoneCall'))

                    if (this.isDoneCorrectly() && !failCount) res.push(R.get('allTestsPassed'))
                }
            }

            return lineBreaks ? res.join(lineBreaks) : res
        },


        /**
         * This method indicates that the test has completed at the expected point and no more assertions are planned. Adding assertions after the call to `done`
         * will add a failing assertion "Adding assertion after test completion".
         *
         * @param {Number} delay Optional. When provided, the test will not complete right away, but will wait for `delay` milliseconds for additional assertions.
         */
        done : function (delay) {
            var me      = this

            if (delay) {
                var async = this.beginAsync()

                var originalSetTimeout = this.originalSetTimeout

                originalSetTimeout(function () {

                    me.endAsync(async)
                    me.done()

                }, delay)

            } else {
                this.fireEvent('beforetestfinalizeearly')
                this.fireEvent('beforetestfinalize');

                this.isDone = true

                if (this.processed) this.finalize()
            }
        },

        // `isDoneCorrectly` means that either test does not need the call to `done`
        // or the call to `done` has been already made
        isDoneCorrectly : function () {
            return !this.needDone || this.isDone
        },


        getAssertionCount : function (excludeTodo) {
            var count   = 0

            this.eachAssertion(function (assertion) {
                if (!excludeTodo || !assertion.isTodo) count++
            })

            return count
        },


        // cached method except the "includeTodo" case
        getPassCount : function (includeTodo) {
            if (this.$passCount != null && !includeTodo) return this.$passCount

            var passCount = 0

            this.eachAssertion(function (assertion) {
                if (assertion.passed && (includeTodo || !assertion.isTodo)) passCount++
            })

            return includeTodo ? passCount : this.$passCount = passCount
        },

        getTodoPassCount : function () {
            var todoCount = 0;

            this.eachAssertion(function (assertion) {
                if (assertion.isTodo && assertion.passed) todoCount++;
            });

            return todoCount;
        },

        getTodoFailCount : function () {
            var todoCount = 0;

            this.eachAssertion(function (assertion) {
                if (assertion.isTodo && !assertion.passed) todoCount++;
            });

            return todoCount;
        },


        // cached method except the "includeTodo" case
        getFailCount : function (includeTodo) {
            if (this.$failCount != null && !includeTodo) return this.$failCount

            var failCount = 0

            this.eachAssertion(function (assertion) {
                if (!assertion.passed && (includeTodo || !assertion.isTodo)) failCount++
            })

            return includeTodo ? failCount : this.$failCount = failCount
        },


        getFailedAssertions : function () {
            var failed      = [];

            this.eachAssertion(function (assertion) {
                if (!assertion.isPassed()) failed.push(assertion)
            })

            return failed
        },


        isPassed : function () {
            var passCount       = this.getPassCount()
            var failCount       = this.getFailCount()
            var assertPlanned   = this.assertPlanned

            return this.isFinished() && !this.failed && !failCount && (
                assertPlanned != null && passCount == assertPlanned
                    ||
                assertPlanned == null && this.isDoneCorrectly()
            )
        },


        isFailed : function () {
            var passCount       = this.getPassCount()
            var failCount       = this.getFailCount()
            var assertPlanned   = this.assertPlanned

            return this.failed || failCount || (

                this.isFinished() && (
                    assertPlanned != null && passCount != assertPlanned
                        ||
                    assertPlanned == null && !this.isDoneCorrectly()
                )
            )
        },


        isFailedWithException : function () {
            return this.failed
        },


        isStarted : function () {
            return this.startDate != null
        },


        isFinished : function () {
            return this.endDate != null
        },


        getDuration : function () {
            return this.endDate - this.startDate
        },


        getBubbleTarget : function () {
            return this.parent || this.harness;
        },


        warn : function (message) {
            this.addResult(new Siesta.Result.Diagnostic({
                description : message,
                isWarning   : true
            }))
        },


        flattenArray : function (array) {
            var me          = this
            var result      = []

            Joose.A.each(array, function (el) {
                if (me.typeOf(el) == 'Array')
                    result.push.apply(result, me.flattenArray(el))
                else
                    result.push(el)
            })

            return result
        },


        trimString : function (string) {
            // "polyfill" regexp from MDN
            // Make sure we trim BOM and NBSP
            return String(string).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
        },


        buildActionableMethods : function () {
            var methods     = {}

            this.meta.getMethods().each(function (method, name) {
                methods[ name.toLowerCase() ] = name
            })

            return methods
        },


        getJUnitClass : function () {
            return this.jUnitClass || this.meta.name || 'Siesta.Test'
        },
        
        
        // to give test scripts access to locales
        resource : function () {
            return Siesta.Resource.apply(Siesta.Resource, arguments)
        }
    }
    // eof methods

})
//eof Siesta.Test;
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
;
/**
@class Siesta.Test.Action

Base class for {@link Siesta.Test#chain} actions.

*/
Class('Siesta.Test.Action', {
    
    has : {
        args                : null, 
        
        /**
         * @cfg {String} desc When provided, once step is completed, a passing assertion with this text will be added to a test.
         * This configuration option can be useful to indicate the progress of "wait" steps  
         */
        desc                : null,
        test                : { required : true },
        next                : { required : true },
        
        requiredTestMethod  : null
    },

    
    methods : {
        
        initialize : function () {
            var requiredTestMethod  = this.requiredTestMethod
            
            // additional sanity check
            if (requiredTestMethod && !this.test[ requiredTestMethod ]) 
                throw new Error(Siesta.Resource('Siesta.Test.Action','missingTestAction').replace('{0}', this.meta.name).replace('{1}', requiredTestMethod))
        },
        
        
        process : function () {
            this.next()
        }
    }
});
;
/**

@class Siesta.Test.Action.Done
@extends Siesta.Test.Action

This action can be included in the `t.chain` call with "done" shortcut:

    t.chain(
        {
            action      : 'done'
        }
    )

This action will just call the {@link Siesta.Test#done done} method of the test.

*/
Class('Siesta.Test.Action.Done', {
    
    isa         : Siesta.Test.Action,
    
    has : {
        /**
         * @cfg {Number} delay
         * 
         * An optional `delay` argument for {@link Siesta.Test#done done} call.
         */
        delay  :        null
    },

    
    methods : {
        
        process : function () {
            this.test.done(this.delay)
            
            this.next()
        }
    }
});


Siesta.Test.ActionRegistry().registerAction('done', Siesta.Test.Action.Done);
/**

@class Siesta.Test.Action.Wait
@extends Siesta.Test.Action

This action can be included in the `t.chain` call with "wait" or "delay" shortcuts:

    t.chain(
        {
            action      : 'wait',   // or "delay"
            delay       : 1000      // 1 second
        }
    )

Alternatively, for convenience, this action can be included in the chain using "waitFor" config (the "action" property can be omitted):

    t.chain(
        {
            waitFor     : 'selector',           // or any other waitFor* method name
            args        : [ '.x-grid-row' ]     // an array of arguments for the specified method
        }
    )
    
    t.chain(
        {
            waitFor     : 'rowsVisible',        // or any other waitFor* method name
            args        : [ grid ]              // an array of arguments for the specified method
        }
    )
    
    t.chain(
        {
            waitFor     : 'waitForRowsVisible', // full method name is also ok
            args        : grid                  // a single value will be converted to array automatically
        }
    )
    
In the latter case, this action will perform a call to the one of the `waitFor*` methods of the test instance.
The name of the method is computed by prepending the uppercased value of `waitFor` config with the string "waitFor" 
(unless it doesn't already start with "waitFor").
The arguments for method call can be provided as the "args" array. Any non-array value for "args" will be converted to an array with one element.
* **Note**, that this action will provide a `callback`, `scope`, and `timeout` arguments for `waitFor*` methods - you should not specify them. 


As a special case, the value of `waitFor` config can be a Number or Function - that will trigger the call to {@link Siesta.Test#waitFor} method with provided value:

    t.chain(
        {
            waitFor     : 500
        },
        // same as
        {
            waitFor     : '',
            args        : [ 500 ] 
        },
        {
            waitFor     : function () { return document.body.className.match(/someClass/) }
        }
    )

*/
Class('Siesta.Test.Action.Wait', {
    
    isa         : Siesta.Test.Action,
    
    has : {
        /**
         * @cfg {Number} delay
         * 
         * A number of milliseconds to wait before continuing.
         */
        delay           : 1000,
        
        /**
         * @cfg {Number} timeout
         * 
         * The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        timeout         : null,

        /**
         * @cfg {Array/Function} args
         * 
         * The array of arguments to pass to waitForXXX method. You should omit the 3 last parameters: callback, scope, timeout. Any non-array value will be converted to 
         * a single-value array. Can be also a function, returning either an array of a single value, which will be converted to array.
         * Function will be called using test instance as a "this" scope.
         * If you need to pass a function, as an argument, wrap in the array. Compare: 
    {
        waitFor : 'SomeCondition',
        // will be called when processing the action, should return an array of arguments
        args    : function () {} 
    }
    
    {
        waitFor : 'SomeCondition',
        // won't be called, instead will be passed as 1st argument
        args    : [ function () {} ] 
    }
         *  
         */
        args            : Joose.I.Array,

        /**
         * @cfg {String} waitFor
         * 
         * The name of the `waitFor` method to call. You can omit the leading "waitFor":
         * 

    t.chain(
        {
            waitFor     : 'selector',
            ...
        },
        // same as
        {
            waitFor     : 'waitForSelector',
            ...
        }
    )
         * 
         */
        waitFor         : null,
        
        
        /**
         * @cfg {Object/Function} trigger 
         * 
         * A config object for the action that should trigger the waiting condition. Can be also a regular function to execute. 
         * An action or function will be executed right *after* the waiting has started, to avoid the race conditions. 
         * 
         * To illustrate, imagine, when clicking on some button, new data package will be loaded and some event `dataloaded` 
         * will be fired. We want to wait for that event. Usually, you will write this as the following action steps, in the `chain` method:
         * 

    t.chain(
        { click : '.someButton' },
        { waitFor : 'Event', args : [ someDataStorage, 'dataload' ] },
        ...
    )

         * However, imagine loading mechanism implements caching, and sometimes loading happens *synchronously*. In this case,
         * the `dataload` event will be also fired synchronously, right during the "onclick" handler of the button. Then, we'll start
         * waiting for that event (which has already been fired) and the `waitFor` action will fail.
         * 
         * To avoid this race condition, we need to first start waiting for the event, and only then - perform a click:
         * 

    t.chain(
        function (next) {
            t.waitForEvent(someDataStorage, 'dataload', next);
            
            t.click('.someButton', function () {})
        },
        ...
    )

         * or, using `trigger` config:

    t.chain(
        { 
            waitFor : 'Event', 
            args    : [ someDataStorage, 'dataload' ],
            trigger : { click : '.someButton' } 
        },
        ...
    )

         */
        trigger         : null
    },

    
    methods : {
        
        process : function () {
            var waitFor     = this.waitFor;
            var test        = this.test

            if (test.typeOf(waitFor) === 'Number' || test.typeOf(waitFor) === 'Function') {
                // Caller supplied a function returning true when done waiting or
                // a number of milliseconds to wait for.
                this.args   = [ waitFor ];
                waitFor     = '';
            }
            
            if (waitFor == null) {
                this.args   = [ this.delay ];
                waitFor     = '';
            }
            
            // special case for { waitForFn : function () {} }" - we consider the function here
            // not a function which should return an array with arguments for the "waitFor" method
            // (which is a usual behavior for { someMehthod : function () {} } ), but the `waitFor` checker function itself
            if (test.typeOf(this.args) === "Function" && waitFor != 'waitForFn') {
                this.args   = this.args.call(test, this);
            }
            
            if (test.typeOf(this.args) !== "Array") {
                this.args   = [ this.args ];
            }

            // also allow full method names
            waitFor         = waitFor.replace(/^waitFor/, '')
            var methodName  = 'waitFor' + Joose.S.uppercaseFirst(waitFor);
            
            if (!test[ methodName ]){
                throw Siesta.Resource("Siesta.Test.Action.Wait", 'missingMethodText') + methodName;
            }
            
            // If using simple waitFor statement, use the object notation to be able to pass a description
            // which gives better debugging help than "Waited too long for condition to be fulfilled".
            if (methodName === 'waitFor') {
                test.waitFor({
                    method          : this.args[ 0 ],
                    callback        : this.next,
                    scope           : test,
                    timeout         : this.timeout || test.waitForTimeout,
                    description     : this.desc || ''
                });
            } else {
                test[ methodName ].apply(test, this.args.concat(this.next, test, this.timeout || test.waitForTimeout));
            }
            
            var trigger     = this.trigger
            
            if (trigger) {
                if (test.typeOf(trigger) == 'Function') 
                    trigger.call(test, test)
                else {
                    if (!(trigger instanceof Siesta.Test.Action)) {
                        trigger.next        = function () {}
                        trigger.test        = this.test
                        
                        trigger             = Siesta.Test.ActionRegistry().create(trigger, test)
                    }
                    
                    trigger.process()
                }
            }
            
        }
    }
});

Joose.A.each([ 'wait', 'waitFor', 'delay' ], function(name) {
    Siesta.Test.ActionRegistry().registerAction(name, Siesta.Test.Action.Wait);
});;
/**

@class Siesta.Test.Action.Eval
@extends Siesta.Test.Action

This action can be included in the `t.chain` steps only with a plain string. Siesta will examine the passed string,
and call an apropriate method of the test class. String should have the following format: 
    
    methodName(params) 

Method name is anything until the first parenthes. Method name may have an optional prefix `t.`. 
Everything in between of outermost parentheses will be treated as parameters for method call. For example:

    t.chain(
        // string should look like a usual method call, 
        // but arguments can't reference any variables
        // strings should be quoted, to include quoting symbol in string use double slash: \\
        't.click("combo[type=some\\"Type] => .x-form-trigger")',
        
        // leading "t." is optional, but quoting is not
        'waitForComponent("combo[type=someType]")',
        
        // JSON objects are ok, but they should be a valid JSON - ie object properties should be quoted
        'myClick([ 10, 10 ], { "foo" : "bar" })',
    )
    
* **Note** You can pass the JSON objects as arguments, but they should be serialized as valid JSON - ie object properties should be quoted.
    
* **Note** A callback for next step in chain will be always appended to provided parameters. Make sure it is placed in a correct spot!
For example if method signature is `t.someMethod(param1, param2, callback)` and you are calling this method as:
    
    t.chain(
        `t.someMethod("text")`
    )
it will fail - callback will be provided in place of `param2`. Instead call it as: 
    
    t.chain(
        `t.someMethod("text", null)`
    )

This action may save you few keystrokes, when you need to perform some action with static arguments (known prior the action).

*/
Class('Siesta.Test.Action.Eval', {
    
    isa         : Siesta.Test.Action,
    
    has : {
        /**
         * @cfg {Object} options
         *
         * Any options that will be used when simulating the event. For information about possible
         * config options, please see: <https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent>
         */
        actionString          : null
    },

    
    methods : {
        
        process : function () {
            var test            = this.test
            var parsed          = this.parseActionString(this.actionString)
            
            if (parsed.error) {
                test.fail(parsed.error)
                this.next()
                return
            }
            
            var methodName      = parsed.methodName
            
            if (!methodName || test.typeOf(test[ methodName ]) != 'Function') {
                test.fail(Siesta.Resource("Siesta.Test.Action.Eval", 'invalidMethodNameText') + methodName)
                this.next()
                return
            }
            
            parsed.params.push(this.next)
            
            test[ methodName ].apply(test, parsed.params)
        },
        
        
        parseActionString : function (actionString) {
            var match           = /^\s*(.+?)\(\s*(.*)\s*\)\s*$/.exec(actionString)
            
            if (!match) return {
                error       : Siesta.Resource("Siesta.Test.Action.Eval", 'wrongFormatText') + actionString
            }
            
            var methodName      = match[ 1 ].replace(/^t\./, '')
            
            try {
                var params      = JSON.parse('[' + match[ 2 ] + ']')
            } catch (e) {
                return {
                    error       : Siesta.Resource("Siesta.Test.Action.Eval", 'parseErrorText') + match[ 2 ]
                }
            }
            
            return {
                methodName      : methodName,
                params          : params
            }
        }
    }
});
;
/**

@class Siesta.Test.Action.MethodCall
@extends Siesta.Test.Action

This action allows you to call any method of the test class. You can add it to the `chain` method by providing a property in the config object,
which corresponds to some method of the test class. The value of this property should contain arguments for the method call (see {@link #args}).

    t.chain(
        function (next) {
            t.someMethodCall('arg1', 'arg2', next)
        },
        // or
        {
            someMethodCall  : [ 'arg1', 'arg2' ]
        },
        ...
        {
            waitForSelector : '.selector'
        }
    )
    

*/
Class('Siesta.Test.Action.MethodCall', {
    
    isa         : Siesta.Test.Action,
    
    has : {
        /**
         * @cfg {String} methodName
         *
         * A name of the method to call.
         */
        methodName      : null,
        
        /**
         * @cfg {Array/Function/Object} args
         *
         * Arguments for the method call. Usually should be an array. 
         * 
         * If its a function, then the function will be called at the action execution time and result from the 
         * action will be treated as `args`. The only exception is the "waitForFn" method, for which the supplied function
         * will be treated as the 1st argument for the "waitForFn" method. 
         * 
         * Anything else will be converted to a single element array. 
         * 
         * The callback will be added as the last argument (after resolving this config), unless the {@link #callbackIndex} is specified.
         */
        args            : null,
        
        /**
         * @cfg {Number} callbackIndex An index in the {@link #args} array where the callback should be inserted. 
         */
        callbackIndex   : null
    },

    
    methods : {
        
        process : function () {
            var test            = this.test
            var methodName      = this.methodName
            var args            = this.args
            
            if (test.typeOf(args) == 'Function') args  = args.call(test, this)
            
            if (test.typeOf(args) != 'Array') args = [ args ]
            
            if (this.callbackIndex != null) 
                args.splice(this.callbackIndex, 0, this.next)
            else
                args.push(this.next)
            
            test[ methodName ].apply(test, args)
        }
    }
});

Siesta.Test.ActionRegistry().registerAction('methodCall', Siesta.Test.Action.MethodCall)
;
/**

@class Siesta.Harness

`Siesta.Harness` is an abstract base harness class in Siesta hierarchy. This class provides no UI, 
you should use one of it subclasses, for example {@link Siesta.Harness.Browser}

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.


Synopsys
========

    var Harness,
        isNode        = typeof process != 'undefined' && process.pid
    
    if (isNode) {
        Harness = require('siesta');
    } else {
        Harness = Siesta.Harness.Browser;
    }
        
    
    Harness.configure({
        title     : 'Awesome Test Suite',
        
        transparentEx       : true,
        
        autoCheckGlobals    : true,
        expectedGlobals     : [
            'Ext',
            'Sch'
        ],
        
        preload : [
            "http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js",
            "../awesome-project-all.js",
            {
                text    : "console.log('preload completed')"
            }
        ]
    })
    
    
    Harness.start(
        // simple string - url relative to harness file
        'sanity.t.js',
        
        // test file descriptor with own configuration options
        {
            url     : 'basic.t.js',
            
            // replace `preload` option of harness
            preload : [
                "http://cdn.sencha.io/ext-4.0.6/ext-all-debug.js",
                "../awesome-project-all.js"
            ]
        },
        
        // groups ("folders") of test files (possibly with own options)
        {
            group       : 'Sanity',
            
            autoCheckGlobals    : false,
            
            items       : [
                'data/crud.t.js',
                ...
            ]
        },
        ...
    )


*/


Class('Siesta.Harness', {
    
    does        : [
        JooseX.Observable,
        Siesta.Util.Role.CanGetType
    ],
    
    has : {
        /**
         * @cfg {String} title The title of the test suite. Can contain HTML. When provided in the test file descriptor - will change the name of test in the harness UI.
         */
        title               : null,
        
        /**
         * @cfg {Class} testClass The test class which will be used for creating test instances, defaults to {@link Siesta.Test}.
         * You can subclass {@link Siesta.Test} and provide a new class. 
         * 
         * This option can be also specified in the test file descriptor. 
         */
        testClass           : Siesta.Test,
        contentManagerClass : Siesta.Content.Manager,
        
        // fields of test descriptor:
        // - id - either `url` or wbs + group - computed
        // - url
        // - isMissing - true if test file is missing
        // - testCode - a test code source (can be provided by user)
        // - testConfig - config object provided to the StartTest
        // - index - (in the group) computed
        // - scopeProvider
        // - scopeProviderConfig
        // - preload
        // - alsoPreload
        // - parent - parent descriptor (or harness for top-most ones) - computed
        // - preset - computed by harness - instance of Siesta.Content.Preset
        // - forceDOMVisible - true to show the <iframe> on top of all others when running this test
        //                     (required for IE when using "document.getElementFromPoint()") 
        // OR - object 
        // - group - group name
        // - items - array of test descriptors
        // - expanded - initial state of the group (true by default)
        descriptors         : Joose.I.Array,
        descriptorsById     : Joose.I.Object,
        
        launchCounter       : 0,
        
        launches            : Joose.I.Object,
        
        scopesByURL         : Joose.I.Object,
        testsByURL          : Joose.I.Object,
        
        /**
         * @cfg {Boolean} transparentEx When set to `true` harness will not try to catch any exception, thrown from the test code.
         * This is very useful for debugging - you can for example use the "break on error" option in Firebug.
         * But, using this option may naturally lead to unhandled exceptions, which may leave the harness in incosistent state - 
         * refresh the browser page in such case.
         *  
         * Defaults to `false` - harness will do its best to detect any exception thrown from the test code.
         * 
         * This option can be also specified in the test file descriptor. 
         */
        transparentEx       : false,
        
        scopeProviderConfig     : null,
        scopeProvider           : null,
        
        /**
         * @cfg {String} runCore Either `parallel` or `sequential`. Indicates how the individual tests should be run - several at once or one-by-one.
         * Default value is "parallel". You do not need to change this option usually.
         */
        runCore                 : 'parallel',
        
        /**
         * @cfg {Number} maxThreads The maximum number of tests running at the same time. Only applicable for `parallel` run-core.
         */
        maxThreads              : 4,
        
        /**
         * @cfg {Boolean} autoCheckGlobals When set to `true`, harness will automatically issue an {@link Siesta.Test#verifyGlobals} assertion at the end of each test,
         * so you won't have to manually specify it each time. The assertion will be triggered only if test completed successfully. Default value is `false`.
         * See also {@link #expectedGlobals} configuration option and {@link Siesta.Test#expectGlobals} method.
         * 
         * This option will be always disabled in Opera, since every DOM element with `id` is being added as a global symbol in it.
         * 
         * This option can be also specified in the test file descriptor.
         */
        autoCheckGlobals        : false,
        
        disableGlobalsCheck     : false,
        
        /**
         * @cfg {Array} expectedGlobals An array of properties names which are likely to present in the scope of each test. There is no need to provide the name
         * of built-in globals - harness will automatically scan them from the empty context. Only provide the names of global properties which will be created
         * by your preload code.
         * 
         * For example
         * 
    Harness.configure({
        title               : 'Ext Scheduler Test Suite',
        
        autoCheckGlobals    : true,
        expectedGlobals     : [
            'Ext',
            'MyProject',
            'SomeExternalLibrary'
        ],
        ...
    })
            
         * This option can be also specified in the test file descriptor.
         */
        expectedGlobals         : Joose.I.Array,
        // will be populated by `populateCleanScopeGlobals` 
        cleanScopeGlobals       : Joose.I.Array,
        
        /**
         * @cfg {Array} preload The array which contains the *preload descriptors* describing which files/code should be preloaded into the scope of each test.
         * 
         * Preload descriptor can be:
         * 
         * - a string, containing an url to load (cross-domain urls are ok, if url ends with ".css" it will be loaded as CSS)
         * - an object `{ type : 'css/js', url : '...' }` allowing to specify the CSS files with different extension
         * - an object `{ type : 'css/js', content : '...' }` allowing to specify the inline content for script / style. The content should only be the tag content - not the tag itself, it'll be created by Siesta.
         * - an object `{ text : '...' }` which is a shortcut for `{ type : 'js', content : '...' }`
         * 
         * For example:
         * 
    Harness.configure({
        title           : 'Ext Scheduler Test Suite',
        
        preload         : [
            'http://cdn.sencha.io/ext-4.0.2a/resources/css/ext-all.css',
            'http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js',
            {
                text    : 'MySpecialGlobalFunc = function () { if (typeof console != "undefined") ... }'
            }
        ],
        ...
    })
            
         * This option can be also specified in the test file descriptor. **Note**, that if test descriptor has non-empty {@link Siesta.Harness.Browser#hostPageUrl hostPageUrl}
         * option, then *it will not inherit* the `preload` option from parent descriptors or harness, **unless** it has the `preload` config set to string `inherit`. 
         * If both `hostPageUrl` and `preload` are set on the harness level, `preload` value still will be inherited. For example:
         *
    Harness.configure({
        hostPageUrl     : 'general-page.html',
        preload         : [ 'my-file.js' ],
        ...
    })
    
    Harness.start(
        // this test will inherit both `hostPageUrl` and `preload`
        'test1.js',
        {
            // no preloads inherited
            hostPageUrl     : 'host-page.html',
            url             : 'test2.js'
        }, 
        {
            // inherit `preload` value from the upper level - [ 'my-file.js' ]
            hostPageUrl     : 'host-page.html',
            preload         : 'inherit',
            url             : 'test3.js'
        }, 
        {
            group           : 'Some group',
            hostPageUrl     : 'host-page2.html',
            preload         : 'inherit',
            
            items           : [
                // inherit `hostPageUrl` value from the group
                // inherit `preload` value from the upper level - [ 'my-file.js' ]
                url             : 'test3.js'
            ]
        }
    )
    
         * When using the code coverage feature, one need to explicitly mark the JavaScript files that needs to be instrumented with the "instrument : true".
         * See {@link Siesta.Harness.Browser#enableCodeCoverage} for details.
         * 

    Harness.configure({
        preload         : [
            {
                type        : 'js',
                url         : 'some_file.js',
                instrument  : true
            }
        ],
        ...
    })


         *     
         *     
         */
        preload                 : Joose.I.Array,
        
        /**
         * @cfg {Array} alsoPreload The array with preload descriptors describing which files/code should be preloaded **additionally**.
         * 
         * This option can be also specified in the test file descriptor.
         */
        
        /**
         * @cfg {Object} listeners The object which keys corresponds to event names and values - to event handlers. If provided, the special key "scope" will be treated as the 
         * scope for all event handlers, otherwise the harness itself will be used as scope.
         * 
         * Note, that the events from individual {@link Siesta.Test test cases} instances will bubble up to the harness - you can listen to all of them in one place: 
         * 

    Harness.configure({
        title     : 'Awesome Test Suite',
        
        preload : [
            'http://cdn.sencha.io/ext-4.1.0-gpl/resources/css/ext-all.css',
            'http://cdn.sencha.io/ext-4.1.0-gpl/ext-all-debug.js',
            
            'preload.js'
        ],
        
        listeners : {
            testsuitestart      : function (event, harness) {
                log('Test suite is starting: ' + harness.title)
            },
            testsuiteend        : function (event, harness) {
                log('Test suite is finishing: ' + harness.title)
            },
            teststart           : function (event, test) {
                log('Test case is starting: ' + test.url)
            },
            testupdate          : function (event, test, result) {
                log('Test case [' + test.url + '] has been updated: ' + result.description + (result.annotation ? ', ' + result.annotation : ''))
            },
            testfailedwithexception : function (event, test) {
                log('Test case [' + test.url + '] has failed with exception: ' + test.failedException)
            },
            testfinalize        : function (event, test) {
                log('Test case [' + test.url + '] has completed')
            }
        }
    })

         */
        
        
        /**
         * @cfg {Boolean} cachePreload When set to `true`, harness will cache the content of the preload files and provide it for each test, instead of loading it 
         * from network each time. This option may give a slight speedup in tests execution (especially when running the suite from the remote server), but see the 
         * caveats below. Default value is `false`.
         * 
         * Caveats: this option doesn't work very well for CSS (due to broken relative urls for images). Also its not "debugging-friendly" - as you will not be able 
         * to setup breakpoints for cached code. 
         */
        cachePreload            : false,
        
        mainPreset              : null,
        emptyPreset             : null,
        
        verbosity               : 0,
        
        /**
         * @cfg {Number} keepNLastResults
         * 
         * Indicates the number of the test results which still should be kept, for user examination.
         * Results are cleared when their total number exceed this value, based on FIFO order.
         */
        keepNLastResults        : 2,
        
        lastResultsURLs         : Joose.I.Array,
        lastResultsByURL        : Joose.I.Object,
        
        /**
         * @cfg {Boolean} overrideSetTimeout When set to `true`, the tests will override the native "setTimeout" from the context of each test
         * for asynchronous code tracking. If setting it to `false`, you will need to use `beginAsync/endAsync` calls to indicate that test is still running.
         * 
         * Note, that this option may not work reliably, when used for several sub tests launched simultaneously (for example 
         * for several sibling {@link Siesta.Test#todo} sections.  
         * 
         * This option can be also specified in the test file descriptor. Defaults to `false`.
         */
        overrideSetTimeout      : false,
        
        /**
         * @cfg {Boolean} needDone When set to `true`, the tests will must indicate that that they have reached the correct exit point with `t.done()` call, 
         * after which, adding any assertions is not allowed. Using this option will ensure that test did not exit prematurely with some exception silently caught.
         * 
         * This option can be also specified in the test file descriptor.
         */
        needDone                : false,
        
        needToStop              : false,
        
        // the default timeout for tests will be increased when launching more than this number of files
        increaseTimeoutThreshold    : 8,
        
        // the start and end dates for the most recent `launch` method
        startDate               : null,
        endDate                 : null,
        
        /**
         * @cfg {Number} waitForTimeout Default timeout for `waitFor` (in milliseconds). Default value is 10000.
         * 
         * This option can be also specified in the test file descriptor.
         */
        waitForTimeout          : 10000,
        
        /**
         * @cfg {Number} defaultTimeout Default timeout for `beginAsync` operation (in milliseconds). Default value is 15000.
         * 
         * This option can be also specified in the test file descriptor.
         */
        defaultTimeout          : 15000,
        
        /**
         * @cfg {Number} subTestTimeout Default timeout for sub tests. Default value is twice bigger than {@link #defaultTimeout}.
         * 
         * This option can be also specified in the test file descriptor.
         */
        subTestTimeout          : null,
        
        /**
         * @cfg {Number} isReadyTimeout Default timeout for test start (in milliseconds). Default value is 15000. See {@link Siesta.Test#isReady} for details.
         * 
         * This option can be also specified in the test file descriptor.
         */
        isReadyTimeout          : 10000,
        
        /**
         * @cfg {Number} pauseBetweenTests Default timeout between tests (in milliseconds). Increase this settings for big test suites, to give browser time for memory cleanup.
         */
        pauseBetweenTests       : 300,
        
        
        /**
         * @cfg {Boolean} failOnExclusiveSpecsWhenAutomated When this option is enabled and Siesta is running in automation mode
         * (using WebDriver or PhantomJS launcher) any exclusive BDD specs found (like {@link Siesta.Test#iit t.iit} or {@link Siesta.Test#ddescribe t.ddescribe}
         * will cause a failing assertion. The idea behind this setting is that such "exclusive" specs should only be used during debugging
         * and are often mistakenly committed in the codebase, leaving other specs not executed. 
         * 
         * This option can be also specified in the test file descriptor.
         */
        failOnExclusiveSpecsWhenAutomated   : false,
        
        
        setupDone               : false,
        
        sourceLineForAllAssertions      : false,
        
        currentLaunchId         : null
    },
    
    
    methods : {
        
        initialize : function () {
            var me      = this
            
            me.on('testupdate', function (event, test, result, parentResult) {
                me.onTestUpdate(test, result, parentResult);
            })
            
            me.on('testfailedwithexception', function (event, test, exception, stack) {
                me.onTestFail(test, exception, stack);
            })
            
            me.on('teststart', function (event, test) {
                me.onTestStart(test);
            })
            
            me.on('testfinalize', function (event, test) {
                me.onTestEnd(test);
            })
        },
        
        onTestUpdate : function (test, result, parentResult) {
        },
        
        
        onTestFail : function (test, exception, stack) {
        },
        
        
        onTestStart : function (test) {
        },
        
        
        onTestEnd : function (test) {
        },
        
        
        onTestSuiteStart : function (descriptors, contentManager) {
            this.startDate  = new Date()
            
            /**
             * This event is fired when the test suite starts. Note, that when running the test suite in the browsers, this event can be fired several times
             * (for each group of tests you've launched).  
             * 
             * You can subscribe to it, using regular ExtJS syntax:
             * 
             *      Harness.on('testsuitestart', function (event, harness) {}, scope, { single : true })
             * 
             * See also the "/examples/events"
             * 
             * @event testsuitestart
             * @member Siesta.Harness
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Harness} harness The harness that just has started
             */
            this.fireEvent('testsuitestart', this)
        },
        
        
        onTestSuiteEnd : function (descriptors, contentManager) {
            this.endDate    = new Date()
            
            /**
             * This event is fired when the test suite ends. Note, that when running the test suite in the browsers, this event can be fired several times
             * (for each group of tests you've launched).  
             * 
             * @event testsuiteend
             * @member Siesta.Harness
             * @param {JooseX.Observable.Event} event The event instance
             * @param {Siesta.Harness} harness The harness that just has ended
             */
            this.fireEvent('testsuiteend', this)
        },
        
        
        onBeforeScopePreload : function (scopeProvider, url) {
            this.fireEvent('beforescopepreload', scopeProvider, url)
        },
        
        
        onAfterScopePreload : function (scopeProvider, url) {
            this.fireEvent('afterscopepreload', scopeProvider, url)
        },
        
        
        onCachingError : function (descriptors, contentManager) {
        },
        
        
        /**
         * This method configures the harness instance. It just copies the passed configuration option into harness instance.
         *
         * @param {Object} config - configuration options (values of attributes for this class)
         */
        configure : function (config) {
            Joose.O.copy(config, this)
            
            var me      = this
            
            if (config.listeners) Joose.O.each(config.listeners, function (value, name) {
                if (name == 'scope') return
                
                me.on(name, value, config.scope || me)
            })
        },
        
        
        // backward compat
        processPreloadArray : function (preload) {
            var me = this
            
            Joose.A.each(preload, function (url, index) {
                
                // do not process { text : "" } preload descriptors
                if (Object(url) === url) return 
                
                preload[ index ] = me.normalizeURL(url)
            })
            
            return preload
        },
        
        
        populateCleanScopeGlobals : function (scopeProvider, callback) {
            var scopeProviderClass  = eval(scopeProvider)
            var cleanScope          = new scopeProviderClass()
            
            var cleanScopeGlobals   = this.cleanScopeGlobals        
            
            // we can also use "create" and not "setup" here
            // create will only create the iframe (in browsers) and will not try to update its content
            // the latter crashes IE8
            cleanScope.setup(function () {
                
                for (var name in cleanScope.scope) cleanScopeGlobals.push(name)
                
                callback()
                
                // this setTimeout seems to stop the spinning loading indicator in FF
                // accorting to https://github.com/3rd-Eden/Socket.IO/commit/bad600fb1fb70238f42767c56f01256470fa3c15
                // it only works *after* onload (this callback will be called *in* onload)
                
                setTimeout(function () {
                    // will remove the iframe (in case of browser harness) from DOM and stop loading indicator
                    cleanScope.cleanup()    
                }, 0)
            })
        },
        
        
        startSingle : function (desc, callback) {
            var me              = this
            
            this.__counter__    = this.__counter__ || 0 
            
            var startSingle     = function () {
                me.launch([ me.normalizeDescriptor(desc, me, me.__counter__++) ], callback)
            }
            
            me.setupDone ? startSingle() : this.setup(startSingle)
        },
        
        
        setup : function (callback) {
            var me              = this
            
            this.mainPreset     = new Siesta.Content.Preset({
                preload     : this.processPreloadArray(this.preload)
            })
            
            this.emptyPreset    = new Siesta.Content.Preset()
            
            this.populateCleanScopeGlobals(this.scopeProvider, function () {
                me.setupDone        = true
                
                callback()
            })
        },
        
        /**
         * This method will launch a test suite. It accepts a variable number of *test file descriptors* or an array of such. A test file descritor is one of the following:
         * 
         * - a string, containing a test file url
         * - an object containing the `url` property `{ url : '...', option1 : 'value1', option2 : 'value2' }`. The `url` property should point to the test file.
         * Other properties can contain values of some configuration options of the harness (marked accordingly). In this case, they will **override** the corresponding values,
         * provided to harness or parent descriptor. 
         * - an object `{ group : 'groupName', items : [], expanded : true, option1 : 'value1' }` specifying the folder of test files. The `expanded` property
         * sets the initial state of the folder - "collapsed/expanded". The `items` property can contain an array of test file descriptors.
         * Other properties will override the applicable harness options **for all child descriptors**.
         * 
         * If test descriptor is `null` or other "falsy" value it is ignored.
         * 
         * Groups (folder) may contain nested groups. Number of nesting levels is not limited.
         * 
         * For example, one may easily have a special group of test files, having its own `preload` configuration (for example for testing on-demand loading). In the same
         * time some test in that group may have its own preload, overriding others.

    Harness.configure({
        title           : 'Ext Scheduler Test Suite',
        preload         : [
            'http://cdn.sencha.io/ext-4.0.2a/resources/css/ext-all.css',
            'http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js',
            '../awesome-app-all-debug.js'
        ],
        ...
    })
    
    Harness.start(
        // regular file
        'data/crud.t.js',
        // a group with own "preload" config for its items
        {
            group       : 'On-demand loading',
            
            preload     : [
                'http://cdn.sencha.io/ext-4.0.2a/resources/css/ext-all.css',
                'http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js',
            ],
            items       : [
                'ondemand/sanity.t.js',
                'ondemand/special-test.t.js',
                // a test descriptor with its own "preload" config (have the most priority)
                {
                    url         : 'ondemand/4-0-6-compat.t.js',
                    preload     : [
                        'http://cdn.sencha.io/ext-4.0.6/resources/css/ext-all.css',
                        'http://cdn.sencha.io/ext-4.0.6/ext-all-debug.js',
                    ]
                },
                // sub-group
                {
                    group       : 'Sub-group',
                    items       : [
                        ...
                    ]
                }
            ]
        },
        ...
    )

         * Additionally, you can provide a test descriptor in the test file itself, adding it as the 1st or 2nd argument for `StartTest` call:  
         * 
    StartTest({
        autoCheckGlobals    : false,
        alsoPreload         : [ 'some_additional_preload.js' ]
    }, function (t) {
        ...
    }) 
         * 
         * Values from this object takes the highest priority and will override any other configuration.
         * 
         * Test descriptor may contain special property - `config` which will be applied to the test instance created. Be careful not to overwrite
         * standard properties and methods!
         * 

    Harness.start(
        {
            url         : 'ondemand/4-0-6-compat.t.js',
            config      : {
                myProperty1     : 'value1',
                myProperty2     : 'value2'
            }
        },
        ...
    )
    
    StartTest(function (t) {
        if (t.myProperty1 == 'value1') {
            // do this
        }
        ...
    }) 

         * 
         * @param {Array/Mixed} descriptor1 or an array of descriptors
         * @param {Mixed} descriptor2
         * @param {Mixed} descriptorN
         */
        start : function () {
            // a bit hackish - used by Selenium reporter..
            var me      = Siesta.my.activeHarness = this
            var args    = Array.prototype.concat.apply([], arguments)
            
            this.setup(function () {
                me.normalizeDescriptors(args)
                
                me.launch(me.descriptors)
            })
        },
        
        
        // good to have this as a seprate method for testing
        normalizeDescriptors : function (descArray) {
            var me              = this
            
            var descriptors     = []
            
            Joose.A.each(descArray, function (desc, index) {
                if (desc) descriptors.push(me.normalizeDescriptor(desc, me, index))
            })
            
            me.descriptors      = descriptors
        },

        
        launch : function (descriptors, callback, errback) {
            var launchId                = this.currentLaunchId  = this.launchCounter++
            var me                      = this
            
            //console.time('launch')
            //console.time('launch-till-preload')
            //console.time('launch-after-preload')
            
            this.needToStop             = false
            
            // no folders, only leafs
            var flattenDescriptors      = this.flattenDescriptors(descriptors)
            // the preset for the test scripts files 
            var testScriptsPreset       = new Siesta.Content.Preset()
            var presets                 = [ testScriptsPreset, this.mainPreset ]
            
            Joose.A.each(flattenDescriptors, function (desc) { 
                if (desc.preset != me.mainPreset && desc.preset != me.emptyPreset) presets.push(desc.preset)
                
                if (!desc.testCode) testScriptsPreset.addResource(desc.url)
                
                me.deleteTestByURL(desc.url)
            })
            
            // cache either everything (this.cachePreload) or only the test files (to be able to show missing files / show content) 
            var contentManager  = new this.contentManagerClass({
                harness         : this,
                presets         : [ testScriptsPreset ].concat(this.cachePreload ? presets : [])
            })
            
            var options         = this.launches[ launchId ] = {
                increaseTimeout     : this.runCore == 'parallel' && flattenDescriptors.length > this.increaseTimeoutThreshold,
                launchId            : launchId,
                descriptors         : flattenDescriptors.slice(),
                descriptorsLeft     : null,
                contentManager      : contentManager
            }
            
            //console.time('caching')
            
            me.onTestSuiteStart(descriptors, contentManager)
            
            contentManager.cache(function () {
                
                //console.timeEnd('caching')
                
                Joose.A.each(flattenDescriptors, function (desc) {
                    var url             = desc.url
                    
                    if (contentManager.hasContentOf(url)) {
                        var testConfig  = desc.testConfig = Siesta.getConfigForTestScript(contentManager.getContentOf(url))
                        
                        // if testConfig contains the "preload" or "alsoPreload" key - then we need to update the preset of the descriptor
                        if (testConfig && (testConfig.preload || testConfig.alsoPreload)) desc.preset = me.getDescriptorPreset(desc)
                    } else
                        // if test code is provided, then test is considered not missing 
                        // allow subclasses to define there own logic when found missing test file
                        if (!desc.testCode) me.markMissingFile(desc)
                        
                    me.normalizeScopeProvider(desc)
                })
                
                me.fireEvent('testsuitelaunch', descriptors, contentManager)
                
                me.runCoreGeneral(flattenDescriptors, contentManager, options, options.callback = function () {
                    me.onTestSuiteEnd(descriptors, contentManager)
                    
                    callback && callback(descriptors)
                    
                    delete me.launches[ launchId ]
                })
                
            }, function () {}, true)
        },
        
        
        markMissingFile : function (desc) {
            desc.isMissing = true
        },
        
        
        flattenDescriptors : function (descriptors, includeFolders) {
            var flatten     = []
            var me          = this
            
            Joose.A.each(descriptors, function (descriptor) {
                
                if (descriptor.group) {
                    
                    if (includeFolders) flatten.push(descriptor)
                    
                    flatten.push.apply(flatten, me.flattenDescriptors(descriptor.items, includeFolders))
                    
                } else
                    flatten.push(descriptor)
            })
            
            return flatten
        },
        
        
        lookUpValueInDescriptorTree : function (descriptor, configName, doNotLookAtRoot) {
            var testConfig  = descriptor.testConfig
            
            if (testConfig && testConfig.hasOwnProperty(configName))    return testConfig[ configName ]
            if (descriptor.hasOwnProperty(configName))                  return descriptor[ configName ]
            
            var parent  = descriptor.parent
            
            if (parent) {
                if (parent == this)
                    if (doNotLookAtRoot) 
                        return undefined
                    else
                        return this[ configName ]
                
                return this.lookUpValueInDescriptorTree(parent, configName, doNotLookAtRoot)
            }
            
            return undefined
        },
        

        getDescriptorConfig : function (descriptor, configName, doNotLookAtRoot) {
            return this.lookUpValueInDescriptorTree(descriptor, configName, doNotLookAtRoot)
        },
        
        
        getDescriptorPreset : function (desc) {
            var preload                 = this.getDescriptorConfig(desc, 'preload', true)
            var alsoPreload             = this.getDescriptorConfig(desc, 'alsoPreload', true)
            
            if (preload || alsoPreload) {
                var totalPreload        = (preload || this.preload).concat(alsoPreload || [])
                
                // filter out empty array as preloads - return `emptyPreset` for them
                return totalPreload.length ? new Siesta.Content.Preset({ preload : this.processPreloadArray(totalPreload) }) : this.emptyPreset
            }
                
            return this.mainPreset
        },
        
        
        normalizeScopeProvider : function (desc) {
            var scopeProvider = this.getDescriptorConfig(desc, 'scopeProvider')
            
            if (scopeProvider) {
                var match 
                
                if (match = /^=(.+)/.exec(scopeProvider))
                    scopeProvider = match[ 1 ]
                else 
                    scopeProvider = scopeProvider.replace(/^(Scope\.Provider\.)?/, 'Scope.Provider.')
            }
            
            desc.scopeProvider          = scopeProvider
            desc.scopeProviderConfig    = this.getDescriptorConfig(desc, 'scopeProviderConfig') 
        },
        
        
        normalizeDescriptor : function (desc, parent, index, level) {
            if (typeof desc == 'string') desc = { url : desc }
            
            level       = level || 0
            
            var me      = this
            
            desc.parent = parent
            
            // folder
            if (desc.group) {
                desc.id     = parent == this ? 'testFolder-' + level + '-' + index : parent.id + '/' + level + '-' + index
                
                var items   = []
                
                Joose.A.each(desc.items || [], function (subDesc, index) {
                    if (subDesc) items.push(me.normalizeDescriptor(subDesc, desc, index, level + 1))
                })
                
                desc.items  = items
                
            } else {
                // leaf case
                desc.id                     = desc.url
                desc.preset                 = this.getDescriptorPreset(desc)
                
                // the only thing left to normalize in the descriptor is now "scopeProvider"
                // we postpone this normalization to the moment after loading of the test files, 
                // since they can also contain "scopeProvider"-related configs
                // see "normalizeScopeProvider"
            }
            
            this.descriptorsById[ desc.id ] = desc
            
            return desc
        },
        
        
        runCoreGeneral : function (descriptors, contentManager, launchOptions, callback) {
            var runCoreMethod   = 'runCore' + Joose.S.uppercaseFirst(this.runCore)
            
            if (typeof this[ runCoreMethod ] != 'function') throw new Error("Invalid `runCore` specified: [" + this.runCore + "]")
            
            this[ runCoreMethod ](descriptors, contentManager, launchOptions, callback)
        },
        
        
        runCoreParallel : function (descriptors, contentManager, launchOptions, callback) {
            var me              = this
            var processedNum    = 0
            var count           = descriptors.length
            
            if (!count) callback()
            
            var exitLoop                = false
            var hasExited               = false
            var hasLaunchedAllThreads   = false
            
            var doProcessURL  = function (desc) {
                me.processURL(desc, desc.index, contentManager, launchOptions, function () {
                    processedNum++
                    
                    // set the internal closure `exitLoop` to stop launching new branches
                    // on the 1st encountering of `me.needToStop` flag
                    if (me.needToStop || exitLoop) {
                        exitLoop = true
                        
                        if (!hasExited) {
                            hasExited = true
                            callback()
                        }
                        
                        return
                    }
                    
                    if (processedNum == count) 
                        callback()
                    else
                        launchThread(descriptors)
                })
            }
            
            var launchThread  = function (descriptors) {
                var desc = descriptors.shift()
                
                if (!desc) return
                
                if (hasLaunchedAllThreads)
                    setTimeout(function () {
                        doProcessURL(desc)
                    }, me.pauseBetweenTests)
                else
                    doProcessURL(desc)
            }
            
            for (var i = 1; i <= this.maxThreads; i++) launchThread(descriptors)
            
            hasLaunchedAllThreads = true
        },
        
        
        runCoreSequential : function (descriptors, contentManager, launchOptions, callback) {
            if (!launchOptions.descriptorsLeft) launchOptions.descriptorsLeft = descriptors
            
            if (descriptors.length && !this.needToStop) {
                var desc        = descriptors.shift()
                var me          = this
                var prevLength  = descriptors.length
                
                this.processURL(desc, desc.index, contentManager, launchOptions, function () {

                    // if the length of the `descriptors` array has changed - that means that test suite has been restarted
                    // (because of 3 mins inactivity) - should not try to continue in this case
                    if (descriptors.length && descriptors.length == prevLength)
                        setTimeout(function () {
                            me.runCoreSequential(descriptors, contentManager, launchOptions, callback)
                        }, me.pauseBetweenTests)
                    else
                        callback()
                })
                
            } else
                callback()
        },
        
        
        getSeedingCode : function (desc, launchId) {
            var code    = function (descId, launchId) {
                StartTest = startTest = describe = function () { arguments.callee.args = arguments };
                
                StartTest.launchId          = launchId
                StartTest.id                = descId
                
                // for older IE - the try/catch should be from the same context as the exception
                StartTest.exceptionCatcher  = function (func) { var ex; try { func() } catch (e) { ex = e; }; return ex; };
                
                // for Error instances we try to pick up the values from "message" or "description" property
                // so need to have a correct constructor from the context of test
                StartTest.testErrorClass    = Error;
            }
            
            return ';(' + code.toString() + ')(' + JSON.stringify(desc.id) + ', ' + launchId + ')'
        },
        
        
        getScopeProviderConfigFor : function (desc, launchId) {
            var config          = Joose.O.copy(desc.scopeProviderConfig || {})
            
            config.seedingCode  = this.getSeedingCode(desc, launchId)
            
            return config
        },
        
        
        keepTestResult : function (url) {
            // already keeping 
            if (this.lastResultsByURL[ url ]) {
                var indexOf     = -1
                
                Joose.A.each(this.lastResultsURLs, function (resultUrl, i) { 
                    if (resultUrl == url) { indexOf = i; return false }
                })
                
                this.lastResultsURLs.splice(indexOf, 1)
                this.lastResultsURLs.push(url)
                
                return
            }
            
            this.lastResultsURLs.push(url)
            this.lastResultsByURL[ url ] = true
            
            if (this.lastResultsURLs.length > this.keepNLastResults) this.releaseTestResult()
        },
        
        
        releaseTestResult : function () {
            if (this.lastResultsURLs.length <= this.keepNLastResults) return
            
            var url     = this.lastResultsURLs.shift()
            
            delete this.lastResultsByURL[ url ]
            
            var test    = this.getTestByURL(url)
            
            if (test && test.isFinished()) this.cleanupScopeForURL(url)
        },
        
        
        isKeepingResultForURL : function (url) {
            return this.lastResultsByURL[ url ]
        },
        
        
        setupScope : function (desc, launchId) {
            var url                 = desc.url
            var scopeProviderClass  = eval(desc.scopeProvider)
            
            this.cleanupScopeForURL(url)
            
            this.keepTestResult(url)
            
            return this.scopesByURL[ url ] = new scopeProviderClass(this.getScopeProviderConfigFor(desc, launchId))
        },
        
        
        cleanupScopeForURL : function (url) {
            var scopeProvider = this.scopesByURL[ url ]
            
            if (scopeProvider) {
                delete this.scopesByURL[ url ]
                
                scopeProvider.cleanup()
            }
        },


        // should prepare the "seedingScript" - include it to the `scopeProvider`
        prepareScopeSeeding : function (scopeProvider, desc, contentManager) {
            if (desc.testCode || this.cachePreload && contentManager.hasContentOf(desc.url))
                scopeProvider.addPreload({
                    type        : 'js', 
                    content     : desc.testCode || (contentManager.getContentOf(desc.url) + '\n//# sourceURL=' + desc.url)
                })
            else
                scopeProvider.seedingScript = this.resolveURL(desc.url, scopeProvider, desc)
        },

        
        // should normalize non-standard urls (like specifying Class.Name in preload)
        // such behavior is not documented and generally deprecated
        normalizeURL : function (url) {
            return url
        },
            
            
        resolveURL : function (url, scopeProvider, desc) {
            return url
        },
        
        
        canUseCachedContent : function (resource) {
            return this.cachePreload && resource instanceof Siesta.Content.Resource.JavaScript
        },
        
        
        addCachedResourceToPreloads : function (scopeProvider, contentManager, resource) {
            scopeProvider.addPreload({
                type        : 'js',
                content     : contentManager.getContentOf(resource)
            })
        },
        
        
        processURL : function (desc, index, contentManager, launchOptions, callback, noCleanup) {
            var me      = this
            var url     = desc.url
            
            if (desc.isMissing) {
                callback()
                
                return
            }
            
            // a magical shared object, which will contain the `test` property with test instance, once the test will be created
            var testHolder      = {}
            // an array of errors occured during preload phase
            var preloadErrors   = []    
            
            var scopeProvider   = this.setupScope(desc, launchOptions.launchId)
            var transparentEx   = this.getDescriptorConfig(desc, 'transparentEx')
            
            var onErrorHandler  = function (msg, url, lineNumber, col, error) {
                var test = testHolder.test

                if (test && test.isStarted()) {
                    test.nbrExceptions++;
                    test.failWithException(error || (msg + ' ' + url + ' ' + lineNumber))
                } else {
                    preloadErrors.push(error && error.stack ? error.stack + '' : msg + ' ' + url + ' ' + lineNumber)
                }
            }
            
            // trying to setup the `onerror` handler as early as possible - to detect each and every exception from the test
            scopeProvider.addOnErrorHandler(onErrorHandler, !transparentEx)
            
//            scopeProvider.addPreload({
//                type        : 'js', 
//                content     : 'console.time("scope-onload")'
//            })
            
            desc.preset.eachResource(function (resource) {
                var hasConent       = contentManager.hasContentOf(resource)
                
                if (hasConent && me.canUseCachedContent(resource)) {
                    me.addCachedResourceToPreloads(scopeProvider, contentManager, resource)
                } else {
                    var resourceDesc    = resource.asDescriptor()
                    
                    if (resourceDesc.url) resourceDesc.url = me.resolveURL(resourceDesc.url, scopeProvider, desc)
                    
                    scopeProvider.addPreload(resourceDesc)
                }
            })

            
            me.prepareScopeSeeding(scopeProvider, desc, contentManager)
            
            var testClass       = me.getDescriptorConfig(desc, 'testClass')
            if (me.typeOf(testClass) == 'String') testClass = Joose.S.strToClass(testClass)
            
            var testConfig      = me.getNewTestConfiguration(desc, scopeProvider, contentManager, launchOptions)
            
            // create the test instance early, so that one can perform some setup (as the test class method call)
            // even before the "hostPageUrl" starts loading
            var test            = testHolder.test = new testClass(testConfig)
            
            this.onBeforeScopePreload(scopeProvider, url, test)
            
            test.earlySetup(function () {
                cont()
            }, function (errorMessage) {
                cont(errorMessage)
            })
            
            function cont(errorMessage) {
                //console.timeEnd('launch-till-preload')
                
                //console.time('preload')
                
    //            scopeProvider.addPreload({
    //                type        : 'js', 
    //                content     : 'console.timeEnd("scope-onload")'
    //            })
                
                scopeProvider.setup(function () {
                    me.onAfterScopePreload(scopeProvider, url, test)
                    
                    // scope provider has been cleaned up while setting up? (may be user has restarted the test)
                    // then do nothing
                    if (!scopeProvider.scope) { callback(); return }
                    
                    me.launchTest({
                        testHolder          : testHolder,
                        desc                : desc,
                        scopeProvider       : scopeProvider,
                        contentManager      : contentManager,
                        launchOptions       : launchOptions,
                        preloadErrors       : errorMessage || preloadErrors,
                        onErrorHandler      : onErrorHandler,
                        
                        // need to provide the "startTestAnchor" explicitly (and not just get from "scope" inside of the "launchTest"
                        // method, because for "separateContext" method, startAnchor is calculated differently
                        startTestAnchor     : scopeProvider.scope.StartTest,
                        noCleanup           : noCleanup,
                        reusingSandbox      : false
                    }, callback)
                })
            }
        },
        
        
        launchTest : function (options, callback) {
            var scopeProvider   = options.scopeProvider
            var desc            = options.desc
//            desc, scopeProvider, contentManager, options, preloadErrors, onErrorHandler, callback
            
            //console.timeEnd('preload')
            //console.timeEnd('launch-after-preload')
            var me              = this
            var url             = desc.url
        
            // after the scope setup, the `onerror` handler might be cleared - installing it again
            scopeProvider.addOnErrorHandler(options.onErrorHandler, !this.getDescriptorConfig(desc, 'transparentEx'))
            
            var test            = options.testHolder.test
            var startTestAnchor = options.startTestAnchor
            var args            = startTestAnchor && startTestAnchor.args
            var global          = scopeProvider.scope
            var noCleanup       = options.noCleanup
            
            // additional setup of the test instance, setting up the properties, which are known only after scope
            // is loaded
            Joose.O.extend(test, {
                startTestAnchor     : startTestAnchor,
                exceptionCatcher    : startTestAnchor.exceptionCatcher,
                testErrorClass      : startTestAnchor.testErrorClass,
                
                global              : global,
                
                // the "options" part is used by the "separateContext" branch, where
                // the test script is executed in different context from the "global" context
                originalSetTimeout  : options.originalSetTimeout || global.setTimeout,
                originalClearTimeout: options.originalClearTimeout || global.clearTimeout,
                
                // pick either 1st or 2nd argument depending which one is a function 
                run                 : args && (typeof args[ 0 ] == 'function' ? args[ 0 ] : args[ 1 ]),
                
                reusingSandbox      : options.reusingSandbox,
                
                // "main" test callback, called once test is completed
                callback : function () {
                    if (!noCleanup && !me.isKeepingResultForURL(url)) me.cleanupScopeForURL(url)
                    
                    callback && callback()
                }
            })
            
            this.saveTestWithURL(url, test)
            
            var doLaunch        = function() {
                //console.timeEnd('launch')
                
                me.fireEvent('beforeteststart', test)
                
                // in the edge case, test can be already finished before its even started :)
                // this happens if user re-launch the test during these 10ms - test will be 
                // finalized forcefully in the "deleteTestByUrl" method
                if (!test.isFinished()) test.start(options.preloadErrors[ 0 ])
                
                options         = null
                test            = null
            }
            
            if (options.reusingSandbox)
                doLaunch()
            else {
                if (scopeProvider instanceof Scope.Provider.IFrame) 
                    // start the test after slight delay - to run it already *after* onload (in browsers)
                    global.setTimeout(doLaunch, 10)
                else
                    // for Window provider, `global.setTimeout` seems to not execute passed function _sometimes_
                    // also increase the "onload" delay
                    setTimeout(doLaunch, 50)
            }
        },
        
        
        getNewTestConfiguration : function (desc, scopeProvider, contentManager, launchOptions) {
            var groups          = []
            var currentDesc     = desc.parent
            
            while (currentDesc) {
                // do not push name of the top-level "hidden" group which has no parent
                currentDesc.parent && groups.unshift(String(currentDesc.group))
                
                currentDesc     = currentDesc.parent
            }
            
            var config          = {
                url                 : desc.url,
                name                : desc.name,
                
                groups              : groups,
                jUnitClass          : this.getDescriptorConfig(desc, 'jUnitClass'),
            
                harness             : this,
            
                expectedGlobals     : this.cleanScopeGlobals.concat(this.getDescriptorConfig(desc, 'expectedGlobals')),
                autoCheckGlobals    : this.getDescriptorConfig(desc, 'autoCheckGlobals'),
                disableGlobalsCheck : this.disableGlobalsCheck,
            
                scopeProvider       : scopeProvider,
                
                contentManager      : contentManager,
                
                transparentEx       : this.getDescriptorConfig(desc, 'transparentEx'),
                needDone            : this.getDescriptorConfig(desc, 'needDone'),
                
                overrideSetTimeout          : this.getDescriptorConfig(desc, 'overrideSetTimeout'),
                
                defaultTimeout              : this.getDescriptorConfig(desc, 'defaultTimeout') * (launchOptions.increaseTimeout ? 2 : 1),
                subTestTimeout              : this.getDescriptorConfig(desc, 'subTestTimeout') * (launchOptions.increaseTimeout ? 2 : 1),
                waitForTimeout              : this.getDescriptorConfig(desc, 'waitForTimeout') * (launchOptions.increaseTimeout ? 3 : 1),
                isReadyTimeout              : this.getDescriptorConfig(desc, 'isReadyTimeout'),
                
                sourceLineForAllAssertions  : this.sourceLineForAllAssertions,
                
                sandboxCleanup              : this.getDescriptorConfig(desc, 'sandboxCleanup'),
                
                config                      : this.getDescriptorConfig(desc, 'config'),
                
                failOnExclusiveSpecsWhenAutomated   : this.getDescriptorConfig(desc, 'failOnExclusiveSpecsWhenAutomated')
            }
            
            // potentially not safe
            if (desc.testConfig || desc.config) Joose.O.extend(config, desc.testConfig || desc.config)
            
            return config
        },
        
        
        getScriptDescriptor : function (id) {
            return this.descriptorsById[ id ]
        },
        
        
        getTestByURL : function (url) {
            return this.testsByURL[ url ]
        },
        
        
        saveTestWithURL : function (url, test) {
            this.testsByURL[ url ] = test
        },
        
        
        deleteTestByURL : function (url) {
            var test    = this.testsByURL[ url ]
            
            if (test) {
                // exceptions can arise if test page has switched to different context for example (click on the link)
                // and siesta is trying to clear the timeouts with "clearTimeout"
                try {
                    test.finalize(true)
                } catch (e) {
                }
                this.cleanupScopeForURL(url)
            }
            
            delete this.testsByURL[ url ]
        },
        
        
        allPassed : function () {
            var allPassed       = true
            var me              = this
            
            Joose.A.each(this.flattenDescriptors(this.descriptors), function (descriptor) {
                // if at least one test is missing then something is wrong
                if (descriptor.isMissing) { allPassed = false; return false }
                
                var test    = me.getTestByURL(descriptor.url)
                
                // ignore missing tests (could be skipped by test filtering)
                if (!test) return
                
                allPassed = allPassed && test.isPassed()
            })
            
            return allPassed
        },
        
        
        generateReport : function (options) {
            if (!arguments.length) options = __REPORT_OPTIONS__
            
            // a string? 
            if (Object(options) !== options) options = { format : options || 'JSON' }
            
            var methodName  = 'generate' + options.format + 'Report'
            
            if (!this[ methodName ]) throw "Can't generate report - missing the `" + methodName + "` method"
            
            return this[ methodName ](options)
        }
    }
    // eof methods
})
//eof Siesta.Harness
;
/**
@class Siesta.Role.CanStyleOutput
@private

A role, providing output coloring functionality

*/
Role('Siesta.Role.CanStyleOutput', {
    
    has         : {
        /**
         * @cfg {Boolean} disableColoring When set to `true` will disable the colors in the console output in automation launchers / NodeJS launcher
         */
        disableColoring : false,
        
        style               : {
            is          : 'rwc',
            lazy        : 'this.buildStyle'
        },
        
        styles              : { 
            init    : {
                'bold'      : [1, 22],
                'italic'    : [3, 23],
                'underline' : [4, 24],
                
                'black '    : [30, 39],
                'yellow'    : [33, 39],
                'cyan'      : [36, 39],
                'white'     : [37, 39],
                'green'     : [32, 39],
                'red'       : [31, 39],
                'grey'      : [90, 39],
                'blue'      : [34, 39],
                'magenta'   : [35, 39],
                
                'bgblack '  : [40, 49],
                'bgyellow'  : [43, 49],
                'bgcyan'    : [46, 49],
                'bgwhite'   : [47, 49],
                'bggreen'   : [42, 49],
                'bgred'     : [41, 49],
                'bggrey'    : [100, 49],
                'bgblue'    : [44, 49],
                'bgmagenta' : [45, 49],
                
                'inverse'   : [7, 27]
            }
        }
    },
    
    
    methods : {
        
        buildStyle : function () {
            var me          = this
            var style       = {}
            
            Joose.O.each(this.styles, function (value, name) {
                
                style[ name ] = function (text) { return me.styled(text, name) }
            })
            
            return style
        },
        
        
        styled : function (text, style) {
            if (this.disableColoring) return text
            
            var styles = this.styles
            
            return '\033[' + styles[ style ][ 0 ] + 'm' + text + '\033[' + styles[ style ][ 1 ] + 'm'
        }
    }
})
;
// consuming harness need to use `sequential` run core

Role('Siesta.Role.ConsoleReporter', {
    
    requires    : [ 'log', 'exit', 'allPassed' ],
    
    
    does        : [
        Siesta.Role.CanStyleOutput
    ],

    has : {
        // special flag which will be used by automation launchers to prevent the summary message
        // after every page
        needSummaryMessage      : true
    },


    after : {

        markMissingFile : function (desc) {
            this.warn(Siesta.Resource('Siesta.Role.ConsoleReporter', 'missingFileText').replace("{URL}", desc.url))
        },


        onTestSuiteStart : function () {
        },


        onTestSuiteEnd : function () {
            this.exit(this.getExitCode())
        },


        onTestEnd : function (test) {
            var isPassed    = test.isPassed()

            this.log('[' + (isPassed ? this.style().green(Siesta.Resource('Siesta.Role.ConsoleReporter', 'passText')) : this.style().red(Siesta.Resource('Siesta.Role.ConsoleReporter', 'failText'))) + ']  ' + test.url + (isPassed ? '' : '\n'))
        },


        onTestUpdate : function (test, result, parentResult) {
            var text            = result + ''
            var needToShow      = this.verbosity > 0

            if (result instanceof Siesta.Result.Assertion) {
                if (result.isWaitFor && !result.completed) return;

                if (result.isException && !result.isTodo) {
                    text        = this.style().bold(this.style().red(text))

                    needToShow  = true
                } else if (result.isTodo) {
                    text        = this.styled(text, result.passed ? 'magenta' : 'yellow')

                    if (result.passed && !result.isWaitFor) needToShow = true

                } else {
                    text        = this.styled(text, result.passed ? 'green' : 'red')

                    if (!result.passed) needToShow = true
                }
            }

            if (result instanceof Siesta.Result.Diagnostic) {
                text            = this.styled(text, 'bold')

                if (result.isWarning) {
                    this.logWarning(result)
                    return
                }
            }

            if (result instanceof Siesta.Result.Summary) {
                needToShow      = this.needSummaryMessage

                text            = this.styled(result.description.join(''), 'bold')
            }

            if (needToShow) this.log(text)
        }
    },


    methods : {

        warn : function (text) {
            this.log(this.styled('[' + Siesta.Resource('Siesta.Role.ConsoleReporter', 'warnText') + '] ', 'red') + text)
        },
        
        
        logWarning : function (result) {
            this.warn(result + '')
        },


        getSummaryMessage : function (allPassed) {
            allPassed = allPassed != null ? allPassed : this.allPassed()

            return allPassed ? this.style().bold(this.style().green(Siesta.Resource('Siesta.Role.ConsoleReporter', 'allTestsPassedText'))) : this.style().bold(this.style().red(Siesta.Resource('Siesta.Role.ConsoleReporter', 'failuresFoundText')))
        },
        
        
        getExitCode : function () {
            return this.allPassed() ? 0 : 1
        }
    }
    
})

;
;
Class('Siesta.Content.Manager.NodeJS', {
    
    isa     : Siesta.Content.Manager,
    
    methods : {
        
        load : function (url, callback, errback) {
            
            try {
                var content = require('fs').readFileSync(url, 'utf8')
                
            } catch (e) {
                errback(e)
                
                return
            }
            
            callback(content)
        }
    }
})

;
/**
@class Siesta.Harness.NodeJS
@extends Siesta.Harness 

Class, representing the NodeJS harness. This class reports the output from all test files to console.

This file is a reference only however, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

Synopsys
========

    var Harness,
        isNode        = typeof process != 'undefined' && process.pid
    
    if (isNode) {
        Harness = require('siesta');
    } else {
        Harness = Siesta.Harness.Browser;
    }
        
    
    Harness.configure({
        title     : 'Awesome Test Suite',
        
        transparentEx       : true,
        
        autoCheckGlobals    : true,
        expectedGlobals     : [
            'Ext',
            'Sch'
        ],
        
        preload : [
            "http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js",
            "../awesome-project-all.js",
            {
                text    : "console.log('preload completed')"
            }
        ]
    })
    
    
    Harness.start(
        // simple string - url relative to harness file
        'sanity.t.js',
        
        // test file descriptor with own configuration options
        {
            url     : 'basic.t.js',
            
            // replace `preload` option of harness
            preload : [
                "http://cdn.sencha.io/ext-4.0.6/ext-all-debug.js",
                "../awesome-project-all.js"
            ]
        },
        
        // groups ("folders") of test files (possibly with own options)
        {
            group       : 'Sanity',
            
            autoCheckGlobals    : false,
            
            items       : [
                'data/crud.t.js',
                ...
            ]
        },
        ...
    )

Running the test suite in NodeJS
================================

To run the suite in NodeJS, launch the harness javascript file:

    > node t/index.js


*/

Class('Siesta.Harness.NodeJS', {
    
    // static
    my : {
        isa         : Siesta.Harness,
        
        does        : Siesta.Role.ConsoleReporter,
        
        has : {
            contentManagerClass     : Siesta.Content.Manager.NodeJS,
            scopeProvider           : 'Scope.Provider.NodeJS',
            
            chdirToIndex            : true
        },
        
        
        before : {
            
            start : function () {
                this.runCore         = 'sequential'
                
                if (this.chdirToIndex) {
                    var indexFile = process.argv[1]
                    
                    var path = require('path')
                    
                    process.chdir(path.dirname(indexFile))
                }
            }
        },
        
        
        methods : {
            
            log     : console.log,
            exit    : process.exit,

            
            getScopeProviderConfigFor : function (desc, launchId) {
                var config = this.SUPER(desc, launchId)
                
                config.sourceURL    = desc.url
                
                return config
            },
            
            
            normalizeURL : function (url) {
                // ref to lib in current dist (no trailing `.js`) 
                if (!/\.js$/.test(url)) {
                    url = '../lib/' + url.replace(/\./g, '/') + '.js'
                }
                
                return url
            }
        }
        
    }
    //eof my
})
//eof Siesta.Harness.NodeJS


;
module.exports   = Siesta.Harness.NodeJS;
