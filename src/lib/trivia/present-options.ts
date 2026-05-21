/** Mezcla opciones de forma determinística por id de pregunta (misma orden en sesión y al validar). */

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number) {
  let state = seed || 1
  return () => {
    state = (Math.imul(1103515245, state) + 12345) | 0
    return (state >>> 0) / 0x100000000
  }
}

export function presentQuestionOptions(
  questionId: string,
  options: readonly string[],
  correctIndex: number,
): { options: string[]; correctIndex: number } {
  const indices = options.map((_, i) => i)
  const rand = seededRandom(hashString(questionId))

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return {
    options: indices.map((i) => options[i]),
    correctIndex: indices.indexOf(correctIndex),
  }
}
