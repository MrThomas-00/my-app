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
  title = "نمونه کارها",
  subtitle = "بخشی از پروژه‌هایی که با دقت و علاقه ساخته‌ایم.",
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
            start: "top 60%",
            end: `bottom+=${geo.extra + FADE} 60%`,
            scrub: true,
          },
        }
      );

      // خط افقی پایین سکشن: وقتی خط عمودی رسید، از نقطه‌ی اتصال به چپ و راست پر می‌شود
      gsap.fromTo(
        "[data-junction]",
        { scaleX: 0, transformOrigin: `${geo.jx}px 50%` },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-junction]",
            start: () => `top ${window.innerHeight * 0.6 - FADE / 2}px`,
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        }
      );

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
              start: `center+=${FADE / 2} 60%`,
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
        <header className="max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
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
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] bg-[linear-gradient(90deg,transparent,var(--color-primary)_8%,var(--color-primary)_92%,transparent)] opacity-70 [box-shadow:0_-2px_14px_1px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
        style={{ transform: "scaleX(0)", transformOrigin: `${geo.jx}px 50%` }}
      />
    </section>
  );
}
