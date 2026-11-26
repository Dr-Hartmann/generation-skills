# Layout, Responsiveness, and Reserved Safe Areas

## Generator Responsibilities

The shared HTML layout, document dimensions, mobile and desktop columns, reserved safe areas, portrait-frame mode, subtitles, controls, and Canvas sizing are implemented by app-generator. Do not recreate or override these features in scene.js or topic-specific CSS.

Canonical layout parameters are defined in **app-generator/config/app-spec.json**:

- **LAY-01** — responsive breakpoint.
- **LAY-02** — mobile right reserved area.
- **LAY-03** and **LAY-04** — left and top insets.
- **LAY-05** — bottom reserved area.
- **LAY-06** — desktop sidebar width.
- **LAY-07** — portrait-frame aspect ratio.
- **LAY-08** — subtitle-to-controls gap.
- **LAY-09** — visualization fitting rule.

## Scene Requirements

AppScene.draw(ctx, frame) receives the current visualization dimensions in CSS pixels through frame.width and frame.height. The scene is responsible only for Canvas content.

The scene must:

- Calculate coordinates relative to frame.width and frame.height.
- Preserve the proportions of important visual objects.
- Respect frame.fit and avoid clipping essential content.
- Avoid drawing application UI, HTML subtitles, or controls.
- Avoid changing Canvas dimensions or creating its own resize handlers.
- Avoid adding DOM layers, page backgrounds, or visual content outside the Canvas.

The generator manages devicePixelRatio, the Canvas backing buffer, and resize observation. When the viewport or device orientation changes, the scene receives updated dimensions through its resize(viewport) method and subsequent frame values.

## Reserved Safe Areas

On mobile layouts, the right and bottom reserved areas must remain free of application content. This applies to the entire application, including the settings-dialog backdrop and template decorative effects.

Do not draw Canvas content or place visual elements in these areas. Do not compensate for reserved space by adding ad hoc positioning offsets inside the topic scene.

## Desktop and Portrait-Frame Modes

The generator creates the desktop two-column layout and right sidebar. The scene must not depend on the sidebar position or calculate sidebar dimensions.

When portrait-frame mode is enabled, the generator changes the available visualization area and supplies the updated width and height through frame. Do not create a second 9:16 frame in Canvas or CSS.

## Prohibited Scene Implementations

In scene.js, do not:

- Create a custom ResizeObserver or window resize handler.
- Change canvas.width, canvas.height, Canvas CSS dimensions, or container geometry.
- Create a requestAnimationFrame loop.
- Position subtitles or application controls.
- Draw essential content outside the logical Canvas area.
