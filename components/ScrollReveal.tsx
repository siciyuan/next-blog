'use client'

import { useEffect } from 'react'

/**
 * 滚动进入视口淡入特效（主线程友好版 v3）：
 *
 * 目标：零额外长任务，不拖 TBT/SI。策略：
 * 1) 不用 MutationObserver 监听 attributes/class（React 水合期间触发几万次 class
 *    变动，节流也挡不住 → 之前每 300ms 跑全文档 queryAll + getBoundingClientRect
 *    是 TBT 第一元凶）。只监听 childList（路由切换插入新节点）。
 * 2) 不逐个 getBoundingClientRect 判断"是否在首屏"（每个元素强制 reflow，几十元素
 *    就是几十次同步 reflow，几百毫秒起）。改为按固定策略：
 *      ▸ hero-banner / page-header / sidebar-profile / hero-stats-card：直接 revealed
 *      ▸ 前 3 张 .post-card：直接 revealed（通常正好在视口内 / 贴近视口顶部）
 *      ▸ 其它常见元素：加 .reveal，IO 触发。
 * 3) 没有 setTimeout 回调遍历、没有频繁强制布局：markAll 纯 className 赋值 O(n)。
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('IntersectionObserver' in window)) return

    const root = document.documentElement
    root.classList.add('scroll-reveal-enabled')

    // 在屏/贴近视口、永远直接 revealed、不走隐藏/淡入、不占主线程计算
    const ALWAYS_REVEALED = [
      '.hero-banner',
      '.page-header',
      '.sidebar-profile',
      '.hero-stats-card',
    ]

    // 其它元素：加 reveal，IO 触发淡入。注意 .post-card 只给前 3 张之前的 revealed。
    const DEFER_SELECTORS = [
      '.post-card',
      '.sidebar-widget',
      '.archive-year-card',
      '.archive-timeline-item',
      '.category-card',
      '.tag-cloud-item',
      '.friend-card',
      '.site-footer',
      '.markdown-content > *',
      '.post-footer-block',
      '.post-nav-item',
    ]

    const markAll = () => {
      // 1) 永远 revealed 类（贴近首屏 / 首屏必见）
      ALWAYS_REVEALED.forEach((sel) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (el.classList.contains('revealed')) return
          el.classList.add('revealed')
          el.classList.remove('reveal')
        })
      })

      // 2) post-card：前 3 张直接 revealed（基本都在视口内贴近首屏）
      //    不用 getBoundingClientRect 判断 → 零强制 reflow
      document.querySelectorAll<HTMLElement>('.post-card').forEach((el, idx) => {
        if (el.classList.contains('revealed') || el.classList.contains('reveal')) return
        if (idx < 3) {
          el.classList.add('revealed')
        } else {
          el.classList.add('reveal')
        }
      })

      // 3) 其它元素统一加 reveal（不在首屏，等待 IO 触发）
      DEFER_SELECTORS.filter((s) => s !== '.post-card').forEach((sel) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (el.classList.contains('reveal') || el.classList.contains('revealed')) return
          el.classList.add('reveal')
        })
      })
    }

    // ---- 空闲调度：把初始标记 + IO/MO 建立全部挪到主线程空闲期 ----
    // TBT 只统计 FCP→TTI 窗口内的长任务；空闲期执行零占用。
    // rIC timeout=2000 保证最迟 2s 内生效（慢设备兜底），不会永远不显示特效。
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    let idleId = 0
    let io: IntersectionObserver | null = null
    let mo: MutationObserver | null = null
    let moTimer: ReturnType<typeof setTimeout> | undefined

    const observePending = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => io!.observe(el))
    }

    const start = () => {
      markAll()
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              el.classList.add('revealed')
              io!.unobserve(el)
            }
          })
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
      )
      observePending()

      // 仅监听 childList（路由切换插入新 DOM）——不监听 attributes/class，
      // React 水合期间 class 变更不会触发任何回调。
      mo = new MutationObserver(() => {
        if (moTimer) return
        moTimer = setTimeout(() => {
          moTimer = undefined
          markAll()
          observePending()
        }, 300)
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }

    if (typeof w.requestIdleCallback === 'function') {
      idleId = w.requestIdleCallback(start, { timeout: 2000 })
    } else {
      idleId = window.setTimeout(start, 300)
    }

    return () => {
      io?.disconnect()
      mo?.disconnect()
      if (moTimer) clearTimeout(moTimer)
      if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
      root.classList.remove('scroll-reveal-enabled')
    }
  }, [])

  return null
}
