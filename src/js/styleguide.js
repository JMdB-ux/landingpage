import { gsap } from './gsap.js';
import { config } from './config.js';
import { prefersReducedMotion } from './media.js';

/*
 * Styleguide-only helpers: print live token/config values and play easing demos,
 * so the preview always reflects the current tokens.css and config.js.
 */

function printTokenValues() {
  const styles = getComputedStyle(document.documentElement);

  document.querySelectorAll('[data-token-value]').forEach((element) => {
    element.textContent = styles.getPropertyValue(element.dataset.tokenValue).trim() || '–';
  });

  document.querySelectorAll('[data-config-value]').forEach((element) => {
    const value = element.dataset.configValue.split('.').reduce((object, key) => object?.[key], config);
    element.textContent = String(value);
  });
}

function initEaseDemos() {
  document.querySelectorAll('[data-ease-demo]').forEach((demo) => {
    const button = demo.querySelector('[data-ease-play]');
    const markers = demo.querySelectorAll('[data-ease]');
    if (!button) return;

    button.addEventListener('click', () => {
      const reduceMotion = prefersReducedMotion();
      const duration = reduceMotion ? 0 : config.animation.duration * 1.5;

      markers.forEach((marker) => {
        const ease = reduceMotion
          ? 'none'
          : marker.dataset.ease === 'config' ? config.animation.ease : marker.dataset.ease;
        gsap.fromTo(marker, { x: 0 }, {
          x: () => marker.parentElement.clientWidth - marker.offsetWidth,
          duration,
          ease,
          overwrite: true,
        });
      });
    });
  });
}

printTokenValues();
initEaseDemos();
