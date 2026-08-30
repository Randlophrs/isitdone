"""Embed assets/isitdone.ico into the `isitdone` GUI-script .exe produced by
`pip install -e .`. The pip wrapper ships with the Python launcher icon; this
replaces it with our green-checkmark icon so it shows correctly in Windows
search / Start menu. Run after `pip install -e .` (wired into install.ps1).

Uses only ctypes + the Win32 resource API - no third-party dependency.
"""
from __future__ import annotations

import ctypes
from ctypes import wintypes
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ICO = REPO / "assets" / "isitdone.ico"
EXE = REPO / "backend" / ".venv" / "Scripts" / "isitdone.exe"

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)

BeginUpdateResourceW = kernel32.BeginUpdateResourceW
BeginUpdateResourceW.argtypes = [wintypes.LPCWSTR, wintypes.BOOL]
BeginUpdateResourceW.restype = wintypes.HANDLE

UpdateResourceW = kernel32.UpdateResourceW
UpdateResourceW.argtypes = [
    wintypes.HANDLE, wintypes.LPVOID, wintypes.LPVOID,
    wintypes.WORD, wintypes.LPVOID, wintypes.DWORD,
]
UpdateResourceW.restype = wintypes.BOOL

EndUpdateResourceW = kernel32.EndUpdateResourceW
EndUpdateResourceW.argtypes = [wintypes.HANDLE, wintypes.BOOL]
EndUpdateResourceW.restype = wintypes.BOOL


def set_icon(exe: Path, ico: Path) -> None:
    if not exe.exists():
        raise SystemExit(f"Not found: {exe} (run `pip install -e .` first)")
    data = ico.read_bytes()
    # Parse ICONDIR: reserved(2) type(2)=1 count(2), then count ICONDIRENTRY(16).
    assert data[:4] == b"\x00\x00\x01\x00", "not an .ico"
    count = int.from_bytes(data[4:6], "little")
    entries = []
    offset = 6
    for _ in range(count):
        entry = data[offset:offset + 16]
        offset += 16
        size = int.from_bytes(entry[8:12], "little")
        ptr = int.from_bytes(entry[12:16], "little")
        entries.append((entry, data[ptr:ptr + size]))
    # RT_GROUP_ICON (14) directory: drop the per-entry data-offset/size-in-file
    # fields (bytes 8-12 and 12-16) - they are replaced by the RT_ICON id.
    grp = bytearray(data[:6])
    for i, (entry, _) in enumerate(entries, start=1):
        e = bytearray(entry[:12])  # keep width/height/colors/planes/bpp
        e += i.to_bytes(2, "little")  # id of the RT_ICON resource
        grp += e
    RT_ICON = 3
    RT_GROUP_ICON = 14
    MAKEINTRESOURCE = lambda n: ctypes.c_void_p(n)
    NULL = ctypes.c_void_p(0)

    # Enumerate existing icon resources so we only delete ones that exist.
    # Deleting a non-existent ID raises WinError 1359 ("internal error").
    k = ctypes.WinDLL("kernel32", use_last_error=True)
    k.LoadLibraryExW.argtypes = [wintypes.LPCWSTR, wintypes.HANDLE, wintypes.DWORD]
    k.LoadLibraryExW.restype = wintypes.HANDLE
    k.FreeLibrary.argtypes = [wintypes.HANDLE]
    k.FreeLibrary.restype = wintypes.BOOL
    k.EnumResourceNamesW.argtypes = [wintypes.HANDLE, wintypes.LPVOID, ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HANDLE, wintypes.LPVOID, wintypes.LPVOID, ctypes.c_longlong), ctypes.c_longlong]
    k.EnumResourceNamesW.restype = wintypes.BOOL
    hmod = k.LoadLibraryExW(str(exe), 0, 0x20)
    existing = {RT_ICON: [], RT_GROUP_ICON: []}
    CB = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HANDLE, wintypes.LPVOID, wintypes.LPVOID, ctypes.c_longlong)
    def collect(resid):
        def cb(m, t, n, l):
            if isinstance(n, int):
                existing[resid].append(n)
            return True
        k.EnumResourceNamesW(hmod, MAKEINTRESOURCE(resid), CB(cb), 0)
    collect(RT_ICON)
    collect(RT_GROUP_ICON)
    if hmod:
        k.FreeLibrary(hmod)

    h = BeginUpdateResourceW(str(exe), False)
    if not h:
        raise ctypes.WinError(ctypes.get_last_error())
    # Drop the pip wrapper's Python-launcher icon (only IDs that exist) so our
    # group becomes ID 1 - the one Windows search / Start pick.
    for rid in existing[RT_ICON]:
        UpdateResourceW(h, MAKEINTRESOURCE(RT_ICON), MAKEINTRESOURCE(rid), 0, NULL, 0)
    for rid in existing[RT_GROUP_ICON]:
        UpdateResourceW(h, MAKEINTRESOURCE(RT_GROUP_ICON), MAKEINTRESOURCE(rid), 0, NULL, 0)
    for i, (_, img) in enumerate(entries, start=1):
        if not UpdateResourceW(h, MAKEINTRESOURCE(RT_ICON), MAKEINTRESOURCE(i),
                               0, ctypes.create_string_buffer(img, len(img)), len(img)):
            raise ctypes.WinError(ctypes.get_last_error())
    if not UpdateResourceW(h, MAKEINTRESOURCE(RT_GROUP_ICON), MAKEINTRESOURCE(1),
                           0, ctypes.create_string_buffer(bytes(grp), len(grp)), len(grp)):
        raise ctypes.WinError(ctypes.get_last_error())
    if not EndUpdateResourceW(h, False):
        raise ctypes.WinError(ctypes.get_last_error())
    print(f"Icon embedded -> {exe}")


if __name__ == "__main__":
    set_icon(EXE, ICO)
