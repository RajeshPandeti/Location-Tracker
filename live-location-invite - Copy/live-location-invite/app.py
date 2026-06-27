from datetime import datetime, timezone
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote
import json
import os


ROOT = Path(__file__).resolve().parent
LOCATIONS = {}


def clean_phone(value):
    return "".join(ch for ch in value.strip() if ch.isdigit() or ch == "+")


class LocationHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/" or self.path.startswith("/?"):
            self.send_file(ROOT / "templates" / "dashboard.html", "text/html")
            return

        if self.path == "/share" or self.path.startswith("/share?"):
            self.send_file(ROOT / "templates" / "share.html", "text/html")
            return

        if self.path.startswith("/api/location/"):
            phone = clean_phone(unquote(self.path.removeprefix("/api/location/")))
            location = LOCATIONS.get(phone)
            if not location:
                self.send_json({"error": "no active shared location found"}, 404)
                return
            self.send_json(location)
            return

        super().do_GET()

    def do_POST(self):
        if self.path != "/api/location":
            self.send_json({"error": "not found"}, 404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self.send_json({"error": "invalid JSON"}, 400)
            return

        phone = clean_phone(data.get("phone", ""))

        try:
            lat = float(data["latitude"])
            lng = float(data["longitude"])
        except (KeyError, TypeError, ValueError):
            self.send_json({"error": "latitude and longitude are required"}, 400)
            return

        if len(phone) < 7:
            self.send_json({"error": "valid phone number is required"}, 400)
            return

        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            self.send_json({"error": "invalid coordinates"}, 400)
            return

        LOCATIONS[phone] = {
            "phone": phone,
            "latitude": lat,
            "longitude": lng,
            "accuracy": data.get("accuracy"),
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }

        self.send_json({"ok": True, "location": LOCATIONS[phone]})

    def send_file(self, path, content_type):
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), LocationHandler)
    print(f"Running on http://0.0.0.0:{port}")
    server.serve_forever()
