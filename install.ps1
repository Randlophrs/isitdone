# isitdone installer — developer install (Python 3.11+ required).
# Provisions a venv, installs backend deps + the `isitdone` console command,
# and puts a shim on the user PATH so `isitdone` works from any terminal.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$Repo = $PSScriptRoot
$DestDir = "$env:LOCALAPPDATA\isitdone"

# If run from a downloaded copy (no repo beside this script), clone the repo
# into a fixed location first so the source is available for the install.
if (-not (Test-Path "$Repo\backend\app\main.py")) {
    $CloneDir = "$env:LOCALAPPDATA\isitdone-repo"
    Write-Host "No source found next to this script - cloning repo to $CloneDir"
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "git not found. Install Git, or clone the repo manually and run install.ps1 from it."
        exit 1
    }
    if (Test-Path "$CloneDir\.git") {
        $p = Start-Process git -ArgumentList "-C","$CloneDir","pull","--ff-only" -Wait -NoNewWindow -PassThru
    } else {
        $p = Start-Process git -ArgumentList "clone","https://github.com/Randlophrs/isitdone.git","$CloneDir" -Wait -NoNewWindow -PassThru
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

# Provision venv if missing.
$venvPy = "$Repo\backend\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
    Write-Host "Creating virtualenv..."
    $p = Start-Process python -ArgumentList "-m","venv","$Repo\backend\.venv" -Wait -NoNewWindow -PassThru
    if ($p.ExitCode -ne 0) {
        Write-Error "Failed to create virtualenv."
        exit 1
    }
}

$p = Start-Process "$venvPy" -ArgumentList "-m","pip","install","-q","-r","$Repo\backend\requirements.txt" -Wait -NoNewWindow -PassThru
if ($p.ExitCode -ne 0) {
    Write-Warning "pip install of requirements failed; check network/Python."
    exit 1
}
$p = Start-Process "$venvPy" -ArgumentList "-m","pip","install","-e","$Repo" -Wait -NoNewWindow -PassThru
if ($p.ExitCode -ne 0) {
    Write-Warning "pip install -e . failed."
    exit 1
}

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
