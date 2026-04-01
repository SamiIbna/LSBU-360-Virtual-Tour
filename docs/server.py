from __future__ import annotations

import argparse
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the LSBU 360 Tour app over HTTP."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to.")
    parser.add_argument("--port", type=int, default=8080, help="Port to bind to.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app_dir = Path(__file__).resolve().parent
    os.chdir(app_dir)

    server = ThreadingHTTPServer((args.host, args.port), SimpleHTTPRequestHandler)
    host_label = "localhost" if args.host in {"127.0.0.1", "0.0.0.0"} else args.host

    print(f"Serving {app_dir}")
    print(f"Open http://{host_label}:{args.port}/index.html")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
