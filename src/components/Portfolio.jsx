"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AMPLITUDE = 36;
const FADE = 120;

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const defaultProjects = [
  {
    id: 1,
    title: "فروشگاه آنلاین لوازم خانگی",
    description:
      "طراحی و پیاده‌سازی فروشگاه با سبد خرید، فیلتر محصولات و پرداخت آنلاین.",
    category: "وب‌سایت",
    tags: ["React", "Tailwind", "Node.js"],
    image: "",
    link: "#",
  },
  {
    id: 2,
    title: "اپلیکیشن مدیریت وظایف",
    description: "اپلیکیشن موبایل برای مدیریت کارهای روزانه تیم‌های کوچک.",
    category: "اپلیکیشن",
    tags: ["React Native", "Firebase"],
    image: "",
    link: "#",
  },
  {
    id: 3,
    title: "هویت بصری کافه‌رستوران",
    description: "لوگو، منو و بسته‌بندی برای یک کافه‌رستوران در تهران.",
    category: "برندینگ",
    tags: ["لوگو", "منو", "بسته‌بندی"],
    image: "",
    link: "",
  },
  {
    id: 4,
    title: "داشبورد تحلیل فروش",
    description: "نمودارهای زنده و گزارش‌های قابل خروجی برای تیم فروش.",
    category: "وب‌سایت",
    tags: ["React", "Recharts"],
    image: "",
    link: "#",
  },
  {
    id: 5,
    title: "داشبورد تحلیل فروش",
    description: "نمودارهای زنده و گزارش‌های قابل خروجی برای تیم فروش.",
    category: "وب‌سایت",
    tags: ["React", "Recharts"],
    image: "",
    link: "#",
  },
];

export default function Portfolio({
  projects = defaultProjects,
  title = "نـمـونــه",
  title2 = "کــار هـا",
  subtitle = "بخشی از پروژه‌هایی که با دقت و علاقه ساخته‌ایم",
}) {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [geo, setGeo] = useState({ w: 0, h: 0, H: 0, jx: 0, extra: 0, nodes: [], d: "" });

  useIsoLayoutEffect(() => {
    const list = listRef.current;
    const root = rootRef.current;
    if (!list || !root) return;

    const measure = () => {
      const w = list.offsetWidth;
      const h = list.offsetHeight;
      const lr = list.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      const extra = Math.max(0, Math.round(rr.bottom - lr.bottom));
      const H = h + extra;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const cx = desktop ? w / 2 : 14;
      const jx = Math.round(lr.left - rr.left + cx);

      const nodes = Array.from(list.querySelectorAll("[data-item]")).map(
        (li, i) => ({
          x: desktop ? cx + (i % 2 === 0 ? -AMPLITUDE : AMPLITUDE) : cx,
          y: li.offsetTop + li.offsetHeight / 2,
        })
      );

      const pts = [{ x: cx, y: 0 }, ...nodes, { x: cx, y: H }];
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1];
        const q = pts[i];
        const my = (p.y + q.y) / 2;
        d += ` C ${p.x} ${my}, ${q.x} ${my}, ${q.x} ${q.y}`;
      }

      setGeo((prev) =>
        prev.d === d &&
        prev.w === w &&
        prev.h === h &&
        prev.H === H &&
        prev.jx === jx
          ? prev
          : { w, h, H, jx, extra, nodes, d }
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [projects]);

  useIsoLayoutEffect(() => {
    if (!geo.h) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray("[data-item]");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-mask-rect]", { attr: { y: 0 } });
        gsap.set("[data-content]", { autoAlpha: 1, x: 0, y: 0 });
        gsap.set("[data-ring]", { attr: { r: 9 } });
        gsap.set("[data-core]", { attr: { r: 4.5 } });
        gsap.set("[data-junction]", { scaleX: 1 });
        gsap.set("[data-light]", { opacity: 1 });
        return;
      }

      // خط عمودی: با اسکرول تا لبه‌ی سکشن بعدی کشیده می‌شود
      gsap.fromTo(
        "[data-mask-rect]",
        { attr: { y: -(geo.H + FADE) } },
        {
          attr: { y: 0 },
          ease: "none",
          scrollTrigger: {
            trigger: "[data-list]",
            start: "top center",
            end: `bottom+=${geo.extra + FADE} 60%`,
            scrub: true,
          },
        }
      );

      // خط افقی پایین سکشن: یک تایم‌لاین واحد
      //   ۱) خط از نقطه‌ی اتصال به چپ و راست پر می‌شود
      //   ۲) بعد از کامل شدن خط، نور (به سمت بالا) روشن می‌شود
      //   ۳) بعد جرقه‌های نور شروع به دویدن می‌کنند
      const root = rootRef.current;
      const junctionEl = root.querySelector("[data-junction]");
      const light = root.querySelector("[data-light]");
      const glintR = root.querySelector("[data-glint-r]");
      const glintL = root.querySelector("[data-glint-l]");
      const sectionW = root.clientWidth;

      const glints = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.4 });
      glints
        .fromTo(glintR, { x: 0 }, { x: sectionW - geo.jx, duration: 2.4, ease: "power2.in" }, 0)
        .fromTo(glintL, { x: 0 }, { x: -geo.jx, duration: 2.4, ease: "power2.in" }, 0)
        .fromTo([glintR, glintL], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0)
        .to([glintR, glintL], { opacity: 0, duration: 0.7, ease: "power1.in" }, 1.7);

      gsap
        .timeline({
          paused: true,
          scrollTrigger: {
            trigger: junctionEl,
            start: "top center",
            toggleActions: "play none none reverse",
            onLeaveBack: () => glints.pause(0),
          },
          onComplete: () => glints.restart(),
          onReverseComplete: () => glints.pause(0),
        })
        .fromTo(
          junctionEl,
          { scaleX: 0, transformOrigin: `${geo.jx}px 50%` },
          { scaleX: 1, duration: 0.9, ease: "power3.out" }
        )
        .fromTo(light, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.out" });

      items.forEach((item, i) => {
        const content = item.querySelector("[data-content]");
        const ring = `[data-ring="${i}"]`;
        const core = `[data-core="${i}"]`;

        gsap.set(content, { autoAlpha: 0, x: i % 2 === 0 ? -40 : 40, y: 32 });
        gsap.set(ring, { attr: { r: 0 } });
        gsap.set(core, { attr: { r: 0 } });

        gsap
          .timeline({
            paused: true,
            scrollTrigger: {
              trigger: item,
              start: "center center",
              toggleActions: "play none none reverse",
            },
          })
          .to(ring, { attr: { r: 9 }, duration: 0.35, ease: "back.out(2)" })
          .to(core, { attr: { r: 4.5 }, duration: 0.3, ease: "back.out(3)" }, "<0.05")
          .to(
            content,
            { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out" },
            "<0.05"
          );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [geo]);

  return (
    <section
      ref={rootRef}
      id="portfolio"
      dir="rtl"
      className="relative isolate overflow-hidden bg-[var(--color-bg)] px-4 py-24 text-[var(--color-text)] sm:px-6 lg:px-8"
    >

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 30%, black 70%, transparent), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 30%, black 70%, transparent), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-primary)_20%,transparent),transparent_70%)] md:h-[26rem] md:w-[26rem]"
      />

      <div className="mx-auto max-w-5xl">
<header className="w-full text-center">
  <div className="flex items-center justify-center gap-4">
    <span className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[var(--color-primary)] opacity-70" />

    <h2 className="shrink-0 text-3xl sm:text-4xl font-lalezar">
      {title} <span className="text-[var(--color-primary)]">{title2}</span>
    </h2>

    <span className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[var(--color-primary)] opacity-70" />
  </div>

  <p className="mt-4 leading-8 opacity-70">{subtitle}</p>
</header>

        <div ref={listRef} data-list className="relative mt-16">
          {geo.h > 0 && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-0"
              width={geo.w}
              height={geo.H}
              viewBox={`0 0 ${geo.w} ${geo.H}`}
              fill="none"
            >
              <defs>
                <linearGradient
                  id="pf-fade"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={geo.H}
                >
                  <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
                  <stop offset="0.06" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.6 }} />
                  <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0.6 }} />
                </linearGradient>

                <linearGradient id="pf-reveal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset={geo.H / (geo.H + FADE)} stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask
                  id="pf-mask"
                  maskUnits="userSpaceOnUse"
                  x="-60"
                  y="0"
                  width={geo.w + 120}
                  height={geo.H}
                >
                  <rect
                    data-mask-rect
                    x="-60"
                    y={-(geo.H + FADE)}
                    width={geo.w + 120}
                    height={geo.H + FADE}
                    fill="url(#pf-reveal)"
                  />
                </mask>
              </defs>

              <g mask="url(#pf-mask)" strokeLinecap="round" strokeLinejoin="round">
                <path d={geo.d} stroke="url(#pf-fade)" strokeWidth="12" opacity="0.1" />
                <path d={geo.d} stroke="url(#pf-fade)" strokeWidth="5" opacity="0.2" />
                <path d={geo.d} stroke="url(#pf-fade)" strokeWidth="1.5" />
              </g>

              {geo.nodes.map((n, i) => (
                <g key={i}>
                  <circle
                    data-ring={i}
                    cx={n.x}
                    cy={n.y}
                    r="0"
                    strokeWidth="2"
                    style={{ fill: "var(--color-bg)", stroke: "var(--color-surface)" }}
                  />
                  <circle
                    data-core={i}
                    cx={n.x}
                    cy={n.y}
                    r="0"
                    style={{ fill: "var(--color-primary)" }}
                  />
                </g>
              ))}
            </svg>
          )}

          <ul className="relative z-10">
            {projects.map((project, i) => {
              const { title, description, category, tags = [], image, link } =
                project;
              const imageOnLeft = i % 2 === 0;

              return (
                <li
                  key={project.id}
                  data-item
                  className="py-14 pl-11 md:py-24 md:pl-0"
                >
                  <article
                    data-content
                    className="grid items-center gap-8 md:grid-cols-2 md:gap-x-28"
                  >
                    <div
                      className={`order-2 ${
                        imageOnLeft ? "md:order-1" : "md:order-2"
                      }`}
                    >
                      <span className="text-sm opacity-60 font-vazirmatn">{category}</span>
                      <h3 className="mt-2 text-2xl leading-snug font-lalezar!">
                        {title}
                      </h3>
                      <p className="mt-3 max-w-md leading-8 opacity-70 font-vazirmatn ">
                        {description}
                      </p>

                      {tags.length > 0 && (
                        <ul className="mt-5 flex flex-wrap gap-2 font-vazirmatn">
                          {tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-full border border-[var(--color-surface)] bg-[var(--color-secondary)] px-3 py-1 text-xs"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}

                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                        >
                          مشاهده پروژه
                        </a>
                      )}
                    </div>

                    <div
                      className={`order-1 aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-surface)] bg-[var(--color-secondary)] ${
                        imageOnLeft ? "md:order-2" : "md:order-1"
                      }`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-end p-5">
                          <span className="text-7xl font-bold text-[var(--color-surface)]">
                            {title.slice(0, 1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* خط اتصال به سکشن بعدی: خط عمودی به اینجا می‌چسبد و از وسط به چپ و راست پر می‌شود */}
      <div
        aria-hidden="true"
        data-junction
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0"
        style={{ transform: "scaleX(0)", transformOrigin: `${geo.jx}px 50%` }}
      >
        {/* خط اصلی (بدون نور؛ نور بعد از کامل شدن خط روشن می‌شود) */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[linear-gradient(90deg,transparent,var(--color-primary)_8%,var(--color-primary)_92%,transparent)] opacity-70" />

        {/* نور: فقط به سمت بالا */}
        <div data-light className="absolute inset-0 opacity-0">
          {/* هاله‌ی نوری که از خط به بالا می‌رود */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-primary)_28%,transparent),transparent)] [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" />

          {/* درخشش خط (به سمت بالا) */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] [box-shadow:0_-6px_20px_0_color-mix(in_srgb,var(--color-primary)_55%,transparent)]" />

          {/* برق سفید باریک وسط خط */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-text)_20%,var(--color-text)_80%,transparent)] opacity-70" />

          {/* جرقه‌های نور که روی خط به چپ و راست می‌دوند */}
          <div
            data-glint-r
            className="absolute bottom-0 h-[3px] w-40 rounded-full bg-[linear-gradient(90deg,transparent,var(--color-primary)_60%,var(--color-text))] opacity-0 [box-shadow:0_-4px_14px_0_color-mix(in_srgb,var(--color-primary)_60%,transparent)]"
            style={{ left: geo.jx }}
          />
          <div
            data-glint-l
            className="absolute bottom-0 h-[3px] w-40 rounded-full bg-[linear-gradient(270deg,transparent,var(--color-primary)_60%,var(--color-text))] opacity-0 [box-shadow:0_-4px_14px_0_color-mix(in_srgb,var(--color-primary)_60%,transparent)]"
            style={{ left: geo.jx - 160 }}
          />
        </div>
      </div>
    </section>
  );
}
