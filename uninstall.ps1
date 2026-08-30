# isitdone uninstaller. Reverses install.ps1:
#   - removes every isitdone/venv entry from the user PATH
#   - uninstalls the editable `isitdone` package from the venv
#   - removes the leftover `isitdone.exe` the pip wrapper leaves behind
#   - removes the venv
#   - removes the Start Menu shortcut (Windows search entry)
#   - removes the cloned repo at %LOCALAPPDATA%\isitdone-repo (the heavy folder:
#     source + node_modules + venv + dist) and any stale %LOCALAPPDATA%\isitdone
#     shim dir. A user's own source checkout is left untouched; only its venv
#     is removed.
# User data (%APPDATA%\isitdone\data) is kept so history is not lost.
# No admin rights required.
param()

$ErrorActionPreference = "Stop"
$Repo = $PSScriptRoot
$DestDir = "$env:LOCALAPPDATA\isitdone"
$CloneDir = "$env:LOCALAPPDATA\isitdone-repo"

# 1. Strip every user-PATH entry that points into an isitdone install. pip's
#    `uninstall` does NOT delete the GUI-script .exe, so a stale entry pointing
#    at a now-removed venv makes `isitdone` error with "Unable to find an
#    appended archive" instead of a clean "not recognized". Match broadly
#    (isitdone / backend\.venv) since the venv may already be gone.
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$kept = ($userPath -split ";") | Where-Object { $_ -and $_ -notmatch "isitdone|backend\\\.venv" }
$newPath = $kept -join ";"
if ($newPath -ne $userPath) {
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Removed isitdone entries from user PATH."
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

# 3. Delete the GUI-script .exe pip leaves behind. `pip uninstall` unregisters
#    the package but keeps the wrapper exe; without this, a stale exe on PATH
#    (pointing at a removed venv) errors with "Unable to find an appended
#    archive" instead of a clean "command not found".
foreach ($scripts in @("$Repo\backend\.venv\Scripts", "$CloneDir\backend\.venv\Scripts")) {
    $exe = "$scripts\isitdone.exe"
    if (Test-Path $exe) {
        Remove-Item $exe -Force
        Write-Host "Removed leftover $exe"
    }
}

# Remove the Start Menu shortcut we own (Windows search entry).
$link = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\isitdone.lnk"
if (Test-Path $link) {
    Remove-Item $link -Force
    Write-Host "Removed Start Menu shortcut."
}

# Remove the stale shim dir from older installs (%LOCALAPPDATA%\isitdone). This
# is NOT the user-data dir (%APPDATA%\isitdone\data), so history is untouched.
if (Test-Path $DestDir) {
    Remove-Item $DestDir -Recurse -Force
    Write-Host "Removed legacy shim dir $DestDir"
}

Write-Host ""
Write-Host "Done. Open a NEW terminal - 'isitdone' will no longer be available."
Write-Host "User data kept at: $env:APPDATA\isitdone\data"
