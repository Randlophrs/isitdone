# isitdone installer — developer install (Python 3.11+ required).
# Provisions a venv, installs backend deps + the `isitdone` console command,
# and puts a shim on the user PATH so `isitdone` works from any terminal.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$Repo = $PSScriptRoot
$DestDir = "$env:LOCALAPPDATA\isitdone"
$LogFile = "$env:TEMP\isitdone-install.log"
"" | Set-Content -Path $LogFile   # fresh log for this run

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
        $p = Start-Process git -ArgumentList "-C","$CloneDir","pull","--ff-only" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
    } else {
        $p = Start-Process git -ArgumentList "clone","https://github.com/Randlophrs/isitdone.git","$CloneDir" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
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

$total = 5
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
    $p = Start-Process python -ArgumentList "-m","venv","$Repo\backend\.venv" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
    if ($p.ExitCode -ne 0) {
        Write-Error "Failed to create virtualenv."
        exit 1
    }
}

Step "Installing backend dependencies"
$p = Start-Process "$venvPy" -ArgumentList "-m","pip","install","-q","-r","$Repo\backend\requirements.txt" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
if ($p.ExitCode -ne 0) {
    Write-Error "pip install of requirements failed; check network/Python (log: $LogFile)."
    exit 1
}

Step "Installing isitdone command"
$p = Start-Process "$venvPy" -ArgumentList "-m","pip","install","-q","-e","$Repo" -Wait -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
if ($p.ExitCode -ne 0) {
    Write-Error "pip install -e . failed (log: $LogFile)."
    exit 1
}

Step "Adding launcher to PATH"
# Shim on PATH: a .cmd that activates the venv and runs `isitdone`.
New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
$shim = "$DestDir\isitdone.cmd"
$venvActivate = "$Repo\backend\.venv\Scripts\activate.bat"
$line1 = "@echo off"
$line2 = 'call "{0}"' -f $venvActivate
$line3 = "isitdone"
Set-Content -Path $shim -Value ($line1, $line2, $line3)
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
Write-Host "Done. Open a NEW terminal and run:  isitdone" -ForegroundColor Green
Write-Host ""
Read-Host -Prompt "Press Enter to close this window"
