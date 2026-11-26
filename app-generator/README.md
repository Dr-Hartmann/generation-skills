# App Generator

A deterministic generator for standalone HTML mini-apps. It provides the shared document, metadata, interface, CSS, responsive layout, settings dialog, controls, keyboard handling, and animation runtime.

## Requirements

- Python 3.10 or later.
- No third-party Python packages.
- A browser with Canvas 2D and requestAnimationFrame support. ResizeObserver is used when available, with window resize handling as a fallback.

## Input Files

The agent supplies only two topic-specific files:

- **scene.json** — title, description, and an ordered array of steps with subtitles.
- **scene.js** — the window.AppScene object with a synchronous draw(ctx, frame) method.

A minimal input example is in **examples/**.

The generator embeds scene.js as a classic inline script. Do not use ES module import/export statements or a closing </script> tag in the scene source. Do not create html, head, body, meta, style, or script elements, shared controls, or keyboard handlers in the scene.

## Generation

Run from the repository root:

```bash
python app-generator/scripts/generate_app.py \
  --config app-generator/examples/scene.json \
  --scene app-generator/examples/scene.js \
  --output dist/example.html
```

The generator creates the output directory as needed. It refuses to overwrite an existing file unless **--force** is supplied.

Validate the generated output:

```bash
python app-generator/scripts/validate_app.py dist/example.html
```

The result is one HTML file with embedded CSS and JavaScript. It opens directly in a browser; no local server, bundler, or additional local assets are required.

## Scene API

```js
window.AppScene = {
  draw(ctx, frame) {
    // Render the current logical step.
  },
};
```

The frame object contains:

- **stepIndex** — zero-based index of the step being drawn.
- **step** — complete data object for the current step.
- **width**, **height** — Canvas dimensions in CSS pixels.
- **elapsedMs**, **deltaMs** — runtime animation time and frame delta.
- **transitionProgress** — transition progress from 0 to 1.
- **speed**, **videoMode** — current playback and display settings.
- **palette** — canonical colors from app-spec.json.
- **fit** — configured visualization fitting rule.

The draw function must be synchronous. It must not control the shared timer, steps, subtitles, Canvas dimensions, or DOM controls. Scale the visualization using width and height, preserve important proportions, and respect fit. Do not create a separate requestAnimationFrame loop.

Optional methods:

- **init(api)** — called once after the DOM and Canvas have been measured. The API provides width, height, steps, setMode, setPlaying, setSpeed, setVideoMode, nextStep, and reset.
- **resize(viewport)** — called after initialization when the visualization size changes. The object provides width, height, and pixelRatio.
- **reset()** — called when the shared Reset action is invoked.

The runtime calls init before the first scene draw. It then calls resize with the initial viewport. On later size changes, resize is called before the next draw.

## What the Generator Owns

The only canonical parameter source is **config/app-spec.json**. The document template, CSS template, and runtime use this specification. The generator creates the complete viewport meta element, metadata, DOM structure, CSS, and standard JavaScript runtime.

Input validation checks the title and description, configured number of steps, subtitle length, and scene API shape. Output validation checks the document structure, required elements, unique IDs, metadata, embedded CSS/JavaScript, external assets, and viewport meta element.

Do not edit generated HTML manually. Change scene inputs or canonical templates and generate the file again.
