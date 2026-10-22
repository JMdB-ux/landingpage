import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { config } from './config.js';
import { reducedMotionQuery } from './media.js';

/*
 * Lenis is driven by the GSAP ticker (autoRaf: false), so there is exactly one
 * requestAnimationFrame loop for scrolling and ScrollTrigger. Native scrolling stays
 * untouched without JavaScript, with reduced motion and on touch devices (syncTouch: false).
 */

let lenis = null;

function onTick(time) {
  lenis?.raf(time * 1000);
}

function createLenis() {
  if (lenis) return;

  lenis = new Lenis({
    ...config.lenis,
    autoRaf: false,
    anchors: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
}

function destroyLenis() {
  if (!lenis) return;

  gsap.ticker.remove(onTick);
  gsap.ticker.lagSmoothing(500, 33);
  lenis.destroy();
  lenis = null;
}

function getHashTarget(hash) {
  if (!hash || hash === '#') return null;

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

function moveFocus(target) {
  if (!target.matches('a[href], button, input, select, textarea, summary, [tabindex]')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}

function scrollToTarget(target, { immediate = false, focus = false } = {}) {
  if (!target) return;

  const complete = () => {
    if (focus) moveFocus(target);
  };

  if (lenis) {
    // Lenis already subtracts html scroll-padding-top (see base.css).
    lenis.scrollTo(target, {
      immediate,
      onComplete: complete,
    });
    return;
  }

  const behavior = immediate || window.matchMedia(reducedMotionQuery).matches
    ? 'auto'
    : 'smooth';
  target.scrollIntoView({ behavior, block: 'start' });
  complete();
}

function isSamePageLink(link) {
  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin
    && url.pathname === window.location.pathname
    && url.search === window.location.search
    && url.hash !== '';
}

function handleAnchorClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[href*="#"]');
  if (!link || link.target || !isSamePageLink(link)) return;

  const { hash } = new URL(link.href);
  const target = getHashTarget(hash);
  if (!target) return;

  event.preventDefault();

  if (window.location.hash !== hash) {
    history.pushState(null, '', hash);
  }

  scrollToTarget(target, {
    immediate: window.matchMedia(reducedMotionQuery).matches,
    focus: true,
  });
}

function handlePopState() {
  scrollToTarget(getHashTarget(window.location.hash), { immediate: true });
}

function scrollToCurrentHash({ immediate = true } = {}) {
  scrollToTarget(getHashTarget(window.location.hash), { immediate });
}

export function stopSmoothScroll() {
  lenis?.stop();
}

export function startSmoothScroll() {
  lenis?.start();
}

export function initSmoothScroll() {
  const motionQuery = window.matchMedia(reducedMotionQuery);

  if (!motionQuery.matches) {
    createLenis();
  }

  motionQuery.addEventListener('change', (event) => {
    if (event.matches) {
      destroyLenis();
    } else {
      createLenis();
    }
  });

  document.addEventListener('click', handleAnchorClick);
  window.addEventListener('popstate', handlePopState);

  if (document.readyState === 'complete') {
    scrollToCurrentHash();
  } else {
    window.addEventListener('load', () => scrollToCurrentHash(), { once: true });
  }
}
