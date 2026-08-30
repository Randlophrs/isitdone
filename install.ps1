# isitdone installer — developer install (Python 3.11+ required).
# Provisions a venv, installs backend deps + the `isitdone` console command,
# and puts a shim on the user PATH so `isitdone` works from any terminal.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$Repo = $PSScriptRoot
$DestDir = "$env:LOCALAPPDATA\isitdone"
$OutLog = "$env:TEMP\isitdone-install.out"
$ErrLog = "$env:TEMP\isitdone-install.err"
"" | Set-Content -Path $OutLog
"" | Set-Content -Path $ErrLog

# If run from a downloaded copy (no repo beside this script), clone the repo
# into a fixed location first so the source is available for the install.
if (-not (Test-Path "$Repo\backend\app\main.py")) {
    Write-Progress -Activity "Installing isitdone" -Status "Cloning repo" -PercentComplete 10
    Write-Host ">> Cloning repo to $env:LOCALAPPDATA\isitdone-repo" -ForegroundColor Cyan
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "git not found. Install Git, or clone the repo manually and run install.ps1 from it."
        exit 1
    }
    $CloneDir = "$env:LOCALAPPDATA\isitdone-repo"
    if (Test-Path "$CloneDir\.git") {
        $p = Start-Process git -ArgumentList "-C","$CloneDir","pull","--ff-only" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
    } else {
        $p = Start-Process git -ArgumentList "clone","https://github.com/Randlophrs/isitdone.git","$CloneDir" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
        if ($p.ExitCode -ne 0) {
            Write-Error "git clone failed. Check network / repo access, then retry."
            exit 1
        }
    }
    & "$CloneDir\install.ps1"
    exit 0
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python 3.11+ not found. Install Python, then re-run this script."
    exit 1
}

$total = 6
$step = 0
function Step($name) {
    $script:step++
    Write-Progress -Activity "Installing isitdone" -Status $name -PercentComplete (($script:step - 1) / $total * 100)
    Write-Host ""
    Write-Host ">> $name" -ForegroundColor Cyan
}

# Provision venv if missing.
$venvPy = "$Repo\backend\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
    Step "Creating virtual environment"
    $p = Start-Process python -ArgumentList "-m","venv","$Repo\backend\.venv" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
    if ($p.ExitCode -ne 0) {
        Write-Error "Failed to create virtualenv."
        exit 1
    }
}

Step "Installing backend dependencies"
$p = Start-Process "$venvPy" -ArgumentList "-m","pip","install","-q","-r","$Repo\backend\requirements.txt" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
if ($p.ExitCode -ne 0) {
    Write-Error "pip install of requirements failed; check network/Python (log: $ErrLog)."
    exit 1
}

Step "Installing isitdone command"
$p = Start-Process "$venvPy" -ArgumentList "-m","pip","install","-q","-e","$Repo" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
if ($p.ExitCode -ne 0) {
    Write-Error "pip install -e . failed (log: $ErrLog)."
    exit 1
}

# Build the frontend so the server has something to serve at "/".
# `dist/` is gitignored, so a fresh clone has no SPA until we build it here.
$feDir = "$Repo\frontend"
if (Test-Path "$feDir\package.json") {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Warning "Node.js not found - skipping frontend build. Install Node to get the UI; API still works."
    } else {
        Step "Building frontend (UI)"
        Push-Location $feDir
        try {
            $p = Start-Process "cmd.exe" -ArgumentList "/c","npm","install" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
            if ($p.ExitCode -ne 0) { throw "npm install failed" }
            $p = Start-Process "cmd.exe" -ArgumentList "/c","npm","run","build" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
            if ($p.ExitCode -ne 0) { throw "npm run build failed" }
        } catch {
            Write-Warning "Frontend build failed (log: $ErrLog). API still works; UI will be missing until you build it."
        } finally {
            Pop-Location
        }
    }
}

Step "Adding launcher to PATH"
# Shim on PATH: launch launcher.pyw with the venv pythonw.exe, detached via
# `start` so closing the terminal does NOT kill the app. The tray Quit still
# stops the server (launcher.pyw handles that). pythonw = no console window.
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
$shim = "$DestDir\isitdone.cmd"
$venvPyw = "$Repo\backend\.venv\Scripts\pythonw.exe"
$launcher = "$Repo\launcher.pyw"
$line1 = "@echo off"
$line2 = 'start "" "{0}" "{1}"' -f $venvPyw, $launcher
Set-Content -Path $shim -Value ($line1, $line2)
Write-Host "   Created shim -> $shim" -ForegroundColor Green

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($userPath -split ";") -notcontains $DestDir) {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$DestDir", "User")
    Write-Host "   Added to user PATH." -ForegroundColor Green
} else {
    Write-Host "   Already on PATH." -ForegroundColor Green
}

Write-Progress -Activity "Installing isitdone" -Completed
Write-Host ""
Write-Host "Done. Launching isitdone..." -ForegroundColor Green

# Launch immediately so the user gets the app without reopening a terminal.
# Use pythonw directly (not the shim, which wraps `start`) to avoid a double
# spawn. pythonw + launcher.pyw = no console, detached from this shell.
if (Test-Path $venvPyw) {
    Start-Process -FilePath $venvPyw -ArgumentList $launcher
} else {
    Write-Host "Could not auto-launch (venv missing). In a NEW terminal run:  isitdone" -ForegroundColor Yellow
}
