import Portfolio from "@/components/Portfolio";
import About from "@/components/About";


export const metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div>
      <Portfolio />
      <About />
    </div>
  );
}
