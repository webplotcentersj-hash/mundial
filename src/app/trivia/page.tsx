'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, Loader2, Medal, RotateCcw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getTriviaSession,
  getTriviaStats,
  submitTriviaAnswer,
  type TriviaQuestionPublic,
  type TriviaStats,
} from '@/lib/actions/trivia'
import { TRIVIA_POINTS } from '@/lib/trivia/constants'

type Phase = 'intro' | 'playing' | 'feedback' | 'summary'

export default function TriviaPage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<TriviaStats | null>(null)
  const [questions, setQuestions] = useState<TriviaQuestionPublic[]>([])
  const [index, setIndex] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionPoints, setSessionPoints] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{
    correct: boolean
    correctIndex: number
    points: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshStats = useCallback(async () => {
    const s = await getTriviaStats()
    setStats(s)
  }, [])

  useEffect(() => {
    refreshStats().finally(() => setLoading(false))
  }, [refreshStats])

  const startSession = async () => {
    setLoading(true)
    setError(null)
    const res = await getTriviaSession()
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    if (res.questions.length === 0) {
      setError('No quedan preguntas nuevas. Volvé más tarde o revisá el ranking.')
      return
    }
    setStats(res.stats)
    setQuestions(res.questions)
    setIndex(0)
    setSessionCorrect(0)
    setSessionPoints(0)
    setSelected(null)
    setFeedback(null)
    setPhase('playing')
  }

  const current = questions[index]

  const confirmAnswer = async () => {
    if (!current || selected === null || submitting) return
    setSubmitting(true)
    const res = await submitTriviaAnswer(current.id, selected)
    setSubmitting(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setFeedback({
      correct: res.correct,
      correctIndex: res.correctIndex,
      points: res.pointsEarned,
    })
    if (res.correct && !res.alreadyAnswered) {
      setSessionCorrect((c) => c + 1)
      setSessionPoints((p) => p + res.pointsEarned)
    }
    await refreshStats()
    setPhase('feedback')
  }

  const nextQuestion = () => {
    if (index + 1 >= questions.length) {
      setPhase('summary')
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setFeedback(null)
    setPhase('playing')
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-[family-name:var(--font-store-sans)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#111]" aria-hidden />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full px-4 py-8 pb-28 font-[family-name:var(--font-store-sans)] text-[#111] md:px-8 md:py-10">
      <motion.div className="mx-auto max-w-2xl">
        <div className="mb-8 border-b-2 border-[#111] pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5d3fd3]">Plot Mundial</p>
          <h1 className="mt-1 flex items-center gap-3 text-3xl font-black uppercase tracking-tight [font-family:var(--font-store-display),sans-serif] md:text-4xl">
            <Brain className="h-9 w-9 text-[#EB671B]" aria-hidden />
            Trivia mundialista
          </h1>
          <p className="mt-2 text-sm text-[#444]">
            Respondé preguntas de Copas del Mundo. Los puntos suman al{' '}
            <Link href="/ranking" className="font-bold text-[#5d3fd3] underline underline-offset-2">
              ranking global
            </Link>
            : fácil {TRIVIA_POINTS.easy} · media {TRIVIA_POINTS.medium} · difícil {TRIVIA_POINTS.hard} pts por acierto.
          </p>
        </div>

        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Banco', value: stats.totalInBank },
              { label: 'Respondidas', value: stats.answered },
              { label: 'Aciertos', value: stats.correct },
              { label: 'Pts trivia', value: stats.triviaPoints },
            ].map((box) => (
              <div
                key={box.label}
                className="rounded-xl border-2 border-[#111] bg-white px-3 py-3 text-center shadow-[3px_3px_0_#bbb]"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{box.label}</div>
                <div className="text-xl font-black tabular-nums [font-family:var(--font-store-display),sans-serif]">
                  {box.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="store-message err mb-6" role="alert">
            {error}
            {error.includes('sesión') && (
              <Link href="/login?next=/trivia" className="mt-2 block font-bold underline">
                Iniciar sesión
              </Link>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border-[3px] border-[#111] bg-white p-6 shadow-[8px_8px_0_#111] sm:p-8"
            >
              <h2 className="text-xl font-black uppercase [font-family:var(--font-store-display),sans-serif]">
                Partida de 10 preguntas
              </h2>
              <p className="mt-2 text-sm text-[#555]">
                Cada pregunta se cuenta una sola vez. Si ya la respondiste, puede volver a salir en modo repaso pero no
                suma puntos extra.
              </p>
              <button
                type="button"
                onClick={startSession}
                disabled={loading}
                className="btn-primary hover-lift mt-6 inline-flex w-full items-center justify-center gap-2 py-4 [font-family:var(--font-store-display),sans-serif]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
                {loading ? 'Cargando…' : 'Jugar ahora'}
              </button>
            </motion.div>
          )}

          {(phase === 'playing' || phase === 'feedback') && current && (
            <motion.div
              key={`q-${current.id}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="border-[3px] border-[#111] bg-white p-5 shadow-[8px_8px_0_#111] sm:p-7"
            >
              <motion.div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border-2 border-[#111] bg-[#ccff00] px-3 py-0.5 text-[10px] font-black uppercase">
                  {index + 1} / {questions.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d3fd3]">
                  {current.difficulty}
                  {current.worldCupYear ? ` · ${current.worldCupYear}` : ''}
                </span>
              </motion.div>

              <h2 className="text-lg font-black leading-snug sm:text-xl [font-family:var(--font-store-display),sans-serif]">
                {current.question}
              </h2>

              <div className="mt-6 space-y-3">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i
                  const showResult = phase === 'feedback' && feedback
                  const isCorrect = showResult && i === feedback.correctIndex
                  const isWrongPick = showResult && isSelected && !feedback.correct
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={phase === 'feedback' || submitting}
                      onClick={() => setSelected(i)}
                      className={cn(
                        'store-field w-full py-3.5 text-left text-sm font-bold transition-all',
                        isSelected && phase === 'playing' && 'border-[#5d3fd3] bg-[#f5f3ff] shadow-[3px_3px_0_#5d3fd3]',
                        isCorrect && 'border-green-600 bg-green-50',
                        isWrongPick && 'border-red-600 bg-red-50',
                      )}
                    >
                      <span className="mr-2 font-mono text-[#888]">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {phase === 'feedback' && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'mt-6 flex items-center gap-3 rounded-xl border-2 px-4 py-3',
                    feedback.correct ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50',
                  )}
                >
                  {feedback.correct ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-green-700" />
                  ) : (
                    <XCircle className="h-6 w-6 shrink-0 text-red-700" />
                  )}
                  <div className="text-sm font-bold">
                    {feedback.correct
                      ? `¡Correcto! +${feedback.points} pts al ranking`
                      : `Incorrecto. La respuesta era: ${current.options[feedback.correctIndex]}`}
                  </div>
                </motion.div>
              )}

              <div className="mt-6 flex gap-3">
                {phase === 'playing' ? (
                  <button
                    type="button"
                    onClick={confirmAnswer}
                    disabled={selected === null || submitting}
                    className="btn-primary hover-lift flex-1 py-3 disabled:opacity-40 [font-family:var(--font-store-display),sans-serif]"
                  >
                    {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Confirmar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="btn-primary hover-lift flex-1 py-3 [font-family:var(--font-store-display),sans-serif]"
                  >
                    {index + 1 >= questions.length ? 'Ver resultado' : 'Siguiente'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-[3px] border-[#111] bg-white p-8 text-center shadow-[8px_8px_0_#111]"
            >
              <Medal className="mx-auto mb-4 h-12 w-12 text-[#EB671B]" />
              <h2 className="text-2xl font-black uppercase [font-family:var(--font-store-display),sans-serif]">
                Fin de la partida
              </h2>
              <p className="mt-3 text-4xl font-black tabular-nums text-[#5d3fd3]">
                {sessionCorrect}/{questions.length}
              </p>
              <p className="mt-1 text-sm text-[#555]">aciertos en esta ronda</p>
              <p className="mt-4 text-lg font-bold">+{sessionPoints} puntos sumados al ranking</p>
              <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={startSession}
                  className="btn-primary hover-lift inline-flex items-center justify-center gap-2 px-6 py-3 [font-family:var(--font-store-display),sans-serif]"
                >
                  <RotateCcw className="h-4 w-4" /> Otra partida
                </button>
                <Link
                  href="/ranking"
                  className="btn-secondary hover-lift inline-flex items-center justify-center gap-2 px-6 py-3 [font-family:var(--font-store-display),sans-serif]"
                >
                  Ver ranking
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
