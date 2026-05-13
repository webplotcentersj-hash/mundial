import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Solo en local: evita que Turbopack tome un package-lock de una carpeta padre.
  // En Vercel (VERCEL=1) no hace falta y deja el root por defecto del builder.
  ...(process.env.VERCEL !== "1"
    ? { turbopack: { root: projectRoot } }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
};

export default nextConfig;
