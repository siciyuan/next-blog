'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * 空闲时才挂载 children（requestIdleCallback，带 setTimeout 兜底）。
 *
 * 用途：把「非首屏关键」客户端组件的 chunk 下载 + JS 解析 + React 挂载
 * 全部挪到主线程空闲期 —— Lighthouse TBT 只统计 FCP→TTI 窗口内的长任务，
 * 空闲期执行完全不占用 TBT 预算。
 *
 * SSR 与客户端首次 render 都输出同尺寸 fallback → 无水合不匹配、无 CLS。
 */
export default function IdleMount({
  children,
  fallback,
  timeout = 1500,
}: {
  children: ReactNode
  fallback: ReactNode
  /** rIC 最长等待（超过即强制执行），默认 1.5s */
  timeout?: number
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    let id = 0
    const run = () => setReady(true)
    if (typeof w.requestIdleCallback === 'function') {
      id = w.requestIdleCallback(run, { timeout })
    } else {
      id = window.setTimeout(run, 300)
    }
    return () => {
      if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [timeout])

  return <>{ready ? children : fallback}</>
}
