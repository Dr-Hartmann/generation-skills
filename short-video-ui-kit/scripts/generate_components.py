#!/usr/bin/env python3
"""Generate reusable mini-app UI components from the bundled templates."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = SKILL_ROOT / "templates"
PALETTE_PATH = SKILL_ROOT / "config" / "palette.json"


def load_palette() -> dict:
    with PALETTE_PATH.open("r", encoding="utf-8") as file:
        palette = json.load(file)
    if not isinstance(palette.get("css_variables"), dict):
        raise ValueError("palette.json must contain an object named 'css_variables'.")
    return palette


def render_theme(palette: dict) -> str:
    lines = [f"  {name}: {value};" for name, value in palette["css_variables"].items()]
    template = (TEMPLATES / "theme.css.j2").read_text(encoding="utf-8")
    return template.replace("{{CSS_VARIABLES}}", "\n".join(lines))


def generate(components: list[str], output: Path) -> list[Path]:
    palette = load_palette()
    output.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    # Background and modal styles depend on the shared CSS custom properties.
    if ("background" in components or "modal" in components) and "theme" not in components:
        components = ["theme", *components]

    if "theme" in components:
        target = output / "theme.css"
        target.write_text(render_theme(palette), encoding="utf-8")
        written.append(target)

    if "background" in components:
        for source_name, target_name in (
            ("background.html", "background.html"),
            ("background.css", "background.css"),
        ):
            target = output / target_name
            shutil.copyfile(TEMPLATES / source_name, target)
            written.append(target)

    if "modal" in components:
        for source_name, target_name in (
            ("modal.html", "modal.html"),
            ("modal.css", "modal.css"),
            ("modal.js", "modal.js"),
        ):
            target = output / target_name
            shutil.copyfile(TEMPLATES / source_name, target)
            written.append(target)

    palette_target = output / "palette.json"
    palette_target.write_text(
        json.dumps(palette, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    written.append(palette_target)
    return written


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create reusable background, modal and theme files from short-video-ui-kit."
    )
    parser.add_argument(
        "--components",
        nargs="+",
        choices=("all", "theme", "background", "modal"),
        default=["all"],
        help="Components to generate. 'all' generates every component.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("generated-ui"),
        help="Destination directory (default: ./generated-ui).",
    )
    args = parser.parse_args()

    components = ["theme", "background", "modal"] if "all" in args.components else list(dict.fromkeys(args.components))
    try:
        written = generate(components, args.output.resolve())
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    print("Generated files:")
    for path in written:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
