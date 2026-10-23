import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type Orbit = {
  x: number; y: number; rx: number; ry: number; rotation: number;
  speed: number; phase: number; depth: number; arc: number; start: number;
};
type Triangle = { points: [Point, Point, Point]; rotation: number; speed: number; depth: number; phase: number };
type Particle = {
  path: number; angle: number; speed: number; direction: number; size: number;
  depth: number; phase: number; pulse: number; trail: Point[]; trailLimit: number;
  mode: number; modeTimer: number;
};

const COLORS = {
  teal: "#79c8c8",
  tealBright: "#b1eeee",
  rose: "#da7b93",
  ivory: "#f4f3f0",
  line: "rgba(121, 200, 200, 0.20)",
};
const CONFIG = {
  particleCount: 48,
  orbitCount: 15,
  triangleCount: 10,
  trailLength: 9,
  glow: 1,
  lineOpacity: 1,
  pointerParallax: 0.012,
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seeded = (seed: number) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export default function OrbitalParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let lastTime = 0;
    let elapsed = 0;
    let hidden = document.hidden;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let frameSamples = 0;
    let sampleTime = 0;
    let qualityScale = 1;
    let orbits: Orbit[] = [];
    let triangles: Triangle[] = [];
    let particles: Particle[] = [];
    let reduced = reducedMotion.matches;
    let pulseNodes: { x: number; y: number; strength: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.65);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene();
    };

    const buildScene = () => {
      const shortSide = Math.min(width, height);
      const count = width < 600 ? 9 : CONFIG.orbitCount;
      orbits = Array.from({ length: count }, (_, i) => {
        const s = i + 1;
        const rx = shortSide * (0.055 + seeded(s * 2) * (width < 600 ? 0.15 : 0.23));
        const ry = rx * (0.55 + seeded(s * 5) * 0.65);
        return {
          x: width * (0.07 + seeded(s * 7) * 0.86),
          y: height * (0.08 + seeded(s * 11) * 0.84),
          rx, ry, rotation: seeded(s * 13) * Math.PI,
          speed: (0.035 + seeded(s * 17) * 0.06) * (i % 2 ? -1 : 1),
          phase: seeded(s * 19) * Math.PI * 2,
          depth: 0.22 + seeded(s * 23) * 0.65,
          arc: seeded(s * 29) > 0.66 ? Math.PI * (1.25 + seeded(s * 31) * 0.6) : Math.PI * 2,
          start: seeded(s * 37) * Math.PI * 2,
        };
      });
      triangles = Array.from({ length: width < 600 ? 5 : CONFIG.triangleCount }, (_, i) => {
        const s = i + 91;
        const cx = width * (0.08 + seeded(s * 2) * 0.84);
        const cy = height * (0.08 + seeded(s * 3) * 0.84);
        const radius = shortSide * (0.035 + seeded(s * 5) * 0.09);
        const angle = seeded(s * 7) * Math.PI * 2;
        const points: [Point, Point, Point] = [0, 1, 2].map((j) => ({
          x: cx + Math.cos(angle + j * Math.PI * 2 / 3) * radius,
          y: cy + Math.sin(angle + j * Math.PI * 2 / 3) * radius,
        })) as [Point, Point, Point];
        return { points, rotation: angle, speed: (seeded(s * 11) - 0.5) * 0.12, depth: 0.24 + seeded(s * 13) * 0.62, phase: seeded(s * 17) * Math.PI * 2 };
      });
      particles = Array.from({ length: Math.round(CONFIG.particleCount * (width < 600 ? 0.58 : 1) * qualityScale) }, (_, i) => ({
        path: i % Math.max(1, orbits.length),
        angle: seeded(i + 101) * Math.PI * 2,
        speed: 0.14 + seeded(i + 211) * (i % 7 === 0 ? 0.45 : 0.25),
        direction: i % 3 === 0 ? -1 : 1,
        size: 0.7 + seeded(i + 307) * (i % 6 === 0 ? 1.8 : 0.8),
        depth: 0.25 + seeded(i + 401) * 0.7,
        phase: seeded(i + 503) * 12,
        pulse: seeded(i + 601) * Math.PI * 2,
        trail: [],
        trailLimit: i % 7 === 0 ? CONFIG.trailLength + 5 : CONFIG.trailLength,
        mode: i % 7 === 0 ? 1 : 0,
        modeTimer: seeded(i + 701) * 5,
      }));
      pulseNodes = orbits.map((o) => ({ x: o.x, y: o.y, strength: 0 }));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      targetX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * width * CONFIG.pointerParallax;
      targetY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * height * CONFIG.pointerParallax;
    };
    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden) { lastTime = 0; raf = requestAnimationFrame(draw); }
      else cancelAnimationFrame(raf);
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      if (reduced) { targetX = 0; targetY = 0; }
    };

    const rotatePoint = (p: Point, cx: number, cy: number, angle: number): Point => {
      const x = p.x - cx; const y = p.y - cy;
      return { x: cx + x * Math.cos(angle) - y * Math.sin(angle), y: cy + x * Math.sin(angle) + y * Math.cos(angle) };
    };
    const orbitPoint = (o: Orbit, angle: number): Point => {
      const a = angle + o.rotation;
      return { x: o.x + Math.cos(a) * o.rx, y: o.y + Math.sin(a) * o.ry };
    };
    const draw = (timestamp: number) => {
      if (hidden) return;
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min(0.035, (timestamp - lastTime) / 1000);
      lastTime = timestamp;
      elapsed += dt;
      frameSamples++;
      sampleTime += dt;
      if (sampleTime > 2.5) {
        const fps = frameSamples / sampleTime;
        if (fps < 38 && qualityScale > 0.55) { qualityScale = 0.55; buildScene(); }
        else if (fps > 55 && qualityScale < 1) { qualityScale = 1; buildScene(); }
        frameSamples = 0; sampleTime = 0;
      }

      ctx.clearRect(0, 0, width, height);
      pointerX = lerp(pointerX, reduced ? 0 : targetX, 0.035);
      pointerY = lerp(pointerY, reduced ? 0 : targetY, 0.035);
      const motion = reduced ? 0.12 : 1;
      const ox = pointerX;
      const oy = pointerY;

      // Distant orbital layer.
      for (const o of orbits) {
        const drift = reduced ? 0 : Math.sin(elapsed * 0.12 + o.phase) * 3;
        const cx = o.x + ox * o.depth + drift;
        const cy = o.y + oy * o.depth;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(o.rotation + (reduced ? 0 : Math.sin(elapsed * 0.07 + o.phase) * 0.08));
        ctx.beginPath();
        ctx.ellipse(0, 0, o.rx, o.ry, 0, o.start, o.start + o.arc);
        ctx.strokeStyle = `rgba(121, 200, 200, ${o.depth * 0.16 * CONFIG.lineOpacity})`;
        ctx.lineWidth = o.depth > 0.65 ? 0.9 : 0.65;
        ctx.stroke();
        if (o.depth > 0.62) {
          ctx.beginPath();
          ctx.ellipse(0, 0, o.rx * 0.88, o.ry * 0.88, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(218,123,147,0.10)";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Wireframe triangles, with slow independent rotation.
      for (const t of triangles) {
        const cx = (t.points[0].x + t.points[1].x + t.points[2].x) / 3;
        const cy = (t.points[0].y + t.points[1].y + t.points[2].y) / 3;
        const rot = reduced ? 0 : Math.sin(elapsed * 0.08 + t.phase) * 0.10 + elapsed * t.speed;
        const pts = t.points.map((p) => rotatePoint(p, cx, cy, rot));
        ctx.beginPath();
        ctx.moveTo(pts[0].x + ox * t.depth, pts[0].y + oy * t.depth);
        ctx.lineTo(pts[1].x + ox * t.depth, pts[1].y + oy * t.depth);
        ctx.lineTo(pts[2].x + ox * t.depth, pts[2].y + oy * t.depth);
        ctx.closePath();
        ctx.strokeStyle = `rgba(218,123,147,${0.10 + t.depth * 0.13})`;
        ctx.lineWidth = t.depth > 0.65 ? 0.9 : 0.6;
        ctx.stroke();
        if (t.depth > 0.66 && t.phase > 1.5) {
          ctx.beginPath();
          ctx.moveTo(lerp(pts[0].x, pts[1].x, .5), lerp(pts[0].y, pts[1].y, .5));
          ctx.lineTo(lerp(pts[1].x, pts[2].x, .5), lerp(pts[1].y, pts[2].y, .5));
          ctx.strokeStyle = "rgba(121,200,200,0.11)";
          ctx.stroke();
        }
      }

      // Sparse constellations connect nearby orbit centers, not every object.
      for (let i = 0; i < orbits.length; i++) {
        const a = orbits[i];
        const nearest = orbits[(i + 3) % orbits.length];
        const ax = a.x + ox * a.depth; const ay = a.y + oy * a.depth;
        const bx = nearest.x + ox * nearest.depth; const by = nearest.y + oy * nearest.depth;
        const dist = Math.hypot(ax - bx, ay - by);
        if (dist < Math.min(width, height) * 0.5) {
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.strokeStyle = COLORS.line; ctx.lineWidth = 0.65; ctx.stroke();
        }
      }

      // Traveling motes, trails and local energy pulses.
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const orbit = orbits[p.path % orbits.length];
        const behavior = p.mode === 1 ? (0.45 + 0.55 * Math.sin(elapsed * 1.8 + p.phase)) : 1;
        const speedBoost = p.mode === 1 && !reduced ? 1 + Math.max(0, Math.sin(elapsed * 2.1 + p.phase)) * 1.7 : 1;
        if (!reduced) {
          p.angle += dt * p.speed * p.direction * speedBoost * motion;
          p.modeTimer += dt;
          if (p.mode === 1 && p.modeTimer > 4 + p.phase % 3) { p.modeTimer = 0; p.direction *= -1; }
        }
        const point = orbitPoint(orbit, p.angle + Math.sin(elapsed * 0.6 + p.phase) * 0.025);
        const x = point.x + ox * p.depth;
        const y = point.y + oy * p.depth;
        p.trail.push({ x, y });
        if (p.trail.length > p.trailLimit) p.trail.shift();
        if (p.trail.length > 1) {
          for (let j = 1; j < p.trail.length; j++) {
            const prev = p.trail[j - 1]; const cur = p.trail[j];
            const tailAlpha = (j / p.trail.length) * 0.26 * p.depth;
            ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y);
            ctx.strokeStyle = p.mode === 1 ? `rgba(218,123,147,${tailAlpha})` : `rgba(121,200,200,${tailAlpha})`;
            ctx.lineWidth = (j / p.trail.length) * (p.mode === 1 ? 1.6 : 0.9);
            ctx.stroke();
          }
        }
        const pulse = 0.65 + 0.35 * Math.sin(elapsed * 2.1 + p.pulse);
        const radius = p.size * (p.mode === 1 ? 1.35 : 1) * (0.85 + pulse * 0.2);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = p.depth * (p.mode === 1 ? behavior : 0.75);
        ctx.fillStyle = p.mode === 1 ? COLORS.rose : COLORS.tealBright;
        ctx.shadowColor = p.mode === 1 ? COLORS.rose : COLORS.teal;
        ctx.shadowBlur = (p.mode === 1 ? 10 : 5) * CONFIG.glow;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = COLORS.ivory;
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.45, radius * 0.36), 0, Math.PI * 2); ctx.fill();
        if (p.mode === 1) {
          const wingAngle = Math.atan2(Math.cos(p.angle), -Math.sin(p.angle));
          ctx.strokeStyle = "rgba(218,123,147,0.36)";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(wingAngle) * 3, y - Math.sin(wingAngle) * 3);
          ctx.lineTo(x + Math.cos(wingAngle) * 3, y + Math.sin(wingAngle) * 3);
          ctx.stroke();
        }
        ctx.restore();

        // A subtle pulse at selected orbit intersections.
        if (i % 9 === 0 && Math.abs(Math.sin(p.angle * 1.6)) > 0.992) {
          ctx.beginPath(); ctx.arc(x, y, 3 + (1 - Math.abs(Math.sin(p.angle))) * 8, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(121,200,200,0.16)"; ctx.lineWidth = 0.7; ctx.stroke();
        }
      }

      // Quiet node lights at selected orbital centers.
      for (let i = 0; i < pulseNodes.length; i++) {
        const n = pulseNodes[i];
        const pulse = reduced ? 0.3 : Math.max(0, Math.sin(elapsed * 0.8 + i * 1.7));
        if (pulse > 0.88) {
          ctx.beginPath(); ctx.arc(n.x + ox * 0.3, n.y + oy * 0.3, 2 + pulse * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(121,200,200,${(pulse - 0.85) * 0.3})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    if (!hidden) raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="orbital-particle-canvas" aria-hidden="true" />;
}
