@echo off
echo 🧹 Cleaning up temporary files...

REM Remove test files
if exist "test-api.js" del "test-api.js"

REM Remove any backup files
if exist "*.backup" del "*.backup"

REM Remove any log files
if exist "*.log" del "*.log"

echo ✅ Cleanup completed!
pause