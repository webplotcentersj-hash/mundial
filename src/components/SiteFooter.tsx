import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, FileText, Shield, MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

const PLOT_CENTER_WEB = "https://plotcenter.com.ar/"
const INSTAGRAM = "https://www.instagram.com/plotcentersj/?hl=es"
const EMAIL = "contacto@plotcenter.com.ar"
const PHONE_DISPLAY = "2646212163"
const PHONE_HREF = "tel:+542646212163"
const ADDRESS = "9 de Julio 622 (OESTE)"

function SocialButton({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "group flex h-12 w-12 items-center justify-center rounded-full",
        "border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
        "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]",
        "text-white/70 transition-all duration-300",
        "hover:border-primary/50 hover:text-primary hover:shadow-[0_0_24px_-4px_rgba(235,103,27,0.45)] hover:-translate-y-0.5"
      )}
    >
      {children}
    </a>
  )
}

export default function SiteFooter() {
  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-white/[0.08] bg-[#030712] text-white/80">
      {/* Línea superior tipo Plot Center */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-amber-500/90 opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-[min(90%,56rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(235,103,27,0.18),transparent_65%)]"
        aria-hidden
      />
      {/* Grilla sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)`,
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to_bottom,black,transparent)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div
          className={cn(
            "rounded-2xl border border-white/10 p-6 sm:p-8 lg:p-10",
            "bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent",
            "shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)]",
            "backdrop-blur-md"
          )}
        >
          <div className="text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Image
                src="/plot%20center%20mundial.png"
                alt="Plot Center · Plot Mundial"
                width={200}
                height={56}
                className="h-12 w-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              />
            </Link>
            <p className="mt-5 font-outfit text-lg font-semibold leading-snug tracking-tight text-white/90">
              Plot Mundial
              <span className="mt-1 block text-sm font-normal font-sans text-white/50">
                Pronósticos, ranking y comunidad para la Copa Mundial 2026.
              </span>
            </p>
            <p className="mt-5 border-l-2 border-primary/40 pl-4 text-left font-outfit text-sm italic leading-relaxed text-white/45">
              &ldquo;Ecosistema de Comunicación de Alto Impacto&rdquo;
            </p>
          </div>

          <div className="my-8 h-px bg-white/10" aria-hidden />

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/70">Contacto</h3>
              <ul className="mt-4 space-y-3.5 text-sm">
                <li>
                  <a
                    href={PHONE_HREF}
                    className="flex items-start gap-3 rounded-lg text-white/80 transition-colors hover:text-white"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[10px] uppercase tracking-wider text-white/35">Teléfono</span>
                      {PHONE_DISPLAY}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-start gap-3 rounded-lg text-white/80 transition-colors hover:text-white"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 break-all">
                      <span className="block text-[10px] uppercase tracking-wider text-white/35">Email</span>
                      {EMAIL}
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/50 ring-1 ring-white/10">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-wider text-white/35">Dirección</span>
                    {ADDRESS}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/70">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/terminos"
                    className="inline-flex items-center gap-2 rounded-lg py-1 text-sm text-white/75 transition-colors hover:text-primary"
                  >
                    <FileText className="h-4 w-4 text-primary/60" aria-hidden />
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidad"
                    className="inline-flex items-center gap-2 rounded-lg py-1 text-sm text-white/75 transition-colors hover:text-primary"
                  >
                    <Shield className="h-4 w-4 text-primary/60" aria-hidden />
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="my-8 h-px bg-white/10" aria-hidden />

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/35">Seguinos</p>
              <p className="mt-2 max-w-sm text-sm text-white/45">
                Novedades y trabajo del estudio en{" "}
                <a
                  href={PLOT_CENTER_WEB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 underline decoration-white/20 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/50"
                >
                  plotcenter.com.ar
                </a>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <SocialButton href={PLOT_CENTER_WEB} label="Sitio web Plot Center">
                <ExternalLink className="h-5 w-5" />
              </SocialButton>
              <SocialButton href={INSTAGRAM} label="Instagram @plotcentersj">
                <InstagramIcon className="h-5 w-5" />
              </SocialButton>
            </div>
          </div>

          <p className="mt-8 border-t border-white/10 pt-6 text-center text-[11px] text-white/40">
            © {new Date().getFullYear()}{" "}
            <a
              href={PLOT_CENTER_WEB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/55 transition-colors hover:text-primary"
            >
              Plot Center
            </a>
            {" · "}Plot Mundial. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
