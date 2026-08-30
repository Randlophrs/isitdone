# isitdone installer — developer install (Python 3.11+ required).
# Provisions a venv, installs backend deps + the `isitdone` console command,
# and puts a shim on the user PATH so `isitdone` works from any terminal.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$Repo = $PSScriptRoot
$DestDir = "$env:LOCALAPPDATA\isitdone"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python 3.11+ not found. Install Python, then re-run this script."
    exit 1
}

# Provision venv if missing.
$venvPy = "$Repo\backend\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
    Write-Host "Creating virtualenv..."
    python -m venv "$Repo\backend\.venv"
}

cmd /c "`"$venvPy`" -m pip install -q -r `"$Repo\backend\requirements.txt`""
cmd /c "`"$venvPy`" -m pip install -e `"$Repo`""

# Shim on PATH: a .cmd that activates the venv and runs `isitdone`.
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
$shim = "$DestDir\isitdone.cmd"
$venvActivate = "$Repo\backend\.venv\Scripts\activate.bat"
$line1 = "@echo off"
$line2 = 'call "{0}"' -f $venvActivate
$line3 = "isitdone"
Set-Content -Path $shim -Value ($line1, $line2, $line3)
Write-Host "Created launcher shim -> $shim"

# Add to user PATH if missing.
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($userPath -split ";") -notcontains $DestDir) {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$DestDir", "User")
    Write-Host "Added $DestDir to user PATH."
} else {
    Write-Host "Already on PATH."
}

Write-Host ""
Write-Host "Done. Open a NEW terminal and run:  isitdone"
