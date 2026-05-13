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
        "group flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14",
        "border border-white/12 bg-gradient-to-b from-white/[0.12] to-white/[0.03]",
        "shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)]",
        "text-white/75 transition-all duration-300",
        "hover:border-primary/45 hover:text-primary hover:shadow-[0_0_32px_-4px_rgba(235,103,27,0.5)] hover:-translate-y-0.5"
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
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[min(100%,80rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(235,103,27,0.22),transparent_60%)]"
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

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:px-10">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-white/[0.12]",
            "bg-gradient-to-br from-white/[0.1] via-[#0b1428]/90 to-[#050a16]",
            "shadow-[0_32px_80px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)]",
            "ring-1 ring-white/[0.06] backdrop-blur-xl"
          )}
        >
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-amber-500/12 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            aria-hidden
          />

          <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10 xl:gap-14 xl:p-12">
            <div className="lg:col-span-5">
              <Link
                href="/"
                className="inline-flex rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Image
                  src="/plot%20center%20mundial.png"
                  alt="Plot Center · Plot Mundial"
                  width={220}
                  height={62}
                  className="h-12 w-auto object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,0.55)] sm:h-14"
                />
              </Link>
              <p className="mt-6 font-outfit text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  Plot Mundial
                </span>
                <span className="mt-2 block text-base font-normal leading-relaxed text-white/55 sm:text-lg">
                  Pronósticos, ranking y comunidad para la Copa Mundial 2026.
                </span>
              </p>
              <p
                className={cn(
                  "mt-6 rounded-2xl border border-primary/25 bg-primary/[0.08] px-4 py-3.5",
                  "font-outfit text-sm italic leading-relaxed text-white/70 sm:px-5 sm:text-[0.95rem]"
                )}
              >
                &ldquo;Ecosistema de Comunicación de Alto Impacto&rdquo;
              </p>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/80">Contacto</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1">
                <li>
                  <a
                    href={PHONE_HREF}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4",
                      "text-white/85 transition-all duration-300",
                      "hover:border-primary/35 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_0_1px_rgba(235,103,27,0.15)]"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
                      <Phone className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        Teléfono
                      </span>
                      <span className="mt-0.5 block text-sm font-medium tabular-nums">{PHONE_DISPLAY}</span>
                    </span>
                  </a>
                </li>
                <li className="sm:col-span-2 lg:col-span-1">
                  <a
                    href={`mailto:${EMAIL}`}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4",
                      "text-white/85 transition-all duration-300",
                      "hover:border-primary/35 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_0_1px_rgba(235,103,27,0.15)]"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
                      <Mail className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 break-all">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        Email
                      </span>
                      <span className="mt-0.5 block text-sm font-medium">{EMAIL}</span>
                    </span>
                  </a>
                </li>
                <li className="sm:col-span-2 lg:col-span-1">
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4",
                      "text-white/80"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white/55 ring-1 ring-white/12">
                      <MapPin className="h-4 w-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        Dirección
                      </span>
                      <span className="mt-0.5 block text-sm font-medium leading-snug">{ADDRESS}</span>
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-3">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/80">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link
                      href="/terminos"
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm",
                        "text-white/80 transition-all duration-300",
                        "hover:border-primary/35 hover:bg-white/[0.07] hover:text-primary"
                      )}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
                      Términos y condiciones
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacidad"
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm",
                        "text-white/80 transition-all duration-300",
                        "hover:border-primary/35 hover:bg-white/[0.07] hover:text-primary"
                      )}
                    >
                      <Shield className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
                      Política de privacidad
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40">Seguinos</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Novedades del estudio en{" "}
                  <a
                    href={PLOT_CENTER_WEB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white/75 underline decoration-white/15 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/50"
                  >
                    plotcenter.com.ar
                  </a>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <SocialButton href={PLOT_CENTER_WEB} label="Sitio web Plot Center">
                    <ExternalLink className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
                  </SocialButton>
                  <SocialButton href={INSTAGRAM} label="Instagram @plotcentersj">
                    <InstagramIcon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
                  </SocialButton>
                </div>
              </div>
            </div>
          </div>

          <p className="relative border-t border-white/10 px-6 py-5 text-center text-[11px] text-white/40 sm:px-8 sm:py-6 lg:px-10">
            © {new Date().getFullYear()}{" "}
            <a
              href={PLOT_CENTER_WEB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 transition-colors hover:text-primary"
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
