import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de privacidad | Plot Mundial",
  description: "Cómo tratamos tus datos en Plot Mundial.",
}

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-6 font-outfit text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-white/50">Última actualización: mayo 2026</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-white/75">
        <p>
          <strong className="text-white">Plot Mundial</strong> y{" "}
          <strong className="text-white">Plot Center</strong> (Ecosistema de Comunicación de Alto Impacto)
          respetan tu privacidad. Esta política describe de forma general qué información puede tratarse
          al usar la Plataforma y con qué fines.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">1. Responsable</h2>
        <p>
          Los datos asociados al servicio pueden ser tratados por Plot Center y proveedores técnicos
          necesarios para el funcionamiento del sitio (por ejemplo, alojamiento y base de datos).
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">2. Datos que podemos recoger</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Datos de cuenta y autenticación (p. ej. correo electrónico, nombre de usuario).</li>
          <li>Datos de uso de la aplicación (p. ej. interacciones con pronósticos y rankings).</li>
          <li>Datos técnicos habituales (p. ej. tipo de navegador, registros de seguridad básicos).</li>
        </ul>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">3. Finalidades</h2>
        <p>
          Prestación del servicio, seguridad, mejora de la experiencia, comunicaciones relacionadas con
          la cuenta y cumplimiento de obligaciones legales cuando aplique.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">4. Conservación</h2>
        <p>
          Conservamos la información el tiempo necesario para las finalidades anteriores y según
          plazos legales o de backup que correspondan.
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">5. Derechos</h2>
        <p>
          Según tu país o provincia, podés tener derechos de acceso, rectificación, supresión,
          oposición u otros. Para ejercerlos o consultar sobre tratamiento de datos, escribinos a{" "}
          <a className="text-primary hover:underline" href="mailto:contacto@plotcenter.com.ar">
            contacto@plotcenter.com.ar
          </a>
          .
        </p>

        <h2 className="pt-2 font-outfit text-lg font-semibold text-white">6. Redes sociales</h2>
        <p>
          Si accedés a nuestros perfiles en redes (por ejemplo{" "}
          <a
            className="text-primary hover:underline"
            href="https://www.instagram.com/plotcentersj/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram @plotcentersj
          </a>
          ), aplican también las políticas de la plataforma correspondiente.
        </p>

        <p className="pt-4 text-xs text-white/45">
          Texto orientativo. Ajustá esta política con asesoramiento legal según tu tratamiento real de
          datos (cookies, proveedores, transferencias internacionales, etc.).
        </p>
      </div>
    </div>
  )
}
