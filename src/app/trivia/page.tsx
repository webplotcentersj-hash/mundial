'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, Clock, Loader2, Medal, RotateCcw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getTriviaSession,
  getTriviaStats,
  submitTriviaAnswer,
  type TriviaQuestionPublic,
  type TriviaStats,
} from '@/lib/actions/trivia'
import { TRIVIA_POINTS, TRIVIA_TIME_LIMIT_SEC } from '@/lib/trivia/constants'
import { labelTriviaCategory, labelTriviaDifficulty, labelTriviaPoints } from '@/lib/trivia/labels'

const FEEDBACK_AUTO_ADVANCE_MS = 1600

type Phase = 'intro' | 'playing' | 'feedback' | 'summary'

type FeedbackState = {
  correct: boolean
  correctIndex: number
  points: number
  basePoints: number
  timeBonus: number
  timedOut?: boolean
  alreadyAnswered?: boolean
}

export default function TriviaPage() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<TriviaStats | null>(null)
  const [questions, setQuestions] = useState<TriviaQuestionPublic[]>([])
  const [index, setIndex] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionPoints, setSessionPoints] = useState(0)
  const [sessionTimeBonus, setSessionTimeBonus] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(TRIVIA_TIME_LIMIT_SEC)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const questionStartedAt = useRef(0)
  const timedOutRef = useRef(false)
  const submittingRef = useRef(false)
  const selectedRef = useRef<number | null>(null)

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  const refreshStats = useCallback(async () => {
    const s = await getTriviaStats()
    setStats(s)
  }, [])

  useEffect(() => {
    refreshStats().finally(() => setLoading(false))
  }, [refreshStats])

  const current = questions[index]

  const applyAnswerResult = useCallback(
    (res: Awaited<ReturnType<typeof submitTriviaAnswer>>) => {
      if (res.error) {
        setError(res.error)
        return
      }
      setFeedback({
        correct: res.correct,
        correctIndex: res.correctIndex,
        points: res.pointsEarned,
        basePoints: res.basePoints,
        timeBonus: res.timeBonus,
        timedOut: res.timedOut,
        alreadyAnswered: res.alreadyAnswered,
      })
      if (res.correct && !res.alreadyAnswered) {
        setSessionCorrect((c) => c + 1)
        setSessionPoints((p) => p + res.pointsEarned)
        setSessionTimeBonus((t) => t + res.timeBonus)
      }
      setPhase('feedback')
    },
    [],
  )

  const submitAnswer = useCallback(
    async (choice: number, forcedMs?: number) => {
      if (!current || submittingRef.current) return
      submittingRef.current = true
      setSubmitting(true)
      const responseTimeMs =
        forcedMs ?? Math.min(TRIVIA_TIME_LIMIT_SEC * 1000, Math.max(0, Date.now() - questionStartedAt.current))
      const res = await submitTriviaAnswer(current.id, choice, responseTimeMs)
      submittingRef.current = false
      setSubmitting(false)
      await refreshStats()
      applyAnswerResult(res)
    },
    [applyAnswerResult, current, refreshStats],
  )

  useEffect(() => {
    if (phase !== 'playing' || !current) return

    questionStartedAt.current = Date.now()
    timedOutRef.current = false
    setSecondsLeft(TRIVIA_TIME_LIMIT_SEC)

    const tick = window.setInterval(() => {
      const elapsed = Date.now() - questionStartedAt.current
      const left = Math.max(0, TRIVIA_TIME_LIMIT_SEC - elapsed / 1000)
      setSecondsLeft(left)
      if (left <= 0 && !timedOutRef.current) {
        timedOutRef.current = true
        const choice = selectedRef.current ?? -1
        void submitAnswer(choice, TRIVIA_TIME_LIMIT_SEC * 1000)
      }
    }, 100)

    return () => window.clearInterval(tick)
  }, [phase, index, current?.id, submitAnswer])

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
      setError(res.error ?? 'No hay preguntas nuevas disponibles.')
      setPhase('intro')
      return
    }
    setStats(res.stats)
    setQuestions(res.questions)
    setIndex(0)
    setSessionCorrect(0)
    setSessionPoints(0)
    setSessionTimeBonus(0)
    setSelected(null)
    setFeedback(null)
    setPhase('playing')
  }

  const confirmAnswer = () => {
    if (selected === null || submitting) return
    void submitAnswer(selected)
  }

  const nextQuestion = useCallback(() => {
    if (index + 1 >= questions.length) {
      setPhase('summary')
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setFeedback(null)
    setPhase('playing')
  }, [index, questions.length])

  useEffect(() => {
    if (phase !== 'feedback') return
    const id = window.setTimeout(nextQuestion, FEEDBACK_AUTO_ADVANCE_MS)
    return () => window.clearTimeout(id)
  }, [phase, index, nextQuestion])

  const timerPct = (secondsLeft / TRIVIA_TIME_LIMIT_SEC) * 100
  const timerUrgent = secondsLeft <= 3 && phase === 'playing'

  if (loading && !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-[family-name:var(--font-store-sans)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#111]" aria-hidden />
      </div>
    )
  }

  return (
    <motion.div className="min-h-[calc(100vh-4rem)] w-full px-4 py-8 pb-28 font-[family-name:var(--font-store-sans)] text-[#111] md:px-8 md:py-10">
      <motion.div className="mx-auto max-w-2xl">
        <motion.div className="mb-8 border-b-2 border-[#111] pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5d3fd3]">Plot Mundial</p>
          <h1 className="mt-1 flex items-center gap-3 text-3xl font-black uppercase tracking-tight [font-family:var(--font-store-display),sans-serif] md:text-4xl">
            <Brain className="h-9 w-9 text-[#EB671B]" aria-hidden />
            Trivia mundialista
          </h1>
          <p className="mt-2 text-sm text-[#444]">
            Tenés <strong>{TRIVIA_TIME_LIMIT_SEC} segundos</strong> por pregunta. Puntos = acierto (
            {TRIVIA_POINTS.easy}/{TRIVIA_POINTS.medium}/{TRIVIA_POINTS.hard} según dificultad) +{' '}
            <strong>bonus por velocidad</strong>. Sumá al{' '}
            <Link href="/ranking" className="font-bold text-[#5d3fd3] underline underline-offset-2">
              ranking de trivia
            </Link>{' '}
            (aparte del prode).
          </p>
        </motion.div>

        {stats && (
          <motion.div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Banco', value: stats.totalInBank },
              { label: 'Te faltan', value: stats.remainingInBank },
              { label: 'Aciertos', value: stats.correct },
              { label: 'Pts trivia', value: stats.triviaPoints },
            ].map((box) => (
              <motion.div
                key={box.label}
                className="rounded-xl border-2 border-[#111] bg-white px-3 py-3 text-center shadow-[3px_3px_0_#bbb]"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{box.label}</p>
                <p className="text-xl font-black tabular-nums [font-family:var(--font-store-display),sans-serif]">
                  {box.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {error && (
          <motion.div className="store-message err mb-6" role="alert">
            {error}
            {error.includes('sesión') && (
              <span className="mt-2 block space-y-1">
                <Link href="/login?next=/trivia" className="block font-bold underline">
                  Iniciar sesión
                </Link>
                <Link href="/login?mode=register&next=/trivia" className="block font-bold underline">
                  Crear cuenta
                </Link>
              </span>
            )}
          </motion.div>
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
                Partida de hasta {Math.min(10, stats?.remainingInBank ?? 10)} preguntas
              </h2>
              <p className="mt-2 text-sm text-[#555]">
                Ronda ordenada de fácil a difícil. Elegí una respuesta, confirmá y pasás solo a la siguiente.
                Cada pregunta del banco solo suma puntos la primera vez que la acertás.
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-[3px] border-[#111] bg-white p-5 shadow-[8px_8px_0_#111] sm:p-7"
            >
              <motion.div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border-2 border-[#111] bg-[#ccff00] px-3 py-0.5 text-[10px] font-black uppercase">
                  Pregunta {index + 1} de {questions.length}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="rounded-full border border-[#5d3fd3] px-2 py-0.5 text-[#5d3fd3]">
                    {labelTriviaDifficulty(current.difficulty)} · {labelTriviaPoints(current.difficulty)} pts
                  </span>
                  <span className="text-[#888]">
                    {labelTriviaCategory(current.category)}
                    {current.worldCupYear ? ` · ${current.worldCupYear}` : ''}
                  </span>
                </div>
              </motion.div>

              {phase === 'playing' && (
                <motion.div
                  className={cn(
                    'mb-4 flex items-center gap-3 rounded-xl border-2 px-3 py-2',
                    timerUrgent ? 'border-red-600 bg-red-50' : 'border-[#111] bg-[#fafafa]',
                  )}
                  role="timer"
                  aria-live="polite"
                  aria-label={`Tiempo restante ${Math.ceil(secondsLeft)} segundos`}
                >
                  <Clock className={cn('h-5 w-5 shrink-0', timerUrgent ? 'text-red-600' : 'text-[#111]')} />
                  <motion.div className="min-w-0 flex-1">
                    <motion.div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#666]">
                      <span>Tiempo</span>
                      <span className={cn('tabular-nums', timerUrgent && 'text-red-600')}>
                        {Math.ceil(secondsLeft)}s
                      </span>
                    </motion.div>
                    <motion.div className="h-2 overflow-hidden rounded-full border border-[#111] bg-white">
                      <motion.div
                        className={cn(
                          'h-full transition-[width] duration-100 ease-linear',
                          timerUrgent ? 'bg-red-500' : 'bg-[#ccff00]',
                        )}
                        style={{ width: `${timerPct}%` }}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              <h2 className="text-lg font-black leading-snug sm:text-xl [font-family:var(--font-store-display),sans-serif]">
                {current.question}
              </h2>

              <motion.div className="mt-6 space-y-3">
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
              </motion.div>

              {phase === 'feedback' && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'mt-6 rounded-xl border-2 px-4 py-3',
                    feedback.correct ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50',
                  )}
                >
                  <motion.div className="flex items-start gap-3">
                    {feedback.correct ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-green-700" />
                    ) : (
                      <XCircle className="h-6 w-6 shrink-0 text-red-700" />
                    )}
                    <motion.div className="text-sm font-bold">
                      {feedback.timedOut && !feedback.correct ? (
                        <>Se acabó el tiempo. La respuesta correcta era: {current.options[feedback.correctIndex]}</>
                      ) : feedback.correct ? (
                        <>
                          ¡Correcto! +{feedback.points} pts en trivia
                          {feedback.timeBonus > 0 ? (
                            <span className="mt-1 block text-xs font-semibold text-green-800">
                              Base {feedback.basePoints} + bonus velocidad {feedback.timeBonus}
                            </span>
                          ) : null}
                        </>
                      ) : feedback.alreadyAnswered ? (
                        <>Ya habías respondido esta pregunta. No suma puntos de nuevo.</>
                      ) : (
                        <>Incorrecto. La respuesta era: {current.options[feedback.correctIndex]}</>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              <motion.div className="mt-6">
                {phase === 'playing' ? (
                  <button
                    type="button"
                    onClick={confirmAnswer}
                    disabled={selected === null || submitting}
                    className="btn-primary hover-lift w-full py-3 disabled:opacity-40 [font-family:var(--font-store-display),sans-serif]"
                  >
                    {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Confirmar'}
                  </button>
                ) : (
                  <p className="flex items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-wider text-[#888]">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {index + 1 >= questions.length ? 'Mostrando resultado…' : 'Siguiente pregunta…'}
                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="normal-case underline underline-offset-2 text-[#5d3fd3]"
                    >
                      Saltar
                    </button>
                  </p>
                )}
              </motion.div>
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
              <p className="mt-4 text-lg font-bold">+{sessionPoints} pts en ranking trivia</p>
              {sessionTimeBonus > 0 && (
                <p className="mt-1 text-sm text-[#5d3fd3]">incluye +{sessionTimeBonus} por responder rápido</p>
              )}
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
    </motion.div>
  )
}
