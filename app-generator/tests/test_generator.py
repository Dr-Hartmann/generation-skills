from __future__ import annotations

import json
import sys
import unittest
from copy import deepcopy
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from generate_app import SPEC_PATH, build_html, read_json, validate_html, validate_scene_script  # noqa: E402

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

    def test_spec_is_valid_json(self) -> None:
        parsed = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
        self.assertEqual(parsed["version"], 1)


if __name__ == "__main__":
    unittest.main()
