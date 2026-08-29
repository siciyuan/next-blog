'use client'

import { useEffect, useMemo, useState } from 'react'
import { List, ChevronDown, ChevronRight } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TocProps {
  content: string
  collapsed?: boolean
}

export default function Toc({ content, collapsed = false }: TocProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')
  const [isOpen, setIsOpen] = useState(!collapsed)

  // 从 HTML 内容解析 h2/h3/h4 并在 markdown-content DOM 中同步设置 id
  useEffect(() => {
    const headings = document.querySelectorAll(
      '.markdown-content h2, .markdown-content h3, .markdown-content h4'
    )
    const tocItems: TocItem[] = []
    headings.forEach((h, i) => {
      // 如果没有 id，则生成并设置（用兼容 es5 的 slug 方案，避免 \p{} unicode 标志）
      if (!h.id) {
        const base = (h.textContent || `h${i}`).trim().toLowerCase()
        // 用原生逐字符替换：保留字母/数字/中文字符 (\u4e00-\u9fff)，其他替换为 -
        let slug = ''
        for (let k = 0; k < base.length; k++) {
          const c = base.charAt(k)
          const cp = base.charCodeAt(k)
          const isLetter =
            (c >= 'a' && c <= 'z') ||
            (c >= '0' && c <= '9') ||
            (cp >= 0x4e00 && cp <= 0x9fff) || // CJK 基本汉字
            (cp >= 0x3040 && cp <= 0x30ff) || // 日文假名
            (cp >= 0xac00 && cp <= 0xd7af) // 韩文
          if (isLetter) slug += c
          else slug += '-'
        }
        const generated =
          'heading-' + slug.replace(/-+/g, '-').replace(/(^-|-$)/g, '') + `-${i}`
        h.id = generated
      }
      const level = parseInt(h.tagName[1], 10)
      tocItems.push({ id: h.id, text: h.textContent || '', level })
    })
    setItems(tocItems)
  }, [content])

  // 滚动监听，高亮当前标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    const headings = document.querySelectorAll(
      '.markdown-content h2, .markdown-content h3, .markdown-content h4'
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items.length])

  if (items.length === 0) return null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="toc-container">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="toc-title w-full justify-between hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          <List size={14} /> 目录
          <span className="text-xs font-normal text-[var(--muted-color)]">({items.length})</span>
        </span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <ul className="toc-list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(item.id)
                }}
                className={`toc-link ${activeId === item.id ? 'active' : ''}`}
                style={{ ['--level' as any]: item.level }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
