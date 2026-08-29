'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface MobileSidebarTabsProps {
  widgets: { id: string; label: string; icon?: ReactNode; content: ReactNode }[]
}

/**
 * 移动端侧边栏标签切换组件（<768px 显示）：
 * - 默认只展示第一个 widget
 * - 点击标题栏展开/折叠，或切换到其他标签
 * - 避免移动端 7+ 个 widget 竖向堆叠到页脚的"长条"问题
 */
export default function MobileSidebarTabs({ widgets }: MobileSidebarTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)

  if (widgets.length === 0) return null

  const active = widgets[activeIdx]

  return (
    <div className="md:hidden mobile-sidebar-tabs">
      {/* 标签栏 */}
      <div className="flex flex-wrap gap-1 p-1.5 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-t-lg">
        {widgets.map((w, i) => (
          <button
            key={w.id}
            onClick={() => {
              setActiveIdx(i)
              setExpanded(true)
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
              i === activeIdx
                ? 'text-white'
                : 'text-[var(--muted-color)] hover:text-[var(--text-color)]'
            }`}
            style={i === activeIdx ? { background: 'var(--accent-color)' } : {}}
          >
            {w.icon}
            {w.label}
          </button>
        ))}
      </div>

      {/* 内容区（可折叠） */}
      <div className="bg-[var(--secondary-bg)] border border-t-0 border-[var(--border-color)] rounded-b-lg">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs text-[var(--muted-color)] hover:text-[var(--text-color)] transition-colors"
        >
          <span>{expanded ? '点击折叠' : '点击展开'}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        {expanded && <div className="px-2 pb-2">{active.content}</div>}
      </div>
    </div>
  )
}
