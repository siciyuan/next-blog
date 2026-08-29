'use client'

import { useState } from 'react'
import { Menu as MenuIcon, X as XIcon } from 'lucide-react'
import NavLinks, { type NavLinkItem } from './NavLinks'

interface MobileMenuProps {
  items: NavLinkItem[]
  badges?: Record<string, number>
}

/**
 * 移动端汉堡菜单（< md 屏显示）：
 * 点击展开全宽下拉抽屉，包含导航链接；点击链接后自动收起
 */
export default function MobileMenu({ items, badges }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors text-[var(--text-color)]"
      >
        {open ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {open && (
        <>
          {/* 点击遮罩关闭 */}
          <div
            className="fixed inset-0 top-16 z-30 bg-black/20 dark:bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* 下拉抽屉 */}
          <div className="mobile-nav-panel fixed left-0 right-0 top-16 z-40 bg-[var(--bg-color)]/95 backdrop-blur-md border-b border-[var(--border-color)] shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="py-3">
              <NavLinks
                variant="mobile"
                items={items}
                badges={badges}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
