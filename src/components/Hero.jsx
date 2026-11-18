"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Hero — SIRYX
 *
 * بکگراند: درخت لیمویی (ساخته‌شده با الگوریتم، همیشه یک شکل ثابت) با ریشه‌های بلند و کشیده.
 * ریشه‌ی وسطی از هیرو بیرون می‌زند و دقیقاً به ابتدای خط سکشن پروژه‌ها وصل می‌شود.
 *
 * رنگ‌ها در globals.css:
 *   --color-primary / --color-bg / --color-secondary / --color-surface / --color-text
 *
 * ─── اتصال دقیق به خط پروژه‌ها ───
 * روی همان <path> یا المانی که خط پروژه‌ها از آن شروع می‌شود، این attribute را بگذارید:
 *
 *   <path data-root-target d="..." />        ← اگر خط یک SVG path است (بهترین حالت:
 *                                              نقطه‌ی شروع و جهت خط خودکار خوانده می‌شود)
 *   <span data-root-target className="absolute left-1/2 top-0" />   ← یا یک نشانگر ساده
 *
 * هیرو موقعیت آن را اندازه می‌گیرد و ریشه را دقیقاً تا همان‌جا، مماس بر خط، می‌کشد.
 * اگر چنین المانی پیدا نشود، ریشه به اندازه‌ی connectReach پایین می‌رود.
 */

/* ───────────── تولید درخت و ریشه (قطعی؛ seed ثابت) ───────────── */

function rngFrom(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fx = (n) => Math.round(n * 10) / 10;

const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

// منحنی بزیه ← چندضلعی باریک‌شونده (w0 → w1)
function taper(p0, p1, p2, p3, w0, w1, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(cubic(p0, p1, p2, p3, i / n));
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    const w = (w0 + (w1 - w0) * (i / n)) / 2;
    L.push(`${fx(pts[i][0] - ty * w)} ${fx(pts[i][1] + tx * w)}`);
    R.push(`${fx(pts[i][0] + ty * w)} ${fx(pts[i][1] - tx * w)}`);
  }
  return `M${L.join("L")}L${R.reverse().join("L")}Z`;
}

// درخت: زاویه‌ی 0 = رو به بالا. y=800 همان لبه‌ی پایین هیرو (زمین) است.
function makeTree(seed, MAXD = 5) {
  const rng = rngFrom(seed);
  let d = "";
  const seg = (x, y, a, len, w0, w1, depth) => {
    const a2 = a + (rng() - 0.5) * 0.5;
    const x3 = x + Math.sin(a2) * len, y3 = y - Math.cos(a2) * len;
    const p1 = [x + Math.sin(a) * len * 0.38, y - Math.cos(a) * len * 0.38];
    const p2 = [x3 - Math.sin(a2) * len * 0.38, y3 + Math.cos(a2) * len * 0.38];
    d += taper([x, y], p1, p2, [x3, y3], w0, w1);
    if (depth >= MAXD || w1 < 1.8) return;
    seg(x3, y3, a2 + (rng() - 0.5) * 0.3, len * 0.8, w1 * 0.98, w1 * 0.74, depth + 1);
    const n = depth < 2 ? 2 : rng() < 0.6 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const side = k % 2 === 0 ? -1 : 1;
      const sa = a2 + side * (0.5 + rng() * 0.5);
      if (Math.abs(sa) > 1.55) continue;
      seg(x3, y3, sa, len * (0.66 + rng() * 0.14), w1 * 0.74, w1 * 0.5, depth + 1);
    }
  };
  seg(500, 880, 0, 175, 100, 70, 0);
  return d;
}

// ریشه‌ها: زاویه از «پایین» سنجیده می‌شود. lines = خط مرکزی ریشه‌های اصلی (برای جریان نوری)
function makeRoots(seed) {
  const rng = rngFrom(seed);
  let d = "";
  const lines = [];
  const seg = (x, y, a, len, w0, w1, depth, maxd, path) => {
    const a2 = a + (rng() - 0.5) * 0.45;
    const x3 = x + Math.sin(a2) * len;
    const y3 = Math.max(y + 4, y + Math.cos(a2) * len);
    const p1 = [x + Math.sin(a) * len * 0.38, Math.max(y, y + Math.cos(a) * len * 0.38)];
    const p2 = [x3 - Math.sin(a2) * len * 0.38, Math.max(y, y3 - Math.cos(a2) * len * 0.38)];
    d += taper([x, y], p1, p2, [x3, y3], w0, w1, 10);
    path.push(
      `${path.length ? "" : `M${fx(x)} ${fx(y)}`}C${fx(p1[0])} ${fx(p1[1])} ${fx(p2[0])} ${fx(p2[1])} ${fx(x3)} ${fx(y3)}`
    );
    if (depth >= maxd || w1 < 1.3) return;
    seg(x3, y3, a2 * 0.98 + (rng() - 0.5) * 0.2, len * 0.86, w1 * 0.98, w1 * 0.7, depth + 1, maxd, path);
    if (rng() < 0.62) {
      const side = rng() < 0.5 ? -1 : 1;
      seg(x3, y3, a2 + side * (0.55 + rng() * 0.5), len * 0.55, w1 * 0.7, w1 * 0.45, depth + 2, maxd, []);
    }
  };
  const mains = [
    [-1, 1.4, 280, 13], [-1, 1.1, 250, 12], [-1, 0.75, 200, 11], [-1, 0.38, 160, 10],
    [1, 0.38, 160, 10], [1, 0.75, 200, 11], [1, 1.1, 250, 12], [1, 1.4, 280, 13],
  ];
  mains.forEach(([s, a, len, w]) => {
    const path = [];
    seg(500 + s * (6 + rng() * 20), 800, s * a, len, w, w * 0.7, 0, 5, path);
    lines.push(path.join(""));
  });
  return { d, lines };
}

const TREE_D = makeTree(21);
const ROOTS = makeRoots(5);

// ریشه‌ی اصلی: از (500,800) رو به پایین، تا نقطه‌ی end با جهت مماس dir
function buildMain(end, dir, bend) {
  const P0 = [500, 800];
  const L = Math.max(end[1] - 800, 60);
  if (!bend) {
    const p1 = [500, 800 + L * 0.38];
    const p2 = [end[0] - dir[0] * L * 0.38, end[1] - dir[1] * L * 0.38];
    return {
      d: `M500 800C${fx(p1[0])} ${fx(p1[1])} ${fx(p2[0])} ${fx(p2[1])} ${fx(end[0])} ${fx(end[1])}`,
      poly: taper(P0, p1, p2, end, 14, 2.4, 20),
    };
  }
  // S-شکل: اول به کنار می‌رود (دور از تیتر)، بعد برمی‌گردد و عمود به خط می‌رسد
  const M = [500 + bend, 800 + L * 0.5];
  const a1 = [500, 800 + L * 0.22], a2 = [500 + bend, 800 + L * 0.3];
  const b1 = [500 + bend, 800 + L * 0.72];
  const b2 = [end[0] - dir[0] * L * 0.28, end[1] - dir[1] * L * 0.28];
  return {
    d: `M500 800C${a1[0]} ${fx(a1[1])} ${a2[0]} ${fx(a2[1])} ${M[0]} ${fx(M[1])}C${b1[0]} ${fx(b1[1])} ${fx(b2[0])} ${fx(b2[1])} ${fx(end[0])} ${fx(end[1])}`,
    poly:
      taper(P0, a1, a2, M, 14, 7, 14) + taper(M, b1, b2, end, 7, 2.4, 14),
  };
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Hero({
  badge = "SIRYX · Web Studio",
  title = ["ایده‌هات رو به", "سایتی تبدیل می‌کنیم", "که حرف می‌زنه."],
  subtitle = "ما در SIRYX طراحی و توسعه‌ی وب رو کنار هم جلو می‌بریم؛ از اسکچ اولیه تا سایتی سریع، تمیز و ماندگار.",
  primaryCta = { label: "مشاهده‌ی پروژه‌ها", href: "#projects" },
  secondaryCta = { label: "درباره‌ی ما", href: "#about" },
  connectTo = "[data-root-target]", // سلکتور شروع خط پروژه‌ها
  connectReach = 300, // اگر المان بالا پیدا نشد، طول ریشه (واحد viewBox ≈ px)
  connectBend = 0, // اختیاری: مثلاً 230 یا -230 تا ریشه از کنار تیتر «نمونه کارها» رد شود
}) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [target, setTarget] = useState({ end: [500, 800 + connectReach], dir: [0, 1] });

  // ---------- اندازه‌گیری نقطه‌ی شروع خط پروژه‌ها ----------
  const measure = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const sr = svg.getBoundingClientRect();
    if (!sr.width) return;
    const k = 2000 / sr.width;
    const bx = sr.left + sr.width / 2;
    const by = sr.bottom;

    let end = [500, 800 + connectReach];
    let dir = [0, 1];
    const t = connectTo ? document.querySelector(connectTo) : null;
    if (t) {
      let sx, sy, dx = 0, dy = 1;
      if (typeof t.getPointAtLength === "function" && t.getScreenCTM) {
        const m = t.getScreenCTM();
        const len = t.getTotalLength();
        const tr = (p) => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
        const a = tr(t.getPointAtLength(0));
        const b = tr(t.getPointAtLength(Math.min(30, len / 4)));
        sx = a.x; sy = a.y;
        const vx = b.x - a.x, vy = b.y - a.y, n = Math.hypot(vx, vy) || 1;
        dx = vx / n; dy = vy / n;
      } else {
        const r = t.getBoundingClientRect();
        sx = r.left + r.width / 2;
        sy = r.top;
      }
      const ex = 500 + (sx - bx) * k;
      const ey = 800 + (sy - by) * k;
      if (ey > 830) {
        end = [ex, ey];
        if (dy > 0.2) dir = [dx, dy];
      }
    }
    setTarget((prev) =>
      Math.abs(prev.end[0] - end[0]) < 0.4 &&
      Math.abs(prev.end[1] - end[1]) < 0.4 &&
      Math.abs(prev.dir[0] - dir[0]) < 0.01
        ? prev
        : { end, dir }
    );
  }, [connectTo, connectReach]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    if (svgRef.current) ro.observe(svgRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    document.fonts?.ready?.then(measure);
    const t1 = setTimeout(measure, 400);
    const t2 = setTimeout(measure, 1500);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [measure]);

  const main = buildMain(target.end, target.dir, connectBend);

  // ---------- انیمیشن‌ها ----------
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-in]",
        { autoAlpha: 0, y: 36, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.15 }
      );

      // درخت از زمین بالا می‌رود
      gsap.fromTo(
        "[data-clip='tree']",
        { attr: { y: 900, height: 0 } },
        { attr: { y: 0, height: 900 }, duration: 2.4, ease: "power2.out", delay: 0.2 }
      );
      // ریشه‌ها از مرکز به دو طرف پخش می‌شوند
      gsap.fromTo(
        "[data-clip='roots']",
        { attr: { x: 500, width: 0 } },
        { attr: { x: -500, width: 2000 }, duration: 2.8, ease: "power2.out", delay: 1.1 }
      );
      // ریشه‌ی اصلی به سمت پروژه‌ها پایین می‌رود
      gsap.fromTo(
        "[data-clip='main']",
        { attr: { height: 0 } },
        {
          attr: { height: 1400 },
          duration: 3.2,
          ease: "power2.inOut",
          delay: 1.3,
        }
      );

      const start = gsap.timeline({ delay: 3.4 });

      // بسته‌ی نوری از تنه به سمت پروژه‌ها
      const down = document.querySelector("[data-pulse-down]");
      if (down) {
        const p = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.8 });
        p.set(down, { autoAlpha: 0, strokeDashoffset: 0.1 })
          .to(down, { autoAlpha: 1, duration: 0.15 })
          .to(down, { strokeDashoffset: -1, duration: 2.4, ease: "power1.inOut" }, "<")
          .to(down, { autoAlpha: 0, duration: 0.2 }, ">-0.2");
        start.add(() => p.play(), 0);
      }

      // جریان کم‌نور روی ریشه‌ها: از نوک به سمت تنه
      gsap.utils.toArray("[data-pulse-up]").forEach((el, i) => {
        const p = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.5 + Math.random() * 3 });
        p.set(el, { autoAlpha: 0, strokeDashoffset: -1 })
          .to(el, { autoAlpha: 0.9, duration: 0.15 })
          .to(el, { strokeDashoffset: 0.1, duration: 2.6 + Math.random() * 1.2, ease: "power1.inOut" }, "<")
          .to(el, { autoAlpha: 0, duration: 0.25 }, ">-0.25");
        start.add(() => p.play(), 0.3 + i * 0.6 + Math.random());
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ---------- ذرات نورانی ریز دور درخت ----------
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const box = bgRef.current;
    if (!canvas || !box) return;
    const c = canvas.getContext("2d");

    const color =
      getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#ADFF2F";

    const MAX = 55;
    let W = 0, H = 0, dpr = 1;
    let particles = [];
    let raf = 0;
    let last = 0;
    let visible = true;

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = box.clientWidth;
      H = box.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    const spawn = () => {
      const spread = (Math.random() + Math.random() - 1) * W * 0.2;
      particles.push({
        x: W / 2 + spread,
        y: H * (0.4 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 8,
        vy: -(6 + Math.random() * 20),
        r: 0.8 + Math.random() * 2,
        life: 3 + Math.random() * 5,
        age: 0,
        ph: Math.random() * Math.PI * 2,
        fl: 1.2 + Math.random() * 2.2,
      });
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (particles.length < MAX && Math.random() < 0.3) spawn();

      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      c.fillStyle = color;
      c.shadowColor = color;

      particles = particles.filter((p) => (p.age += dt) < p.life);
      for (const p of particles) {
        p.ph += dt * p.fl;
        p.x += (p.vx + Math.sin(p.ph) * 7) * dt;
        p.y += p.vy * dt;
        const env = Math.sin(Math.PI * (p.age / p.life));
        c.globalAlpha = Math.max(0, env * (0.5 + 0.5 * Math.sin(p.ph * 2)));
        c.shadowBlur = p.r * 6;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    };

    fit();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(box);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const glow = "drop-shadow(0 0 6px color-mix(in srgb, var(--color-primary) 65%, transparent))";
  const textShadow = "[text-shadow:0_2px_28px_var(--color-bg)]";

  return (
    // z-20 و overflow-x:clip → ریشه می‌تواند از پایین هیرو به سکشن بعدی برسد، بدون اسکرول افقی
    <section
      ref={rootRef}
      id="home"
      dir="rtl"
      className="relative z-20 min-h-[100svh] text-[var(--color-text)] [overflow-x:clip]"
    >
      {/* پس‌زمینه‌ی بریده‌شده: شبکه، نور و ذرات. لبه‌ی پایین با ماسک محو می‌شود تا درز دیده نشود */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-surface)_1px,transparent_1px),linear-gradient(90deg,var(--color-surface)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_100%_0%,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent)]" />
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {/* نور پای درخت: بدون برش، از هیرو به سکشن بعدی ادامه دارد */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[620px] w-[min(1500px,200vw)] -translate-x-1/2 translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent)]"
      />

      {/* محتوا */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pb-[34vh] pt-36 text-center sm:pt-40 md:pb-[38vh]">
        <p
          data-in
          dir="ltr"
          className="flex items-center gap-3 rounded-full border-[1.5px] border-[var(--color-surface)] bg-[color-mix(in_srgb,var(--color-secondary)_70%,transparent)] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] opacity-90 backdrop-blur"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]" />
          {badge}
        </p>

        <h1 className={`mt-8 text-5xl font-black leading-[1.35] sm:text-6xl md:text-7xl ${textShadow}`}>
          <span data-in className="block">{title[0]}</span>
          <span data-in className="block">{title[1]}</span>
          <span
            data-in
            className="block text-[var(--color-primary)] [text-shadow:0_0_40px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]"
          >
            {title[2]}
          </span>
        </h1>

        <p data-in className={`mt-8 max-w-xl text-lg leading-9 opacity-80 ${textShadow}`}>
          {subtitle}
        </p>

        <div data-in className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={primaryCta.href}
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--color-primary)] px-8 py-3.5 font-bold text-[var(--color-bg)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-4px_var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            {primaryCta.label}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </a>
          <a
            href={secondaryCta.href}
            className="rounded-full border-[1.5px] border-[var(--color-surface)] bg-[color-mix(in_srgb,var(--color-secondary)_60%,transparent)] px-8 py-3.5 font-semibold backdrop-blur transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>

      {/* درخت و ریشه‌ها: y=800 در viewBox دقیقاً لبه‌ی پایین هیرو است؛ ریشه‌ها زیر آن ادامه دارند */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(1960px,300vw)] -translate-x-1/2"
      >
        <svg ref={svgRef} viewBox="-500 120 2000 680" className="block h-auto w-full overflow-visible">
          <defs>
            {/* محو شدن ریشه‌ها به سمت دو طرف و پایین */}
            <radialGradient
              id="hero-root-fade"
              gradientUnits="userSpaceOnUse"
              cx="500"
              cy="800"
              r="1000"
              gradientTransform="translate(500 800) scale(1 0.42) translate(-500 -800)"
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <mask id="hero-root-mask" maskUnits="userSpaceOnUse" x="-500" y="780" width="2000" height="700">
              <rect x="-500" y="780" width="2000" height="700" fill="url(#hero-root-fade)" />
            </mask>

            {/* پای تنه در ریشه‌ها محو می‌شود */}
            <linearGradient id="hero-tree-fade" gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="880">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.84" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id="hero-tree-mask" maskUnits="userSpaceOnUse" x="-500" y="100" width="2000" height="800">
              <rect x="-500" y="100" width="2000" height="800" fill="url(#hero-tree-fade)" />
            </mask>

            {/* برش‌های انیمیشن رشد */}
            <clipPath id="hero-clip-tree">
              <rect data-clip="tree" x="-500" y="0" width="2000" height="900" />
            </clipPath>
            <clipPath id="hero-clip-roots">
              <rect data-clip="roots" x="-500" y="780" width="2000" height="700" />
            </clipPath>
            <clipPath id="hero-clip-main">
              <rect data-clip="main" x="-500" y="780" width="2000" height="1400" />
            </clipPath>
          </defs>

          {/* درخت: لایه‌ی اول فقط کانتور، لایه‌ی دوم پر شده؛ داخل هم‌پوشانی‌ها خطی دیده نمی‌شود */}
          <g style={{ filter: "drop-shadow(0 0 16px color-mix(in srgb, var(--color-primary) 30%, transparent))" }}>
            <g clipPath="url(#hero-clip-tree)">
              <g mask="url(#hero-tree-mask)" opacity="0.9">
                <path
                  d={TREE_D}
                  fill="var(--color-primary)"
                  stroke="var(--color-primary)"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <path
                  d={TREE_D}
                  style={{ fill: "color-mix(in srgb, var(--color-primary) 9%, var(--color-bg))" }}
                />
              </g>
            </g>
          </g>

          {/* ریشه‌های بلند */}
          <g style={{ filter: glow }}>
            <g clipPath="url(#hero-clip-roots)">
              <g mask="url(#hero-root-mask)">
                <path d={ROOTS.d} fill="var(--color-primary)" fillOpacity="0.7" />
              </g>
            </g>
            {/* جریان نوری از نوک ریشه‌ها به سمت تنه */}
            <g fill="none" strokeLinecap="round" mask="url(#hero-root-mask)">
              {ROOTS.lines.map((d, i) => (
                <path
                  key={i}
                  data-pulse-up
                  pathLength="1"
                  strokeDasharray="0.05 1.4"
                  strokeDashoffset="-1"
                  d={d}
                  stroke="var(--color-text)"
                  strokeWidth="3"
                  style={{ opacity: 0, visibility: "hidden" }}
                />
              ))}
            </g>
          </g>

          {/* ریشه‌ی اصلی: از هیرو بیرون می‌زند و مماس به ابتدای خط پروژه‌ها تمام می‌شود */}
          <g style={{ filter: glow }}>
            <g clipPath="url(#hero-clip-main)">
              <path d={main.poly} fill="var(--color-primary)" />
            </g>
            <path
              data-pulse-down
              pathLength="1"
              strokeDasharray="0.07 1.4"
              strokeDashoffset="0.1"
              d={main.d}
              fill="none"
              stroke="var(--color-text)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ opacity: 0, visibility: "hidden" }}
            />
          </g>
        </svg>
      </div>
    </section>
  );
}
