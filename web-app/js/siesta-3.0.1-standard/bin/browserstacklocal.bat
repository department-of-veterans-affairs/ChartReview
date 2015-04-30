@echo off
:: get the directory in which the script reside
set DIR=%~dp0

echo %DIR%

%DIR%binary\browserstack\windows\BrowserStackLocal.exe %*