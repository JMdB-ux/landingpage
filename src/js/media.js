export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
export const allowMotionQuery = '(prefers-reduced-motion: no-preference)';

export function getBreakpoint(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${name}`).trim();
}

export function minWidthQuery(breakpointName) {
  return `(min-width: ${getBreakpoint(breakpointName)})`;
}

export function maxWidthQuery(breakpointName) {
  return `not all and ${minWidthQuery(breakpointName)}`;
}

export function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}
