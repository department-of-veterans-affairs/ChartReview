/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Siesta.Content.Manager.meta.extend({
    
    has : {
        instrumentedUrls        : Joose.I.Object,
        logicalUnits            : Joose.I.Object,
        logicalUnitsByFile      : Joose.I.Object,
        
        includeCoverageUnits    : null,
        excludeCoverageUnits    : null,
        
        collector               : {
            lazy    : function () {
                return new IstanbulCollector()
            }
        }
    },
    
    
    methods : {
        
        addRawCoverageResultsFrom : function (testGlobal, test) {
            if (testGlobal.__coverage__) {
                this.getCollector().add(testGlobal.__coverage__)
                
                // success
                return true
            }
        },
        
        
        addRawCoverageResult : function (coverageInfo) {
            this.getCollector().add(coverageInfo)
        },
        
        
        disposeCoverageCollector : function () {
            this.getCollector().dispose()
        },
        
        
        hasInstrumentedContentOf : function (url) {
            if (url instanceof Siesta.Content.Resource) url = url.url
            
            return typeof this.instrumentedUrls[ url ] == 'string'
        },


        getInstrumentedContentOf : function (url, instrumenter, mode) {
            if (url instanceof Siesta.Content.Resource) url = url.url
            
            var rawContent          = this.getContentOf(url)
            
            if (rawContent == null) return null
            
            var instrumentedUrls    = this.instrumentedUrls
            
            if (instrumentedUrls.hasOwnProperty(url)) return instrumentedUrls[ url ]
            
            try {
                return instrumentedUrls[ url ] = this.instrument(instrumenter, rawContent, url, mode)
            } catch (e) {
                window.console && console.warn('Instrumentation of the file failed: ' + url + ', error: ' + e)
                
                // still save "null" in cache to not try to re-instrument this file again
                return instrumentedUrls[ url ] = null
            }
        },
        
        
        filterUnit : function (unitName, mode) {
            // need to include
            return (!this.includeCoverageUnits || this.includeCoverageUnits.test(unitName))
            // and not need to exclude
                && !(this.excludeCoverageUnits && this.excludeCoverageUnits.test(unitName))
        },
        
        
        instrument : function (instrumenter, content, fileName, mode) {
            var me                      = this
            var logicalUnits            = this.getLogicalUnits(content, fileName, mode)
            
            var filteredUnits           = []
            
            Joose.A.each(logicalUnits, function (unit) {
                if (me.filterUnit(unit.name, mode)) filteredUnits.push(unit)
            })
            
            if (!filteredUnits.length) return content
            
            var instrumentedContent     = []
            
            for (var i = 0; i < filteredUnits.length; i++) {
                var unit                = filteredUnits[ i ]
                // avoid "substring" call if content is already provided
                // since files will be big that may save some resources
                var unitContent         = unit.content = unit.content || content.substring(unit.start, unit.end + 1)
                
                var prevStart           = i > 0 ? filteredUnits[ i - 1 ].end + 1 : 0
                
                instrumentedContent.push(content.substring(prevStart, unit.start))
                
                instrumentedContent.push(instrumenter.instrumentSync(unitContent, unit.name))
            }
            
            instrumentedContent.push(content.substring(filteredUnits[ filteredUnits.length - 1 ].end + 1))
            
            Joose.A.each(filteredUnits, function (unit) {
                var name                = unit.name

                // when concatenating files into one, "\r\n" line endings could be silently transformed to just "\n"
                if (me.logicalUnits[ name ] && me.logicalUnits[ name ].replace(/\r\n/g, '\n') != unit.content.replace(/\r\n/g, '\n')) {
                    throw "Re-declaration of coverage unit: " + name
                }
                
                me.logicalUnits[ name ]             = unit.content
                me.logicalUnitsByFile[ fileName ]   = me.logicalUnitsByFile[ fileName ] || {}
                
                me.logicalUnitsByFile[ fileName ][ name ] = unit
                
                delete unit.content
            })
            
            return instrumentedContent.join('')
        },
        
        
        getState : function () {
            var cachedUrls      = this.urls
            var rawContent      = {}
            
            // only extract the raw content for the urls that were successfully instrumented
            Joose.O.each(this.instrumentedUrls, function (content, url) {
                if (content != null) rawContent[ url ]   = cachedUrls[ url ]
            })
            
            return {
                rawContent              : rawContent,
                instrumentedContent     : this.instrumentedUrls,
                logicalUnitsContent     : this.logicalUnits,
                logicalUnitsByFile      : this.logicalUnitsByFile
            }
        },
        
        
        getLogicalUnitContent : function (unitName) {
            return this.logicalUnits[ unitName ]
        },

        
        getLogicalUnitOfFile : function (fileName, unitName) {
            return this.logicalUnitsByFile[ fileName ][ unitName ]
        },
        
        
        getLogicalUnits : function (content, fileName, mode) {
            return [{
                name        : fileName,
                start       : 0,
                end         : content.length - 1,
                content     : content,
                // we'll implement optimization that "loc" object of the unit with "start" 0 will not be used
                // (as offset will be 0 anyway)
                loc         : {
                    start       : {
                        line        : 1,
                        column      : 0
                    },
                    end         : {
                        line        : null,
                        column      : null
                    }
                }
            }]
        }
    },
    
    
    override : {
        cache       : function (callback, errback, ignoreErrors) {
            var harness         = this.harness  
            
            // for automated harness with enabled code coverage and 2nd and following pages
            // skip caching and instead wait for the content manager state from the previous launch
            // this state is to be provided by the automation launcher
            // if there's a previous report we need to wait for the content even for the 1st page
            if (harness.isAutomated && harness.enableCodeCoverageAutomation && (harness.testPage > 0 || harness.hasPreviousReport)) {
                var me          = this
                var args        = arguments
                var SUPER       = this.SUPER
                
                var checker     = setInterval(function () {
                    var state   = window.__CONTENT_MANAGER_STATE__
                    
                    if (state) {
                        me.urls                 = state.rawContent
                        me.instrumentedUrls     = state.instrumentedContent
                        me.logicalUnits         = state.logicalUnitsContent
                        me.logicalUnitsByFile   = state.logicalUnitsByFile
                        
                        clearInterval(checker)
                        
                        window.__CONTENT_MANAGER_STATE__ = null
                        
                        SUPER.apply(me, args)
                    }
                }, 100)
            } else
                this.SUPERARG(arguments)
        }
    }
})

