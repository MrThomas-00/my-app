"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * بخش نمونه کارها با انیمیشن اسکرول (GSAP + ScrollTrigger)
 *
 * نصب:  npm i gsap
 *
 * استفاده:
 *   <Portfolio />                        // با داده‌های نمونه
 *   <Portfolio projects={myProjects} />  // با پروژه‌های خودتان
 *
 * هر پروژه:
 * { id, title, description, category, tags: [], image?: "/img.jpg", link?: "https://..." }
 */

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

const placeholderTones = [
  "bg-stone-200 dark:bg-stone-800",
  "bg-sky-100 dark:bg-sky-950",
  "bg-emerald-100 dark:bg-emerald-950",
  "bg-amber-100 dark:bg-amber-950",
  "bg-rose-100 dark:bg-rose-950",
];

export default function Portfolio({
  projects = defaultProjects,
  title = "نمونه کارها",
  subtitle = "بخشی از پروژه‌هایی که با دقت و علاقه ساخته‌ایم.",
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray("[data-item]");
      const progress = "[data-progress]";

      // اگر کاربر انیمیشن را کم‌کرده، همه چیز بدون حرکت نمایش داده می‌شود
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(progress, { scaleY: 1 });
        gsap.set("[data-content]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-dot-fill]", { scale: 1 });
        return;
      }

      // خط عمودی: همزمان با اسکرول از بالا به پایین کشیده می‌شود
      gsap.fromTo(
        progress,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-list]",
            start: "top 60%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );

      // هر پروژه وقتی نوک خط به آن می‌رسد ظاهر می‌شود
      // (با اسکرول به بالا، برعکس می‌شود)
      items.forEach((item) => {
        const content = item.querySelector("[data-content]");
        const dotFill = item.querySelector("[data-dot-fill]");

        gsap.set(content, { autoAlpha: 0, y: 48 });
        gsap.set(dotFill, { scale: 0 });

        gsap
          .timeline({
            paused: true,
            scrollTrigger: {
              trigger: item,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          })
          .to(dotFill, { scale: 1, duration: 0.3, ease: "back.out(2)" })
          .to(
            content,
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
            "<0.05"
          );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section
      ref={rootRef}
      id="portfolio"
      dir="rtl"
      className="bg-neutral-50 px-4 py-20 dark:bg-neutral-950 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <header className="max-w-xl pl-10">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 leading-8 text-neutral-600 dark:text-neutral-300">
            {subtitle}
          </p>
        </header>

        <div data-list className="relative mt-16">
          {/* مسیر کمرنگ خط (ثابت) */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[5px] top-0 w-[2px] bg-neutral-200 dark:bg-neutral-800"
          />
          {/* خطی که با اسکرول کشیده می‌شود */}
          <div
            data-progress
            aria-hidden="true"
            className="absolute bottom-0 left-[5px] top-0 w-[2px] origin-top bg-neutral-400 dark:bg-neutral-500"
          />

          <ul>
            {projects.map((project, i) => {
              const { title, description, category, tags = [], image, link } =
                project;
              const tone = placeholderTones[i % placeholderTones.length];

              return (
                <li
                  key={project.id}
                  data-item
                  className="relative py-12 pl-10 md:py-20 md:pl-16"
                >
                  {/* نقطه روی خط */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-14 flex h-3 w-3 items-center justify-center rounded-full border-2 border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950 md:top-[5.5rem]"
                  >
                    <span
                      data-dot-fill
                      className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white"
                    />
                  </span>

                  <article
                    data-content
                    className="grid items-center gap-8 md:grid-cols-2"
                  >
                    <div className="order-2 md:order-1">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {category}
                      </span>
                      <h3 className="mt-2 text-2xl font-bold leading-snug text-neutral-900 dark:text-neutral-50">
                        {title}
                      </h3>
                      <p className="mt-3 max-w-md leading-8 text-neutral-600 dark:text-neutral-300">
                        {description}
                      </p>

                      {tags.length > 0 && (
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
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
                          className="mt-6 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white transition-colors hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
                        >
                          مشاهده پروژه
                        </a>
                      )}
                    </div>

                    <div
                      className={`order-1 aspect-[4/3] overflow-hidden rounded-2xl md:order-2 ${tone}`}
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
                          <span className="text-6xl font-bold text-black/10 dark:text-white/10">
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
    </section>
  );
}
