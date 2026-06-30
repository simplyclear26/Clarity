import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap', weight: ['300','400','500'] })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap', weight: '400', style: ['normal','italic'] })

export const metadata: Metadata = {
  title: 'Clarity Suite™ — Simply Clear',
  description: 'Free diagnostics for leaders navigating enterprise transformation and small business complexity.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="font-sans bg-white text-[#1C1C1E] antialiased">{children}</body>
    </html>
  )
}
