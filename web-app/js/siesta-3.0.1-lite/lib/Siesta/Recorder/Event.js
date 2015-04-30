/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
!function () {
    
var ID      = 1

Class('Siesta.Recorder.Event', {
    
    has : {
        id                  : function () { return ID++ },

        type                : null,

        timestamp           : null,

        // Alt, ctrl, meta, shift keys
        options             : null,
        
        x                   : null,
        y                   : null,
        
        target              : null,
        
        charCode            : null,
        keyCode             : null,
        
        button              : null
    },
    
    
    methods : {
    },
    
    
    my : {
        has : {
            ID              : 1,
            HOST            : null
        },
        
        methods : {
            
            fromDomEvent : function (e) {
                var options     = {}

                ;[ 'altKey', 'ctrlKey', 'metaKey', 'shiftKey' ].forEach(function (id) {
                    if (e[ id ]) options[ id ] = true;
                });
                
                var config          = {
                    type            : e.type,
                    target          : e.target,
                    timestamp       : Date.now(),
                    
                    options         : options
                }
                
                if (e.type.match(/^key/)) {
                    config.charCode = e.charCode || e.keyCode;
                    config.keyCode  = e.keyCode;
                } else {
                    config.x        = e.pageX;
                    config.y        = e.pageY;
    
                    config.button   = e.button;
                }
                
                return new this.HOST(config)
            }
        }
    }

});

}();