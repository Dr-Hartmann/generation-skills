# Animation, Playback, and Modes

## Runtime Responsibilities

The shared application runtime is implemented in **app-generator/templates/runtime.js**. It owns playback state, the current step, transitions, playback speed, AUTO/STEP behavior, Play/Pause, Reset, subtitle synchronization, and the requestAnimationFrame loop.

Do not implement these mechanisms in scene.js. Do not create independent transition timers, step counters, playback state machines, or requestAnimationFrame loops.

Canonical timing parameters are defined in **app-generator/config/app-spec.json**:

- **ANI-01** — automatic-start delay.
- **ANI-02** — target rendering rate.
- **ANI-03** — available playback speeds.
- **ANI-04** — settings-dialog entry scale.
- **ANI-05** — automatic step interval.
- **ANI-06** — transition duration.
- **ANI-07** — subtitle transition duration.

## Frame Contract

The runtime calls AppScene.draw(ctx, frame) on each animation frame. The frame object contains:

- **stepIndex** — zero-based index of the logical step being drawn.
- **step** — current step data from scene.json.
- **width**, **height** — available Canvas dimensions in CSS pixels.
- **elapsedMs** — playback time accumulated using the selected speed.
- **deltaMs** — elapsed time between runtime frames, before speed scaling.
- **transitionProgress** — transition progress from 0 to 1.
- **speed** — current playback-speed multiplier.
- **videoMode** — whether portrait-frame mode is enabled.
- **palette** — canonical color tokens.
- **fit** — configured visualization fitting rule.

Render only the state supplied by the runtime. draw must be synchronous and must not change the logical step, switch playback modes, or control playback.

## AUTO Mode

In AUTO mode, the runtime advances through the steps in order after each configured interval. It transitions from the last step back to the first, creating a continuous loop. The configured playback speed affects the passage of animation time and transition timing.

## STEP Mode

In STEP mode, the runtime waits for an explicit request to advance. One request starts one transition to the next step. Additional requests are ignored while that transition is in progress. Once the transition completes, playback pauses again.

The next-step control is disabled at the final step. There is no automatic wraparound in STEP mode.

When switching from AUTO to STEP during an active transition, the runtime completes that transition immediately by selecting its destination step, then enters STEP mode in the paused state. Switching from STEP to AUTO starts automatic playback without resetting the current step.

## Play/Pause, Speed, and Reset

The Play/Pause control starts or pauses runtime playback. Pausing also freezes progress through an active transition.

Changing speed changes the rate at which animation time advances. It does not change the number or content of steps.

Reset returns the sequence to the first step, restores the configured default playback mode, starts playback, clears transition timing, and invokes scene.reset() when that optional method exists. Reset preserves the selected playback speed and portrait-frame setting.

The runtime synchronizes the step indicator and HTML subtitle with the current logical step. Do not update either one from scene.js.

## Scene Animation Requirements

A scene may use frame.elapsedMs and frame.transitionProgress to animate objects in sync with the runtime. Do not start an independent animation loop.

The same frame values should produce the same rendered state. Any time-dependent visual movement must derive from values supplied in frame.
