'use client'
import { useState } from 'react'
import { Assessment } from '@/components/Assessment'
import { ResultsView } from '@/components/Results'
import { scoreCommunication, COMMUNICATION_STEPS } from '@/lib/enterprise'
import { getToolById } from '@/lib/registry'
import type { Results } from '@/lib/types'
const tool = getToolById('communication-clarity')!
export default function Page() {
  const [results, setResults] = useState<Results | null>(null)
  if (results) return <ResultsView tool={tool} results={results} onRestart={() => setResults(null)} />
  return <Assessment tool={tool} steps={COMMUNICATION_STEPS} onComplete={a => setResults(scoreCommunication(a))} />
}
