'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TOOLS } from '@/lib/registry'
import type { Tool, Audience } from '@/lib/types'

const ENTERPRISE_FILTERS = [
  { id: 'all', label: 'All diagnostics' },
  { id: 'struggling', label: 'Already changing and struggling' },
  { id: 'preparing', label: 'About to change and preparing' },
  { id: 'portfolio', label: 'Managing too many changes at once' },
  { id: 'leadership', label: 'Leadership and sponsorship issues' },
  { id: 'communication', label: 'Communication and engagement issues' },
]

const SME_FILTERS = [
  { id: 'all', label: 'All diagnostics' },
  { id: 'communication', label: 'Team communication issues' },
  { id: 'overwhelm', label: 'Operational overwhelm' },
  { id: 'growth', label: 'Growing too fast' },
  { id: 'burnout', label: 'Staff burnout and confusion' },
  { id: 'customer', label: 'Customer experience inconsistency' },
  { id: 'leadership', label: 'Leadership and accountability gaps' },
]

function ToolIcon({ icon }: { icon: string }) {
  const s = { stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
  if (icon === 'pressure')     return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  if (icon === 'overload')     return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="14" height="4" rx="1"/><rect x="3" y="17" width="10" height="4" rx="1"/></svg>
  if (icon === 'sponsor')      return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
  if (icon === 'readiness')    return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
  if (icon === 'communication') return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  if (icon === 'people')       return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (icon === 'index')        return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M2 20h20M6 20V10M10 20V4M14 20v-8M18 20v-6"/></svg>
  if (icon === 'friction')     return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  if (icon === 'overwhelm')    return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
  if (icon === 'team')         return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (icon === 'energy')       return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  if (icon === 'simplicity')   return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  return <svg className="w-5 h-5" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/></svg>
}

function ToolCard({ tool, isSme }: { tool: Tool; isSme: boolean }) {
  const iconBg = isSme ? 'bg-amber/10 text-amber group-hover:bg-amber group-hover:text-white' : 'bg-teal-light text-teal group-hover:bg-teal group-hover:text-white'
  const border = isSme ? 'group-hover:border-amber' : 'group-hover:border-teal'
  const tag = isSme ? 'text-amber' : 'text-teal'
  return (
    <Link href={tool.slug} className="block h-full">
      <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className={`group flex flex-col border border-border rounded-xl p-6 h-full bg-white transition-all duration-200 hover:shadow-sm ${border}`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200 ${iconBg}`}><ToolIcon icon={tool.icon} /></div>
        <h3 className="font-serif text-lg text-charcoal mb-1 leading-tight">{tool.title}</h3>
        <p className={`text-xs font-medium mb-3 leading-snug ${tag}`}>{tool.tagline}</p>
        <p className="text-sm text-charcoal-3 font-light leading-relaxed flex-1">{tool.description}</p>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-1.5 mb-3">{tool.outputs.slice(0,3).map(o => <span key={o} className="text-[11px] bg-[#F5F4F1] text-charcoal-3 px-2 py-0.5 rounded-full">{o}</span>)}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-4">{tool.timeEstimate} · {tool.questionCount} questions</span>
            <span className={`text-xs font-medium ${tag}`}>Start →</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function HubPage() {
  const [audience, setAudience] = useState<Audience | null>(null)
  const [filter, setFilter] = useState('all')

  const enterpriseTools = TOOLS.filter(t => t.audience === 'enterprise')
  const smeTools = TOOLS.filter(t => t.audience === 'sme')

  const visibleTools = audience === 'enterprise'
    ? filter === 'all' ? enterpriseTools : enterpriseTools.filter(t => t.enterpriseFilters?.includes(filter))
    : audience === 'sme'
    ? filter === 'all' ? smeTools : smeTools.filter(t => t.smeFilters?.includes(filter))
    : []

  const filters = audience === 'enterprise' ? ENTERPRISE_FILTERS : SME_FILTERS

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-teal-light text-teal-dark text-[11px] font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-8 border border-teal/20">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />Simply Clear™ · Clarity Suite
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.1] tracking-tight text-charcoal max-w-3xl mx-auto mb-5">
          Practical business intelligence. No jargon.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-charcoal-3 text-lg font-light max-w-xl mx-auto mb-4 leading-relaxed">
          Free diagnostics for leaders navigating enterprise transformation and small business complexity. No account. No noise. Just honest answers.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-sm text-charcoal-4 font-light italic">Adaptation, not adoption.</motion.p>
      </section>

      {/* Audience selector */}
      <section className="px-6 py-14 max-w-5xl mx-auto">
        <p className="text-sm font-medium tracking-widest uppercase text-teal text-center mb-8">Where are you right now?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          <button onClick={() => { setAudience('enterprise'); setFilter('all') }}
            className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${audience === 'enterprise' ? 'border-teal bg-teal-light' : 'border-border bg-white hover:border-teal hover:bg-teal-light/50'}`}>
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-1">Enterprise and transformation</h3>
            <p className="text-sm text-charcoal-3 font-light leading-snug">Navigating significant organisational change — technology, operating model, culture, or people.</p>
            <p className="text-xs text-charcoal-4 mt-3">7 diagnostics · 5–15 min each</p>
          </button>
          <button onClick={() => { setAudience('sme'); setFilter('all') }}
            className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${audience === 'sme' ? 'border-amber bg-amber/5' : 'border-border bg-white hover:border-amber hover:bg-amber/5'}`}>
            <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-1">Small business and leadership</h3>
            <p className="text-sm text-charcoal-3 font-light leading-snug">Running a growing business and dealing with friction, overwhelm, team clarity, or operational drag.</p>
            <p className="text-xs text-charcoal-4 mt-3">5 diagnostics · 5–7 min each</p>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {audience && (
            <motion.div key={audience} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="text-xs font-medium tracking-widest uppercase text-charcoal-4 mb-3 text-center">Narrow it down</p>
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {filters.map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border ${filter === f.id ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-charcoal-3 border-border hover:border-charcoal hover:text-charcoal'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Tool grid */}
      <AnimatePresence mode="wait">
        {audience && (
          <motion.section key={`${audience}-${filter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-16 max-w-5xl mx-auto">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTools.map(tool => <ToolCard key={tool.id} tool={tool} isSme={audience === 'sme'} />)}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {!audience && (
        <div className="text-center py-8 text-charcoal-4 text-sm font-light">Select an audience above to see the right diagnostics for your situation.</div>
      )}

      {/* Footer */}
      <section className="bg-sand border-t border-border px-6 py-16 text-center mt-8">
        <h2 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] tracking-tight text-charcoal mb-3">Join Brevity</h2>
        <p className="text-charcoal-3 font-light max-w-sm mx-auto mb-8 leading-relaxed">Short, honest thinking for leaders navigating significant change. No jargon. Delivered when we have something worth saying.</p>
        <a href="https://simplyclear.substack.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-teal text-white text-sm font-medium px-8 py-3.5 rounded-lg hover:bg-teal-dark transition-all mb-10">
          Subscribe to Brevity<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div className="border-t border-border pt-8">
          <p className="text-charcoal-4 text-sm mb-2"><span className="font-serif italic">Simply Clear</span><span className="ml-2 text-xs font-medium tracking-widest uppercase">Adelaide, Australia</span></p>
          <p className="text-xs text-charcoal-4 font-light"><a href="mailto:clarify@simplyclear.work" className="hover:text-charcoal transition-colors">clarify@simplyclear.work</a><span className="mx-2">·</span><a href="tel:+61410720730" className="hover:text-charcoal transition-colors">+61 410 720 730</a></p>
        </div>
      </section>
    </main>
  )
}
