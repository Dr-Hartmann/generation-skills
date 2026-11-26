/*
 * Small interaction controller for the generated settings modal.
 * Emits document events so application-specific behavior stays outside this template.
 * Events: settings:mode, settings:next-step, settings:speed,
 *         settings:video-mode, settings:reset.
 */
(function (global) {
  'use strict';

  function initSettingsModal(options) {
    const config = Object.assign({
      overlaySelector: '#modalWrap',
      dialogSelector: '#modal',
      openSelector: '.js-gear',
      closeSelector: '[data-modal-close]'
    }, options || {});

    const overlay = document.querySelector(config.overlaySelector);
    if (!overlay) throw new Error('Settings modal overlay not found: ' + config.overlaySelector);

    const dialog = overlay.querySelector(config.dialogSelector) || overlay.querySelector('[role="dialog"]');
    if (!dialog) throw new Error('Settings modal dialog not found.');

    const openers = Array.from(document.querySelectorAll(config.openSelector));
    const closers = Array.from(overlay.querySelectorAll(config.closeSelector));
    let previouslyFocused = null;

    function open() {
      if (overlay.classList.contains('open')) return;
      previouslyFocused = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      dialog.focus();
    }

    function close() {
      if (!overlay.classList.contains('open')) return;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    }

    function toggle() {
      overlay.classList.contains('open') ? close() : open();
    }

    openers.forEach((button) => button.addEventListener('click', toggle));
    closers.forEach((button) => button.addEventListener('click', close));

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('open')) {
        close();
      }
    });

    overlay.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        overlay.querySelectorAll('[data-mode]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        const next = overlay.querySelector('[data-modal-action="next-step"]');
        if (next) next.disabled = mode !== 'step';
        overlay.dispatchEvent(new CustomEvent('settings:mode', { detail: { mode } }));
      });
    });

    overlay.querySelectorAll('[data-modal-action="next-step"]').forEach((button) => {
      button.addEventListener('click', () => {
        overlay.dispatchEvent(new CustomEvent('settings:next-step'));
      });
    });

    const speed = overlay.querySelector('#mSpeed');
    const speedValue = overlay.querySelector('#mSpeedVal');
    if (speed) {
      speed.addEventListener('input', () => {
        if (speedValue) speedValue.textContent = speed.value + 'x';
        overlay.dispatchEvent(new CustomEvent('settings:speed', {
          detail: { value: Number(speed.value) }
        }));
      });
    }

    const videoMode = overlay.querySelector('[data-modal-toggle="video-mode"]');
    if (videoMode) {
      videoMode.addEventListener('change', () => {
        overlay.dispatchEvent(new CustomEvent('settings:video-mode', {
          detail: { enabled: videoMode.checked }
        }));
      });
    }

    overlay.querySelectorAll('[data-modal-action="reset"]').forEach((button) => {
      button.addEventListener('click', () => {
        overlay.dispatchEvent(new CustomEvent('settings:reset'));
      });
    });

    return {
      open,
      close,
      toggle,
      setStepText(text) {
        const target = overlay.querySelector('#mStepTxt');
        if (target) target.textContent = text;
      },
      setMode(mode) {
        const target = overlay.querySelector('[data-mode="' + mode + '"]');
        if (target) target.click();
      },
      setSpeed(value) {
        if (!speed) return;
        speed.value = String(value);
        speed.dispatchEvent(new Event('input', { bubbles: true }));
      },
      setVideoMode(enabled) {
        if (!videoMode) return;
        videoMode.checked = Boolean(enabled);
        videoMode.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
  }

  global.SettingsModal = { init: initSettingsModal };
})(window);
