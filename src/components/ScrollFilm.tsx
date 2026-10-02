import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Embers from "@/components/Embers";
import Fog from "@/components/Fog";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { coverPoint } from "@/lib/coverPoint";
import { unlockScroll } from "@/lib/smoothScroll";
import { BEATS, POINTS, TEXTS, type FilmText } from "@/data/film";

import { kestrelAssets as A } from "@/assets/kestrel/assets";

const { sky, peaks: farPeaks, ridge, lodge, hand: handLantern, branches, master, suite, dining, trail, stars, heroMobile } = A;

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */

/** Layers behind the glow, back to front. depth = how much closer it gets in beats 1–2. */
const BACK_LAYERS = [
  { key: "sky", src: sky, depth: 0 },
  { key: "peaks", src: farPeaks, depth: 0.04 },
  { key: "ridge", src: ridge, depth: 0.12 },
  { key: "lodge", src: lodge, depth: 0.18 },
];
const HAND = { key: "hand", src: handLantern, depth: 0.1 };

export const DESKTOP_SOURCES = [sky, farPeaks, ridge, lodge, handLantern, branches, suite, dining, trail, stars];
export const MOBILE_SOURCES = [heroMobile, suite, dining, trail, stars];

/** Every hero layer is drawn 6% bigger than the screen on each side, so no edge can ever show. */
const OVERSCAN = 0.06;
const MOBILE_QUERY = "(max-width: 767px)";
/** Mobile object-position x for stars, so the lodge windows stay on a portrait screen (matches CSS). */
const STARS_MOBILE_POS_X = 78;
const CREAM = "#efe6d4";
const INK = "#121c1b";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return match;
}

/** Rebuild the film when the width changes, or the height changes a lot (not the mobile address bar). */
function useResizeKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const dw = Math.abs(window.innerWidth - w);
        const dh = Math.abs(window.innerHeight - h);
        if (dw > 40 || dh > 150) {
          w = window.innerWidth;
          h = window.innerHeight;
          setKey((k) => k + 1);
        }
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return key;
}

const CHAPTERS = [
  { from: 0, label: "00 — Arrival" },
  { from: 1, label: "01 — The lodge" },
  { from: 3, label: "02 — The stay" },
  { from: 5, label: "03 — Dining" },
  { from: 6.5, label: "04 — Experiences" },
  { from: 8.5, label: "05 — Nights" },
  { from: 10.2, label: "06 — Stay with us" },
];

function chars(text: string, key: string) {
  return text.split(" ").map((word, wi, words) => (
    <Fragment key={`${key}-${wi}`}>
      <span className="w">
        {Array.from(word).map((c, ci) => (
          <span className="ch" key={ci}>{c}</span>
        ))}
      </span>
      {wi < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

/** "*keep* the light." -> characters, with "keep" in italics */
function withItalic(line: string): ReactNode[] {
  return line.split("*").map((part, i) =>
    i % 2 ? <em key={i}>{chars(part, `e${i}`)}</em> : <Fragment key={i}>{chars(part, `n${i}`)}</Fragment>,
  );
}

function TextBlock({ t, isFirst }: { t: FilmText; isFirst: boolean }) {
  const Heading = isFirst ? "h1" : "h2";
  return (
    <div className={`ftext ftext--${t.place} ftext--tone-${t.tone ?? "dark"}${isFirst ? " ftext--first" : ""}`} data-text={t.id}>
      <div className="ftext__box">
        {t.label && (
          <p className="ftext__label" data-piece>
            <span className="ftext__rule" aria-hidden="true" />
            {t.label}
          </p>
        )}
        <Heading className="ftext__head" aria-label={t.headline.join(" ").replace(/\*/g, "")}>
          {t.headline.map((line, i) => (
            <span className="ln" key={i} aria-hidden="true">
              <span>{withItalic(line)}</span>
            </span>
          ))}
        </Heading>
        {t.body && (
          <p className="ftext__body" data-piece>
            {t.body}
          </p>
        )}
        {t.meta && (
          <p className="ftext__meta" data-piece>
            {t.meta}
          </p>
        )}
        {t.list && (
          <ul className="ftext__list" data-piece>
            {t.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Layer({ name, src, depth, branch, hidden }: { name: string; src: string; depth?: number | undefined; branch?: "l" | "r"; hidden?: boolean }) {
  return (
    <div
      className={`layer${branch ? ` layer--branch-${branch}` : ""}`}
      data-layer={name}
      data-depth={depth}
      data-branch={branch}
      aria-hidden="true"
      hidden={hidden}
    >
      <div className="layer__in">
        <img src={src} alt="" decoding="async" draggable={false} />
      </div>
    </div>
  );
}

/* Text animation pieces, used inside the scrubbed timeline */
function textIn(tl: gsap.core.Timeline, el: Element, at: number) {
  const letters = el.querySelectorAll(".ch");
  const pieces = el.querySelectorAll("[data-piece]");
  tl.fromTo(el, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: 0, duration: 0.01, immediateRender: false }, at);
  tl.fromTo(
    letters,
    { yPercent: 105, autoAlpha: 0, filter: "blur(10px)" },
    { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.28, stagger: { amount: 0.16 }, immediateRender: false },
    at,
  );
  tl.fromTo(pieces, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.03, immediateRender: false }, at + 0.1);
}
/** Soft-edged circular reveal, scrubbed. Tweens a plain number and writes the mask string each update. */
function radialReveal(tl: gsap.core.Timeline, el: HTMLElement, x: number, y: number, radius: number, at: number, duration: number, ease = "none") {
  const feather = 160;
  const state = { r: 0 };
  const paint = () => {
    const inner = Math.max(0, state.r - feather);
    const mask = `radial-gradient(circle at ${x}px ${y}px, #000 ${inner}px, transparent ${state.r}px)`;
    el.style.setProperty("-webkit-mask-image", mask);
    el.style.setProperty("mask-image", mask);
  };
  paint();
  tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, at);
  tl.fromTo(state, { r: 0 }, { r: radius + feather, duration, ease, immediateRender: false, onUpdate: paint }, at);
}
function textOut(tl: gsap.core.Timeline, el: Element, at: number) {
  tl.fromTo(el, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.2, immediateRender: false }, at);
}

/* ------------------------------------------------------------------ */
/* The film                                                            */
/* ------------------------------------------------------------------ */

export default function ScrollFilm({ introReady }: { introReady: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isMobile = useMedia(MOBILE_QUERY);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const resizeKey = useResizeKey();
  const [introDone, setIntroDone] = useState(false);
  const solo = new URLSearchParams(window.location.search).get("solo"); // e.g. ?solo=lodge
  const hid = (n: string) => !!solo && solo !== n;

  /* 1. INTRO — plays once after the preloader. Layers appear one by one. */
  useLayoutEffect(() => {
    if (!introReady || introDone || reduced) {
      if (introReady && reduced) {
        setIntroDone(true);
        unlockScroll();
      }
      return;
    }
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stageRef);
      const inner = (name: string) => q(`[data-layer="${name}"] .layer__in`);
      const ui = document.querySelector(".fixed-ui");
      const hLines = document.querySelectorAll(".fixed-ui .ui-line--h");
      const vLines = document.querySelectorAll(".fixed-ui .ui-line--v");
      const crosses = document.querySelectorAll(".fixed-ui .ui-cross");
      const first = q('[data-text="arrival"]');
      const firstLetters = q('[data-text="arrival"] .ch');
      const firstPieces = q('[data-text="arrival"] [data-piece]');

      gsap.set(first, { autoAlpha: 1 });
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(inner(isMobile ? "master" : "hand"), { yPercent: -0.8, duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
          setIntroDone(true);
          unlockScroll();
        },
      });
      const settle = { autoAlpha: 1, scale: 1, duration: 1.6, ease: "expo.out" };

      if (isMobile) {
        tl.fromTo(inner("master"), { autoAlpha: 0, scale: 1.1 }, { ...settle, duration: 1.8 }, 0)
          .fromTo(inner("mist"), { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 1.2 }, 0.6)
          .fromTo(q(".glow__in"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 1, ease: "power2.out" }, 0.9);
      } else {
        tl.fromTo(inner("sky"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power2.out" }, 0)
          .fromTo(inner("peaks"), { autoAlpha: 0, scale: 1.12 }, settle, 0.25)
          .fromTo(inner("ridge"), { autoAlpha: 0, scale: 1.12 }, settle, 0.5)
          .fromTo(inner("lodge"), { autoAlpha: 0, scale: 1.12 }, settle, 0.75)
          .fromTo(inner("mist"), { autoAlpha: 0, scale: 1.12 }, { ...settle, autoAlpha: 0.9 }, 1.0)
          .fromTo(inner("hand"), { autoAlpha: 0, yPercent: 8, scale: 1.04 }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.6, ease: "expo.out" }, 1.25)
          .fromTo(q(".glow__in"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 1, ease: "power2.out" }, 1.4)
          .fromTo(inner("branches-l"), { autoAlpha: 0, xPercent: -12 }, { autoAlpha: 1, xPercent: 0, duration: 1.4, ease: "expo.out" }, 1.6)
          .fromTo(inner("branches-r"), { autoAlpha: 0, xPercent: 12 }, { autoAlpha: 1, xPercent: 0, duration: 1.4, ease: "expo.out" }, 1.6);
      }

      const uiAt = isMobile ? 1.2 : 1.8;
      tl.fromTo(hLines, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.out", stagger: 0.1 }, uiAt)
        .fromTo(vLines, { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: "power3.out", stagger: 0.1 }, uiAt)
        .fromTo(crosses, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, uiAt + 0.3)
        .fromTo(ui, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, uiAt + 0.3)
        .fromTo(firstLetters,
          { yPercent: 105, autoAlpha: 0, filter: "blur(12px)" },
          { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out", stagger: { amount: 0.6 } },
          uiAt + 0.3)
        .fromTo(firstPieces, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, uiAt + 0.6);
    }, rootRef);
    return () => ctx.revert();
    // The intro must only ever play once, so it ignores layout changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introReady, reduced]);

  /* 2. AMBIENT LOOPS — mist drift and lantern breathing, always running. */
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".glow__pulse", { opacity: 0.75, scale: 0.96 }, { opacity: 1, scale: 1.04, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }, rootRef);
    return () => ctx.revert();
  }, [isMobile, reduced]);

  /* 3. THE SCROLL FILM — one scrubbed timeline, one beat = one screen of scroll. */
  useLayoutEffect(() => {
    if (!introReady || reduced) return;
    const ctx = gsap.context(() => {
      const root = rootRef.current!;
      const stage = stageRef.current!;
      const q = gsap.utils.selector(stage);
      const one = (sel: string) => q(sel)[0] as HTMLElement;
      const W = stage.clientWidth;
      const H = stage.clientHeight;

      /* --- measure the flame, window and fire for THIS screen size --- */
      const refImg = one(isMobile ? '[data-layer="master"] img' : '[data-layer="hand"] img') as HTMLImageElement;
      const fp = isMobile ? POINTS.flameMaster : POINTS.flame;
      const inLayer = coverPoint(W * (1 + 2 * OVERSCAN), H * (1 + 2 * OVERSCAN), refImg.naturalWidth, refImg.naturalHeight, fp.x, fp.y);
      const flame = { x: inLayer.x - W * OVERSCAN, y: inLayer.y - H * OVERSCAN };
      gsap.set(stage, { "--fx": `${inLayer.x}px`, "--fy": `${inLayer.y}px` });

      const lodgeScene = one('[data-scene="lodge"]');
      const glow = one(".glow");
      const light = one(".veil--light");
      const ink = one(".veil--ink");
      const suiteScene = one('[data-scene="suite"]');
      const suiteImg = suiteScene.querySelector("img") as HTMLImageElement;
      const diningScene = one('[data-scene="dining"]');
      const diningImg = diningScene.querySelector("img") as HTMLImageElement;
      const ui = document.querySelector(".fixed-ui");
      const text = (id: string) => one(`[data-text="${id}"]`);

      const win = coverPoint(W, H, suiteImg.naturalWidth, suiteImg.naturalHeight, POINTS.suiteWindow.x, POINTS.suiteWindow.y);
      const fire = coverPoint(W, H, diningImg.naturalWidth, diningImg.naturalHeight, POINTS.diningFire.x, POINTS.diningFire.y);
      const fireRadius = Math.hypot(Math.max(fire.x, W - fire.x), Math.max(fire.y, H - fire.y)) + 4;

      // Every hero layer scales around the flame, so the flame never moves on screen.
      gsap.set(q("[data-layer]"), { transformOrigin: `${inLayer.x}px ${inLayer.y}px` });
      gsap.set(lodgeScene, { transformOrigin: `${flame.x}px ${flame.y}px` });
      gsap.set(glow, { left: flame.x, top: flame.y, xPercent: -50, yPercent: -50 });
      gsap.set(light, { "--lx": `${flame.x}px`, "--ly": `${flame.y}px` });
      const embers = stage.querySelector(".embers") as HTMLCanvasElement | null;
      if (embers) { embers.dataset["fx"] = String(flame.x); embers.dataset["fy"] = String(flame.y); }
      gsap.set(suiteScene, { transformOrigin: `${win.x}px ${win.y}px` });
      gsap.set(diningImg, { transformOrigin: `${fire.x}px ${fire.y}px` });

      const tl = gsap.timeline({ defaults: { ease: "none" } });

      /* BEAT 1 + 2 (0 → 2): depth push-in. Back layers move little, front layers move most. */
      q("[data-depth]").forEach((el) => {
        const d = parseFloat((el as HTMLElement).dataset["depth"] || "0");
        tl.to(el, { scale: 1 + d, duration: 1 }, 0).to(el, { scale: 1 + d * 1.6, duration: 1 }, 1);
      });
      tl.to(q('[data-layer="mist"]'), { opacity: 0.6, duration: 1 }, 0);

      /* BEAT 1: the branches part like curtains (desktop only) */
      if (!isMobile) {
        const left = q('[data-branch="l"]');
        const right = q('[data-branch="r"]');
        tl.to(left, { xPercent: -38, scale: 1.15, duration: 0.7 }, 0)
          .to(right, { xPercent: 38, scale: 1.15, duration: 0.7 }, 0)
          .to([...left, ...right], { autoAlpha: 0, duration: 0.2 }, 0.5);
      }
      textOut(tl, text("arrival"), 0.15);

      /* BEAT 2: the lodge */
      textIn(tl, text("lodge"), 1.1);
      textOut(tl, text("lodge"), 1.8);

      /* BEAT 3 (2 → 3): dive into the lantern flame until the screen is light */
      tl.to(lodgeScene, { scale: 4.5, duration: 0.8, ease: "power2.in" }, 2)
        .to(glow, { scale: 2.4, duration: 0.8, ease: "power2.in" }, 2)
        .fromTo(light, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, 2.45)
        .to(lodgeScene, { autoAlpha: 0, duration: 0.01 }, 2.9)
        .fromTo(ui, { color: CREAM }, { color: INK, duration: 0.1, immediateRender: false }, 2.6)
        .to(ui, { color: CREAM, duration: 0.1 }, 3.2);

      textIn(tl, text("light"), 2.62);
      textOut(tl, text("light"), 3.05);

      /* BEAT 4 (3 → 4): the suite emerges from the light */
      tl.fromTo(suiteScene, { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1.08, duration: 0.5, immediateRender: false }, 3)
        .to(light, { autoAlpha: 0, duration: 0.5 }, 3)
        .to(suiteScene, { scale: 1.14, duration: 0.5 }, 3.5);
      textIn(tl, text("stay"), 3.3);
      textOut(tl, text("stay"), 3.85);

      /* BEAT 5 (4 → 5): dusk wipes down, the dining room grows out of the fire */
      tl.fromTo(ink, { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, immediateRender: false }, 4)
        .to(suiteScene, { scale: 1.2, duration: 0.45 }, 4)
      radialReveal(tl, diningScene, fire.x, fire.y, fireRadius, 4.45, 0.55);
      tl.fromTo(diningImg, { scale: 1.15 }, { scale: 1.04, duration: 0.55, immediateRender: false }, 4.45)
        .to([suiteScene, ink], { autoAlpha: 0, duration: 0.01 }, 5);

      /* BEAT 6 (5 → 6): dining. Its text stays — Batch 2 continues from here. */
      tl.to(diningImg, { scale: 1.1, duration: 1 }, 5);
      textIn(tl, text("dining"), 5.1);
      /* ===================== BATCH 2 ===================== */
      const trailScene = one('[data-scene="trail"]');
      const trailImg = trailScene.querySelector("img") as HTMLImageElement;
      const nightVeil = one(".veil--night");
      const starsScene = one('[data-scene="stars"]');
      const starsImg = starsScene.querySelector("img") as HTMLImageElement;
      const endLight = one(".veil--end");
      const starsPosX = isMobile ? STARS_MOBILE_POS_X : 50;

      const dWin = coverPoint(W, H, diningImg.naturalWidth, diningImg.naturalHeight, POINTS.diningWindow.x, POINTS.diningWindow.y);
      const tFocus = coverPoint(W, H, trailImg.naturalWidth, trailImg.naturalHeight, POINTS.trailFocus.x, POINTS.trailFocus.y);
      // The stars image is 20% larger than the stage (inset -10%) and ends the tilt at yPercent -7.
      const sBox = coverPoint(W * 1.2, H * 1.2, starsImg.naturalWidth, starsImg.naturalHeight, POINTS.starsLodge.x, POINTS.starsLodge.y, starsPosX, 50);
      const lodgeAt = { x: sBox.x - W * 0.1, y: sBox.y - H * 0.1 - H * 1.2 * 0.07 };
      const endRadius = Math.hypot(Math.max(lodgeAt.x, W - lodgeAt.x), Math.max(lodgeAt.y, H - lodgeAt.y)) + 4;

      gsap.set(diningScene, { transformOrigin: `${dWin.x}px ${dWin.y}px` });
      gsap.set(trailImg, { transformOrigin: `${tFocus.x}px ${tFocus.y}px` });

      /* BEAT 7 (6 → 7): through the dining window into the morning */
      textOut(tl, text("dining"), 6.05);
      tl.to(diningScene, { scale: 3.2, duration: 0.7, ease: "power2.in" }, 6.0)
        .fromTo(trailScene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, 6.45)
        .fromTo(trailImg, { scale: 1.8 }, { scale: 1, duration: 1.05, ease: "power2.out", immediateRender: false }, 6.45)
        .to(diningScene, { autoAlpha: 0, duration: 0.01 }, 6.8);

      /* BEAT 8 (7 → 8): the trail */
      textIn(tl, text("trail"), 7.0);
      tl.to(trailImg, { scale: 1.05, duration: 0.5 }, 7.5);
      textOut(tl, text("trail"), 7.8);

      /* BEAT 9 (8 → 9): night falls from the sky, the stars appear */
      tl.fromTo(nightVeil, { autoAlpha: 1, yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: "power1.inOut", immediateRender: false }, 8.0)
        .fromTo(starsScene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, 8.45)
        .fromTo(starsImg, { yPercent: 7 }, { yPercent: -7, duration: 1.55, immediateRender: false }, 8.45)
        .to([trailScene, nightVeil], { autoAlpha: 0, duration: 0.01 }, 8.9);

      /* BEAT 10 (9 → 10): tilt down from the Milky Way to the lodge */
      textIn(tl, text("stars"), 9.1);
      textOut(tl, text("stars"), 9.8);

      /* BEAT 11 (10 → 11): the lodge's light fills the screen and becomes the booking page */
      radialReveal(tl, endLight, lodgeAt.x, lodgeAt.y, endRadius, 10.0, 0.6, "power2.in");
      tl.to(ui, { color: INK, duration: 0.1 }, 10.4);

      const vignette = one(".film__vignette");
      const shade = one(".film__shade");
      tl.to([vignette, shade], { autoAlpha: 0, duration: 0.2 }, 2.5)
        .to([vignette, shade], { autoAlpha: 1, duration: 0.3 }, 3.1)
        .to([vignette, shade], { autoAlpha: 0, duration: 0.3 }, 10.2);

      tl.set({}, {}, BEATS); // timeline is exactly BEATS long

      const st = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        animation: tl,
        onLeave: () => document.querySelector(".ui-chapter")?.classList.add("is-hidden"),
        onEnterBack: () => document.querySelector(".ui-chapter")?.classList.remove("is-hidden"),
        onUpdate: (self) => {
          const beat = self.progress * BEATS;
          const label = [...CHAPTERS].reverse().find((c) => beat >= c.from)!.label;
          const labelEl = document.querySelector(".ui-chapter__label");
          if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
          const fill = document.querySelector(".ui-chapter__fill") as HTMLElement | null;
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
        markers: new URLSearchParams(window.location.search).has("debug"),
      });
      // Jump straight to the current scroll position after a rebuild, instead of replaying from 0.
      tl.progress(st.progress);
    }, rootRef);
    return () => ctx.revert();
  }, [introReady, isMobile, reduced, resizeKey]);

  /* Reduced motion: five still scenes, everything readable. */
  if (reduced) {
    const byId = (id: string) => TEXTS.find((t) => t.id === id)!;
    const stills = [
      { img: isMobile ? heroMobile : master, t: byId("arrival"), alt: "Painted lodge among snowy peaks, with a marble hand holding a lantern above the mist." },
      { img: suite, t: byId("stay"), alt: "Lodge suite with a wide window facing snowy peaks." },
      { img: dining, t: byId("dining"), alt: "Candlelit table beside a stone fireplace." },
      { img: trail, t: byId("trail"), alt: "Mountain trail on a ridge at sunrise, above a sea of clouds." },
      { img: stars, t: byId("stars"), alt: "The lodge at night under the Milky Way." },
    ];
    return (
      <section className="film film--still">
        {stills.map(({ img, t, alt }, i) => (
          <div className="still" key={t.id}>
            <img src={img} alt={alt} />
            <TextBlock t={t} isFirst={i === 0} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={rootRef} className={`film${introDone ? " is-intro-done" : ""}${solo ? " film--solo" : ""}`} style={{ height: `${(BEATS + 1) * 100}svh` }} aria-label="Kestrel Ridge Lodge">
      <div ref={stageRef} className="film__stage">
        {/* SCENE 1 — the lodge (z 10) */}
        <div className="scene" data-scene="lodge">
          {isMobile ? (
            <>
              <Layer name="master" src={heroMobile} depth={0.15} hidden={hid("master")} />
              <div className="layer" data-layer="mist" data-depth="0.22" aria-hidden="true" hidden={hid("mist")}>
                <div className="layer__in">
                  <Fog blobs={6} strength={0.7} />
                </div>
              </div>
              <div className="glow" aria-hidden="true">
                <div className="glow__in">
                  <div className="glow__rays" />
                  <div className="glow__pulse" />
                </div>
              </div>
              <Embers count={22} />
            </>
          ) : (
            <>
              {BACK_LAYERS.map((l) => (
                <Fragment key={l.key}>
                  <Layer name={l.key} src={l.src} depth={l.depth || undefined} hidden={hid(l.key)} />
                </Fragment>
              ))}
              <div className="layer" data-layer="mist" data-depth="0.22" aria-hidden="true" hidden={hid("mist")}>
                <div className="layer__in">
                  <Fog blobs={9} strength={1} />
                </div>
              </div>
              <div className="glow" aria-hidden="true">
                <div className="glow__in">
                  <div className="glow__rays" />
                  <div className="glow__pulse" />
                </div>
              </div>
              <Layer name={HAND.key} src={HAND.src} depth={HAND.depth} hidden={hid(HAND.key)} />
              <Embers count={40} />
              <Layer name="branches-l" src={branches} branch="l" hidden={hid("branches-l")} />
              <Layer name="branches-r" src={branches} branch="r" hidden={hid("branches-r")} />
            </>
          )}
          <p className="sr-only">Painted scene of a timber lodge among snowy peaks, with a marble hand holding a lantern above the mist.</p>
        </div>

        {/* SCENE 2 — the suite (z 20) */}
        <div className="scene scene--suite" data-scene="suite">
          <img src={suite} alt="Lodge suite with a wide window facing snowy peaks." decoding="async" />
        </div>

        {/* Transition veils (z 30, 40) */}
        <div className="veil veil--light" aria-hidden="true" />
        <div className="veil veil--ink" aria-hidden="true" />

        {/* SCENE 3 — dining (z 50) */}
        <div className="scene scene--dining" data-scene="dining">
          <img src={dining} alt="Candlelit table for two beside a stone fireplace." decoding="async" />
        </div>

        {/* SCENE 4 — trail (z 55) */}
        <div className="scene scene--trail" data-scene="trail">
          <img src={trail} alt="Mountain trail on a ridge at sunrise, above a sea of clouds." decoding="async" />
        </div>

        {/* Night falls (z 58) */}
        <div className="veil veil--night" aria-hidden="true" />

        {/* SCENE 5 — stars (z 60) */}
        <div className="scene scene--stars" data-scene="stars">
          <img src={stars} alt="The lodge at night under the Milky Way." decoding="async" />
        </div>

        {/* The lodge's light fills the screen and becomes the booking page (z 65) */}
        <div className="veil veil--end" aria-hidden="true" />

        {/* Text always sits above every image (z 80) */}
        <div className="film__shade" aria-hidden="true" />
        <div className="film__vignette" aria-hidden="true" />
        <div className="film__grain" aria-hidden="true" />
        <div className="film__texts">
          {TEXTS.map((t, i) => (
            <TextBlock key={t.id} t={t} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
