'use client'

import { Suspense, useEffect, useState } from 'react'
import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { EmailConfirmNoticeModal } from '@/components/auth/email-confirm-notice-modal'

function LoginContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const pendingConfirmation = searchParams.get('pendingConfirmation') === '1'
  const registerMode = searchParams.get('mode') === 'register'

  const [isLogin, setIsLogin] = useState(!registerMode)
  const [confirmModal, setConfirmModal] = useState<'before-signup' | 'after-signup' | null>(null)

  useEffect(() => {
    if (pendingConfirmation) {
      setIsLogin(true)
      setConfirmModal('after-signup')
      return
    }
    if (registerMode) {
      setIsLogin(false)
      setConfirmModal('before-signup')
    }
  }, [pendingConfirmation, registerMode])

  function openRegisterFlow() {
    setConfirmModal('before-signup')
  }

  function closeConfirmModal() {
    setConfirmModal((current) => {
      if (current === 'before-signup') {
        setIsLogin(false)
      }
      return null
    })
  }

  return (
    <>
      <EmailConfirmNoticeModal
        open={confirmModal !== null}
        variant={confirmModal ?? 'before-signup'}
        onClose={closeConfirmModal}
      />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="glass-card w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-primary/30 rounded-full blur-[50px] pointer-events-none" />

          <div className="text-center mb-8">
            <div className="flex justify-center mb-6 relative w-max mx-auto group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              <Image
                src="/plot%20center%20mundial.png"
                alt="Plot Mundial Logo"
                width={220}
                height={80}
                className="relative z-10 object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              />
            </div>
            <h2 className="text-3xl font-bold font-outfit mt-4">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? 'Ingresa para continuar jugando'
                : 'Completá el formulario para unirte al prode del Mundial'}
            </p>
          </div>

          {message && !pendingConfirmation && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
              {message}
            </div>
          )}

          <form className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="username">
                  Nombre de Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Ej. JuanPerez99"
                  required={!isLogin}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 shadow-inner shadow-black/20 backdrop-blur-sm transition-all focus:border-primary/55 focus:outline-none focus:ring-2 focus:ring-primary/35"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 shadow-inner shadow-black/20 backdrop-blur-sm transition-all focus:border-primary/55 focus:outline-none focus:ring-2 focus:ring-primary/35"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 shadow-inner shadow-black/20 backdrop-blur-sm transition-all focus:border-primary/55 focus:outline-none focus:ring-2 focus:ring-primary/35"
              />
            </div>

            <button
              formAction={isLogin ? login : signup}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(235,103,27,0.3)] mt-6"
            >
              {isLogin ? 'Ingresar' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (isLogin) {
                  openRegisterFlow()
                } else {
                  setIsLogin(true)
                }
              }}
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Ingresa aquí'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
