// ONE types file. Used by everything. No duplicates.

export type Audience = 'enterprise' | 'sme'

export interface Tool {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  icon: string
  audience: Audience
  timeEstimate: string
  questionCount: number
  outputs: string[]
  enterpriseFilters?: string[]
  smeFilters?: string[]
}

export interface Option {
  val: string
  label: string
  sub?: string
}

export interface Step {
  id: string
  question: string
  hint?: string
  type: 'seg' | 'text'
  cols?: 2 | 4
  options?: Option[]
}

export type Rating = 'Strong' | 'Adequate' | 'At risk' | 'Critical'

export interface ServiceRec {
  service: string
  tagline: string
  why: string
  timeframe: string
  url: string
  price?: string
}

export interface Results {
  toolId: string
  audience: Audience
  overallScore: number
  rating: Rating
  ratingDescription: string
  dimensionScores?: Record<string, number>
  strengths: string[]
  pressureAreas: string[]
  recommendations: string[]
  whatGoodLooksLike: string[]
  unsureCount: number
  serviceRec: ServiceRec
}
