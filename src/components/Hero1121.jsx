"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Hero — SIRYX
 *
 * بکگراند: درخت لیمویی با ریشه‌هایی که از لبه‌ی پایین هیرو بیرون می‌زنند.
 * ریشه‌ی وسطی (connect) از هیرو خارج می‌شود و به خط سکشن پروژه‌ها می‌رسد.
 *
 * رنگ‌ها در globals.css:
 *   --color-primary / --color-bg / --color-secondary / --color-surface / --color-text
 *
 * استفاده:
 *   <Hero />
 *   <Hero connectReach={380} />   // طول ریشه‌ی متصل‌شونده به پروژه‌ها (px تقریبی)
 *
 * نکته: ریشه‌ی وسطی دقیقاً روی خط وسط صفحه (x = 50%) تمام می‌شود.
 * خط سکشن پروژه‌ها هم باید از همین x شروع شود.
 */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ریشه‌های فرعی (از پایین تنه شروع می‌شوند، y = 800 لبه‌ی پایین هیرو است)
const roots = [
  "M 372 800 C 350 842 270 872 160 884",
  "M 400 800 C 388 850 330 900 262 944",
  "M 426 800 C 420 860 398 920 372 984",
  "M 456 800 C 454 852 436 902 446 962",
  "M 548 800 C 558 862 586 922 612 992",
  "M 576 800 C 602 852 662 892 742 934",
  "M 606 800 C 646 832 730 852 826 862",
  "M 632 800 C 676 820 760 812 872 828",
];

// شاخه‌های ریز روی ریشه‌ها
const rootTwigs = [
  "M 262 944 C 240 936 214 940 190 954",
  "M 372 984 C 360 996 356 1014 358 1032",
  "M 612 992 C 628 1000 652 1002 672 1016",
  "M 742 934 C 760 930 790 936 812 950",
  "M 160 884 C 140 876 118 878 96 888",
];

export default function Hero({
  badge = "SIRYX · Web Studio",
  title = ["ایده‌هات رو به", "سایتی تبدیل می‌کنیم", "که حرف می‌زنه."],
  subtitle = "ما در SIRYX طراحی و توسعه‌ی وب رو کنار هم جلو می‌بریم؛ از اسکچ اولیه تا سایتی سریع، تمیز و ماندگار.",
  primaryCta = { label: "مشاهده‌ی پروژه‌ها", href: "#projects" },
  secondaryCta = { label: "درباره‌ی ما", href: "#about" },
  connectReach = 340,
}) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const canvasRef = useRef(null);

  const connectPath = `M 500 800 C 495 ${800 + connectReach * 0.3} 522 ${
    800 + connectReach * 0.62
  } 500 ${800 + connectReach}`;

  // ---------- انیمیشن‌ها ----------
  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-in]",
        { autoAlpha: 0, y: 36, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.15,
        }
      );

      // درخت: رشد از پایین
      gsap.fromTo(
        "[data-tree]",
        { autoAlpha: 0, y: 40, scaleY: 0.94, svgOrigin: "500 800" },
        { autoAlpha: 1, y: 0, scaleY: 1, duration: 1.8, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        "[data-vein]",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 2.2, ease: "power2.out", stagger: 0.2, delay: 0.8 }
      );

      // ریشه‌ها: کشیده شدن به پایین
      const grow = gsap.timeline({ delay: 0.9 });
      grow.fromTo(
        "[data-root]",
        { strokeDashoffset: 1, autoAlpha: 0 },
        { strokeDashoffset: 0, autoAlpha: 1, duration: 2.2, ease: "power2.out", stagger: 0.1 }
      );

      // بسته‌ی نوری روی ریشه‌ی متصل‌شونده: از تنه به سمت پروژه‌ها
      const down = document.querySelector("[data-pulse-down]");
      if (down) {
        const p = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });
        p.set(down, { autoAlpha: 0, strokeDashoffset: 0.1 })
          .to(down, { autoAlpha: 1, duration: 0.15 })
          .to(down, { strokeDashoffset: -1, duration: 2.4, ease: "power1.inOut" }, "<")
          .to(down, { autoAlpha: 0, duration: 0.2 }, ">-0.2");
        grow.add(() => p.play(), 2.4);
      }

      // جریان کم‌نور روی ریشه‌های فرعی: از نوک به سمت تنه
      gsap.utils.toArray("[data-pulse-up]").forEach((el, i) => {
        const p = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: 1.5 + Math.random() * 3,
        });
        p.set(el, { autoAlpha: 0, strokeDashoffset: -1 })
          .to(el, { autoAlpha: 0.9, duration: 0.15 })
          .to(el, { strokeDashoffset: 0.1, duration: 2 + Math.random(), ease: "power1.inOut" }, "<")
          .to(el, { autoAlpha: 0, duration: 0.2 }, ">-0.2");
        grow.add(() => p.play(), 2.6 + i * 0.5 + Math.random());
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
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim() || "#ADFF2F";

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
        y: H * (0.45 + Math.random() * 0.5),
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

  const glow = "drop-shadow(0 0 7px color-mix(in srgb, var(--color-primary) 70%, transparent))";

  return (
    // z-20 و overflow-x:clip → ریشه می‌تواند از پایین هیرو به سکشن بعدی برسد، بدون اسکرول افقی
    <section
      ref={rootRef}
      id="home"
      dir="rtl"
      className="relative z-20 min-h-[100svh] bg-transparent text-[var(--color-text)] [overflow-x:clip]"
    >
      {/* پس‌زمینه‌ی بریده‌شده: شبکه، نورها و ذرات */}
      <div ref={bgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[var(--color-bg)]">
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-surface)_1px,transparent_1px),linear-gradient(90deg,var(--color-surface)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_100%_0%,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_100%,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent)]" />
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

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

        <h1 className="mt-8 text-5xl font-black leading-[1.35] sm:text-6xl md:text-7xl">
          <span data-in className="block">{title[0]}</span>
          <span data-in className="block">{title[1]}</span>
          <span
            data-in
            className="block text-[var(--color-primary)] [text-shadow:0_0_40px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]"
          >
            {title[2]}
          </span>
        </h1>

        <p data-in className="mt-8 max-w-xl text-lg leading-9 opacity-75">
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

      {/* درخت و ریشه‌ها: y=800 در viewBox دقیقاً لبه‌ی پایین هیرو است */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(980px,150vw)] -translate-x-1/2"
      >
        <svg viewBox="0 200 1000 600" className="block h-auto w-full overflow-visible">
          <defs>
            <linearGradient id="hero-tree-fill" gradientUnits="userSpaceOnUse" x1="0" y1="214" x2="0" y2="800">
              <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.03" />
              <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.26" />
            </linearGradient>
            <linearGradient id="hero-tree-stroke" gradientUnits="userSpaceOnUse" x1="0" y1="214" x2="0" y2="800">
              <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.85" />
              <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="hero-root" gradientUnits="userSpaceOnUse" x1="0" y1="800" x2="0" y2="1040">
              <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.9" />
              <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="hero-root-main" gradientUnits="userSpaceOnUse" x1="0" y1="800" x2="0" y2={800 + connectReach}>
              <stop offset="0" stopColor="var(--color-primary)" stopOpacity="1" />
              <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* تنه و شاخه‌ها */}
          <g style={{ filter: "drop-shadow(0 0 18px color-mix(in srgb, var(--color-primary) 35%, transparent))" }}>
            <path
              data-tree
              fill="url(#hero-tree-fill)"
              stroke="url(#hero-tree-stroke)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              d="M 330 800 C 388 742 428 672 436 598 C 404 556 362 508 318 444 L 306 420 C 362 428 410 456 442 494 C 444 440 450 390 462 350 C 478 318 498 296 516 280 C 528 296 534 322 538 352 C 548 320 560 270 574 226 L 590 214 C 598 258 606 300 610 340 C 640 312 684 282 730 226 L 738 224 C 728 262 714 292 700 314 C 730 326 756 346 776 374 C 742 394 702 400 668 414 C 648 446 644 490 650 530 C 658 620 690 730 690 800 Z"
            />
          </g>

          {/* رگه‌های داخل تنه */}
          <g fill="none" stroke="var(--color-primary)" strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round">
            <path data-vein pathLength="1" strokeDasharray="1" d="M 500 800 C 492 720 500 640 486 560 C 480 500 492 440 500 380" />
            <path data-vein pathLength="1" strokeDasharray="1" d="M 440 800 C 450 730 462 660 458 600" />
            <path data-vein pathLength="1" strokeDasharray="1" d="M 570 800 C 560 720 572 650 584 580 C 592 520 600 470 612 420" />
          </g>

          {/* ریشه‌های فرعی + شاخه‌های ریز */}
          <g fill="none" strokeLinecap="round" style={{ filter: glow }}>
            {roots.map((d, i) => (
              <g key={i}>
                <path data-root pathLength="1" strokeDasharray="1" d={d} stroke="url(#hero-root)" strokeWidth="2" />
                <path
                  data-pulse-up
                  pathLength="1"
                  strokeDasharray="0.06 1.4"
                  strokeDashoffset="-1"
                  d={d}
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  style={{ opacity: 0, visibility: "hidden" }}
                />
              </g>
            ))}
            {rootTwigs.map((d, i) => (
              <path key={i} data-root pathLength="1" strokeDasharray="1" d={d} stroke="var(--color-primary)" strokeOpacity="0.35" strokeWidth="1.2" />
            ))}
          </g>

          {/* ریشه‌ی اصلی: از هیرو بیرون می‌زند و به خط پروژه‌ها می‌رسد */}
          <g fill="none" strokeLinecap="round" style={{ filter: glow }}>
            <path data-root pathLength="1" strokeDasharray="1" d={connectPath} stroke="url(#hero-root-main)" strokeWidth="3" />
            <path
              data-pulse-down
              pathLength="1"
              strokeDasharray="0.07 1.4"
              strokeDashoffset="0.1"
              d={connectPath}
              stroke="var(--color-text)"
              strokeWidth="4"
              style={{ opacity: 0, visibility: "hidden" }}
            />
          </g>
        </svg>
      </div>
    </section>
  );
}
