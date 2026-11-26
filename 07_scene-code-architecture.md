# Scene Code Architecture and Technical Requirements

## Separation of Responsibilities

The app-generator owns the shared runtime, DOM, controls, step state, timers, transitions, settings, Canvas dimensions, keyboard shortcuts, and rendering loop.

For a specific topic, the agent supplies only:

- **scene.json** — title, description, ordered steps, subtitles, and optional topic-specific step data.
- **scene.js** — topic-specific drawing through window.AppScene.

Do not create a second runtime or rewrite the generator's standard features.

## Required Scene API

Define the following API in scene.js:

```js
window.AppScene = {
  draw(ctx, frame) {
    // Draw the current frame synchronously.
  },
};
```

The draw function receives the Canvas 2D context and a frame object. The exact frame properties are documented in **app-generator/README.md** and **AGENT.md**.

The function must:

- Render only the state supplied through frame.
- Avoid mutating frame or shared runtime state.
- Avoid controlling the current step or subtitles.
- Avoid registering DOM event handlers.
- Avoid starting timers or requestAnimationFrame.
- Avoid changing Canvas dimensions or styles.
- Avoid loading required local assets through fetch, XHR, or dynamic import.

The generator embeds scene.js as a classic inline script. Do not use ES module import/export statements or include a closing script tag in the source.

## Optional Scene Methods

The AppScene object may also define:

- **init(api)** — one-time initialization after the DOM and Canvas have been prepared and measured. The API includes width, height, steps, setMode, setPlaying, setSpeed, setVideoMode, nextStep, and reset.
- **resize(viewport)** — notification when the visualization dimensions change. The viewport object contains width, height, and pixelRatio.
- **reset()** — reset topic-specific internal state when the application Reset action is invoked.

These methods must not create competing controls, playback loops, or step models. Use the shared API only when scene-specific initialization requires it.

## Canvas and Coordinates

The generator controls Canvas CSS dimensions, backing-buffer dimensions, devicePixelRatio, and ResizeObserver. The scene receives current width and height in every frame.

Place graphics using coordinates relative to frame.width and frame.height. Preserve proportions and respect frame.fit. Do not calculate the browser window or device dimensions independently.

Use the Canvas context supplied to draw. Avoid retaining the context between frames. Scope temporary context changes with save() and restore() so that rendering state does not leak between drawing operations.

## Reliability and Determinism

The scene should be deterministic for a given frame: identical frame values should produce identical visual output.

Validate the presence of topic-specific data before using it, and guard calculations that could produce invalid coordinates. Do not access undocumented runtime fields.

Fix scene-specific errors in scene.js. Do not conceal them by replacing or duplicating shared runtime behavior.
