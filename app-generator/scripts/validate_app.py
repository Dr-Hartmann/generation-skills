#!/usr/bin/env python3
"""Validate a generated standalone HTML app."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from generate_app import SPEC_PATH, read_json, validate_html


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate generated mini-app HTML.")
    parser.add_argument("html_file", type=Path, help="HTML file to validate.")
    args = parser.parse_args()

    try:
        spec = read_json(SPEC_PATH)
        source = args.html_file.read_text(encoding="utf-8")
        validate_html(source, spec["meta"]["viewport"])
    except (OSError, KeyError, TypeError, ValueError) as error:
        print(f"Validation failed: {error}", file=sys.stderr)
        return 1

    print(f"Valid: {args.html_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
