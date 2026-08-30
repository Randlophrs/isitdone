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

    server = start_server()

    def open_app(_=None):
        webbrowser.open(URL)

    def quit_app(icon):
        icon.stop()
        server.terminate()
        try:
            server.wait(timeout=5)
        except Exception:
            server.kill()

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
