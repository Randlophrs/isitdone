import { useEffect, useRef } from "react";

type Beam = {
  axis: "h" | "v";
  line: number;
  dir: 1 | -1;
  head: number;
  speed: number;
  len: number;
};

const GRID = 44;

export function GridSweep() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d")!;
    const canvas = canvasEl;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const accentRgb =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "129 140 248";
    const accent = accentRgb.replace(/\s+/g, ",");

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let nextSpawn = 0;
    const beams: Beam[] = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(now: number) {
      const horizontal = Math.random() < 0.5;
      const max = horizontal ? h : w;
      const line = Math.floor(Math.random() * (Math.floor(max / GRID) + 1)) * GRID;
      const fromStart = Math.random() < 0.5;
      const end = horizontal ? w : h;
      beams.push({
        axis: horizontal ? "h" : "v",
        line,
        dir: fromStart ? 1 : -1,
        head: fromStart ? 0 : end,
        speed: 0.18 + Math.random() * 0.12,
        len: 120 + Math.random() * 90,
      });
      nextSpawn = now + (reduce ? 2500 : 350) + Math.random() * (reduce ? 2000 : 900);
      if (beams.length > 14) beams.shift();
    }

    function frame(now: number) {
      if (!last) last = now;
      const dt = Math.min(now - last, 50);
      last = now;
      if (now >= nextSpawn) spawn(now);

      const end = (b: Beam) => (b.axis === "h" ? w : h);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = beams.length - 1; i >= 0; i--) {
        const b = beams[i];
        b.head += b.dir * b.speed * dt;
        const tail = b.head - b.dir * b.len;
        const x0 = b.axis === "h" ? tail : b.line;
        const y0 = b.axis === "h" ? b.line : tail;
        const x1 = b.axis === "h" ? b.head : b.line;
        const y1 = b.axis === "h" ? b.line : b.head;
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, `rgba(${accent}, 0)`);
        g.addColorStop(1, `rgba(${accent}, 0.95)`);
        ctx.strokeStyle = g;
        ctx.shadowColor = `rgba(${accent}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.shadowBlur = 0;
        if ((b.dir === 1 && b.head > end(b)) || (b.dir === -1 && b.head < 0)) {
          beams.splice(i, 1);
        }
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    spawn(0);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    />
  );
}
