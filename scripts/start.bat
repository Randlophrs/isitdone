@echo off
setlocal
cd /d "%~dp0.."

REM Build the frontend if it has not been built yet.
if not exist "frontend\dist\index.html" (
    echo Building frontend...
    call npm run build
)

echo Starting isitdone server...
call npm run start
endlocal
