/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
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

