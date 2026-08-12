@echo off
set "SITE=%~dp0index.html"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" start "DSE Physics" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%SITE%"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" start "DSE Physics" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%SITE%"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" start "DSE Physics" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%SITE%"
