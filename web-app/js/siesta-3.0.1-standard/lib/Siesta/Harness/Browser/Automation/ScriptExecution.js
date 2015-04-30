/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Class('Siesta.Harness.Browser.Automation.ScriptExecution', {
    
    has : {
        id              : { required : true },
        chunks          : Joose.I.Array,
        
        maxMessageSize  : { required : true },
        
        result          : null,
        exception       : null,
        
        resultPos           : 0,
        resultChunkIndex    : 0,
        
        isDestroyed         : false
    },
    
    
    methods : {
        
        execute: function () {
            if (this.isDestroyed) throw new Error("Result already retrieved")
            
            var geval       = window.executeScript || eval
            
            __EXECUTE_SCRIPT_RESULT__   = null
            
            try {
                geval('__EXECUTE_SCRIPT_RESULT__ = (function () {' + this.chunks.join('') + '})()')
            } catch (e) {
                // always assume exception message size is negligible
                this.exception  = e + '' + (e.stack ? '\n' + e.stack : '')
                
                return
            }
            
            this.result     = JSON.stringify(__EXECUTE_SCRIPT_RESULT__) || "null"
            
            __EXECUTE_SCRIPT_RESULT__   = undefined
        },
        
        
        addChunk : function (text, index) {
            if (this.isDestroyed) throw new Error("Result already retrieved")
            
            if (index != this.chunks.length) throw new Error("Non-sequential chunk index")
            
            this.chunks.push(text)
        },
        
        
        getPartialResult : function (scriptId, index) {
            if (this.isDestroyed) throw new Error("Result already retrieved")
            if (scriptId != this.id) throw new Error("Wrong id")
            
            if (this.exception) {
                if (index) throw new Error("Started from non-zero index")
                
                var res         = JSON.stringify({
                    exception       : this.exception,
                    chunk           : null,
                    index           : 0,
                    isLastChunk     : true
                })
                
                this.destroy()
                
                return res
            }
            
            var text            = this.result
            var length          = text.length
            
            var resultPos       = this.resultPos
            
            if (this.resultChunkIndex != index) throw new Error("Non-sequential result fetching")
            
            if (resultPos >= length) throw new Error("Over fetching of the result")
            
            var chunk
            var chunkSize       = this.maxMessageSize * 0.8
            
            while (!chunk) {
                // while stringifying, the size of the chunk can increase, we don't know how much upfront
                chunk           = JSON.stringify(text.substr(resultPos, chunkSize))
                
                if (chunk.length > this.maxMessageSize) {
                    chunk       = null
                    chunkSize   = Math.floor(chunkSize * 0.8)
                    
                    if (!chunkSize) throw new Error("Chunk size zero")
                }
            }
                
            var res             = {
                exception       : null,
                chunk           : text.substr(resultPos, chunkSize),
                index           : this.resultChunkIndex++
            }
            
            this.resultPos      += chunkSize
            
            res.isLastChunk     = this.resultPos >= length
            
            if (res.isLastChunk) this.destroy()
            
            return JSON.stringify(res)
        },
        
        
        destroy : function () {
            this.isDestroyed        = true
            
            this.chunks     = this.result = this.exception = null
        }
    }
    // eof methods
})

