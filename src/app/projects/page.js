import Portfolio from "@/components/Portfolio";

export const metadata = {
  title: "کارهامون",
};

export default function ProjectsPage() {
  return (
    <main>
      <Portfolio
        title="کار"
        title2="هامون"
        subtitle="چندتا از کارهایی که ساختیم؛ از طراحی رابط تا توسعه تجربه‌های دیجیتال."
        snap={false}
      />
    </main>
  );
}
