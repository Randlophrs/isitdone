isitdone - portable package

How to run:
1. Double-click start.bat (Windows) or run ./scripts/start.sh (Linux/macOS).
2. The server opens at http://127.0.0.1:8000
3. Your browser should open automatically. If not, visit the URL above.

Notes:
- Your data is stored in your system data directory, not inside this folder.
  Windows: %APPDATA%\isitdone\data
  Linux:   ~/.local/share/isitdone
  macOS:   ~/Library/Application Support/isitdone
- The server only listens on 127.0.0.1 (your machine). It is not exposed to
  other devices on your network.
- To back up, use Settings > Export backup in the app.

Trouble?
- If the page does not load, make sure the server window is still open.
- Your data directory is created automatically on first run.
