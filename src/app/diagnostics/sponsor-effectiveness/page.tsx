'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { scoreSponsorEffectiveness, SPONSOR_STEPS } from '@/lib/enterprise'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('sponsor-effectiveness')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={SPONSOR_STEPS} onComplete={a => setResults(scoreSponsorEffectiveness(a))} />
}
