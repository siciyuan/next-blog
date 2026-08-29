'use client'

import { useEffect } from 'react'

/**
 * 滚动进入视口淡入特效（性能友好版）：
 * - 首屏（初始视口内）元素【不做隐藏】——直接标记 revealed，避免「水合后闪隐再淡入」
 *   拖慢 FCP / SI / LCP（Lighthouse 的 SI 13s / TBT 6s 主要元凶）
 * - 只有初始视口外的元素才加 .reveal，滚动进入视口时淡入
 * - MutationObserver 仅在 rAF 空闲时重新观察新元素
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('IntersectionObserver' in window)) return

    const root = document.documentElement
    // 不做「已启用即跳过」守卫：StrictMode 双执行 / Fast Refresh 重挂时
    // cleanup 会移除 root 类并完整重新初始化，保证标记逻辑总能执行
    root.classList.add('scroll-reveal-enabled')

    const vh = window.innerHeight

    // 自动给常见元素加上 reveal 类（避免改其它 server 组件）
    const autoSelectors = [
      '.post-card',
      '.sidebar-widget',
      '.hero-banner',
      '.hero-stats-card',
      '.archive-year-card',
      '.archive-timeline-item',
      '.category-card',
      '.tag-cloud-item',
      '.friend-card',
      '.site-footer',
      '.page-header',
      '.markdown-content > *',
      '.post-footer-block',
      '.post-nav-item',
    ]

    const markAll = () => {
      autoSelectors.forEach((sel) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (el.classList.contains('reveal') || el.classList.contains('revealed')) return
          // 已在初始视口内的元素：直接 revealed（不隐藏、不闪隐、无动画开销）
          const rect = el.getBoundingClientRect()
          if (rect.top < vh && rect.bottom > 0) {
            el.classList.add('revealed')
            return
          }
          el.classList.add('reveal')
          // 首屏之下的按 DOM 顺序轻微错开，形成瀑布式出现
          const delay = Math.min(document.querySelectorAll('.reveal').length % 8, 6) * 60
          el.style.setProperty('--reveal-delay', `${delay}ms`)
        })
      })
    }

    markAll()

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = parseInt(el.style.getPropertyValue('--reveal-delay') || '0', 10)
            if (delay > 0) {
              setTimeout(() => el.classList.add('revealed'), delay)
            } else {
              el.classList.add('revealed')
            }
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

    // 路由切换 / 新元素加入 / React 重渲染重置 className 时重新标记
    // （监听 class 属性变化：客户端组件重建 DOM 节点后自动补上 reveal/revealed）
    let timerId: ReturnType<typeof setTimeout> | undefined
    const mo = new MutationObserver(() => {
      if (timerId) return
      timerId = setTimeout(() => {
        timerId = undefined
        markAll()
        document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => io.observe(el))
      }, 300)
    })
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      io.disconnect()
      mo.disconnect()
      if (timerId) clearTimeout(timerId)
      root.classList.remove('scroll-reveal-enabled')
    }
  }, [])

  return null
}
