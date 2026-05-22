'use client'

import { Loader2, BarChart3, Globe, MapPin, MousePointerClick, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import type { AdminAnalyticsStats } from '@/lib/actions/analytics'
import { normalizeReferrerHost } from '@/lib/analytics/paths'

function formatShortDate(iso: string) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-white/45">{label}</p>
      <p className={`mt-2 text-3xl font-black tabular-nums ${accent ?? 'text-white'}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-white/50">{sub}</p> : null}
    </div>
  )
}

type Props = {
  loading: boolean
  stats: AdminAnalyticsStats | null
  error: string | null
}

export function AdminAnalyticsPanel({ loading, stats, error }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-200">
        {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
        No autorizado o sin datos de analytics.
      </div>
    )
  }

  const maxDaily = Math.max(1, ...stats.dailyViews.map((d) => d.views))
  const authShare7d =
    stats.views7d > 0 ? Math.round((stats.authenticated7d / stats.views7d) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-emerald-100">Tráfico del sitio</h3>
            <p className="mt-1 text-sm text-white/60">
              Visitas registradas desde el deploy de analytics. Origen = referrer, UTM y ubicación aproximada (país / provincia) vía Vercel.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitas hoy" value={stats.viewsToday} sub={`${stats.sessionsToday} sesiones únicas`} accent="text-emerald-300" />
        <StatCard label="Últimos 7 días" value={stats.views7d} sub={`${stats.sessions7d} sesiones`} />
        <StatCard label="Últimos 30 días" value={stats.views30d} sub={`${stats.sessions30d} sesiones`} />
        <StatCard label="Total histórico" value={stats.viewsAll} sub="Desde que hay datos" accent="text-amber-300" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <MousePointerClick className="h-4 w-4 text-emerald-400" /> Páginas más visitadas (7d)
          </h4>
          {stats.topPages.length === 0 ? (
            <p className="text-sm text-white/50">Todavía no hay visitas registradas.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topPages.map((p, i) => (
                <li key={p.path} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <div className="min-w-0">
                    <span className="mr-2 font-mono text-xs text-white/35">#{i + 1}</span>
                    <span className="font-medium text-white/90">{p.label}</span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-white/35">{p.path}</span>
                  </div>
                  <span className="shrink-0 font-black tabular-nums text-emerald-300">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <Globe className="h-4 w-4 text-sky-400" /> De dónde vienen (7d)
          </h4>
          {stats.topReferrers.length === 0 ? (
            <p className="text-sm text-white/50">Sin referrers todavía.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topReferrers.map((r) => (
                <li key={r.source} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <span className="truncate text-white/85">{r.source}</span>
                  <span className="shrink-0 font-black tabular-nums text-sky-300">{r.views}</span>
                </li>
              ))}
            </ul>
          )}
          {stats.topUtmSources.length > 0 ? (
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/45">UTM source (7d)</p>
              <ul className="space-y-1.5">
                {stats.topUtmSources.map((u) => (
                  <li key={u.source} className="flex justify-between text-sm text-white/75">
                    <span>{u.source}</span>
                    <span className="font-bold tabular-nums">{u.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <Globe className="h-4 w-4 text-cyan-400" /> Países (7d)
          </h4>
          {stats.topCountries.length === 0 ? (
            <p className="text-sm text-white/50">Sin datos de país todavía.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topCountries.map((c) => (
                <li key={c.source} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <span className="truncate text-white/85">{c.source}</span>
                  <span className="shrink-0 font-black tabular-nums text-cyan-300">{c.views}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <MapPin className="h-4 w-4 text-rose-400" /> Provincias / regiones (7d)
          </h4>
          {stats.topRegions.length === 0 ? (
            <p className="text-sm text-white/50">Sin datos de provincia todavía.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topRegions.map((r) => (
                <li key={r.source} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <div className="min-w-0">
                    <span className="truncate text-white/85">{r.source}</span>
                    {r.country !== r.source ? (
                      <span className="mt-0.5 block truncate text-xs text-white/40">{r.country}</span>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-black tabular-nums text-rose-300">{r.views}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6 lg:col-span-2">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <TrendingUp className="h-4 w-4 text-amber-400" /> Visitas por día (14d)
          </h4>
          <div className="space-y-2">
            {stats.dailyViews.map((d) => (
              <div key={d.date} className="grid grid-cols-[88px_1fr_48px] items-center gap-3 text-sm">
                <span className="text-white/50">{formatShortDate(d.date)}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                    style={{ width: `${Math.max(4, (d.views / maxDaily) * 100)}%` }}
                  />
                </div>
                <span className="text-right font-bold tabular-nums text-white/80">{d.views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/70">
            <Users className="h-4 w-4 text-violet-400" /> Tipo de visita (7d)
          </h4>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-white/70">Logueados</span>
                <span className="font-bold text-violet-300">{stats.authenticated7d}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${authShare7d}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-white/70">Anónimos</span>
                <span className="font-bold text-white/60">{stats.anonymous7d}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/40"
                  style={{ width: `${100 - authShare7d}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-white/45">{authShare7d}% de pageviews con sesión iniciada</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6">
        <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/70">Últimas visitas</h4>
        {stats.recentVisits.length === 0 ? (
          <p className="text-sm text-white/50">Sin actividad reciente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                <tr>
                  <th className="pb-3 pr-4">Cuándo</th>
                  <th className="pb-3 pr-4">Página</th>
                  <th className="pb-3 pr-4">Ubicación</th>
                  <th className="pb-3 pr-4">Origen</th>
                  <th className="pb-3">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentVisits.map((v, i) => (
                  <tr key={`${v.createdAt}-${i}`} className="text-white/75">
                    <td className="py-2.5 pr-4 whitespace-nowrap text-white/50">{formatDateTime(v.createdAt)}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-white/90">{v.label}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-white/70">{v.location}</td>
                    <td className="py-2.5 pr-4">{normalizeReferrerHost(v.referrerHost)}</td>
                    <td className="py-2.5">{v.isAuthenticated ? 'Logueado' : 'Anónimo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
