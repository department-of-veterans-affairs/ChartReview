/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Content.Manager.Browser.ExtJSCore.meta.extend({
    
    methods : {
        
        filterUnit : function (unitName, mode) {
            if (mode == 'extjs_class')
                // replace the "/" back to "."
                return this.SUPER(unitName.replace(/\//g, '.'), mode)
            else
                return this.SUPERARG(arguments)
        },
        
        
        getLogicalUnits : function (content, fileName, mode) {
            if (mode == 'extjs_class') {
                var ast     = acorn.parse(content, { locations : true })
                var walk    = acorn.walk
                
                var classDefinitions    = []
                
                walk.recursive(ast, {}, {
                    CallExpression      : function (node, state, next) {
                        var callee      = node.callee
                        var object      = callee.object
                        var property    = callee.property
                        
                        if (
                            // Ext
                            callee.type == 'MemberExpression' && object.type == 'Identifier' && object.name == 'Ext' &&
                            // .define
                            property.type == 'Identifier' && property.name == 'define' &&
                            // 1st arg is a string
                            node.arguments[ 0 ].type == 'Literal'
                        ) {
                            classDefinitions.push({
                                // pretend class names are files, My.Class will be My/Class
                                name        : node.arguments[ 0 ].value.replace(/\./g, '/'),
                                loc         : node.loc,
                                start       : node.start,
                                end         : node.end
                            })
                            // do not recurse into the Ext.define() call - we are only interested in its boundaries
                        } else {
                            // if its not the call we are looking for - recurse further
                            walk.base.CallExpression(node, state, next)
                        }
                    }
                })
                
                return classDefinitions
                
            } else
                return this.SUPERARG(arguments)
        }
    }
    
})