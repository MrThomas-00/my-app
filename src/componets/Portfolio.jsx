"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * بخش نمونه کارها: خط نئونی با الگوهای مختلف که با اسکرول کشیده می‌شود (GSAP)
 *
 * نصب:  npm i gsap
 *
 * رنگ‌ها باید در globals.css تعریف شده باشند:
 *   :root {
 *     --color-primary: #ADFF2F;
 *     --color-bg: #161A21;
 *     --color-secondary: #1F242D;
 *     --color-surface: #2A313C;
 *     --color-text: #F2F5F1;
 *   }
 *
 * استفاده:
 *   <Portfolio />
 *   <Portfolio projects={myProjects} />
 *
 * هر پروژه:
 * { id, title, description, category, tags: [], image?: "/img.jpg", link?: "https://..." }
 */

const AMPLITUDE = 64; // میزان رفت‌وبرگشت خط در دسکتاپ (پیکسل)
const FADE = 120; // طول محو شدن نوک خط (پیکسل)

// ترتیب الگوهای خط بین پروژه‌ها؛ هر کدام را می‌توانی جابه‌جا یا حذف کنی
const PATTERN_ORDER = ["grand", "elbow", "wave", "late", "early", "s"];

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ---------- ساخت مسیر خط ---------- */

const lerp = (a, b, t) => a + (b - a) * t;

// منحنی نرم با مماس عمودی در دو سر (پیوستگی کامل بین الگوها)
const sCurve = (p, q) => {
  const my = (p.y + q.y) / 2;
  return ` C ${p.x} ${my}, ${q.x} ${my}, ${q.x} ${q.y}`;
};
const chain = (pts) =>
  pts.slice(1).reduce((d, q, i) => d + sCurve(pts[i], q), "");

const PATTERNS = {
  // موج ساده
  s: (p, q) => chain([p, q]),
  // اول سریع می‌پیچد، بعد صاف پایین می‌آید
  early: (p, q) => chain([p, { x: q.x, y: lerp(p.y, q.y, 0.3) }, q]),
  // اول صاف پایین می‌آید، آخر می‌پیچد
  late: (p, q) => chain([p, { x: p.x, y: lerp(p.y, q.y, 0.7) }, q]),
  // مار‌پیچ: سه بار از وسط رد می‌شود
  wave: (p, q) =>
    chain([
      p,
      { x: q.x, y: lerp(p.y, q.y, 0.3) },
      { x: p.x, y: lerp(p.y, q.y, 0.64) },
      q,
    ]),
  // اول کمی عقب می‌رود، بعد با یک پیچ بزرگ رد می‌شود
  grand: (p, q, A) => {
    const s = Math.sign(q.x - p.x) || 1;
    return chain([
      p,
      { x: p.x - s * A * 0.25, y: lerp(p.y, q.y, 0.28) },
      { x: q.x + s * A * 0.25, y: lerp(p.y, q.y, 0.72) },
      q,
    ]);
  },
  // زانویی با گوشه‌های گرد (مدار الکترونیکی)
  elbow: (p, q) => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const s = Math.sign(dx) || 1;
    const r = Math.max(0, Math.min(32, Math.abs(dx) / 2, dy / 4));
    const ym = p.y + dy / 2;
    return (
      ` L ${p.x} ${ym - r} Q ${p.x} ${ym} ${p.x + s * r} ${ym}` +
      ` L ${q.x - s * r} ${ym} Q ${q.x} ${ym} ${q.x} ${ym + r}` +
      ` L ${q.x} ${q.y}`
    );
  },
};

function buildPath(pts, A) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const isEdge = i === 1 || i === pts.length - 1; // ابتدا و انتهای خط ساده است
    const name = isEdge ? "s" : PATTERN_ORDER[(i - 2) % PATTERN_ORDER.length];
    d += PATTERNS[name](pts[i - 1], pts[i], A);
  }
  return d;
}

/* ---------- داده‌ی نمونه ---------- */

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
];

/* نوری که هنگام ظاهر شدن روی باکس می‌افتد */
function Light() {
  return (
    <>
      <span
        data-tint
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,var(--color-primary),transparent_65%)] opacity-0"
      />
      <span
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[var(--color-primary)] opacity-0 shadow-[0_0_70px_-14px_var(--color-primary)]"
      />
    </>
  );
}

export default function Portfolio({
  projects = defaultProjects,
  title = "نمونه کارها",
  subtitle = "بخشی از پروژه‌هایی که با دقت و علاقه ساخته‌ایم.",
}) {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [geo, setGeo] = useState({ w: 0, h: 0, d: "" });

  // ۱) اندازه‌گیری: مسیر خط را از روی جای واقعی پروژه‌ها می‌سازد
  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const w = list.offsetWidth;
      const h = list.offsetHeight;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      let d;

      if (!desktop) {
        d = `M 14 0 L 14 ${h}`;
      } else {
        const cx = w / 2;
        const nodes = Array.from(list.querySelectorAll("[data-item]")).map(
          (li, i) => ({
            x: cx + (i % 2 === 0 ? -AMPLITUDE : AMPLITUDE),
            y: li.offsetTop + li.offsetHeight / 2,
          })
        );
        d = buildPath([{ x: cx, y: 0 }, ...nodes, { x: cx, y: h }], AMPLITUDE);
      }

      setGeo((prev) =>
        prev.d === d && prev.w === w && prev.h === h ? prev : { w, h, d }
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [projects]);

  // ۲) انیمیشن GSAP
  useIsoLayoutEffect(() => {
    if (!geo.h) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray("[data-item]");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-mask-rect]", { attr: { y: 0 } });
        gsap.set("[data-box]", { autoAlpha: 1, scale: 1, filter: "none" });
        gsap.set("[data-glow]", { opacity: 0.55 });
        gsap.set("[data-tint]", { opacity: 0.14 });
        return;
      }

      // خط: با اسکرول ظاهر می‌شود و نوکش نرم محو است
      gsap.fromTo(
        "[data-mask-rect]",
        { attr: { y: -(geo.h + FADE) } },
        {
          attr: { y: 0 },
          ease: "none",
          scrollTrigger: {
            trigger: "[data-list]",
            start: "top 60%",
            end: `bottom+=${FADE} 60%`,
            scrub: true,
          },
        }
      );

      // هر پروژه وقتی نوک خط به آن رسید: از کوچک و محو، بزرگ و واضح می‌شود
      // و نوری رنگی روی باکس‌ها می‌افتد
      items.forEach((item) => {
        const boxes = item.querySelectorAll("[data-box]");
        const glows = item.querySelectorAll("[data-glow]");
        const tints = item.querySelectorAll("[data-tint]");

        gsap.set(boxes, {
          autoAlpha: 0,
          scale: 0.8,
          filter: "blur(16px)",
          transformOrigin: "50% 50%",
        });
        gsap.set([...glows, ...tints], { opacity: 0 });

        gsap
          .timeline({
            paused: true,
            scrollTrigger: {
              trigger: item,
              start: `center+=${FADE / 2} 60%`,
              toggleActions: "play none none reverse",
            },
          })
          .to(boxes, {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            stagger: 0.12,
          })
          .to(
            glows,
            { opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.12 },
            "<0.25"
          )
          .to(glows, { opacity: 0.55, duration: 0.9, ease: "power2.inOut" })
          .to(tints, { opacity: 0.14, duration: 0.9, ease: "power2.out" }, "<");
      });
    }, rootRef);

    return () => ctx.revert();
  }, [geo]);

  return (
    <section
      ref={rootRef}
      id="portfolio"
      dir="rtl"
      className="bg-[var(--color-bg)] px-4 py-24 text-[var(--color-text)] sm:px-6 lg:px-8"
    >
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
              height={geo.h}
              viewBox={`0 0 ${geo.w} ${geo.h}`}
              fill="none"
            >
              <defs>
                {/* محو شدن ابتدا و انتهای خط */}
                <linearGradient
                  id="pf-fade"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={geo.h}
                >
                  <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
                  <stop offset="0.08" style={{ stopColor: "var(--color-primary)", stopOpacity: 1 }} />
                  <stop offset="0.92" style={{ stopColor: "var(--color-primary)", stopOpacity: 1 }} />
                  <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
                </linearGradient>
                <linearGradient
                  id="pf-fade-hot"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={geo.h}
                >
                  <stop offset="0" style={{ stopColor: "var(--color-text)", stopOpacity: 0 }} />
                  <stop offset="0.08" style={{ stopColor: "var(--color-text)", stopOpacity: 0.7 }} />
                  <stop offset="0.92" style={{ stopColor: "var(--color-text)", stopOpacity: 0.7 }} />
                  <stop offset="1" style={{ stopColor: "var(--color-text)", stopOpacity: 0 }} />
                </linearGradient>

                {/* ماسک ظاهر شدن خط با اسکرول (لبه‌ی پایینی نرم) */}
                <linearGradient id="pf-reveal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset={geo.h / (geo.h + FADE)} stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask
                  id="pf-mask"
                  maskUnits="userSpaceOnUse"
                  x="-60"
                  y="0"
                  width={geo.w + 120}
                  height={geo.h}
                >
                  <rect
                    data-mask-rect
                    x="-60"
                    y={-(geo.h + FADE)}
                    width={geo.w + 120}
                    height={geo.h + FADE}
                    fill="url(#pf-reveal)"
                  />
                </mask>
              </defs>

              {/* خط نئونی: هاله + هسته‌ی رنگی + برق باریک وسط */}
              <g mask="url(#pf-mask)" strokeLinecap="round" strokeLinejoin="round">
                <path d={geo.d} stroke="url(#pf-fade)" strokeWidth="14" opacity="0.08" />
                <path d={geo.d} stroke="url(#pf-fade)" strokeWidth="6" opacity="0.2" />
                <path d={geo.d} stroke="url(#pf-fade)" strokeWidth="2" />
                <path d={geo.d} stroke="url(#pf-fade-hot)" strokeWidth="0.8" />
              </g>
            </svg>
          )}

          <ul className="relative z-10">
            {projects.map((project, i) => {
              const { title, description, category, tags = [], image, link } =
                project;
              const imageOnLeft = i % 2 === 0; // یکی در میان چپ و راست

              return (
                <li
                  key={project.id}
                  data-item
                  className="py-14 pl-11 md:py-24 md:pl-0"
                >
                  <article className="grid items-center gap-6 md:grid-cols-2 md:gap-x-48">
                    {/* باکس متن */}
                    <div
                      data-box
                      className={`relative order-2 rounded-2xl border border-[var(--color-surface)] bg-[var(--color-secondary)] p-7 opacity-0 md:p-8 ${
                        imageOnLeft ? "md:order-1" : "md:order-2"
                      }`}
                    >
                      <Light />
                      <div className="relative z-10">
                        <span className="text-sm opacity-60">{category}</span>
                        <h3 className="mt-2 text-2xl font-bold leading-snug">
                          {title}
                        </h3>
                        <p className="mt-3 leading-8 opacity-70">
                          {description}
                        </p>

                        {tags.length > 0 && (
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <li
                                key={tag}
                                className="rounded-full border border-[var(--color-surface)] bg-[var(--color-bg)] px-3 py-1 text-xs"
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
                            className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-secondary)]"
                          >
                            مشاهده پروژه
                          </a>
                        )}
                      </div>
                    </div>

                    {/* باکس تصویر */}
                    <div
                      data-box
                      className={`relative order-1 aspect-[4/3] rounded-2xl border border-[var(--color-surface)] bg-[var(--color-secondary)] opacity-0 ${
                        imageOnLeft ? "md:order-2" : "md:order-1"
                      }`}
                    >
                      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
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
                      <Light />
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
