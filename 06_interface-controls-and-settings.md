# Interface, Controls, and Settings

## Shared Interface Ownership

The shared interface is implemented by:

- **app-generator/templates/document.html** — document structure and interface elements.
- **app-generator/templates/app.css** — layout, visual states, and responsive styling.
- **app-generator/templates/runtime.js** — control behavior, state synchronization, and keyboard handling.

The generator owns the application title, Canvas area, HTML subtitles, control bar, Play/Pause button, settings button, settings dialog, AUTO/STEP selector, next-step button, playback-speed selector, portrait-frame toggle, Reset button, and current-step indicator.

Do not create, duplicate, or override any of these elements in scene.js. Do not add custom global CSS, DOM controls, modal dialogs, or keyboard handlers for shared application behavior.

## Settings Dialog and Accessibility

The settings dialog is managed by the runtime. Its supported behavior includes:

- Opening and closing through the settings and close buttons.
- Closing when the user clicks the backdrop outside the dialog.
- Closing with Escape.
- Confining Tab navigation to the dialog while it is open.
- Making the application root inert while the dialog is open.
- Restoring focus to the element that opened the dialog.
- Keeping accessible names, dialog semantics, expanded state, and pressed state synchronized.

Do not implement a second focus manager or modal lifecycle inside the topic scene.

## Keyboard Shortcuts

The current runtime enables the application shortcuts only at desktop viewport widths, using the breakpoint configured in app-spec.json. Shortcuts are ignored while the user is interacting with an editable or interactive element. While the settings dialog is open, application shortcuts are suppressed; Escape closes the dialog and Tab navigation remains available.

| Key | Behavior |
|---|---|
| Space | Show or hide the control bar. It does not pause or resume playback. |
| Right Arrow | Advance one step in STEP mode when no transition is active and another step is available. |
| R | Reset the sequence. |
| S | Toggle between AUTO and STEP. |
| V | Toggle portrait-frame mode. |
| Escape | Close the settings dialog when it is open. |

Do not assume these shortcuts are available on mobile layouts. Do not reimplement their behavior in scene.js.

## Canonical Parameters

Interface dimensions, colors, typography, animation, responsive breakpoints, and touch-target sizes are configured in **app-generator/config/app-spec.json** and implemented by the generator templates.

If the interface must change, update the canonical configuration or shared templates, add or update regression tests, and synchronize this document. Never patch one generated HTML file to change shared interface behavior.
