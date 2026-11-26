(() => {
  "use strict";

  const scene = window.AppScene;
  const steps = APP_CONFIG.steps;
  const timing = APP_CONFIG.timing;

  const get = (id) => document.getElementById(id);
  const elements = {
    appRoot: get("appRoot"),
    stage: get("stage"),
    visualFrame: get("visualFrame"),
    canvas: get("sceneCanvas"),
    mobileSubtitle: get("mobileSubtitle"),
    desktopSubtitle: get("desktopSubtitle"),
    desktopStep: get("desktopStepIndicator"),
    modalStep: get("modalStepIndicator"),
    playButton: get("playButton"),
    playIcon: get("playIcon"),
    settingsButton: get("settingsButton"),
    backdrop: get("settingsBackdrop"),
    dialog: get("settingsDialog"),
    closeSettings: get("closeSettingsButton"),
    autoMode: get("autoModeButton"),
    stepMode: get("stepModeButton"),
    nextStep: get("nextStepButton"),
    speed: get("speedSelect"),
    portrait: get("portraitToggle"),
    reset: get("resetButton")
  };

  function showFatalError(message) {
    const panel = document.createElement("div");
    panel.setAttribute("role", "alert");
    panel.style.cssText = "position:absolute;inset:16px;z-index:10;display:grid;place-items:center;padding:20px;border:1px solid #E5484D;border-radius:12px;background:#1A1A20;color:#FFFFFF;text-align:center;font:16px/1.5 system-ui";
    panel.textContent = message;
    elements.stage.appendChild(panel);
    console.error("[app-generator]", message);
  }

  if (!scene || typeof scene.draw !== "function") {
    showFatalError("Сцена не подключена. Проверьте файл scene.js и функцию AppScene.draw().");
    return;
  }

  if (!Array.isArray(steps) || steps.length < timing.minSteps || steps.length > timing.maxSteps) {
    showFatalError("Некорректная конфигурация шагов. Проверьте файл scene.json.");
    return;
  }

  const ctx = elements.canvas.getContext("2d");
  const previousCanvas = document.createElement("canvas");
  const currentCanvas = document.createElement("canvas");
  const previousCtx = previousCanvas.getContext("2d");
  const currentCtx = currentCanvas.getContext("2d");

  if (!ctx || !previousCtx || !currentCtx) {
    showFatalError("Браузер не смог создать Canvas 2D-контекст.");
    return;
  }

  const state = {
    mode: timing.defaultMode,
    isPlaying: false,
    currentStep: 0,
    speed: timing.defaultSpeed,
    videoMode: timing.defaultVideoMode,
    controlsHidden: false,
    elapsedMs: 0,
    waitElapsedMs: 0,
    deltaMs: 0,
    transition: null
  };

  let cssWidth = 0;
  let cssHeight = 0;
  let pixelRatio = 1;
  let lastTimestamp = 0;
  let animationFrameId = 0;
  let returnFocusTo = null;
  let subtitleRevision = 0;

  function setCanvasSize(canvas) {
    canvas.width = Math.max(1, Math.round(cssWidth * pixelRatio));
    canvas.height = Math.max(1, Math.round(cssHeight * pixelRatio));
  }

  function resizeCanvas() {
    const rect = elements.visualFrame.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    if (cssWidth <= 0 || cssHeight <= 0) return;

    setCanvasSize(elements.canvas);
    setCanvasSize(previousCanvas);
    setCanvasSize(currentCanvas);

    if (typeof scene.resize === "function") {
      scene.resize({ width: cssWidth, height: cssHeight, pixelRatio });
    }

    drawFrame();
  }

  function drawTo(targetContext, stepIndex, transitionProgress) {
    targetContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    targetContext.clearRect(0, 0, cssWidth, cssHeight);
    targetContext.save();

    try {
      scene.draw(targetContext, {
        stepIndex,
        step: steps[stepIndex],
        width: cssWidth,
        height: cssHeight,
        elapsedMs: state.elapsedMs,
        deltaMs: state.deltaMs,
        transitionProgress,
        speed: state.speed,
        videoMode: state.videoMode,
        palette: APP_CONFIG.palette
      });
    } finally {
      targetContext.restore();
    }
  }

  function drawFrame() {
    if (cssWidth <= 0 || cssHeight <= 0) return;

    if (state.transition) {
      const progress = Math.min(1, state.transition.elapsedMs / timing.transitionMs);
      drawTo(previousCtx, state.transition.from, progress);
      drawTo(currentCtx, state.transition.to, progress);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
      ctx.globalAlpha = 1 - progress;
      ctx.drawImage(previousCanvas, 0, 0);
      ctx.globalAlpha = progress;
      ctx.drawImage(currentCanvas, 0, 0);
      ctx.globalAlpha = 1;
      return;
    }

    drawTo(ctx, state.currentStep, 1);
  }

  function updateIndicators(animateSubtitle) {
    const stepNumber = state.currentStep + 1;
    const label = "Шаг " + stepNumber + " / " + steps.length;
    elements.desktopStep.textContent = label;
    elements.modalStep.textContent = label;

    const subtitle = steps[state.currentStep].subtitle;
    const targets = [elements.mobileSubtitle, elements.desktopSubtitle];
    const revision = ++subtitleRevision;

    for (const target of targets) {
      if (animateSubtitle) target.classList.add("updating");
      target.textContent = subtitle;
    }

    if (animateSubtitle) {
      requestAnimationFrame(() => {
        if (revision !== subtitleRevision) return;
        requestAnimationFrame(() => {
          if (revision !== subtitleRevision) return;
          for (const target of targets) target.classList.remove("updating");
        });
      });
    } else {
      for (const target of targets) target.classList.remove("updating");
    }

    updateControls();
  }

  function updateControls() {
    const isAuto = state.mode === "auto";
    elements.autoMode.setAttribute("aria-pressed", String(isAuto));
    elements.stepMode.setAttribute("aria-pressed", String(!isAuto));
    elements.nextStep.disabled =
      isAuto ||
      Boolean(state.transition) ||
      state.currentStep >= steps.length - 1;

    elements.playButton.setAttribute(
      "aria-label",
      state.isPlaying ? "Пауза" : "Продолжить воспроизведение"
    );
    elements.playIcon.innerHTML = state.isPlaying
      ? '<path d="M7 5h4v14H7zM15 5h4v14h-4z" fill="currentColor"/>'
      : '<path d="m7 4 13 8-13 8z" fill="currentColor"/>';

    elements.appRoot.classList.toggle("is-portrait", state.videoMode);
    elements.appRoot.classList.toggle("controls-hidden", state.controlsHidden);
    elements.portrait.checked = state.videoMode;
    elements.speed.value = String(state.speed);
  }

  function startTransition(nextStep) {
    if (state.transition || nextStep < 0 || nextStep >= steps.length) return;

    state.transition = {
      from: state.currentStep,
      to: nextStep,
      elapsedMs: 0
    };
    state.currentStep = nextStep;
    state.waitElapsedMs = 0;
    updateIndicators(true);
  }

  function setMode(mode) {
    if (mode !== "auto" && mode !== "step") return;
    if (state.mode === mode) return;

    if (mode === "step") {
      if (state.transition) {
        state.currentStep = state.transition.to;
        state.transition = null;
      }
      state.mode = "step";
      state.isPlaying = false;
      state.waitElapsedMs = 0;
    } else {
      state.mode = "auto";
      state.isPlaying = true;
      state.waitElapsedMs = 0;
    }

    updateIndicators(false);
    drawFrame();
  }

  function setPlaying(playing) {
    state.isPlaying = Boolean(playing);
    updateControls();
  }

  function nextStep() {
    if (
      state.mode !== "step" ||
      state.transition ||
      state.currentStep >= steps.length - 1
    ) return;

    state.isPlaying = true;
    startTransition(state.currentStep + 1);
    updateControls();
  }

  function setSpeed(value) {
    const parsed = Number(value);
    if (!timing.speeds.includes(parsed)) return;
    state.speed = parsed;
    updateControls();
  }

  function setVideoMode(enabled) {
    state.videoMode = Boolean(enabled);
    updateControls();
    requestAnimationFrame(resizeCanvas);
  }

  function reset() {
    state.mode = "auto";
    state.isPlaying = true;
    state.currentStep = 0;
    state.elapsedMs = 0;
    state.waitElapsedMs = 0;
    state.transition = null;

    if (typeof scene.reset === "function") scene.reset();
    updateIndicators(true);
    drawFrame();
  }

  function openSettings() {
    returnFocusTo = document.activeElement;
    elements.backdrop.classList.add("open");
    elements.backdrop.setAttribute("aria-hidden", "false");
    elements.settingsButton.setAttribute("aria-expanded", "true");
    elements.dialog.focus();
  }

  function closeSettings() {
    elements.backdrop.classList.remove("open");
    elements.backdrop.setAttribute("aria-hidden", "true");
    elements.settingsButton.setAttribute("aria-expanded", "false");

    if (returnFocusTo && typeof returnFocusTo.focus === "function") {
      returnFocusTo.focus();
    }
  }

  function toggleSettings() {
    if (elements.backdrop.classList.contains("open")) closeSettings();
    else openSettings();
  }

  function update(dt) {
    if (!state.isPlaying) return;

    const scaledDelta = dt * state.speed;
    state.elapsedMs += scaledDelta;

    if (state.transition) {
      state.transition.elapsedMs += scaledDelta;

      if (state.transition.elapsedMs >= timing.transitionMs) {
        state.currentStep = state.transition.to;
        state.transition = null;
        state.waitElapsedMs = 0;

        if (state.mode === "step") state.isPlaying = false;
        updateIndicators(false);
      }
      return;
    }

    if (state.mode === "auto") {
      state.waitElapsedMs += scaledDelta;

      if (state.waitElapsedMs >= timing.autoStepIntervalMs) {
        startTransition((state.currentStep + 1) % steps.length);
      }
    }
  }

  function animationLoop(timestamp) {
    const dt = lastTimestamp
      ? Math.min(Math.max(timestamp - lastTimestamp, 0), 100)
      : 0;
    lastTimestamp = timestamp;
    state.deltaMs = dt;

    update(dt);
    drawFrame();
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    );
  }

  function handleKeyboard(event) {
    if (event.isComposing || isEditableTarget(event.target)) return;

    if (event.key === "Escape") {
      if (elements.backdrop.classList.contains("open")) {
        event.preventDefault();
        closeSettings();
      }
      return;
    }

    if (!window.matchMedia("(min-width: " + APP_CONFIG.breakpointPx + "px)").matches) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      state.controlsHidden = !state.controlsHidden;
      updateControls();
      return;
    }

    if (event.key === "ArrowRight") {
      if (state.mode === "step" && !state.transition && state.currentStep < steps.length - 1) {
        event.preventDefault();
        nextStep();
      }
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "r") reset();
    else if (key === "s") setMode(state.mode === "auto" ? "step" : "auto");
    else if (key === "v") setVideoMode(!state.videoMode);
  }

  function populateSpeedOptions() {
    for (const value of timing.speeds) {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = value + "×";
      elements.speed.appendChild(option);
    }
  }

  elements.playButton.addEventListener("click", () => {
    setPlaying(!state.isPlaying);
  });
  elements.settingsButton.addEventListener("click", toggleSettings);
  elements.closeSettings.addEventListener("click", closeSettings);
  elements.backdrop.addEventListener("click", (event) => {
    if (event.target === elements.backdrop) closeSettings();
  });
  elements.autoMode.addEventListener("click", () => setMode("auto"));
  elements.stepMode.addEventListener("click", () => setMode("step"));
  elements.nextStep.addEventListener("click", nextStep);
  elements.speed.addEventListener("change", (event) => setSpeed(event.target.value));
  elements.portrait.addEventListener("change", (event) => setVideoMode(event.target.checked));
  elements.reset.addEventListener("click", reset);
  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", () => {
    lastTimestamp = 0;
  });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(elements.visualFrame);
  }

  populateSpeedOptions();
  updateIndicators(false);
  resizeCanvas();

  if (typeof scene.init === "function") {
    scene.init({
      width: cssWidth,
      height: cssHeight,
      steps,
      setMode,
      setPlaying,
      setSpeed,
      setVideoMode,
      nextStep,
      reset
    });
  }

  animationFrameId = requestAnimationFrame(animationLoop);
  window.setTimeout(() => {
    if (!state.isPlaying && state.mode === timing.defaultMode) setPlaying(true);
  }, timing.autoStartDelayMs);

  window.addEventListener("pagehide", () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }, { once: true });
})();
