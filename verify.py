#!/usr/bin/env python3
"""Compatibility wrapper for the packaged CLI."""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SRC_DIR = REPO_ROOT / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

def main() -> int:
    from quran_fractal.cli import main as cli_main

    return cli_main()


if __name__ == "__main__":
    raise SystemExit(main())
