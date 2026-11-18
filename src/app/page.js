import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Hero from "@/components/Hero"

export const metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div>
      <Hero />
      <Portfolio />
      <About />
    </div>
  );
}
