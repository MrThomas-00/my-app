import localFont from "next/font/local";
import { Geist, Geist_Mono, Lalezar, Michroma, Vazirmatn } from "next/font/google";
import Loader from "@/components/Loader"
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

const pioneer = localFont({
  src: "../../public/fonts/Pioneer.ttf",
  variable: "--font-pioneer",
  weight: "400",
  display: "swap",
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
      lang="fa"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${lalezar.variable} ${michroma.variable} ${vazirmatn.variable} ${pioneer.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
        <Loader />
          <Header />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
