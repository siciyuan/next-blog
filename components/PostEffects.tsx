'use client'

import { useEffect, useRef } from 'react'
import { highlightCode } from '@/lib/highlight'
import type { CodeTheme } from '@/lib/config'

interface PostEffectsProps {
  showProgress?: boolean
  copyButton?: boolean
  codeTheme?: CodeTheme
}

/**
 * 文章页的客户端增强效果（主线程友好版 v2）：
 * - 顶部阅读进度条（RAF + scroll passive）
 * - 代码块：
 *     ▸ 先做"轻量 DOM 改造"（包 wrap + 插按钮 + 插语言标签），不卡
 *     ▸ 语法高亮正则分词是重 CPU ——【不在视口的 code 块，用 IO 延迟到滚到前 200px 才高亮】
 *       直接避免一进入长文页就对 20+ 代码块跑完整正则分词。
 * - 图片：懒加载 + 点击放大。
 */
export default function PostEffects({
  showProgress = true,
  copyButton = true,
  codeTheme = 'github',
}: PostEffectsProps) {
  const highlightRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // ---------- 阅读进度条（rAF 节流）----------
    let rafId = 0
    let scheduled = false
    const update = () => {
      scheduled = false
      const bar = document.getElementById('reading-progress')
      if (!bar) return
      const doc = document.documentElement
      const top = window.scrollY || doc.scrollTop
      const height = doc.scrollHeight - doc.clientHeight
      const pct = height > 0 ? Math.min(100, (top / height) * 100) : 0
      bar.style.width = pct + '%'
    }
    const onScroll = () => {
      if (scheduled) return
      scheduled = true
      rafId = window.requestAnimationFrame(update)
    }
    if (showProgress) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      update()
    }

    // ---------- 代码块：先做 DOM 包壳 + 按钮 + 语言标签（轻量）----------
    const cleanups: (() => void)[] = []

    const applyHighlight = (code: HTMLElement, lang: string | undefined) => {
      if (code.dataset.highlighted || codeTheme === 'none') return
      code.dataset.highlighted = '1'
      code.innerHTML = highlightCode(code.textContent || '', lang)
    }

    // 视外 code 块 → 延迟高亮（IO）；视内 → 立即高亮
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const code = entry.target as HTMLElement
            const lang = code.className.match(/language-([\w-]+)/)?.[1]
            applyHighlight(code, lang)
            io?.unobserve(code)
          })
        },
        { rootMargin: '200px 0px 200px 0px', threshold: 0 },
      )
      highlightRef.current = io
    }

    document.querySelectorAll('.markdown-content pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn') || pre.parentElement?.classList.contains('code-block-wrap')) {
        return
      }

      // 包裹一层相对定位容器（轻量 DOM 操作）
      const wrap = document.createElement('div')
      wrap.style.position = 'relative'
      wrap.className = 'code-block-wrap'
      pre.parentNode?.insertBefore(wrap, pre)
      wrap.appendChild(pre)

      const code = pre.querySelector<HTMLElement>('code')
      const lang = code?.className.match(/language-([\w-]+)/)?.[1]

      // 高亮：视内立即，视外 IO 延迟
      if (code && codeTheme !== 'none' && !code.dataset.highlighted) {
        if (!io) {
          applyHighlight(code, lang) // 无 IO 兜底
        } else {
          const rect = code.getBoundingClientRect()
          // 首屏高度范围（-200 → viewportH + 200）视为"即将进入视口"
          const vh = window.innerHeight || 800
          if (rect.top < vh + 200 && rect.bottom > -200) {
            applyHighlight(code, lang)
          } else {
            io.observe(code)
          }
        }
      }

      if (lang) {
        const label = document.createElement('span')
        label.className = 'code-lang-label'
        label.textContent = lang
        wrap.appendChild(label)
      }

      if (copyButton && code) {
        const btn = document.createElement('button')
        btn.className = 'copy-btn'
        btn.type = 'button'
        btn.textContent = '复制'
        btn.style.opacity = '0'
        wrap.appendChild(btn)

        const onEnter = () => (btn.style.opacity = '1')
        const onLeave = () => (btn.style.opacity = '0')
        wrap.addEventListener('mouseenter', onEnter)
        wrap.addEventListener('mouseleave', onLeave)

        const onClick = async () => {
          const text = code.textContent || ''
          try {
            await navigator.clipboard.writeText(text)
            const old = btn.textContent
            btn.textContent = '✓ 已复制'
            btn.style.color = 'var(--accent-color)'
            setTimeout(() => {
              btn.textContent = old
              btn.style.color = ''
            }, 1500)
          } catch {
            btn.textContent = '复制失败'
            setTimeout(() => (btn.textContent = '复制'), 1500)
          }
        }
        btn.addEventListener('click', onClick)

        cleanups.push(() => {
          wrap.removeEventListener('mouseenter', onEnter)
          wrap.removeEventListener('mouseleave', onLeave)
          btn.removeEventListener('click', onClick)
        })
      }
    })

    // ---------- 图片懒加载 + 点击放大（lightbox）----------
    const images = document.querySelectorAll<HTMLImageElement>('.markdown-content img')
    images.forEach((img) => {
      if (img.dataset.enhanced) return
      img.dataset.enhanced = '1'
      img.loading = 'lazy'
      img.decoding = 'async'
      img.style.cursor = 'zoom-in'

      const onClick = () => {
        const overlay = document.createElement('div')
        overlay.className = 'img-lightbox-overlay'
        overlay.innerHTML = `<img src="${img.src}" alt="${img.alt}" class="img-lightbox-img" />`
        document.body.appendChild(overlay)
        document.body.style.overflow = 'hidden'
        overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' })

        const close = () => {
          overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' })
            .onfinish = () => {
            overlay.remove()
            document.body.style.overflow = ''
          }
        }
        overlay.addEventListener('click', close)
        const onEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') close()
        }
        document.addEventListener('keydown', onEsc)
      }
      img.addEventListener('click', onClick)
    })

    return () => {
      if (showProgress) {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        if (rafId) cancelAnimationFrame(rafId)
      }
      io?.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [showProgress, copyButton, codeTheme])

  if (!showProgress) return null

  return <div id="reading-progress" className="reading-progress" style={{ width: '0%' }} />
}
