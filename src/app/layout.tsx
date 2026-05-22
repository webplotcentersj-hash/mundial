import type { Metadata } from "next";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { SiteBackground } from "@/components/SiteBackground";
import { rootMetadata } from "@/lib/seo/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const plotStoreUi = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-plot-store-ui",
});

export const metadata: Metadata = rootMetadata;

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
