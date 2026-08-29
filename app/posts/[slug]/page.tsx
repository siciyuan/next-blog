import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getAllPosts,
  getPostBySlug,
  getAllTags,
  getAllCategories,
} from '@/lib/posts'
import { getConfig } from '@/lib/config'
import MarkdownContent from '@/components/MarkdownContent'
import Toc from '@/components/Toc'
import BackToTop from '@/components/BackToTop'
import PostEffects from '@/components/PostEffects'
import Comments from '@/components/Comments'
import { formatDate } from '@/lib/utils'
import {
  Calendar,
  Clock,
  Edit,
  Type,
  Hash,
  FolderOpen,
  ChevronsLeft,
  ChevronsRight,
  User,
  Shield,
} from 'lucide-react'

// 生成静态参数（可选）
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  const config = await getConfig()
  if (!post) return { title: 'Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.cover ? [post.cover] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : undefined,
    },
    keywords: [...post.tags, ...post.categories],
  }
}

// ============================================================
// Prev / Next 导航
// ============================================================
function PostNav({ prev, next }: { prev?: any; next?: any }) {
  return (
    <nav className="post-nav">
      <Link
        href={prev ? `/posts/${prev.slug}/` : '#'}
        className={`post-nav-card prev ${!prev ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={!prev}
      >
        <div className="post-nav-label flex items-center gap-1 text-[var(--accent-color)]">
          <ChevronsLeft size={14} /> 上一篇
        </div>
        <div className="post-nav-title">{prev?.title ?? '没有上一篇了'}</div>
      </Link>
      <Link
        href={next ? `/posts/${next.slug}/` : '#'}
        className={`post-nav-card next ${!next ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={!next}
      >
        <div className="post-nav-label flex items-center gap-1 justify-end text-[var(--accent-color)]">
          下一篇 <ChevronsRight size={14} />
        </div>
        <div className="post-nav-title">{next?.title ?? '已经是最新一篇'}</div>
      </Link>
    </nav>
  )
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return notFound()
  const config = await getConfig()

  // 计算上一篇 / 下一篇
  const all = await getAllPosts()
  const idx = all.findIndex((p) => p.slug === post.slug)
  const prev = idx < all.length - 1 ? all[idx + 1] : undefined // 更旧的（发布时间更早）
  const next = idx > 0 ? all[idx - 1] : undefined // 更新的

  const { post: postConf, theme } = config

  return (
    <>
      {/* 客户端增强：阅读进度条 + 代码复制按钮 */}
      <PostEffects
        showProgress={theme.showReadingProgress}
        copyButton={config.post.showCopyButton}
        codeTheme={theme.codeTheme}
      />

      <article className="relative">
        {/* 封面图 */}
        {theme.showPostCover && post.cover && (
          <div
            className={`mb-8 overflow-hidden border border-[var(--border-color)] card-radius-${theme.cardRadius} shadow-[var(--card-shadow)]`}
          >
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* 标题 */}
        <header className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
            style={{ color: 'var(--heading-color)' }}
          >
            {post.title}
          </h1>

          {/* Meta 信息条 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted-color)] border-y border-dashed border-[var(--border-light)] py-3">
            <span className="post-meta-item">
              <User size={14} />
              <span>{config.site.author}</span>
            </span>

            <span className="post-meta-item">
              <Calendar size={14} />
              <span>
                发布于 <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
            </span>

            {postConf.showUpdated && post.updated && (
              <span className="post-meta-item">
                <Edit size={14} />
                <span>
                  更新于 <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                </span>
              </span>
            )}

            {postConf.showReadingTime && (
              <span className="post-meta-item">
                <Clock size={14} />
                <span>{post.readingTime} 分钟阅读</span>
              </span>
            )}

            {postConf.showWordCount && (
              <span className="post-meta-item">
                <Type size={14} />
                <span>{post.wordCount.toLocaleString()} 字</span>
              </span>
            )}
          </div>

          {/* 分类 & 标签 */}
          {(post.tags.length > 0 || post.categories.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.categories.map((cat) => (
                <Link key={cat} href={`/category/${encodeURIComponent(cat)}/`}>
                  <span className="category-pill">
                    <FolderOpen size={11} /> {cat}
                  </span>
                </Link>
              ))}
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}/`}>
                  <span className="tag-pill">
                    <Hash size={11} /> {tag}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* 正文 + 目录 */}
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <MarkdownContent content={post.content} />

            {/* 版权声明 */}
            {postConf.showCopyright && postConf.copyrightText && (
              <div className="mt-10 p-4 border-l-4 rounded-r-lg bg-[color-mix(in_srgb,var(--accent-color)_8%,transparent)] border-[var(--accent-color)]">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="mt-0.5 text-[var(--accent-color)] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-color)' }}>
                      版权声明
                    </div>
                    <div className="text-sm text-[var(--text-color)]/85 leading-relaxed">
                      {postConf.copyrightText}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 上下篇 */}
            {postConf.showNav && <PostNav prev={prev} next={next} />}

            {/* 评论（按 config.comments 配置渲染） */}
            <Comments comments={config.comments} />
          </div>

          {/* 目录 */}
          {theme.showToc && (
            <aside className="hidden xl:block shrink-0" style={{ width: 260 }}>
              <div className="sticky top-24">
                <Toc content={post.content} collapsed={theme.tocCollapsed} />
              </div>
            </aside>
          )}
        </div>

        {/* 回到顶部 */}
        {theme.showBackToTop && <BackToTop />}
      </article>
    </>
  )
}
