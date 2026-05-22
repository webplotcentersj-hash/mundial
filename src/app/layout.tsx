import type { Metadata } from "next";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { SiteBackground } from "@/components/SiteBackground";

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
    icon: [{ url: "/FAVICON-03-03.png", type: "image/png" }],
    apple: "/FAVICON-03-03.png",
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
        <SiteBackground />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
