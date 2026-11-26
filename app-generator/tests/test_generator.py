from __future__ import annotations

import json
import sys
import unittest
from copy import deepcopy
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from generate_app import SPEC_PATH, TEMPLATE_DIR, build_html, read_json, validate_html, validate_scene_script  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "examples"


class GeneratorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.spec = read_json(SPEC_PATH)
        cls.scene_data = read_json(EXAMPLES / "scene.json")
        cls.scene_script = (EXAMPLES / "scene.js").read_text(encoding="utf-8")

    def build_example(self) -> str:
        return build_html(deepcopy(self.scene_data), self.scene_script, self.spec)

    def test_example_generates_valid_standalone_document(self) -> None:
        document = self.build_example()
        validate_html(document, self.spec["meta"]["viewport"])
        self.assertIn(
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
            document,
        )
        self.assertIn("window.AppScene", document)
        self.assertNotIn("{{", document)

    def test_rejects_too_many_subtitle_words(self) -> None:
        data = deepcopy(self.scene_data)
        data["steps"][0]["subtitle"] = "слово " * 13
        with self.assertRaisesRegex(ValueError, "maximum is 12"):
            build_html(data, self.scene_script, self.spec)

    def test_rejects_wrong_number_of_steps(self) -> None:
        data = deepcopy(self.scene_data)
        data["steps"] = data["steps"][:5]
        with self.assertRaisesRegex(ValueError, "expected 6–10 steps"):
            build_html(data, self.scene_script, self.spec)

    def test_rejects_script_termination_in_scene_code(self) -> None:
        source = self.scene_script + "\n</script>"
        with self.assertRaisesRegex(ValueError, "closing script tag"):
            validate_scene_script(source, Path("scene.js"))

    def test_rejects_scene_without_required_api(self) -> None:
        with self.assertRaisesRegex(ValueError, "window.AppScene"):
            validate_scene_script("function draw() {}", Path("scene.js"))

    def test_rejects_duplicate_dom_ids(self) -> None:
        document = self.build_example()
        document = document.replace('id="playButton"', 'id="settingsButton"', 1)
        with self.assertRaisesRegex(ValueError, "duplicate IDs"):
            validate_html(document, self.spec["meta"]["viewport"])

    def test_rejects_viewport_without_name_attribute(self) -> None:
        document = self.build_example()
        document = document.replace(
            '<meta name="viewport" content=',
            '<meta content=',
            1,
        )
        with self.assertRaisesRegex(ValueError, "exactly one viewport"):
            validate_html(document, self.spec["meta"]["viewport"])

    def test_rejects_duplicate_document_and_metadata_tags(self) -> None:
        document = self.build_example()
        duplicate_head = document.replace("<head>", "<head><head>", 1)
        with self.assertRaisesRegex(ValueError, "exactly one <head>"):
            validate_html(duplicate_head, self.spec["meta"]["viewport"])

        duplicate_meta = document.replace(
            '<meta name="theme-color" content="#0F0F13">',
            '<meta name="theme-color" content="#0F0F13">\\n<meta name="theme-color" content="#0F0F13">',
            1,
        )
        with self.assertRaisesRegex(ValueError, "duplicate metadata tags"):
            validate_html(duplicate_meta, self.spec["meta"]["viewport"])

        duplicate_body = document.replace("</body>", "</body></body>", 1)
        with self.assertRaisesRegex(ValueError, "exactly one <body>"):
            validate_html(duplicate_body, self.spec["meta"]["viewport"])

    def test_scene_initialization_precedes_first_draw(self) -> None:
        runtime = (TEMPLATE_DIR / "runtime.js").read_text(encoding="utf-8")
        self.assertIn("let sceneInitialized = false;", runtime)
        self.assertIn("if (!sceneInitialized || cssWidth <= 0 || cssHeight <= 0) return;", runtime)
        self.assertLess(runtime.index("scene.init({"), runtime.index("sceneInitialized = true;"))
        self.assertLess(runtime.index("sceneInitialized = true;"), runtime.index("resizeCanvas();", runtime.index("sceneInitialized = true;")))

    def test_mobile_modal_backdrop_respects_reserved_right_zone(self) -> None:
        css = (TEMPLATE_DIR / "app.css").read_text(encoding="utf-8")
        self.assertIn(
            "right: calc(var(--right-reserved) + env(safe-area-inset-right, 0px));",
            css,
        )
        self.assertIn("@media (min-width: {{BREAKPOINT_PX}}px)", css)
        self.assertIn("  .modal-backdrop {\n    right: 0;", css)

    def test_keyboard_shortcuts_do_not_leak_from_modal(self) -> None:
        runtime = (TEMPLATE_DIR / "runtime.js").read_text(encoding="utf-8")
        self.assertIn("if (modalIsOpen) {", runtime)
        self.assertIn("elements.appRoot.inert = true;", runtime)
        self.assertIn("elements.appRoot.inert = false;", runtime)
        self.assertIn('target.closest("button, a, [role=\'button\'], [role=\'slider\'], [role=\'switch\']")', runtime)
        self.assertIn("function isInteractiveTarget(target)", runtime)

    def test_spec_is_valid_json(self) -> None:
        parsed = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
        self.assertEqual(parsed["version"], 1)


if __name__ == "__main__":
    unittest.main()
