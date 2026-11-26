---
name: short-video-ui-kit
description: Создаёт повторно используемые шаблоны интерфейса для вертикальных HTML-миниприложений: тёмную цветовую тему, ambient-фон и стеклянное модальное окно настроек. Используй при создании или переработке миниприложений для коротких видео, когда нужны эти элементы или фирменный стиль из railway-crossing-safety.html.
---

# Short Video UI Kit

Генератор извлечённых шаблонных элементов. Исходные разметка и стили хранятся в `templates/`, палитра — в `config/palette.json`. Не копируй большие HTML/CSS/JS-фрагменты в ответ и не пересказывай содержимое шаблонов в контексте: создай файлы скриптом и используй их на диске.

## Когда применять

- пользователь просит создать HTML-миниприложение для вертикального видео;
- требуется тёмный интерфейс с зелёным акцентом;
- требуется трёхслойный размытый ambient-фон, включаемый классом `body.v916`;
- требуется модальное окно настроек со стеклянной подложкой, AUTO/STEP, скоростью, переключателем 9:16 и Reset;
- нужно повторно использовать те же цвета в нескольких HTML-миниприложениях.

Не подключай шаблон автоматически, если пользователь просит другой визуальный стиль или явно отказывается от модального окна/ambient-фона.

## Генерация файлов

Из корня навыка выполни:

```bash
python scripts/generate_components.py --components all --output ./generated-ui
```

Доступны отдельные компоненты:

```bash
python scripts/generate_components.py --components theme --output ./generated-ui
python scripts/generate_components.py --components background --output ./generated-ui
python scripts/generate_components.py --components modal --output ./generated-ui
python scripts/generate_components.py --components theme background --output ./generated-ui
```

Команда не требует сторонних Python-пакетов. Она создаёт файлы в указанной директории:

| Файл | Назначение |
|---|---|
| `theme.css` | CSS custom properties, автоматически построенные из палитры |
| `background.html` | HTML-фрагмент ambient-фона |
| `background.css` | Анимация и оформление ambient-фона |
| `modal.html` | Разметка модального окна настроек |
| `modal.css` | Стеклянная подложка, окно, кнопки, переключатель и слайдер |
| `modal.js` | Открытие/закрытие и публикация событий настроек |
| `palette.json` | Копия исходной палитры рядом с результатом |

При выборе `background` или `modal` скрипт автоматически добавляет `theme.css`, поскольку компоненты используют его CSS-переменные. Скрипт перезаписывает одноимённые файлы в целевой папке. Всегда передавай отдельную папку генерации, а не корень пользовательского проекта.

## Правила интеграции

1. Добавь `theme.css` до CSS компонентов.
2. Подключай только те компоненты, которые требуются проекту.
3. Для ambient-фона вставь содержимое `background.html` сразу после открывающего `<body>` и подключи `background.css`.
4. Для модального окна вставь содержимое `modal.html` перед закрывающим `</body>`, подключи `modal.css` и `modal.js`.
5. Кнопке/кнопкам открытия назначь класс `.js-gear`.
6. Инициализируй контроллер после загрузки DOM:

```html
<script>
  const settingsModal = window.SettingsModal.init();
</script>
```

Обработчик приложения должен подписаться на события `settings:*` на `#modalWrap`:

| Событие | `event.detail` | Действие приложения |
|---|---|---|
| `settings:mode` | `{ mode: "auto" | "step" }` | Переключить алгоритм проигрывания |
| `settings:next-step` | — | Выполнить переход к следующему шагу |
| `settings:speed` | `{ value: number }` | Установить скорость анимации |
| `settings:video-mode` | `{ enabled: boolean }` | Включить или выключить режим 9:16 |
| `settings:reset` | — | Выполнить сброс состояния приложения |

Пример подключения событий:

```js
const modalElement = document.querySelector('#modalWrap');
modalElement.addEventListener('settings:mode', (event) => setMode(event.detail.mode));
modalElement.addEventListener('settings:next-step', () => nextStep());
modalElement.addEventListener('settings:speed', (event) => setSpeed(event.detail.value));
modalElement.addEventListener('settings:video-mode', (event) => setVideoMode(event.detail.enabled));
modalElement.addEventListener('settings:reset', () => resetApp());
```

`setMode`, `nextStep`, `setSpeed`, `setVideoMode` и `resetApp` в примере принадлежат основному приложению — генератор их не создаёт.

## Единственный источник цветовых значений

`config/palette.json` — единственный источник истины для цветов генерируемой темы. Не добавляй новые цветовые литералы в `background.css` или `modal.css`: сначала добавь токен в `css_variables`, затем используй соответствующую CSS-переменную. После изменения палитры повторно запусти генератор.

`illustration_palette` содержит извлечённые цвета Canvas-графики. Это справочник исходной палитры; генератор не переписывает Canvas-рисование автоматически.

## Ограничение ответственности

Навык генерирует визуальные и интерфейсные заготовки, но не логику обучения/игры, ход сценария, синхронизацию субтитров или бизнес-логику кнопок. Эти действия остаются в основном приложении и подключаются через события.
