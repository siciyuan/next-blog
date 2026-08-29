'use client'

import { useState, type ReactNode } from 'react'

interface TabWidget {
  id: string
  label: string
  content: ReactNode
}

/**
 * 侧边栏标签切换组件（移动端 + 桌面端统一）：
 * - profile 之外的所有 widget 压缩为标签面板
 * - 默认只显示第一个标签的内容，点击切换
 * - 避免所有 widget 竖排导致 sidebar 过长延伸到页脚
 */
export default function SidebarTabs({ widgets }: { widgets: TabWidget[] }) {
  const [active, setActive] = useState(0)

  if (widgets.length === 0) return null

  return (
    <div className="sidebar-tabs-panel sidebar-widget card-radius-medium">
      {/* 标签栏 */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-[var(--border-light)]">
        {widgets.map((w, i) => (
          <button
            key={w.id}
            onClick={() => setActive(i)}
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
      {/* 内容区 */}
      <div className="p-1">{widgets[active].content}</div>
    </div>
  )
}
