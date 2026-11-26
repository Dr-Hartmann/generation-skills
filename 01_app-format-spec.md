# Application Format and Final Output

## Required Output

Create one standalone HTML file using app-generator. Do not assemble the shared document manually.

The generator creates the document structure, metadata, styles, controls, settings dialog, keyboard handling, Canvas setup, and playback runtime. The agent supplies only:

- scene.json: title, description, steps, and subtitles;
- scene.js: the scene drawing API.

## Document Metadata

The generator emits the complete viewport element from meta.viewport in app-generator/config/app-spec.json. It must be a meta element with name="viewport" and the exact configured content value.

Do not create a second viewport meta element or write an incomplete meta element with only a content attribute.

The generator also emits UTF-8 charset, theme-color, description, color-scheme, and the document title. Do not duplicate or override these tags in scene.js.

## Self-Containment

The generated application must open directly from a local HTML file.

- Do not require a local server, bundler, npm, or pre-compilation.
- Do not load required local data via fetch, XHR, or dynamic import.
- Do not rely on server-side APIs.
- Keep all scene data and rendering logic inside the generated document.
- Do not reference external CSS or JavaScript files.

The current generator intentionally emits no external dependencies. If a task appears to require one, first reconsider whether a native browser API is sufficient. Do not bypass the generator by adding external files manually.

## Scene Contract

The scene is defined by window.AppScene.draw(ctx, frame). Use only the API documented in app-generator/README.md. Do not implement a second DOM, control system, settings dialog, keyboard handler, resize loop, or requestAnimationFrame loop.

## Final Delivery

Deliver the generated HTML file. Do not hand-edit generated HTML after validation; update scene inputs or canonical templates and regenerate.
