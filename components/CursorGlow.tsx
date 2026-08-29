'use client'

import { useEffect, useRef } from 'react'

/**
 * 自定义彩色鼠标光标：
 * - 双层：一个小的实心圆点 cursor-dot（紧跟鼠标），一个较大的渐变色光晕 cursor-glow（平滑跟随）
 * - 使用 requestAnimationFrame 做 lerp 平滑插值，避免光标抖动
 * - 悬停在链接 / 按钮 / 可点击元素上时：glow 放大 + 外发光加强 + dot 变色
 * - 通过 matchMedia('(pointer: coarse)') 检测触摸设备，自动关闭避免移动端卡顿
 */
export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 触摸设备 / 无精细指针设备 自动关闭
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    if (coarse) return

    const dot = dotRef.current
    const glow = glowRef.current
    if (!dot || !glow) return

    // 目标位置 & 当前位置（lerp 平滑）
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let curX = targetX
    let curY = targetY

    // 尺寸状态
    let hoverScale = 1
    let targetHover = 1

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    // 悬停检测：匹配所有可交互元素
    const interactiveSelector = [
      'a',
      'button',
      'input',
      'select',
      'textarea',
      'label',
      '[role="button"]',
      '[data-cursor="hover"]',
      '.post-card',
      '.sidebar-widget',
      '.tag-cloud-item',
      '.category-card',
      '.toc-link',
    ].join(',')

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (el && el.closest?.(interactiveSelector)) {
        targetHover = 2.2
      } else {
        targetHover = 1
      }
    }

    const onDown = () => {
      targetHover = 0.85
    }
    const onUp = () => {
      targetHover = 1
    }

    const onLeave = () => {
      dot.style.opacity = '0'
      glow.style.opacity = '0'
    }
    const onEnter = () => {
      dot.style.opacity = '1'
      glow.style.opacity = '1'
    }

    let rafId = 0
    const tick = () => {
      // lerp
      curX += (targetX - curX) * 0.22
      curY += (targetY - curY) * 0.22
      hoverScale += (targetHover - hoverScale) * 0.22

      // dot 紧跟（快）
      const dx = targetX + (curX - targetX) * 0.05
      const dy = targetY + (curY - targetY) * 0.05
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`

      // glow 慢跟随 + 随 hoverScale 变大小
      const size = 28 * hoverScale
      glow.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`
      glow.style.width = size + 'px'
      glow.style.height = size + 'px'
      if (hoverScale > 1.5) {
        glow.dataset.hover = '1'
      } else {
        glow.dataset.hover = '0'
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    // 隐藏原生光标：只对非表单区域生效
    const rootStyle = document.documentElement
    rootStyle.style.setProperty('--cursor-hide', '1')

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      rootStyle.style.removeProperty('--cursor-hide')
    }
  }, [])

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
