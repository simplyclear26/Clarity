'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Tool, Step } from '@/lib/types'

interface Props { tool: Tool; steps: Step[]; onComplete: (answers: Record<string, string>) => void }

export function Assessment({ tool, steps, onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1)
  const step = steps[current]
  const isLast = current === steps.length - 1
  const isAnswered = step.type === 'text' ? (answers[step.id] ?? '').trim().length > 0 : answers[step.id] !== undefined
  const progress = Math.round(((current + 1) / steps.length) * 100)
  const isSme = tool.audience === 'sme'
  const accentSel = isSme ? 'border-amber bg-amber/5 shadow-[0_0_0_3px_rgba(201,137,90,0.12)]' : 'border-teal bg-teal-light shadow-[0_0_0_3px_rgba(42,184,160,0.12)]'
  const accentHov = isSme ? 'hover:border-amber hover:bg-amber/5' : 'hover:border-teal hover:bg-teal-light'
  const bar = isSme ? 'bg-amber' : 'bg-teal'
  const label = isSme ? 'text-amber' : 'text-teal'
  const btn = isSme ? 'bg-amber hover:bg-amber-dark' : 'bg-charcoal hover:bg-charcoal-2'
  function select(val: string) { setAnswers(p => ({ ...p, [step.id]: val })) }
  function goNext() { if (!isAnswered) return; if (isLast) { onComplete(answers); return } setDirection(1); setCurrent(c => c + 1) }
  function goBack() { if (current === 0) return; setDirection(-1); setCurrent(c => c - 1) }
  const variants = { enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }) }
  return (
    <section className="min-h-screen py-16 px-6 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex justify-between text-xs text-charcoal-4 mb-2"><span>Question {current + 1} of {steps.length}</span><span>{progress}%</span></div>
        <div className="h-[3px] bg-border rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${bar}`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={current} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
          <p className={`text-xs font-medium tracking-widest uppercase mb-3 ${label}`}>Question {current + 1}</p>
          <h2 className="font-serif text-[1.65rem] leading-[1.25] text-charcoal mb-3">{step.question}</h2>
          {step.hint && <p className="text-sm text-charcoal-3 font-light mb-6 leading-relaxed">{step.hint}</p>}
          {step.type === 'text' ? (
            <input type="text" value={answers[step.id] ?? ''} onChange={e => setAnswers(p => ({ ...p, [step.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && isAnswered) goNext() }} placeholder="Type your answer here" className="w-full px-5 py-4 text-base border border-border rounded-lg focus:outline-none focus:border-teal transition-colors" autoFocus />
          ) : (
            <div className={`grid gap-2.5 ${step.cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {step.options?.map(opt => {
                const active = answers[step.id] === opt.val
                return (
                  <button key={opt.val} onClick={() => select(opt.val)} className={`text-left px-4 py-3.5 rounded-lg border transition-all duration-150 ${active ? accentSel : `border-border bg-white ${accentHov}`}`}>
                    <span className="block text-sm font-medium text-charcoal leading-tight">{opt.label}</span>
                    {opt.sub && <span className="block text-xs text-charcoal-4 mt-0.5">{opt.sub}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-between mt-12 gap-4">
        {current > 0 ? <button onClick={goBack} className="text-sm text-charcoal-3 border border-border px-6 py-3 rounded-lg hover:border-charcoal-3 transition-all">Back</button> : <Link href="/" className="text-sm text-charcoal-3 border border-border px-6 py-3 rounded-lg hover:border-charcoal-3 transition-all">Back</Link>}
        <button onClick={goNext} disabled={!isAnswered} className={`ml-auto inline-flex items-center gap-2 text-white text-sm font-medium px-7 py-3 rounded-lg disabled:bg-border disabled:text-charcoal-4 disabled:cursor-not-allowed transition-all ${btn}`}>
          {isLast ? 'View results' : 'Continue'}
          {!isLast && <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      </div>
    </section>
  )
}
