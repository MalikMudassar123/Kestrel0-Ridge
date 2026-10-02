import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });

// Mobile browsers resize the viewport when the address bar shows/hides.
// Ignoring that stops the film from jumping while the user scrolls on phones.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
