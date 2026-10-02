import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { DESKTOP_SOURCES, MOBILE_SOURCES } from "./ScrollFilm";

/** Resolves when the image has loaded and decoded — and ALSO when it fails. It never rejects. */
function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const decoded = img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
      decoded.then(() => resolve());
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [finished, setFinished] = useState(false);
  const [gone, setGone] = useState(false);

  // Load everything the film needs for this screen size. 6 second safety limit.
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const sources = isMobile ? MOBILE_SOURCES : DESKTOP_SOURCES;
    let count = 0;
    let cancelled = false;
    const all = Promise.allSettled(
      sources.map((src) =>
        loadImage(src).then(() => {
          count += 1;
          if (!cancelled) setLoaded(Math.round((count / sources.length) * 100));
        }),
      ),
    );
    const timeout = new Promise((r) => setTimeout(r, 6000));
    Promise.race([all, timeout]).then(() => {
      if (!cancelled) {
        setLoaded(100);
        setFinished(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // When loading is finished: wait 300ms, wipe upward, start the intro 0.4s into the wipe.
  useLayoutEffect(() => {
    if (!finished) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setGone(true);
      onDone();
      return;
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.3, onComplete: () => setGone(true) })
        .to(rootRef.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "power4.inOut" })
        .call(onDone, [], 0.4);
    }, rootRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (gone) return null;
  return (
    <div ref={rootRef} className="preloader" role="status" aria-live="polite">
      <p className="preloader__name">Kestrel Ridge</p>
      <p className="preloader__label">Elevation 2,940 m</p>
      <p className="preloader__count">{String(loaded).padStart(3, "0")}</p>
    </div>
  );
}
