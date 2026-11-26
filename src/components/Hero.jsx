
"use client";

import Link from 'next/link'
import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";

const LINES = [
  {
    text: "ما فقط نمی‌سازیم",
    size: "text-[clamp(2rem,6.2vw,5.5rem)] leading-[1.2]",
  },
  {
    text: "اثر می‌ذاریم",
    size: "text-[clamp(1.55rem,4.3vw,3.8rem)] leading-[1.3]",
  },
];

const ACCENT = "اثر";
const SUBTITLE = "از یه ایده شروع می‌کنیم و با طراحی و توسعه، بهش شکل می‌دیم.";

const OVERLAY = [

  "linear-gradient(to bottom, rgba(9,11,16,0.75) 0%, transparent 20%) ",
  "radial-gradient(ellipse 58% 48% at 50% 48%, rgba(9,11,16,0.82) 0%, rgba(9,11,16,0.5) 55%, transparent 100%)",
].join(",");

const LEAVES = [
  { x: "6%", y: "28%", w: 56, r: -22 },
  { x: "17%", y: "39%", w: 30, r: 28 },
  { x: "22%", y: "60%", w: 26, r: -38 },
  { x: "13%", y: "72%", w: 24, r: 14 },
  { x: "80%", y: "48%", w: 42, r: 22 },
  { x: "73%", y: "66%", w: 28, r: -16 },
  { x: "86%", y: "70%", w: 52, r: 32 },
];

const SILVER =
  "bg-linear-to-b from-white via-[#dfe3ea] to-[#8f98a8] bg-clip-text text-transparent [html[data-theme='light']_&]:bg-linear-to-b [html[data-theme='light']_&]:from-[#20251B] [html[data-theme='light']_&]:via-[#46503B] [html[data-theme='light']_&]:to-[#78816D]";

const LIME =
  "text-[var(--color-primary)] [text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] [html[data-theme='light']_&]:[text-shadow:none]";

export default function Hero() {
  const root = useRef(null);

  useEffect(() => {
    let ctx;
    let cancelled = false;

    const play = () => {
      if (cancelled || ctx || !root.current) return;

      ctx = gsap.context(() => {
        gsap.utils.toArray(".hero-leaf").forEach((el) => {
          gsap.set(el, { rotation: Number(el.dataset.r) });
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(
            ".hero-word, .hero-fade, .hero-line, .hero-ring, .hero-leaf",
            { autoAlpha: 1 }
          );
          return;
        }

        const stage = root.current.querySelector(".hero-stage");

        const dist =
          stage.getBoundingClientRect().top +
          stage.offsetHeight / 2 -
          root.current.getBoundingClientRect().top;

        const k = window.innerWidth < 768 ? 0.6 : 1;

        gsap.set(".hero-ripple, .hero-flash, .hero-splash", {
          xPercent: -50,
          yPercent: -50,
        });

        gsap.set(".hero-drop", {
          xPercent: -50,
          yPercent: -100,
          y: -dist,
          scaleX: 0.8,
          scaleY: 1.2,
          transformOrigin: "50% 100%",
        });

        gsap.utils.toArray(".hero-leaf").forEach((el) => {
          const r = Number(el.dataset.r);

          gsap.to(el, {
            x: gsap.utils.random(-14, 14),
            y: gsap.utils.random(-26, 26),
            rotation: r + gsap.utils.random(-28, 28),
            duration: gsap.utils.random(3.2, 6),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        gsap.fromTo(
          ".hero-wheel",
          { y: 0, autoAlpha: 1 },
          {
            y: 5,
            autoAlpha: 0,
            duration: 1.1,
            ease: "power1.in",
            repeat: -1,
            repeatDelay: 0.3,
          }
        );

        gsap.fromTo(
          ".hero-brand-text",
          { backgroundPosition: "100% 0" },
          {
            backgroundPosition: "0% 0",
            duration: 2.6,
            ease: "power1.inOut",
            repeat: -1,
            repeatDelay: 1.2,
          }
        );

        gsap.fromTo(
          ".hero-brand-glow",
          { autoAlpha: 0.15 },
          {
            autoAlpha: 0.45,
            duration: 1.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }
        );

        const FALL = 1;
        const tl = gsap.timeline({ delay: 0.25 });

        tl.to(".hero-drop", { autoAlpha: 1, duration: 0.1 }, 0)
          .to(
            ".hero-drop",
            {
              y: 0,
              scaleX: 0.7,
              scaleY: 1.8,
              duration: FALL,
              ease: "power2.in",
            },
            0
          )
          .addLabel("impact", FALL);

        tl.to(
          ".hero-drop",
          {
            scaleX: 2.8,
            scaleY: 0.06,
            autoAlpha: 0,
            duration: 0.16,
            ease: "power2.out",
          },
          "impact"
        );

        tl.fromTo(
          ".hero-flash",
          { scale: 0.3, autoAlpha: 0.5 },
          {
            scale: 1.2,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power2.out",
            immediateRender: false,
          },
          "impact"
        );

        gsap.utils.toArray(".hero-ripple").forEach((ring, i) => {
          const at = `impact+=${i * 0.16}`;

          tl.fromTo(
            ring,
            { scale: 0.04 },
            {
              scale: 1 - i * 0.18,
              duration: 1.8,
              ease: "expo.out",
              immediateRender: false,
            },
            at
          ).fromTo(
            ring,
            { autoAlpha: 0.9 - i * 0.22 },
            {
              autoAlpha: 0,
              duration: 1.6,
              ease: "power2.in",
              immediateRender: false,
            },
            at
          );
        });

        gsap.utils.toArray(".hero-splash").forEach((el, i) => {
          const dx = ((i - 3.5) * 26 + gsap.utils.random(-8, 8)) * k;
          const up =
            (95 - Math.abs(i - 3.5) * 12 + gsap.utils.random(0, 25)) * k;

          tl.fromTo(
            el,
            {
              x: 0,
              y: 0,
              scale: gsap.utils.random(0.7, 1.3),
              autoAlpha: 1,
            },
            {
              x: dx * 0.55,
              y: -up,
              duration: 0.38,
              ease: "power2.out",
              immediateRender: false,
            },
            "impact+=0.04"
          ).to(
            el,
            {
              x: dx,
              y: 6 * k,
              autoAlpha: 0,
              duration: 0.55,
              ease: "power2.in",
            },
            "impact+=0.42"
          );
        });

        tl.fromTo(
          ".hero-word",
          { y: 30, autoAlpha: 0, filter: "blur(12px)" },
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
            stagger: { each: 0.08, from: "center" },
            clearProps: "filter",
          },
          "impact+=0.12"
        )
          .fromTo(
            ".hero-line",
            { scaleX: 0, autoAlpha: 0 },
            {
              scaleX: 1,
              autoAlpha: 1,
              duration: 0.9,
              ease: "power3.out",
            },
            "impact+=0.85"
          )
          .fromTo(
            ".hero-ring",
            { autoAlpha: 0, scale: 0.92 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 1.6,
              ease: "power2.out",
            },
            "impact+=0.3"
          )
          .fromTo(
            ".hero-fade",
            { y: 16, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.15,
            },
            "impact+=1"
          )
          .fromTo(
            ".hero-leaf",
            { autoAlpha: 0, scale: 0.5 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 1.1,
              ease: "back.out(1.6)",
              stagger: 0.12,
            },
            "impact+=1.1"
          );
      }, root);
    };

    if (window.__siryxLoaded) play();
    else window.addEventListener("siryx:loaded", play, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("siryx:loaded", play);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      dir="rtl"
      className="relative flex h-screen min-h-[640px] w-full select-none items-center justify-center overflow-x-clip bg-[var(--color-bg)] pb-20 pt-24 text-[var(--color-text)]"
    >

      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="hero-leaf-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ADFF2F" />
            <stop offset="1" stopColor="#3f8f0e" />
          </linearGradient>
        </defs>
      </svg>

  
      <img
        src="/neon.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute z-1 max-w-none opacity-55 mask-b-from-2
                   left-0 top-[10%] w-[200vw]
                   md:left-1/2 md:top-2/12 md:w-1/4 md:-translate-x-1/2 md:scale-380
                   [html[data-theme='light']_&]:opacity-15 [html[data-theme='light']_&]:saturate-50"
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] [html[data-theme='light']_&]:opacity-0"
        style={{ backgroundImage: OVERLAY }}
      />

      <span className="
        hero-ring pointer-events-none absolute inset-0 z-[1]
        m-auto hidden h-[80%] w-[min(78vw,1250px)]
        rounded-[50%] border border-[var(--color-primary)]/10
        opacity-0 [html[data-theme='light']_&]:border-[var(--color-primary)]/15 md:block
      " />

      {LEAVES.map((l, i) => (
        <svg
          key={i}
          data-r={l.r}
          viewBox="0 0 64 32"
          aria-hidden="true"
          className={
            "hero-leaf pointer-events-none absolute z-[2] opacity-0 drop-shadow-[0_0_10px_rgba(173,255,47,0.45)] [html[data-theme='light']_&]:drop-shadow-none " +
            (i > 0 ? "hidden md:block" : "")
          }
          style={{ left: l.x, top: l.y, width: l.w }}
        >
          <path
            d="M2 16C14 2 40 0 62 14C42 30 16 32 2 16Z"
            fill="url(#hero-leaf-grad)"
          />
          <path
            d="M4 16C22 15 42 15 60 14"
            stroke="rgba(9,11,16,0.4)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      ))}

      <div
        className="
          relative z-10 mx-auto flex w-full max-w-[1100px]
          flex-col items-center text-center
          gap-4 px-2
          sm:gap-5 sm:px-4
          md:gap-6
        "
      >
        <div
          dir="ltr"
          className="
            hero-fade flex items-center gap-3 opacity-0
            sm:gap-4 md:gap-7
          "
        >
          <span className="
            h-px w-8 bg-linear-to-r from-transparent
            to-[var(--color-primary)]
            shadow-[0_0_10px_var(--color-primary)]
            [html[data-theme='light']_&]:shadow-none
            sm:w-12 md:w-56
          " />

          <span className="relative">
            <span className="
              hero-brand-glow pointer-events-none absolute
              -inset-x-5 -inset-y-2 rounded-full
              bg-[var(--color-primary)] opacity-20 blur-2xl
              [html[data-theme='light']_&]:hidden
            " />

            <span className="
              hero-brand-text relative block
              bg-[linear-gradient(110deg,var(--color-primary)_0%,var(--color-primary)_40%,#f4ffd6_50%,var(--color-primary)_60%,var(--color-primary)_100%)]
              bg-[length:250%_100%] bg-clip-text
              pl-[0.4em] font-michroma
              text-lg tracking-[0.35em]
              text-transparent drop-shadow-[0_0_14px_rgba(173,255,47,0.55)]
              [html[data-theme='light']_&]:drop-shadow-none
              sm:text-xl md:text-4xl
            ">
              SIRYX
            </span>
          </span>

          <span className="
            h-px w-8 bg-linear-to-l from-transparent
            to-[var(--color-primary)]
            shadow-[0_0_10px_var(--color-primary)]
            [html[data-theme='light']_&]:shadow-none
            sm:w-12 md:w-56
          " />
        </div>

        <div className="hero-stage relative w-full">
          <svg
            viewBox="0 0 24 30"
            className="
              hero-drop pointer-events-none absolute
              left-1/2 top-1/2 h-8 w-6
              text-[var(--color-primary)] opacity-0
              drop-shadow-[0_0_10px_var(--color-primary)]
            "
          >
            <path
              d="M12 1C12 1 3 13 3 20a9 9 0 0 0 18 0C21 13 12 1 12 1Z"
              fill="currentColor"
            />
          </svg>

          <span className="
            hero-flash pointer-events-none absolute
            left-1/2 top-1/2 h-24
            w-[min(30rem,85vw)] rounded-[50%]
            bg-[radial-gradient(closest-side,var(--color-primary),transparent)]
            opacity-0
          " />

          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="
                hero-ripple pointer-events-none absolute
                left-1/2 top-1/2 aspect-[5/1]
                w-[min(34rem,92vw)] rounded-[50%]
                border border-[var(--color-primary)] opacity-0
                shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]
              "
            />
          ))}

          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="
                hero-splash pointer-events-none absolute
                left-1/2 top-1/2 size-1.5 rounded-full
                bg-[var(--color-primary)] opacity-0
                shadow-[0_0_8px_var(--color-primary)]
              "
            />
          ))}

          <h1
            className="
              mx-auto w-full max-w-[1000px]
              font-[family-name:Lalezar]
              text-balance text-center
            "
          >
            {LINES.map((line, li) => (
              <span
                key={li}
                className={"block " + line.size}
              >
                {line.text.split(" ").map((word, i) => (
                  <Fragment key={i}>
                    <span
                      className={
                        "hero-word inline-block opacity-0 " +
                        (word === ACCENT ? LIME : SILVER)
                      }
                    >
                      {word}
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>
        </div>

        <span className="
          hero-line relative block h-px
          w-[min(18rem,65vw)]
          bg-linear-to-r from-transparent
          via-[var(--color-primary)] to-transparent
          opacity-0
          after:absolute after:inset-x-[20%]
          after:-top-[2px] after:h-[5px]
          after:bg-[var(--color-primary)]
          after:opacity-60 after:blur-[6px]
          after:content-['']
          sm:w-[min(22rem,75vw)]
          md:w-[min(26rem,80vw)]
        " />

        <p className="
          hero-fade max-w-[min(92vw,32rem)]
          text-sm leading-7 text-white/85
          [html[data-theme='light']_&]:text-[var(--color-muted)]
          opacity-0
          sm:text-base sm:leading-8
          md:text-lg
         
        ">
          {SUBTITLE}
        </p>

        <div className="
          hero-fade flex flex-col-reverse items-center
          gap-3 opacity-0
          sm:flex-row sm:gap-6
          md:gap-8
        ">
          <Link
            href="/about"
            className="
              group flex items-center gap-2
              text-xs text-[var(--color-text)]
              transition-colors hover:text-[var(--color-primary)]
              sm:gap-3 sm:text-sm
            "
          >
            <span>آشنایی با ما</span>

            <span className="
              grid size-10 place-items-center
              rounded-full border border-[var(--color-border)]
              bg-[var(--color-secondary)]/60
              transition
              group-hover:border-[var(--color-primary)]
              group-hover:shadow-[0_0_20px_var(--color-glow)]
              sm:size-12
            ">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 sm:size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </span>
          </Link>

          <Link
            href="/projects"
            className="
              group flex items-center gap-2
              rounded-full border border-[var(--color-primary)]
              bg-[var(--color-bg)]/50
              px-5 py-3 text-xs
              text-[var(--color-text)]
              shadow-[0_0_24px_var(--color-glow),inset_0_0_18px_var(--color-glow)]
              backdrop-blur transition
              hover:bg-[var(--color-primary)]
              hover:text-[var(--color-on-primary)]
              sm:gap-3 sm:px-7 sm:py-3.5 sm:text-sm
              md:px-8 md:py-4
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="
                size-4 text-[var(--color-primary)]
                transition group-hover:translate-x-1
                group-hover:text-[var(--color-on-primary)]
                sm:size-5
              "
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>

            <span>دیدن کارهامون</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
