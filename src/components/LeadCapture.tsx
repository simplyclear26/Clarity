'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Tool, Results } from '@/lib/types'

const WEBHOOK = process.env.NEXT_PUBLIC_WEBHOOK_URL ?? ''

interface Props { tool: Tool; results: Results; onSubmitted: () => void }

export function LeadCapture({ tool, results, onSubmitted }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle'|'submitting'|'error'>('idle')
  async function submit() {
    if (!name || !email) return
    setStatus('submitting')
    try {
      await fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, organisation: org, notes, diagnostic: tool.title, score: `${results.overallScore}/100`, rating: results.rating, recommendedService: results.serviceRec.service, source: 'Clarity Suite v2' }) })
      onSubmitted()
    } catch { setStatus('error') }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border border-border rounded-2xl overflow-hidden mb-8">
      <div className="bg-charcoal px-8 py-5">
        <p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-1">Want to talk through this?</p>
        <h3 className="font-serif text-lg text-white">A Simply Clear practitioner will review your results and respond within 24 hours.</h3>
      </div>
      <div className="p-8 bg-sand">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-xs font-medium text-charcoal-3 mb-1.5">Your name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First and last name" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" /></div>
          <div><label className="block text-xs font-medium text-charcoal-3 mb-1.5">Work email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organisation.com" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" /></div>
        </div>
        <div className="mb-4"><label className="block text-xs font-medium text-charcoal-3 mb-1.5">Organisation <span className="font-normal text-charcoal-4">(optional)</span></label><input type="text" value={org} onChange={e => setOrg(e.target.value)} placeholder="Your organisation" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" /></div>
        <div className="mb-6"><label className="block text-xs font-medium text-charcoal-3 mb-1.5">Anything you want us to know? <span className="font-normal text-charcoal-4">(optional)</span></label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Context or what you most want to talk through..." className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors resize-none" /></div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-charcoal-4 font-light max-w-xs">No automated emails. No sales sequence. Just a personal response from us.</p>
          <button onClick={submit} disabled={!name || !email || status === 'submitting'} className="shrink-0 bg-teal text-white text-sm font-medium px-7 py-3 rounded-lg hover:bg-teal-dark transition-all disabled:bg-border disabled:text-charcoal-4 disabled:cursor-not-allowed">
            {status === 'submitting' ? 'Sending...' : 'Send to Simply Clear'}
          </button>
        </div>
        {status === 'error' && <p className="text-xs text-[#C94040] mt-3">Something went wrong. Please email clarify@simplyclear.work</p>}
      </div>
    </motion.div>
  )
}
