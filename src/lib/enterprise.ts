// ─── Enterprise diagnostic scoring for Clarity Suite v2 ──────────────────
// Adapts old simply-clear-cpi scoring to v2 Results format
// One file covers all 6 enterprise tools

import type { Results } from '@/lib/types'

// ─── Shared utilities ──────────────────────────────────────────────────────

function getStr(answers: Record<string, string>, id: string): string {
  return answers[id] ?? ''
}

function getInt(answers: Record<string, string>, id: string): number {
  return parseInt(answers[id] ?? '1', 10)
}

function countUnsureStr(answers: Record<string, string>, keys: string[]): number {
  return keys.filter(k => answers[k] === 'unsure').length
}

function countUnsureInt(answers: Record<string, string>): number {
  return Object.values(answers).filter(v => v === '0').length
}

function toRating(score: number): 'Strong' | 'Adequate' | 'At risk' | 'Critical' {
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Adequate'
  if (score >= 30) return 'At risk'
  return 'Critical'
}

// ─── 1. CHANGE PRESSURE INDEX ─────────────────────────────────────────────

const COMPLEXITY_MAP: Record<string, number> = { low: 1, moderate: 2, high: 3, severe: 4, unsure: 4 }
const TIMELINE_MAP:   Record<string, number> = { relaxed: 1, moderate: 2, aggressive: 3, critical: 4, unsure: 4 }
const LEADER_MAP_CPI: Record<string, number> = { strong: 1, moderate: 2, weak: 3, fragmented: 4, unsure: 4 }
const TECH_MAP:       Record<string, number> = { minimal: 1, moderate: 2, significant: 3, enterprise: 4, unsure: 4 }
const FATIGUE_MAP_CPI:Record<string, number> = { low: 1, moderate: 2, high: 3, extreme: 4, unsure: 4 }
const TRAINING_MAP:   Record<string, number> = { minimal: 1, moderate: 2, extensive: 3, critical: 4, unsure: 4 }
const GEO_MAP:        Record<string, number> = { single: 1, multi: 2, national: 3, global: 4 }
const EMP_MAP:        Record<string, number> = { u50: 1, '50-250': 2, '250-1000': 3, '1000-5000': 4, '5000p': 5 }
const WORKFORCE_MAP:  Record<string, number> = { office: 1, mixed: 2, frontline: 3 }

export function scoreChangePressure(answers: Record<string, string>): Results {
  const c    = COMPLEXITY_MAP[answers.complexity ?? 'moderate']
  const t    = TIMELINE_MAP[answers.timeline ?? 'moderate']
  const l    = LEADER_MAP_CPI[answers.leadership ?? 'moderate']
  const tech = TECH_MAP[answers.technology ?? 'moderate']
  const f    = FATIGUE_MAP_CPI[answers.fatigue ?? 'moderate']
  const tr   = TRAINING_MAP[answers.training ?? 'moderate']
  const g    = GEO_MAP[answers.geography ?? 'multi']
  const e    = EMP_MAP[answers.employees ?? '250-1000']
  const w    = WORKFORCE_MAP[answers.workforce ?? 'mixed']
  const unsureCount = countUnsureStr(answers, ['complexity','timeline','leadership','technology','fatigue','training'])

  const pressureRaw = (c/4)*25 + (l/4)*20 + (t/4)*15 + (f/4)*15 + (tr/4)*10 + (tech/4)*10 + (g/4)*5
  const pressureScore = Math.round(Math.min(100, pressureRaw))
  const readinessRaw = ((5-l)/4)*35 + ((5-f)/4)*25 + ((5-t)/4)*20 + ((5-c)/4)*20
  const readinessScore = Math.round(Math.min(100, readinessRaw))
  const compositeRisk = (pressureScore + (100 - readinessScore)) / 2
  const overallScore = Math.round(100 - compositeRisk)
  const rating = toRating(overallScore)

  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []

  if (l <= 2) strengths.push('Leadership capacity is present to support this change')
  if (f <= 2) strengths.push('Change fatigue is not a significant factor right now')
  if (c <= 2) strengths.push('Change complexity is at a manageable level')

  if (l >= 3 && t >= 3) pressureAreas.push('Tight deadline with leaders who are not fully committed — one of the most common reasons change fails')
  else if (l >= 3) pressureAreas.push('Leaders need to move beyond awareness to visible, active support')
  else if (t >= 3) pressureAreas.push('The timeline is creating real pressure — people will cut corners on learning')
  if (f >= 3) pressureAreas.push('Change fatigue is present — people have been through a lot already')
  if (w === 3 && c >= 3) pressureAreas.push('Frontline workers going through major change need support that meets them where they work')
  if (tech >= 3) pressureAreas.push('Learning new technology alongside a new way of working compounds the pressure significantly')
  if (g >= 3) pressureAreas.push('Multi-location complexity makes consistent communication harder and more critical')
  if (unsureCount >= 3) pressureAreas.push(`${unsureCount} areas where you were unsure — starting significant change without this clarity is a real risk`)

  if (l >= 3) recommendations.push('Get leaders genuinely committed, not just informed — they need to be seen supporting this change actively')
  if (t >= 3) recommendations.push('Build in deliberate time for people to practise and adjust — even small pockets make a real difference')
  if (f >= 3) recommendations.push('Name the fatigue openly and honestly — leaders who acknowledge it build more trust than those who ignore it')
  if (tech >= 3) recommendations.push('Phase the rollout where possible, or invest in peer supporters who can help on the job')
  if (g >= 3) recommendations.push('Invest in local change champions who can carry the message and provide hands-on support')
  if (c >= 4 || rating === 'Critical') recommendations.push('Getting specialist change management support is likely the difference between this landing well and quietly failing')

  const ratingDescription =
    overallScore >= 70 ? 'The conditions for this change look generally favourable. Keep communication clear, leadership visible, and check in with your people regularly.' :
    overallScore >= 50 ? 'Some risk factors are present. A structured approach and visible leadership support will be important to keep people on board.' :
    overallScore >= 30 ? 'Multiple things could go wrong here. This change needs dedicated support, clear ownership, and proactive attention.' :
    'The conditions for this change are seriously challenging. Without direct intervention, the risk of people not adopting this change is very high.'

  return {
    toolId: 'change-pressure', audience: 'enterprise', overallScore, rating, ratingDescription,
    dimensionScores: { Pressure: pressureScore, Readiness: readinessScore },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: [
      'Leaders are visibly committed and regularly communicate in their own words',
      'The timeline allows for real learning, not just going live',
      'People can raise concerns without fear and get genuine responses',
      'A dedicated change resource is protecting the human side of delivery',
    ],
    unsureCount,
    serviceRec: { service: '', tagline: '', why: '', timeframe: '', url: '' },
  }
}

// ─── 2. INITIATIVE OVERLOAD ────────────────────────────────────────────────

const INITIATIVE_MAP: Record<string, number> = { '1-2': 1, '3-5': 2, '6-10': 3, '10p': 4, unsure: 4 }
const OVERLAP_MAP:    Record<string, number> = { low: 1, moderate: 2, high: 3, severe: 4, unsure: 4 }
const CADENCE_MAP:    Record<string, number> = { steady: 1, increasing: 2, rapid: 3, overwhelming: 4, unsure: 4 }
const RESOURCE_MAP:   Record<string, number> = { well_resourced: 1, adequate: 2, stretched: 3, minimal: 4, unsure: 4 }
const PRIORITY_MAP:   Record<string, number> = { clear: 1, mostly: 2, unclear: 3, none: 4, unsure: 4 }
const FATIGUE_MAP_OL: Record<string, number> = { none: 1, emerging: 2, present: 3, severe: 4, unsure: 4 }
const LEADER_MAP_OL:  Record<string, number> = { ample: 1, moderate: 2, limited: 3, depleted: 4, unsure: 4 }
const BENEFITS_MAP:   Record<string, number> = { consistently: 1, mostly: 2, mixed: 3, rarely: 4, unsure: 4 }
const SEQUENCE_MAP:   Record<string, number> = { deliberate: 1, somewhat: 2, reactive: 3, not_at_all: 4, unsure: 4 }
const STOPSTART_MAP:  Record<string, number> = { rarely: 1, sometimes: 2, frequently: 3, constantly: 4, unsure: 4 }
const MEASURE_MAP:    Record<string, number> = { robust: 1, partial: 2, limited: 3, not_at_all: 4, unsure: 4 }
const HONEST_MAP_OL:  Record<string, number> = { strong: 1, adequate: 2, strained: 3, exhausted: 4, unsure: 4 }

export function scoreInitiativeOverload(answers: Record<string, string>): Results {
  const i   = INITIATIVE_MAP[answers.active_initiatives] ?? 2
  const o   = OVERLAP_MAP[answers.workforce_overlap] ?? 2
  const cad = CADENCE_MAP[answers.delivery_cadence] ?? 2
  const res = RESOURCE_MAP[answers.change_resources] ?? 2
  const pri = PRIORITY_MAP[answers.prioritisation] ?? 2
  const fat = FATIGUE_MAP_OL[answers.fatigue_signals] ?? 2
  const lea = LEADER_MAP_OL[answers.leadership_bandwidth] ?? 2
  const ben = BENEFITS_MAP[answers.benefits_realisation] ?? 2
  const seq = SEQUENCE_MAP[answers.sequencing] ?? 2
  const ss  = STOPSTART_MAP[answers.stop_start] ?? 2
  const mea = MEASURE_MAP[answers.measurement] ?? 2
  const hon = HONEST_MAP_OL[answers.honest_assessment] ?? 2
  const unsureCount = Object.values(answers).filter(v => v === 'unsure').length

  const raw = (hon/4)*15 + (fat/4)*12 + (o/4)*12 + (lea/4)*10 + (i/4)*10 + (res/4)*10 + (seq/4)*8 + (cad/4)*8 + (ss/4)*7 + (pri/4)*5 + (ben/4)*3
  const overloadScore = Math.round(Math.min(100, raw))
  const overallScore = Math.max(0, 100 - overloadScore)
  const rating = toRating(overallScore)
  const bandwidthRemaining = Math.max(0, Math.round(100 - overloadScore * 0.9))

  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []

  if (seq <= 2) strengths.push('Change sequencing is being actively managed')
  if (fat <= 2) strengths.push('Change fatigue is not yet a significant problem')
  if (ben <= 2) strengths.push('Changes are landing and sticking when they go live')

  if (o >= 3) pressureAreas.push('Too many people dealing with multiple changes at once — the single biggest cause of change burnout')
  if (pri >= 3) pressureAreas.push('No clear priority order — people waste energy trying to figure out what matters most')
  if (fat >= 3) pressureAreas.push('Change fatigue is real and visible in your organisation')
  if (lea >= 3) pressureAreas.push('Leaders stretched too thin to properly sponsor all active changes')
  if (seq >= 3) pressureAreas.push('No one managing when changes land — timing is driven by project deadlines, not people capacity')
  if (ss >= 3)  pressureAreas.push('Pattern of changes stalling or not reaching completion')
  if (ben >= 3) pressureAreas.push('Changes go live but people revert to old ways')

  if (overloadScore >= 55 || overloadScore >= 75) recommendations.push('Do a portfolio review — lay out all active changes, map them against actual workforce capacity, and decide what to stop, slow, or continue')
  if (pri >= 3) recommendations.push('Set a visible priority order and communicate it — when everything is urgent, nothing is')
  if (seq >= 3) recommendations.push('Assign someone to own the change calendar — even staggering go-live dates by 6–8 weeks reduces pressure significantly')
  if (res >= 3) recommendations.push('One dedicated change professional per major initiative outperforms one person split across four projects')
  if (fat >= 3) recommendations.push('Name the fatigue openly — leaders who acknowledge it and explain what is stopping as well as starting build more trust')
  if (lea >= 3) recommendations.push('Fewer, better-sponsored changes almost always outperform a large under-sponsored portfolio')

  const seqRiskRaw = (seq + pri + ss) / 3
  const seqRiskLabel = seqRiskRaw < 1.8 ? 'Low' : seqRiskRaw < 2.5 ? 'Moderate' : seqRiskRaw < 3.3 ? 'High' : 'Severe'

  return {
    toolId: 'initiative-overload', audience: 'enterprise', overallScore, rating,
    ratingDescription:
      overallScore >= 70 ? 'Your change portfolio looks well managed and within what your organisation can handle.' :
      overallScore >= 50 ? `Your portfolio is stretched but manageable. Bandwidth remaining: approximately ${bandwidthRemaining}%. Staying deliberate about sequencing will help.` :
      overallScore >= 30 ? `Your organisation is carrying more change than it can comfortably absorb. Bandwidth remaining: approximately ${bandwidthRemaining}%. A deliberate portfolio review is recommended.` :
      'Your organisation is at or beyond its capacity to handle change. Continuing without intervention will result in failure, disengagement, and value loss.',
    dimensionScores: { 'Overload score': overloadScore, 'Bandwidth remaining': bandwidthRemaining, 'Sequencing risk': seqRiskRaw <= 1.8 ? 20 : seqRiskRaw <= 2.5 ? 45 : seqRiskRaw <= 3.3 ? 70 : 90 },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: [
      'Someone owns the change calendar and protects people from being overwhelmed',
      'There is a clear priority order everyone can name',
      'Changes are resourced properly before they launch',
      'Leadership capacity is matched to the number of active initiatives',
      'Changes that go live are tracked for real adoption, not just go-live',
    ],
    unsureCount,
    serviceRec: { service: '', tagline: '', why: '', timeframe: '', url: '' },
  }
}

// ─── 3. SPONSOR HEALTH CHECK ──────────────────────────────────────────────

export function scoreSponsorEffectiveness(answers: Record<string, string>): Results {
  const g = (id: string) => getInt(answers, id)
  const visScore  = Math.round(((g('vis_presence')   + g('vis_messages'))   / 8) * 100)
  const partScore = Math.round(((g('part_meetings')   + g('part_decisions')) / 8) * 100)
  const comScore  = Math.round(((g('com_why')         + g('com_listen'))     / 8) * 100)
  const coalScore = Math.round(((g('coal_peers')      + g('coal_managers'))  / 8) * 100)
  const resScore  = Math.round(((g('res_acknowledge') + g('res_address'))    / 8) * 100)
  const unsureCount = countUnsureInt(answers)

  const overallScore = Math.round(visScore*0.25 + partScore*0.20 + comScore*0.20 + coalScore*0.20 + resScore*0.15)
  const rating = toRating(overallScore)

  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []

  if (visScore >= 70)  strengths.push('Sponsor is visible and present to the people affected')
  if (partScore >= 70) strengths.push('Sponsor is actively participating in key moments and decisions')
  if (comScore >= 70)  strengths.push('Communication is clear and two-way dialogue is happening')
  if (coalScore >= 70) strengths.push('Coalition is being built with peers and managers are equipped')
  if (resScore >= 70)  strengths.push('Resistance is being acknowledged and blockers are being cleared')

  if (visScore < 55)  pressureAreas.push('Sponsor is not visible enough — people cannot see or hear from the leader behind this change')
  if (partScore < 55) pressureAreas.push('Sponsor is absent from key moments — decisions are stalling or being delegated inappropriately')
  if (comScore < 55)  pressureAreas.push('Communication is one-way or the "why" is not landing clearly')
  if (coalScore < 55) pressureAreas.push('Coalition is weak — other leaders are not visibly aligned and managers are not equipped')
  if (resScore < 55)  pressureAreas.push('Resistance is being avoided rather than addressed — problems are being left for the project team')

  if (visScore < 55)  recommendations.push('Get the sponsor into rooms with the people going through this change — informal conversations build more trust than any formal communication')
  if (partScore < 55) recommendations.push('Sponsors who attend key sessions and make decisions promptly send a clear message that this matters — absence sends the opposite')
  if (comScore < 55)  recommendations.push('The sponsor needs to explain the "why" in their own words, not sign off on what the comms team wrote — test it by asking someone to repeat it back')
  if (coalScore < 55) recommendations.push('Equip managers with talking points and real answers to the hard questions — the leader\'s message dies at the manager layer if managers are unprepared')
  if (resScore < 55)  recommendations.push('When the sponsor names the difficulty openly and steps in personally to clear blockers, it is one of the most effective sponsorship behaviours available')

  return {
    toolId: 'sponsor-effectiveness', audience: 'enterprise', overallScore, rating,
    ratingDescription:
      overallScore >= 75 ? 'Sponsorship is strong across all five dimensions. The leader is doing the work.' :
      overallScore >= 55 ? 'Sponsorship is adequate but has gaps that will compound under delivery pressure.' :
      overallScore >= 35 ? 'Sponsorship is at risk. Without targeted attention this will become a real problem for adoption.' :
      'Sponsorship is inadequate for what is being asked. This needs a direct conversation with the sponsor about the specific behaviours required.',
    dimensionScores: { Visibility: visScore, Participation: partScore, Communication: comScore, Coalition: coalScore, 'Resistance management': resScore },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: [
      'The sponsor is regularly seen and heard by people at all levels, not just in slide decks',
      'Decisions come quickly and clearly when the change needs them',
      'Other senior leaders are visibly aligned and managers know what to say',
      'The sponsor acknowledges difficulty openly and steps in personally to clear blockers',
    ],
    unsureCount,
    serviceRec: { service: '', tagline: '', why: '', timeframe: '', url: '' },
  }
}

// ─── 4. READINESS SCAN ────────────────────────────────────────────────────

export function scoreReadiness(answers: Record<string, string>): Results {
  const g = (id: string) => getInt(answers, id)
  const leadershipScore = Math.round(((g('lead_commitment') + g('lead_alignment') + g('lead_time')) / 12) * 100)
  const capabilityScore = Math.round(((g('cap_skills')      + g('cap_process'))    / 8) * 100)
  const cultureScore    = Math.round(((g('cult_trust')      + g('cult_voice')  + g('cult_pace')) / 12) * 100)
  const clarityScore    = Math.round(((g('clar_vision')     + g('clar_reason'))    / 8) * 100)
  const historyScore    = Math.round(((g('hist_track')      + g('hist_learning'))  / 8) * 100)
  const unsureCount     = countUnsureInt(answers)

  const overallScore = Math.round(leadershipScore*0.30 + cultureScore*0.25 + clarityScore*0.20 + capabilityScore*0.15 + historyScore*0.10)
  const rating = toRating(overallScore)

  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []

  if (leadershipScore >= 70)  strengths.push('Senior leaders are aligned, committed, and have capacity to lead this change')
  if (clarityScore >= 70)     strengths.push('There is a clear, simple picture of what this change looks like when it is done')
  if (cultureScore >= 70)     strengths.push('The culture is open and people feel safe raising concerns')
  if (capabilityScore >= 70)  strengths.push('The organisation has the skills and process to deliver change well')
  if (historyScore >= 70)     strengths.push('Previous changes have landed well and lessons are being applied')

  if (leadershipScore < 50) pressureAreas.push('Leadership is the weakest area — leaders need to get genuinely aligned, not just informed')
  if (clarityScore < 50)    pressureAreas.push('The end state is not clear enough for most people to picture and head toward')
  if (cultureScore < 50)    pressureAreas.push('The culture is not yet in a position to make this easy — trust and psychological safety need attention')
  if (capabilityScore < 50) pressureAreas.push('There is a real gap in change management capability that will show under delivery pressure')
  if (historyScore < 50)    pressureAreas.push('Your change history is working against you — people will come in with lower trust and higher scepticism')

  if (leadershipScore < 50) recommendations.push('Have real conversations at the leadership level about the why — compliance is not alignment')
  if (clarityScore < 50)    recommendations.push('Write a one-paragraph description of what this change looks like when it is done that anyone could understand — test it with someone outside the project team')
  if (cultureScore < 50)    recommendations.push('Invest in building psychological safety before you launch — people who feel safe raising concerns surface problems early, when they can still be fixed')
  if (capabilityScore < 50) recommendations.push('Resolve the capability gap before you are under delivery pressure — either build it internally or bring in specialist support')
  if (historyScore < 50)    recommendations.push('Name your change history openly and explain what will be different this time — ignoring it does not make it go away')

  const profileLabel = overallScore >= 75 ? 'Ready to move' : overallScore >= 55 ? 'Mostly ready' : overallScore >= 35 ? 'Needs preparation' : 'Not yet ready'

  return {
    toolId: 'readiness-scan', audience: 'enterprise', overallScore, rating,
    ratingDescription:
      overallScore >= 75 ? 'Your organisation is in a strong position to move forward. Leadership is aligned, culture is open, and the picture is clear.' :
      overallScore >= 55 ? `Mostly ready — but there are gaps that will compound under delivery pressure. Profile: ${profileLabel}.` :
      overallScore >= 35 ? `Needs preparation before proceeding carries significant risk. Profile: ${profileLabel}.` :
      'The honest answer is that moving forward right now carries serious risk. Investing in preparation will produce better outcomes than managing the fallout later.',
    dimensionScores: { Leadership: leadershipScore, Capability: capabilityScore, Culture: cultureScore, Clarity: clarityScore, History: historyScore },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: [
      'Senior leaders tell the same story and have made this a genuine priority',
      'Anyone in the organisation can describe what this change looks like when it is done',
      'People raise concerns early and know they will be heard',
      'The organisation has a repeatable way of managing change and learns from previous ones',
    ],
    unsureCount,
    serviceRec: { service: '', tagline: '', why: '', timeframe: '', url: '' },
  }
}

// ─── 5. COMMUNICATION AUDIT ───────────────────────────────────────────────

export function scoreCommunication(answers: Record<string, string>): Results {
  const g = (id: string) => getInt(answers, id)
  const messageScore  = Math.round(((g('msg_clear') + g('msg_why') + g('msg_consistent')) / 12) * 100)
  const channelScore  = Math.round(((g('chan_right') + g('chan_frequency')) / 8) * 100)
  const dialogueScore = Math.round(((g('dial_questions') + g('dial_acted')) / 8) * 100)
  const audienceScore = Math.round(((g('aud_segment') + g('aud_managers') + g('aud_timing')) / 12) * 100)
  const unsureCount   = countUnsureInt(answers)

  const overallScore = Math.round(messageScore*0.30 + audienceScore*0.25 + dialogueScore*0.25 + channelScore*0.20)
  const rating = toRating(overallScore)

  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []

  if (messageScore >= 70)  strengths.push('The core message is clear, explains the why, and is being told consistently')
  if (dialogueScore >= 70) strengths.push('Real two-way dialogue is happening and feedback is being acted on')
  if (audienceScore >= 70) strengths.push('Communication is tailored for different groups and managers are equipped')
  if (channelScore >= 70)  strengths.push('The right channels are being used at the right frequency')

  if (g('msg_why') <= 2)        pressureAreas.push('Communication explains what is changing but not why — people support change they understand')
  if (g('msg_consistent') <= 2) pressureAreas.push('Inconsistent messages from different sources — people stop trusting the official version')
  if (g('chan_right') <= 2)     pressureAreas.push('Relying on channels that do not reach everyone — email does not work for frontline workers')
  if (g('chan_frequency') <= 2) pressureAreas.push('Not communicating frequently enough — silence creates rumour')
  if (g('dial_acted') <= 2)     pressureAreas.push('Feedback is being collected but not visibly acted on — performative listening is worse than no listening')
  if (g('aud_managers') <= 2)   pressureAreas.push('Managers are informed but not equipped for real conversations with their teams')
  if (g('aud_timing') <= 2)     pressureAreas.push('People are finding out too late — rumour is getting there before official communication')

  if (messageScore < 55)  recommendations.push('Start with the "why" — a clear, honest reason that connects to the real experience of the people going through it, then test it by asking someone to repeat it back')
  if (audienceScore < 55) recommendations.push('Prepare managers for real conversations, not just information relay — the leader\'s message dies at the manager layer if managers cannot answer the hard questions')
  if (dialogueScore < 55) recommendations.push('Create a visible mechanism for questions and concerns and be seen to act on what comes back — this turns sceptics into advocates more reliably than any campaign')
  if (channelScore < 55)  recommendations.push('Meet your people where they are — if a significant part of your workforce does not sit at a desk, email is not your primary channel')

  return {
    toolId: 'communication-clarity', audience: 'enterprise', overallScore, rating,
    ratingDescription:
      overallScore >= 75 ? 'Communication is working well. Keep the cadence up and maintain the dialogue as the change moves through its phases.' :
      overallScore >= 55 ? 'Communication is adequate but has meaningful gaps that will affect adoption if left unaddressed.' :
      overallScore >= 35 ? 'There are significant gaps in how this change is being communicated — people cannot support what they do not understand.' :
      'Communication is a critical failure point. People cannot support a change they do not understand and cannot trust a change they hear about inconsistently.',
    dimensionScores: { Message: messageScore, Channels: channelScore, Dialogue: dialogueScore, Audience: audienceScore },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: [
      'Anyone on the front line can explain what the change is about and why it is happening',
      'The same story is told consistently by everyone in leadership',
      'People know exactly when to expect the next update and have a way to ask questions',
      'Managers can hold real conversations with their teams, not just relay information',
    ],
    unsureCount,
    serviceRec: { service: '', tagline: '', why: '', timeframe: '', url: '' },
  }
}

// ─── 6. PEOPLE IMPACT ─────────────────────────────────────────────────────

export function scorePeopleImpact(answers: Record<string, string>): Results {
  const g = (id: string) => getInt(answers, id)
  const scaleScore   = Math.round(((g('scale_reach') + g('scale_roles')) / 8) * 100)
  const depthScore   = Math.round(((g('depth_jobs') + g('depth_identity') + g('depth_workload')) / 12) * 100)
  const vulnScore    = Math.round(((g('vuln_groups') + g('vuln_jobs_at_risk')) / 8) * 100)
  const suppRaw      = (g('supp_plan') + g('supp_managers')) / 8
  const supportScore = Math.round((1 - suppRaw) * 100)
  const unsureCount  = countUnsureInt(answers)

  const impactRaw    = Math.round(scaleScore*0.25 + depthScore*0.35 + vulnScore*0.25 + (100 - supportScore)*0.15)
  const overallScore = Math.max(0, 100 - impactRaw)
  const rating       = toRating(overallScore)

  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []

  if (supportScore >= 70)  strengths.push('A clear support plan is in place and managers are ready')
  if (vulnScore <= 40)     strengths.push('Vulnerable groups have been identified and planned for')
  if (depthScore <= 40)    strengths.push('The depth of impact is manageable — roles and identity are relatively stable')

  if (g('depth_identity') >= 3)    pressureAreas.push('Professional identity is being challenged for a significant group — resistance will run deeper than normal')
  if (g('vuln_groups') >= 3)       pressureAreas.push('Vulnerable groups have not been properly identified or planned for')
  if (g('vuln_jobs_at_risk') >= 3) pressureAreas.push('Job security concerns are present — silence amplifies fear')
  if (g('depth_workload') >= 3)    pressureAreas.push('People will be doing their current job and learning the new way simultaneously — the "double burden" is one of the most underestimated causes of change failure')
  if (g('scale_roles') <= 2)       pressureAreas.push('Multiple roles are affected differently but are being treated as one group')
  if (g('supp_managers') <= 2)     pressureAreas.push('Managers are not prepared to support their teams through this change')

  if (depthScore >= 60)            recommendations.push('When jobs are actually changing, not just tools, people need time to practise, space to make mistakes, and someone they trust to ask questions of — build that in deliberately')
  if (g('depth_workload') >= 3)    recommendations.push('Even partial capacity relief during transition — reducing non-essential work — makes a measurable difference to how well the change lands')
  if (g('depth_identity') >= 3)    recommendations.push('Acknowledge what people are letting go of, not just what they are gaining — change that challenges professional identity needs a different conversation')
  if (vulnScore >= 55)             recommendations.push('Identify vulnerable groups by name, not just category, and create specific support for each — generic support plans miss the people who need it most')
  if (g('vuln_jobs_at_risk') >= 3) recommendations.push('Be as transparent as possible as early as possible about job impact — people assume the worst in a vacuum, and early transparency is both more ethical and more effective')
  if (supportScore < 50)           recommendations.push('Develop a people support plan covering who needs what, when, and from whom — this is the area most at risk')

  const impactLabel = impactRaw < 30 ? 'Low' : impactRaw < 55 ? 'Moderate' : impactRaw < 75 ? 'High' : 'Severe'

  return {
    toolId: 'people-impact', audience: 'enterprise', overallScore, rating,
    ratingDescription:
      impactRaw < 30 ? 'The human impact of this change is manageable. Keep your impact mapping current as delivery gets closer and the reality becomes clearer.' :
      impactRaw < 55 ? `People impact is moderate — ${impactLabel}. There are groups who need more attention than they are currently getting.` :
      impactRaw < 75 ? `People impact is high — ${impactLabel}. The organisations that navigate this well treat their people's experience as something to be designed carefully, not dealt with after the fact.` :
      `People impact is severe — ${impactLabel}. Getting a clear picture of who is affected, how, and what they need is the most important planning investment you can make right now.`,
    dimensionScores: { Scale: scaleScore, Depth: depthScore, Vulnerability: vulnScore, Support: supportScore },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: [
      'Impact has been mapped by role, not just by team',
      'Vulnerable groups are identified by name with specific support in place',
      'Capacity has been created during the transition period so people are not carrying two full loads',
      'Managers are equipped to have real conversations, not just pass on information',
      'Where jobs are at risk, people are being told as early as possible',
    ],
    unsureCount,
    serviceRec: { service: '', tagline: '', why: '', timeframe: '', url: '' },
  }
}

// ─── Steps for tools 2-6 (Change Pressure steps are in enterprise-steps.ts) ──

export const OVERLOAD_STEPS = [
  { id: 'active_initiatives', question: 'How many significant changes are running in your organisation right now?', hint: 'Count anything that requires your people to work differently, learn something new, or change how they use their time.', type: 'seg' as const, cols: 2 as const, options: [ { val: '1-2', label: '1 or 2', sub: 'Focused and manageable' }, { val: '3-5', label: '3 to 5', sub: 'A reasonable load' }, { val: '6-10', label: '6 to 10', sub: 'Starting to feel like a lot' }, { val: '10p', label: 'More than 10', sub: 'Hard to keep track' }, { val: 'unsure', label: "Not sure", sub: "We do not have a clear view of the full picture" } ] },
  { id: 'workforce_overlap', question: 'How many of your people are being asked to go through more than one change at the same time?', hint: 'This is the single biggest cause of change burnout.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'low', label: 'A small number', sub: 'Most changes affect different groups' }, { val: 'moderate', label: 'About a quarter to half', sub: 'There is some overlap' }, { val: 'high', label: 'More than half', sub: 'Significant overlap across the organisation' }, { val: 'severe', label: 'Almost everyone', sub: 'Nearly all our people are dealing with multiple changes' }, { val: 'unsure', label: "Not sure", sub: "We have not mapped this" } ] },
  { id: 'delivery_cadence', question: 'Has the pace of change been speeding up in your organisation?', hint: 'Think about the last 12 months. More launches, more projects, more asks, without necessarily more support.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'steady', label: 'Steady pace', sub: 'Consistent, no major acceleration' }, { val: 'increasing', label: 'Noticeably faster', sub: 'More change than a year ago' }, { val: 'rapid', label: 'Much faster', sub: 'The pace has really picked up' }, { val: 'overwhelming', label: 'Hard to keep up', sub: 'It feels relentless' }, { val: 'unsure', label: "Not sure", sub: "Hard to say" } ] },
  { id: 'change_resources', question: 'Do you have people whose main job is to help with change, not just project managers?', hint: 'Change management is a specific skill. Project managers run the project. Change people help your workforce actually shift.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'well_resourced', label: 'Yes, a dedicated team', sub: 'We have real change capability in place' }, { val: 'adequate', label: 'Mostly covered', sub: 'Reasonable coverage across the portfolio' }, { val: 'stretched', label: 'Spread too thin', sub: 'A few people trying to cover too much' }, { val: 'minimal', label: 'Not really', sub: 'Change is largely ad hoc or sitting with the project team' }, { val: 'unsure', label: "Not sure", sub: "Unclear who is responsible for this" } ] },
  { id: 'prioritisation', question: 'Does everyone know which changes matter most right now?', hint: 'When everything is top priority, nothing is.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'clear', label: 'Yes, very clearly', sub: 'Everyone understands what comes first' }, { val: 'mostly', label: 'Mostly', sub: 'There is some ambiguity at the edges' }, { val: 'unclear', label: 'Not really', sub: 'People frequently conflict over priorities' }, { val: 'none', label: 'No, everything is urgent', sub: 'No real priority order exists' }, { val: 'unsure', label: "Not sure", sub: "It varies depending on who you ask" } ] },
  { id: 'fatigue_signals', question: 'Are you seeing signs that your people are tired of change?', hint: 'Look for things like cynicism, people going through the motions, or quiet disengagement.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'none', label: 'Not that I can see', sub: 'People seem engaged and willing' }, { val: 'emerging', label: 'A few early signs', sub: 'Some grumbling or scepticism emerging' }, { val: 'present', label: 'Yes, noticeably', sub: 'Change fatigue is real and visible' }, { val: 'severe', label: 'It is a serious problem', sub: 'Active disengagement or resistance' }, { val: 'unsure', label: "Not sure", sub: "We have not really checked" } ] },
  { id: 'leadership_bandwidth', question: 'Do your senior leaders have the time and headspace to properly support all the changes running right now?', hint: 'A leader nominally sponsoring 5 or more major changes is not really sponsoring any of them.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'ample', label: 'Yes, comfortably', sub: 'Leaders are available and engaged' }, { val: 'moderate', label: 'Mostly', sub: 'Some constraints, but manageable' }, { val: 'limited', label: 'Not really', sub: 'Leaders are stretched across too many things' }, { val: 'depleted', label: 'No, they are overloaded', sub: 'Leadership capacity is a real problem' }, { val: 'unsure', label: "Not sure", sub: "Hard to assess from where I sit" } ] },
  { id: 'benefits_realisation', question: 'When you finish a change project, do people actually end up working in the new way?', hint: 'Going live is not the same as people adopting.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'consistently', label: 'Yes, consistently', sub: 'Changes stick and deliver what was promised' }, { val: 'mostly', label: 'Mostly', sub: 'More wins than misses' }, { val: 'mixed', label: 'Hit and miss', sub: 'Some land, some quietly fade away' }, { val: 'rarely', label: 'Rarely', sub: 'Old habits tend to come back' }, { val: 'unsure', label: "Not sure", sub: "We do not really track this" } ] },
  { id: 'sequencing', question: 'Is anyone deliberately managing when changes land, so they do not all hit at once?', hint: 'This means someone is looking at the whole picture and protecting your people from being overwhelmed.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'deliberate', label: 'Yes, actively managed', sub: 'Someone owns the change calendar and sequence' }, { val: 'somewhat', label: 'Somewhat', sub: 'We try, but it is not very structured' }, { val: 'reactive', label: 'Not really', sub: 'Timing is mostly driven by project deadlines' }, { val: 'not_at_all', label: 'No coordination at all', sub: 'Changes land whenever they are ready' }, { val: 'unsure', label: "Not sure", sub: "I am not aware of anyone doing this" } ] },
  { id: 'stop_start', question: 'Do your change projects tend to stall, pause, or quietly get shelved before they finish?', hint: 'Stop-start change is demoralising.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'rarely', label: 'Rarely', sub: 'We generally see changes through' }, { val: 'sometimes', label: 'Occasionally', sub: 'It happens but is not the norm' }, { val: 'frequently', label: 'Fairly often', sub: 'It is a recognised pattern' }, { val: 'constantly', label: 'All the time', sub: 'Very few changes actually reach completion' }, { val: 'unsure', label: "Not sure", sub: "Hard to say" } ] },
  { id: 'measurement', question: 'Do you actually measure whether people have adopted a change, or just whether the project went live?', hint: 'Going live and people actually working differently are two very different things.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'robust', label: 'Yes, we measure adoption', sub: 'We track whether people are actually working differently' }, { val: 'partial', label: 'Somewhat', sub: 'We track some things but not consistently' }, { val: 'limited', label: 'Not really', sub: 'Mostly we measure project milestones' }, { val: 'not_at_all', label: 'No', sub: 'Once it goes live, we move on' }, { val: 'unsure', label: "Not sure", sub: "I am not sure what we track" } ] },
  { id: 'honest_assessment', question: 'Honestly, how well do you think your organisation handles change right now?', hint: 'Your gut answer to this is usually the most accurate data point in the whole assessment.', type: 'seg' as const, cols: 2 as const, options: [ { val: 'strong', label: 'Really well', sub: 'We have a solid track record' }, { val: 'adequate', label: 'Reasonably well', sub: 'We manage, but we could be better' }, { val: 'strained', label: 'Not very well', sub: 'We struggle more often than we should' }, { val: 'exhausted', label: 'Poorly', sub: 'Change rarely goes as planned here' }, { val: 'unsure', label: "Not sure", sub: "Genuinely hard to say" } ] },
]

export const SPONSOR_STEPS = [
  { id: 'vis_presence', question: 'Can the people most affected by this change actually see and hear from the leader behind it?', hint: 'Not in a slide deck or an email — actually visible. In meetings, on the floor, in conversations.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very much so', sub: 'Regularly seen and heard by people at all levels' }, { val: '3', label: 'Mostly', sub: 'Present at key moments, if not always' }, { val: '2', label: 'Not really', sub: 'Visible at the start, but hard to find since' }, { val: '1', label: 'No', sub: 'People barely know who the sponsor is' }, { val: '0', label: "Not sure", sub: "Hard to say from where I sit" } ] },
  { id: 'vis_messages', question: 'Does the leader communicate about this change in their own words — not just forwarding updates from the project team?', hint: 'There is a big difference between a leader who talks about change personally and one who endorses what the comms team wrote.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, regularly', sub: 'Their own voice, consistent and personal' }, { val: '3', label: 'Sometimes', sub: 'At key milestones or when it matters most' }, { val: '2', label: 'Rarely', sub: 'Most communication is delegated to the project team' }, { val: '1', label: 'Never', sub: 'All communication comes from the project, not the leader' }, { val: '0', label: "Not sure", sub: "I am not sure what communication is coming from whom" } ] },
  { id: 'part_meetings', question: 'Does the leader show up to the important moments in this change — workshops, briefings, key decisions?', hint: 'Showing up means being present and engaged — not just opening a session and leaving.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, consistently', sub: 'Present and actively engaged' }, { val: '3', label: 'Usually', sub: 'Attends and contributes to most key sessions' }, { val: '2', label: 'Occasionally', sub: 'Attends when it is convenient' }, { val: '1', label: 'Rarely or never', sub: 'Largely absent from the change activity' }, { val: '0', label: "Not sure", sub: "I do not have visibility of this" } ] },
  { id: 'part_decisions', question: 'When the change needs a decision, does the leader make it promptly and clearly?', hint: 'Changes stall when decisions are delayed, sent back to the project team, or quietly avoided.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, decisively', sub: 'Decisions come quickly and clearly' }, { val: '3', label: 'Mostly', sub: 'Generally timely, with some delays' }, { val: '2', label: 'Slowly', sub: 'Decisions often take too long' }, { val: '1', label: 'Rarely', sub: 'Decisions frequently stall or get sent elsewhere' }, { val: '0', label: "Not sure", sub: "I do not have visibility of the decision process" } ] },
  { id: 'com_why', question: 'Does the leader clearly explain why this change is happening — not just what is changing?', hint: 'The why needs to be compelling and repeated. Saying it once at launch is not enough.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very clearly', sub: 'Compelling, consistent, and repeated regularly' }, { val: '3', label: 'Mostly clearly', sub: 'The message is there but could be stronger' }, { val: '2', label: 'Not consistently', sub: 'The message varies or has faded since launch' }, { val: '1', label: 'Not really', sub: 'People are unclear on why this is happening' }, { val: '0', label: "Not sure", sub: "Hard to assess" } ] },
  { id: 'com_listen', question: 'Does the leader create real space for people to ask questions, raise concerns, and push back?', hint: 'A town hall where questions are not really answered is not two-way communication.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, genuinely', sub: 'Regular forums with real dialogue and follow-through' }, { val: '3', label: 'Somewhat', sub: 'Some opportunity for input, but could be more genuine' }, { val: '2', label: 'Not much', sub: 'Mostly one-way — messages go out but not much comes back' }, { val: '1', label: 'No', sub: 'No real space for dialogue' }, { val: '0', label: "Not sure", sub: "I am not sure what forums exist" } ] },
  { id: 'coal_peers', question: 'Is the leader actively getting other senior leaders on board — not just informing them?', hint: 'One leader alone cannot carry a major change.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, actively', sub: 'Other leaders are visibly aligned and supporting' }, { val: '3', label: 'Somewhat', sub: 'Some peer engagement, but could be stronger' }, { val: '2', label: 'Not really', sub: 'Largely going it alone' }, { val: '1', label: 'No', sub: 'No visible effort to bring other leaders on board' }, { val: '0', label: "Not sure", sub: "Hard to see from where I am" } ] },
  { id: 'coal_managers', question: 'Are the managers who need to lead this change locally actually supported and equipped to do it?', hint: "The leader's message dies at the manager layer if managers don't know what to say or do.", type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, well supported', sub: 'Managers are equipped, briefed, and engaged' }, { val: '3', label: 'Mostly', sub: 'Generally informed, though support varies' }, { val: '2', label: 'Not consistently', sub: 'Some managers are well supported, others are not' }, { val: '1', label: 'No', sub: 'Managers have largely been left to figure it out' }, { val: '0', label: "Not sure", sub: "I do not know what support managers are getting" } ] },
  { id: 'res_acknowledge', question: 'Does the leader openly acknowledge that this change is hard — rather than glossing over concerns?', hint: 'When leaders name the difficulty, people feel heard. When they pretend everything is fine, people disengage.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, openly', sub: 'Names the difficulty and validates concerns publicly' }, { val: '3', label: 'Mostly', sub: 'Generally receptive to concerns' }, { val: '2', label: 'Sometimes', sub: 'Occasionally dismissive of pushback' }, { val: '1', label: 'No', sub: 'Concerns are brushed aside or not discussed' }, { val: '0', label: "Not sure", sub: "Hard to say" } ] },
  { id: 'res_address', question: 'When serious resistance or blockers come up, does the leader personally step in to help resolve them?', hint: '"Let the project team handle it" is not sponsorship. Some blockers only the leader can clear.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, always', sub: 'Personal intervention when it is needed' }, { val: '3', label: 'Usually', sub: 'Acts on most significant issues' }, { val: '2', label: 'Sometimes', sub: 'Response is uneven — depends on the situation' }, { val: '1', label: 'Rarely', sub: 'Resistance tends to be left for the project team to deal with' }, { val: '0', label: "Not sure", sub: "I do not know how the leader responds to this" } ] },
]

export const READINESS_STEPS = [
  { id: 'lead_commitment', question: 'Do the most senior leaders genuinely believe this change is necessary?', hint: 'Not just saying the right things in meetings — genuinely convinced and willing to put their credibility behind it.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, absolutely', sub: 'They initiated it and are fully committed' }, { val: '3', label: 'Mostly yes', sub: 'Generally convinced, with some reservations' }, { val: '2', label: 'Not really', sub: 'Compliance more than conviction' }, { val: '1', label: 'No', sub: 'Sceptical or going through the motions' }, { val: '0', label: "Not sure", sub: 'Hard to tell where they really stand' } ] },
  { id: 'lead_alignment', question: 'Are your senior leaders telling the same story about this change?', hint: 'Mixed messages from the top are one of the fastest ways to kill confidence in a change.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Very consistent', sub: 'One clear, unified message' }, { val: '3', label: 'Mostly consistent', sub: 'Broadly aligned with minor variations' }, { val: '2', label: 'Inconsistent', sub: 'People hear different things from different leaders' }, { val: '1', label: 'Conflicting', sub: 'Contradictory messages are causing confusion' }, { val: '0', label: "Not sure", sub: 'We have not checked' } ] },
  { id: 'lead_time', question: 'Do your leaders have real time and headspace to lead this change on top of everything else?', hint: 'Leaders who are already at capacity cannot give a new change what it needs.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, genuinely', sub: 'They have capacity and have made this a priority' }, { val: '3', label: 'Mostly', sub: 'Some constraints but generally available' }, { val: '2', label: 'Not much', sub: 'Already stretched — this is one more thing' }, { val: '1', label: 'No', sub: 'Leaders are overloaded and unlikely to give this real attention' }, { val: '0', label: "Not sure", sub: 'Hard to assess from where I sit' } ] },
  { id: 'cap_skills', question: 'Does your organisation have people with the skills to actually deliver this change well?', hint: 'Think about the skills needed to manage the change itself — not just the technical delivery.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, we have that capability', sub: 'Experienced people are available and ready' }, { val: '3', label: 'Mostly', sub: 'Some capability, with gaps we can manage' }, { val: '2', label: 'Not really', sub: 'We are relying on people to figure it out as they go' }, { val: '1', label: 'No', sub: 'This is new territory and we are underprepared' }, { val: '0', label: "Not sure", sub: 'We have not assessed this' } ] },
  { id: 'cap_process', question: 'Does your organisation have a clear, consistent way of managing change?', hint: 'Having a repeatable approach — even a simple one — makes a significant difference to outcomes.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, a clear approach', sub: 'A consistent method that people understand and follow' }, { val: '3', label: 'Somewhat', sub: 'Some structure, but it varies by project' }, { val: '2', label: 'Not really', sub: 'Mostly ad hoc — each project does its own thing' }, { val: '1', label: 'No', sub: 'No common approach at all' }, { val: '0', label: "Not sure", sub: 'I am not aware of one' } ] },
  { id: 'cult_trust', question: 'Do your people generally trust that when leaders say something is changing, it will actually happen and be good for them?', hint: 'Trust is built over time and broken quickly. Past experience shapes how people respond to the next change.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, generally', sub: 'People give change the benefit of the doubt' }, { val: '3', label: 'Somewhat', sub: 'Cautious but open' }, { val: '2', label: 'Not really', sub: 'Scepticism is the default' }, { val: '1', label: 'No', sub: 'There is deep cynicism about change here' }, { val: '0', label: "Not sure", sub: 'We have not really gauged this' } ] },
  { id: 'cult_voice', question: 'Do your people feel safe raising concerns about change without fear of being seen as resistant or difficult?', hint: 'Organisations where people cannot speak up end up with hidden resistance that surfaces at the worst moment.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very much so', sub: 'People speak up and are genuinely heard' }, { val: '3', label: 'Mostly', sub: 'Generally open, with some exceptions' }, { val: '2', label: 'Not always', sub: 'Some people hold back — it depends on the topic or the leader' }, { val: '1', label: 'No', sub: 'Speaking up about concerns is risky here' }, { val: '0', label: "Not sure", sub: 'Hard to know what people really think' } ] },
  { id: 'cult_pace', question: 'Does the culture generally embrace new ways of working or prefer to stick with what is known?', hint: 'Neither is wrong — but knowing this shapes how you introduce change and how much runway you need.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Embraces it readily', sub: 'People are generally curious and open to new approaches' }, { val: '3', label: 'Cautiously open', sub: 'Open when they can see the logic' }, { val: '2', label: 'Prefers the familiar', sub: 'Strong pull toward established ways of doing things' }, { val: '1', label: 'Resists it strongly', sub: 'Change is met with significant push-back' }, { val: '0', label: "Not sure", sub: 'Hard to generalise across the organisation' } ] },
  { id: 'clar_vision', question: 'Is there a clear and simple description of what this change will look like when it is done?', hint: "If you can't describe the end state simply, your people won't be able to picture it.", type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very clearly', sub: 'A simple, compelling picture that people get immediately' }, { val: '3', label: 'Mostly', sub: 'Clear at the leadership level, needs simplifying for the broader team' }, { val: '2', label: 'Vague', sub: 'A general direction, but the end state is blurry' }, { val: '1', label: 'No', sub: 'People are unclear on where this is heading' }, { val: '0', label: "Not sure", sub: 'I am not sure what the end state looks like myself' } ] },
  { id: 'clar_reason', question: 'Can you explain clearly why this change is happening in a way that would make sense to someone on the front line?', hint: '"Because the strategy says so" is not a reason.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very clearly', sub: 'A compelling reason that connects to real experience' }, { val: '3', label: 'Mostly', sub: 'Clear enough for most people' }, { val: '2', label: 'Not really', sub: 'The reason feels abstract or corporate' }, { val: '1', label: 'No', sub: 'We have not articulated a clear reason yet' }, { val: '0', label: "Not sure", sub: 'I am not sure we have a strong answer to this' } ] },
  { id: 'hist_track', question: 'When your organisation has run major changes before, how well have they landed?', hint: 'Past experience is the most reliable predictor of future performance.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Really well', sub: 'A strong track record — changes tend to stick' }, { val: '3', label: 'Reasonably well', sub: 'More wins than misses' }, { val: '2', label: 'Mixed', sub: 'Some have worked, others have not' }, { val: '1', label: 'Not well', sub: 'Changes rarely land as intended' }, { val: '0', label: "Not sure", sub: 'We do not really review how previous changes went' } ] },
  { id: 'hist_learning', question: 'Does your organisation learn from previous changes and apply those lessons to the next one?', hint: 'Making the same mistakes twice is a sign that learning is not happening.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, consistently', sub: 'We review, capture, and apply lessons deliberately' }, { val: '3', label: 'Sometimes', sub: 'Informal learning happens but it is not structured' }, { val: '2', label: 'Rarely', sub: 'We move on quickly — lessons are not captured' }, { val: '1', label: 'No', sub: 'The same issues come up again and again' }, { val: '0', label: "Not sure", sub: 'I am not aware of any review process' } ] },
]

export const COMMUNICATION_STEPS = [
  { id: 'msg_clear', question: 'If you asked someone on the front line what this change is about, could they explain it back to you clearly?', hint: 'Not the detail — the main point. In their own words.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, most could', sub: 'The message has landed clearly across the organisation' }, { val: '3', label: 'Some could', sub: 'Patchy — some people get it, others do not' }, { val: '2', label: 'Unlikely', sub: 'Awareness is low or the message is fuzzy' }, { val: '1', label: 'No', sub: 'Most people would struggle to explain what is changing' }, { val: '0', label: "Not sure", sub: 'We have not checked' } ] },
  { id: 'msg_why', question: 'Does your communication explain why this change is happening — not just what is changing?', hint: 'People support change they understand. "What" without "why" creates compliance at best, resistance at worst.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very clearly', sub: 'The reason is compelling and comes through in all communication' }, { val: '3', label: 'Mostly', sub: 'The why is there but could be stronger or more consistent' }, { val: '2', label: 'Not really', sub: 'Communication focuses on what is happening, not why' }, { val: '1', label: 'No', sub: 'The reason is absent or vague' }, { val: '0', label: "Not sure", sub: 'I am not sure what our communication says' } ] },
  { id: 'msg_consistent', question: 'Is the same core message coming from everyone — or are people hearing different things?', hint: 'Inconsistency breeds rumour.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Very consistent', sub: 'One clear story, told the same way by everyone' }, { val: '3', label: 'Mostly consistent', sub: 'Some variation in how people describe it' }, { val: '2', label: 'Inconsistent', sub: 'The story varies significantly depending on who you ask' }, { val: '1', label: 'Contradictory', sub: 'People are hearing conflicting things' }, { val: '0', label: "Not sure", sub: 'We have not checked for consistency' } ] },
  { id: 'chan_right', question: 'Are you reaching people through the channels they actually use — not just the ones that are easy for you?', hint: 'Email works for office workers. It does not work for people on a shop floor, in a truck, or in a clinical setting.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, deliberately', sub: 'We have mapped our channels to our audience' }, { val: '3', label: 'Mostly', sub: 'We use a range of channels, though not perfectly targeted' }, { val: '2', label: 'Not really', sub: 'We rely on a few channels that work for some people but not all' }, { val: '1', label: 'No', sub: 'Most communication goes through one channel — usually email' }, { val: '0', label: "Not sure", sub: 'We have not thought about this deliberately' } ] },
  { id: 'chan_frequency', question: 'Are you communicating often enough so people feel informed rather than surprised?', hint: 'In the absence of communication, people fill the gap with speculation.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, regularly', sub: 'People know what is happening and when to expect more' }, { val: '3', label: 'Mostly', sub: 'Reasonable cadence with some gaps' }, { val: '2', label: 'Not enough', sub: 'Communication tends to happen at milestones and then go quiet' }, { val: '1', label: 'Rarely', sub: 'People are largely in the dark' }, { val: '0', label: "Not sure", sub: 'I do not have a clear view of what is going out' } ] },
  { id: 'dial_questions', question: 'Do people have a way to ask questions and actually get answered — not just send feedback into a void?', hint: 'A feedback form that nobody reads is not a dialogue mechanism.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, and it works well', sub: 'Questions are asked and genuinely answered' }, { val: '3', label: 'Somewhat', sub: 'There are mechanisms but they are not always responsive' }, { val: '2', label: 'Not really', sub: 'Questions go unanswered or get generic responses' }, { val: '1', label: 'No', sub: 'There is no real way for people to ask questions' }, { val: '0', label: "Not sure", sub: 'I am not sure what is in place' } ] },
  { id: 'dial_acted', question: 'When people raise concerns or suggestions about this change, does anything actually change as a result?', hint: 'Listening without acting is worse than not listening at all.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, regularly', sub: 'Feedback has visibly shaped decisions' }, { val: '3', label: 'Sometimes', sub: 'Some feedback is acted on, some is not' }, { val: '2', label: 'Rarely', sub: 'People sense their input does not make a difference' }, { val: '1', label: 'No', sub: 'Feedback is collected but nothing changes' }, { val: '0', label: "Not sure", sub: 'I do not know what happens with feedback' } ] },
  { id: 'aud_segment', question: 'Are you tailoring your communication for different groups — or sending the same message to everyone?', hint: 'A nurse, a finance manager, and a warehouse worker are affected by change differently.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, deliberately tailored', sub: 'Different messages for different groups based on their experience' }, { val: '3', label: 'Somewhat', sub: 'Some tailoring for key groups' }, { val: '2', label: 'Not much', sub: 'Broadly the same message with minor variations' }, { val: '1', label: 'No', sub: 'One message goes to everyone' }, { val: '0', label: "Not sure", sub: 'We have not thought about this' } ] },
  { id: 'aud_managers', question: 'Are your managers equipped to have real conversations with their teams about this change?', hint: 'Managers are the most trusted communication channel in most organisations.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, well prepared', sub: 'Managers have what they need to lead local conversations' }, { val: '3', label: 'Mostly', sub: 'Generally prepared, with some gaps' }, { val: '2', label: 'Not really', sub: 'Managers have been informed but not equipped' }, { val: '1', label: 'No', sub: 'Managers are as in the dark as their teams' }, { val: '0', label: "Not sure", sub: 'I do not know what support managers have received' } ] },
  { id: 'aud_timing', question: 'Do people find out about changes in time to prepare — or are they often the last to know?', hint: 'Finding out about a change through rumour, or on the day it goes live, destroys trust fast.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Always in time', sub: 'People are informed early enough to get ready' }, { val: '3', label: 'Usually', sub: 'Generally good lead time, with occasional exceptions' }, { val: '2', label: 'Sometimes too late', sub: 'Communication often feels last-minute' }, { val: '1', label: 'Often last to know', sub: 'Rumour frequently gets there before official communication' }, { val: '0', label: "Not sure", sub: 'I am not sure how well-timed our communication is' } ] },
]

export const PEOPLE_IMPACT_STEPS = [
  { id: 'scale_reach', question: 'How much of the organisation is this change touching?', hint: 'Wide reach does not always mean deep impact — but it does mean more coordination, communication, and support required.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'The whole organisation', sub: 'Everyone is affected in some way' }, { val: '3', label: 'Most of it', sub: 'Multiple divisions or functions' }, { val: '2', label: 'A significant part', sub: 'One or two major teams or areas' }, { val: '1', label: 'A specific group', sub: 'A defined team or function' }, { val: '0', label: "Not sure", sub: 'The reach has not been properly mapped yet' } ] },
  { id: 'scale_roles', question: 'How many different types of roles are affected — and are they being treated differently?', hint: 'A change that affects a customer service rep, a warehouse supervisor, and a finance analyst affects each of them very differently.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Many roles, all mapped', sub: 'We have looked at impact by role and tailored accordingly' }, { val: '3', label: 'A few roles, somewhat mapped', sub: 'Some role-level thinking has happened' }, { val: '2', label: 'Multiple roles, not mapped', sub: 'We know there are different groups but have not analysed them' }, { val: '1', label: 'Treated as one group', sub: 'Everyone is being approached the same way' }, { val: '0', label: "Not sure", sub: 'We have not broken this down by role' } ] },
  { id: 'depth_jobs', question: "Are people's actual jobs changing — or just the tools or systems they use?", hint: 'A new system that keeps the job the same is very different from a change that restructures what people actually do each day.', type: 'seg' as const, cols: 2 as const, options: [ { val: '1', label: 'Just the tools or systems', sub: 'The work stays the same — only the technology changes' }, { val: '2', label: 'Some of both', sub: 'New tools and some changes to how work gets done' }, { val: '3', label: 'Mostly the work itself', sub: 'Roles, tasks, and day-to-day work are changing significantly' }, { val: '4', label: 'Everything', sub: 'Tools, work, structure, and expectations are all changing' }, { val: '0', label: "Not sure", sub: 'We have not clearly mapped what is actually changing for people' } ] },
  { id: 'depth_identity', question: 'Does this change affect how people see their role — their sense of what they are good at and what they are valued for?', hint: 'When a change challenges professional identity, resistance runs much deeper than normal.', type: 'seg' as const, cols: 2 as const, options: [ { val: '1', label: 'Not at all', sub: 'People will still be doing what they are known for' }, { val: '2', label: 'A little', sub: 'Minor shifts in how roles are perceived' }, { val: '3', label: 'For some people', sub: 'Certain groups will feel their identity shift significantly' }, { val: '4', label: 'For many people', sub: 'This fundamentally changes what people are known for' }, { val: '0', label: "Not sure", sub: 'We have not thought about this dimension' } ] },
  { id: 'depth_workload', question: 'During the transition, will people be doing their normal job AND learning the new way at the same time?', hint: 'This "double burden" is one of the most underestimated causes of change failure.', type: 'seg' as const, cols: 2 as const, options: [ { val: '1', label: 'No — time has been protected', sub: 'We have built capacity for the transition explicitly' }, { val: '2', label: 'Partly', sub: 'Some time has been set aside but not enough' }, { val: '3', label: 'Yes, for most people', sub: 'People will largely have to manage both at the same time' }, { val: '4', label: 'Yes, with no relief at all', sub: 'No capacity has been created — people will be stretched' }, { val: '0', label: "Not sure", sub: 'This has not been worked through yet' } ] },
  { id: 'vuln_groups', question: 'Are there groups of people who will find this change particularly hard — and have they been identified?', hint: 'Think about people who are less digitally confident, those with caring responsibilities, people in remote locations, or those who have the most to lose.', type: 'seg' as const, cols: 2 as const, options: [ { val: '1', label: 'Yes, identified and planned for', sub: 'We know who they are and have a plan to support them' }, { val: '2', label: 'Identified but not yet planned', sub: 'We know who they are but support is not in place yet' }, { val: '3', label: 'Suspected but not mapped', sub: 'We have a feeling there are vulnerable groups but have not looked properly' }, { val: '4', label: 'Not considered yet', sub: 'This has not been part of the planning conversation' }, { val: '0', label: "Not sure", sub: 'I am not aware of any analysis of this' } ] },
  { id: 'vuln_jobs_at_risk', question: 'Are any roles or jobs at risk as a result of this change?', hint: 'If there is any risk of job loss — even if not confirmed — people will already be thinking about it. Silence amplifies fear.', type: 'seg' as const, cols: 2 as const, options: [ { val: '1', label: 'No — jobs are secure', sub: 'This change does not affect employment' }, { val: '2', label: 'Roles are changing but secure', sub: 'Jobs exist but look different afterwards' }, { val: '3', label: 'Some risk for some people', sub: 'Certain roles may be affected' }, { val: '4', label: 'Significant job impact', sub: 'Restructuring or redundancy is part of this change' }, { val: '0', label: "Not sure", sub: 'This has not been confirmed or communicated yet' } ] },
  { id: 'supp_plan', question: 'Is there a clear plan for how different groups of people will be supported through this change?', hint: 'A support plan is more than a training schedule. It covers communication, manager capability, feedback mechanisms, and who to go to with questions.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, a detailed plan', sub: 'Support is mapped for each affected group' }, { val: '3', label: 'A general plan', sub: 'An overall approach, not yet group-specific' }, { val: '2', label: 'Partially', sub: 'Some groups have plans, others do not' }, { val: '1', label: 'Not yet', sub: 'Support planning has not happened yet' }, { val: '0', label: "Not sure", sub: 'I am not aware of a people support plan' } ] },
  { id: 'supp_managers', question: 'Are your managers ready and willing to support their people through this change?', hint: 'Managers are the human face of change for most employees.', type: 'seg' as const, cols: 2 as const, options: [ { val: '4', label: 'Yes, very much so', sub: 'Managers are engaged, equipped, and supportive' }, { val: '3', label: 'Mostly', sub: 'Generally positive, with some gaps in preparation' }, { val: '2', label: 'Not really', sub: 'Managers are underequipped or privately sceptical' }, { val: '1', label: 'No', sub: 'Managers are resistant or actively disengaged' }, { val: '0', label: "Not sure", sub: 'We have not checked in with our managers on this' } ] },
]
