import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Small ring that follows the mouse and grows over anything clickable (desktop only). */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      if (el.hidden) {
        el.hidden = false;
        gsap.set(el, { x: e.clientX, y: e.clientY });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: Event) => {
      const hit = (e.target as HTMLElement).closest?.("a, button, input, select, label");
      el.classList.toggle("is-hover", !!hit);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, []);
  return <div ref={ref} className="cursor" hidden aria-hidden="true" />;
}
