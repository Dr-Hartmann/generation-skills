# AGENT.md — Repository Architecture and Agent Instructions

## 1. Project Purpose

**generation-skills** is a collection of subject-matter briefs, specifications, and tools for creating interactive HTML mini-apps that accompany short educational and explanatory videos.

The core idea is to turn a topic into a compact sequence of visual states. A learner sees a Canvas visualization synchronized with a short subtitle and can explore the sequence automatically or step by step.

Subject briefs live in **Tasks/**. Current topics include software development, web development, databases, artificial intelligence and machine learning, data science, computer networks, cybersecurity, mobile development, game development, robotics, and safety-related topics.

The deliverable is an **interactive HTML application, not a video file**. This repository does not edit footage, encode MP4 files, or publish videos. The generated application runs directly in a browser and can complement a vertical short-form video.

The primary engineering goal is to separate topic-specific content from shared application infrastructure. The author or AI agent decides **what to explain**; the generator determines **how the application is structured and operated**.

## 2. Architectural Principles

1. **One canonical parameter source.** Document, layout, color, typography, timing, and validation parameters are defined in **app-generator/config/app-spec.json**.
2. **One shared application shell.** The HTML document, CSS, controls, and standard JavaScript runtime are produced from **app-generator/templates/**. A topic scene must not reimplement them.
3. **Separate content from behavior.** **scene.json** contains the title, description, ordered steps, and subtitles. **scene.js** draws the topic-specific Canvas scene. The generator runtime owns playback and application behavior.
4. **One final artifact.** Generation produces one standalone HTML file with embedded CSS and JavaScript.
5. **Validated output.** Input data is checked before generation; generated HTML is validated afterward; generator tests are maintained in the repository.
6. **No competing legacy implementation.** Archived examples are references only. Deprecated fragment-based components must not be used for new applications.

The shared document structure, styles, and runtime are deterministic for a given configuration and input. Topic content and scene rendering naturally vary by task.

## 3. Repository Map and Component Responsibilities

### Root-level agent documentation

| File                                      | Responsibility                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| **AGENT.md**                              | Project architecture, boundaries, contracts, source-of-truth rules, and agent workflow. |
| **README.md**                             | Entry point and required order of work.                                                 |
| **00_parameter-registry.md**              | Index of parameter IDs and their canonical JSON keys; it stores no duplicate values.    |
| **01_app-format-spec.md**                 | Output format, metadata, and self-containment requirements.                             |
| **02_layout-and-safe-areas.md**           | Layout responsibilities and constraints for the topic scene.                            |
| **03_visual-system.md**                   | Use of the shared visual system in Canvas rendering.                                    |
| **04_animation-and-playback.md**          | Runtime playback behavior and the scene animation contract.                             |
| **05_subtitles.md**                       | Subtitle data model, language, length, and synchronization.                             |
| **06_interface-controls-and-settings.md** | Shared controls, settings dialog, accessibility, and keyboard behavior.                 |
| **07_scene-code-architecture.md**         | Technical contract and boundaries for scene.js.                                         |
| **08_validation-and-acceptance.md**       | Generation, validation, browser checks, and acceptance criteria.                        |

### Subject briefs — Tasks/

Files in **Tasks/** define the subject matter to be explained. They are content requirements, not a place to define HTML, CSS, controls, keyboard handlers, or shared application logic.

When creating an application:

- Use the relevant task brief as the scope boundary when one exists.
- Select material that can be explained accurately in a short sequence of visual steps.
- Preserve important definitions, causal relationships, and safety conditions.
- Do not compress an entire subject brief into one screen or subtitle.
- Do not invent facts merely to make a scene more dramatic.
- Follow the output language configured in app-spec.json. The current configuration sets the application language to Russian; the English language of these agent instructions does not change the generated application's language.

### Generator — app-generator/

| Path                        | Responsibility                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **config/app-spec.json**    | Canonical configuration for document metadata, layout, palette, typography, animation, subtitles, and test viewports. |
| **templates/document.html** | Shared HTML document, metadata, DOM structure, and integration points.                                                |
| **templates/app.css**       | Shared visual system, responsive layout, safe areas, controls, and settings styles.                                   |
| **templates/runtime.js**    | Application state, Canvas lifecycle, AUTO/STEP, transitions, subtitles, settings, keyboard handling, and resizing.    |
| **scripts/generate_app.py** | Builds the standalone HTML from the specification, scene inputs, and templates.                                       |
| **scripts/validate_app.py** | Validates a generated HTML file.                                                                                      |
| **examples/**               | Minimal reference input for the current scene contract.                                                               |
| **tests/**                  | Regression tests for the generator and shared templates.                                                              |
| **README.md and SKILL.md**  | Generator usage, scene API, and agent-facing instructions.                                                            |

### Archived and deprecated material

- **Done (don't touch)/** contains historical HTML examples. Treat it as read-only unless the user explicitly requests an archive update. When an update is explicitly requested, regenerate each requested file through app-generator, preserve its filename and topic content, and validate the result. Never hand-edit generated HTML or copy shared implementation from the archive.
- Clearly label any future archive or legacy component so it cannot be mistaken for a canonical implementation.

## 4. Application Creation Flow

```text
Tasks/<topic>.md
       |
       v
Subject analysis and content outline
       |
       +-------------------------------+
       |                               |
       v                               v
scene.json                         scene.js
(steps and subtitles)              (Canvas drawing)
       |                               |
       +---------------+---------------+
                       |
                       v
             app-generator/scripts/
                 generate_app.py
                       |
         app-spec.json + templates/
                       |
                       v
              dist/<app>.html
                       |
                       v
             validate_app.py
                       |
                       v
           Browser verification
                       |
                       v
                 Delivery
```

Do not manually assemble the shared interface during generation. If two generated applications differ in metadata, DOM structure, standard controls, or standard runtime behavior, fix the generator or its canonical configuration—not the individual output files.

## 5. Topic Scene Contract

### scene.json

The input must contain:

- **title** — a non-empty string of at most 120 characters.
- **description** — a string of at most 300 characters; it may be empty or omitted.
- **steps** — an ordered array containing the configured number of step objects.
- **steps[].subtitle** — one non-empty subtitle string for each step.

The generator validates the step count and maximum subtitle word count using app-spec.json. The current configuration requires 6–10 steps and allows at most 12 whitespace-separated words per subtitle. These are current configuration values, not values to duplicate in other documents.

A step may also contain topic-specific data needed by scene.js. The runtime passes the complete current step object to the scene as frame.step. Keep subtitle text in scene.json; do not maintain a second subtitle array in JavaScript.

Each subtitle should express one complete idea and match the visual state shown for that step.

### scene.js

The required public API is:

```js
window.AppScene = {
  draw(ctx, frame) {
    // Draw the supplied frame synchronously.
  },
};
```

The runtime supplies frame with:

- **stepIndex** — zero-based index of the logical step being drawn.
- **step** — complete data object for that step, including its subtitle.
- **width**, **height** — Canvas dimensions in CSS pixels.
- **elapsedMs** — elapsed animation time, scaled by the selected playback speed.
- **deltaMs** — time elapsed between runtime frames, before playback-speed scaling.
- **transitionProgress** — transition progress from 0 to 1.
- **speed** — selected playback-speed multiplier.
- **videoMode** — whether the 9:16 portrait-frame mode is enabled.
- **palette** — canonical color tokens from app-spec.json.
- **fit** — configured visualization fitting rule.

Optional scene methods:

- **init(api)** — initialize topic-specific scene state after the DOM and Canvas have been prepared and measured.
- **resize(viewport)** — respond to a visualization size change. The viewport object contains width, height, and pixelRatio.
- **reset()** — clear or reset topic-specific scene state when the application is reset.

The runtime calls init before the first draw. It then calls resize with the initial measured viewport before rendering. Subsequent size changes also invoke resize before the next draw.

The init API exposes the initial width and height, the steps array, and the shared methods setMode, setPlaying, setSpeed, setVideoMode, nextStep, and reset. Use these methods only when topic-specific initialization genuinely needs to invoke shared application controls.

### Scene responsibilities and restrictions

The topic scene is responsible only for topic-specific Canvas rendering and optional topic-specific visual state. It must not:

- Create or modify html, head, body, document metadata, or shared DOM.
- Create its own Play/Pause, settings, AUTO/STEP, Reset, subtitles, or step indicators.
- Register global keyboard handlers for application controls.
- Create its own requestAnimationFrame loop, playback timer, step counter, or playback state machine.
- Change Canvas dimensions, CSS geometry, or application safe areas.
- Load required local resources through fetch, XHR, or dynamic import.
- Inject topic data into the DOM through innerHTML.

draw(ctx, frame) must be synchronous. It should be deterministic for the same frame values and should not mutate frame or shared runtime state. Canvas context state should be scoped with save/restore where appropriate.

## 6. Source of Truth and Conflict Resolution

Use this authority order:

1. **app-generator/config/app-spec.json** — canonical parameter values and configuration.
2. **app-generator/templates/** — canonical shared document, CSS, and runtime implementation.
3. **app-generator/scripts/** — canonical generation and validation behavior.
4. **Root specifications 01–08** — documented requirements and scene contracts; keep them synchronized with the implementation.
5. **Tasks/** — topic-specific content requirements.
6. **Examples and Done (don't touch)/** — non-normative references only.

**00_parameter-registry.md** is an index of parameter identifiers and JSON keys, not a second configuration file.

When a shared parameter or behavior must change:

1. Identify whether the requirement belongs to configuration, shared implementation, generation/validation, or topic content.
2. Update app-spec.json when a canonical parameter changes.
3. Update the relevant template or script when shared implementation changes.
4. Update affected root specifications and this file when a documented contract changes.
5. Add or update regression tests for code behavior.
6. Run the available tests, generate the example, and validate the output.

Never resolve a shared implementation conflict by hand-editing a generated HTML file.

## 7. Build and Verification

Run commands from the repository root.

Generate the example application:

```bash
python app-generator/scripts/generate_app.py \
  --config app-generator/examples/scene.json \
  --scene app-generator/examples/scene.js \
  --output dist/example.html
```

The generator refuses to overwrite an existing output by default. Use **--force** only when replacement is intentional and authorized.

Validate the generated file and run the unit tests:

```bash
python app-generator/scripts/validate_app.py dist/example.html
python -m unittest discover -s app-generator/tests -v
```

The GitHub Actions workflow is **.github/workflows/app-generator-tests.yml**. It runs generator tests, builds the example, and validates the generated HTML when its configured path filters match. A documentation-only change does not necessarily trigger that workflow.

After automated checks, verify the generated file in a browser when browser testing is available:

- Mobile layout, including the empty right and bottom reserved areas.
- Desktop two-column layout.
- Portrait-frame mode.
- Scene lifecycle order: init, resize, then draw.
- AUTO, STEP, transitions, Play/Pause, and Reset.
- Preservation of the selected speed and portrait mode after Reset.
- Settings dialog, focus handling, Escape, and keyboard shortcuts.
- No browser-console errors that interfere with operation.

Take test dimensions and parameter values from app-spec.json. Do not report a test as passed unless it was actually run.

## 8. Rules for AI-Agent Changes

Before changing the repository:

1. Read this file and the root README.md.
2. Read app-generator/SKILL.md before creating or modifying an HTML mini-app.
3. Classify the task as topic content, generator implementation, shared specification, or archive maintenance.
4. Locate the canonical source before editing; do not infer current behavior from a random archived HTML file.
5. Inspect related templates, runtime code, tests, and documentation.

When making changes:

1. Prefer fixing a shared cause over adding a local workaround.
2. Update implementation, tests, and documentation together when a contract changes.
3. Run the checks available in the current environment and report exactly which checks ran.
4. Keep Done (don't touch)/ unchanged unless the user explicitly requests an archive update. If requested, regenerate and validate the affected files through app-generator.
5. Do not remove legacy files until their role as compatibility pointers has been checked.
6. Work on a dedicated branch. Do not make unrequested changes directly on main.
7. In the final report, list the changed components, checks performed, and any known limitations.

## 9. Project Non-Goals

Do not turn this repository into:

- A general-purpose multi-page website builder.
- A full game engine or game-development environment.
- A video editor or MP4 rendering service.
- A backend platform that requires a server, database, or user accounts.
- A collection of interchangeable HTML/CSS fragments that agents manually assemble.

New capabilities are appropriate when they support the central goal: producing consistent, self-contained interactive explanations for subject topics without duplicating shared infrastructure.
