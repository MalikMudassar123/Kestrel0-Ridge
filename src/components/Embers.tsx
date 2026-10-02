import { useEffect, useRef } from "react";

/** A few warm sparks rising from the lantern flame. Reads the flame position from data-fx / data-fy. */
export default function Embers({ count = 40 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,226,170,1)");
    g.addColorStop(0.35, "rgba(255,170,70,0.8)");
    g.addColorStop(1, "rgba(255,140,40,0)");
    s.fillStyle = g; s.fillRect(0, 0, 32, 32);

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; seed: number };
    const sparks: Spark[] = [];
    const spawn = () => {
      const fx = parseFloat(canvas.dataset["fx"] || "") || w / 2;
      const fy = parseFloat(canvas.dataset["fy"] || "") || h / 2;
      sparks.push({
        x: fx + (Math.random() - 0.5) * 24, y: fy + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 0.3, vy: -(0.3 + Math.random() * 0.6),
        life: 0, max: 160 + Math.random() * 200, size: 4 + Math.random() * 7, seed: Math.random() * 100,
      });
    };

    let raf = 0, last = 0;
    const scene = canvas.closest(".scene") as HTMLElement | null;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 33) return; // ~30 fps is plenty for sparks
      last = t;
      if (document.hidden || (scene && scene.style.visibility === "hidden")) return;
      ctx.clearRect(0, 0, w, h);
      if (sparks.length < count && Math.random() < 0.6) spawn();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!;
        p.life += 1;
        p.x += p.vx + Math.sin((p.life + p.seed) * 0.035) * 0.25;
        p.y += p.vy;
        const k = p.life / p.max;
        if (k >= 1) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = Math.sin(Math.PI * k) * 0.85;
        ctx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);

  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}
