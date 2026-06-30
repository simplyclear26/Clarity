'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { WORKPLACE_ENERGY_STEPS, scoreWorkplaceEnergy } from '@/lib/sme'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('workplace-energy')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={WORKPLACE_ENERGY_STEPS} onComplete={a => setResults(scoreWorkplaceEnergy(a))} />
}
