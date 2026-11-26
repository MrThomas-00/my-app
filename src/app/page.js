import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Hero from "@/components/Hero";
import RevealSection from "@/components/RevealSection";

export const metadata = {
  title: "خانه",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <RevealSection />
      <Portfolio />
      <About />
    </main>
  );
}
