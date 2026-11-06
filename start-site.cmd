@echo off
rem Starts the Quadra website at http://localhost:8081 (close this window to stop it).
cd /d "%~dp0"
start "" http://localhost:8081
node server\serve_site.js 8081 ..\live_updated
pause
