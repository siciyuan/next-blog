'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, scheme, setScheme } = useTheme()
  const [open, setOpen] = useState(false)

  const cycles = [
    { s: 'auto' as const, label: '跟随系统', icon: <Monitor size={15} /> },
    { s: 'light' as const, label: '亮色模式', icon: <Sun size={15} /> },
    { s: 'dark' as const, label: '暗色模式', icon: <Moon size={15} /> },
  ]

  const currentIcon =
    scheme === 'auto' ? (
      <Monitor size={17} />
    ) : theme === 'light' ? (
      <Sun size={17} />
    ) : (
      <Moon size={17} />
    )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors text-[var(--text-color)]"
        aria-label="切换主题"
        title="切换主题"
      >
        {currentIcon}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg bg-[var(--secondary-bg)] border border-[var(--border-color)] shadow-xl z-50 py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {cycles.map((c) => (
            <button
              key={c.s}
              onClick={() => {
                setScheme(c.s)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                scheme === c.s
                  ? 'text-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
                  : 'text-[var(--text-color)] hover:bg-[var(--bg-color)]'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
              {scheme === c.s && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
