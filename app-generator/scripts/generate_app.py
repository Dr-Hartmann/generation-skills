#!/usr/bin/env python3
"""Build a deterministic, self-contained HTML mini-app."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SPEC_PATH = ROOT / "config" / "app-spec.json"
TEMPLATE_DIR = ROOT / "templates"

REQUIRED_IDS = {
    "appRoot", "appTitle", "stage", "visualFrame", "sceneCanvas",
    "mobileSubtitle", "desktopSubtitle",
    "modalStepIndicator", "controlBar", "playButton", "playIcon",
    "settingsButton", "settingsBackdrop", "settingsDialog",
    "closeSettingsButton", "autoModeButton", "stepModeButton",
    "nextStepButton", "speedSelect", "portraitToggle", "resetButton",
}


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Cannot read JSON file {path}: {error}") from error
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object.")
    return value


def validate_scene_data(data: dict[str, Any], spec: dict[str, Any]) -> None:
    title = data.get("title")
    description = data.get("description", "")

    if not isinstance(title, str) or not title.strip():
        raise ValueError("scene.json: 'title' must be a non-empty string.")
    if len(title) > 120:
        raise ValueError("scene.json: 'title' must not exceed 120 characters.")
    if not isinstance(description, str):
        raise ValueError("scene.json: 'description' must be a string.")
    if len(description) > 300:
        raise ValueError("scene.json: 'description' must not exceed 300 characters.")

    steps = data.get("steps")
    subtitle_spec = spec["subtitles"]
    if not isinstance(steps, list):
        raise ValueError("scene.json: 'steps' must be an array.")
    if not subtitle_spec["min_steps"] <= len(steps) <= subtitle_spec["max_steps"]:
        raise ValueError(
            "scene.json: expected "
            f"{subtitle_spec['min_steps']}–{subtitle_spec['max_steps']} steps; "
            f"received {len(steps)}."
        )

    for index, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            raise ValueError(f"scene.json: step {index} must be an object.")
        subtitle = step.get("subtitle")
        if not isinstance(subtitle, str) or not subtitle.strip():
            raise ValueError(f"scene.json: step {index} needs a non-empty 'subtitle'.")
        word_count = len(subtitle.split())
        if word_count > subtitle_spec["max_words"]:
            raise ValueError(
                f"scene.json: subtitle {index} has {word_count} words; "
                f"maximum is {subtitle_spec['max_words']}."
            )


def validate_scene_script(source: str, path: Path) -> None:
    if not source.strip():
        raise ValueError(f"{path} is empty.")
    if re.search(r"</\s*script", source, flags=re.IGNORECASE):
        raise ValueError(f"{path} contains a closing script tag, which would break HTML embedding.")
    if re.search(r"^\s*(?:import\s|export\s)", source, flags=re.MULTILINE):
        raise ValueError(f"{path} must be a classic inline script, not an ES module.")
    if not re.search(r"window\s*\.\s*AppScene\s*=", source):
        raise ValueError(f"{path} must assign the scene API to window.AppScene.")
    if not re.search(r"\bdraw\s*[:(]", source):
        raise ValueError(f"{path} must provide AppScene.draw(ctx, frame).")


def css_variables(spec: dict[str, Any]) -> dict[str, str]:
    layout = spec["layout"]
    controls = spec["controls"]
    palette = spec["palette"]
    typography = spec["typography"]
    animation = spec["animation"]
    subtitles = spec["subtitles"]

    return {
        "COLOR_BACKGROUND": palette["background"],
        "COLOR_PANEL": palette["panel"],
        "COLOR_ACCENT": palette["accent"],
        "COLOR_ACCENT_DARK": palette["accent_dark"],
        "COLOR_TEXT": palette["text"],
        "COLOR_MUTED": palette["muted_text"],
        "COLOR_SUBTITLE_BG": palette["subtitle_background"],
        "COLOR_MODAL_SCRIM": palette["modal_scrim"],
        "COLOR_BORDER": palette["border"],
        "COLOR_CONTROL_BG": palette["control_background"],
        "COLOR_DANGER": palette["danger"],
        "COLOR_ACCENT_SOFT": palette["accent_soft"],
        "COLOR_ACCENT_GLOW": palette["accent_glow"],
        "COLOR_CONTROL_HOVER": palette["control_hover"],
        "COLOR_DIALOG_SHADOW": palette["dialog_shadow"],
        "COLOR_KEYBOARD_BG": palette["keyboard_background"],
        "FONT_FAMILY": typography["font_family"],
        "SUBTITLE_SIZE": typography["subtitle_size"],
        "HEADING_WEIGHT": str(typography["heading_weight"]),
        "BODY_WEIGHT": str(typography["body_weight"]),
        "SUBTITLE_CONTROLS_GAP_PX": str(layout["subtitle_to_controls_gap_px"]),
        "PORTRAIT_ASPECT_RATIO": layout["portrait_aspect_ratio"],
        "RIGHT_RESERVED_PX": str(layout["right_reserved_px"]),
        "LEFT_PADDING_PX": str(layout["left_padding_px"]),
        "HEADER_TOP_PADDING_PX": str(layout["header_top_padding_px"]),
        "BOTTOM_RESERVED_VH": str(layout["bottom_reserved_vh"]),
        "SIDEBAR_WIDTH": layout["desktop_sidebar_width"],
        "TOUCH_TARGET_PX": str(controls["min_touch_target_px"]),
        "MODAL_MAX_HEIGHT_DVH": str(controls["settings_max_height_dvh"]),
        "SUBTITLE_BLUR_PX": str(subtitles["background_blur_px"]),
        "SETTINGS_ENTRY_SCALE": str(animation["settings_entry_scale"]),
        "SUBTITLE_TRANSITION_MS": str(animation["subtitle_transition_ms"]),
        "BREAKPOINT_PX": str(layout["breakpoint_px"]),
    }


def render_css(spec: dict[str, Any]) -> str:
    template = (TEMPLATE_DIR / "app.css").read_text(encoding="utf-8")
    for key, value in css_variables(spec).items():
        template = template.replace("{{" + key + "}}", value)

    unresolved = re.findall(r"\{\{[A-Z0-9_]+\}\}", template)
    if unresolved:
        raise ValueError("Unresolved CSS template tokens: " + ", ".join(unresolved))
    return template.strip()


def js_json(value: Any) -> str:
    # Escaping '<' prevents user-authored strings from terminating the inline script.
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def validate_html(source: str, expected_viewport: str | None = None) -> None:
    class DocumentCheck(HTMLParser):
        def __init__(self) -> None:
            super().__init__(convert_charrefs=True)
            self.ids: list[str] = []
            self.metas: list[dict[str, str | None]] = []
            self.style_count = 0
            self.script_count = 0
            self.external_assets: list[str] = []
            self.charset_ok = False

        def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
            values = dict(attrs)
            element_id = values.get("id")
            if element_id:
                self.ids.append(element_id)
            if tag == "meta":
                self.metas.append(values)
                if (values.get("charset") or "").lower() == "utf-8":
                    self.charset_ok = True
            elif tag == "style":
                self.style_count += 1
            elif tag == "script":
                self.script_count += 1
                if values.get("src"):
                    self.external_assets.append(str(values["src"]))
            elif tag == "link" and values.get("href"):
                self.external_assets.append(str(values["href"]))

    parser = DocumentCheck()
    parser.feed(source)
    parser.close()

    duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicates:
        raise ValueError("Generated HTML contains duplicate IDs: " + ", ".join(duplicates))

    missing = sorted(REQUIRED_IDS.difference(parser.ids))
    if missing:
        raise ValueError("Generated HTML is missing required elements: " + ", ".join(missing))

    if not parser.charset_ok:
        raise ValueError("Generated HTML must declare UTF-8 charset.")
    viewport = [
        meta for meta in parser.metas
        if (meta.get("name") or "").lower() == "viewport"
    ]
    if len(viewport) != 1:
        raise ValueError("Generated HTML must contain exactly one viewport meta tag.")
    if expected_viewport and viewport[0].get("content") != expected_viewport:
        raise ValueError("Generated viewport meta tag differs from app-spec.json.")

    if parser.style_count != 1 or parser.script_count != 1:
        raise ValueError("Generated HTML must contain exactly one inline style and one inline script.")
    if parser.external_assets:
        raise ValueError(
            "Generated HTML must not reference external files: "
            + ", ".join(parser.external_assets)
        )
    if re.search(r"\{\{[A-Z0-9_]+\}\}", source):
        raise ValueError("Generated HTML contains unresolved template tokens.")
    for required in ("requestAnimationFrame", "ResizeObserver", "window.AppScene"):
        if required not in source:
            raise ValueError(f"Generated HTML is missing required runtime feature: {required}.")


def build_html(
    data: dict[str, Any],
    scene_source: str,
    spec: dict[str, Any],
) -> str:
    validate_scene_data(data, spec)
    validate_scene_script(scene_source, Path("scene.js"))

    document = (TEMPLATE_DIR / "document.html").read_text(encoding="utf-8")
    runtime = (TEMPLATE_DIR / "runtime.js").read_text(encoding="utf-8")

    timing = spec["animation"]
    runtime_config = {
        "steps": data["steps"],
        "palette": spec["palette"],
        "breakpointPx": spec["layout"]["breakpoint_px"],
        "timing": {
            "autoStartDelayMs": timing["auto_start_delay_ms"],
            "transitionMs": timing["step_transition_ms"],
            "autoStepIntervalMs": timing["auto_step_interval_ms"],
            "speeds": timing["speeds"],
            "defaultSpeed": timing["default_speed"],
            "defaultMode": spec["behavior"]["default_mode"],
            "defaultVideoMode": spec["behavior"]["default_video_mode"],
            "targetFps": timing["target_fps"],
            "minSteps": spec["subtitles"]["min_steps"],
            "maxSteps": spec["subtitles"]["max_steps"],
        },
    }

    replacements = {
        "LANGUAGE": html.escape(str(spec["language"]), quote=True),
        "VIEWPORT_META": (
            '<meta name="viewport" content="'
            + html.escape(spec["meta"]["viewport"], quote=True)
            + '">'
        ),
        "THEME_COLOR": html.escape(spec["palette"]["background"], quote=True),
        "DESCRIPTION": html.escape(data.get("description", ""), quote=True),
        "TITLE": html.escape(data["title"], quote=True),
        "CSS": render_css(spec),
        "APP_CONFIG": js_json(runtime_config),
        "SCENE_SCRIPT": scene_source.strip(),
        "RUNTIME_SCRIPT": runtime.strip(),
    }

    for key, value in replacements.items():
        document = document.replace("{{" + key + "}}", value)

    document = document.rstrip() + "\n"
    validate_html(document, spec["meta"]["viewport"])
    return document


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate one standalone HTML app from scene data and a drawing function."
    )
    parser.add_argument("--config", type=Path, default=Path("scene.json"), help="Scene metadata and subtitles JSON.")
    parser.add_argument("--scene", type=Path, default=Path("scene.js"), help="JavaScript file defining window.AppScene.draw().")
    parser.add_argument("--output", type=Path, default=Path("dist/app.html"), help="Output HTML file.")
    parser.add_argument("--force", action="store_true", help="Overwrite the output file if it already exists.")
    args = parser.parse_args()

    output = args.output.resolve()
    if output.exists() and not args.force:
        print(f"Refusing to overwrite {output}. Pass --force to replace it.", file=sys.stderr)
        return 2

    try:
        spec = read_json(SPEC_PATH)
        data = read_json(args.config)
        scene_source = args.scene.read_text(encoding="utf-8")
        document = build_html(data, scene_source, spec)

        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(document, encoding="utf-8", newline="\n")
    except (OSError, KeyError, TypeError, ValueError) as error:
        print(f"Generation failed: {error}", file=sys.stderr)
        return 1

    print(f"Generated and validated: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
