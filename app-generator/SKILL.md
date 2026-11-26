---
name: app-generator
description: Generate one standalone HTML mini-app with Canvas visualization, synchronized subtitles, step-by-step animation, and shared playback settings. Use this skill for every HTML mini-app creation task in this repository.
---

# App Generator

## Mandatory Rule

Use app-generator before creating an HTML mini-app. It is the only supported source of the shared document structure, metadata, styles, responsive layout, controls, settings dialog, keyboard shortcuts, and playback runtime.

The agent must not generate or modify the shared application shell independently. Do not create custom html, head, body, meta, style, or script elements; Play/Pause controls; settings dialogs; application keyboard handlers; timers; or a shared requestAnimationFrame loop.

## Agent Responsibilities

Create only:

1. **scene.json** — title, concise description, and the configured number of steps, each with one subtitle.
2. **scene.js** — window.AppScene with the synchronous draw(ctx, frame) function.

The current app-spec.json configuration requires 6–10 steps and limits each subtitle to 12 whitespace-separated words. Always read the current configuration instead of assuming these values will remain fixed.

Use frame.palette for shared design tokens. Do not create separate output CSS or JavaScript files.

## Workflow

Run from the repository root:

~~~bash
python app-generator/scripts/generate_app.py \
  --config <path-to-scene.json> \
  --scene <path-to-scene.js> \
  --output <path-to-output.html>
~~~

Then validate the result:

~~~bash
python app-generator/scripts/validate_app.py <path-to-output.html>
~~~

Use **--force** only when an existing output file is intentionally being replaced.

## Source Priority

1. **config/app-spec.json** — canonical parameter values and options.
2. **templates/** — shared HTML, CSS, and JavaScript implementation.
3. **scripts/** — generation and validation behavior.
4. **scene.json and scene.js** — content and rendering for the specific topic.

If an old instruction, extracted component, or archived HTML example conflicts with app-generator, follow app-generator and update the affected documentation when appropriate. Do not copy shared code from **Done (don't touch)/** or deprecated UI components.
