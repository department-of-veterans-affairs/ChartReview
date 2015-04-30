/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
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

