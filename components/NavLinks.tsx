'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavLinkItem {
  label: string
  path: string
  icon?: React.ReactNode
  badge?: string
}

interface NavLinksProps {
  items: NavLinkItem[]
  badges?: Record<string, number>
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

/** 路径归一化：去掉尾部斜杠，根路径统一为 / */
function normalize(p: string) {
  const n = p.replace(/\/+$/, '')
  return n === '' ? '/' : n
}

/**
 * 导航链接（客户端组件）：
 * - 通过 usePathname 实现当前页高亮
 * - desktop: 水平导航 + NexT 风格下划线动画
 * - mobile: 垂直大触控目标列表（用于移动端抽屉）
 */
export default function NavLinks({
  items,
  badges = {},
  variant = 'desktop',
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname() || '/'

  const isActive = (path: string) => {
    const cur = normalize(pathname)
    const target = normalize(path)
    if (target === '/') return cur === '/'
    return cur === target || cur.startsWith(target + '/')
  }

  // ---------- 移动端垂直列表 ----------
  if (variant === 'mobile') {
    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.path)
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-lg text-[15px] transition-colors ${
                  active
                    ? 'text-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] font-medium'
                    : 'text-[var(--text-color)] hover:bg-[var(--border-light)] hover:text-[var(--accent-color)]'
                }`}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && badges[item.badge] !== undefined && (
                  <span className="nav-badge ml-auto">{badges[item.badge]}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  // ---------- 桌面端水平导航 ----------
  return (
    <nav className="hidden md:flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(item.path)
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-sm rounded group transition-colors ${
              active
                ? 'text-[var(--accent-color)] font-medium'
                : 'text-[var(--text-color)] hover:text-[var(--accent-color)]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && badges[item.badge] !== undefined && (
              <span className="nav-badge">{badges[item.badge]}</span>
            )}
            {/* NexT 风格下划线：当前页常显，悬停渐进 */}
            <span
              aria-hidden
              className={`absolute left-3 right-3 -bottom-0.5 h-0.5 bg-[var(--accent-color)] origin-left transition-transform duration-300 ${
                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
          </Link>
        )
      })}
    </nav>
  )
}
