@echo off
setlocal
cd /d "%~dp0.."

REM Build the frontend if it has not been built yet.
if not exist "frontend\dist\index.html" (
    echo Building frontend...
    call npm --prefix frontend run build
)

echo Starting isitdone server...

REM Use the project virtualenv so dependencies (sqlmodel, fastapi) are found.
cd backend
if not exist ".venv\Scripts\activate.bat" (
    echo Creating virtualenv and installing backend dependencies...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    python -m pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

python run.py
endlocal
