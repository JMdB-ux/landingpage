import { gsap, ScrollTrigger } from './gsap.js';
import { config } from './config.js';
import { allowMotionQuery, maxWidthQuery, reducedMotionQuery } from './media.js';

/*
 * Data attribute API:
 *   [data-animate="fade-up" | "fade-in" | "scale-in"]  reveal on scroll
 *   [data-animate="stagger"]                            reveal direct children one after another
 *   [data-stagger-type="fade-in" | "scale-in"]          optional child effect for stagger groups (default: fade-up)
 *   [data-intro] > [data-intro-item]                    page intro on load
 *   [data-parallax="0.06"]                              subtle scroll-linked offset (strength = fraction of height)
 *   [data-delay="0.2"]                                  optional delay in seconds for reveals
 *
 * Motion follows https://gsap.com/resources/getting-started/accessibility/
 * via two gsap.matchMedia() queries. Reduced motion keeps opacity-only fades
 * (no x/y, scale or parallax). matchMedia reverts tweens when the OS setting changes.
 */

function getFromVars(type, settings) {
  if (settings.distance === 0 && settings.scale === 1) {
    return { opacity: 0 };
  }

  switch (type) {
    case 'fade-in':
      return { opacity: 0 };
    case 'scale-in':
      return { opacity: 0, scale: settings.scale };
    default:
      return { opacity: 0, y: settings.distance };
  }
}

function reveal(targets, type, settings, trigger, extra = {}) {
  return gsap.fromTo(targets, getFromVars(type, settings), {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: settings.duration,
    ease: settings.ease,
    ...extra,
    scrollTrigger: {
      trigger,
      start: config.animation.scrollTriggerStart,
      once: true,
    },
  });
}

function initReveals(settings) {
  gsap.utils.toArray('[data-animate]:not([data-animate="stagger"])').forEach((element) => {
    reveal(element, element.dataset.animate, settings, element, {
      delay: Number(element.dataset.delay) || 0,
    });
  });
}

function initStaggers(settings) {
  gsap.utils.toArray('[data-animate="stagger"]').forEach((group) => {
    reveal(group.children, group.dataset.staggerType || 'fade-up', settings, group, {
      stagger: settings.stagger,
      delay: Number(group.dataset.delay) || 0,
    });
  });
}

function initIntros(settings) {
  gsap.utils.toArray('[data-intro]').forEach((intro) => {
    const items = intro.querySelectorAll('[data-intro-item]');
    if (!items.length) return;

    gsap.fromTo(items, getFromVars('fade-up', settings), {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: settings.duration,
      ease: settings.ease,
      stagger: settings.stagger,
      delay: settings.distance === 0 ? 0 : config.animation.introDelay,
    });
  });
}

function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach((element) => {
    const strength = Number(element.dataset.parallax) || config.parallax.defaultStrength;
    const scale = 1 + strength * 2.2;

    gsap.fromTo(element, { yPercent: -strength * 100, scale }, {
      yPercent: strength * 100,
      scale,
      ease: 'none',
      scrollTrigger: {
        trigger: element.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

function motionSettings(mobile) {
  return {
    duration: mobile
      ? config.animation.duration * config.mobile.durationFactor
      : config.animation.duration,
    distance: mobile ? config.mobile.distance : config.animation.distance,
    scale: config.animation.scale,
    stagger: config.animation.stagger,
    ease: config.animation.ease,
  };
}

function reducedSettings() {
  return {
    duration: config.animation.reducedDuration,
    distance: 0,
    scale: 1,
    stagger: 0,
    ease: 'none',
  };
}

function refreshWhenAssetsLoaded() {
  const refresh = () => ScrollTrigger.refresh();

  if (document.readyState === 'complete') {
    refresh();
  } else {
    window.addEventListener('load', refresh, { once: true });
  }

  document.fonts?.ready.then(refresh);
}

export function initAnimations() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      allowMotion: allowMotionQuery,
      mobile: maxWidthQuery(config.mobile.breakpoint),
    },
    (context) => {
      const { allowMotion, mobile } = context.conditions;
      if (!allowMotion) return;

      const settings = motionSettings(mobile);
      initIntros(settings);
      initReveals(settings);
      initStaggers(settings);

      if (config.parallax.enabled && !mobile) {
        initParallax();
      }
    },
  );

  mm.add(reducedMotionQuery, () => {
    const settings = reducedSettings();
    initIntros(settings);
    initReveals(settings);
    initStaggers(settings);
  });

  refreshWhenAssetsLoaded();
}
