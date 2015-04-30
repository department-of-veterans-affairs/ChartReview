@echo off
:: get the directory in which the script reside
set DIR=%~dp0

where /Q java

IF ERRORLEVEL 1 (
    echo "[ERROR]: Java executable (`java`) is not installed or not available in the PATH"
    exit /B 9
)

java -cp "%DIR%binary\selenium-server-standalone-2.45.0.jar;%DIR%binary\js.jar" ^
    org.mozilla.javascript.tools.shell.Main -f "%DIR%launcher-common.js" "%DIR%webdriver-server-launcher.js" "%DIR%/" %*
