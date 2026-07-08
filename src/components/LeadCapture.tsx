'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Tool, Results } from '@/lib/types'

const FORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScNcNBGFupO4eUabIgOid2erEDHQUnTOqyiwsI_R01QlJo-zw/formResponse'

const ENTRY = {
  name:          'entry.2144338297',
  email:         'entry.536208220',
  state:         'entry.1168838617',
  phone:         'entry.158059863',
  company:       'entry.1800719128',
  diagnostic:    'entry.1718516200',
  score:         'entry.1892288830',
  rating:        'entry.804884812',
  pressureAreas: 'entry.456961479',
}

interface Props { tool: Tool; results: Results; onSubmitted: () => void }

export function LeadCapture({ tool, results, onSubmitted }: Props) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [state, setState]     = useState('')
  const [phone, setPhone]     = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus]   = useState<'idle'|'submitting'|'error'>('idle')
  const [err, setErr]         = useState(false)

  function submit() {
    if (!name.trim() || !email.trim()) { setErr(true); return }
    setErr(false)
    setStatus('submitting')

    const pressureSummary = results.pressureAreas.slice(0, 3).join(' | ')

    const iframe = document.createElement('iframe')
    iframe.name = 'lc_submit_frame'
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const form = document.createElement('form')
    form.action = FORM_ACTION
    form.method = 'POST'
    form.target = 'lc_submit_frame'

    const fields: Record<string, string> = {
      [ENTRY.name]:          name.trim(),
      [ENTRY.email]:         email.trim(),
      [ENTRY.state]:         state,
      [ENTRY.company]:       company.trim(),
      [ENTRY.diagnostic]:    tool.title,
      [ENTRY.score]:         `${results.overallScore}/100`,
      [ENTRY.rating]:        results.rating,
      [ENTRY.pressureAreas]: pressureSummary,
      'fvv': '1',
    }
    if (phone.trim()) fields[ENTRY.phone] = phone.trim()

    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = k
      input.value = v
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()

    setTimeout(() => {
      document.body.removeChild(form)
      document.body.removeChild(iframe)
    }, 2000)

    onSubmitted()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border border-border rounded-2xl overflow-hidden mb-8">
      <div className="bg-charcoal px-8 py-5">
        <p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-1">Want to talk through this?</p>
        <h3 className="font-serif text-lg text-white">A Simply Clear practitioner will review your results and respond within 24 hours.</h3>
      </div>
      <div className="p-8 bg-sand">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Your name <span className="text-charcoal-4 font-light">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First and last name" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Work email <span className="text-charcoal-4 font-light">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organisation.com" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-charcoal-3 mb-1.5">State <span className="text-charcoal-4 font-light">(optional)</span></label>
            <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors appearance-none">
              <option value="">Choose</option>
              <option>NSW</option><option>VIC</option><option>QLD</option>
              <option>WA</option><option>SA</option><option>TAS</option>
              <option>ACT</option><option>NT</option><option>Overseas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Phone <span className="text-charcoal-4 font-light">(optional)</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+61 4xx xxx xxx" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Organisation <span className="text-charcoal-4 font-light">(optional)</span></label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Your organisation" className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-teal transition-colors" />
        </div>

        {err && <p className="text-xs text-[#C94040] mb-4">Please enter your name and email.</p>}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-charcoal-4 font-light max-w-xs">No automated emails. No sales sequence. Just a personal response from us.</p>
          <button onClick={submit} disabled={status === 'submitting'}
            className="shrink-0 bg-teal text-white text-sm font-medium px-7 py-3 rounded-lg hover:bg-teal-dark transition-all disabled:bg-border disabled:text-charcoal-4 disabled:cursor-not-allowed">
            {status === 'submitting' ? 'Sending...' : 'Send to Simply Clear'}
          </button>
        </div>
        {status === 'error' && <p className="text-xs text-[#C94040] mt-3">Something went wrong. Please email clarify@simplyclear.work</p>}
      </div>
    </motion.div>
  )
}
