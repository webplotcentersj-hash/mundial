'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import type { AdminUserDetail } from '@/lib/actions'
import { getProductLabel } from '@/lib/store/catalog'

function formatAdminDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function productTypeLabel(t: string) {
  return getProductLabel(t)
}

type Props = {
  open: boolean
  loading: boolean
  detail: AdminUserDetail | null
  totalMatches: number
  onClose: () => void
}

export function AdminUserFichaModal({ open, loading, detail, totalMatches, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0a0f1c] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-ficha-title"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            {loading && !detail ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-red-400" />
              </div>
            ) : detail ? (
              <motion.div className="p-6 sm:p-8">
                <motion.div className="mb-6 flex items-start gap-4 border-b border-white/10 pb-6 pr-10">
                  <motion.div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-2xl font-black text-white">
                    {detail.profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={detail.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      detail.profile.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </motion.div>
                  <motion.div className="min-w-0 flex-1">
                    <h2 id="user-ficha-title" className="truncate text-2xl font-black text-white">
                      {detail.profile.username ?? 'Sin nombre'}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-white/40">{detail.profile.id}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${
                        detail.profile.role === 'admin'
                          ? 'border-red-500/40 bg-red-500/15 text-red-300'
                          : 'border-white/15 bg-white/5 text-white/60'
                      }`}
                    >
                      {detail.profile.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </motion.div>
                </motion.div>

                <motion.div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Ranking', value: detail.profile.total_points },
                    { label: 'Fixture', value: detail.fixture_points },
                    { label: 'Trivia', value: detail.trivia_points },
                    {
                      label: 'Predicciones',
                      value: `${detail.profile.predictions_count} / ${totalMatches}`,
                    },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{stat.label}</p>
                      <p className="mt-1 text-xl font-black text-amber-400">{stat.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
                  <motion.div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                    <p className="text-xs font-bold uppercase text-white/40">Registro</p>
                    <p className="mt-1 text-white/80">{formatAdminDate(detail.profile.created_at)}</p>
                  </motion.div>
                  <motion.div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                    <p className="text-xs font-bold uppercase text-white/40">Última actividad</p>
                    <p className="mt-1 text-white/80">{formatAdminDate(detail.profile.last_active)}</p>
                  </motion.div>
                  <motion.div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                    <p className="text-xs font-bold uppercase text-white/40">Trivia</p>
                    <p className="mt-1 text-white/80">
                      {detail.trivia_correct} aciertos de {detail.trivia_answered}
                    </p>
                  </motion.div>
                  <motion.div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                    <p className="text-xs font-bold uppercase text-white/40">Pedidos Store</p>
                    <p className="mt-1 text-white/80">{detail.print_orders_count}</p>
                  </motion.div>
                </motion.div>

                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">
                  Últimas predicciones
                </h3>
                {detail.recent_predictions.length === 0 ? (
                  <p className="mb-6 text-center text-sm text-white/45">Sin predicciones cargadas.</p>
                ) : (
                  <motion.div className="mb-6 max-h-52 space-y-2 overflow-y-auto">
                    {detail.recent_predictions.map((pred) => (
                      <motion.div
                        key={pred.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
                      >
                        <span className="min-w-0 flex-1 font-medium text-white/90">{pred.match_label}</span>
                        <span className="font-mono text-white/70">
                          {pred.home_score}–{pred.away_score}
                          {pred.match_status === 'finished' &&
                            pred.actual_home != null &&
                            pred.actual_away != null && (
                              <span className="ml-2 text-white/35">
                                (real {pred.actual_home}–{pred.actual_away})
                              </span>
                            )}
                        </span>
                        <span className="text-xs font-bold text-amber-400">
                          {(pred.points_earned ?? 0) > 0 ? `+${pred.points_earned}` : '—'}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {detail.print_orders.length > 0 && (
                  <motion.div className="space-y-2">
                    <h3 className="mb-2 text-sm font-bold uppercase text-white/50">Pedidos Store</h3>
                    {detail.print_orders.map((order) => (
                      <motion.div
                        key={order.id}
                        className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2.5 text-sm"
                      >
                        <motion.div className="flex justify-between gap-2">
                          <span className="font-semibold text-white">{productTypeLabel(order.product_type)}</span>
                          <span className="text-xs uppercase text-violet-300">{order.status}</span>
                        </motion.div>
                        <p className="mt-1 text-xs text-white/55">
                          {order.contact_name} · {order.contact_email}
                        </p>
                        <p className="text-[11px] text-white/35">{formatAdminDate(order.created_at)}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
