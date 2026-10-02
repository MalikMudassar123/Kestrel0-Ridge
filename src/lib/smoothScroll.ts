import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;

/** Start Lenis once and drive it from GSAP's ticker so ScrollTrigger and Lenis never disagree. */
export function startSmoothScroll() {
  if (lenis) return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function lockScroll() { lenis?.stop(); }
export function unlockScroll() { lenis?.start(); }

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.8 });
  else window.scrollTo({ top: y });
}

/** Scroll to a point in the film. beat = 0…BEATS. */
export function scrollToBeat(beat: number) {
  const film = document.querySelector(".film") as HTMLElement | null;
  const stage = document.querySelector(".film__stage") as HTMLElement | null;
  if (!film || !stage) return;
  const top = film.getBoundingClientRect().top + window.scrollY;
  scrollToY(top + beat * stage.clientHeight);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY);
}
