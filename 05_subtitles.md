# Subtitles and Visualization Synchronization

## Source Data

Subtitles are stored directly in the scene.json input. Each step must contain exactly one subtitle string.

~~~json
{
  "title": "Example topic",
  "description": "A concise description of the topic.",
  "steps": [
    { "subtitle": "First subtitle." },
    { "subtitle": "Second subtitle." }
  ]
}
~~~

Do not create a separate HTML subtitle array, subtitle DOM elements, text segments, or an independent synchronization mechanism.

## Count, Language, and Content

The number of steps and subtitles must satisfy **SUB-01**. Every step must contain one non-empty subtitle no longer than **SUB-02** words.

Write subtitles in the language configured by app-spec.json. The current configuration sets that language to Russian.

Each subtitle must:

- Express one complete idea.
- Match the logical visualization state for that step.
- Avoid repeating the topic title verbatim.
- Avoid HTML markup or presentation instructions.
- Remain concise and understandable without relying on a previous subtitle.

Step numbers must not be hard-coded in the content. The order of objects in the steps array defines the sequence.

## Synchronization

The generator displays the subtitle for the current logical step, updates the step indicator, and synchronizes the displayed text with transition completion.

Do not update subtitles manually or keep a duplicate copy in the scene's JavaScript state.

Use frame.step and frame.stepIndex in AppScene.draw(ctx, frame) so that the visualization corresponds to the current subtitle.

## Styling

Subtitle font size, background, blur, entry animation, and placement are controlled by app-spec.json and the generator CSS template.

Do not create CSS classes, DOM elements, or Canvas text to replace the system subtitles. Text that is genuinely part of an illustration is allowed, but it must not duplicate the HTML subtitle.
