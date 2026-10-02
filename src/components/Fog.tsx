import { useEffect, useRef } from "react";

/**
 * Soft valley fog drawn in code. No image, so no edges can ever appear.
 * Drawn at quarter resolution and stretched by CSS, which makes it naturally soft.
 */
export default function Fog({ blobs = 9, strength = 1 }: { blobs?: number; strength?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 0.25;
    let w = 1, h = 1;
    const resize = () => {
      w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const list = Array.from({ length: blobs }, (_, i) => ({
      x: Math.random(),
      y: 0.66 + Math.random() * 0.24, // fog lives in the lower part of the valley
      r: 0.12 + Math.random() * 0.14,
      speed: (0.006 + Math.random() * 0.008) * (i % 2 ? 1 : -1),
      alpha: (0.16 + Math.random() * 0.16) * strength,
      phase: Math.random() * Math.PI * 2,
    }));
    const STRETCH = 2.4;

    const scene = canvas.closest(".scene") as HTMLElement | null;
    const start = performance.now();
    let raf = 0, last = 0;

    const draw = (now: number) => {
      const t = reduced ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const margin = (STRETCH * 0.26 * h) / w + 0.1;
      const span = 1 + margin * 2;
      for (const b of list) {
        const xf = ((((b.x * span + b.speed * t) % span) + span) % span) - margin;
        const yf = b.y + Math.sin(b.phase + t * 0.15) * 0.012;
        const px = xf * w, py = yf * h, rr = b.r * h;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(STRETCH, 1);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rr);
        g.addColorStop(0, `rgba(238, 222, 200, ${b.alpha})`);
        g.addColorStop(0.55, `rgba(238, 222, 200, ${b.alpha * 0.5})`);
        g.addColorStop(1, "rgba(238, 222, 200, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 33) return;
      last = now;
      if (document.hidden || (scene && scene.style.visibility === "hidden")) return;
      draw(now);
    };
    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [blobs, strength]);

  return <canvas ref={ref} className="fog" aria-hidden="true" />;
}
