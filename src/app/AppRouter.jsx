"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/app/page";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import AboutPage from "@/app/pages/about/page";

export default function AppRouter() {
  if (typeof window === "undefined") return null;

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-xl text-[var(--color-text)]">404 - صفحه یافت نشد</div>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
