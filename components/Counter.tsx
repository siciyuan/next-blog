'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Eye, Users } from 'lucide-react'
import type { CounterConfig } from '@/lib/config'

const BUSUANZI_SRC = '//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js'

/* ---------------- 不蒜子（busuanzi） ---------------- */

declare global {
  interface Window {
    __bszLoaded?: boolean
    __bszPath?: string
    __bszTimer?: ReturnType<typeof setTimeout>
  }
}

/**
 * 加载 / 重新执行不蒜子脚本。
 * - 首次：插入 <script>，加载完成后它会自动填充页面上的固定 id span
 * - SPA 客户端导航：重新执行一次脚本，让它按【当前 URL】上报并填充新页面的
 *   span（同一路由不重复执行，避免 StrictMode / 重复挂载导致双计数）
 */
function runBusuanzi() {
  if (typeof document === 'undefined') return
  const path = window.location.pathname

  if (!window.__bszLoaded) {
    if (document.querySelector('script[data-bsz]')) return
    const s = document.createElement('script')
    s.src = BUSUANZI_SRC
    s.defer = true
    s.dataset.bsz = '1'
    s.onload = () => {
      window.__bszLoaded = true
      window.__bszPath = path
    }
    // 统计服务不可用时静默失败，页面上保留占位符
    s.onerror = () => {}
    document.head.appendChild(s)
    return
  }

  if (window.__bszPath === path) return
  window.__bszPath = path
  if (window.__bszTimer) clearTimeout(window.__bszTimer)
  // 去抖：等客户端导航的 DOM 更新完再执行，确保新 span 已在文档里
  window.__bszTimer = setTimeout(() => {
    const s = document.createElement('script')
    s.src = BUSUANZI_SRC
    s.dataset.bszRerun = String(Date.now())
    document.head.appendChild(s)
    s.onload = () => s.remove()
  }, 300)
}

/* ---------------- saobby ---------------- */

/** 宽松解析 saobby 返回：在任意层级找「访问量 / IP 数」字段（字段名各版本不统一） */
function parseSaobby(json: unknown): { pv?: number; uv?: number } {
  const pvKeys = /pv|visit|view|count|hits|times/i
  const uvKeys = /uv|ip|unique|visitor/i
  let pv: number | undefined
  let uv: number | undefined
  const walk = (v: unknown, key?: string) => {
    if (v == null) return
    if (typeof v === 'number' && key) {
      if (pv === undefined && pvKeys.test(key)) pv = v
      else if (uv === undefined && uvKeys.test(key)) uv = v
      return
    }
    if (typeof v === 'object') {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) walk(val, k)
    }
  }
  walk(json)
  return { pv, uv }
}

function useSaobby(id?: string) {
  const [data, setData] = useState<{ pv?: number; uv?: number }>({})
  useEffect(() => {
    if (!id) return
    let aborted = false
    // GET 即上报一次，返回当前累计访问量与 IP 数
    fetch(`https://w.saobby.com/api/visit/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!aborted) setData(parseSaobby(json))
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [id])
  return data
}

/* ---------------- 页脚：站点级计数 ---------------- */

export function SiteCounter({ counter }: { counter: CounterConfig }) {
  const saobby = useSaobby(counter.provider === 'saobby' ? counter.saobbyId : undefined)

  useEffect(() => {
    if (counter.provider === 'busuanzi') runBusuanzi()
  }, [counter.provider])

  if (!counter.enable || (!counter.showSitePv && !counter.showSiteUv)) return null

  const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '—')

  return (
    <div className="site-counter">
      {counter.provider === 'busuanzi' ? (
        <>
          {counter.showSitePv && (
            <span className="counter-item">
              <Eye size={13} />
              <span>总访问 </span>
              <span id="busuanzi_site_pv" className="counter-num">-</span>
            </span>
          )}
          {counter.showSiteUv && (
            <span className="counter-item">
              <Users size={13} />
              <span>总访客 </span>
              <span id="busuanzi_site_uv" className="counter-num">-</span>
            </span>
          )}
        </>
      ) : (
        <>
          {counter.showSitePv && (
            <span className="counter-item">
              <Eye size={13} />
              <span>总访问 </span>
              <span className="counter-num">{fmt(saobby.pv)}</span>
            </span>
          )}
          {counter.showSiteUv && (
            <span className="counter-item">
              <Users size={13} />
              <span>总访客 </span>
              <span className="counter-num">{fmt(saobby.uv)}</span>
            </span>
          )}
        </>
      )}
    </div>
  )
}

/* ---------------- 文章页：本页阅读量（仅不蒜子支持按页统计） ---------------- */

export function PageCounter({ counter }: { counter: CounterConfig }) {
  const pathname = usePathname()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (counter.provider !== 'busuanzi') return
    runBusuanzi()
  }, [pathname, counter.provider])

  if (!counter.enable || !counter.showPagePv || counter.provider !== 'busuanzi') return null

  return (
    <span className="post-meta-item">
      <Eye size={14} />
      <span>
        阅读 <span ref={ref} id="busuanzi_page_pv" className="counter-num">-</span>
      </span>
    </span>
  )
}
