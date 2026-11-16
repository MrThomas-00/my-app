"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const NODES = [
  {
    id: "a",
    step: "01",
    title: "Signal",
    copy: "A ringed entry point. Quiet until it sparks.",
    className:
      "left-[4%] top-[6%] h-[28%] w-[28%] rounded-[2rem] sm:left-[6%] sm:w-[24%]",
  },
  {
    id: "b",
    step: "02",
    title: "Charge",
    copy: "The current jumps. Radius morphs, depth stacks.",
    className:
      "right-[3%] top-[34%] h-[32%] w-[32%] rounded-[2.2rem] sm:right-[5%] sm:w-[28%]",
  },
  {
    id: "c",
    step: "03",
    title: "Output",
    copy: "One high-voltage accent lands where it matters.",
    className:
      "bottom-[5%] left-[1%] h-[24%] w-[30%] rounded-[1.8rem] sm:left-[2%] sm:w-[24%]",
  },
];

function relativeBox(node, wrap) {
  return {
    x: node.left - wrap.left,
    y: node.top - wrap.top,
    w: node.width,
    h: node.height,
    r: node.right - wrap.left,
    b: node.bottom - wrap.top,
    cx: node.left - wrap.left + node.width / 2,
    cy: node.top - wrap.top + node.height / 2,
  };
}

function buildPaths(a, b, c) {
  const wisp = [
    `M ${a.r} ${a.cy - a.h * 0.08}`,
    `C ${a.r + a.w * 0.28} ${a.cy - a.h * 0.35}`,
    `${a.r + a.w * 0.18} ${a.y - a.h * 0.55}`,
    `${a.r + a.w * 0.42} ${Math.max(8, a.y - a.h * 0.7)}`,
  ].join(" ");

  const aToB = [
    `M ${a.x + a.w * 0.22} ${a.b}`,
    `C ${a.x - a.w * 0.18} ${a.b + a.h * 0.55}`,
    `${a.cx + a.w * 0.15} ${a.b + a.h * 0.85}`,
    `${(a.r + b.x) / 2} ${a.b + a.h * 0.42}`,
    `S ${b.x - b.w * 0.18} ${b.cy + b.h * 0.08}`,
    `${b.x} ${b.y + b.h * 0.38}`,
  ].join(" ");

  const bToC = [
    `M ${b.cx} ${b.b}`,
    `C ${b.cx + b.w * 0.08} ${b.b + b.h * 0.38}`,
    `${c.r + c.w * 0.85} ${c.y + c.h * 0.12}`,
    `${c.r} ${c.y}`,
  ].join(" ");

  return [wisp, aToB, bToC];
}

export default function HalogenFlow() {
  const wrapRef = useRef(null);
  const nodeRefs = useRef({});
  const pathRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const [size, setSize] = useState({ w: 1200, h: 640 });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const draw = () => {
      const wrapBox = wrap.getBoundingClientRect();
      const aEl = nodeRefs.current.a;
      const bEl = nodeRefs.current.b;
      const cEl = nodeRefs.current.c;
      if (!aEl || !bEl || !cEl) return;

      const a = relativeBox(aEl.getBoundingClientRect(), wrapBox);
      const b = relativeBox(bEl.getBoundingClientRect(), wrapBox);
      const c = relativeBox(cEl.getBoundingClientRect(), wrapBox);

      setSize({ w: wrapBox.width, h: wrapBox.height });
      setPaths(buildPaths(a, b, c));
    };

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    window.addEventListener("resize", draw);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, []);

  useLayoutEffect(() => {
    if (paths.length === 0) return;

    const lines = pathRefs.current.filter(Boolean);
    const tween = gsap.fromTo(
      lines,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: 1.45,
        stagger: 0.22,
        ease: "power2.out",
      },
    );

    return () => tween.kill();
  }, [paths]);

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/8 bg-bg">
      <div className="pointer-events-none absolute inset-0 halogen-grid opacity-70" />
      <div className="pointer-events-none absolute -right-24 top-[-20%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(173,255,47,0.16),transparent_64%)] blur-2xl" />

      <div
        ref={wrapRef}
        className="relative min-h-[520px] w-full sm:min-h-[640px]"
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {paths.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={d}
              pathLength="1"
              stroke="#ADFF2F"
              strokeWidth="1.75"
              strokeLinecap="round"
              filter="url(#line-glow)"
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          ))}
        </svg>

        {NODES.map((node) => (
          <article
            key={node.id}
            ref={(el) => {
              nodeRefs.current[node.id] = el;
            }}
            className={`absolute flex flex-col justify-between border border-white/12 bg-secondary/90 p-5 shadow-[inset_0_1px_0_rgba(242,245,241,0.08),0_0_0_8px_rgba(22,26,33,0.55)] backdrop-blur-sm transition-[box-shadow,border-color,transform] duration-500 hover:border-primary/55 hover:shadow-[inset_0_1px_0_rgba(173,255,47,0.18),0_0_0_8px_rgba(22,26,33,0.55),0_0_32px_rgba(173,255,47,0.18)] ${node.className}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.22em] text-primary">
                {node.step}
              </span>
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_#ADFF2F]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                {node.title}
              </h3>
              <p className="mt-1 max-w-[18ch] text-[12px] leading-relaxed text-text/55">
                {node.copy}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
