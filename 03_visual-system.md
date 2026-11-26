# Visual System and Styling

## Shared Application Interface

The palette, typography, page styling, panels, buttons, subtitles, settings dialog, focus indicators, and control states are defined by **app-generator/config/app-spec.json** and **app-generator/templates/app.css**.

Do not create an alternative palette, CSS theme, or custom styles for the shared application shell. Do not copy UI styling from **Done (don't touch)/** or deprecated components.

## Canvas Graphics

Use the palette passed through frame.palette for topic-specific visualization:

- **background** — main background color.
- **panel** — surface color.
- **accent** — primary accent.
- **accent_dark** — secondary accent.
- **text** — primary text.
- **muted_text** — secondary text.
- Other tokens — use only for their documented purpose in app-spec.json.

Do not duplicate shared theme colors as unrelated literals in scene.js. For derived shades, prefer transparency or other transformations based on the canonical tokens.

## Typography and Readability

The generator controls shared interface typography. Text drawn inside Canvas is part of the topic visualization and must remain legible at mobile and desktop sizes.

Calculate Canvas text sizes relative to frame.width and frame.height. Do not use Canvas text as a replacement for the HTML subtitles, which are rendered separately by the generator.

## Motion and Decorative Effects

Scene animation should be based on the supplied frame values, especially frame.stepIndex, frame.elapsedMs, and frame.transitionProgress. Do not create independent timers or rendering loops.

Add particles, pulses, trails, glow, and other effects only when they help explain the topic or reinforce the meaning of a step. Decorative effects must not obscure important information, reduce readability, or extend beyond the logical Canvas area.

Local glow and other Canvas-only effects are allowed when they preserve the overall palette and do not interfere with comprehension.

## Visual Consistency

Maintain one visual language across steps, playback speeds, modes, and viewport sizes. Styling changes must not alter the logical meaning of a step.

Change shared CSS values only through app-spec.json and app-generator templates. Adapt the scene to the dimensions and state supplied by the runtime.
