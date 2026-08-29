'use client'

import { useEffect } from 'react'
import { highlightCode } from '@/lib/highlight'
import type { CodeTheme } from '@/lib/config'

interface PostEffectsProps {
  showProgress?: boolean
  copyButton?: boolean
  codeTheme?: CodeTheme
}

/**
 * 文章页的客户端增强效果：
 * - 顶部阅读进度条
 * - 代码块：语法高亮 + 语言标签（常显）+ 复制按钮（悬停显示）
 * - 文章图片：点击放大（轻量 lightbox，ESC 关闭）
 * - 文章图片：懒加载（loading=lazy + decode=async）
 */
export default function PostEffects({
  showProgress = true,
  copyButton = true,
  codeTheme = 'github',
}: PostEffectsProps) {
  useEffect(() => {
    // ---------- 阅读进度条 ----------
    let removeScroll: (() => void) | undefined

    if (showProgress) {
      const bar = document.getElementById('reading-progress')
      if (bar) {
        const update = () => {
          const doc = document.documentElement
          const top = window.scrollY || doc.scrollTop
          const height = doc.scrollHeight - doc.clientHeight
          const pct = height > 0 ? Math.min(100, (top / height) * 100) : 0
          bar.style.width = pct + '%'
        }
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        update()
        removeScroll = () => {
          window.removeEventListener('scroll', update)
          window.removeEventListener('resize', update)
        }
      }
    }

    // ---------- 代码块：包裹 + 语言标签 + 复制按钮 ----------
    const cleanups: (() => void)[] = []

    document.querySelectorAll('.markdown-content pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn') || pre.parentElement?.classList.contains('code-block-wrap')) {
        return
      }

      // 包裹一层相对定位容器
      const wrap = document.createElement('div')
      wrap.style.position = 'relative'
      wrap.className = 'code-block-wrap'
      pre.parentNode?.insertBefore(wrap, pre)
      wrap.appendChild(pre)

      // 语言标签（从 code 的 language-* class 提取）
      const code = pre.querySelector('code')
      const lang = code?.className.match(/language-([\w-]+)/)?.[1]

      // 语法高亮（幂等：已处理则跳过）
      if (code && codeTheme !== 'none' && !code.dataset.highlighted) {
        code.dataset.highlighted = '1'
        code.innerHTML = highlightCode(code.textContent || '', lang)
      }

      if (lang) {
        const label = document.createElement('span')
        label.className = 'code-lang-label'
        label.textContent = lang
        wrap.appendChild(label)
      }

      // 复制按钮
      if (copyButton) {
        const btn = document.createElement('button')
        btn.className = 'copy-btn'
        btn.type = 'button'
        btn.textContent = '复制'
        wrap.appendChild(btn)

        const onEnter = () => (btn.style.opacity = '1')
        const onLeave = () => (btn.style.opacity = '0')
        wrap.addEventListener('mouseenter', onEnter)
        wrap.addEventListener('mouseleave', onLeave)

        const onClick = async () => {
          const text = (code || pre).textContent || ''
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

    // ---------- 图片懒加载 + 点击放大（轻量 lightbox） ----------
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
      removeScroll?.()
      cleanups.forEach((fn) => fn())
    }
  }, [showProgress, copyButton, codeTheme])

  if (!showProgress) return null

  return <div id="reading-progress" className="reading-progress" style={{ width: '0%' }} />
}
