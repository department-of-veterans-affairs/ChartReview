//============================================================================================================
// some simple setup 
var isWindows       = java.lang.System.getProperty("os.name").indexOf("Windows") != -1
var isMacOS         = java.lang.System.getProperty('os.name').indexOf("Mac") != -1
var is64            = java.lang.System.getProperty('os.arch').indexOf("64") != -1

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


//============================================================================================================
// processing args 


var args        = processArguments(arguments)
var binDir      = args.argv[ 0 ].replace(/\\\/?$/, '')

setChromeDriverServerPath(binDir)
setIEDriverServerPath(binDir)

// remove the binDir which comes 1st on command line
arguments.shift()

// bypass all other command line options unchanged
Packages.org.openqa.grid.selenium.GridLauncher.main(arguments)
