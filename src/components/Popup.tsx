'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScNcNBGFupO4eUabIgOid2erEDHQUnTOqyiwsI_R01QlJo-zw/formResponse'
const ENTRY = {
  name:  'entry.2144338297',
  email: 'entry.536208220',
  state: 'entry.1168838617',
  phone: 'entry.158059863',
}

export function Popup({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(false)
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('sc_done')) { onComplete(); return }
    setVisible(true)
  }, [onComplete])

  async function submit() {
    if (!name.trim() || !email.trim() || !state) { setErr(true); return }
    setErr(false)
    setStatus('submitting')
    const body = new URLSearchParams()
    body.append(ENTRY.name,  name.trim())
    body.append(ENTRY.email, email.trim())
    body.append(ENTRY.state, state)
    if (phone.trim()) body.append(ENTRY.phone, phone.trim())
    try {
      await fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
    } catch (_) {}
    setStatus('success')
  }

  function enter() {
    sessionStorage.setItem('sc_done', '1')
    setVisible(false)
    setTimeout(onComplete, 300)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(28,28,30,0.75)', backdropFilter: 'blur(4px)' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

          {status === 'success' ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-teal-light flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-charcoal mb-3">You are in. Let's go.</h3>
              <p className="text-sm text-charcoal-3 font-light leading-relaxed mb-8">
                Thank you — we will send you one email. Now explore the diagnostics.
              </p>
              <button onClick={enter}
                className="inline-flex items-center gap-2 bg-charcoal text-white text-sm font-medium px-8 py-3.5 rounded-lg hover:bg-charcoal-2 transition-all">
                Explore the Clarity Suite
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          ) : (
            <>
              <div className="bg-charcoal px-8 py-7">
                <p className="text-xs font-medium tracking-widest uppercase text-white/40 mb-2">Simply Clear · Clarity Suite</p>
                <h2 className="font-serif text-xl text-white leading-snug">Before you begin — a quick hello.</h2>
              </div>

              <div className="px-8 py-6">
                <p className="text-sm text-charcoal-3 font-light leading-relaxed mb-6 pb-5 border-b border-border">
                  We're glad you're here. This is completely free, but we'd like to know who our users are. We'll send you one email — and that's it. No spam, no sharing your information. We hate that as much as you do.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Name <span className="text-charcoal-4 font-light">*</span></label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                      className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-teal transition-colors bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Email <span className="text-charcoal-4 font-light">*</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-teal transition-colors bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-3 mb-1.5">State <span className="text-charcoal-4 font-light">*</span></label>
                    <select value={state} onChange={e => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-teal transition-colors bg-white appearance-none">
                      <option value="">Choose</option>
                      <option>NSW</option><option>VIC</option><option>QLD</option>
                      <option>WA</option><option>SA</option><option>TAS</option>
                      <option>ACT</option><option>NT</option><option>Overseas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-3 mb-1.5">Phone <span className="text-charcoal-4 font-light">(optional)</span></label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+61 4xx xxx xxx"
                      className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-teal transition-colors bg-white" />
                  </div>
                </div>

                {err && <p className="text-xs text-[#C94040] mb-3">Please fill in your name, email, and state.</p>}

                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-charcoal-4 font-light max-w-[160px] leading-relaxed">No automated emails. No sales sequence.</p>
                  <button onClick={submit} disabled={status === 'submitting'}
                    className="inline-flex items-center gap-2 bg-teal text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-teal-dark transition-all disabled:bg-border disabled:text-charcoal-4 disabled:cursor-not-allowed shrink-0">
                    {status === 'submitting' ? 'Submitting...' : 'Enter the Suite'}
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
