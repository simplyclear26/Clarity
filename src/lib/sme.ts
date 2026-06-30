import type { Step, Results } from './types'
import { avg, toScore, countUnsure, getRating, get, getServiceRec } from './scoring'

const AGREE: Step['options'] = [
  { val: '5', label: 'Strongly agree',             sub: 'This is clearly true for us' },
  { val: '4', label: 'Agree',                      sub: 'Mostly true with some exceptions' },
  { val: '3', label: 'Neither agree nor disagree', sub: 'It varies or is hard to say' },
  { val: '2', label: 'Disagree',                   sub: 'This is generally not true' },
  { val: '1', label: 'Strongly disagree',          sub: 'This is not true for us' },
  { val: 'unsure', label: "Not sure",              sub: 'I genuinely cannot say' },
]

// ─── Business Friction Snapshot ───────────────────────────────────────────────

export const BUSINESS_FRICTION_STEPS: Step[] = [
  { id: 'bf1', question: 'Information flows freely across our business — people have what they need without having to chase it.', hint: 'Think about day-to-day communication between people, teams, and leaders.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf2', question: 'Decisions get made quickly and clearly — people are not left waiting or guessing.', hint: 'Consider how long decisions typically take and how clearly they are communicated.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf3', question: 'When something needs to happen, it is always clear who is responsible and it actually gets done.', hint: 'Think about the last few times something fell through the cracks.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf4', question: 'Our meetings are productive — they end with clear actions and do not waste time.', hint: 'Consider the quality of meetings across the business, not just the ones you run.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf5', question: 'Work moves smoothly from one person to the next — handoffs are clean and rarely cause delays.', hint: 'Think about where work tends to stall or get dropped between people.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf6', question: 'We rarely have to redo work because of unclear instructions, miscommunication, or changing priorities.', hint: 'Rework is expensive and often invisible. Think honestly about how often it happens.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf7', question: 'Everyone in the business knows what the priorities are right now — there is no confusion about what matters most.', hint: 'When everything feels urgent, nothing actually is.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf8', question: 'Customers experience us as organised, consistent, and easy to deal with.', hint: 'Think about what customers actually experience versus what you intend.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf9', question: 'Our people spend most of their time on work that actually moves the business forward.', hint: 'Think about how much time gets absorbed by admin, internal friction, and unnecessary processes.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf10', question: 'Honestly, our business runs as smoothly as it could for its size and stage.', hint: 'Your gut answer is usually the most accurate.', type: 'seg', cols: 2, options: AGREE },
  { id: 'bf11', question: 'If you had to name the single biggest source of friction right now, what would it be?', hint: 'Choose the one that costs the most time, energy, or money.', type: 'seg', cols: 2, options: [
    { val: 'communication', label: 'Communication', sub: 'People do not have the information they need' },
    { val: 'accountability', label: 'Accountability', sub: 'Things fall through the cracks' },
    { val: 'decisions', label: 'Decision-making', sub: 'Decisions are slow, unclear, or keep changing' },
    { val: 'processes', label: 'Processes and systems', sub: 'How we do things is inefficient' },
    { val: 'leadership', label: 'Leadership alignment', sub: 'Leaders are not on the same page' },
    { val: 'unsure', label: 'Not sure', sub: 'Hard to pinpoint one thing' },
  ]},
]

export function scoreBusinessFriction(a: Record<string, string>): Results {
  const ids = ['bf1','bf2','bf3','bf4','bf5','bf6','bf7','bf8','bf9','bf10']
  const score = toScore(avg(a, ids))
  const rating = getRating(score)
  const unsureCount = countUnsure(a)
  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []
  if (get(a,'bf1') >= 4) strengths.push('Communication flows well across the business')
  if (get(a,'bf3') >= 4) strengths.push('Accountability is clear and things get done')
  if (get(a,'bf8') >= 4) strengths.push('Customers experience the business as consistent and organised')
  if (get(a,'bf1') <= 2) pressureAreas.push('Communication gaps are costing time and creating confusion')
  if (get(a,'bf2') <= 2) pressureAreas.push('Decision-making is slow or unclear — people are waiting')
  if (get(a,'bf3') <= 2) pressureAreas.push('Accountability is inconsistent — things are falling through the cracks')
  if (get(a,'bf6') <= 2) pressureAreas.push('Rework is happening regularly — a sign of miscommunication or unclear expectations')
  if (get(a,'bf9') <= 2) pressureAreas.push('Too much energy is absorbed by internal friction rather than productive work')
  if (score < 50) recommendations.push('Start by naming the friction openly with your leadership team. Most friction persists because nobody has said it out loud.')
  if (get(a,'bf3') <= 2) recommendations.push('Introduce a simple ownership system — every action needs a name and a date.')
  if (get(a,'bf4') <= 2) recommendations.push('Audit your meeting rhythm. Cancel or shorten any meeting without a clear purpose and owner.')
  if (get(a,'bf7') <= 2) recommendations.push('Set three organisational priorities for the next 90 days and make sure everyone can name them.')
  if (recommendations.length === 0) recommendations.push('Your business is running reasonably well. Find the 20% of friction causing 80% of the drag and remove it deliberately.')
  return {
    toolId: 'business-friction', audience: 'sme', overallScore: score, rating,
    ratingDescription: score >= 70 ? 'Your business is running with relatively low friction. The focus now is on the small inefficiencies still costing energy.' : score >= 50 ? 'There is meaningful friction in your business. Some areas work well but others create drag.' : score >= 30 ? 'Friction is a real problem here — likely showing up in missed deadlines, frustrated customers, or an exhausted team.' : 'Your business is carrying significant friction across multiple areas. Without deliberate intervention, this will compound.',
    dimensionScores: { Communication: toScore(get(a,'bf1')), Accountability: toScore(get(a,'bf3')), Decisions: toScore(get(a,'bf2')), Workflows: toScore(get(a,'bf5')), Energy: toScore(get(a,'bf9')) },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: ['People have the information they need without asking twice', 'Decisions happen quickly and stick', 'Every piece of work has a clear owner', 'Meetings end with actions not more meetings', 'Customers experience consistency regardless of who they deal with'],
    unsureCount, serviceRec: getServiceRec('sme', score, rating, unsureCount, 'business-friction'),
  }
}

// ─── Operational Overwhelm ────────────────────────────────────────────────────

export const OPERATIONAL_OVERWHELM_STEPS: Step[] = [
  { id: 'oo1', question: 'Most days feel reactive — we are responding to things rather than working to a plan.', hint: 'Think about the ratio of planned versus unplanned work in a typical week.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo2', question: 'Admin, reporting, and internal processes take up more time than they should.', hint: 'Consider all the time spent on things that support the business but do not directly create value.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo3', question: 'Our team is constantly switching between tasks — it is hard to get deep focused work done.', hint: 'Context switching is one of the biggest hidden productivity drains in small businesses.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo4', question: 'Too many decisions still flow through one or two people — creating bottlenecks.', hint: 'Think about whether the business can operate smoothly when key people are unavailable.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo5', question: 'Our people regularly work beyond their capacity — late nights, weekends, skipped breaks.', hint: 'Sustainable workload is a business risk, not just a people issue.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo6', question: 'We rarely have enough time to work on the business — most energy goes into working in it.', hint: 'Strategic thinking and planning often get crowded out by day-to-day pressure.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo7', question: 'Things get dropped or forgotten under pressure — there is too much happening at once.', hint: 'Think about the last few weeks. What did not get done that should have?', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo8', question: 'If something does not change, I am concerned about burnout in myself or my team.', hint: 'Burnout is expensive, slow to recover from, and usually avoidable.', type: 'seg', cols: 2, options: AGREE },
  { id: 'oo9', question: 'Honestly, our business is operating at a sustainable pace right now.', hint: 'Sustainable means you could keep going at this pace for another 12 months without burning out.', type: 'seg', cols: 2, options: AGREE },
]

export function scoreOperationalOverwhelm(a: Record<string, string>): Results {
  const problemIds = ['oo1','oo2','oo3','oo4','oo5','oo6','oo7','oo8']
  const problemAvg = avg(a, problemIds)
  const invertedProblem = toScore(6 - problemAvg)
  const honestScore = toScore(get(a,'oo9'))
  const score = Math.round(invertedProblem * 0.7 + honestScore * 0.3)
  const rating = getRating(score)
  const unsureCount = countUnsure(a)
  const burnoutRisk = get(a,'oo8') >= 4
  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []
  if (get(a,'oo1') <= 2) strengths.push('Work is largely planned rather than reactive')
  if (get(a,'oo5') <= 2) strengths.push('People are working within a sustainable capacity')
  if (get(a,'oo1') >= 4) pressureAreas.push('The business is running reactively — fire-fighting is the norm')
  if (get(a,'oo4') >= 4) pressureAreas.push('Decision bottlenecks are slowing the business down')
  if (get(a,'oo5') >= 4) pressureAreas.push('People are operating beyond sustainable capacity')
  if (get(a,'oo6') >= 4) pressureAreas.push('No time to work on the business — everything is urgent')
  if (burnoutRisk) pressureAreas.push('Burnout risk is real and needs to be addressed now')
  if (get(a,'oo4') >= 4) recommendations.push('Map which decisions only you can make versus what could be delegated. Start delegating one category this week.')
  if (get(a,'oo1') >= 4) recommendations.push('Block two hours per week for strategic work — non-negotiable, in the calendar before anything else.')
  if (burnoutRisk) recommendations.push('Have an honest conversation with your team about workload. People already know it is unsustainable — they are waiting for permission to say it.')
  if (recommendations.length === 0) recommendations.push('Your pace is broadly sustainable. Be intentional about what you add and what you stop.')
  return {
    toolId: 'operational-overwhelm', audience: 'sme', overallScore: score, rating,
    ratingDescription: score >= 70 ? 'Your business is operating at a broadly sustainable pace.' : score >= 50 ? 'There is real pressure here. The pace is not yet critical but heading in the wrong direction.' : score >= 30 ? 'Your business is in overwhelm. The busyness is getting in the way of moving forward.' : 'This is unsustainable. Something needs to change before the cost becomes much higher.',
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: ['Most work is planned not reactive', 'Key decisions can be made without one person being the bottleneck', 'People finish work at a reasonable time most days', 'There is time each week to think about the business not just in it'],
    unsureCount, serviceRec: getServiceRec('sme', score, rating, unsureCount, 'operational-overwhelm'),
  }
}

// ─── Team Clarity Check ───────────────────────────────────────────────────────

export const TEAM_CLARITY_STEPS: Step[] = [
  { id: 'tc1', question: 'Everyone in our team knows what the top priorities are right now — and they agree on them.', hint: 'Think about whether people would give the same answer if you asked them independently.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc2', question: 'Everyone in our team knows exactly what they are responsible for — there is no confusion or overlap.', hint: 'Consider whether role boundaries are clear, or whether things fall between the cracks.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc3', question: 'People know what good looks like in their role — the standard is clear, not left to interpretation.', hint: 'Think about the last time someone did something differently to what you expected.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc4', question: 'People get clear, timely feedback — they know how they are going and what needs to improve.', hint: 'Feedback should be regular and specific, not just at performance review time.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc5', question: 'It is clear who makes which decisions — people do not need to ask permission for things they should own.', hint: 'Unclear decision rights slow everything down and create unnecessary dependence on leaders.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc6', question: 'Information gets to the right people at the right time — there are no significant communication gaps.', hint: 'Consider whether people ever find out about important things too late, or not at all.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc7', question: 'When we make a decision as a leadership team, the whole team moves in the same direction.', hint: 'Think about whether mixed messages from leaders creates confusion.', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc8', question: 'Honestly, our team has the clarity it needs to do its best work.', hint: 'What would your team say if you asked them this question?', type: 'seg', cols: 2, options: AGREE },
  { id: 'tc9', question: 'Where is the clarity gap biggest in your team right now?', hint: 'The thing that, if you fixed it, would make the biggest difference.', type: 'seg', cols: 2, options: [
    { val: 'priorities', label: 'Priorities', sub: 'What matters most is not clear or agreed' },
    { val: 'roles', label: 'Roles and ownership', sub: 'Who does what is fuzzy or overlapping' },
    { val: 'expectations', label: 'Expectations', sub: 'Standards are left to interpretation' },
    { val: 'communication', label: 'Communication', sub: 'Information does not flow well' },
    { val: 'decisions', label: 'Decision rights', sub: 'Unclear who can decide what' },
    { val: 'unsure', label: 'Hard to say', sub: 'Multiple things or not sure' },
  ]},
]

export function scoreTeamClarity(a: Record<string, string>): Results {
  const ids = ['tc1','tc2','tc3','tc4','tc5','tc6','tc7','tc8']
  const score = toScore(avg(a, ids))
  const rating = getRating(score)
  const unsureCount = countUnsure(a)
  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []
  if (get(a,'tc1') >= 4) strengths.push('Priorities are clear and agreed across the team')
  if (get(a,'tc2') >= 4) strengths.push('Roles and responsibilities are well defined')
  if (get(a,'tc7') >= 4) strengths.push('Leadership decisions translate into consistent team direction')
  if (get(a,'tc1') <= 2) pressureAreas.push('Priorities are unclear — people are pulling in different directions')
  if (get(a,'tc2') <= 2) pressureAreas.push('Role clarity is poor — work falls through cracks or gets duplicated')
  if (get(a,'tc3') <= 2) pressureAreas.push('Standards are not clear enough — people are guessing what good looks like')
  if (get(a,'tc4') <= 2) pressureAreas.push('Feedback is infrequent or unclear — people do not know how they are going')
  if (get(a,'tc7') <= 2) pressureAreas.push('Mixed messages from leaders are creating confusion')
  if (get(a,'tc1') <= 2) recommendations.push('Set three clear priorities for the next 90 days. Write them down, share them, and refer back in every team meeting.')
  if (get(a,'tc2') <= 2) recommendations.push('Run a one-page role clarity exercise. Each person writes what they think they own. Compare. The gaps will be immediately obvious.')
  if (get(a,'tc4') <= 2) recommendations.push('Build a simple monthly one-on-one rhythm. Fifteen minutes. Three questions: what is going well, what is not, what do you need from me.')
  if (recommendations.length === 0) recommendations.push('Your team has reasonable clarity. The opportunity is to strengthen the edges where ambiguity still exists.')
  return {
    toolId: 'team-clarity', audience: 'sme', overallScore: score, rating,
    ratingDescription: score >= 70 ? 'Your team has good clarity. People know what they are doing and why.' : score >= 50 ? 'Clarity is present in some areas but missing in others. The gaps are costing performance.' : score >= 30 ? 'Clarity is a real problem. People are working without the direction they need.' : 'Your team is significantly lacking in clarity. This is affecting performance, morale, and quality.',
    dimensionScores: { Priorities: toScore(get(a,'tc1')), Roles: toScore(get(a,'tc2')), Expectations: toScore(get(a,'tc3')), Communication: toScore(get(a,'tc6')), Alignment: toScore(get(a,'tc7')) },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: ['Ask anyone in the team what the top three priorities are — they give the same answer', 'People make decisions within their role without needing approval', 'Feedback is specific, timely, and goes both ways', 'Leadership sends a consistent message'],
    unsureCount, serviceRec: getServiceRec('sme', score, rating, unsureCount, 'team-clarity'),
  }
}

// ─── Workplace Energy Index ───────────────────────────────────────────────────

export const WORKPLACE_ENERGY_STEPS: Step[] = [
  { id: 'we1', question: 'Our team generally enjoys coming to work — morale is positive and people are engaged.', hint: 'Think about the energy in the room on a typical Monday morning.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we2', question: 'Workloads are manageable — people are stretched but not breaking.', hint: 'Consider whether your team could sustain this pace for another six months.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we3', question: 'People feel recognised and valued for the contribution they make.', hint: 'Recognition does not need to be formal — noticing and saying something is enough.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we4', question: 'People understand how their work connects to something bigger — there is a sense of purpose.', hint: 'People who know why their work matters are more resilient under pressure.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we5', question: 'People feel safe to speak up, raise concerns, and make mistakes without fear of blame.', hint: 'Psychological safety is one of the strongest predictors of team performance.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we6', question: 'The internal environment is supportive — minimal workplace friction, politics, or tension.', hint: 'Think about the quality of relationships across the team.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we7', question: 'We are not losing good people — retention is not a concern right now.', hint: 'Turnover is often a lagging indicator of energy and culture problems.', type: 'seg', cols: 2, options: AGREE },
  { id: 'we8', question: 'Honestly, the energy in our business right now is where I want it to be.', hint: 'What would your most honest team member say if asked this question?', type: 'seg', cols: 2, options: AGREE },
  { id: 'we9', question: 'Are there visible signs of fatigue or disengagement in parts of the team?', hint: 'Signs include cynicism, withdrawal, declining quality, or people going through the motions.', type: 'seg', cols: 2, options: [
    { val: '1', label: 'Clearly visible', sub: 'Across much of the team' },
    { val: '2', label: 'Present in some areas', sub: 'Noticeable in places' },
    { val: '3', label: 'Hard to tell', sub: 'Not sure either way' },
    { val: '4', label: 'Not really visible', sub: 'Team seems engaged' },
    { val: '5', label: 'Not at all', sub: 'The team is energised' },
    { val: 'unsure', label: 'Not sure', sub: 'Cannot assess this clearly' },
  ]},
]

export function scoreWorkplaceEnergy(a: Record<string, string>): Results {
  const ids = ['we1','we2','we3','we4','we5','we6','we7','we8','we9']
  const score = toScore(avg(a, ids))
  const rating = getRating(score)
  const unsureCount = countUnsure(a)
  const burnoutVisible = get(a,'we9') <= 2
  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []
  if (get(a,'we1') >= 4) strengths.push('Team morale is positive — people are engaged and motivated')
  if (get(a,'we5') >= 4) strengths.push('Psychological safety is present — people speak up and take risks')
  if (get(a,'we7') >= 4) strengths.push('Retention is not a concern — people are choosing to stay')
  if (get(a,'we1') <= 2) pressureAreas.push('Morale is low — people are not engaged and it is showing')
  if (get(a,'we2') <= 2) pressureAreas.push('Workloads are not sustainable — people are running on empty')
  if (get(a,'we3') <= 2) pressureAreas.push('Recognition is insufficient — people do not feel valued')
  if (get(a,'we5') <= 2) pressureAreas.push('Psychological safety is low — people are not comfortable speaking up')
  if (burnoutVisible) pressureAreas.push('Signs of burnout or disengagement are visible — this needs direct attention')
  if (get(a,'we7') <= 2) pressureAreas.push('Retention is a concern — the risk of losing good people is real')
  if (get(a,'we3') <= 2) recommendations.push('Start naming one person\'s contribution in every team meeting. It takes 60 seconds and the cumulative effect is significant.')
  if (get(a,'we5') <= 2) recommendations.push('Ask your team: what is the one thing we do not talk about enough? Then listen without defending.')
  if (burnoutVisible) recommendations.push('Name the burnout risk openly. Meet with the most affected people individually. Ask what one thing would make the biggest difference. Then do it.')
  if (recommendations.length === 0) recommendations.push('The energy in your business is broadly positive. Protect it — be deliberate about what you add and maintain the practices that are working.')
  return {
    toolId: 'workplace-energy', audience: 'sme', overallScore: score, rating,
    ratingDescription: score >= 70 ? 'The energy in your business is broadly positive. People are engaged and the workload is manageable.' : score >= 50 ? 'There are energy drains starting to affect people. Some areas are strong, others need attention.' : score >= 30 ? 'Energy is a real problem. Signs of fatigue, disengagement, or unsustainability are present.' : 'Your business is running on depleted energy. This needs urgent and direct attention.',
    dimensionScores: { Morale: toScore(get(a,'we1')), Workload: toScore(get(a,'we2')), Recognition: toScore(get(a,'we3')), Safety: toScore(get(a,'we5')), Purpose: toScore(get(a,'we4')) },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: ['People choose to come in — not just because they have to', 'Workloads are stretched but not breaking', 'Contributions are noticed and named regularly', 'People raise concerns without fear of blame'],
    unsureCount, serviceRec: getServiceRec('sme', score, rating, unsureCount, 'workplace-energy'),
  }
}

// ─── Simplicity Score ─────────────────────────────────────────────────────────

export const SIMPLICITY_SCORE_STEPS: Step[] = [
  { id: 'ss1', question: 'Our core processes are simple enough that a new person could learn them in a week.', hint: 'If your processes require tribal knowledge to navigate, they are too complex.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss2', question: 'Approvals and sign-offs are minimal — work does not sit waiting for permission.', hint: 'Every unnecessary approval is a delay and a signal of low trust.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss3', question: 'We use a small number of tools well — we have not accumulated too many systems.', hint: 'Tool overload is one of the most common and least discussed sources of business complexity.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss4', question: 'Work rarely gets done twice — there is minimal duplication across the business.', hint: 'Duplication usually happens when processes are unclear or ownership is not defined.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss5', question: 'We do not have more meetings than we need — our meeting structure is lean and purposeful.', hint: 'Every unnecessary meeting is a tax on everyone who attends.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss6', question: 'Our reporting and documentation is proportionate — we capture what matters, nothing more.', hint: 'Over-reporting is a sign of low trust or unclear priorities.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss7', question: 'A new team member could be genuinely productive within their first month.', hint: 'Onboarding speed is a proxy for operational clarity.', type: 'seg', cols: 2, options: AGREE },
  { id: 'ss8', question: 'Honestly, our business is simpler to operate than it was 12 months ago.', hint: 'Simplicity requires deliberate effort. Complexity is the natural state of a growing business.', type: 'seg', cols: 2, options: AGREE },
]

export function scoreSimplicity(a: Record<string, string>): Results {
  const ids = ['ss1','ss2','ss3','ss4','ss5','ss6','ss7','ss8']
  const score = toScore(avg(a, ids))
  const rating = getRating(score)
  const unsureCount = countUnsure(a)
  const strengths: string[] = []
  const pressureAreas: string[] = []
  const recommendations: string[] = []
  if (get(a,'ss1') >= 4) strengths.push('Core processes are clear and learnable')
  if (get(a,'ss3') >= 4) strengths.push('Tool stack is lean and well used')
  if (get(a,'ss5') >= 4) strengths.push('Meeting culture is efficient and purposeful')
  if (get(a,'ss1') <= 2) pressureAreas.push('Core processes are too complex — they rely on tribal knowledge')
  if (get(a,'ss2') <= 2) pressureAreas.push('Excessive approvals are creating delays and bottlenecks')
  if (get(a,'ss3') <= 2) pressureAreas.push('Tool overload is creating friction — too many systems, not enough integration')
  if (get(a,'ss4') <= 2) pressureAreas.push('Work is being duplicated — a sign of unclear ownership or process gaps')
  if (get(a,'ss5') <= 2) pressureAreas.push('Too many meetings — consuming time that should go to actual work')
  if (get(a,'ss3') <= 2) recommendations.push('List every tool your business uses. For each one ask: could we eliminate it, replace it, or get more value from it? Cut at least one.')
  if (get(a,'ss2') <= 2) recommendations.push('Map your approval chain. Remove at least two approvals that do not catch a meaningful risk.')
  if (get(a,'ss5') <= 2) recommendations.push('Cancel one recurring meeting this week. If nobody notices, cancel another.')
  if (recommendations.length === 0) recommendations.push('Your business is operating with good simplicity. Protect it — be deliberate about every new process or tool you add.')
  return {
    toolId: 'simplicity-score', audience: 'sme', overallScore: score, rating,
    ratingDescription: score >= 70 ? 'Your business is operating with good simplicity. Processes are clear and complexity is being managed.' : score >= 50 ? 'There is unnecessary complexity in parts of your business. Some things work well but others are more complicated than needed.' : score >= 30 ? 'Complexity is a real drag on your business — costing time, energy, and probably money.' : 'Your business has accumulated significant complexity. Simplification is a strategic priority.',
    dimensionScores: { Processes: toScore(get(a,'ss1')), Approvals: toScore(get(a,'ss2')), Tools: toScore(get(a,'ss3')), Meetings: toScore(get(a,'ss5')), Reporting: toScore(get(a,'ss6')) },
    strengths, pressureAreas, recommendations,
    whatGoodLooksLike: ['A new team member is productive within their first month', 'Work rarely waits for approval — people are trusted to act', 'The tool stack is small and every tool earns its place', 'Meetings are short, purposeful, and end with clear actions'],
    unsureCount, serviceRec: getServiceRec('sme', score, rating, unsureCount, 'simplicity-score'),
  }
}
