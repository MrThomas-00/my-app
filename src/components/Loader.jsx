"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const GAP = 0.14;
const DOT = 0.085;

// حرف S زاویه‌دار پشت اسم
const S_PATH = "M0 0H300V90H90V215H300V520H0V430H210V305H0Z";

// موج‌های گوشه‌ها
const WAVE =
  "M0 270C70 250 110 215 150 175C200 125 215 85 270 55C320 28 380 25 450 -10";

function Waves() {
  return (
    <g fill="none" strokeLinecap="round" style={{ stroke: "var(--color-primary)" }}>
      <path d={WAVE} strokeWidth="6" strokeOpacity="0.12" />
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={i}
          d={WAVE}
          transform={`translate(${-i * 20} ${-i * 16})`}
          strokeWidth={i === 0 ? 1.6 : 0.9}
          strokeOpacity={i === 0 ? 0.9 : Math.max(0.1, 0.4 - i * 0.07)}
        />
      ))}
    </g>
  );
}

// نقطه‌های پراکنده: [cx, cy, r]
const DOTS = [
  ["24%", "24.5%", 4],
  ["19%", "81%", 3],
  ["88%", "48%", 3],
  ["82%", "21%", 2],
  ["7%", "74%", 2.5],
];

const stop = (offset, opacity) => (
  <stop offset={offset} style={{ stopColor: "var(--color-primary)", stopOpacity: opacity }} />
);

export default function Loader({
  name = "SIRYX",
  minDuration = 1800,
  oncePerSession = false,
}) {
  const rootRef = useRef(null);
  const [done, setDone] = useState(false);

  useIsoLayoutEffect(() => {
    if (oncePerSession && sessionStorage.getItem("siryx-loaded")) {
      window.__siryxLoaded = true;
      setDone(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      html: html.style.overflow,
      body: body.style.overflow,
      over: html.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    const unlock = () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      html.style.overscrollBehavior = prev.over;
    };

    let killed = false;
    let minTimer = 0;
    let raf = 0;
    let ro = null;
    let introTl = null;
    const timelines = [];

    const holeG = root.querySelector("[data-hole]");
    const markG = root.querySelector("[data-mark]");
    const glowG = root.querySelector("[data-glow]"); // کپی تارِ اسم (فقط درخشش)
    const blurEl = root.querySelector("[data-glowblur]");
    const ringG = root.querySelector("[data-ringg]"); // حلقه‌ی لبه‌ی پنجره‌ی نقطه
    const rings = Array.from(root.querySelectorAll("[data-ring]"));
    const decorG = root.querySelector("[data-decor]");
    const uiG = root.querySelector("[data-ui]");
    const bar = root.querySelector("[data-bar]");
    const pct = root.querySelector("[data-pct]");
    const texts = Array.from(root.querySelectorAll("[data-t]"));
    const dots = Array.from(root.querySelectorAll("[data-d]"));
    const markText = markG.querySelector("text");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const geo = { cx: 0, cy: 0, r: 0, vw: 0, vh: 0, cap: 1 };
    const prog = { dot: 0, bar: 0 };
    let exiting = false;

    const applyDot = () =>
      dots.forEach((d) => d.setAttribute("r", Math.max(0, geo.r * prog.dot)));
    const applyBar = () => {
      const p = Math.min(1, Math.max(0, prog.bar));
      bar.style.width = `${p * 100}%`;
      pct.textContent = `${Math.round(p * 100)}%`;
    };

    const layout = () => {
      const vw = root.clientWidth || window.innerWidth;
      const vh = root.clientHeight || window.innerHeight;

      texts.forEach((t) => t.setAttribute("font-size", 100));
      const em = markText.getComputedTextLength() / 100;
      const targetW = Math.min(vw * 0.74, 880);
      const fs = Math.min(targetW / (em + GAP + DOT * 2), 180, vh * 0.28);

      texts.forEach((t) => {
        t.setAttribute("font-size", fs);
        t.setAttribute("stroke-width", fs * 0.012);
      });
      const tw = markText.getComputedTextLength();
      const r = fs * DOT;
      const gap = fs * GAP;
      const total = tw + gap + r * 2;
      const x0 = (vw - total) / 2;
      const baseY = vh * 0.45 + fs * 0.36;

      texts.forEach((t) => {
        t.setAttribute("x", x0);
        t.setAttribute("y", baseY);
      });

      const cx = x0 + tw + gap + r;
      const cy = baseY - r;
      [...dots, ...rings].forEach((d) => {
        d.setAttribute("cx", cx);
        d.setAttribute("cy", cy);
      });

      // بلوک زیر اسم: تگ‌لاین و نوار پیشرفت
      uiG.style.setProperty("--fs", `${fs}px`);
      uiG.style.left = `${x0}px`;
      uiG.style.width = `${total}px`;
      uiG.style.top = `${baseY + fs * 0.2}px`;

      blurEl?.setAttribute("stdDeviation", (fs * 0.07).toFixed(1));

      const cap = Math.max(2, (cx / (gap + r)) * 1.25);

      Object.assign(geo, { cx, cy, r, vw, vh, cap });
      applyDot();
      applyBar();
    };

    const setZoom = (s) => {
      const { cx, cy, r, cap } = geo;
      const ts = Math.min(s, cap);
      const tf = `translate(${cx} ${cy}) scale(${ts}) translate(${-cx} ${-cy})`;
      texts.forEach((t) => t.setAttribute("transform", tf));
      dots.forEach((d) => d.setAttribute("r", r * s));
      rings.forEach((c) => c.setAttribute("r", r * s));
    };

    const finish = () => {
      unlock();
      if (oncePerSession) sessionStorage.setItem("siryx-loaded", "1");
      window.__siryxLoaded = true;
      setDone(true);
      requestAnimationFrame(() => ScrollTrigger.refresh());
      window.dispatchEvent(new Event("siryx:loaded"));
    };

    const intro = () => {
      prog.dot = 0;
      prog.bar = 0;
      applyDot();
      applyBar();

      introTl = gsap
        .timeline()
        .fromTo(
          markG,
          { opacity: 0, filter: "blur(14px)" },
          { opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out", clearProps: "filter" },
          0
        )
        .fromTo(glowG, { opacity: 0 }, { opacity: 0.7, duration: 1, ease: "power2.out" }, 0.2)
        .fromTo(decorG, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" }, 0)
        .to(prog, { dot: 1, duration: 0.6, ease: "back.out(2.5)", onUpdate: applyDot }, 0.5)
        .fromTo(uiG, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.4)
        .to(prog, { bar: 0.9, duration: 1.6, ease: "power2.out", onUpdate: applyBar }, 0.3);

      timelines.push(introTl);
    };

    const exit = () => {
      if (killed) return;
      exiting = true;

      introTl?.kill();
      prog.dot = 1;
      layout();

      const { cx, cy, r, vw, vh } = geo;
      const D = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(vw - cx, cy),
        Math.hypot(cx, vh - cy),
        Math.hypot(vw - cx, vh - cy)
      );
      const Z = (D / r) * 1.2;
      const zoom = { k: 0 };

      timelines.push(
        gsap
          .timeline({ onComplete: finish })
          .to(prog, { bar: 1, duration: 0.3, ease: "power2.out", onUpdate: applyBar })
          // فقط نوار و درخشش محو می‌شن؛ خودِ اسم همچنان پررنگ می‌مونه
          .to([uiG, glowG], { opacity: 0, duration: 0.3 })
          .add(() => {
            gsap.set([holeG, ringG], { opacity: 1 });
            window.dispatchEvent(new Event("siryx:reveal"));
          })
          .to(
            zoom,
            {
              k: 1,
              duration: 1.9,
              ease: "power2.inOut",
              onUpdate: () => setZoom(Math.pow(Z, zoom.k)),
            },
            ">"
          )
          // اسم لیمویی زود و وقتی هنوز بزرگ نشده جاش رو به پنجره می‌ده
          .to(markG, { opacity: 0, duration: 0.35, ease: "power1.out" }, "<0.1")
      );
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!exiting && !killed) layout();
      });
    };

    const run = async () => {
      await new Promise((res) => requestAnimationFrame(res));
      if (document.fonts?.ready) await document.fonts.ready;
      if (killed) return;

      layout();
      ro = new ResizeObserver(onResize);
      ro.observe(root);

      if (reduce) {
        gsap.set([markG, uiG, decorG], { opacity: 1 });
        gsap.set(glowG, { opacity: 0.7 });
        prog.dot = 1;
        prog.bar = 1;
        applyDot();
        applyBar();
      } else {
        intro();
      }

      const loaded = new Promise((res) => {
        if (document.readyState === "complete") res();
        else window.addEventListener("load", res, { once: true });
      });
      const minTime = new Promise((res) => {
        minTimer = window.setTimeout(res, reduce ? 400 : minDuration);
      });

      await Promise.all([loaded, minTime]);
      if (killed) return;

      if (reduce) {
        timelines.push(gsap.to(root, { opacity: 0, duration: 0.4, onComplete: finish }));
      } else {
        exit();
      }
    };

    run();

    return () => {
      killed = true;
      window.clearTimeout(minTimer);
      cancelAnimationFrame(raf);
      ro?.disconnect();
      timelines.forEach((t) => t && t.kill());
      unlock();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      dir="ltr"
      role="status"
      aria-label="در حال بارگذاری"
      className="fixed inset-0 z-[9999] touch-none overscroll-none"
    >
      <style>{`
        @keyframes siryx-ld-twinkle { 0%, 100% { opacity: .25 } 50% { opacity: 1 } }
        .siryx-ld-twinkle { animation: siryx-ld-twinkle var(--d, 3.5s) ease-in-out var(--dl, 0s) infinite; }
        @media (prefers-reduced-motion: reduce) { .siryx-ld-twinkle { animation: none } }
      `}</style>

      <svg width="100%" height="100%" className="block" aria-hidden="true">
        <defs>
          <radialGradient id="siryx-loader-glow" cx="50%" cy="50%" r="50%">
            {stop(0, 0.18)}
            {stop(1, 0)}
          </radialGradient>

          {/* گرادیان اسم: لیمویی → سفید مایل به لیمویی */}
          <linearGradient id="siryx-loader-text" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ADFF2F" />
            <stop offset="0.55" stopColor="#ADFF2F" />
            <stop offset="1" stopColor="#f2ffd1" />
          </linearGradient>

          {/* تار کردن کپیِ درخشش */}
          <filter id="siryx-loader-blur" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur data-glowblur in="SourceGraphic" stdDeviation="10" />
          </filter>

          {/* خط عمودی وسط: پررنگ در دو سر، محو در وسط */}
          <linearGradient id="siryx-ld-vline" x1="0" y1="0" x2="0" y2="1">
            {stop(0, 1)}
            {stop(0.2, 0.5)}
            {stop(0.38, 0.05)}
            {stop(0.62, 0.05)}
            {stop(0.8, 0.5)}
            {stop(1, 1)}
          </linearGradient>

          <mask id="siryx-loader-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#fff" />
            <g data-hole style={{ opacity: 0 }}>
              <text data-t className="font-michroma" fill="#000" stroke="#000" strokeLinejoin="round" x="50%" y="50%">
                {name}
              </text>
              <circle data-d r="0" fill="#000" />
            </g>
          </mask>
        </defs>

        {/* پوشش تمام‌صفحه + تزئینات (همه با حروف و نقطه «سوراخ» می‌شوند) */}
        <g mask="url(#siryx-loader-hole)">
          <rect width="100%" height="100%" style={{ fill: "var(--color-bg)" }} />
          <rect width="100%" height="100%" fill="url(#siryx-loader-glow)" />

          <g data-decor style={{ opacity: 0 }}>
            {/* حرف S محو پشت اسم */}
            <svg x="32%" y="10%" width="36%" height="80%" viewBox="0 0 440 520" preserveAspectRatio="xMidYMid meet" overflow="visible">
              <path
                d={S_PATH}
                transform="matrix(1 0 -0.25 1 130 0)"
                fill="none"
                strokeOpacity="0.14"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                style={{ stroke: "var(--color-primary)" }}
              />
            </svg>

            {/* موج‌های بالا-چپ و پایین-راست */}
            <svg x="0" y="0" width="42%" height="42%" viewBox="0 0 600 400" preserveAspectRatio="xMinYMin meet" overflow="visible">
              <Waves />
            </svg>
            <svg x="58%" y="58%" width="42%" height="42%" viewBox="0 0 600 400" preserveAspectRatio="xMaxYMax meet" overflow="visible">
              <g transform="rotate(180 300 200)">
                <Waves />
              </g>
            </svg>

            {/* خط عمودی وسط با دو ستاره */}
            <rect x="50%" y="0" width="2" height="100%" fill="url(#siryx-ld-vline)" transform="translate(-1 0)" />
            {["14%", "82.5%"].map((y, i) => (
              <svg key={y} x="50%" y={y} overflow="visible" className="siryx-ld-twinkle" style={{ "--dl": `${i * 0.9}s` }}>
                <path
                  d="M0 -15 2.8 -2.8 15 0 2.8 2.8 0 15 -2.8 2.8 -15 0 -2.8 -2.8Z"
                  style={{ fill: "var(--color-primary)" }}
                />
              </svg>
            ))}

            {/* نقطه‌های پراکنده */}
            {DOTS.map(([cx, cy, r], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                className="siryx-ld-twinkle"
                style={{ fill: "var(--color-primary)", "--d": `${3 + (i % 3)}s`, "--dl": `${(i * 0.4).toFixed(1)}s` }}
              />
            ))}
          </g>
        </g>

        {/* درخشش: کپی تار شده‌ی اسم (جدا از خودِ اسم تا بشه جدا محوش کرد) */}
        <g data-glow filter="url(#siryx-loader-blur)" style={{ opacity: 0 }}>
          <text data-t className="font-michroma" style={{ fill: "var(--color-primary)" }} x="50%" y="50%">
            {name}
          </text>
          <circle data-d r="0" style={{ fill: "var(--color-primary)" }} />
        </g>

        {/* اسم + نقطه‌ی لیمویی (لایه‌ی دیدنی) */}
        <g data-mark style={{ opacity: 0 }}>
          <text
            data-t
            className="font-michroma"
            fill="url(#siryx-loader-text)"
            stroke="url(#siryx-loader-text)"
            strokeLinejoin="round"
            x="50%"
            y="50%"
          >
            {name}
          </text>
          <circle data-d r="0" style={{ fill: "var(--color-primary)" }} />
        </g>

        {/* حلقه‌ی لیمویی لبه‌ی پنجره‌ی نقطه موقع زوم */}
        <g data-ringg fill="none" style={{ opacity: 0 }}>
          <circle data-ring r="0" strokeWidth="14" strokeOpacity="0.16" style={{ stroke: "var(--color-primary)" }} />
          <circle data-ring r="0" strokeWidth="2.5" style={{ stroke: "var(--color-primary)" }} />
        </g>
      </svg>

      {/* بلوک زیر اسم: تگ‌لاین و نوار پیشرفت با درصد */}
      <div
        data-ui
        className="absolute select-none font-michroma"
        style={{ opacity: 0, "--fs": "100px" }}
      >
        <div
          className="flex items-center justify-center whitespace-nowrap text-[#8a93a3]"
          style={{
            fontSize: "max(7px, calc(var(--fs) * 0.085))",
            letterSpacing: "0.42em",
            paddingLeft: "0.42em",
            gap: "1.1em",
          }}
        >

        </div>

        <div className="relative" style={{ marginTop: "calc(var(--fs) * 0.2)" }}>
          <div
            className="w-full rounded-full border border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] bg-black/40 p-[3px]"
            style={{ height: "max(12px, calc(var(--fs) * 0.15))" }}
          >
            <div
              data-bar
              className="h-full w-0 rounded-full bg-[linear-gradient(90deg,#7fd11a,var(--color-primary)_85%,#f4ffd6)] shadow-[0_0_10px_-1px_var(--color-primary)]"
            />
          </div>
          <span
            data-pct
            className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[var(--color-primary)]"
            style={{
              left: "100%",
              paddingLeft: "calc(var(--fs) * 0.12)",
              fontSize: "max(10px, calc(var(--fs) * 0.1))",
            }}
          >
            0%
          </span>
        </div>
      </div>
    </div>
  );
}