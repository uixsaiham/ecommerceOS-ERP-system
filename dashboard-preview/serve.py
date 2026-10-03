"""Serve the CommerceOS prototype locally without browser caching.

python3 serve.py [port]   (default 8080), then open http://localhost:8080/Main.dc.html

Plain `python3 -m http.server` lets browsers keep stale copies of shell.js, list.css
and the pages for hours, so edits don't show up until a hard refresh. The default port is
8080 because browsers may still hold stale copies cached from port 8000.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class Server(ThreadingHTTPServer):
    # The default backlog of 5 makes the OS reset connections when Chrome loads a page's
    # scripts in parallel, which leaves pages half-rendered.
    request_queue_size = 128
    daemon_threads = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = partial(NoCacheHandler, directory=str(Path(__file__).parent))
    print(f"Serving CommerceOS on http://localhost:{port}/Main.dc.html")
    Server(("", port), handler).serve_forever()
