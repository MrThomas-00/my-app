"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const defaultTeam = {
  name: "SIRYX",
  tagline: "دو نفر، یه استودیو",
  keywords: ["طراحی", "توسعه", "جزئیات"],
};

const defaultMembers = [
  {
    name: "ســـام",
    role: "Designer",
    bio: "روی طراحی رابط‌ها و تجربه کاربری تمرکز می‌کنیم تا هر بخش ساده، منظم و خوش‌استفاده باشه.",
    tags: ["Tailwind", "Next.js", "React"],
    image: "./lady2.jpg",
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    name: "مـــانـی",
    role: "Developer",
    bio: "در بخش توسعه، ایده‌ها رو به تجربه‌هایی سریع و کاربردی تبدیل می‌کنیم؛ با توجه به جزئیات فنی و کیفیت اجرا.",
    tags: ["Motion", "Figma", "UI/UX"],
    image: "./shinoa.jpg",
    links: [{ label: "GitHub", href: "#" }],
  },
];

const defaultHighlights = [
  {
    icon: "layers",
    title: "چطور کار می‌کنیم؟",
    text: "اول درباره ایده و هدفت حرف می‌زنیم، بعد طراحی و توسعه رو قدم‌به‌قدم پیش می‌بریم و در طول مسیر در جریان کار قرار می‌گیری.",
    href: "",
  },
  {
    icon: "heart",
    title: "چی برامون مهمه؟",
    text: "ظاهر خوب مهمه، اما کافی نیست؛ سرعت، کاربردپذیری و جزئیات فنی هم باید درست کنار هم قرار بگیرن.",
    href: "",
  },
];

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PAD = 90;

const COMET = [
  { l: 0.22, w: 2.5, o: 0.22, c: "var(--color-primary)" },
  { l: 0.1, w: 3.5, o: 0.55, c: "var(--color-primary)" },
  { l: 0.04, w: 4.5, o: 1, c: "var(--color-text)" },
];

// ───── آیکن‌ها ─────
const ICONS = {
  layers: (
    <svg viewBox="0 0 48 48" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M24 6 4 17l20 11 20-11L24 6Z" />
      <path d="m4 25 20 11 20-11" />
      <path d="m4 33 20 11 20-11" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 48 48" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M24 41S6 30 6 17.5C6 11.7 10.4 8 15.4 8c3.7 0 6.9 2.1 8.6 5.2C25.7 10.1 28.9 8 32.6 8 37.6 8 42 11.7 42 17.5 42 30 24 41 24 41Z" />
      <path d="M15 16.5c1.4-2.2 4.2-2.9 6.4-1.6" />
    </svg>
  ),
};

const GithubIcon = (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const LinkOutIcon = (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 17 7 7M16 7H7v9" />
  </svg>
);

// ───── ستاره‌ها و نقطه‌های پس‌زمینه ─────
const SPARKS = [
  { x: "81%", y: "6%", s: 14, t: "star" },
  { x: "5%", y: "22%", s: 10, t: "star" },
  { x: "6%", y: "31%", s: 8, t: "star" },
  { x: "96%", y: "18%", s: 10, t: "star" },
  { x: "93%", y: "52%", s: 12, t: "star" },
  { x: "96%", y: "73%", s: 12, t: "star" },
  { x: "6.5%", y: "51%", s: 8, t: "star" },
  { x: "59%", y: "82%", s: 12, t: "star" },
  { x: "7%", y: "93%", s: 8, t: "star" },
  { x: "5%", y: "72%", s: 5, t: "dot" },
  { x: "20%", y: "11%", s: 4, t: "dot" },
  { x: "28%", y: "12%", s: 3, t: "dot" },
  { x: "36%", y: "57%", s: 3, t: "dot" },
  { x: "63%", y: "69%", s: 4, t: "dot" },
  { x: "93%", y: "39%", s: 3, t: "dot" },
];

// خطوط مورب «///» گوشه‌ی کارت‌ها
function Stripes({ corner = "tl" }) {
  const tl = corner === "tl";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none rounded-tl-lg absolute size-11 opacity-80 [background:repeating-linear-gradient(135deg,var(--color-primary)_0_1.5px,transparent_1.5px_7px)] ${
        tl ? "left-3 top-3" : "bottom-3 right-3"
      }`}
      style={{
        WebkitMaskImage: `linear-gradient(${tl ? 135 : 315}deg, #000, transparent 70%)`,
        maskImage: `linear-gradient(${tl ? 135 : 315}deg, #000, transparent 70%)`,
      }}
    />
  );
}

export default function About({
  team = defaultTeam,
  members = defaultMembers,
  highlights = defaultHighlights,
  title = ["داستان", "ما"],
  subtitle = "دو نفر، یه استودیو؛ با علاقه به طراحی و ساخت تجربه‌های دیجیتال.",
}) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const hubRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef([]);
  const boxesRef = useRef([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [paths, setPaths] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const grid = gridRef.current;
    const hub = hubRef.current;
    if (!grid || !hub) return;

    const g = grid.getBoundingClientRect();
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height };
    };

    const hubR = rel(hub);
    const cardRs = nodeRefs.current.map((el) => (el ? rel(el) : null));
    boxesRef.current = [hubR, ...cardRs.filter(Boolean)];
    sizeRef.current = { w: g.width, h: g.height };
    setSize({ w: g.width, h: g.height });

    if (!window.matchMedia("(min-width: 768px)").matches) {
      setPaths([]);
      return;
    }

    // نقطه‌ی اتصال روی هاب (بالایی‌ها بالاتر، پایینی‌ها پایین‌تر) و ارتفاعِ خروج از کارت
    const anchors = [["l", 0.22], ["r", 0.22], ["l", 0.7], ["r", 0.7]];
    const cardY = [0.35, 0.35, 0.3, 0.3];

    const next = cardRs.map((r, i) => {
      if (!r) return null;
      const [side, p] = anchors[i];
      const fromLeftBox = i % 2 === 0;
      // کارت‌ها شیشه‌ای‌اند؛ خط باید دقیقاً از لبه‌شان شروع شود
      const x1 = fromLeftBox ? r.x + r.w - 1 : r.x + 1;
      const y1 = r.y + r.h * cardY[i];
      const x2 = side === "l" ? hubR.x + 14 : hubR.x + hubR.w - 14;
      const y2 = hubR.y + hubR.h * p;
      const mx = (x1 + x2) / 2;
      return { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, x1, x2 };
    });

    setPaths(next.filter(Boolean));
  }, []);

  useIsoLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (gridRef.current) ro.observe(gridRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, members, highlights]);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-head]",
        { autoAlpha: 0, y: 40, filter: "blur(12px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          clearProps: "filter",
          scrollTrigger: { trigger: "[data-head]", start: "top 85%" },
        }
      );

      gsap
        .timeline({ scrollTrigger: { trigger: gridRef.current, start: "top 75%" } })
        .fromTo(
          "[data-hub]",
          { autoAlpha: 0, scale: 0.85, filter: "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out", clearProps: "filter" }
        )
        .fromTo(
          "[data-card]",
          { autoAlpha: 0, scale: 0.9, filter: "blur(12px)" },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            clearProps: "filter",
          },
          "-=0.35"
        );

      gsap.fromTo(
        "[data-vline]",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 70%" },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, [members, highlights]);

  useIsoLayoutEffect(() => {
    if (paths.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const grid = gridRef.current;
      const count = paths.length;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: grid, start: "top 70%" },
      });

      tl.fromTo(
        "[data-line]",
        { autoAlpha: 0, strokeDashoffset: 1 },
        { autoAlpha: 1, strokeDashoffset: 0, duration: 1.6, ease: "power2.out", stagger: 0.15 },
        0.4
      );

      const hub = grid.querySelector("[data-hub]");
      const ring = grid.querySelector("[data-hubring]");
      const glow = grid.querySelector("[data-hubglow]");
      const name = grid.querySelector("[data-hubname]");

      const beat = gsap.timeline({ paused: true });
      beat
        .fromTo(hub, { scale: 1 }, { scale: 1.045, duration: 0.14, ease: "power2.out" }, 0)
        .to(hub, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" }, 0.14)
        .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: "power2.out" }, 0)
        .to(glow, { autoAlpha: 0, duration: 0.7, ease: "power2.in" }, 0.12)
        .fromTo(ring, { autoAlpha: 0.8, scale: 1 }, { autoAlpha: 0, scale: 1.35, duration: 0.9, ease: "power2.out" }, 0)
        .fromTo(name, { filter: "brightness(1.9)" }, { filter: "brightness(1)", duration: 0.7, ease: "power2.out" }, 0);

      for (let i = 0; i < count; i++) {
        const els = Array.from(grid.querySelectorAll(`[data-comet="${i}"]`));
        if (!els.length) continue;

        const lens = els.map((el) => parseFloat(el.dataset.len));
        const total = 1 + Math.max(...lens);
        const state = { e: 0 };
        let hit = false;

        const cycle = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 1.2 + Math.random() * 2.2,
        });

        cycle
          .call(() => { hit = false; }, null, 0)
          .set(els, { visibility: "visible" }, 0)
          .fromTo(
            state,
            { e: 0 },
            {
              e: total,
              duration: 1.4 + Math.random() * 0.5,
              ease: "power2.in",
              onUpdate: () => {
                els.forEach((el, k) => {
                  el.style.strokeDashoffset = lens[k] - state.e;
                });
                if (!hit && state.e >= 0.95) {
                  hit = true;
                  beat.restart();
                }
              },
            },
            0
          )
          .set(els, { visibility: "hidden" });

        tl.add(() => cycle.play(), 1.8 + i * 0.7 + Math.random() * 0.6);
      }
    }, rootRef);

    return () => ctx.revert();
  }, [paths.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    if (!canvas || !grid) return;
    const c = canvas.getContext("2d");

    const color =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim() || "#ADFF2F";

    const MAX = 70;
    const RING = 8;
    let particles = [];
    let raf = 0;
    let last = 0;
    let visible = false;
    let dpr = 1;

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { w, h } = sizeRef.current;
      canvas.width = (w + PAD * 2) * dpr;
      canvas.height = (h + PAD * 2) * dpr;
      canvas.style.width = `${w + PAD * 2}px`;
      canvas.style.height = `${h + PAD * 2}px`;
    };

    const spawn = () => {
      const boxes = boxesRef.current;
      if (!boxes.length) return;
      const b = boxes[Math.floor(Math.random() * boxes.length)];
      const x0 = b.x - RING, y0 = b.y - RING, w = b.w + RING * 2, h = b.h + RING * 2;
      let t = Math.random() * (2 * w + 2 * h);
      let x, y, nx, ny;
      if (t < w) { x = x0 + t; y = y0; nx = 0; ny = -1; }
      else if ((t -= w) < h) { x = x0 + w; y = y0 + t; nx = 1; ny = 0; }
      else if ((t -= h) < w) { x = x0 + w - t; y = y0 + h; nx = 0; ny = 1; }
      else { t -= w; x = x0; y = y0 + h - t; nx = -1; ny = 0; }

      const speed = 6 + Math.random() * 22;
      particles.push({
        x,
        y,
        vx: nx * speed + (Math.random() - 0.5) * 10,
        vy: ny * speed + (Math.random() - 0.5) * 10,
        r: 0.8 + Math.random() * 2.2,
        life: 2.5 + Math.random() * 4,
        age: 0,
        ph: Math.random() * Math.PI * 2,
        fl: 1.5 + Math.random() * 2.5,
      });
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (particles.length < MAX && Math.random() < 0.35) spawn();

      c.setTransform(dpr, 0, 0, dpr, PAD * dpr, PAD * dpr);
      c.clearRect(-PAD, -PAD, sizeRef.current.w + PAD * 2, sizeRef.current.h + PAD * 2);
      c.fillStyle = color;
      c.shadowColor = color;

      particles = particles.filter((p) => (p.age += dt) < p.life);
      for (const p of particles) {
        p.ph += dt * p.fl;
        p.x += (p.vx + Math.sin(p.ph) * 6) * dt;
        p.y += (p.vy + Math.cos(p.ph * 0.8) * 6) * dt;
        const k = p.age / p.life;
        const env = Math.sin(Math.PI * k);
        c.globalAlpha = Math.max(0, env * (0.55 + 0.45 * Math.sin(p.ph * 2)));
        c.shadowBlur = p.r * 6;
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    };

    fit();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(grid);
    const ro = new ResizeObserver(fit);
    ro.observe(grid);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const setNode = (i) => (el) => {
    nodeRefs.current[i] = el;
  };

  // ───── کارت عضو تیم ─────
  const renderMember = (m, i, refFn) => (
    <article ref={refFn} data-card className="siryx-card group p-7">
      <Stripes corner="tl" />

      <div className="flex items-center gap-5">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl border border-[var(--color-primary)] opacity-0 transition-[border-radius] duration-500 group-hover:rounded-[1.6rem] group-hover:[animation:siryx-ring_1.8s_ease-out_infinite]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl border border-[var(--color-primary)] opacity-0 transition-[border-radius] duration-500 group-hover:rounded-[1.6rem] group-hover:[animation:siryx-ring_1.8s_ease-out_0.9s_infinite]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[3px] overflow-hidden rounded-[1.2rem] opacity-0 transition-[opacity,border-radius] duration-500 group-hover:rounded-[1.8rem] group-hover:opacity-100"
          >
            <span className="absolute -inset-1/2 [animation:siryx-spin_2.4s_linear_infinite] [background:conic-gradient(from_0deg,transparent_0_65%,var(--color-primary)_100%)]" />
          </span>
          <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-bg)] shadow-[0_0_18px_-4px_var(--color-primary)] ring-1 ring-[var(--color-primary)] transition-[border-radius,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06] group-hover:rounded-[1.6rem]">
            {m.image ? (
              <img
                src={m.image}
                alt={m.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <span className="text-3xl font-black text-[var(--color-primary)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125">
                {m.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-4xl leading-none sm:text-5xl font-lalezar!">{m.name}</h3>
          <p
            dir="ltr"
            className="mt-2 flex items-center justify-end gap-2 font-mono text-xs tracking-[0.2em] text-[var(--color-muted)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />
            {m.role}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-8 text-[var(--color-muted)]">{m.bio}</p>

      {m.tags?.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {m.tags.map((tag) => (
            <li
              key={tag}
              dir="ltr"
              className="rounded-full border border-[var(--color-primary)]/80 bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] px-3.5 py-1 text-sm text-[var(--color-primary)] shadow-[0_0_12px_-4px_var(--color-primary)]"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {m.links?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-5">
          {m.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text)]/85 transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-secondary)]"
            >
              {l.label === "GitHub" ? GithubIcon : LinkOutIcon}
              <span dir="ltr">{l.label}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );

  // ───── کارت اطلاعات ─────
  const renderInfo = (h, i, refFn) => {
    const chevron = (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 6 6 6-6 6" />
      </svg>
    );
    const btnClass =
      "grid size-9 shrink-0 place-items-center rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_14px_-3px_var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)]";

    return (
      <article ref={refFn} data-card className="siryx-card p-7">
        <Stripes corner="tl" />
        <Stripes corner="br" />

        <div className="flex items-start justify-between gap-4">
          <h3 className="pt-2 text-xl font-black leading-8">{h.title}</h3>
          <span className="shrink-0 text-[var(--color-primary)] drop-shadow-[0_0_10px_var(--color-primary)]">
            {ICONS[h.icon] ?? ICONS.layers}
          </span>
        </div>

        <p className="mt-4 text-[15px] leading-8 text-[var(--color-muted)]">{h.text}</p>

        <div dir="ltr" className="mt-6 flex items-center gap-4">
          {h.href ? (
            <a href={h.href} aria-label={h.title} className={btnClass}>
              {chevron}
            </a>
          ) : (
            <span aria-hidden="true" className={btnClass}>
              {chevron}
            </span>
          )}
          <span className="h-px w-24 bg-linear-to-r from-[var(--color-primary)]/60 to-transparent" />
        </div>
      </article>
    );
  };

  return (
    <section
      ref={rootRef}
      id="about"
      dir="rtl"
      className="relative overflow-hidden px-4 pb-36 pt-24 text-[var(--color-text)] sm:px-6 lg:px-8"
    >
      <style>{`
        @keyframes siryx-ring { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(1.6); opacity: 0 } }
        @keyframes siryx-spin { to { transform: rotate(360deg) } }
        @keyframes siryx-twinkle { 0%, 100% { opacity: .2; transform: scale(.75) } 50% { opacity: 1; transform: scale(1) } }
        @keyframes siryx-wheel { 0% { transform: translateY(0); opacity: 1 } 100% { transform: translateY(9px); opacity: 0 } }

        .siryx-twinkle { animation: siryx-twinkle var(--d, 4s) ease-in-out var(--dl, 0s) infinite; }
        .siryx-wheel { animation: siryx-wheel 1.6s ease-in infinite; }
        @media (prefers-reduced-motion: reduce) {
          .siryx-twinkle, .siryx-wheel { animation: none; }
        }

        /* کارت شیشه‌ای با لبه‌ی نئونی */
        .siryx-card {
          position: relative;
          border-radius: 1.75rem;
          background: linear-gradient(
            160deg,
            color-mix(in srgb, var(--color-surface) 70%, transparent),
            color-mix(in srgb, var(--color-secondary) 55%, transparent)
          );
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          box-shadow:
            0 0 34px -12px color-mix(in srgb, var(--color-primary) 45%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: box-shadow 0.5s ease;
        }
        .siryx-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            color-mix(in srgb, var(--color-primary) 14%, transparent) 32%,
            color-mix(in srgb, var(--color-primary) 8%, transparent) 62%,
            var(--color-primary) 100%
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        .siryx-card:hover {
          box-shadow:
            0 0 60px -10px color-mix(in srgb, var(--color-primary) 55%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
      `}</style>

      {/* ───── پس‌زمینه ───── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_100%_0%,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent)]" />

        {/* موج‌های گوشه‌ی بالا-چپ */}
        <svg viewBox="0 0 600 380" fill="none" className="absolute left-0 top-0 w-[44vw] max-w-[640px] opacity-80">
          <defs>
            <linearGradient id="siryx-sw-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.9 }} />
              <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="siryx-sw-f" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.35 }} />
              <stop offset="0.7" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M-10 250C120 235 250 150 330 -10L-10 -10Z" fill="url(#siryx-sw-f)" />
          <path d="M-10 250C120 235 250 150 330 -10" stroke="url(#siryx-sw-a)" strokeWidth="1.4" />
          <path d="M-10 190C100 180 200 110 262 -10" stroke="url(#siryx-sw-a)" strokeWidth="1.1" />
          <path d="M-10 130C70 120 140 70 190 -10" stroke="url(#siryx-sw-a)" strokeWidth="1" />
        </svg>

        {/* موج‌های گوشه‌ی بالا-راست */}
        <svg viewBox="0 0 300 260" fill="none" className="absolute right-0 top-0 hidden w-[22vw] max-w-[320px] opacity-60 md:block">
          <defs>
            <linearGradient id="siryx-sw-b" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.8 }} />
              <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M310 30C240 40 170 90 130 -10" stroke="url(#siryx-sw-b)" strokeWidth="1.2" />
          <path d="M310 95C250 100 190 140 160 200" stroke="url(#siryx-sw-b)" strokeWidth="1" />
        </svg>

        {/* موج‌های گوشه‌ی پایین-راست */}
        <svg viewBox="0 0 760 420" fill="none" className="absolute bottom-0 right-0 w-[50vw] max-w-[760px] opacity-90">
          <defs>
            <linearGradient id="siryx-sw-c" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.9 }} />
              <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="siryx-sw-d" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.3 }} />
              <stop offset="0.8" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M770 120C640 150 560 260 430 330C340 380 250 420 170 440L770 440Z" fill="url(#siryx-sw-d)" />
          <path d="M770 120C640 150 560 260 430 330C340 380 250 420 170 440" stroke="url(#siryx-sw-c)" strokeWidth="1.4" />
          <path d="M770 200C660 220 590 300 490 360C420 400 340 430 270 445" stroke="url(#siryx-sw-c)" strokeWidth="1.1" />
          <path d="M770 290C700 300 640 350 580 400" stroke="url(#siryx-sw-c)" strokeWidth="1" />
        </svg>

        {/* ستاره‌ها و نقطه‌ها */}
        {SPARKS.map((p, i) =>
          p.t === "star" ? (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className={`siryx-twinkle absolute text-[var(--color-primary)] drop-shadow-[0_0_6px_var(--color-primary)] ${i > 3 ? "hidden sm:block" : ""}`}
              style={{ left: p.x, top: p.y, width: p.s, height: p.s, "--d": `${3 + (i % 4)}s`, "--dl": `${(i * 0.37).toFixed(2)}s` }}
            >
              <path d="M12 0 14 10 24 12 14 14 12 24 10 14 0 12 10 10Z" fill="currentColor" />
            </svg>
          ) : (
            <span
              key={i}
              className={`siryx-twinkle absolute rounded-full bg-[var(--color-primary)] shadow-[0_0_6px_var(--color-primary)] ${i > 9 ? "hidden sm:block" : ""}`}
              style={{ left: p.x, top: p.y, width: p.s, height: p.s, "--d": `${3 + (i % 3)}s`, "--dl": `${(i * 0.31).toFixed(2)}s` }}
            />
          )
        )}
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header data-head className="w-full text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-[2px] max-w-24 flex-1 rounded-full bg-gradient-to-r from-transparent to-[var(--color-primary)] opacity-70" />

            <h2 className="shrink-0 text-3xl sm:text-5xl font-lalezar!">
              {title[0]} <span className="text-[var(--color-primary)]">{title[1]}</span>
            </h2>

            <span className="h-[2px] max-w-24 flex-1 rounded-full bg-gradient-to-l from-transparent to-[var(--color-primary)] opacity-70" />
          </div>

          {subtitle && (
            <p className="mt-5 text-base text-[var(--color-muted)] sm:text-lg">{subtitle}</p>
          )}
        </header>

        <div
          ref={gridRef}
          dir="ltr"
          className="relative mt-16 grid gap-10 md:grid-cols-[1fr_minmax(230px,0.55fr)_1fr] md:grid-rows-2 md:gap-x-28 md:gap-y-16"
        >
          {/* لوگوی محو پشت هاب */}
{/* لوگوی محو پشت هاب (حرف S) */}
<svg
  aria-hidden="true"
  viewBox="0 0 440 520"
  className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden w-[30vw] max-w-[460px]  -translate-x-1/2 -translate-y-1/2 opacity-[0.035] md:block"
>
  <path
    d="M0 0H300V90H90V215H300V520H0V430H210V305H0Z"
    transform="matrix(1 0 -0.25 1 130 0)"
    fill="#fff"
  />
</svg>

          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-0"
            style={{ left: -PAD, top: -PAD }}
          />

          <div
            aria-hidden="true"
            data-vline
            className="absolute bottom-0 left-1/2 top-0 z-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--color-primary)] to-transparent opacity-0 shadow-[0_0_14px_var(--color-primary)] md:hidden"
          />

          {paths.length > 0 && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible md:block"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
            >
              <defs>
                {paths.map((p, i) => (
                  <linearGradient
                    key={i}
                    id={`siryx-line-${i}`}
                    gradientUnits="userSpaceOnUse"
                    x1={p.x1}
                    y1="0"
                    x2={p.x2}
                    y2="0"
                  >
                    <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.15" />
                    <stop offset="0.5" stopColor="var(--color-primary)" stopOpacity="1" />
                    <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.15" />
                  </linearGradient>
                ))}
              </defs>
              {paths.map((p, i) => (
                <g key={i}>
                  <path
                    d={p.d}
                    data-line
                    pathLength="1"
                    strokeDasharray="1"
                    fill="none"
                    stroke={`url(#siryx-line-${i})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px var(--color-primary))" }}
                  />
                  {COMET.map((c, k) => (
                    <path
                      key={k}
                      d={p.d}
                      data-comet={i}
                      data-len={c.l}
                      pathLength="1"
                      strokeDasharray={`${c.l} 3`}
                      strokeDashoffset={c.l}
                      fill="none"
                      stroke={c.c}
                      strokeOpacity={c.o}
                      strokeWidth={c.w}
                      strokeLinecap="round"
                      style={{ visibility: "hidden", filter: "drop-shadow(0 0 7px var(--color-primary))" }}
                    />
                  ))}
                </g>
              ))}
            </svg>
          )}

          <div dir="rtl" className="relative z-10 md:col-start-1 md:row-start-1">
            {renderMember(members[0], 0, setNode(0))}
          </div>
          <div dir="rtl" className="relative z-10 md:col-start-3 md:row-start-1">
            {renderMember(members[1], 1, setNode(1))}
          </div>

          {/* هاب وسط */}
          <div
            dir="rtl"
            className="relative z-10 order-first md:order-none md:col-start-2 md:row-span-2 md:row-start-1 md:self-center"
          >
            <div
              ref={hubRef}
              data-hub
              className="relative rounded-[2rem] bg-[var(--color-bg)] bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_65%)] p-7 text-center shadow-[0_0_0_1px_var(--color-primary),0_0_0_8px_var(--color-bg),0_0_0_9px_color-mix(in_srgb,var(--color-primary)_40%,transparent),0_0_80px_-16px_var(--color-primary)]"
            >
              <span
                data-hubglow
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_55px_6px_var(--color-primary)]"
                style={{ visibility: "hidden" }}
              />
              <span
                data-hubring
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-[var(--color-primary)] opacity-0"
                style={{ visibility: "hidden" }}
              />
              <p data-hubname dir="ltr" className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
                {team.name}
                <span className="text-[var(--color-primary)] [text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]">.</span>
              </p>
              <p className="mt-4 font-bold text-[var(--color-primary)]">{team.tagline}</p>

              {team.keywords?.length ? (
                <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[var(--color-muted)]">
                  {team.keywords.map((k, idx) => (
                    <Fragment key={k}>
                      {idx > 0 && (
                        <li aria-hidden="true" className="size-1 rounded-full bg-[var(--color-primary)]" />
                      )}
                      <li>{k}</li>
                    </Fragment>
                  ))}
                </ul>
              ) : (
                team.description && (
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{team.description}</p>
                )
              )}
            </div>
          </div>

          <div dir="rtl" className="relative z-10 md:col-start-1 md:row-start-2">
            {renderInfo(highlights[0], 0, setNode(2))}
          </div>
          <div dir="rtl" className="relative z-10 md:col-start-3 md:row-start-2">
            {renderInfo(highlights[1], 1, setNode(3))}
          </div>
        </div>
      </div>

    </section>
  );
}