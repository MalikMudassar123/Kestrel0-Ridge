import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToId } from "@/lib/smoothScroll";

/**
 * The thin interface that stays on top of the film the whole time, like the reference:
 * tiny wordmark + square menu button top-left, small boxed button top-right,
 * hairline guide lines with "+" marks where they cross.
 * All colours use currentColor, so the film can switch the whole UI from cream to ink
 * by animating one `color` value on .fixed-ui.
 */
export default function FixedUI() {
  const bookRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const btn = bookRef.current;
    if (!btn || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < 90;
      xTo(near ? dx * 0.25 : 0);
      yTo(near ? dy * 0.25 : 0);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <header className="fixed-ui">
      <div className="ui-line ui-line--h ui-line--top" aria-hidden="true" />
      <div className="ui-line ui-line--h ui-line--bottom" aria-hidden="true" />
      <div className="ui-line ui-line--v ui-line--left" aria-hidden="true" />
      <div className="ui-line ui-line--v ui-line--right" aria-hidden="true" />
      <span className="ui-cross ui-cross--tl" aria-hidden="true" />
      <span className="ui-cross ui-cross--tr" aria-hidden="true" />
      <span className="ui-cross ui-cross--bl" aria-hidden="true" />
      <span className="ui-cross ui-cross--br" aria-hidden="true" />

      <div className="ui-brand">
        <a className="ui-wordmark" href="#top">
          Kestrel Ridge
        </a>
        <button className="ui-menu" type="button" aria-label="Open menu" onClick={() => window.dispatchEvent(new Event("menu:open"))}>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            <circle cx="3" cy="3" r="1.2" fill="currentColor" />
            <circle cx="9" cy="3" r="1.2" fill="currentColor" />
            <circle cx="3" cy="9" r="1.2" fill="currentColor" />
            <circle cx="9" cy="9" r="1.2" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="ui-chapter" aria-hidden="true">
        <span className="ui-chapter__label">00 — Arrival</span>
        <span className="ui-chapter__bar"><span className="ui-chapter__fill" /></span>
      </div>

      <button ref={bookRef} className="ui-book" type="button" onClick={() => scrollToId("book")}>
        Book <span aria-hidden="true">→</span>
      </button>
    </header>
  );
}
