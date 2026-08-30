"""isitdone launcher: runs the backend server, opens the app in the browser,
and shows a system-tray icon. Saved as .pyw so Windows shows no console window.

Install via:  pip install -e .   (registers the `isitdone` command)
Run:           isitdone
"""

from __future__ import annotations

import os
import subprocess
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
VENV_PY = BACKEND / ".venv" / "Scripts" / "python.exe"
HOST = os.getenv("APP_HOST", "127.0.0.1")
PORT = os.getenv("APP_PORT", "8000")
URL = f"http://{HOST}:{PORT}"

CREATE_NO_WINDOW = 0x08000000


def free_port(host: str, port: str) -> None:
    # Kill whatever already holds our port so the new server starts clean and
    # (re)mounts the frontend. Otherwise a stale server from a previous run -
    # one started before `dist/` existed - keeps port 8000 and answers "/" 404.
    # netstat/taskkill are console apps; without CREATE_NO_WINDOW a no-console
    # parent (this .pyw) spawns a console window that flashes for one frame.
    try:
        out = subprocess.run(
            ["netstat", "-ano", "-p", "TCP"],
            capture_output=True,
            text=True,
            timeout=10,
            creationflags=CREATE_NO_WINDOW,
        ).stdout
        for line in out.splitlines():
            parts = line.split()
            if len(parts) >= 5 and f":{port}" in parts[1] and "LISTENING" in parts:
                pid = parts[-1]
                subprocess.run(
                    ["taskkill", "/PID", pid, "/T", "/F"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    creationflags=CREATE_NO_WINDOW,
                )
    except Exception:
        pass


def start_server() -> subprocess.Popen:
    if not VENV_PY.exists():
        raise SystemExit(
            "Virtualenv not found. Run: python -m venv backend/.venv && "
            "backend/.venv/Scripts/pip install -r backend/requirements.txt"
        )
    log = (BACKEND / "server.log").open("a", buffering=1)
    return subprocess.Popen(
        [str(VENV_PY), "run.py"],
        cwd=str(BACKEND),
        stdout=log,
        stderr=subprocess.STDOUT,
        creationflags=CREATE_NO_WINDOW,
    )


def stop_server(server: subprocess.Popen) -> None:
    # Kill the whole process tree, not just the top pid: uvicorn can spawn
    # helpers, and a lone terminate() leaves orphans running after we exit.
    # taskkill is a console app; CREATE_NO_WINDOW keeps the tray-quit flash-free.
    pid = server.pid
    subprocess.run(
        ["taskkill", "/PID", str(pid), "/T", "/F"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=CREATE_NO_WINDOW,
    )
    try:
        server.wait(timeout=5)
    except Exception:
        try:
            server.kill()
        except Exception:
            pass


def wait_for_health(timeout: float = 30.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(f"{URL}/api/health", timeout=1)
            return True
        except Exception:
            time.sleep(0.5)
    return False


def make_icon():
    from PIL import Image, ImageDraw

    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((4, 4, 60, 60), fill=(34, 197, 94, 255))
    d.line((20, 33, 29, 44), fill=(255, 255, 255, 255), width=6)
    d.line((29, 44, 46, 22), fill=(255, 255, 255, 255), width=6)
    return img


def main() -> None:
    import pystray

    free_port(HOST, PORT)
    server = start_server()

    def open_app(_=None):
        # os.startfile is the native, console-free way to open a URL on Windows.
        # webbrowser.open falls back to `cmd /c start` here, which flashes a
        # console window for one frame - exactly the flash we're killing.
        if os.name == "nt":
            os.startfile(URL)
        else:
            webbrowser.open(URL)

    def quit_app(icon):
        icon.stop()
        stop_server(server)

    threading.Thread(
        target=lambda: (wait_for_health() and open_app()), daemon=True
    ).start()

    pystray.Icon(
        "isitdone",
        icon=make_icon(),
        title="isitdone",
        menu=pystray.Menu(
            pystray.MenuItem("Open isitdone", open_app),
            pystray.MenuItem("Quit", quit_app),
        ),
    ).run()


if __name__ == "__main__":
    main()
