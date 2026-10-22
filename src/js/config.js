/*
 * Central configuration for motion, smooth scrolling and form handling.
 * Breakpoint names refer to the --breakpoint-* tokens in src/css/tokens.css.
 */
export const config = {
  animation: {
    duration: 0.9,
    reducedDuration: 0.25,
    ease: 'power3.out',
    distance: 32,
    scale: 0.96,
    stagger: 0.12,
    introDelay: 0.1,
    scrollTriggerStart: 'top 85%',
  },

  mobile: {
    // Below this breakpoint animations are shortened and parallax is disabled.
    breakpoint: 'md',
    durationFactor: 0.75,
    distance: 16,
  },

  parallax: {
    enabled: true,
    defaultStrength: 0.06,
  },

  lenis: {
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
  },

  navigation: {
    // The mobile menu collapses below this breakpoint. Keep in sync with @variant lg in components.css.
    desktopBreakpoint: 'lg',
  },

  accordion: {
    duration: 0.35,
    ease: 'power2.out',
  },

  form: {
    // TODO: Set the real participation endpoint, see src/js/participation-api.js.
    endpoint: '',
    successUrl: 'teilnahme.html',
  },
};
