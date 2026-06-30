'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { OPERATIONAL_OVERWHELM_STEPS, scoreOperationalOverwhelm } from '@/lib/sme'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('operational-overwhelm')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={OPERATIONAL_OVERWHELM_STEPS} onComplete={a => setResults(scoreOperationalOverwhelm(a))} />
}
