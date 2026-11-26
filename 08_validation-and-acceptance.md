# Validation and Acceptance Criteria

## Mandatory Generation and Validation

Every application must be built through app-generator. Do not submit or validate manually assembled HTML.

Run the generator from the repository root:

~~~bash
python app-generator/scripts/generate_app.py \
  --config <path-to-scene.json> \
  --scene <path-to-scene.js> \
  --output <path-to-application.html>
~~~

Validate the generated file:

~~~bash
python app-generator/scripts/validate_app.py <path-to-application.html>
~~~

If generation or validation fails, fix the input data or canonical template first. Do not disable the validator or manually edit the generated HTML.

Run the generator unit tests when the environment supports Python:

~~~bash
python -m unittest discover -s app-generator/tests -v
~~~

## Viewport Checks

Verify the application at **TEST-01**, **TEST-02**, and **TEST-03** from **app-generator/config/app-spec.json**.

At each viewport, check:

- The main document does not scroll.
- The title, Canvas, subtitles, and controls are not clipped.
- Visualization proportions are preserved.
- Neighboring elements do not overlap.
- Resizing and device-orientation changes update the layout correctly.
- Text remains readable and active states remain visible.

## Mobile Layout

On the mobile layout, verify:

- The vertical order is title, Canvas, subtitles, then controls.
- The right reserved area defined by LAY-02 contains no application content.
- The bottom reserved area defined by LAY-05 remains empty.
- Device safe-area insets are respected.
- The subtitle-to-controls spacing follows LAY-08.
- No sidebar, decorative element, or modal backdrop intrudes into a reserved area.

In portrait-frame mode, verify that the frame, subtitles, and controls fit within the available area while reserved safe areas remain empty.

## Desktop Layout

On the desktop layout, verify:

- The two-column layout is present.
- The Canvas is on the left and the sidebar on the right, using LAY-06.
- Subtitles appear in the sidebar in the standard desktop mode.
- Hover and focus-visible states are visible.
- Keyboard shortcuts work only in their supported desktop context.

## Functional Scenarios

### AUTO

1. Open the generated HTML file.
2. Verify that automatic playback starts after the configured ANI-01 delay.
3. Verify automatic progression through all steps and wraparound from the last step to the first.
4. Confirm that the Canvas, step indicator, and subtitle represent the same logical step.
5. Verify that Play/Pause stops and resumes playback, including an in-progress transition.

### STEP

1. Open settings and select STEP.
2. Verify that the current logical step is preserved.
3. Activate the next-step control.
4. Verify that exactly one transition starts.
5. Verify that additional requests are ignored while the transition is active.
6. Verify that playback pauses when the transition completes.
7. At the final step, verify that the next-step control is disabled and there is no automatic wraparound.

### Settings, Reset, and Keyboard

Verify all playback speeds listed in ANI-03, Reset, portrait-frame mode, and the supported ways of opening and closing the settings dialog.

Verify Space, Right Arrow, R, S, V, and Escape on desktop. Confirm that Space hides only the control bar, that application shortcuts do not interfere with editable or interactive controls, and that Escape closes the settings dialog.

Verify that Reset returns to the first step and the configured default playback mode while preserving the selected speed and portrait-frame setting.

## Acceptance Criteria

An application is ready when:

- The generator completes successfully.
- validate_app.py completes without errors.
- The HTML file opens directly in a browser.
- Required functionality works without a server or build step.
- Responsive layout passes the configured viewport checks.
- Mobile right and bottom reserved areas remain empty.
- AUTO and STEP have distinct and correct behavior.
- Subtitles remain synchronized with logical step changes.
- Play/Pause, Reset, speed selection, portrait-frame mode, and supported shortcuts work.
- The settings dialog supports the documented closing and focus behavior.
- The browser console contains no errors that prevent correct operation.

When the task is to create an interactive application, deliver the generated HTML file. Keep internal implementation comments out of the generated file unless they are necessary for the code itself.
