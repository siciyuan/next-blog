'use client'

import { useEffect, useState, useTransition } from 'react'
import PostCard, { PostCardConfig } from './PostCard'
import { Post } from '@/lib/posts'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PostListClientProps {
  posts: Post[]
  /** SSR 预渲染的首屏卡片数（剩余 postsPerPage - ssrCount 张水合后再补齐，
   *  让首帧 HTML 体积更小、Lighthouse SI 曲线更陡） */
  ssrCount: number
  postsPerPage: number
  cardConfig: PostCardConfig
}

/**
 * 客户端分页文章列表（SI 优化版）：
 * - SSR 只渲染第 1 页前 ssrCount 张，剩余水合后用 useTransition 非阻塞补齐
 * - 翻页同样 useTransition：按钮立即响应，新卡片异步切换不阻塞输入 → 直接降 TBT
 * - props.posts 里的元数据已是最小字段体（见 PostList.tsx），不注入 HTML
 */
export default function PostListClient({ posts, ssrCount, postsPerPage, cardConfig }: PostListClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(posts.length / postsPerPage) || 1

  // 当前正在展示的卡片：SSR 只输出第 1 页前 ssrCount 张，其余客户端水合后补齐
  const [firstPageRenderedCount, setFirstPageRenderedCount] = useState(ssrCount)
  const [isPending, startTransition] = useTransition()

  // 水合后补齐第 1 页剩余（postsPerPage - ssrCount）张，
  // 用 useTransition 包起来，避免阻塞首次交互
  useEffect(() => {
    if (postsPerPage > ssrCount && firstPageRenderedCount < postsPerPage) {
      startTransition(() => {
        setFirstPageRenderedCount(Math.min(postsPerPage, posts.length))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    startTransition(() => {
      setCurrentPage(p)
    })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const start = (currentPage - 1) * postsPerPage
  const endThisPage =
    currentPage === 1 ? start + firstPageRenderedCount : start + postsPerPage
  const currentPosts = posts.slice(start, endThisPage)

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
        {/* 第一页 SSR 数量少于 postsPerPage：水合补卡期间的占位，保持 CLS 0
            visibility:hidden 保留高度，与真实卡片最小高度一致 */}
        {currentPage === 1 && firstPageRenderedCount < postsPerPage && (
          <>
            {Array.from({ length: postsPerPage - firstPageRenderedCount }).map((_, i) => (
              <div
                key={`ph-${i}`}
                aria-hidden
                className="card-radius-medium"
                style={{
                  // 与真实 PostCard 高度接近（不含封面约 168px，带封面约 404px）
                  minHeight: cardConfig.showPostCover ? 404 : 168,
                  visibility: 'hidden',
                }}
              />
            ))}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="pagination mt-8" aria-label="分页">
          <button
            onClick={() => goTo(1)}
            disabled={currentPage === 1 || isPending}
            className="pagination-btn"
            aria-label="第一页"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
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
                disabled={isPending}
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="pagination-btn"
            aria-label="下一页"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => goTo(totalPages)}
            disabled={currentPage === totalPages || isPending}
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
