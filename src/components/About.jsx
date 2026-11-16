"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * سکشن «درباره ما» — هاب مرکزی SIRYX + چهار باکس
 *
 * - بدون نقطه؛ خطوط سبز با گرادیانِ محو شونده‌ی دو سر، فید‌این و یک پالس نوریِ متحرک
 * - ذرات ریز نورانی (کانواس) که تصادفی از دور باکس‌ها بیرون می‌زنند و محو می‌شوند
 *
 * رنگ‌ها در globals.css:
 *   --color-primary / --color-bg / --color-secondary / --color-surface / --color-text
 */

const defaultTeam = {
  name: "SIRYX",
  tagline: "دو نفر، یک استودیو.",
  description:
    "طراحی و توسعه رو کنار هم جلو می‌بریم؛ از اسکچ تا نسخه‌ی نهایی.",
};

const defaultMembers = [
  {
    name: "th0mas",
    role: "Designer",
    bio: "اینجا هم معرفی کوتاه رفیقت: تخصصش، سبک کارش و چیزی که باعث می‌شه با هم تیم خوبی باشید.",
    tags: ["Tailwind", "Next.js", "React"],
    image: "",
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    name: "SIR",
    role: "Developer",
    bio: "اینجا یه معرفی کوتاه از خودت بنویس: چه کاری می‌کنی، به چی علاقه داری و چه چیزی تو کارهات برات مهمه.",
    tags: ["Motion", "Figma", "UI/UX"],
    image: "",
    links: [{ label: "GitHub", href: "#" }],
  },
];

const defaultHighlights = [
  {
    title: "کارمون رو چطور پیش می‌بریم",
    text: "اول هدف پروژه رو دقیق مشخص می‌کنیم، بعد طراحی و کدنویسی رو موازی جلو می‌بریم و در هر مرحله نتیجه رو نشونتون می‌دیم.",
  },
  {
    title: "برای ما چی مهمه",
    text: "سرعت بالا، کد قابل نگهداری و ظاهری که فقط قشنگ نیست؛ استفاده ازش هم راحته.",
  },
];

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const tagStyles = [
  "border-[var(--color-primary)] text-[var(--color-primary)]",
  "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]",
  "border-[var(--color-primary)] bg-[var(--color-primary)] font-semibold text-[var(--color-bg)]",
];

const boxBase =
  "relative h-full bg-[var(--color-secondary)] p-7 shadow-[0_0_0_1px_var(--color-surface),0_0_0_7px_var(--color-bg),0_0_0_8px_var(--color-surface)] transition-[border-radius,box-shadow] duration-500 hover:shadow-[0_0_0_1px_var(--color-primary),0_0_0_7px_var(--color-bg),0_0_0_8px_var(--color-primary),0_0_60px_-14px_var(--color-primary)]";

const PAD = 90; // حاشیه‌ی اضافه‌ی کانواس تا نور بیرون‌زده بریده نشود

export default function About({
  team = defaultTeam,
  members = defaultMembers,
  highlights = defaultHighlights,
  title = ["درباره", "ما."],
}) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const hubRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef([]); // [TL, TR, BL, BR]
  const boxesRef = useRef([]); // مستطیل همه‌ی باکس‌ها نسبت به گرید
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

    // نقطه‌ی اتصال روی هاب: [سمت، درصد ارتفاع]
    const anchors = [["l", 0.32], ["r", 0.32], ["l", 0.68], ["r", 0.68]];

    const next = cardRs.map((r, i) => {
      if (!r) return null;
      const [side, p] = anchors[i];
      const fromLeftBox = i % 2 === 0;
      // ابتدا و انتهای خط کمی زیر باکس‌ها می‌رود (باکس‌ها روی SVG هستند)
      const x1 = fromLeftBox ? r.x + r.w - 14 : r.x + 14;
      const y1 = r.y + r.h / 2;
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

  // ---------- انیمیشن ورود (هدر، هاب، باکس‌ها) ----------
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
          scrollTrigger: { trigger: "[data-head]", start: "top 85%" },
        }
      );

      gsap
        .timeline({ scrollTrigger: { trigger: gridRef.current, start: "top 75%" } })
        .fromTo(
          "[data-hub]",
          { autoAlpha: 0, scale: 0.85, filter: "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" }
        )
        .fromTo(
          "[data-card]",
          { autoAlpha: 0, scale: 0.9, filter: "blur(12px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out", stagger: 0.12 },
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

  // ---------- خطوط: فید‌این + پالس نوری ----------
  useIsoLayoutEffect(() => {
    if (paths.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: gridRef.current, start: "top 70%" },
      });

      tl.fromTo(
        "[data-line]",
        { autoAlpha: 0, strokeDashoffset: 1 },
        { autoAlpha: 1, strokeDashoffset: 0, duration: 1.6, ease: "power2.out", stagger: 0.15 },
        0.4
      );

      // بسته‌ی نوری: از زیر باکس کناری بیرون می‌آید، روی خط می‌رود و داخل هاب محو می‌شود
      const glow = gridRef.current.querySelector("[data-hubglow]");
      gsap.utils.toArray("[data-pulse]").forEach((el, i) => {
        const travel = 1.3 + Math.random() * 0.5;
        const p = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 1.2 + Math.random() * 2.2,
        });
        p.set(el, { autoAlpha: 0, strokeDashoffset: 0.1 })
          .to(el, { autoAlpha: 1, duration: 0.12 })
          .to(el, { strokeDashoffset: -1, duration: travel, ease: "power2.inOut" }, "<")
          .to(el, { autoAlpha: 0, duration: 0.08 }, `>-0.08`);
        if (glow) {
          p.fromTo(
            glow,
            { autoAlpha: 0 },
            { autoAlpha: 0.9, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" },
            travel - 0.25
          );
        }
        tl.add(() => p.play(), 1.8 + i * 0.7 + Math.random() * 0.6);
      });
    }, rootRef);

    return () => ctx.revert();
  }, [paths.length]);

  // ---------- ذرات نورانی تصادفی دور باکس‌ها ----------
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

  const renderMember = (m, i, refFn) => (
    <article
      ref={refFn}
      data-card
      className={`${boxBase} group ${
        i === 0
          ? "rounded-[2.2rem_0.8rem_2.2rem_2.2rem] hover:rounded-[0.8rem_2.2rem_2.2rem_2.2rem]"
          : "rounded-[0.8rem_2.2rem_2.2rem_2.2rem] hover:rounded-[2.2rem_0.8rem_2.2rem_2.2rem]"
      }`}
    >
      <div className="flex items-center gap-5">
        {/* آواتار: هنگام هاور شکل مربع‌گرد → دایره، حلقه‌ی چرخان و دو موج نوری */}
        <div className="relative h-20 w-20 shrink-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.3rem_1.3rem_1.3rem_0.4rem] border border-[var(--color-primary)] opacity-0 transition-[border-radius] duration-500 group-hover:rounded-[2.5rem] group-hover:[animation:siryx-ring_1.8s_ease-out_infinite]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.3rem_1.3rem_1.3rem_0.4rem] border border-[var(--color-primary)] opacity-0 transition-[border-radius] duration-500 group-hover:rounded-[2.5rem] group-hover:[animation:siryx-ring_1.8s_ease-out_0.9s_infinite]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[3px] overflow-hidden rounded-[1.5rem_1.5rem_1.5rem_0.6rem] opacity-0 transition-[opacity,border-radius] duration-500 group-hover:rounded-[2.75rem] group-hover:opacity-100"
          >
            <span className="absolute -inset-1/2 [animation:siryx-spin_2.4s_linear_infinite] [background:conic-gradient(from_0deg,transparent_0_65%,var(--color-primary)_100%)]" />
          </span>
          <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-[1.3rem_1.3rem_1.3rem_0.4rem] bg-[var(--color-bg)] ring-1 ring-[var(--color-primary)] transition-[border-radius,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06] group-hover:rounded-[2.5rem]">
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
        <div dir="ltr" className="min-w-0">
          <h3 className="text-4xl font-black leading-none sm:text-5xl">
            {m.name}
            <span className="text-[var(--color-primary)] [text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]">.</span>
          </h3>
          <p className="mt-2 flex items-center gap-2 font-mono text-xs tracking-[0.2em] opacity-70">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            {m.role}
          </p>
        </div>
      </div>

      <p className="mt-5 leading-8 opacity-70">{m.bio}</p>

      {m.tags?.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {m.tags.map((tag, t) => (
            <li key={tag} dir="ltr" className={`rounded-full border-[1.5px] px-3.5 py-1 text-sm ${tagStyles[t % tagStyles.length]}`}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      {m.links?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {m.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="rounded-full border-[1.5px] border-[var(--color-surface)] px-5 py-2 text-sm transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-secondary)]"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </article>
  );

  const renderInfo = (h, i, refFn) => (
    <article
      ref={refFn}
      data-card
      className={`${boxBase} ${
        i === 0 ? "rounded-[2.2rem_2.2rem_2.2rem_0.8rem]" : "rounded-[2.2rem_2.2rem_0.8rem_2.2rem]"
      }`}
    >
      <h3 className="text-xl font-black leading-8">
        {h.title}
        <span className="text-[var(--color-primary)]">.</span>
      </h3>
      <p className="mt-3 leading-8 opacity-70">{h.text}</p>
    </article>
  );

  return (
    <section
      ref={rootRef}
      id="about"
      dir="rtl"
      className="relative overflow-hidden bg-[var(--color-bg)] px-4 py-24 text-[var(--color-text)] sm:px-6 lg:px-8"
    >
      <style>{`
        @keyframes siryx-ring { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(1.6); opacity: 0 } }
        @keyframes siryx-spin { to { transform: rotate(360deg) } }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-surface)_1px,transparent_1px),linear-gradient(90deg,var(--color-surface)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_100%_0%,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <header data-head>
          <h2 className="text-6xl font-black leading-[1.15] sm:text-7xl md:text-8xl">
            <span className="block">{title[0]}</span>
            <span className="block text-[var(--color-primary)] [text-shadow:0_0_40px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]">
              {title[1]}
            </span>
          </h2>
        </header>

        <div
          ref={gridRef}
          dir="ltr"
          className="relative mt-20 grid gap-10 md:grid-cols-[1fr_minmax(230px,0.55fr)_1fr] md:grid-rows-2 md:gap-x-28 md:gap-y-16"
        >
          {/* ذرات نورانی؛ پشت باکس‌ها تا از لبه‌هایشان بیرون بزنند */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-0"
            style={{ left: -PAD, top: -PAD }}
          />

          {/* خط عمودی موبایل */}
          <div
            aria-hidden="true"
            data-vline
            className="absolute bottom-0 left-1/2 top-0 z-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--color-primary)] to-transparent opacity-0 shadow-[0_0_14px_var(--color-primary)] md:hidden"
          />

          {/* خطوط دسکتاپ */}
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
                  <path
                    d={p.d}
                    data-pulse
                    pathLength="1"
                    strokeDasharray="0.07 1.3"
                    strokeDashoffset="0.1"
                    fill="none"
                    stroke="var(--color-text)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{ opacity: 0, visibility: "hidden", filter: "drop-shadow(0 0 7px var(--color-primary))" }}
                  />
                </g>
              ))}
            </svg>
          )}

          {/* بالا: اعضا */}
          <div dir="rtl" className="relative z-10 md:col-start-1 md:row-start-1">
            {renderMember(members[0], 0, setNode(0))}
          </div>
          <div dir="rtl" className="relative z-10 md:col-start-3 md:row-start-1">
            {renderMember(members[1], 1, setNode(1))}
          </div>

          {/* وسط: هاب تیم */}
          <div
            dir="rtl"
            className="relative z-10 order-first md:order-none md:col-start-2 md:row-span-2 md:row-start-1 md:self-center"
          >
            <div
              ref={hubRef}
              data-hub
              className="relative rounded-[1rem_2.5rem_2.5rem_2.5rem] bg-[var(--color-bg)] p-7 text-center shadow-[0_0_0_1px_var(--color-primary),0_0_0_8px_var(--color-bg),0_0_0_9px_color-mix(in_srgb,var(--color-primary)_40%,transparent),0_0_80px_-16px_var(--color-primary)]"
            >
              <span
                data-hubglow
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_55px_6px_var(--color-primary)]"
                style={{ visibility: "hidden" }}
              />
              <p dir="ltr" className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
                {team.name}
                <span className="text-[var(--color-primary)] [text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]">.</span>
              </p>
              <p className="mt-4 font-bold text-[var(--color-primary)]">{team.tagline}</p>
              <p className="mt-3 text-sm leading-7 opacity-70">{team.description}</p>
            </div>
          </div>

          {/* پایین: توضیحات تیم */}
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
