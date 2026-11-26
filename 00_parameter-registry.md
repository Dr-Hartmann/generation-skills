# Parameter Registry

This file is an index of parameter identifiers. Canonical values are stored only in **app-generator/config/app-spec.json**. Do not add duplicate numeric, color, dimension, or timing values here.

| ID | Parameter | Canonical source |
|---|---|---|
| FMT-01 | Output format | app-generator/scripts/generate_app.py |
| FMT-02 | Viewport meta tag | meta.viewport |
| FMT-03 | External dependencies | app-generator/scripts/generate_app.py |
| VIEW-01 | Root document height | layout.root_height_fallback, layout.root_height_dynamic |
| VIEW-02 | Document overflow | layout.page_overflow; internal settings-dialog scrolling |
| LAY-01 | Responsive breakpoint | layout.breakpoint_px |
| LAY-02 | Mobile right reserved area | layout.right_reserved_px |
| LAY-03 | Mobile left inset | layout.left_padding_px |
| LAY-04 | Header top inset | layout.header_top_padding_px |
| LAY-05 | Bottom reserved area | layout.bottom_reserved_vh |
| LAY-06 | Desktop sidebar width | layout.desktop_sidebar_width |
| LAY-07 | Portrait-frame aspect ratio | layout.portrait_aspect_ratio |
| LAY-08 | Subtitle-to-controls gap | layout.subtitle_to_controls_gap_px |
| LAY-09 | Visualization fitting rule | layout.visualization_fit |
| UI-01 | Minimum touch target | controls.min_touch_target_px |
| UI-02 | Maximum settings-dialog height | controls.settings_max_height_dvh |
| VIS-01 | Main background | palette.background |
| VIS-02 | Panel background | palette.panel |
| VIS-03 | Primary accent | palette.accent |
| VIS-04 | Secondary accent | palette.accent_dark |
| VIS-05 | Primary text | palette.text |
| VIS-06 | Secondary text | palette.muted_text |
| VIS-07 | Font family | typography.font_family |
| VIS-08 | Heading weight | typography.heading_weight |
| ANI-01 | Automatic-start delay | animation.auto_start_delay_ms |
| ANI-02 | Target rendering rate | animation.target_fps |
| ANI-03 | Playback speeds | animation.speeds |
| ANI-04 | Settings-dialog entry scale | animation.settings_entry_scale |
| ANI-05 | AUTO step interval | animation.auto_step_interval_ms |
| ANI-06 | Step-transition duration | animation.step_transition_ms |
| ANI-07 | Subtitle transition duration | animation.subtitle_transition_ms |
| SUB-01 | Number of steps and subtitles | subtitles.min_steps, subtitles.max_steps |
| SUB-02 | Maximum subtitle length | subtitles.max_words |
| SUB-03 | Subtitle font size | typography.subtitle_size |
| SUB-04 | Subtitle background | palette.subtitle_background |
| SUB-05 | Subtitle backdrop blur | subtitles.background_blur_px |
| TEST-01 | Compact phone viewport | test_viewports.compact_phone |
| TEST-02 | Tablet / breakpoint viewport | test_viewports.tablet_breakpoint |
| TEST-03 | Desktop viewport | test_viewports.desktop |

## Rules

- Change canonical parameter values only in app-spec.json.
- Parameter identifiers are stable references used by the other specifications.
- Shared components and styles are implemented in app-generator/templates/.
- Do not create a second palette, configuration file, or copy of shared UI components.
