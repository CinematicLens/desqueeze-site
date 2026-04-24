#!/usr/bin/env python3
"""Serve repo root on 127.0.0.1; GET / -> index.html (matches typical static hosts)."""
from __future__ import annotations

import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        path_only = self.path.split("?", 1)[0].split("#", 1)[0]
        if path_only in ("/", ""):
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        pass


if __name__ == "__main__":
    port = int(sys.argv[1])
    HTTPServer(("127.0.0.1", port), SiteHandler).serve_forever()
