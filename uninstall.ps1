# isitdone uninstaller. Reverses install.ps1:
#   - removes the `isitdone` shim from %LOCALAPPDATA%\isitdone
#   - removes that folder from the user PATH
#   - uninstalls the editable `isitdone` package from the venv
#   - removes the venv
# User data (%APPDATA%\isitdone\data) is kept so history is not lost.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$Repo = $PSScriptRoot
$DestDir = "$env:LOCALAPPDATA\isitdone"
$Shim = "$DestDir\isitdone.cmd"
$VenvPy = "$Repo\backend\.venv\Scripts\python.exe"

# 1. Remove shim + PATH entry.
if (Test-Path $Shim) {
    Remove-Item $Shim -Force
    Write-Host "Removed shim $Shim"
}
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($userPath -split ";") -contains $DestDir) {
    $newPath = ($userPath -split ";") | Where-Object { $_ -and $_ -ne $DestDir }
    [Environment]::SetEnvironmentVariable("Path", ($newPath -join ";"), "User")
    Write-Host "Removed $DestDir from user PATH."
}

# 2. Uninstall editable package from the venv.
if (Test-Path $VenvPy) {
    cmd /c "`"$VenvPy`" -m pip uninstall -y isitdone" 2>$null
    Write-Host "Uninstalled `isitdone` from venv."
    Remove-Item "$Repo\backend\.venv" -Recurse -Force
    Write-Host "Removed venv $Repo\backend\.venv"
} else {
    Write-Host "No venv found; nothing to uninstall."
}

Write-Host ""
Write-Host "Done. Open a NEW terminal - 'isitdone' will no longer be available."
Write-Host "User data kept at: $env:APPDATA\isitdone\data"
