@echo off
:: get the directory in which the script reside
set DIR=%~dp0

echo %DIR%

%DIR%binary\saucelabs\win32\bin\sc.exe %*