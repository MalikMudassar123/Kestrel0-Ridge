import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToY } from "@/lib/smoothScroll";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);

  // Over the dark footer, the fixed UI must be cream again.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 96px",
        end: "bottom top",
        onToggle: (self) => document.body.toggleAttribute("data-ui-on-dark", self.isActive),
      });
    }, ref);
    return () => {
      ctx.revert();
      document.body.removeAttribute("data-ui-on-dark");
    };
  }, []);

  return (
    <footer ref={ref} className="footer">
      <div className="footer__grid">
        <div>
          <p className="footer__brand">Kestrel Ridge</p>
          <p className="footer__line">A lodge above the clouds.</p>
        </div>
        <div>
          <p className="footer__head">Write to us</p>
          <p className="footer__select">stay@kestrelridge.example</p>
          <p className="footer__select">+00 000 000 0000</p>
        </div>
        <div>
          <p className="footer__head">Find us</p>
          <p className="footer__mono">36.32° N · 74.65° E</p>
          <p className="footer__mono">Elevation 2,940 m</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2026 Kestrel Ridge Lodge — demo concept</p>
        <button type="button" className="footer__top" onClick={() => scrollToY(0)}>Back to top ↑</button>
      </div>
    </footer>
  );
}
