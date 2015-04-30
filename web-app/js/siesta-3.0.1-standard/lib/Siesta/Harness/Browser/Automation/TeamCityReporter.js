/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Harness.Browser.Automation.TeamCityReporter', {

    requires    : [ 'log' ],

    has : {
        isTeamCity      : false,
        tcEncodeRegExp  : /(['\[\]])/g
    },


    after : {

        onTestStart : function (test) {
            if (this.isTeamCity) this.log("##teamcity[testStarted name='" + this.tcEncode(this.tcTestName(test)) + "']");
        },

        onTestEnd : function (test) {
            if (this.isTeamCity) this.log("##teamcity[testFinished name='" + this.tcEncode(this.tcTestName(test)) + "']");
        },

        onTestUpdate : function (test, result, parentResult) {
            if (!this.isTeamCity) return;

            if (result instanceof Siesta.Result.Assertion) {
                if (result.isWaitFor && !result.completed) return;

                if (!result.isTodo && (result.isException || !result.passed)) {
                    this.tcFail(result)
                    return
                }
            }
        }
    },


    override : {

        start : function () {
            this.isTeamCity     = this.getQueryParam('isTeamCity') != null

            this.SUPERARG(arguments)
        },


        logWarning : function (result) {
            if (this.isTeamCity) {
                var test        = result.parent.test

                this.log(
                    "##teamcity[testStdOut name='" + this.tcEncode(this.tcTestName(test)) +
                    "' out='["
                        + this.tcEncode(Siesta.Resource('Siesta.Role.ConsoleReporter', 'warnText') + '] ' + result) +
                    "']"
                )
            }

            this.SUPER(result)
        }
    },


    methods : {

        tcTestName : function (test) {
            return '.' + (test.name || test.url);
        },


        tcFail : function (result) {
            var test        = result.parent.test

            this.log("##teamcity[testFailed name='" + this.tcEncode(this.tcTestName(test)) + "' details='" + this.tcEncode(result) + "']")
        },


        tcEncode : function (text) {
            return String(text).replace(/\r/g, '|r').replace(/\n/g, '|n').replace(this.tcEncodeRegExp, '|$1')
        }
    }

})
