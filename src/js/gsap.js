import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Single registration point: every module imports GSAP from here.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
