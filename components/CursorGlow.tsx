'use client'

import { useEffect, useRef } from 'react'

/**
 * 自定义彩色鼠标光标（性能友好版）：
 * - 双层：小实心圆点 cursor-dot（紧跟鼠标）+ 渐变光晕 cursor-glow（lerp 平滑跟随）
 * - rAF 循环【按需运行】：鼠标静止且动画收敛后自动停止，空闲时零主线程占用
 *   （持续 rAF + mix-blend-mode/backdrop-filter 是 TBT 6s 的元凶之一，已移除）
 * - 悬停链接 / 按钮 / 可点击元素：glow 放大 + 变色
 * - 触摸设备（pointer: coarse）自动关闭
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
    let targetX = -100
    let targetY = -100
    let curX = -100
    let curY = -100
    let hoverScale = 1
    let targetHover = 1

    let rafId = 0
    let running = false
    let firstMove = true

    const tick = () => {
      curX += (targetX - curX) * 0.22
      curY += (targetY - curY) * 0.22
      hoverScale += (targetHover - hoverScale) * 0.22

      // dot 紧跟（几乎无延迟）
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`

      // glow 平滑跟随；缩放走 transform（不触发 layout，仅合成）
      glow.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${hoverScale.toFixed(3)})`

      // 收敛判定：全部接近目标时停止 rAF，等下次 mousemove 再唤醒
      const settled =
        Math.abs(targetX - curX) < 0.3 &&
        Math.abs(targetY - curY) < 0.3 &&
        Math.abs(targetHover - hoverScale) < 0.01

      if (settled) {
        running = false
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (!running) {
        running = true
        rafId = requestAnimationFrame(tick)
      }
    }

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (firstMove) {
        // 首次移动：跳过从屏幕外飞入的插值
        curX = targetX
        curY = targetY
        dot.style.opacity = '1'
        glow.style.opacity = '1'
        firstMove = false
      }
      wake()
    }

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
      const interactive = !!(el && el.closest?.(interactiveSelector))
      const next = interactive ? 2.2 : 1
      if (next !== targetHover) {
        targetHover = next
        // 颜色态只在状态切换时写，避免每帧 DOM attribute 写入
        glow.dataset.hover = interactive ? '1' : '0'
        wake()
      }
    }

    const onDown = () => {
      targetHover = 0.85
      wake()
    }
    const onUp = () => {
      targetHover = 1
      wake()
    }

    const onLeave = () => {
      dot.style.opacity = '0'
      glow.style.opacity = '0'
    }
    const onEnter = () => {
      dot.style.opacity = '1'
      glow.style.opacity = '1'
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

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
