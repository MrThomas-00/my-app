"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * بخش نمونه کارها
 * هر پروژه یک باکس (عکس + توضیحات) است. باکس‌ها یکی در میان چپ و راست می‌نشینند
 * و یک خط نئونی از پشتشان رد می‌شود: از کنار باکس وارد می‌شود و از پایینش بیرون می‌آید.
 * فقط پروژه‌ی فعلی دیده می‌شود؛ پروژه‌ی قبلی و خطِ پشتش دوباره محو می‌شوند.
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

/* ---------- تنظیمات ---------- */
const HEAD = 0.55; // نوک خط کجای صفحه باشد (۰ بالا، ۱ پایین)
const VISIBLE = 300; // طول بخشی از خط که کامل دیده می‌شود (پیکسل)
const TAIL_FADE = 260; // طول محو شدن خط پشت سر (پیکسل)
const HEAD_FADE = 100; // طول محو شدن نوک خط (پیکسل)
const ENTRY = 64; // خط چند پیکسل پایین‌تر از لبه‌ی بالای باکس وارد می‌شود
const INSIDE = 28; // خط چقدر پشت باکس ادامه پیدا می‌کند
const KINDS = ["hook", "s", "swoop"]; // الگوهای خط بین پروژه‌ها (به ترتیب تکرار می‌شوند)

const WIN = VISIBLE + TAIL_FADE + HEAD_FADE;

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ---------- ساخت مسیر خط ---------- */

// از نقطه‌ی E (خروج از پایین باکس قبلی) تا P (ورود به کنار باکس بعدی)
function approach(E, P, sx, kind) {
  const adx = Math.abs(P.x - E.x);
  const dy = Math.max(P.y - E.y, 40);
  switch (kind) {
    case "hook": // اول کمی به عقب می‌پیچد، پایین می‌رود و با یک پیچ بالا می‌آید
      return ` C ${E.x - sx * 70} ${E.y + dy * 1.05}, ${P.x - sx * adx * 0.45} ${P.y + dy * 0.45}, ${P.x} ${P.y}`;
    case "swoop": // یک پیچ پهن و کم‌عمق
      return ` C ${E.x + sx * 30} ${E.y + dy * 1.3}, ${P.x - sx * adx * 0.6} ${P.y + dy * 0.8}, ${P.x} ${P.y}`;
    default: // موج ساده
      return ` C ${E.x} ${E.y + dy * 0.55}, ${P.x - sx * adx * 0.5} ${P.y}, ${P.x} ${P.y}`;
  }
}

function buildPath(rects, W, H) {
  if (!rects.length) return `M ${W / 2} 0 L ${W / 2} ${H}`;

  const info = rects.map((r, i) => {
    const left = i % 2 === 0; // باکس سمت چپ؟
    const sx = left ? -1 : 1; // جهت حرکت خط هنگام ورود به باکس
    const edgeX = left ? r.l + r.w : r.l; // لبه‌ی داخلی باکس
    return {
      sx,
      edgeX,
      entry: { x: edgeX + sx * INSIDE, y: r.t + ENTRY },
      exit: { x: r.l + r.w * (left ? 0.22 : 0.78), y: r.t + r.h },
    };
  });

  const start = { x: Math.min(W - 24, info[0].edgeX + 180), y: 0 };
  let d = `M ${start.x} ${start.y}`;
  d += approach(start, info[0].entry, info[0].sx, "s");

  info.forEach((c, i) => {
    // مسیر داخل باکس (پشت آن پنهان است)
    d += ` C ${c.entry.x + c.sx * 70} ${c.entry.y}, ${c.exit.x} ${c.exit.y - 90}, ${c.exit.x} ${c.exit.y}`;
    if (i < info.length - 1) {
      d += approach(c.exit, info[i + 1].entry, info[i + 1].sx, KINDS[i % KINDS.length]);
    }
  });

  const last = info[info.length - 1];
  const endX = Math.max(24, Math.min(W - 24, last.exit.x + (last.sx < 0 ? 120 : -120)));
  d += ` C ${last.exit.x} ${last.exit.y + 50}, ${endX} ${H - 70}, ${endX} ${H}`;
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
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[var(--color-primary)] opacity-0 shadow-[0_0_80px_-14px_var(--color-primary)]"
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
  const [geo, setGeo] = useState({ w: 0, h: 0, d: "", marks: [], key: "" });

  // ۱) اندازه‌گیری: مسیر خط را از روی جای واقعی باکس‌ها می‌سازد
  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const w = list.offsetWidth;
      const h = list.offsetHeight;
      const desktop = window.matchMedia("(min-width: 768px)").matches;

      const rects = Array.from(list.querySelectorAll("[data-box]")).map((b) => ({
        l: b.offsetLeft,
        t: b.offsetTop,
        w: b.offsetWidth,
        h: b.offsetHeight,
      }));

      const marks = rects.map((r) => Math.round(r.t + ENTRY));
      const d = desktop ? buildPath(rects, w, h) : `M 14 0 L 14 ${h}`;
      const key = `${w}|${h}|${d}|${marks.join(",")}`;

      setGeo((prev) => (prev.key === key ? prev : { w, h, d, marks, key }));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [projects]);

  // ۲) انیمیشن GSAP
  useIsoLayoutEffect(() => {
    if (!geo.h) return;
    const root = rootRef.current;
    const list = listRef.current;
    const boxes = Array.from(list.querySelectorAll("[data-box]"));
    const glows = list.querySelectorAll("[data-glow]");
    const tints = list.querySelectorAll("[data-tint]");
    const rect = root.querySelector("[data-mask-rect]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.querySelector("[data-line]")?.removeAttribute("mask");
      gsap.set(boxes, { autoAlpha: 1, scale: 1, filter: "none" });
      gsap.set(glows, { opacity: 0.55 });
      gsap.set(tints, { opacity: 0.14 });
      return;
    }

    const marks = geo.marks;
    const timelines = [];
    const state = boxes.map(() => "hidden");

    gsap.set(boxes, {
      autoAlpha: 0,
      scale: 0.8,
      filter: "blur(16px)",
      transformOrigin: "50% 50%",
    });
    gsap.set([...glows, ...tints], { opacity: 0 });

    // hidden: هنوز نرسیده | shown: پروژه‌ی فعلی | out: پروژه‌ای که رد شده
    const setState = (j, name) => {
      timelines[j]?.kill();
      const box = boxes[j];
      const glow = box.querySelector("[data-glow]");
      const tint = box.querySelector("[data-tint]");

      if (name === "shown") {
        timelines[j] = gsap
          .timeline()
          .to(box, {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
          })
          .to(glow, { opacity: 1, duration: 0.45, ease: "power2.out" }, "<0.25")
          .to(glow, { opacity: 0.55, duration: 0.9, ease: "power2.inOut" })
          .to(tint, { opacity: 0.14, duration: 0.9, ease: "power2.out" }, "<");
      } else {
        const to =
          name === "out"
            ? { scale: 0.9, filter: "blur(14px)" }
            : { scale: 0.8, filter: "blur(16px)" };
        timelines[j] = gsap
          .timeline()
          .to(box, { autoAlpha: 0, ...to, duration: 0.7, ease: "power2.inOut" })
          .to([glow, tint], { opacity: 0, duration: 0.5 }, "<");
      }
    };

    // پنجره‌ی خط: نوک خط با اسکرول جلو می‌رود و پشت سرش محو می‌شود
    let target = -WIN;
    let cur = target;
    rect.setAttribute("y", cur);
    const tick = () => {
      const diff = target - cur;
      if (Math.abs(diff) < 0.2) {
        if (cur !== target) {
          cur = target;
          rect.setAttribute("y", cur);
        }
        return;
      }
      cur += diff * (1 - Math.pow(1 - 0.14, gsap.ticker.deltaRatio()));
      rect.setAttribute("y", cur.toFixed(1));
    };
    gsap.ticker.add(tick);

    const update = () => {
      const p = window.innerHeight * HEAD - list.getBoundingClientRect().top;
      target = p - WIN;

      let active = -1;
      marks.forEach((m, i) => {
        if (p >= m) active = i;
      });

      boxes.forEach((_, j) => {
        const next = j === active ? "shown" : j < active ? "out" : "hidden";
        if (state[j] !== next) {
          state[j] = next;
          setState(j, next);
        }
      });
    };

    const st = ScrollTrigger.create({
      trigger: list,
      start: "top bottom",
      end: "bottom top",
      onUpdate: update,
      onRefresh: update,
    });

    update();
    cur = target;
    rect.setAttribute("y", cur);

    return () => {
      st.kill();
      gsap.ticker.remove(tick);
      timelines.forEach((t) => t && t.kill());
      gsap.killTweensOf(boxes);
    };
  }, [geo]);

  return (
    <section
      ref={rootRef}
      id="portfolio"
      dir="rtl"
      className="bg-[var(--color-bg)] px-4 py-24 text-[var(--color-text)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
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
                {/* محو شدن ابتدا و انتهای کل خط */}
                <linearGradient id="pf-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
                  <stop offset="0" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
                  <stop offset="0.04" style={{ stopColor: "var(--color-primary)", stopOpacity: 1 }} />
                  <stop offset="0.96" style={{ stopColor: "var(--color-primary)", stopOpacity: 1 }} />
                  <stop offset="1" style={{ stopColor: "var(--color-primary)", stopOpacity: 0 }} />
                </linearGradient>
                <linearGradient id="pf-fade-hot" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
                  <stop offset="0" style={{ stopColor: "var(--color-text)", stopOpacity: 0 }} />
                  <stop offset="0.04" style={{ stopColor: "var(--color-text)", stopOpacity: 0.7 }} />
                  <stop offset="0.96" style={{ stopColor: "var(--color-text)", stopOpacity: 0.7 }} />
                  <stop offset="1" style={{ stopColor: "var(--color-text)", stopOpacity: 0 }} />
                </linearGradient>

                {/* پنجره‌ی نمایش خط: دم و نوک هر دو نرم محو می‌شوند */}
                <linearGradient id="pf-window" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#000" />
                  <stop offset={TAIL_FADE / WIN} stopColor="#fff" />
                  <stop offset={(WIN - HEAD_FADE) / WIN} stopColor="#fff" />
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
                    y={-WIN}
                    width={geo.w + 120}
                    height={WIN}
                    fill="url(#pf-window)"
                  />
                </mask>
              </defs>

              {/* خط نئونی: هاله + هسته‌ی رنگی + برق باریک وسط */}
              <g
                data-line
                mask="url(#pf-mask)"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              const left = i % 2 === 0; // یکی در میان چپ و راست

              return (
                <li
                  key={project.id}
                  className="py-14 pl-11 md:py-20 md:pl-0"
                >
                  {/* یک باکس برای کل پروژه: عکس + توضیحات */}
                  <div
                    data-box
                    className={`relative w-full rounded-3xl opacity-0 md:w-[60%] ${
                      left ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <div className="overflow-hidden rounded-[inherit] border border-[var(--color-surface)] bg-[var(--color-secondary)]">
                      <div className="aspect-[16/10] bg-[var(--color-bg)]">
                        {image ? (
                          <img
                            src={image}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-end p-6">
                            <span className="text-8xl font-bold text-[var(--color-surface)]">
                              {title.slice(0, 1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-7 md:p-8">
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

                    <Light />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
