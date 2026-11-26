# Application Format and Final Output

## Required Output

Create one standalone HTML file through app-generator. Do not assemble the shared document manually.

The generator creates the document structure, metadata, styles, controls, settings dialog, keyboard handling, Canvas setup, and playback runtime. The agent supplies only:

- **scene.json** — title, description, ordered steps, subtitles, and any topic-specific step data.
- **scene.js** — the topic-specific Canvas drawing API.

## Document Metadata

The generator emits the complete viewport meta element using the exact value configured in **app-generator/config/app-spec.json**. It must have name="viewport" and the configured content value.

Do not create a second viewport meta element or add an incomplete viewport meta element.

The generator also emits the UTF-8 charset, theme color, description, color scheme, document title, and html language attribute. These values are generated from the canonical configuration and scene input. Do not duplicate or override them in scene.js.

## Self-Containment

The generated application must open directly from a local HTML file.

- Do not require a local server, bundler, npm, or pre-compilation.
- Do not load required local data through fetch, XHR, or dynamic import.
- Do not depend on server-side APIs.
- Keep scene data and rendering code inside the generated document.
- Do not reference external CSS or JavaScript files.
- Do not add third-party runtime dependencies.

The current generator intentionally produces a self-contained document. If a task appears to require an external dependency, first determine whether a native browser API can meet the requirement. Do not bypass the generator by manually adding external files.

## Scene Contract

The topic scene is exposed through window.AppScene.draw(ctx, frame). Use only the API documented in **app-generator/README.md** and **07_scene-code-architecture.md**.

Do not implement a second DOM, control system, settings dialog, keyboard handler, resize loop, or requestAnimationFrame loop.

## Final Delivery

Deliver the generated HTML file. Do not hand-edit generated HTML after validation. Change scene inputs or canonical templates and regenerate the file instead.

The output language is controlled by the language setting in app-spec.json. The current repository configuration uses Russian for generated application content; translating the agent documentation does not change that setting.
