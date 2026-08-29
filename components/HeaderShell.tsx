'use client'

import { useEffect, useState } from 'react'

/**
 * 站点头部外壳（客户端）：
 * - 提供 sticky 定位
 * - 页面滚动后追加阴影，增强层次感
 */
export default function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`site-header-wrap sticky top-0 z-50 ${scrolled ? 'is-scrolled' : ''}`}>
      {children}
    </div>
  )
}
