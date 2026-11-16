"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "خانه", href: "/" },
    { name: "درباره", href: "/about" },
    { name: "تماس", href: "/contact" },
  ];

  return (
    <nav
      className={[
        "sticky top-3 z-50 mx-3.5 my-2.5 rounded-lg border transition-all duration-300 ease-in-out",
        scrolled
          ? "border-white/20 bg-[var(--color-surface)]/80 shadow-lg shadow-black/20 backdrop-blur-md"
          : "border-white/35 bg-[var(--color-surface)]"
      ].join(" ")}
    >
      <ul className="flex items-center gap-4 p-4">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={[
                "transition-colors duration-200",
                scrolled ? "text-white/90 hover:text-white" : "text-white/80 hover:text-white"
              ].join(" ")}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}