"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * سکشن معرفی ما (دو باکس)
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
 *   <About />
 *   <About members={myMembers} />
 *
 * هر عضو:
 * { name, role, bio, tags: [], image?: "/sir.jpg", links?: [{ label, href }] }
 */

const defaultMembers = [
  {
    name: "SIR",
    role: "Developer",
    bio: "اینجا یه معرفی کوتاه از خودت بنویس: چه کاری می‌کنی، به چی علاقه داری و چه چیزی تو کارهات برات مهمه.",
    tags: ["UI/UX", "Figma", "Motion"],
    image: "",
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    name: "th0mas",
    role: "Designer",
    bio: "اینجا هم معرفی کوتاه رفیقت: تخصصش، سبک کارش و چیزی که باعث می‌شه با هم تیم خوبی باشید.",
    tags: ["React", "Next.js", "Tailwind"],
    image: "",
    links: [{ label: "GitHub", href: "#" }],
  },
];

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const tagStyles = [
  "border-[var(--color-primary)] text-[var(--color-primary)]",
  "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]",
  "border-[var(--color-primary)] bg-[var(--color-primary)] font-semibold text-[var(--color-bg)]",
];


const radii = [
  "rounded-[2.5rem_1rem_2.5rem_2.5rem] hover:rounded-[1rem_2.5rem_2.5rem_2.5rem]",
  "rounded-[1rem_2.5rem_2.5rem_2.5rem] hover:rounded-[2.5rem_1rem_2.5rem_2.5rem]",
];

export default function About({
  members = defaultMembers,
  title = ["درباره", "ما."],
  subtitle = "دو نفر، یک تیم و یک هدف: ساختن چیزهایی که هم خوب کار کنند و هم خوب به نظر برسند.",
}) {
  const rootRef = useRef(null);

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

      gsap.utils.toArray("[data-card]").forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, scale: 0.85, filter: "blur(14px)" },
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [members]);

  return (
    <section
      ref={rootRef}
      id="about"
      dir="rtl"
      className="relative overflow-hidden bg-[var(--color-bg)] px-4 py-24 text-[var(--color-text)] sm:px-6 lg:px-8"
    >
      {/* پس‌زمینه: شبکه‌ی محو + نور لیمویی گوشه‌ی بالا */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-surface)_1px,transparent_1px),linear-gradient(90deg,var(--color-surface)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
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
          <p className="mt-6 max-w-lg text-lg leading-9 opacity-70">
            {subtitle}
          </p>
          <p
            dir="ltr"
            className="mt-8 flex items-center justify-end gap-3 font-mono text-xs uppercase tracking-[0.2em] opacity-60 md:justify-start"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            About · {members.length} people · One team
          </p>
        </header>

        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-12">
          {members.map((m, i) => (
            <article
              key={m.name}
              data-card
              className={`group relative p-8 transition-[border-radius,box-shadow] duration-500 md:p-10
                bg-[var(--color-secondary)]
                shadow-[0_0_0_1px_var(--color-surface),0_0_0_8px_var(--color-bg),0_0_0_9px_var(--color-surface)]
                hover:shadow-[0_0_0_1px_var(--color-primary),0_0_0_8px_var(--color-bg),0_0_0_9px_var(--color-primary),0_0_70px_-12px_var(--color-primary)]
                ${radii[i % radii.length]}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* آواتار */}
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-[var(--color-bg)] ring-1 ring-[var(--color-primary)] transition-[border-radius] duration-500 group-hover:rounded-full">
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-[var(--color-primary)]">
                      {m.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                <span
                  dir="ltr"
                  className="font-mono text-xs tracking-[0.2em] opacity-50"
                >
                  {String(i + 1).padStart(2, "0")} / {String(members.length).padStart(2, "0")}
                </span>
              </div>

              <h3
                dir="ltr"
                className="mt-8 text-right text-5xl font-black leading-none sm:text-6xl"
              >
                {m.name}
                <span className="text-[var(--color-primary)] [text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]">
                  .
                </span>
              </h3>

              <p
                dir="ltr"
                className="mt-4 flex items-center justify-end gap-3 font-mono text-xs uppercase tracking-[0.2em] opacity-70"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                {m.role}
              </p>

              <p className="mt-6 leading-8 opacity-70">{m.bio}</p>

              {m.tags?.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {m.tags.map((tag, t) => (
                    <li
                      key={tag}
                      dir="ltr"
                      className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm ${
                        tagStyles[t % tagStyles.length]
                      }`}
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              {m.links?.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
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
          ))}
        </div>
      </div>
    </section>
  );
}
