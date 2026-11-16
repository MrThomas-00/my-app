import { Geist, Geist_Mono, Lalezar, Michroma,Vazirmatn } from "next/font/google";

import "./globals.css";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import SmoothScroll from "@/components/SmoothScroll";
const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn-var",
  weight: ["400", "500", "700"],
  subsets: ["arabic"],
});
const michroma = Michroma({
  variable: "--font-Michroma",
  weight: "400",
});

const lalezar = Lalezar({
  variable: "--font-Lalezar",
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "My App",
    template: "%s | My App",
  },
  description: "Personal portfolio and creative studio website",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lalezar.variable} ${michroma.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <Header />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
