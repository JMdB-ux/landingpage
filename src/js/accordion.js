import { gsap, ScrollTrigger } from './gsap.js';
import { config } from './config.js';
import { prefersReducedMotion } from './media.js';

/*
 * Progressive enhancement for native <details>/<summary> accordions:
 * - animated open/close when motion is allowed
 * - optional single-open mode via [data-accordion="single"]
 * - arrow key, Home and End navigation between triggers
 * Height tweens are skipped under prefers-reduced-motion (large y-axis motion).
 * Without JavaScript the native element stays fully operable.
 */

function getParts(item) {
  return {
    trigger: item.querySelector(':scope > summary'),
    content: item.querySelector(':scope > .accordion-content'),
  };
}

function openItem(item) {
  const { content } = getParts(item);
  item.removeAttribute('data-closing');
  item.open = true;

  if (!content || prefersReducedMotion()) return;

  gsap.killTweensOf(content);
  gsap.fromTo(
    content,
    { height: 0, opacity: 0 },
    {
      height: 'auto',
      opacity: 1,
      duration: config.accordion.duration,
      ease: config.accordion.ease,
      clearProps: 'height,opacity',
      onComplete: () => ScrollTrigger.refresh(),
    },
  );
}

function closeItem(item) {
  const { content } = getParts(item);

  if (!content || prefersReducedMotion()) {
    item.open = false;
    return;
  }

  item.setAttribute('data-closing', '');
  gsap.killTweensOf(content);
  gsap.to(content, {
    height: 0,
    opacity: 0,
    duration: config.accordion.duration,
    ease: config.accordion.ease,
    onComplete: () => {
      item.open = false;
      item.removeAttribute('data-closing');
      gsap.set(content, { clearProps: 'height,opacity' });
      ScrollTrigger.refresh();
    },
  });
}

function initAccordion(accordion) {
  const items = [...accordion.querySelectorAll(':scope > details')];
  const triggers = items.map((item) => getParts(item).trigger).filter(Boolean);
  const isSingle = accordion.dataset.accordion === 'single';

  items.forEach((item) => {
    const { trigger } = getParts(item);
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const shouldOpen = !item.open || item.hasAttribute('data-closing');

      if (!shouldOpen) {
        closeItem(item);
        return;
      }

      if (isSingle) {
        items.filter((other) => other !== item && other.open).forEach(closeItem);
      }
      openItem(item);
    });
  });

  accordion.addEventListener('keydown', (event) => {
    const index = triggers.indexOf(event.target);
    if (index === -1) return;

    const targets = {
      ArrowDown: triggers[(index + 1) % triggers.length],
      ArrowUp: triggers[(index - 1 + triggers.length) % triggers.length],
      Home: triggers[0],
      End: triggers[triggers.length - 1],
    };

    const next = targets[event.key];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  });
}

export function initAccordions() {
  document.querySelectorAll('[data-accordion]').forEach(initAccordion);
}
