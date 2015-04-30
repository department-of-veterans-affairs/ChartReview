@echo off
:: get the directory in which the script reside
set DIR=%~dp0

:: the funky way of doing "which" in WindowsXP (later versions have "where")
set HAS_JAVA=

@for %%i in (java.exe) do @if NOT "%%~$PATH:i"=="" (@set HAS_JAVA="has_java")

if not defined HAS_JAVA (
    echo "[ERROR]: Java executable (`java`) is not installed or not available in the PATH"
    exit /B 9
)

if not defined STDERRLOG (set STDERRLOG="%DIR%webdriver.log")

java -cp "%DIR%binary\selenium-server-standalone-2.45.0.jar;%DIR%binary\js.jar;%DIR%binary\commons-io-2.2\commons-io-2.2.jar" ^
    org.mozilla.javascript.tools.shell.Main -f "%DIR%launcher-common.js" "%DIR%webdriver-launcher.js" "%DIR%/" %* ^
    2>%STDERRLOG%