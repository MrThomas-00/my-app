"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/app/page";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import AboutPage from "@/app/pages/about/page";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />


      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
