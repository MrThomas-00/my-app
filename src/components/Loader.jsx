"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const GAP = 0.14;
const DOT = 0.085;

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
    const uiG = root.querySelector("[data-ui]");
    const bar = root.querySelector("[data-bar]");
    const track = root.querySelector("[data-track]");
    const texts = Array.from(root.querySelectorAll("[data-t]"));
    const dots = Array.from(root.querySelectorAll("[data-d]"));
    const markText = markG.querySelector("text");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const geo = { cx: 0, cy: 0, r: 0, barW: 0, vw: 0, vh: 0, cap: 1 };
    const prog = { dot: 0, bar: 0 };
    let exiting = false;

    const applyDot = () =>
      dots.forEach((d) => d.setAttribute("r", Math.max(0, geo.r * prog.dot)));
    const applyBar = () =>
      bar.setAttribute("width", Math.max(0, geo.barW * prog.bar));

    const layout = () => {
      const vw = root.clientWidth || window.innerWidth;
      const vh = root.clientHeight || window.innerHeight;

      texts.forEach((t) => t.setAttribute("font-size", 100));
      const em = markText.getComputedTextLength() / 100;
      const targetW = Math.min(vw * 0.74, 820);
      const fs = Math.min(targetW / (em + GAP + DOT * 2), 160, vh * 0.28);

      texts.forEach((t) => t.setAttribute("font-size", fs));
      const tw = markText.getComputedTextLength();
      const r = fs * DOT;
      const gap = fs * GAP;
      const total = tw + gap + r * 2;
      const x0 = (vw - total) / 2;
      const baseY = vh / 2 + fs * 0.36;

      texts.forEach((t) => {
        t.setAttribute("x", x0);
        t.setAttribute("y", baseY);
      });

      const cx = x0 + tw + gap + r;
      const cy = baseY - r;
      dots.forEach((d) => {
        d.setAttribute("cx", cx);
        d.setAttribute("cy", cy);
      });

      const barW = total;
      const barY = baseY + fs * 0.4;
      [track, bar].forEach((el) => {
        el.setAttribute("x", x0);
        el.setAttribute("y", barY);
      });
      track.setAttribute("width", barW);

      const cap = Math.max(2, (cx / (gap + r)) * 1.25);

      Object.assign(geo, { cx, cy, r, barW, vw, vh, cap });
      applyDot();
      applyBar();
    };

    const setZoom = (s) => {
      const { cx, cy, r, cap } = geo;
      const ts = Math.min(s, cap);
      const tf = `translate(${cx} ${cy}) scale(${ts}) translate(${-cx} ${-cy})`;
      texts.forEach((t) => t.setAttribute("transform", tf));
      dots.forEach((d) => d.setAttribute("r", r * s));
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
          .to(uiG, { opacity: 0, duration: 0.25 })
          .add(() => {
            gsap.set(holeG, { opacity: 1 });
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
          .to(markG, { opacity: 0, duration: 0.7, ease: "power1.in" }, "<0.45")
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
        gsap.set([markG, uiG], { opacity: 1 });
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
      <svg width="100%" height="100%" className="block" aria-hidden="true">
        <defs>
          <radialGradient id="siryx-loader-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.16 }} />
            <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
          </radialGradient>

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

        <g mask="url(#siryx-loader-hole)">
          <rect width="100%" height="100%" style={{ fill: "var(--color-bg)" }} />
          <rect width="100%" height="100%" fill="url(#siryx-loader-glow)" />
        </g>

        <g data-ui style={{ opacity: 0 }}>
          <rect data-track height="2" rx="1" style={{ fill: "var(--color-border)" }} />
          <rect data-bar height="2" width="0" rx="1" style={{ fill: "var(--color-primary)" }} />
        </g>

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