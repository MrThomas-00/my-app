"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * سکشن «درباره ما» — طرح شبکه‌ای با هاب مرکزی
 *
 * وسط: باکس تیم (SIRYX) + توضیحات
 * بالا: دو عضو تیم
 * پایین: دو باکس درباره‌ی نحوه‌ی کار تیم (قابل ویرایش)
 * خطوط سبز منحنی از وسط به هر باکس وصل می‌شوند و با اسکرول کشیده می‌شوند.
 *
 * رنگ‌ها در globals.css:
 *   --color-primary / --color-bg / --color-secondary / --color-surface / --color-text
 */

const defaultTeam = {
  name: "SIRYX",
  tagline: "استودیوی کوچک، با استانداردهای بزرگ.",
  description:
    "SIRYX یک تیم دو نفره‌ست که طراحی و توسعه رو کنار هم جلو می‌بره. ما ایده رو از اسکچ تا نسخه‌ی نهایی با هم می‌سازیم تا نتیجه هم سریع باشه، هم تمیز و هم دقیقاً چیزی که لازم داشتید.",
  facts: ["طراحی + توسعه", "تحویل مرحله‌ای", "ارتباط مستقیم"],
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
  "relative bg-[var(--color-secondary)] p-7 shadow-[0_0_0_1px_var(--color-surface),0_0_0_7px_var(--color-bg),0_0_0_8px_var(--color-surface)] transition-[border-radius,box-shadow] duration-500 hover:shadow-[0_0_0_1px_var(--color-primary),0_0_0_7px_var(--color-bg),0_0_0_8px_var(--color-primary),0_0_60px_-14px_var(--color-primary)]";

export default function About({
  team = defaultTeam,
  members = defaultMembers,
  highlights = defaultHighlights,
  title = ["درباره", "ما."],
}) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const hubRef = useRef(null);
  const nodeRefs = useRef([]); // [TL, TR, BL, BR]
  const [paths, setPaths] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // مسیر منحنی از لبه‌ی هر باکس به لبه‌ی هاب
  const measure = useCallback(() => {
    const grid = gridRef.current;
    const hub = hubRef.current;
    if (!grid || !hub) return;

    if (!window.matchMedia("(min-width: 768px)").matches) {
      setPaths([]);
      return;
    }

    const g = grid.getBoundingClientRect();
    const h = hub.getBoundingClientRect();
    const hx = h.left - g.left;
    const hy = h.top - g.top;

    // نقطه‌ی اتصال روی هاب: [سمت، درصد ارتفاع]
    const anchors = [
      ["l", 0.25],
      ["r", 0.25],
      ["l", 0.75],
      ["r", 0.75],
    ];

    const next = nodeRefs.current.map((el, i) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const [side, p] = anchors[i];
      const isLeftBox = i % 2 === 0;

      const x1 = (isLeftBox ? r.right : r.left) - g.left;
      const y1 = r.top - g.top + r.height * 0.5;
      const x2 = side === "l" ? hx : hx + h.width;
      const y2 = hy + h.height * p;
      const mx = (x1 + x2) / 2;

      return {
        d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
        x1,
        y1,
        x2,
        y2,
      };
    });

    setPaths(next.filter(Boolean));
    setSize({ w: g.width, h: g.height });
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
          scrollTrigger: { trigger: "[data-head]", start: "top 85%" },
        }
      );

      // هاب اول ظاهر می‌شود، بعد باکس‌ها از آن «بیرون می‌آیند»
      const tl = gsap.timeline({
        scrollTrigger: { trigger: gridRef.current, start: "top 75%" },
      });
      tl.fromTo(
        "[data-hub]",
        { autoAlpha: 0, scale: 0.8, filter: "blur(14px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" }
      ).fromTo(
        "[data-card]",
        { autoAlpha: 0, scale: 0.88, filter: "blur(12px)" },
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
        },
        "-=0.3"
      );

      // کشیده شدن خط‌های سبز
      gsap.utils.toArray("[data-line]").forEach((path) => {
        gsap.fromTo(
          path,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 70%",
              end: "bottom 70%",
              scrub: 0.6,
            },
          }
        );
      });

      gsap.fromTo(
        "[data-dot]",
        { autoAlpha: 0, scale: 0 },
        {
          autoAlpha: 1,
          scale: 1,
          transformOrigin: "center",
          stagger: 0.1,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: { trigger: gridRef.current, start: "top 55%" },
        }
      );

      // خط عمودی موبایل
      gsap.fromTo(
        "[data-vline]",
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 0.6,
          },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, [paths.length]);

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
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.3rem_1.3rem_1.3rem_0.4rem] bg-[var(--color-bg)] ring-1 ring-[var(--color-primary)] transition-[border-radius] duration-500 group-hover:rounded-full">
          {m.image ? (
            <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-[var(--color-primary)]">
              {m.name.slice(0, 1).toUpperCase()}
            </span>
          )}
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
        i === 0
          ? "rounded-[2.2rem_2.2rem_2.2rem_0.8rem]"
          : "rounded-[2.2rem_2.2rem_0.8rem_2.2rem]"
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
      {/* پس‌زمینه: شبکه + نور لیمویی */}
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

        {/* شبکه: چپ و راست باکس‌ها، وسط هاب. dir=ltr فقط برای هندسه‌ی چیدمان */}
        <div
          ref={gridRef}
          dir="ltr"
          className="relative mt-16 grid gap-10 md:grid-cols-[1fr_minmax(280px,0.8fr)_1fr] md:grid-rows-2 md:gap-x-24 md:gap-y-14"
        >
          {/* خط عمودی موبایل */}
          <div
            aria-hidden="true"
            data-vline
            className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-primary)] to-transparent shadow-[0_0_14px_var(--color-primary)] md:hidden"
          />

          {/* خطوط دسکتاپ */}
          {paths.length > 0 && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
            >
              {paths.map((p, i) => (
                <g key={i}>
                  <path
                    d={p.d}
                    data-line
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px var(--color-primary))" }}
                  />
                  <circle data-dot cx={p.x1} cy={p.y1} r="5" fill="var(--color-primary)" style={{ filter: "drop-shadow(0 0 8px var(--color-primary))" }} />
                  <circle data-dot cx={p.x2} cy={p.y2} r="5" fill="var(--color-primary)" style={{ filter: "drop-shadow(0 0 8px var(--color-primary))" }} />
                </g>
              ))}
            </svg>
          )}

          {/* بالا-چپ / بالا-راست: اعضا */}
          <div dir="rtl" className="relative z-10 md:col-start-1 md:row-start-1 md:self-start">
            {renderMember(members[0], 0, setNode(0))}
          </div>
          <div dir="rtl" className="relative z-10 md:col-start-3 md:row-start-1 md:self-start">
            {renderMember(members[1], 1, setNode(1))}
          </div>

          {/* وسط: هاب تیم — در موبایل بالاتر از همه */}
          <div
            dir="rtl"
            className="relative z-10 order-first md:order-none md:col-start-2 md:row-span-2 md:row-start-1 md:self-center"
          >
            <div
              ref={hubRef}
              data-hub
              className="rounded-[1rem_3rem_3rem_3rem] bg-[var(--color-bg)] p-8 text-center shadow-[0_0_0_1px_var(--color-primary),0_0_0_8px_var(--color-bg),0_0_0_9px_color-mix(in_srgb,var(--color-primary)_40%,transparent),0_0_80px_-16px_var(--color-primary)]"
            >
              <p dir="ltr" className="text-5xl font-black leading-none tracking-tight sm:text-6xl">
                {team.name}
                <span className="text-[var(--color-primary)] [text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]">.</span>
              </p>
              <p className="mt-4 font-bold text-[var(--color-primary)]">{team.tagline}</p>
              <p className="mt-4 leading-8 opacity-70">{team.description}</p>
              <ul className="mt-6 flex flex-wrap justify-center gap-2">
                {team.facts.map((f) => (
                  <li key={f} className="rounded-full border-[1.5px] border-[var(--color-surface)] px-3.5 py-1 text-sm">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* پایین-چپ / پایین-راست: توضیحات تیم */}
          <div dir="rtl" className="relative z-10 md:col-start-1 md:row-start-2 md:self-end">
            {renderInfo(highlights[0], 0, setNode(2))}
          </div>
          <div dir="rtl" className="relative z-10 md:col-start-3 md:row-start-2 md:self-end">
            {renderInfo(highlights[1], 1, setNode(3))}
          </div>
        </div>
      </div>
    </section>
  );
}
