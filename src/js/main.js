import { initSmoothScroll } from './smooth-scroll.js';
import { initNavigation } from './navigation.js';
import { initAccordions } from './accordion.js';
import { initForms } from './form.js';
import { initAnimations } from './animations.js';

/*
 * Shared entry point for all pages. Each module only acts on elements that exist,
 * so pages opt into features purely through markup. Features are isolated so that
 * one failing module does not break the others.
 */

function revealHiddenContent() {
  document.documentElement.classList.add('motion-fallback');
}

function run(init, onError) {
  try {
    init();
  } catch (error) {
    onError?.();
    console.error(error);
  }
}

run(initSmoothScroll);
run(initNavigation);
run(initAccordions);
run(initForms);
run(initAnimations, revealHiddenContent);

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
