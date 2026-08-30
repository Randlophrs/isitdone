# isitdone uninstaller. Reverses install.ps1:
#   - removes the `isitdone` shim from %LOCALAPPDATA%\isitdone
#   - removes that folder from the user PATH
#   - uninstalls the editable `isitdone` package from the venv
#   - removes the venv
#   - removes the cloned repo at %LOCALAPPDATA%\isitdone-repo (the heavy folder:
#     source + node_modules + venv + dist). A user's own source checkout is left
#     untouched; only its venv is removed.
# User data (%APPDATA%\isitdone\data) is kept so history is not lost.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$DestDir = "$env:LOCALAPPDATA\isitdone"
$Shim = "$DestDir\isitdone.cmd"
$CloneDir = "$env:LOCALAPPDATA\isitdone-repo"

# 1. Remove shim + PATH entry (fixed paths - work even when run via irm | iex,
#    where $PSScriptRoot is empty because the script has no file backing).
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

# 2. Remove the cloned repo (heavy folder) plus its venv. This is the path taken
#    when installed via `irm ... | iex`, since the clone lands in LOCALAPPDATA.
if (Test-Path $CloneDir) {
    $venvPy = "$CloneDir\backend\.venv\Scripts\python.exe"
    if (Test-Path $venvPy) {
        cmd /c "`"$venvPy`" -m pip uninstall -y isitdone" 2>$null
        Write-Host "Uninstalled `isitdone` from venv."
    }
    Remove-Item $CloneDir -Recurse -Force
    Write-Host "Removed cloned repo $CloneDir"
} else {
    # Run from a user's own source checkout: drop only the venv, keep the source.
    $Repo = $PSScriptRoot
    $venvPy = "$Repo\backend\.venv\Scripts\python.exe"
    if (Test-Path $venvPy) {
        cmd /c "`"$venvPy`" -m pip uninstall -y isitdone" 2>$null
        Remove-Item "$Repo\backend\.venv" -Recurse -Force
        Write-Host "Removed venv (kept your source at $Repo)."
    } else {
        Write-Host "No cloned repo or venv found."
    }
}

Write-Host ""
Write-Host "Done. Open a NEW terminal - 'isitdone' will no longer be available."
Write-Host "User data kept at: $env:APPDATA\isitdone\data"
