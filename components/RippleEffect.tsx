'use client'

import { useEffect, useRef } from 'react'

/**
 * 鼠标点击涟漪（扩散）特效：
 * - 左键单击任意位置产生一个圆形波纹
 * - 波纹以点击位置为圆心，600ms 内扩散 + 淡出
 * - 可配置每轮最多多少个涟漪同时存在，避免 DOM 节点过多
 * - 自动检测主题（暗色/亮色）改变颜色
 */
export default function RippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null)
  const countRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const MAX_ACTIVE = 15
    const activeNodes: HTMLSpanElement[] = []

    const onClick = (e: MouseEvent) => {
      // 限制并发数
      while (activeNodes.length >= MAX_ACTIVE) {
        const old = activeNodes.shift()
        old?.remove()
      }

      const ripple = document.createElement('span')
      ripple.className = 'ripple-drop'
      ripple.style.left = e.clientX + 'px'
      ripple.style.top = e.clientY + 'px'

      // 中键/右键等用不同颜色区分一下
      if (e.button === 2) ripple.dataset.variant = 'alt'

      container.appendChild(ripple)
      activeNodes.push(ripple)

      const cleanup = () => {
        ripple.remove()
        const idx = activeNodes.indexOf(ripple)
        if (idx >= 0) activeNodes.splice(idx, 1)
      }
      ripple.addEventListener('animationend', cleanup, { once: true })
      countRef.current++
    }

    // 阻止右键菜单时也能产生涟漪
    const stopContextMenu = () => {}
    document.addEventListener('mousedown', onClick)
    // 触摸设备也触发（触屏用 touchstart 的中心）
    const onTouch = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      if (t) onClick(new MouseEvent('mousedown', { clientX: t.clientX, clientY: t.clientY }) as any)
    }
    document.addEventListener('touchstart', onTouch, { passive: true })

    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('contextmenu', stopContextMenu)
      document.removeEventListener('touchstart', onTouch)
      activeNodes.forEach((n) => n.remove())
    }
  }, [])

  return <div ref={containerRef} className="ripple-container" aria-hidden="true" />
}
