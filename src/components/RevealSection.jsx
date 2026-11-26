
"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SILVER =
  "bg-linear-to-b from-[#202833] via-[#596575] to-[#111820] bg-clip-text text-transparent [text-shadow:0_2px_12px_rgba(0,0,0,0.12)] [html[data-theme='dark']_&]:bg-linear-to-b [html[data-theme='dark']_&]:from-white [html[data-theme='dark']_&]:via-[#dfe3ea] [html[data-theme='dark']_&]:to-[#8f98a8] [html[data-theme='dark']_&]:[text-shadow:0_0_16px_rgba(255,255,255,0.16)]";

const LIME_GLOW =
  "text-[var(--color-primary)] [text-shadow:0_0_22px_color-mix(in_srgb,var(--color-primary)_28%,transparent)] [html[data-theme='dark']_&]:[text-shadow:0_0_30px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]";
export default function RevealSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      timeline
        .to(".shutter-top", {
          yPercent: -102,
          ease: "none",
        }, 0)
        .to(".shutter-bottom", {
          yPercent: 102,
          ease: "none",
        }, 0)
        .fromTo(
          ".reveal-copy",
          { opacity: 0, y: 45 },
          { opacity: 1, y: 0, ease: "none" },
          0.28
        )
        .fromTo(
          ".reveal-visual",
          { opacity: 0, y: 45 },
          { opacity: 1, y: 0, ease: "none" },
          0.38
        )
        .fromTo(
          ".reveal-image",
          { scale: 1.16 },
          { scale: 1, ease: "none" },
          0.25
        )
        .fromTo(
          ".reveal-line",
          { scaleX: 0, transformOrigin: "100% 50%" },
          { scaleX: 1, transformOrigin: "100% 50%", ease: "none" },
          0.45
        )
        .fromTo(
          ".reveal-outline",
          { opacity: 0, x: -25, y: 25 },
          { opacity: 1, x: 0, y: 0, ease: "none" },
          0.5
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="relative h-screen min-h-[620px] w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_25%_50%,var(--color-glow),transparent)]" />

        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgba(173,255,47,0.14)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center px-[7%] py-10">
        <div className="grid w-full max-w-[1120px] grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-[7%]">

          {/* Text */}
          <div className="reveal-copy opacity-0" >
            <div className="mb-6 flex items-center gap-4 justify-end-safe" dir="ltr">
              <span className="font-vazirmatn text-xs tracking-wide text-[var(--color-primary)]">
                نگاه ما به طراحی
              </span>

              <span className="h-px w-12 bg-linear-to-l from-[var(--color-primary)] to-transparent shadow-[0_0_10px_var(--color-primary)]" />
            </div>

            <h2 className="mb-5 font-lalezar text-2xl leading-[1.6] md:text-4xl lg:text-5xl">
              <span className={"block " + SILVER}>
                ما فقط وب‌سایت نمی‌سازیم
              </span>

              <span className={"block " + LIME_GLOW}>
                تجربه‌های خوب می‌سازیم
              </span>
            </h2>

            {/* Neon Line */}
            <span className="reveal-line mb-7 block h-px w-40 bg-linear-to-l from-[var(--color-primary)] via-[var(--color-primary)]/40 to-transparent shadow-[0_0_14px_var(--color-primary)]" />

            <p className="mb-7 max-w-[420px] font-vazirmatn text-[12px] leading-[2.3] text-[var(--color-muted)] md:text-[13px]">
              هر پروژه برامون فرصتیه تا ایده‌ها رو به تجربه‌هایی ساده،
              جذاب و کاربردی تبدیل کنیم. از طراحی تا جزئیات اجرا،
              همه‌چیز رو با دقت جلو می‌بریم.
            </p>

            {/* About Button */}
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 rounded-full border border-[var(--color-primary)] bg-[var(--color-bg)]/50 px-6 py-2.5 text-xs text-[var(--color-text)] shadow-[0_0_24px_var(--color-glow),inset_0_0_18px_var(--color-glow)] backdrop-blur transition-all duration-300 hover:gap-5 hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)]"
            >
              <span className="font-vazirmatn">
                بیشتر با ما آشنا شو
              </span>

              <svg
                viewBox="0 0 24 24"
                className="size-4 text-[var(--color-primary)] transition group-hover:text-[var(--color-on-primary)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 17 7 7M16 7H7v9" />
              </svg>
            </Link>
          </div>

          {/* Image */}
          <div className="reveal-visual w-full max-w-[460px] justify-self-start opacity-0">
            <div className="relative">
              <div className="reveal-outline absolute -left-3 top-3 h-full w-full rounded-2xl border border-[var(--color-primary)]/70 opacity-0 shadow-[0_0_30px_var(--color-glow)] md:-left-5 md:top-5" />

              <div className="relative z-[2] h-[190px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-secondary)] md:h-[360px]">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=85&w=1400&auto=format&fit=crop"
                  alt="محیط کار طراحی و توسعه وب"
                  className="reveal-image h-full w-full object-cover grayscale brightness-75"
                />

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-bg)_0%,transparent_55%)] opacity-80" />

                <div className="pointer-events-none absolute inset-0 bg-[var(--color-primary)] opacity-[0.07] mix-blend-overlay" />
              </div>
            </div>

            {/* Persian Image Caption */}
            <div
              dir="rtl"
              className="mt-9 flex items-center gap-3 pr-1 md:mt-10 md:gap-4"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />

              <span className="font-vazirmatn text-[10px] tracking-wide text-[var(--color-primary)] md:text-[11px]">
                طراحی / توسعه / تجربه کاربری
              </span>

              <span className="h-px flex-1 bg-linear-to-l from-[var(--color-primary)]/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Shutter */}
      <div className="shutter-top absolute left-0 top-0 z-[5] flex h-[50.5%] w-full items-end bg-[var(--color-bg)] bg-[radial-gradient(ellipse_50%_90%_at_50%_100%,var(--color-glow),transparent)] px-[7%] pb-6 shadow-[0_1px_40px_var(--color-glow)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-[var(--color-primary)] after:to-transparent after:opacity-70">
        <div className="flex w-full items-center justify-between font-michroma text-[10px] tracking-[0.3em] text-[var(--color-primary)]">
          <span></span>

          <span className="flex items-center gap-3">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />
            SIRYX
          </span>
        </div>
      </div>

      {/* Bottom Shutter */}
      <div className="shutter-bottom absolute bottom-0 left-0 z-[5] flex h-[50.5%] w-full items-start bg-[var(--color-bg)] bg-[radial-gradient(ellipse_50%_90%_at_50%_0%,var(--color-glow),transparent)] px-[7%] pt-6 shadow-[0_-1px_40px_var(--color-glow)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[var(--color-primary)] before:to-transparent before:opacity-70">
        <div className="flex w-full items-center justify-between font-michroma text-[10px] tracking-[0.3em] text-[var(--color-primary)]">
          <span>SIRYX / DIGITAL EXPERIENCE</span>

          <span className="inline-block animate-[spin_12s_linear_infinite] text-2xl">
            ✳
          </span>
        </div>
      </div>
    </section>
  );
}
