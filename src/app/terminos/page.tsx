import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos y condiciones | Plot Mundial",
  description: "Términos de uso de Plot Mundial y servicios asociados.",
}

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-6 font-outfit text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Términos y condiciones
      </h1>
      <p className="mt-2 text-sm text-white/50">Última actualización: mayo 2026</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-white/75">
        <p>
          Al acceder y utilizar <strong className="text-white">Plot Mundial</strong> (en adelante, la
          &quot;Plataforma&quot;), operada en el marco del ecosistema{" "}
          <strong className="text-white">Plot Center</strong> — Ecosistema de Comunicación de Alto Impacto —,
          aceptás estos términos en su totalidad. Si no estás de acuerdo, no utilices la Plataforma.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">1. Objeto</h2>
        <p>
          La Plataforma permite registrar usuarios, realizar pronósticos deportivos recreativos
          relacionados con competiciones de fútbol, participar en rankings y funciones sociales
          descriptas en el sitio. El servicio es de carácter lúdico salvo que se indique expresamente lo contrario por escrito.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">2. Cuenta y edad</h2>
        <p>
          Podés necesitar una cuenta para ciertas funciones. Sos responsable de la confidencialidad de
          tus credenciales y de la actividad realizada con tu cuenta. Declarás ser mayor de edad según
          la legislación aplicable en tu jurisdicción.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">3. Conducta</h2>
        <p>
          No está permitido utilizar la Plataforma para fines ilícitos, vulnerar sistemas, suplantar
          identidades, acosar a otros usuarios o interferir con el normal funcionamiento del servicio.
          Plot Center podrá suspender cuentas ante incumplimientos graves o reiterados.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">4. Disponibilidad y cambios</h2>
        <p>
          La Plataforma se ofrece &quot;tal cual&quot; y según disponibilidad. Podemos modificar funciones,
          suspender el servicio por mantenimiento o actualizar estos términos. Los cambios relevantes
          se publicarán en esta página con una nueva fecha de actualización cuando corresponda.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">5. Contacto</h2>
        <p>
          Para consultas sobre estos términos:{" "}
          <a className="text-primary hover:underline" href="mailto:contacto@plotcenter.com.ar">
            contacto@plotcenter.com.ar
          </a>
          {" · "}
          <a className="text-primary hover:underline" href="tel:+542646212163">
            2646212163
          </a>
          .
        </p>

        <p className="pt-4 text-xs text-white/45">
          Este texto es orientativo y no constituye asesoramiento legal. Conviene revisarlo con un
          profesional según tu operación y jurisdicción.
        </p>
      </div>
    </div>
  )
}
