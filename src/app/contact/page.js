export const metadata = {
  title: "تماس با ما",
};

export default function ContactPage() {
  return (
    <main
      dir="rtl"
      className="flex min-h-[70vh] items-center justify-center px-6 py-28 text-center text-[var(--color-text)]"
    >
      <section className="mx-auto max-w-2xl">
        <span className="font-michroma text-xs tracking-[0.3em] text-[var(--color-primary)]">
          SIRYX / CONTACT
        </span>
        <h1 className="mt-6 font-lalezar text-4xl sm:text-6xl">
          باهامون حرف بزن
        </h1>
        <p className="mt-6 text-sm leading-8 text-[var(--color-muted)] sm:text-base">
          برای شروع یه پروژه، پرسیدن یه سؤال یا مطرح‌کردن یه ایده، باهامون در
          ارتباط باش. راه‌های ارتباطی رو به‌زودی همین‌جا می‌ذاریم.
        </p>
      </section>
    </main>
  );
}
