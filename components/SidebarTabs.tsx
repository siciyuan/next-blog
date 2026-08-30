'use client'

import { useState, type ReactNode } from 'react'

interface TabWidget {
  id: string
  label: string
  content: ReactNode
}

/**
 * 侧边栏标签切换组件（主线程友好）：
 * - 默认标签内容 SSR/直接渲染；其它 tab 内容【首次切换到才挂载】
 *   （原来一次性渲染 7 个 widget 的完整 DOM，现在首屏只输出 1 个。
 *   水合时直接减掉 ~450 个 DOM 节点及其样式计算 → 显著降 TBT / 提升 SI）
 * - 已看过的 tab 保留挂载，避免重新渲染；切换不会引起重新挂。
 * - 用固定 min-height 预留"标签内容区域"的大致空间 → CLS ≤ 0
 */
export default function SidebarTabs({ widgets }: { widgets: TabWidget[] }) {
  const [active, setActive] = useState(0)
  // 已激活过的索引集合（已挂载过的内容保留挂载）
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]))

  if (widgets.length === 0) return null

  const activate = (i: number) => {
    if (i === active) return
    setActive(i)
    setMounted((prev) => {
      if (prev.has(i)) return prev
      const next = new Set(prev)
      next.add(i)
      return next
    })
  }

  return (
    <div className="sidebar-tabs-panel sidebar-widget card-radius-medium">
      {/* 标签栏 */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-[var(--border-light)]">
        {widgets.map((w, i) => (
          <button
            key={w.id}
            type="button"
            onClick={() => activate(i)}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              i === active
                ? 'text-white font-medium'
                : 'text-[var(--muted-color)] hover:text-[var(--text-color)] hover:bg-[var(--bg-color)]'
            }`}
            style={i === active ? { background: 'var(--accent-color)' } : {}}
          >
            {w.label}
          </button>
        ))}
      </div>
      {/* 内容区：已挂载过的才输出 DOM；非激活的 display:none 即可（已加载内容无需重复 mount） */}
      <div className="p-1" style={{ minHeight: 280 }}>
        {widgets.map((w, i) =>
          mounted.has(i) ? (
            <div
              key={w.id}
              style={{ display: i === active ? 'block' : 'none' }}
              aria-hidden={i !== active}
            >
              {w.content}
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}
