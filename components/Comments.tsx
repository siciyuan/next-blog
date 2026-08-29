'use client'

import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import type { CommentConfig } from '@/lib/config'

interface CommentsProps {
  comments: CommentConfig
}

/**
 * 评论组件（按 config.comments 配置渲染对应 provider）：
 * - giscus:    基于 GitHub Discussions，需 repo / repoId / category / categoryId
 * - utterances: 基于 GitHub Issues，需 repo
 * - waline:    需 serverURL
 * - disqus:    需 shortname
 * 配置不完整时静默渲染提示框（不影响页面其余部分）
 */
export default function Comments({ comments }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !comments.enable) return
    el.innerHTML = ''

    let cancelled = false
    const scripts: HTMLScriptElement[] = []

    const addScript = (attrs: Record<string, string>, src: string, inline?: string) => {
      const s = document.createElement('script')
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
      if (src) s.src = src
      if (inline) s.text = inline
      s.async = true
      el.appendChild(s)
      scripts.push(s)
    }

    const mountDiv = document.createElement('div')
    mountDiv.className = 'comments-mount'
    el.appendChild(mountDiv)

    switch (comments.provider) {
      case 'giscus': {
        if (!comments.repo || !comments.repoId) {
          el.dataset.incomplete = 'giscus 需要 repo / repoId / category / categoryId 配置'
          break
        }
        addScript(
          {
            'data-repo': comments.repo,
            'data-repo-id': comments.repoId,
            'data-category': comments.category || 'Announcements',
            'data-category-id': comments.categoryId || '',
            'data-mapping': 'pathname',
            'data-strict': '0',
            'data-reactions-enabled': '1',
            'data-emit-metadata': '0',
            'data-input-position': 'top',
            'data-theme': 'preferred_color_scheme',
            'data-lang': 'zh-CN',
            'data-loading': 'lazy',
            crossorigin: 'anonymous',
          },
          'https://giscus.app/client.js'
        )
        break
      }

      case 'utterances': {
        if (!comments.repo) {
          el.dataset.incomplete = 'utterances 需要 repo 配置（如 user/repo）'
          break
        }
        addScript(
          {
            'data-repo': comments.repo,
            'data-issue-term': 'pathname',
            'data-theme': 'preferred-color-scheme',
            crossorigin: 'anonymous',
          },
          'https://utteranc.es/client.js'
        )
        break
      }

      case 'waline': {
        if (!comments.serverURL) {
          el.dataset.incomplete = 'waline 需要 serverURL 配置'
          break
        }
        const css = document.createElement('link')
        css.rel = 'stylesheet'
        css.href = 'https://unpkg.com/@waline/client@v3/dist/waline.css'
        document.head.appendChild(css)
        mountDiv.id = 'waline-comments'
        addScript(
          { type: 'module' },
          '',
          `import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';
           init({ el: '#waline-comments', serverURL: '${comments.serverURL}', lang: 'zh-CN', dark: 'html.dark' });`
        )
        break
      }

      case 'disqus': {
        if (!comments.shortname) {
          el.dataset.incomplete = 'disqus 需要 shortname 配置'
          break
        }
        mountDiv.id = 'disqus_thread'
        addScript(
          {},
          `https://${comments.shortname}.disqus.com/embed.js`,
          `var disqus_config = function () { this.page.url = window.location.href; this.page.identifier = window.location.pathname; };`
        )
        break
      }
    }

    return () => {
      cancelled = true
      scripts.forEach((s) => s.remove())
      el.innerHTML = ''
    }
  }, [comments])

  if (!comments.enable) return null

  return (
    <section className="comments-section mt-10">
      <h3 className="sidebar-widget-title">
        <MessageSquare size={15} /> 评论
      </h3>
      <div ref={containerRef} className="comments-container pt-2" />
    </section>
  )
}
