'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { scoreChangePressure } from '@/lib/enterprise'
import { CHANGE_PRESSURE_STEPS } from '@/lib/enterprise-steps'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('change-pressure')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={CHANGE_PRESSURE_STEPS} onComplete={a => setResults(scoreChangePressure(a))} />
}
