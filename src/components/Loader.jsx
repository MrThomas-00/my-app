"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * لودینگ سایت: اسم تیم روی صفحه‌ی تیره ظاهر می‌شود، بعد دوربین داخل نقطه‌ی لیمویی
 * آخر اسم زوم می‌کند؛ حروف بزرگ می‌شوند، کل صفحه را می‌گیرند و مثل پنجره، سایت را نشان می‌دهند.
 *
 * استفاده (src/app/layout.js، اولین فرزندِ <body>):
 *   import Loader from "@/components/Loader";
 *   <body>
 *     <Loader />
 *     <Header />
 *     {children}
 *     <Footer />
 *   </body>
 *
 * پراپ‌ها:
 *   name            اسم نمایش داده‌شده            (پیش‌فرض "SIRYX")
 *   minDuration     حداقل زمان نمایش (میلی‌ثانیه) (پیش‌فرض 1800)
 *   oncePerSession  فقط بار اول هر نشست نمایش بده (پیش‌فرض false)
 *
 * رویدادهای window (اختیاری، برای هماهنگ کردن انیمیشن ورود سایت):
 *   "siryx:reveal"  لحظه‌ای که زوم شروع می‌شود و سایت دارد نمایان می‌شود
 *   "siryx:loaded"  لحظه‌ای که لودینگ کامل برداشته شد
 *
 * فونت: از کلاس font-michroma استفاده می‌کند (همان فونت لوگوی هدر).
 * رنگ‌ها: --color-primary / --color-bg / --color-border
 */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Loader({
  name = "SIRYX",
  minDuration = 1800,
  oncePerSession = false,
}) {
  const rootRef = useRef(null);
  const [done, setDone] = useState(false);

  useIsoLayoutEffect(() => {
    if (oncePerSession && sessionStorage.getItem("siryx-loaded")) {
      setDone(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden"; // تا وقتی لودینگ هست اسکرول قفل است

    let killed = false;
    let minTimer = 0;
    const timelines = [];

    const holeG = root.querySelector("[data-hole]");
    const markG = root.querySelector("[data-mark]");
    const uiG = root.querySelector("[data-ui]");
    const bar = root.querySelector("[data-bar]");
    const track = root.querySelector("[data-track]");
    const texts = Array.from(root.querySelectorAll("[data-t]"));
    const dots = Array.from(root.querySelectorAll("[data-d]"));
    const markText = markG.querySelector("text");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const geo = { cx: 0, cy: 0, r: 0, barW: 0, vw: 0, vh: 0 };
    let exiting = false;

    // ---------- چیدمان: اسم + نقطه وسط صفحه، نوار پیشرفت زیرش ----------
    const layout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fs = Math.min(vw * 0.12, 160);

      texts.forEach((t) => t.setAttribute("font-size", fs));
      const tw = markText.getComputedTextLength();
      const r = fs * 0.085; // شعاع نقطه
      const gap = fs * 0.14;
      const total = tw + gap + r * 2;
      const x0 = (vw - total) / 2;
      const baseY = vh / 2 + fs * 0.36;

      texts.forEach((t) => {
        t.setAttribute("x", x0);
        t.setAttribute("y", baseY);
      });

      const cx = x0 + tw + gap + r;
      const cy = baseY - r; // نقطه روی خط پایه می‌نشیند
      dots.forEach((d) => {
        d.setAttribute("cx", cx);
        d.setAttribute("cy", cy);
      });

      const barW = Math.min(total, vw * 0.6);
      const barX = (vw - barW) / 2;
      const barY = baseY + fs * 0.4;
      [track, bar].forEach((el) => {
        el.setAttribute("x", barX);
        el.setAttribute("y", barY);
      });
      track.setAttribute("width", barW);

      Object.assign(geo, { cx, cy, r, barW, vw, vh });
    };

    const setZoom = (s) => {
      const { cx, cy } = geo;
      const t = `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;
      holeG.setAttribute("transform", t);
      markG.setAttribute("transform", t);
    };

    const finish = () => {
      html.style.overflow = prevOverflow;
      if (oncePerSession) sessionStorage.setItem("siryx-loaded", "1");
      setDone(true);
      requestAnimationFrame(() => ScrollTrigger.refresh());
      window.dispatchEvent(new Event("siryx:loaded"));
    };

    // ---------- ورود: اسم محو → واضح، نقطه با فنر ظاهر می‌شود، نوار پر می‌شود ----------
    const intro = () => {
      gsap.set(dots, { attr: { r: 0 } });
      gsap.set(bar, { attr: { width: 0 } });

      timelines.push(
        gsap
          .timeline()
          .fromTo(
            markG,
            { opacity: 0, filter: "blur(14px)" },
            { opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out", clearProps: "filter" },
            0
          )
          .to(dots, { attr: { r: geo.r }, duration: 0.6, ease: "back.out(2.5)" }, 0.5)
          .fromTo(uiG, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.4)
          .to(bar, { attr: { width: geo.barW * 0.9 }, duration: 1.6, ease: "power2.out" }, 0.3)
      );
    };

    // ---------- خروج: زوم داخل نقطه؛ حروف پنجره‌ی سایت می‌شوند ----------
    const exit = () => {
      if (killed) return;
      exiting = true;

      const { cx, cy, r, vw, vh, barW } = geo;
      const D = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(vw - cx, cy),
        Math.hypot(cx, vh - cy),
        Math.hypot(vw - cx, vh - cy)
      );
      const Z = (D / r) * 1.1; // مقیاسی که نقطه کل صفحه را می‌پوشاند
      const zoom = { k: 0 };

      timelines.push(
        gsap
          .timeline({ onComplete: finish })
          .to(bar, { attr: { width: barW }, duration: 0.3, ease: "power2.out" })
          .to(uiG, { opacity: 0, duration: 0.25 })
          .add(() => {
            gsap.set(holeG, { opacity: 1 }); // حالا حروف و نقطه «سوراخ» می‌شوند
            window.dispatchEvent(new Event("siryx:reveal"));
          })
          // زوم لگاریتمی: حس پرواز به داخل نقطه
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
          // رنگ لیمویی حروف محو می‌شود تا سایت از داخلشان دیده شود
          .to(markG, { opacity: 0, duration: 0.7, ease: "power1.in" }, "<0.45")
      );
    };

    const onResize = () => {
      if (!exiting) layout();
    };

    // ---------- اجرا ----------
    const run = async () => {
      await new Promise((res) => requestAnimationFrame(res));
      if (document.fonts?.ready) await document.fonts.ready;
      if (killed) return;

      layout();

      if (reduce) {
        gsap.set([markG, uiG], { opacity: 1 });
        gsap.set(dots, { attr: { r: geo.r } });
        gsap.set(bar, { attr: { width: geo.barW } });
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

    window.addEventListener("resize", onResize);
    run();

    return () => {
      killed = true;
      window.clearTimeout(minTimer);
      window.removeEventListener("resize", onResize);
      timelines.forEach((t) => t && t.kill());
      html.style.overflow = prevOverflow;
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="در حال بارگذاری"
      className="fixed inset-0 z-[9999]"
    >
      <svg width="100%" height="100%" className="block" aria-hidden="true">
        <defs>
          {/* درخششِ ملایم پشت اسم */}
          <radialGradient id="siryx-loader-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.16 }} />
            <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
          </radialGradient>

          {/* ماسک: همه‌چیز پوشیده است، جز حروف و نقطه که هنگام زوم «سوراخ» می‌شوند */}
          <mask id="siryx-loader-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#fff" />
            <g data-hole style={{ opacity: 0 }}>
              <text data-t className="font-michroma" fill="#000" x="50%" y="50%">
                {name}
              </text>
              <circle data-d r="0" fill="#000" />
            </g>
          </mask>
        </defs>

        {/* پوشش تمام‌صفحه */}
        <g mask="url(#siryx-loader-hole)">
          <rect width="100%" height="100%" style={{ fill: "var(--color-bg)" }} />
          <rect width="100%" height="100%" fill="url(#siryx-loader-glow)" />
        </g>

        {/* نوار پیشرفت */}
        <g data-ui style={{ opacity: 0 }}>
          <rect data-track height="2" rx="1" style={{ fill: "var(--color-border)" }} />
          <rect data-bar height="2" width="0" rx="1" style={{ fill: "var(--color-primary)" }} />
        </g>

        {/* اسم + نقطه‌ی لیمویی (لایه‌ی دیدنی) */}
        <g data-mark style={{ opacity: 0 }}>
          <text data-t className="font-michroma" style={{ fill: "var(--color-primary)" }} x="50%" y="50%">
            {name}
          </text>
          <circle data-d r="0" style={{ fill: "var(--color-primary)" }} />
        </g>
      </svg>
    </div>
  );
}
