'use client'

import { useEffect, useState } from 'react'
import { List, ChevronDown, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TocSidebarSlotProps {
  collapsed?: boolean
}

/**
 * pisces 布局专用：文章页时将目录挂载到侧栏面板顶部。
 * 目录数据从当前文档的 .markdown-content 标题中实时扫描（与 Toc 保持一致），
 * 非文章页渲染 null，不占位。
 */
export default function TocSidebarSlot({ collapsed = false }: TocSidebarSlotProps) {
  const pathname = usePathname() || '/'
  const isPostPage = /^\/posts\/[^/]+\/?$/.test(pathname.replace(/\/+$/, '') + '/')

  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')
  const [isOpen, setIsOpen] = useState(!collapsed)

  useEffect(() => {
    if (!isPostPage) {
      setItems([])
      return
    }
    // 等待正文渲染完成后扫描标题
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll(
        '.markdown-content h2, .markdown-content h3, .markdown-content h4'
      )
      const tocItems: TocItem[] = []
      headings.forEach((h, i) => {
        if (!h.id) {
          const base = (h.textContent || `h${i}`).trim().toLowerCase()
          let slug = ''
          for (let k = 0; k < base.length; k++) {
            const c = base.charAt(k)
            const cp = base.charCodeAt(k)
            const isLetter =
              (c >= 'a' && c <= 'z') ||
              (c >= '0' && c <= '9') ||
              (cp >= 0x4e00 && cp <= 0x9fff) ||
              (cp >= 0x3040 && cp <= 0x30ff) ||
              (cp >= 0xac00 && cp <= 0xd7af)
            slug += isLetter ? c : '-'
          }
          h.id = 'heading-' + slug.replace(/-+/g, '-').replace(/(^-|-$)/g, '') + `-${i}`
        }
        tocItems.push({
          id: h.id,
          text: h.textContent || '',
          level: parseInt(h.tagName[1], 10),
        })
      })
      setItems(tocItems)
    }, 50)
    return () => clearTimeout(timer)
  }, [isPostPage, pathname])

  // 滚动高亮
  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    document
      .querySelectorAll('.markdown-content h2, .markdown-content h3, .markdown-content h4')
      .forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items.length])

  if (!isPostPage || items.length === 0) return null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 90
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="sidebar-widget card-radius-medium toc-container">
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
                style={{ ['--level' as string]: item.level }}
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
