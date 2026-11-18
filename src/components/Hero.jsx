"use client";
export default function Hero() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center">
          <img
      src="./neon.png"
      className="absolute top-0 left-1/2 -translate-x-1/2 top-1/2 z-6 -translate-y-1/2 z-0 w-1/4 scale-180 opacity-55 blur-[2px] "
      ></img>
    </section>
  );
}