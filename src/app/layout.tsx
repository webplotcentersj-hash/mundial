import type { Metadata } from "next";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import SiteParallaxBackground from "@/components/SiteParallaxBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const plotStoreUi = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-plot-store-ui",
});

export const metadata: Metadata = {
  title: "PLOT MUNDIAL | Copa Mundial 2026",
  description: "Pronostica los resultados del Mundial 2026, suma puntos y gana premios.",
  icons: {
    icon: "/plot center mundial.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} ${plotStoreUi.variable}`}>
      <body className="relative antialiased min-h-screen flex flex-col font-sans">
        <SiteParallaxBackground />
        <Navbar />
        <main className="relative z-10 flex-grow pt-16">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
