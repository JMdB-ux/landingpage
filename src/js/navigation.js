import { config } from './config.js';
import { minWidthQuery } from './media.js';
import { startSmoothScroll, stopSmoothScroll } from './smooth-scroll.js';

/*
 * Disclosure navigation: the toggle button controls the nav panel via aria-expanded.
 * Without JavaScript the panel stays in normal document flow (see [data-nav-enhanced] in components.css).
 */
export function initNavigation() {
  const header = document.querySelector('[data-site-header]');
  const toggle = header?.querySelector('[data-nav-toggle]');
  const panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
  if (!header || !toggle || !panel) return;

  const label = toggle.querySelector('[data-nav-toggle-label]');
  const desktopQuery = window.matchMedia(minWidthQuery(config.navigation.desktopBreakpoint));
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  function setOpen(open, { returnFocus = false } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    if (label) label.textContent = open ? 'Schließen' : 'Menü';
    header.toggleAttribute('data-nav-open', open);
    document.documentElement.classList.toggle('nav-is-open', open);

    if (open) {
      stopSmoothScroll();
      document.addEventListener('keydown', onKeydown);
      document.addEventListener('click', onDocumentClick);
    } else {
      startSmoothScroll();
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onDocumentClick);
      if (returnFocus) toggle.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      setOpen(false, { returnFocus: true });
    }
  }

  function onDocumentClick(event) {
    if (!header.contains(event.target)) {
      setOpen(false);
    }
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  panel.addEventListener('click', (event) => {
    if (event.target.closest('a') && isOpen()) {
      setOpen(false);
    }
  });

  panel.addEventListener('focusout', (event) => {
    if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) {
      setOpen(false);
    }
  });

  desktopQuery.addEventListener('change', (event) => {
    if (event.matches && isOpen()) {
      setOpen(false);
    }
  });

  header.setAttribute('data-nav-enhanced', '');
  setOpen(false);
}
