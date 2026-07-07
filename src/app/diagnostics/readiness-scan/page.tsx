'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { scoreReadiness, READINESS_STEPS } from '@/lib/enterprise'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('readiness-scan')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={READINESS_STEPS} onComplete={a => setResults(scoreReadiness(a))} />
}
