# Interface, Controls, and Settings Modal

## Main Screen

The main screen contains only the following elements:

- topic title;
- visualization area;
- subtitles;
- bottom control bar.

The bottom bar contains only:

- Play/Pause button;
- settings button with a gear icon.

Do not place additional buttons, indicators, switches, or decorative cards on the main screen. Additional features are located in the settings modal.

On a mobile device, the bar is positioned above the bottom safe area. On desktop, it is placed at the bottom of the application area. In portrait frame mode, the controls move inside the frame.

## Settings Modal

The modal opens when the gear button is clicked. It is centered, uses the application's visual style, and dims the background.

The modal closes via:

- the close button;
- clicking the dimmed area outside the modal;
- the `Esc` key;
- clicking the gear button again.

Clicking inside the modal itself must not close it as an outside click.

When opening, use a fade-in and scale from the `ANI-04` value to normal scale. When closing, use the reverse smooth animation.

The modal must not exceed the available height. The height limit is defined by `UI-02`; if the content does not fit, the inner content of the modal scrolls.

## Settings Content

Place the following inside the modal:

1. Title "Settings".
2. Current step indicator "Step X / Y".
3. `AUTO` / `STEP` toggle.
4. "Next Step ▶" button.
5. Speed selector with options from `ANI-03`.
6. Portrait frame mode toggle.
7. `Reset` button.
8. Brief keyboard shortcuts reference.

The "Next Step ▶" button is visually and functionally active only in `STEP` mode, when no transition is in progress and the last step has not been reached. In all other cases, it is disabled.

The speed setting must clearly show the selected value. Do not add other speed values.

## Keyboard Shortcuts

Keyboard shortcuts work on desktop:

| Key     | Action                                             |
| ------- | -------------------------------------------------- |
| `Space` | Hide or show controls.                             |
| `→`     | Go to the next step; executes only in `STEP` mode. |
| `R`     | Perform Reset.                                     |
| `S`     | Toggle `AUTO` / `STEP`.                            |
| `V`     | Enable or disable portrait frame mode.             |
| `Esc`   | Close the settings modal if it is open.            |

When handling keys, do not intercept input when the user is interacting with an editable field. For utility keys that the browser handles by default, prevent the default action only when the application actually handles the corresponding keypress.

Hiding controls must not disable keyboard shortcuts. The title, canvas, and subtitles are not considered controls and must not disappear when pressing `Space`.

## Accessibility and Feedback

Every button must have a clear accessible name (`aria-label` or visible text). For Play/Pause, the name and icon reflect the current action.

Interactive elements must have distinguishable states: default, hover for devices supporting hover, focus-visible, active, and disabled.

The hit area size of each button must comply with `UI-01`. Do not make only a small icon clickable if there is space around it to enlarge the hit area.
