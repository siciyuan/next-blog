'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, Percent } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop
      const scrollHeight = doc.scrollHeight - doc.clientHeight
      const pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0
      setProgress(Math.round(pct))
      setVisible(scrollTop > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="back-to-top group"
      aria-label="回到顶部"
      title={`已阅读 ${progress}%`}
    >
      {/* 环形进度 */}
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 22}
          strokeDashoffset={2 * Math.PI * 22 * (1 - progress / 100)}
          style={{ transition: 'stroke-dashoffset 0.15s linear' }}
        />
      </svg>
      <ArrowUp
        size={18}
        className="relative z-10 transition-opacity group-hover:opacity-100 opacity-90"
      />
    </button>
  )
}
