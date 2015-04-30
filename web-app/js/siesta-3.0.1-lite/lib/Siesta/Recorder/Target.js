/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Recorder.Target', {
    
    has : {
        targets             : Joose.I.Array,
        activeTarget        : null
    },
    
    
    methods : {
        
        initialize : function () {
            if (!this.targets) this.targets = []
            
            var firstTarget     = this.targets[ 0 ]
            
            if (firstTarget && !this.activeTarget) this.activeTarget = firstTarget.type
        },
        
        
        clear : function () {
            this.targets = []
        },
        
        
        getTargets : function () {
            var target      = this.getTarget()
            
            return target && target.targets || null
        },
        
        
        // `getActiveTarget`
        getTarget : function () {
            return this.getTargetByType(this.activeTarget)
        },
        
        
        clearOffset : function () {
            this.setOffset(null)
        },
    
    
        setOffset : function (value) {
            var target                  = this.getTarget()
            
            if (target) 
                if (value) 
                    target.offset   = value
                else
                    delete target.offset
        },
    
    
        getOffset : function () {
            var target                  = this.getTarget()
            
            if (target) return target.offset
        },
        
        
        getTargetByType : function (type) {
            var targetByType
            
            Joose.A.each(this.targets, function (target) {
                if (target.type == type) { 
                    targetByType = target
                    return false
                }
            })
            
            return targetByType
        },
        
        
        setUserTarget : function (value, offset) {
            var userTarget          = this.getTargetByType('user')
            
            if (!userTarget) {
                var target          = { type : 'user', target : value }
                
                if (offset) target.offset   = offset
                
                this.targets.unshift(target)
            } else {
                userTarget.target   = value
                
                if (offset)
                    userTarget.offset   = offset
                else
                    delete userTarget.offset
            }
            
            this.activeTarget       = 'user'
        },
        
        
        // returns `true` if targeting the coordinates on the screen or <body> (which is the same thing)
        isTooGeneric : function () {
            var targets     = this.targets
            
            if (!targets || targets.length === 0) return true
            
            if (targets.length === 1 && targets[ 0 ].type == 'xy') return true
            
            if (targets.length === 2) {
                var xy      = this.getTargetByType('xy')
                var css     = this.getTargetByType('css')
                
                if (xy && css && css.target == 'body') return true
            }
            
            return false
        }
    }
});