# Parameter Registry

Этот файл — индекс параметров. Нормативные значения хранятся только в app-generator/config/app-spec.json. Не добавляй сюда дублирующие числовые, цветовые, размерные или временные значения.

| ID | Параметр | Нормативный источник |
|---|---|---|
| FMT-01 | Формат результата | app-generator/scripts/generate_app.py |
| FMT-02 | Viewport meta tag | meta.viewport |
| FMT-03 | Внешние зависимости | app-generator/scripts/generate_app.py |
| VIEW-01 | Высота корневого документа | layout.root_height_fallback, layout.root_height_dynamic |
| VIEW-02 | Прокрутка документа | layout.page_overflow; внутренний скролл settings-dialog |
| LAY-01 | Адаптивная граница | layout.breakpoint_px |
| LAY-02 | Правая мобильная безопасная зона | layout.right_reserved_px |
| LAY-03 | Левый мобильный отступ | layout.left_padding_px |
| LAY-04 | Верхний отступ заголовка | layout.header_top_padding_px |
| LAY-05 | Нижняя зарезервированная зона | layout.bottom_reserved_vh |
| LAY-06 | Ширина боковой панели ПК | layout.desktop_sidebar_width |
| LAY-07 | Соотношение сторон вертикальной рамки | layout.portrait_aspect_ratio |
| LAY-08 | Зазор между субтитрами и контролами | layout.subtitle_to_controls_gap_px |
| LAY-09 | Масштабирование визуализации | layout.visualization_fit |
| UI-01 | Минимальная область нажатия | controls.min_touch_target_px |
| UI-02 | Максимальная высота окна настроек | controls.settings_max_height_dvh |
| VIS-01 | Основной фон | palette.background |
| VIS-02 | Фон панелей | palette.panel |
| VIS-03 | Акцент | palette.accent |
| VIS-04 | Дополнительный акцент | palette.accent_dark |
| VIS-05 | Основной текст | palette.text |
| VIS-06 | Вторичный текст | palette.muted_text |
| VIS-07 | Семейство шрифтов | typography.font_family |
| VIS-08 | Насыщенность заголовков | typography.heading_weight |
| ANI-01 | Задержка автозапуска | animation.auto_start_delay_ms |
| ANI-02 | Целевая частота отрисовки | animation.target_fps |
| ANI-03 | Скорости воспроизведения | animation.speeds |
| ANI-04 | Масштаб появления окна настроек | animation.settings_entry_scale |
| ANI-05 | Интервал AUTO | animation.auto_step_interval_ms |
| ANI-06 | Длительность перехода | animation.step_transition_ms |
| ANI-07 | Появление субтитров | animation.subtitle_transition_ms |
| SUB-01 | Количество шагов и субтитров | subtitles.min_steps, subtitles.max_steps |
| SUB-02 | Максимальная длина субтитра | subtitles.max_words |
| SUB-03 | Размер шрифта субтитров | typography.subtitle_size |
| SUB-04 | Фон субтитров | palette.subtitle_background |
| SUB-05 | Размытие подложки субтитров | subtitles.background_blur_px |
| TEST-01 | Компактный телефон | test_viewports.compact_phone |
| TEST-02 | Планшет / граница | test_viewports.tablet_breakpoint |
| TEST-03 | Рабочий стол | test_viewports.desktop |

## Правила

- Меняй нормативные значения только в app-spec.json.
- Идентификаторы стабильны; тематические спецификации ссылаются на них.
- Реализация общих элементов находится в app-generator/templates/.
- Не создавай второй набор палитры или шаблонных компонентов.
