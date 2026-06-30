import type { Rating, ServiceRec } from './types'

export function avg(answers: Record<string, string>, ids: string[]): number {
  const vals = ids.map(id => {
    const v = answers[id]
    if (!v || v === 'unsure') return null
    return parseFloat(v)
  }).filter((v): v is number => v !== null)
  if (vals.length === 0) return 3
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function toScore(raw: number, max = 5): number {
  return Math.round(Math.min(100, (raw / max) * 100))
}

export function countUnsure(answers: Record<string, string>): number {
  return Object.values(answers).filter(v => v === 'unsure').length
}

export function getRating(score: number): Rating {
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Adequate'
  if (score >= 30) return 'At risk'
  return 'Critical'
}

export function scoreColor(score: number): string {
  if (score >= 70) return '#2AB8A0'
  if (score >= 50) return '#F0A500'
  if (score >= 30) return '#C9895A'
  return '#C94040'
}

export function get(answers: Record<string, string>, id: string): number {
  const v = answers[id]
  if (!v || v === 'unsure') return 3
  return parseFloat(v)
}

const ESSENTIALS: ServiceRec = {
  service: 'Simply Clear Essentials™',
  tagline: 'Clear thinking, the right framework, and a trusted guide — without the overhead.',
  why: '',
  timeframe: '4 sessions',
  url: 'https://www.simplyclear.work/how-we-work',
}

const RETAINER: ServiceRec = {
  service: 'Monthly Advisory Retainer',
  tagline: 'Ongoing support for businesses navigating complexity, growth, or operational pressure.',
  why: '',
  timeframe: 'Minimum 3 months',
  url: 'https://www.simplyclear.work/how-we-work',
  price: '$2,750/month',
}

const SOLUTION: ServiceRec = {
  service: 'Simply Clear Solution™',
  tagline: 'A comprehensive transformation diagnostic. Five deliverables. One honest report.',
  why: '',
  timeframe: '30 min + 60-min debrief',
  url: 'https://solutions.simplyclear.work',
  price: '$997',
}

export function getServiceRec(audience: string, score: number, rating: string, unsureCount: number, toolId: string): ServiceRec {
  if (audience === 'sme') {
    if (rating === 'Critical') return { ...RETAINER, why: 'What you are describing is systemic — multiple things reinforcing each other. Ongoing advisory support gives you a trusted thinking partner working alongside you monthly to simplify, align your team, and build clarity.' }
    if (rating === 'At risk') return { ...ESSENTIALS, why: 'There are real pressure points that would benefit from structured support. Simply Clear Essentials gives you four practical sessions, a diagnostic, a findings report, and a 90-day action plan.' }
    return { ...ESSENTIALS, why: 'Your business has real strengths. Simply Clear Essentials can help you build on those with a facilitated leadership session, a diagnostic, and a 90-day action plan.' }
  }
  if (unsureCount >= 4) return { ...SOLUTION, why: `You answered "not sure" to ${unsureCount} questions. That level of uncertainty about your own change is a significant risk signal. The Simply Clear Solution will surface what you do not yet know.` }
  if (rating === 'Critical') return { ...SOLUTION, why: 'The conditions across this assessment point to systemic challenges. The Simply Clear Solution gives you a risk register, 90-day plan, communication guide, and executive briefing built from your answers.' }
  if (rating === 'At risk') return { ...ESSENTIALS, why: 'There are meaningful gaps that need structured attention. Simply Clear Essentials gives you four sessions with a practitioner, a facilitated workshop, a full diagnostic, and a 90-day action plan.' }
  return { ...SOLUTION, why: 'The Simply Clear Solution will give you a comprehensive picture across all dimensions with specific recommendations built from your situation.' }
}
