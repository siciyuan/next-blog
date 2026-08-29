'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ThemeScheme } from '@/lib/config'

type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: ResolvedTheme
  scheme: ThemeScheme
  setScheme: (s: ThemeScheme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  scheme: 'auto',
  setScheme: () => {},
  toggleTheme: () => {},
})

function resolveTheme(scheme: ThemeScheme, prefersDark: boolean): ResolvedTheme {
  if (scheme === 'auto') return prefersDark ? 'dark' : 'light'
  return scheme
}

export function ThemeProvider({
  children,
  initialScheme = 'auto',
}: {
  children: ReactNode
  initialScheme?: ThemeScheme
}) {
  const [scheme, setSchemeState] = useState<ThemeScheme>(initialScheme)
  const [theme, setTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // 初始化：读取 localStorage 并跟随系统
  useEffect(() => {
    setMounted(true)
    const savedScheme = (localStorage.getItem('theme-scheme') as ThemeScheme | null) || initialScheme
    setSchemeState(savedScheme)

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const resolved = resolveTheme(savedScheme, mql.matches)
    setTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')

    const onChange = (e: MediaQueryListEvent) => {
      setSchemeState((curr) => {
        if (curr !== 'auto') return curr
        const next = e.matches ? 'dark' : 'light'
        setTheme(next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        return curr
      })
    }

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    } else {
      mql.addListener(onChange)
      return () => mql.removeListener(onChange)
    }
  }, [initialScheme])

  const setScheme = (s: ThemeScheme) => {
    localStorage.setItem('theme-scheme', s)
    setSchemeState(s)
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const resolved = resolveTheme(s, mql.matches)
    setTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }

  const toggleTheme = () => {
    // 在 light / dark 间切换
    const next: ResolvedTheme = theme === 'light' ? 'dark' : 'light'
    const nextScheme: ThemeScheme = next
    setScheme(nextScheme)
  }

  if (!mounted) {
    // 防止 SSR 闪烁：用一个与主题背景相同的占位包裹
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, scheme, setScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
