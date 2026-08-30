'use client'

import { useState } from 'react'
import PostCard, { PostCardConfig } from './PostCard'
import { Post } from '@/lib/posts'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PostListClientProps {
  posts: Post[]
  postsPerPage: number
  cardConfig: PostCardConfig
}

/**
 * 客户端分页文章列表：
 * - 首屏由服务端渲染当前页（SSR 完整 postsPerPage 张），避免水合后"补卡"长任务
 * - 翻页为纯 React 状态切换：没有 useTransition（它会把本来就轻的 setState
 *   变成异步并发调度，反而给主线程多塞一层任务，TBT/SI 恶化得不偿失）
 */
export default function PostListClient({ posts, postsPerPage, cardConfig }: PostListClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(posts.length / postsPerPage) || 1

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--muted-color)] card-radius-medium bg-[var(--secondary-bg)] border border-[var(--border-color)]">
        <div className="text-5xl mb-4 opacity-40">📝</div>
        <p className="mb-1">暂无文章</p>
        <p className="text-xs">前往 content/posts/ 目录创建你的第一篇文章</p>
      </div>
    )
  }

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return
    setCurrentPage(p)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const start = (currentPage - 1) * postsPerPage
  const currentPosts = posts.slice(start, start + postsPerPage)

  // 生成页码按钮（最多 7 个）
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    const left = Math.max(2, currentPage - 1)
    const right = Math.min(totalPages - 1, currentPage + 1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div>
      <div className="space-y-4">
        {currentPosts.map((post) => (
          <PostCard key={post.slug} post={post} config={cardConfig} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="pagination mt-8" aria-label="分页">
          <button
            onClick={() => goTo(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="第一页"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="上一页"
          >
            <ChevronLeft size={14} />
          </button>

          {pages.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-1 text-[var(--muted-color)]">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="下一页"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => goTo(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="最后一页"
          >
            <ChevronsRight size={14} />
          </button>
        </nav>
      )}
    </div>
  )
}
