export const metadata = {
  title: "وبلاگ",
};

export default function BlogPage() {
  return (
    <main
      dir="rtl"
      className="flex min-h-[70vh] items-center justify-center px-6 py-28 text-center text-[var(--color-text)]"
    >
      <section className="mx-auto max-w-2xl">
        <span className="font-michroma text-xs tracking-[0.3em] text-[var(--color-primary)]">
          SIRYX / NOTES
        </span>
        <h1 className="mt-6 font-lalezar text-4xl sm:text-6xl">
          به‌زودی می‌نویسیم
        </h1>
        <p className="mt-6 text-sm leading-8 text-[var(--color-muted)] sm:text-base">
          اینجا تجربه‌ها، نکته‌ها و چیزهایی رو که موقع طراحی و توسعه یاد می‌گیریم
          باهاتون به اشتراک می‌ذاریم.
        </p>
      </section>
    </main>
  );
}
