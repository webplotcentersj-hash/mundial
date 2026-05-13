import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, FileText, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

const INSTAGRAM = "https://www.instagram.com/plotcentersj/?hl=es"
const EMAIL = "contacto@plotcenter.com.ar"
const PHONE_DISPLAY = "2646212163"
const PHONE_HREF = "tel:+542646212163"

export default function SiteFooter() {
  return (
    <footer
      className={cn(
        "mt-auto w-full border-t border-white/10",
        "bg-[#050a14]/95 backdrop-blur-xl text-white/80"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <Image
                src="/plot%20center%20mundial.png"
                alt="Plot Center"
                width={180}
                height={52}
                className="h-11 w-auto object-contain opacity-95"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              <span className="font-semibold text-primary/90">Plot Mundial</span>
              {" · "}
              pronósticos, ranking y comunidad para la Copa Mundial 2026.
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Ecosistema de Comunicación de Alto Impacto
            </p>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center gap-2 rounded-lg text-white/85 transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-lg break-all text-white/85 transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg text-white/85 transition-colors hover:text-primary"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
                  @plotcentersj
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/terminos"
                  className="inline-flex items-center gap-2 rounded-lg text-white/85 transition-colors hover:text-primary"
                >
                  <FileText className="h-4 w-4 text-primary/70" aria-hidden />
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="inline-flex items-center gap-2 rounded-lg text-white/85 transition-colors hover:text-primary"
                >
                  <Shield className="h-4 w-4 text-primary/70" aria-hidden />
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-xs text-white/45 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} Plot Center / Plot Mundial. Todos los derechos reservados.
          </p>
          <p className="max-w-md sm:text-right">
            Un producto del ecosistema{" "}
            <span className="text-white/60">Plot Center</span>
            {" · "}
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-primary">
              Instagram
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
