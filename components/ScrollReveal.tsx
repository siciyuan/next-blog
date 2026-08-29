'use client'

import { useEffect } from 'react'

/**
 * 滚动进入视口淡入特效：
 * - IntersectionObserver 监听带 .reveal 类名的元素
 * - 进入视口时添加 .revealed，触发 CSS 动画（fade-up / fade-in / zoom-in）
 * - 默认给常见元素自动添加 reveal class（post-card / sidebar-widget / hero 副标题 / archive-item / footer / 友情链接卡片 等）
 * - 支持 reveal-delay 自定义延迟：通过 style.--reveal-delay (ms)
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('IntersectionObserver' in window)) {
      // 不支持 IO 的浏览器，直接把所有 reveal 显示出来
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'))
      return
    }

    const root = document.documentElement
    root.classList.add('scroll-reveal-enabled')

    // 自动给常见元素加上 reveal 类（避免改其它 server 组件）
    const autoSelectors = [
      '.post-card',
      '.sidebar-widget',
      '.hero-subtitle',
      '.hero-desc',
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
    autoSelectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
        if (!el.classList.contains('reveal') && !el.classList.contains('revealed')) {
          el.classList.add('reveal')
          // 按 siblings 顺序稍微错开一点，形成瀑布式出现
          const delay = Math.min(i % 8, 6) * 80
          el.style.setProperty('--reveal-delay', `${delay}ms`)
        }
      })
    })

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

    // 监听 DOM 变化：路由切换 / 新元素加入时重新观察
    let rafId = 0
    const mo = new MutationObserver(() => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
          io.observe(el)
        })
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
