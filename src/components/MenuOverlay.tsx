import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToBeat, scrollToId } from "@/lib/smoothScroll";

const LINKS = [
  { label: "The lodge", go: () => scrollToBeat(1.5) },
  { label: "The stay", go: () => scrollToBeat(3.6) },
  { label: "Dining", go: () => scrollToBeat(5.6) },
  { label: "Experiences", go: () => scrollToBeat(7.4) },
  { label: "Nights", go: () => scrollToBeat(9.4) },
  { label: "Book a stay", go: () => scrollToId("book") },
];

export default function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("menu:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("menu:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const ctx = gsap.context(() => {
      gsap.fromTo(rootRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(".menu__link", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 0.1 });
    }, rootRef);
    return () => ctx.revert();
  }, [open]);

  /* Keep Tab focus inside the menu */
  const trap = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !rootRef.current) return;
    const items = rootRef.current.querySelectorAll<HTMLElement>("button");
    const first = items[0], last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  if (!open) return null;
  return (
    <div ref={rootRef} className="menu" role="dialog" aria-modal="true" aria-label="Menu" onKeyDown={trap}>
      <button ref={closeRef} className="menu__close" type="button" onClick={() => setOpen(false)}>Close</button>
      <nav>
        <ul className="menu__list">
          {LINKS.map((l) => (
            <li key={l.label}>
              <button className="menu__link" type="button" onClick={() => { setOpen(false); l.go(); }}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <p className="menu__meta">36.32° N · 74.65° E · Elevation 2,940 m</p>
    </div>
  );
}
