'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Tool, Results } from '@/lib/types'
import { LeadCapture } from './LeadCapture'

function scoreColor(s: number) { return s >= 70 ? '#2AB8A0' : s >= 50 ? '#F0A500' : s >= 30 ? '#C9895A' : '#C94040' }
function ratingStyle(r: string) { return r === 'Strong' ? 'bg-teal-light text-teal-dark' : r === 'Adequate' ? 'bg-[#FEF8E7] text-[#A06E00]' : r === 'At risk' ? 'bg-[#FEF0E7] text-[#A04010]' : 'bg-[#FEEBEB] text-[#9B2020]' }

interface Props { tool: Tool; results: Results; onRestart: () => void }

export function ResultsView({ tool, results, onRestart }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const { serviceRec: rec } = results
  const color = scoreColor(results.overallScore)
  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-2">{tool.title}</p>
        <h1 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] text-charcoal mb-2 tracking-tight">Your results</h1>
        <p className="text-charcoal-3 font-light">{tool.tagline}</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-charcoal rounded-xl p-7">
          <p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-3">Overall score</p>
          <div className="flex items-baseline gap-1 mb-3"><span className="font-serif text-5xl leading-none" style={{ color }}>{results.overallScore}</span><span className="font-serif text-xl text-white/30">/100</span></div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4"><motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${results.overallScore}%` }} transition={{ duration: 1, delay: 0.3 }} style={{ backgroundColor: color }} /></div>
          <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${ratingStyle(results.rating)}`}>{results.rating}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-sand border border-border rounded-xl p-7 sm:col-span-2">
          <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-3">What this means</p>
          <p className="text-sm text-charcoal-2 font-light leading-relaxed">{results.ratingDescription}</p>
          {results.unsureCount > 0 && <p className="text-xs text-[#A06E00] mt-4 pt-4 border-t border-border">{results.unsureCount} question{results.unsureCount > 1 ? 's' : ''} answered "not sure" — these represent knowledge gaps worth addressing.</p>}
        </motion.div>
      </div>
      {results.dimensionScores && Object.keys(results.dimensionScores).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="border border-border rounded-xl p-7 mb-5">
          <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-5">Dimension breakdown</p>
          <div className="space-y-4">
            {Object.entries(results.dimensionScores).map(([lbl, sc]) => (
              <div key={lbl}>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-charcoal-2 font-light">{lbl}</span><span className="font-medium" style={{ color: scoreColor(sc as number) }}>{sc}</span></div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden"><motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${sc}%` }} transition={{ duration: 0.8, delay: 0.4 }} style={{ backgroundColor: scoreColor(sc as number) }} /></div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {results.strengths.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border border-border rounded-xl p-7">
            <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-4">Strength areas</p>
            <ul className="space-y-2.5">{results.strengths.map((s, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-charcoal-2 font-light leading-snug"><span className="text-teal mt-0.5 shrink-0">✓</span>{s}</li>)}</ul>
          </motion.div>
        )}
        {results.pressureAreas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="border border-border rounded-xl p-7">
            <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-4">Pressure areas</p>
            <ul className="space-y-2.5">{results.pressureAreas.map((p, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-charcoal-2 font-light leading-snug"><span className="text-amber mt-0.5 shrink-0">→</span>{p}</li>)}</ul>
          </motion.div>
        )}
      </div>
      {results.recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border border-border rounded-xl p-7 mb-5">
          <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-4">Recommended focus areas</p>
          <ul className="space-y-3">{results.recommendations.map((r, i) => <li key={i} className="flex items-start gap-3 text-sm text-charcoal-2 font-light leading-relaxed"><span className="w-5 h-5 rounded-full bg-teal text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>{r}</li>)}</ul>
        </motion.div>
      )}
      {results.whatGoodLooksLike.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-sand border border-border rounded-xl p-7 mb-8">
          <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-4">What good looks like</p>
          <ul className="space-y-2.5">{results.whatGoodLooksLike.map((w, i) => <li key={i} className="flex items-start gap-2.5 text-sm text-charcoal-2 font-light leading-snug"><span className="text-teal mt-0.5 shrink-0">✓</span>{w}</li>)}</ul>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border border-teal/30 rounded-2xl overflow-hidden mb-8">
        <div className="bg-charcoal px-8 py-6 flex items-center justify-between gap-4">
          <div><p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-1">Based on your results</p><h3 className="font-serif text-xl text-white">{rec.service}</h3></div>
          {rec.price && <span className="shrink-0 text-sm text-white/50 border border-white/10 px-3 py-1.5 rounded-full">{rec.price}</span>}
        </div>
        <div className="bg-sand px-8 py-6">
          <p className="text-sm font-medium text-teal-dark italic mb-3">{rec.tagline}</p>
          <p className="text-sm text-charcoal-2 font-light leading-relaxed mb-6">{rec.why}</p>
          <a href={rec.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-teal text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-teal-dark transition-all">Learn more about {rec.service}<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        </div>
      </motion.div>
      {!submitted ? <LeadCapture tool={tool} results={results} onSubmitted={() => setSubmitted(true)} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-teal-light border border-teal/20 rounded-xl p-8 text-center mb-8">
          <p className="font-medium text-charcoal mb-1">Thank you — we will be in touch.</p>
          <p className="text-sm text-charcoal-3 font-light">A Simply Clear practitioner will review your results and respond within 24 hours.</p>
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <button onClick={onRestart} className="text-sm text-charcoal-3 border border-border px-6 py-2.5 rounded-lg hover:border-charcoal-3 hover:text-charcoal transition-all">Run this diagnostic again</button>
        <Link href="/" className="text-sm text-teal border border-teal/30 px-6 py-2.5 rounded-lg hover:bg-teal-light transition-all">Explore other diagnostics</Link>
      </div>
      <div className="mt-16 pt-8 border-t border-border text-center">
        <p className="text-charcoal-4 text-sm mb-2"><span className="font-serif italic">Simply Clear</span><span className="ml-2 text-xs font-medium tracking-widest uppercase">Adelaide, Australia</span></p>
        <p className="text-xs text-charcoal-4 font-light"><a href="mailto:clarify@simplyclear.work" className="hover:text-charcoal transition-colors">clarify@simplyclear.work</a><span className="mx-2">·</span><a href="tel:+61410720730" className="hover:text-charcoal transition-colors">+61 410 720 730</a></p>
      </div>
    </section>
  )
}
