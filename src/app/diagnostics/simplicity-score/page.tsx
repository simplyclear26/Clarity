'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { SIMPLICITY_SCORE_STEPS, scoreSimplicity } from '@/lib/sme'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('simplicity-score')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={SIMPLICITY_SCORE_STEPS} onComplete={a => setResults(scoreSimplicity(a))} />
}
