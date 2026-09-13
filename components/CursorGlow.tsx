'use client'

import { useEffect, useRef } from 'react'

/**
 * 自定义彩色鼠标光标（速度自适应物理模型）
 *
 * - dot：紧贴鼠标的精确小圆点（零延迟）
 * - glow：光晕环，帧率无关（delta-time 归一化）的指数平滑跟随
 *   · 鼠标移动越快 → 跟随系数越大（快速追上、不脱节）
 *                + 光晕沿运动方向被拉长成拖尾椭圆
 *   · 鼠标变慢 / 停止 → 系数变小（长拖尾、更丝滑）+ 弹性恢复正圆
 * - rAF 按需运行：鼠标静止且动画收敛后自动停止，空闲时零主线程占用
 * - 悬停链接 / 按钮等可交互元素：光晕放大 + 变蓝；按下时压缩回弹
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

    // 目标位置（鼠标真实位置）& 光晕当前位置
    let targetX = -100
    let targetY = -100
    let curX = -100
    let curY = -100

    // 悬停 / 按下状态
    let hoverActive = false
    let hoverTarget = 1 // 悬停可交互元素 → 2.2
    let pressTarget = 1 // 按下 → 0.82
    let hoverScale = 1 // 平滑后的当前值

    // 速度拖尾状态
    let stretch = 0 // 当前拉伸量 0~0.85
    let angle = 0 // 拉伸方向（弧度）

    let rafId = 0
    let running = false
    let firstMove = true
    let lastTs = 0

    /**
     * 帧率无关的指数插值系数：
     * dt = 16.67ms（60fps）时结果恰好等于 rate；
     * 120fps / 30fps 下动画速度体感一致，不会忽快忽慢。
     */
    const frameFactor = (rate: number, dt: number) =>
      1 - Math.pow(1 - rate, dt / 16.667)

    const tick = (ts: number) => {
      const dt = lastTs ? Math.min(ts - lastTs, 50) : 16.667
      lastTs = ts

      // ---- 位置跟随 ----
      // 光晕与鼠标之间的滞后距离即天然的速度指标：
      // 匀速移动时滞后量与速度正相关，无需额外计算事件速度。
      const lagX = targetX - curX
      const lagY = targetY - curY
      const lag = Math.hypot(lagX, lagY)

      // 速度归一化：滞后 0px → 0，170px → 1
      const speedNorm = Math.min(lag / 170, 1)

      // 跟随系数随速度变化：
      // 慢速 0.14（拖尾长、手感绵密）↔ 快速 0.55（跟手、不脱节）
      const rate = 0.14 + speedNorm * 0.41
      const f = frameFactor(rate, dt)
      curX += lagX * f
      curY += lagY * f

      // ---- 方向 & 拉伸（拖尾） ----
      let targetStretch = 0
      if (lag > 2) {
        const targetAngle = Math.atan2(lagY, lagX)
        // 角度插值，处理 ±π 边界跳变
        let da = targetAngle - angle
        while (da > Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        angle += da * frameFactor(0.25, dt)
        // 速度越快拉得越长（平方曲线让中低速更克制，高速更有张力）
        targetStretch = speedNorm * speedNorm
      }
      stretch += (targetStretch - stretch) * frameFactor(0.16, dt)

      // ---- 悬停缩放（独立平滑，按下在其基础上压缩） ----
      const scaleGoal = hoverTarget * pressTarget
      hoverScale += (scaleGoal - hoverScale) * frameFactor(0.22, dt)

      // ---- 写样式：每帧只写一个 transform，全程合成层、零 layout ----
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`

      const sx = hoverScale * (1 + stretch)
      const sy = hoverScale * (1 - stretch * 0.42)
      const deg = ((angle * 180) / Math.PI).toFixed(2)
      glow.style.transform =
        `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) ` +
        `translate(-50%, -50%) rotate(${deg}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`

      // ---- 收敛判定：全部接近目标则停止 rAF，等下次 mousemove 唤醒 ----
      const settled =
        Math.abs(targetX - curX) < 0.25 &&
        Math.abs(targetY - curY) < 0.25 &&
        stretch < 0.008 &&
        Math.abs(scaleGoal - hoverScale) < 0.008

      if (settled) {
        running = false
        lastTs = 0
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (!running) {
        running = true
        lastTs = 0
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
      if (interactive === hoverActive) return
      hoverActive = interactive
      hoverTarget = interactive ? 2.2 : 1
      // 颜色态只在状态切换时写，避免每帧 DOM attribute 写入
      glow.dataset.hover = interactive ? '1' : '0'
      wake()
    }

    const onDown = () => {
      pressTarget = 0.82
      wake()
    }
    const onUp = () => {
      // 恢复时尊重当前悬停态（修复旧版在链接上松开后停在 1× 的问题）
      pressTarget = 1
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
