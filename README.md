# Interactive Mini-App Specifications for Short-Form Video

## Purpose

This repository defines the requirements and tools for interactive HTML mini-apps that accompany short educational and explanatory videos. The deliverable is one standalone HTML file that opens directly in a browser.

## Required Workflow

1. Read **AGENT.md** for the project architecture, component boundaries, and agent rules.
2. Read **app-generator/SKILL.md** before creating or modifying an application.
3. Read the relevant brief in **Tasks/** when one exists. Treat it as subject-matter input, not as an implementation specification.
4. Use **app-generator/config/app-spec.json** as the only source of canonical parameter values.
5. Consult **00_parameter-registry.md** and the relevant specifications **01–08**.
6. Create only the topic inputs: **scene.json** and **scene.js**.
7. Generate the application using the command in **app-generator/README.md**.
8. Run the generated-file validator and the available unit tests.
9. Verify the result in a browser when possible, then deliver the generated HTML file.

Do not manually create the shared HTML structure, metadata, CSS, controls, settings dialog, keyboard handlers, or animation loop.

## Root Specifications

| File | Scope |
|---|---|
| [AGENT.md](AGENT.md) | Architecture and mandatory agent workflow |
| [00_parameter-registry.md](00_parameter-registry.md) | Parameter IDs and canonical configuration keys |
| [01_app-format-spec.md](01_app-format-spec.md) | Output format and standalone-document requirements |
| [02_layout-and-safe-areas.md](02_layout-and-safe-areas.md) | Responsive layout and reserved areas |
| [03_visual-system.md](03_visual-system.md) | Shared palette and Canvas visual rules |
| [04_animation-and-playback.md](04_animation-and-playback.md) | Playback modes and animation contract |
| [05_subtitles.md](05_subtitles.md) | Subtitle content and synchronization |
| [06_interface-controls-and-settings.md](06_interface-controls-and-settings.md) | Shared interface, controls, settings, and keyboard behavior |
| [07_scene-code-architecture.md](07_scene-code-architecture.md) | Topic-specific JavaScript scene API |
| [08_validation-and-acceptance.md](08_validation-and-acceptance.md) | Validation and acceptance criteria |

## Canonical Configuration and Implementation

**app-generator/config/app-spec.json** stores canonical values for:

- Document language and viewport metadata.
- Responsive layout and reserved safe areas.
- Minimum control target size and settings-dialog height.
- Palette and typography.
- Playback timing and speed options.
- Step count and subtitle-length limits.
- Test viewport dimensions and default behavior.

The templates in **app-generator/templates/** implement the shared document, styles, and runtime. **app-generator/scripts/generate_app.py** produces the standalone HTML file. **app-generator/scripts/validate_app.py** validates the generated output.

**00_parameter-registry.md** is an index of parameter IDs and their JSON keys. It is not an independent source of values.

## Requirement Priority

1. **app-spec.json** — canonical configuration values.
2. **app-generator/templates/** and **app-generator/scripts/** — shared implementation and generation behavior.
3. **Specifications 01–08** — documented requirements for the output and topic scene.
4. **Tasks/** — subject-matter requirements for each task.
5. **Examples and Done (don't touch)/** — reference material only.

Practical consequences:

- The mobile right and bottom reserved areas must remain free of application content.
- Portrait mode does not remove the reserved-area requirements.
- Subtitles and controls must remain inside the application's available area.
- Decorative effects never take priority over layout, readability, or safety requirements.

## Terminology

- **Main screen** — the application screen when the settings dialog is closed.
- **Canvas** — the topic visualization area.
- **Step** — one logical visualization state with one corresponding subtitle.
- **AUTO** — continuous automatic playback through the steps.
- **STEP** — user-controlled progression through the steps.
- **Reserved safe areas** — areas intentionally left free for social-platform overlays.
- **Portrait-frame mode** — visualization mode using the aspect ratio configured in app-spec.json.

## Avoid Divergent Implementations

Do not copy shared markup or styles from **Done (don't touch)/**, the deprecated **short-video-ui-kit/**, or standalone archived HTML files. Use **app-generator/** for every new application.

When a canonical parameter changes, update app-spec.json and the relevant templates. When implementation behavior changes, update the relevant tests and root documentation. Regenerate and validate the example output after generator changes.
