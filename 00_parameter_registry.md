# Parameter Registry (Single Source of Truth)

All values are normative. Other files must reference parameter IDs instead of repeating values.

## Format and runtime

| ID     | Parameter          | Normative value                                           | Rule                                             |
| ------ | ------------------ | --------------------------------------------------------- | ------------------------------------------------ |
| FMT-01 | Output files       | One HTML file                                             | Keep all markup, styles, and logic in this file. |
| FMT-02 | Viewport meta tag  | `width=device-width, initial-scale=1, viewport-fit=cover` | Use unchanged.                                   |
| FMT-03 | External libraries | jsDelivr, unpkg, or cdnjs                                 | Include only libraries used by the app.          |

## Viewport and layout

| ID      | Parameter                    | Normative value             | Rule                                                                        |
| ------- | ---------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| VIEW-01 | Root height                  | `100vh`, then `100dvh`      | Declare the fallback first.                                                 |
| VIEW-02 | Page scrolling               | `overflow: hidden`          | Only the settings panel may scroll internally.                              |
| LAY-01  | Responsive breakpoint        | `768px`                     | Mobile below; desktop from this width.                                      |
| LAY-02  | Right mobile exclusion strip | `80px`                      | Render no app content or decoration here; add `env(safe-area-inset-right)`. |
| LAY-03  | Mobile left padding          | `16px`                      | Add `env(safe-area-inset-left)`.                                            |
| LAY-04  | Mobile header top padding    | `16px`                      | Add `env(safe-area-inset-top)`.                                             |
| LAY-05  | Bottom reserved area         | `25vh`                      | Keep the bottom bar above it; add `env(safe-area-inset-bottom)`.            |
| LAY-06  | Desktop sidebar width        | `clamp(320px, 30vw, 380px)` | Right-hand column.                                                          |
| LAY-07  | Portrait frame ratio         | `9:16`                      | Portrait-frame mode.                                                        |
| LAY-08  | Subtitle-to-bar gap          | `24px`                      | Standard mobile layout.                                                     |
| LAY-09  | Visualization fit            | `contain`                   | Show the full visualization without cropping.                               |

## Controls

| ID    | Parameter                 | Normative value | Rule                                 |
| ----- | ------------------------- | --------------- | ------------------------------------ |
| UI-01 | Minimum touch target      | `48px × 48px`   | Hit area, not just the visible icon. |
| UI-02 | Settings panel max height | `90dvh`         | Scroll panel content, not the page.  |

## Color and typography

| ID     | Parameter        | Normative value | Use                                      |
| ------ | ---------------- | --------------- | ---------------------------------------- |
| VIS-01 | App background   | `#0F0F13`       | Main background.                         |
| VIS-02 | Panel background | `#1A1A20`       | Panels and surfaces.                     |
| VIS-03 | Accent           | `#2EAC65`       | Key controls, active states, highlights. |
| VIS-04 | Shadow / glow    | `#1E7A47`       | Shadow and secondary glow.               |
| VIS-05 | Primary text     | `#FFFFFF`       | Headings and body text.                  |
| VIS-06 | Secondary text   | `#A0A0A0`       | Labels and supporting text.              |
| VIS-07 | Font family      | `system-ui`     | Main UI font.                            |
| VIS-08 | Main font weight | `700–800`       | Headings and emphasis.                   |

## Animation and modes

| ID     | Parameter                  | Normative value    | Rule                                                                                                                                              |
| ------ | -------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ANI-01 | Auto-start delay           | `500ms`            | Start after successful initialization.                                                                                                            |
| ANI-02 | Rendering target           | `60 FPS`           | Use `requestAnimationFrame` and timestamps / delta time. Actual callback rate follows the display refresh rate; do not assume fixed frame timing. |
| ANI-03 | Playback speeds            | `0.5×`, `1×`, `2×` | Available speed settings.                                                                                                                         |
| ANI-04 | Settings-panel entry scale | `0.95`             | Animate to the normal scale (`1`).                                                                                                                |
| ANI-05 | AUTO step interval         | `5000ms`           | Wait this long after a transition completes before advancing.                                                                                     |
| ANI-06 | Step transition            | `900ms`            | Crossfade the visualization and interpolated state values.                                                                                        |
| ANI-07 | Subtitle entrance          | `300ms`            | Fade-in and slide-up; do not delay the text update.                                                                                               |

## Subtitles

| ID     | Parameter               | Normative value            | Rule                                                             |
| ------ | ----------------------- | -------------------------- | ---------------------------------------------------------------- |
| SUB-01 | Steps and subtitles     | `6–10`                     | Exactly one subtitle per step.                                   |
| SUB-02 | Maximum subtitle length | `12 words`                 | Count space-separated words.                                     |
| SUB-03 | Subtitle font size      | `clamp(16px, 4.5vw, 22px)` | Mobile layout and portrait-frame mode.                           |
| SUB-04 | Subtitle background     | `#00000080`                | Translucent dark background.                                     |
| SUB-05 | Background blur         | `8px`                      | Use `backdrop-filter: blur(8px)`; retain a translucent fallback. |

## Test viewports

| ID      | Test case           | Size            |
| ------- | ------------------- | --------------- |
| TEST-01 | Compact phone       | `390 × 844px`   |
| TEST-02 | Tablet / breakpoint | `768 × 1024px`  |
| TEST-03 | Desktop             | `1920 × 1080px` |

## Registry rules

- Define each normative value only here; reference its ID elsewhere.
- Split distinct values into separate components or IDs when needed.
- Derive values from CSS variables and container geometry instead of hard-coding them.
- Change values here only; keep IDs stable in other files.

## Resolved layout conflicts

- `LAY-05` is the only bottom reserved area: place the bar above it and subtitles above the bar with the `LAY-08` gap. Do not add legacy bottom margins.
- `LAY-02` overrides full-bleed backgrounds and portrait-frame content. Render no content or effects, including blur, in the reserved strip.
- In portrait-frame mode, place subtitles inside the frame. On desktop, this overrides sidebar placement.

## Compatibility review — 26 November 2026

- `100dvh` accounts for dynamic browser UI; keep `100vh` as a fallback. `viewport-fit=cover` and `env(safe-area-inset-*)` are current viewport mechanisms. [MDN: viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths) · [MDN: `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/env) · [MDN: viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport)
- `requestAnimationFrame` follows the display refresh rate, which may exceed 60 Hz; the `60 FPS` value is a target, not a guaranteed callback rate. [MDN: `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- `48 × 48px` is a conservative design target. WCAG 2.2 AA sets a `24 × 24 CSS px` minimum for pointer targets, subject to exceptions. [W3C: WCAG 2.2, Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- `backdrop-filter` is supported in current major browsers, but older browser versions may lack it; keep the translucent fallback. [MDN: `backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)

**Terminology:** `LAY-02` and `LAY-05` are app-defined reserved areas, not browser safe-area values. The `env(safe-area-inset-*)` variables add the device-specific insets.
