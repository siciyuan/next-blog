import Link from 'next/link'
import { Post } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import { Clock, Calendar, Hash, FolderOpen, ChevronRight, Pin } from 'lucide-react'

/**
 * 卡片所需的配置子集（由服务端父组件从 config.yml 解析后传入，
 * 保持本组件为纯展示组件，可同时用于服务端与客户端渲染）
 */
export interface PostCardConfig {
  showPostCover: boolean
  showExcerpt: boolean
  excerptLength: number
  showUpdated: boolean
  showReadingTime: boolean
  showWordCount: boolean
  cardRadius: string
}

interface PostCardProps {
  post: Post
  config: PostCardConfig
}

export default function PostCard({ post, config }: PostCardProps) {
  const { showPostCover, showExcerpt, excerptLength } = config

  const excerpt =
    post.excerpt && post.excerpt.length > excerptLength
      ? post.excerpt.slice(0, excerptLength) + '…'
      : post.excerpt

  return (
    <article className={`post-card card-radius-${config.cardRadius}`}>
      {/* 封面图（可选） */}
      {showPostCover && post.cover && (
        <Link href={`/posts/${post.slug}/`} className="block -mx-[1.8em] -mt-[1.6em] mb-5 overflow-hidden">
          <img
            src={post.cover}
            alt={post.title}
            loading="lazy"
            className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
          />
        </Link>
      )}

      {/* Title */}
      <div className="flex items-center gap-2 flex-wrap">
        {post.sticky && (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium text-white px-2 py-0.5 rounded"
            style={{ background: 'var(--accent-color)' }}
            title="置顶文章"
          >
            <Pin size={11} /> 置顶
          </span>
        )}
        <Link href={`/posts/${post.slug}/`}>
          <h2 className="post-card-title">{post.title}</h2>
        </Link>
      </div>

      {/* Meta row */}
      <div className="post-meta">
        <span className="post-meta-item">
          <Calendar size={13} />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </span>

        {post.updated && config.showUpdated && (
          <>
            <span className="post-meta-divider">·</span>
            <span className="post-meta-item text-[var(--muted-color)]">
              更新于 {formatDate(post.updated)}
            </span>
          </>
        )}

        {config.showReadingTime && (
          <>
            <span className="post-meta-divider">·</span>
            <span className="post-meta-item">
              <Clock size={13} /> {post.readingTime} 分钟阅读
            </span>
          </>
        )}

        {config.showWordCount && (
          <>
            <span className="post-meta-divider">·</span>
            <span className="post-meta-item">{post.wordCount.toLocaleString()} 字</span>
          </>
        )}
      </div>

      {/* Excerpt */}
      {showExcerpt && excerpt && (
        <p className="text-sm leading-relaxed text-[var(--text-color)]/85 mb-4 text-justify line-clamp-3">
          {excerpt}
        </p>
      )}

      {/* Categories + Tags + Read more */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-dashed border-[var(--border-light)]">
        <div className="flex flex-wrap gap-2">
          {post.categories.slice(0, 3).map((cat) => (
            <Link key={cat} href={`/category/${encodeURIComponent(cat)}/`}>
              <span className="category-pill">
                <FolderOpen size={10} /> {cat}
              </span>
            </Link>
          ))}
          {post.tags.slice(0, 5).map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}/`}>
              <span className="tag-pill">
                <Hash size={10} /> {tag}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href={`/posts/${post.slug}/`}
          className="inline-flex items-center gap-0.5 text-sm font-medium text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors group"
        >
          阅读全文
          <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}
