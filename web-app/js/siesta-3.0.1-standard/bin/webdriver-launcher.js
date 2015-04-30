try {
    var robot       = new java.awt.Robot()
    
    robot.mouseMove(0, 0)
} catch (e) {
}

var selenium        = Packages.org.openqa.selenium

//============================================================================================================
// some simple setup 

var isWindows       = java.lang.System.getProperty("os.name").indexOf("Windows") != -1
var isMacOS         = java.lang.System.getProperty('os.name').indexOf("Mac") != -1
var is64            = java.lang.System.getProperty('os.arch').indexOf("64") != -1
var isDebug         = false
var noColor         = false

var debug           = function (text) {
    if (isDebug) safePrint(text) 
}

var safePrint       = function (text) {
    if (noColor) text = String(text).replace(/\x1B\[\d+m([\s\S]*?)\x1B\[\d+m/mg, '$1')
    
    print(String(text).replace(/\x0d?\x0a/g, '\n'))
}

var printErr        = function (text) {
    java.lang.System.err.println(text);
}

var sleep           = function (time) {
    java.lang.Thread.currentThread().sleep(time)
}

var convertPath     = function (path) {
    return isWindows ? path.replace(/\//g, '\\') : path
}

var readFile        = function (fileName) {
    fileName    = convertPath(fileName)
    
    return new java.util.Scanner(new java.io.File(fileName), "UTF-8").useDelimiter("\\A").next()
}

var tcEncode        = function (text) {
    return String(text).replace(/\r/g, '|r').replace(/\n/g, '|n').replace(/'/g, "|'").replace(/\[/g, '|[').replace(/\]/g, '|]')
}

//============================================================================================================
// setting path to chrome driver server

var setChromeDriverServerPath   = function (binDir) {
    
    if (isWindows) 
        java.lang.System.setProperty("webdriver.chrome.driver", binDir + "\\binary\\chromedriver_win\\chromedriver.exe")
    else if (isMacOS)
        java.lang.System.setProperty("webdriver.chrome.driver", binDir + "/binary/chromedriver_mac/chromedriver")
    else {
        // linux branch
        if (is64)
            java.lang.System.setProperty("webdriver.chrome.driver", binDir + "/binary/chromedriver_linux64/chromedriver")
        else
            java.lang.System.setProperty("webdriver.chrome.driver", binDir + "/binary/chromedriver_linux32/chromedriver")
    }
}

var setIEDriverServerPath   = function (binDir) {
    
    if (!isWindows) return
    
    if (is64)
        java.lang.System.setProperty("webdriver.ie.driver", binDir + "\\binary\\iedriver_win64\\IEDriverServer.exe")
    else
        java.lang.System.setProperty("webdriver.ie.driver", binDir + "\\binary\\iedriver_win32\\IEDriverServer.exe")
}

var currentDriver
var bsLocalTunnelProcess, slLocalTunnelProcess

java.lang.Runtime.getRuntime().addShutdownHook(java.lang.Thread(function () {
    // for some weird reason the {} are required here
    if (currentDriver) {
        try {
            currentDriver.quit()
        } catch (e) {
        }
    }
    
    // remove possibly created dummy file
    try {
        var file        = new java.io.File('libpeerconnection.log')
        file[ 'delete' ]()
    } catch (e) {
    }
    
    if (bsLocalTunnelProcess)
        try {
            if (isWindows) {
                // on Windows need to use this way to stop the process instead of "destroy" method for some reason 
                (new java.lang.ProcessBuilder('taskkill', '/IM', 'BrowserStackLocal.exe', '/F', '/T')).start()
            } else
                bsLocalTunnelProcess.destroy()
        } catch (e) {
        }
        
    if (slLocalTunnelProcess)
        try {
            slLocalTunnelProcess.destroy()
        } catch (e) {
        }
        
}))

var getProceduralInterface  = function (webDriver, browserName, reportOptions) {
    currentDriver           = webDriver;
    
    var maxMessageSize      = 850000
    var scriptIdGen         = 1
    
    var width, height;
    
    var isFirstOpen         = true
    
    return {
        
        browserName     : browserName,
        
        
        screenshot : function (command) {
            var tempFile        = currentDriver.getScreenshotAs(selenium.OutputType.FILE)
            
            var fileName        = convertPath(command.fileName.replace(/(\.png)?$/, '.png'))
            
            this.ensurePathExists(fileName)
            
            org.apache.commons.io.FileUtils.copyFile(tempFile, new java.io.File(fileName))            
        },
        
        
        debug : function (text) {
            debug(text)
//            printErr(text)
        },
        
        
        print : function (text) {
            safePrint(text)
        },
        
        
        open : function (url, callback) {
            if (!currentDriver) currentDriver = getDriverInstance(browserName);
            
            if (!currentDriver) print("[ERROR]: no current driver after `getDriverInstance`")
            
//            var actions     = new selenium.interactions.Actions(currentDriver)
//            actions.moveToElement(currentDriver.findElement(selenium.By.ByTagName('body')), 0, 0).perform()
            
            currentDriver.manage().window().setSize(new selenium.Dimension(width, height));
            currentDriver.manage().window().setPosition(new selenium.Point(10, 10));
            
            currentDriver.get(url)
            
            sleep(1000)
            
            // required for FF
            // commented, because it can interfere with tests that are already launched (see "sleep" above)
            // instead added "window.focus()" in the "setup" method of Siesta.Harness.Browser
            //this.executeScript("window.focus()", true)
            
            // webdriver doesn't know anything about HTTP status of page loading, it accepts 404 pages just fine
            // "feature testing" that loading has successed and Siesta is presented on harness page
            var siestaIsOnPage  = this.executeScript("return typeof Siesta != 'undefined'", true)
            
            if (!siestaIsOnPage) {
                print("[ERROR] Can't find Siesta on the harness page - page loading failed?")
                
                currentDriver.quit()
                
                quit(5)
            }
            
            var siestaIsAutomated   = this.executeScript("try { return typeof Siesta.Harness.Browser.Automation != 'undefined' } catch(e) { return false } ")
            
            if (!siestaIsAutomated) {
                print("[ERROR] The harness page you are targeting contains Siesta Lite distribution. To use automation facilities, \nmake sure harness page uses `siesta-all.js` from Standard or Trial packages")
                
                currentDriver.quit()
                
                quit(5)
            }
            
            if (coverageOptions.enableCodeCoverage) {
                var hasCoverageOnPage   = this.executeScript("try { return typeof IstanbulCollector != 'undefined' } catch(e) { return false } ")
                
                if (!hasCoverageOnPage) {
                    print("[ERROR] You've enabled code coverage, but harness page you are targeting does not contain required classes. Did you include `siesta-coverage-all.js` on the harness page?")
                    
                    currentDriver.quit()
                    
                    quit(5)
                }
            }
            
            
            if (isFirstOpen) {
                isFirstOpen     = false
                
                // reporting browser version only after page load, this is because IE (its always IE) may change its mode
                // using various <meta> directives, so IE9 may be running in IE8 mode, etc
                var browserInfo = parseBrowser(currentDriver.executeScript("return window.navigator.userAgent"))
                var osInfo      = parseOS(currentDriver.executeScript("return window.navigator.platform"))
                
                if (isTeamCity) {
                    // update the global variable, so that it will be used in the matching closing text
                    tcSuiteName = tcSuiteName || browserInfo.name + " " + browserInfo.version
                    
                    print("##teamcity[testSuiteStarted name='" + tcEncode(tcSuiteName) + "']")
                }
                
                print("Launching test suite, OS: " + osInfo + ", browser: " + browserInfo.name + " " + browserInfo.version);
            }
            
            callback()
        },
        
        
        close : function () {
            // IE driver as everything related to IE sporadically throws exceptions when closing the browser.. 
            try {
                currentDriver.quit()
            } catch (e) {
            }
            
            sleep(1000)
            
            currentDriver = null
        },
        
        
        setWindowSize : function (w, h) {
            width       = w
            height      = h
        },
        
        
        // script, that is guaranteed to be less than "splitSize" bytes, including the return value 
        executeSmallScript   : function (text, ignoreException) {
            // IE driver as everything related to IE sporadically throws exceptions when executing the code
            // it also throws exception when trying to execute the script on 404 page (all other drivers are ok)
            try {
                return currentDriver.executeScript(text)
            } catch (e) {
                if (!ignoreException) {
                    print("<Exception from launcher>")
                    print("    While running small script: " + text.substring(0, 100))
                    print("    Exception: " + e)
                    print("</Exception from launcher>")
                }
                
                return null
            }
        },
        
        
        executeScript   : function (text, ignoreException) {
            var scriptId        = scriptIdGen++
            var length          = text.length
            
            var pos             = 0
            var index           = 0
            
            while (pos < length) {
                var chunk       = null
                var chunkSize   = maxMessageSize * 0.8
                
                while (!chunk) {
                    // while stringifying, the size of the chunk can increase, we don't know how much upfront
                    chunk       = JSON.stringify(text.substr(pos, chunkSize))
                    
                    if (chunk.length > maxMessageSize) {
                        chunk           = null
                        chunkSize       = Math.floor(chunkSize * 0.8)
                        
                        if (!chunkSize) throw "Chunk size zero"
                    }
                }
                
                pos             += chunkSize
                
                var isLastChunk = pos >= length
                
                var result      = this.executeSmallScript(
                    "return Siesta.my.activeHarness.executeScript(" +
                        scriptId + ", " +
                        maxMessageSize + ", " +
                        chunk + ", " + 
                        (index++) + ", " +
                        isLastChunk +
                    ")",
                    ignoreException
                )
                
                if (!result) return null
                
                if (isLastChunk) {
                    var resultChunks        = []
                    
                    result                  = JSON.parse(result)
                    
                    if (result.exception) {
                        if (!ignoreException) {
                            print("<Exception from launcher>")
                            print("    While running big script: " + text.substring(0, 100))
                            print("    Exception: " + result.exception)
                            print("</Exception from launcher>")
                        }
                        
                        return null
                    }
                    
                    resultChunks.push(result.chunk)
                    
                    while (!result.isLastChunk) {
                        result      = JSON.parse(this.executeSmallScript(
                            "return Siesta.my.activeHarness.retrieveScriptResult(" +
                                scriptId + ", " +
                                resultChunks.length +
                            ")"
                        ))
                        
                        resultChunks.push(result.chunk)
                    }
                    
                    return JSON.parse(resultChunks.join(''))
                }
            }
        },
        
        
        sleep : function (timeout, func) {
            sleep(timeout)
            
            func()
        },
        
        
        saveReport : function (content) {
            var reportFilePrefix    = reportOptions.filePrefix
            
            var match       = /(.*?)\.([^.]*?)$/.exec(reportFilePrefix)
            
            var filename
            
            if (match)      
                filename    = match[ 1 ] + browserName + '.' + match[ 2 ]
            else
                filename    = reportFilePrefix + browserName
                
            this.saveFile(filename, content)
        },
        
        
        readFile : function (fileName) {
            return readFile(fileName)
        },
        
        
        ensurePathExists : function (fileName) {
            fileName        = convertPath(fileName)
            
            var file        = new java.io.File(fileName)
            
            var parentDir   = file.getParentFile()
            
            if (parentDir && !parentDir.exists()) parentDir.mkdirs()
        },
        
        
        saveFile : function (fileName, content) {
            fileName        = convertPath(fileName)
            
            this.ensurePathExists(fileName)
            
            var out     = new java.io.BufferedWriter(new java.io.FileWriter(fileName))
            out.write(String(content))
            out.close()
        },
        
        
        copyFile : function (source, dest) {
            var destFile        = new java.io.File(convertPath(dest))
            var sourceFile      = new java.io.File(convertPath(source))
            
            this.ensurePathExists(dest)
            
            if (!destFile.exists()) destFile.createNewFile();
        
            var sourceChannel, destChannel
            
            try {
                sourceChannel   = new java.io.FileInputStream(sourceFile).getChannel();
                destChannel     = new java.io.FileOutputStream(destFile).getChannel();
                
                destChannel.transferFrom(sourceChannel, 0, sourceChannel.size());
            } finally {
                if (sourceChannel) sourceChannel.close();
                if (destChannel) destChannel.close();
            }            
        },
        
        
        copyTree : function (source, dest) {
            org.apache.commons.io.FileUtils.copyDirectory(new java.io.File(convertPath(source)), new java.io.File(convertPath(dest)))
        },
        
        
        saveHtmlCoverageReport : function (reportDir, reportContent) {
            this.copyFile(binDir + '/coverage/index.html', reportDir + '/index.html')
            this.copyFile(binDir + '/coverage/siesta-coverage-report.css', reportDir + '/css/siesta-coverage-report.css')
            this.copyFile(binDir + '/coverage/siesta-coverage-report.js', reportDir + '/siesta-coverage-report.js')
            
            this.copyFile(binDir + '/../resources/images/leaf.png', reportDir + '/images/leaf.png')
            this.copyFile(binDir + '/../resources/images/ns.png', reportDir + '/images/ns.png')
            
            this.copyTree(binDir + '/../resources/css/fonts', reportDir + '/css/fonts')
            
            this.saveFile(reportDir + '/coverage-data.json', JSON.stringify(reportContent))
        },
        
        
        saveLcovCoverageReport : function (reportDir, reportContent) {
            this.saveFile(reportDir + '/lcov.info', reportContent.lcovReport)
        },
        
        
        saveRawCoverageReport : function (reportDir, reportContent) {
            this.saveFile(reportDir + '/raw_coverage_data.json', JSON.stringify(reportContent))
        }
    };
}


//============================================================================================================
// processing args 


var args            = processArguments(arguments)
var options         = args.options

var binDir          = args.argv[ 0 ].replace(/\\\/?$/, '')

if (options.version) {
    var siestaAll   = new java.util.Scanner(new java.io.File(binDir + convertPath('/../siesta-all.js')), "UTF-8").useDelimiter("\\A").next()
    var jar         = new java.util.jar.JarFile(new java.io.File(binDir + convertPath('/binary/selenium-server-standalone-2.45.0.jar')))
    
    var match       = /^\/\*[\s\S]*?Siesta (\d.+)\n/.exec(siestaAll)
    
    print("Selenium : " + jar.getManifest().getAttributes('Build-Info').getValue('Selenium-Version'))
    
    if (match) print("Siesta   : " + match[ 1 ])
    
    quit(8);
}


if (args.argv.length == 1 || options.help) {
    print([
        'Usage: webdriver url [OPTIONS]',
        'The `url` should point to your `tests/index.html` file',
        '',
        'Options (all are optional):',
        '--help                     - prints this help message',
        '--version                  - prints versions of Siesta and Selenium Webdriver',
        '',
        '--browser browsername      - should be exactly one of the "firefox / chrome / ie / safari"',
        '                             this option can be repeated several times',
        '                             One more recognized value is *, meaning all available browsers',
        '--include regexp           - a regexp to only include the matching urls of tests',
        '                             this option has an deprecated alias: filter',
        '--exclude regexp           - a regexp to exclude the matching urls, takes precedence over `include`',
        
        '--previous-coverage-report - specifies the location of the previous coverage report, which will be',
        '                             combined with the current session. It must be generated in the "raw" format.',
        '                             Can be a file name or directory name, in the latter case',
        '                             file name is assumed to be "raw_coverage_data.json"',
        '--coverage-report-format   - specifies the format of the code coverage report, recognized',
        '                             values are `html`, `lcov` or `raw`.',
        '                             If provided, will enable the code coverage information collection.',
        '                             This option can be repeated several times, resulting in several reports',
        '                             saved in the same directory. Alternatively, several formats can be',
        '                             concatenated with "," or "+": --coverage-report-format=html+raw',
        '--coverage-report-dir      - specifies the output directory for the code coverage report',
        '                             default value is "./coverage/"',          
        '--coverage-unit            - sets the "coverageUnit" harness config option,',
        '                             recognized values are: "file" and "extjs_class"',
        '--coverage-no-source       - if specified, the source code files will not be included in the coverage report.',
        '                             Currently only supported for html report',
        
        '--verbose                  - enable the output from all assertions (not only from failed ones)',
        '--debug                    - enable diagnostic messages',
        '--report-format            - create a report for each browser after the test suite execution',
        '                             recognizable formats are: "JSON, JUnit"',
        '--report-file-prefix       - required when `report-format` is provided. ',
        '                             Specifies the initial part of file name to save the report to.',
        '                             The browser name will be used as the second part, extension will be preserved.',
        '                             For example, specifying: --report-file-prefix=report_.json will save the reports to: ',
        '                             report_firefox.json, report_ie.json, etc',
        '--report-file              - Alias for `--report-file-prefix`',
        '--width                    - width of the viewport, in pixels',
        '--height                   - height of the viewport, in pixels',
        '--no-color                 - disable the coloring of the output',
        '--pause                    - pause between individual tests, in milliseconds, default value is 3000',
        '--page-pause               - pause between tests pages, in milliseconds, default value is 3000',
        '--page-size                - the number of tests, after which the browser will be restarted, default value is 10',
        '--teamcity                 - enables the special additional output during test suite execution, that allows',
        '                             TeamCity to generate realtime progress information',
        '--team-city                - synonym for --teamcity',
        '--tc-suite                 - name of the test suite to run (currently used in TeamCity and requires --teamcity)',
        '--jenkins                  - forces launcher to always exit with 0 exit code (otherwise Jenkins thinks build has failed',
        '                             and will not try to create a report)',
        '--touch-events             - enables the touch events support in the browser. Currently only recognized in Chrome.',
        '                             With this option you can test touch-based applications in desktop browser',
        '--host                     - host, running the RemoteWebDriver server. When provided, test suite will be launched',
        '                             on that host. Note, that harness url will be accessed from remote host.',
        '--port                     - port number on the host with RemoteWebDriver server, default value is 4444',
        '--cap                      - this option can be repeated several times, and specifies WebDriver capability,',
        '                             in the form --cap name=value, for example:',
        '                                 --cap browserName=firefox --cap platform=XP',
        
        '--browserstack-user        - the username in the BrowserStack cloud testing infrastructure. When provided, will require a ',
        '                             "--browserstack-key" option and set the value of the "--host" option, pointing to BrowserStack server',
        '--browserstack-key         - the automate key in the BrowserStack cloud testing infrastructure',
        '',
        
        '--browserstack             - a shortcut option, allowing you to run your tests in the BrowserStack cloud testing infrastructure,',
        '                             choosing from various browser/OS combinations. Usage format:',
        '                                 --browserstack=<BS_USER>,<BS_KEY>[,hostname1,port1,ssl_flag1,hostname2,port2,ssl_flag2]',
        '                             This option will: ',
        '                             1) Establish a tunnel from BrowserStack to the specified hosts/ports or to the "http://localhost:80",',
        '                             if not provided.',
        '                             2) Set the value of the "--host" option, pointing to the BrowserStack servers',
        '                             3) Set the value of the "browserstack.local" webdriver capability to "true"',
        '                             Use the --cap options to specify the desired browser and OS.', 
        '                             More info at: https://www.browserstack.com/automate/capabilities (BrowserStack specific) and',
        '                             https://code.google.com/p/selenium/wiki/DesiredCapabilities (generic WebDriver)',
        '                             You can do the 1) manually, using a provided wrapper for BrowserStack binaries:',
        '                                 /bin/browserstacklocal',
        '                             In such case use only the "--browserstack-user", "--browserstack-key" options and DON\'T FORGET',
        '                             to set the `browserstack.local` capability to `true`!',
        
        '--saucelabs-user           - the username in the SauceLabs cloud testing infrastructure. When provided, will require a ',
        '                             "--saucelabs-key" option and set the value of the "--host" option, pointing to SauceLabs server',
        '--saucelabs-key            - the API key in the SauceLabs cloud testing infrastructure',
        '',
        '--saucelabs                - a shortcut option, allowing you to run your tests in the SauceLabs cloud testing infrastructure,',
        '                             choosing from various browser/OS combinations. Usage format:',
        '                                 --saucelabs=<USER>,<API_KEY>[,hostname1,hostname2]',
        '                             This option will: ',
        '                             1) Establish a tunnel from SauceLabs to the local machine, if your webserver listens on domain(s),',
        '                             different from `localhost`, then specify it as `hostname1,2`',
        '                             2) Set the value of the "--host" option, pointing to the SauceLabs servers',
        '                             Use the --cap options to specify the desired browser and OS.', 
        '                             More info: https://code.google.com/p/selenium/wiki/DesiredCapabilities',
        '                             You can do the 1) manually, using a provided wrapper for SauceLabs binaries:',
        '                                 /bin/sc',
        '                             In such case use only the "--saucelabs-user", "--saucelabs-key" options',
        
        
        // empty line to add line break at the end
        ''
    ].join('\n'));
    
    quit(6)
}

var harnessURL          = args.argv[ 1 ]

var host                = options.host
var port                = options.port || 4444

// BROWSERSTACK OPTIONS
var bsUserName          = options[ 'browserstack-user' ]
var bsKey               = options[ 'browserstack-key' ]

var bsShortCut          = options[ 'browserstack' ]

if (bsShortCut) {
    var parts           = bsShortCut.split(',')
    
    if (parts.length < 2) throw "Invalid format for --browserstack option";
    
    bsUserName          = parts.shift()
    bsKey               = parts.shift()
    
    bsShortCut          = parts.join(',') || 'localhost,80'
}

if (bsUserName && !bsKey) throw "No BrowserStack key provided, for user name: " + bsUserName

if (bsUserName && bsKey) {
    host                = "http://" + bsUserName + ":" + bsKey + "@hub.browserstack.com/wd/hub"
    port                = 4444
    
    debug("--host set to " + host)
}
// EOF BROWSERSTACK OPTIONS


// SAUCELABS OPTIONS
var slUserName          = options[ 'saucelabs-user' ]
var slKey               = options[ 'saucelabs-key' ]

var slShortCut          = options[ 'saucelabs' ]
var slTunneledDomains

if (slShortCut) {
    var parts           = slShortCut.split(',')
    
    if (parts.length < 2) throw "Invalid format for --saucelabs option";
    
    slUserName          = parts.shift()
    slKey               = parts.shift()
    
    slTunneledDomains   = parts.join(',')
}

if (slUserName && !slKey) throw "No SauceLabs api key provided, for user name: " + slUserName

if (slUserName && slKey) {
    host                = "http://" + slUserName + ":" + slKey + "@ondemand.saucelabs.com:80/wd/hub"
    
    debug("--host set to " + host)
}
// EOF SAUCELABS OPTIONS

var browser             = options.browser
if (browser == '*') browser = [ 'firefox', 'chrome', 'ie', 'safari' ]

if (browser && !(browser instanceof Array)) browser = [ browser ]

if (!browser && !host) {
    print([
        'Please specify a browser to run the tests in with the --browser switch.'
    ].join('\n'));
    
    quit(6)
}

// REPORT OPTIONS
var reportFormat        = options[ 'report-format' ]
var reportFilePrefix    = options[ 'report-file-prefix' ] || options[ 'report-file' ]

if (reportFormat && reportFormat != 'JSON' && reportFormat != 'JUnit') {
    print([
        'Unrecognized report format: ' + reportFormat
    ].join('\n'));
    
    quit(6)
}

if (reportFormat && !reportFilePrefix) {
    print([
        '`report-file-prefix` option is required, when `report-format` option is specified'
    ].join('\n'));
    
    quit(6)
}

if (reportFilePrefix && !reportFormat) reportFormat = 'JSON'
// EOF REPORT OPTIONS

var coverageOptions     = processCoverageOptions(options)

isDebug                 = options.debug || false
noColor                 = options[ 'no-color' ] || isWindows

var isJenkins           = options[ 'jenkins' ]
var isTeamCity          = options[ 'team-city' ] || options[ 'teamcity' ]
var tcSuiteName         = options[ 'tc-suite' ]

setChromeDriverServerPath(binDir)
setIEDriverServerPath(binDir)

var caps                = options[ 'cap' ] || []

if (!(caps instanceof Array)) caps = [ caps ]

if (host && !browser && !caps.length) {
    print([
        'Please specify a browser to run the tests in with the --browser or --cap switches.'
    ].join('\n'));
    
    quit(6)
}

// need to have something in "browser" array for the browsers loop to work
if (!browser && host) browser = [ 'REMOTE' ]

// Launch BrowserStack tunnel
if (bsShortCut) {
    print("Launching local tunnel to BrowserStack: " + bsShortCut)
    
    var path            = ''
    
    if (isWindows) 
        path            = 'windows'
    else if (isMacOS)
        path            = 'macos'
    else {
        // linux branch
        if (is64)
            path        = 'linux64'
        else
            path        = 'linux32'
    }
    
    var processBuilder  = new java.lang.ProcessBuilder(
        convertPath(binDir + '/binary/browserstack/' + path + '/BrowserStackLocal' + (isWindows ? '.exe' : '')), bsKey, bsShortCut
    )
    
    try {
        bsLocalTunnelProcess    = processBuilder.start()
    } catch (e) {
        print("[ERROR] Starting local tunnel to BrowserStack has failed")
        quit(6)
    }
    
    var inputStream     = bsLocalTunnelProcess.getInputStream()
    var bufferedReader  = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream))
    
    debug("Waiting for output from local tunnel binaries")
    
    var done            = false
    var hasError        = false
    var updated         = false
    
    do {
        var output      = bufferedReader.readLine()
        
        debug("Output from tunnel software: " + output)
        
        if (!updated) updated = /Updating BrowserStackLocal/.test(output)
        
        var match       = /Error: (.*)/.exec(output)
        
        if (match) {
            hasError    = true
            
            do {
                var output2     = bufferedReader.readLine()
                
                output          += output2
            } while (output2 != null)
            
            print("[ERROR] Starting local tunnel to BrowserStack has failed with error: " + output)
            quit(6)
        }
        
        try {
            // this call should throw exception since, local tunnel process should not be terminated yet
            var bsExitCode  = bsLocalTunnelProcess.exitValue()
            
            debug("Regex: " + /Updating BrowserStackLocal/.test(output) + ' code : ' + bsExitCode)
            
            if (updated && bsExitCode == 0) {
                try {
                    debug("Re-starting BrowserStackLocal2")
                    
                    bsLocalTunnelProcess    = processBuilder.start()
                    inputStream             = bsLocalTunnelProcess.getInputStream()
                    bufferedReader          = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream))
                } catch (e) {
                    print("[ERROR] Starting local tunnel to BrowserStack has failed")
                    quit(6)
                }
            } else {
                print("[ERROR] Starting local tunnel to SauceLabs has failed with exit code: " + bsExitCode)
                quit(6)
            }
        } catch (e) {
            // exception is a normal flow in this case
        }
        
        if (/you may start your tests\./.test(output) || /You can now access your local server\(s\) in our remote browser/.test(output)) {
            done = true
        }
    } while (!done)
    
    caps.push('browserstack.local=true')
    
    // increase the page poll interval to reduce trafic
    pagePollInterval    = 3000
}
// EOF Launch BrowserStack tunnel


if (slShortCut) {
    print("Launching local tunnel to SauceLabs: " + slUserName + " " + slKey)
    
    var path            = ''
    
    if (isWindows) 
        path            = 'win32'
    else if (isMacOS)
        path            = 'osx'
    else
        path            = 'linux'
    
    var processBuilder  = new java.lang.ProcessBuilder(
        convertPath(binDir + '/binary/saucelabs/' + path + '/bin/sc' + (isWindows ? '.exe' : '')), '-u', slUserName, '-k', slKey, '-t', slTunneledDomains || 'localhost'
    )
    
    try {
        var slLocalTunnelProcess    = processBuilder.start()
    } catch (e) {
        print("[ERROR] Starting local tunnel to SauceLabs has failed")
        quit(6)
    }
    
    var inputStream     = slLocalTunnelProcess.getInputStream()
    var bufferedReader  = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream))
    
    debug("Waiting for output from local tunnel binaries")
    
    var done            = false;
    
    do {
        var output      = bufferedReader.readLine()
        
        debug("Output from tunnel software: " + output)
        
        try {
            // this call should throw exception since, local tunnel process should not be terminated yet
            var slExitCode  = slLocalTunnelProcess.exitValue()
            
            print("[ERROR] Starting local tunnel to SauceLabs has failed with exit code: " + slExitCode)
            quit(6)
        } catch (e) {
            // exception is a normal flow in this case
        }
        
        var match           = /you may start your tests\./.exec(output)
        
        if (match) done     = true
    } while (!done)
    
    // increase the page poll interval to reduce trafic
    pagePollInterval    = 3000
}


//============================================================================================================
// starting the test suites 

var browserConfigs    = {
    firefox         : {
        javaClass           : 'org.openqa.selenium.firefox.FirefoxDriver',
        capabilitiesMethod  : 'firefox'
    },
    
    ie              : {
        javaClass           : 'org.openqa.selenium.ie.InternetExplorerDriver',
        capabilitiesMethod  : 'internetExplorer'
    },
    
    safari          : {
        javaClass           : 'org.openqa.selenium.safari.SafariDriver',
        capabilitiesMethod  : 'safari'
    },
    
    chrome          : {
        javaClass           : 'org.openqa.selenium.chrome.ChromeDriver',
        capabilitiesMethod  : 'chrome'
    },
    
    REMOTE          : {}
}

var getBrowserClass = function (className) {
    var parts       = className.split('.')
    
    var cls         = Packages
    
    for (var i = 0; i < parts.length; i++) {
        cls         = cls[ parts[ i ]]
        
        if (cls === undefined) return null
    }
    
    return cls
}

var getDriverInstance = function (browserName, level) {
    level       = level || 0
    var config  = browserConfigs[ browserName ]
    
    if (!config) {
        debug("Unknown browser: " + browserName)
        
        return null
    }
    
    debug("Trying to create a WebDriver instance for browser: " + browserName)
    
    // when host is presented, in theory, required driver class can present remotely
    if (!host) {
        var driverClass         = getBrowserClass(config.javaClass)
        
        if (!driverClass) {
            debug("Browser class is missing: " + config.javaClass)
            
            return null;
        }
    }
    
    var driver          = null
    
    try {
        var capabilities    = browserName == 'REMOTE' ? 
                new selenium.remote.DesiredCapabilities()
            :
                selenium.remote.DesiredCapabilities[ config.capabilitiesMethod ]();
        
        for (var i = 0; i < caps.length; i++) {
            var match       = /(.*?)=(.*)/.exec(caps[ i ])
            match && capabilities.setCapability(match[ 1 ] || '', match[ 2 ] || '')
        }
        
        if (options[ 'touch-events' ]) {
            var chromeOptions   = new selenium.chrome.ChromeOptions()
            
            chromeOptions.addArguments('touch-events')
            
            capabilities.setCapability(selenium.chrome.ChromeOptions.CAPABILITY, chromeOptions)
        }
        
        if (host) {
            // prepend potentially missing "http://" prefix in "constructURL"
            var url             = constructURL(host)
            
            if (!/\/wd\/hub\s*$/i.test(url)) url += ':' + port + '/wd/hub'
            
            var url             = new java.net.URL(url)
            
            debug("Host option is provided, switching to RemoteWebDriver, on host: " + url)
            
            driver              = new selenium.remote.RemoteWebDriver(url, capabilities);
        } else
            driver              = new driverClass(capabilities)
    } catch (e) {
//        debug("WebDriver instatiation failed: " + browserName)
//        debug("Failed with: " + e)
        printErr("WebDriver instatiation failed: " + browserName)
        printErr("Failed with: " + e)
        
        try {
            driver.quit()
        } catch (ex) {
        }
        
        // try to instantiate the driver 3 times, then return null
        if (level < 3) {
            printErr("Trying again")
            sleep(500) 
            return getDriverInstance(browserName, level + 1)
        } else
            return null
    }
    
    if (driver) {
        debug("WebDriver instantiated successfully")
    }
    
    return driver
}




var browserCounter      = 0

var reportOptions       = reportFormat ? {
    format      : reportFormat,
    filePrefix  : reportFilePrefix
} : null

var exitCodeSum         = 0

var enableCodeCoverage  = coverageOptions.enableCodeCoverage

for (var i = 0; i < browser.length; i++) {
    var browserName = browser[ i ]
    
    currentDriver   = getDriverInstance(browserName)
    
    if (!currentDriver) {
        debug("Ignoring browser, webdriver instatiation failed: " + browserName)
        continue;
    }
    
    browserCounter++
    
    runBrowser(getProceduralInterface(currentDriver, browserName, reportOptions), {
        // webdriver works synchronously!
        sync                    : true,
        
        harnessURL              : harnessURL,
        // query to be added to the harness URL
        query                   : {
            selenium                : true,
            verbose                 : options.verbose,
            'include'               : options[ 'include' ] || options.filter,
            exclude                 : options[ 'exclude' ],
            
            pause                   : options.pause,
            pageSize                : options[ 'page-size' ],
            
            isTeamCity              : isTeamCity,
            isJenkins               : isJenkins,
            
            enableCodeCoverage      : enableCodeCoverage ? true : null,
            coverageUnit            : coverageOptions.coverageUnit,
            hasPreviousReport       : enableCodeCoverage ? Boolean(coverageOptions.previousCoverageReport) : null,
            coverageNoSource        : options[ 'coverage-no-source' ]
        },
        pagePause               : options[ 'page-pause' ],
        
        enableCodeCoverage      : coverageOptions.enableCodeCoverage,
        coverageReportDir       : coverageOptions.coverageReportDir,
        coverageReportFormats   : coverageOptions.coverageReportFormats,
        coverageUnit            : coverageOptions.coverageUnit,
        previousCoverageReport  : coverageOptions.previousCoverageReport,
        
        viewportWidth           : options.width || 1200,
        viewportHeight          : options.height || 800,
        
        reportOptions           : reportOptions
        
    }, function (exitCode) {
        exitCodeSum += exitCode
        
        if (i == browser.length - 1 && isTeamCity) {
            print("##teamcity[testSuiteFinished name='" + tcEncode(tcSuiteName) + "']")
        }
    })
}

if (!browserCounter) {
    print("No supported browsers available, exiting")
    quit(3)
}

quit(
    isJenkins 
        ? 
            0 
        : 
            browserCounter == 1 ? exitCodeSum : exitCodeSum > 0 ? 7 : 0
)
