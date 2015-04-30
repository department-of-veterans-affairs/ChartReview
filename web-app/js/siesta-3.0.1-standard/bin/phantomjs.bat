@echo off
:: get the directory in which the script reside
set DIR=%~dp0

"%DIR%binary\phantomjs-1.9.7-windows\phantomjs.exe" --ssl-protocol=any --ignore-ssl-errors=true "%DIR%phantomjs-launcher.js" "%DIR%/" %*
