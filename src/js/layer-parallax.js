import { gsap } from './gsap.js';
import { config } from './config.js';

/*
 * Scroll-linked depth for .layer-stack images: each layer gets a slightly
 * different y/x/rotation so stacks feel dimensional. Only transform is used.
 * Call only inside prefers-reduced-motion: no-preference.
 */

function getTrigger(stack) {
  return (
    stack.closest('.hero-photo, .hero-price-wrap, .prize-card-media, .beer-visual, .hero-alternative') ||
    stack.parentElement ||
    stack
  );
}

export function initLayerParallax(mobile = false) {
  if (!config.layerParallax.enabled) return;

  const { strength, rotation, drift, scrub, mobileFactor } = config.layerParallax;
  const factor = mobile ? mobileFactor : 1;

  gsap.utils.toArray('.layer-stack').forEach((stack) => {
    const layers = gsap.utils.toArray(stack.querySelectorAll(':scope > img'));
    if (layers.length < 2) return;

    const trigger = getTrigger(stack);
    const last = Math.max(layers.length - 1, 1);

    layers.forEach((layer, index) => {
      const depth = index / last;
      const amp = gsap.utils.interpolate(0.4, 1, depth) * factor;
      const y = strength * amp;
      const x = drift * amp * (index % 2 === 0 ? 1 : -1);
      const rot = rotation * amp * (index % 2 === 0 ? -1 : 1);
      const offsetX = Number(layer.dataset.layerX) || 0;

      gsap.fromTo(
        layer,
        {
          yPercent: -y,
          xPercent: -x + offsetX,
          rotate: -rot,
          force3D: true,
        },
        {
          yPercent: y,
          xPercent: x + offsetX,
          rotate: rot,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub,
          },
        },
      );
    });
  });
}
