'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { BUSINESS_FRICTION_STEPS, scoreBusinessFriction } from '@/lib/sme'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('business-friction')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={BUSINESS_FRICTION_STEPS} onComplete={a => setResults(scoreBusinessFriction(a))} />
}
