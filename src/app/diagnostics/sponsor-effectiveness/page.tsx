'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getToolById } from '@/lib/registry'
const tool = getToolById('sponsor-effectiveness')!
export default function Page() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-teal mb-4">{tool.title}</p>
        <h1 className="font-serif text-3xl text-charcoal mb-4 tracking-tight">{tool.tagline}</h1>
        <p className="text-charcoal-3 font-light leading-relaxed mb-8">This diagnostic is available now on the current Clarity Suite. Click below to run it.</p>
        <a href={'https://clarity.simplyclear.work/diagnostics/sponsor-effectiveness'} className="inline-flex items-center gap-2 bg-teal text-white text-sm font-medium px-8 py-3.5 rounded-lg hover:bg-teal-dark transition-all">
          Run {tool.title}
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div className="mt-8"><Link href="/" className="text-sm text-charcoal-3 hover:text-charcoal transition-colors">← Back to all diagnostics</Link></div>
      </motion.div>
    </section>
  )
}
