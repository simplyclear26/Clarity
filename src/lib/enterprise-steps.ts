// Steps for all 6 enterprise diagnostics
// Change Pressure Index steps are here
// Other 5 tools have steps embedded in enterprise.ts (ported from old scoring files)

import type { Step } from '@/lib/types'

export const CHANGE_PRESSURE_STEPS: Step[] = [
  {
    id: 'complexity',
    question: "How much will people's day-to-day work actually change?",
    hint: 'Not the technology or the process on paper. The real experience of the people doing the work.',
    type: 'seg', cols: 2,
    options: [
      { val: 'low',      label: 'A little',              sub: 'Small adjustments to how things are done' },
      { val: 'moderate', label: 'Quite a bit',           sub: 'New ways of working that will take time to learn' },
      { val: 'high',     label: 'A lot',                 sub: 'Roles or tasks will feel very different' },
      { val: 'severe',   label: 'Almost everything',     sub: 'A fundamental shift in how people work' },
      { val: 'unsure',   label: "Not sure",              sub: "We haven't fully mapped the impact yet" },
    ],
  },
  {
    id: 'timeline',
    question: 'How much time do people have to get used to this change?',
    hint: 'Be honest. Rushed timelines are one of the biggest reasons change fails.',
    type: 'seg', cols: 2,
    options: [
      { val: 'relaxed',    label: 'Plenty of time',       sub: 'We can go at a pace that works for people' },
      { val: 'moderate',   label: 'Reasonable time',      sub: 'Tight but manageable' },
      { val: 'aggressive', label: 'Not much time',        sub: 'The deadline is already creating pressure' },
      { val: 'critical',   label: 'Very little time',     sub: 'It feels rushed already' },
      { val: 'unsure',     label: "Not sure",             sub: "The timeline hasn't been set yet" },
    ],
  },
  {
    id: 'leadership',
    question: 'Are the leaders who need to back this change actually behind it?',
    hint: 'Not just nodding in a meeting. Actively supporting it, talking about it, and making decisions to move it forward.',
    type: 'seg', cols: 2,
    options: [
      { val: 'strong',     label: 'Yes, strongly',        sub: 'Leaders are visible, aligned, and vocal' },
      { val: 'moderate',   label: 'Mostly yes',           sub: 'Generally supportive, with some gaps' },
      { val: 'weak',       label: 'Not really',           sub: 'Support is patchy or inconsistent' },
      { val: 'fragmented', label: 'No, or divided',       sub: 'Leaders are sending mixed messages' },
      { val: 'unsure',     label: "Not sure",             sub: "Hard to tell where leaders really stand" },
    ],
  },
  {
    id: 'technology',
    question: 'How much new technology are people being asked to learn?',
    hint: 'Think about systems, apps, tools, or platforms that are new or changing significantly.',
    type: 'seg', cols: 2,
    options: [
      { val: 'minimal',     label: 'Very little',         sub: 'Minor updates to existing tools' },
      { val: 'moderate',    label: 'Some',                sub: 'One new system or platform' },
      { val: 'significant', label: 'Quite a bit',         sub: 'Several new systems at once' },
      { val: 'enterprise',  label: 'Almost everything',   sub: 'A full technology overhaul' },
      { val: 'unsure',      label: "Not sure",            sub: "The technology scope isn't confirmed yet" },
    ],
  },
  {
    id: 'fatigue',
    question: 'Have your people been through a lot of change recently?',
    hint: 'When people have been asked to change too many times in a row, they stop believing the next one will be any different.',
    type: 'seg', cols: 2,
    options: [
      { val: 'low',      label: 'Not really',             sub: 'People feel settled and have capacity' },
      { val: 'moderate', label: 'A bit',                  sub: 'Some tiredness, but generally coping' },
      { val: 'high',     label: 'Yes, noticeably',        sub: 'There is real weariness or quiet resistance' },
      { val: 'extreme',  label: 'Completely worn out',    sub: 'People are exhausted and cynical' },
      { val: 'unsure',   label: "Not sure",               sub: "We haven't really checked in with our people" },
    ],
  },
  {
    id: 'training',
    question: 'How much will people need to learn to do their job in the new way?',
    hint: 'Think about new skills, new processes, or new knowledge — not just a quick briefing.',
    type: 'seg', cols: 2,
    options: [
      { val: 'minimal',   label: 'Very little',           sub: 'A quick briefing or overview will do' },
      { val: 'moderate',  label: 'Some',                  sub: 'Structured training over days or weeks' },
      { val: 'extensive', label: 'Quite a lot',           sub: 'Deep learning required across many roles' },
      { val: 'critical',  label: 'A great deal',          sub: 'Core job skills are fundamentally changing' },
      { val: 'unsure',    label: "Not sure",              sub: "We haven't mapped what training is needed yet" },
    ],
  },
  {
    id: 'geography',
    question: 'Where are the people affected by this change located?',
    hint: 'The more spread out your people are, the harder it is to communicate and support them consistently.',
    type: 'seg', cols: 2,
    options: [
      { val: 'single',   label: 'One location',           sub: 'Everyone is in the same place' },
      { val: 'multi',    label: 'Several locations',      sub: 'Multiple sites or offices' },
      { val: 'national', label: 'Across the country',     sub: 'Nationwide workforce' },
      { val: 'global',   label: 'Across countries',       sub: 'International workforce' },
    ],
  },
  {
    id: 'workforce',
    question: 'What does your workforce mostly look like?',
    hint: 'People who work away from a desk often need a very different approach to change.',
    type: 'seg', cols: 2,
    options: [
      { val: 'office',    label: 'Mostly desk-based',     sub: 'Office workers with ready access to email and systems' },
      { val: 'mixed',     label: 'A mix',                 sub: 'Some desk-based, some frontline or field-based' },
      { val: 'frontline', label: 'Mostly on the ground',  sub: 'Retail, operations, health, trades, or field workers' },
    ],
  },
]

export { OVERLOAD_STEPS } from '@/lib/enterprise'
export { SPONSOR_STEPS } from '@/lib/enterprise'
export { READINESS_STEPS } from '@/lib/enterprise'
export { COMMUNICATION_STEPS } from '@/lib/enterprise'
export { PEOPLE_IMPACT_STEPS } from '@/lib/enterprise'
