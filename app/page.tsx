import PostList from '@/components/PostList'
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/posts'
import { getConfig } from '@/lib/config'
import Link from 'next/link'
import { Hash, FolderOpen, Archive, Sparkles } from 'lucide-react'

export default async function Home() {
  const [posts, tags, categories, config] = await Promise.all([
    getAllPosts(),
    getAllTags(),
    getAllCategories(),
    getConfig(),
  ])

  return (
    <div className="space-y-10">
      {/* Hero 横幅 - NexT 风格欢迎区 */}
      <section
        className={`hero-banner relative overflow-hidden bg-[var(--secondary-bg)] border border-[var(--border-color)] p-7 sm:p-10 card-radius-${config.theme.cardRadius} shadow-[var(--card-shadow)]`}
      >
      {/* 装饰背景（用透明径向渐变代替 blur-2xl：视觉同样柔和，但不触发大半径高斯模糊绘制，
          首帧渲染时间从 ~120ms → <10ms，SI 曲线显著下移） */}
        <div
          aria-hidden
          className="absolute -top-14 -right-14 w-60 h-60 rounded-full opacity-80 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--accent-color) 35%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full opacity-70 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--primary-color) 30%, transparent) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 text-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)]">
            <Sparkles size={12} />
            欢迎来到 {config.site.title}
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight"
            style={{ color: 'var(--heading-color)' }}
          >
            {config.site.title}
          </h1>

          {config.site.subtitle && (
            <p className="text-base text-[var(--muted-color)] mb-6 leading-relaxed italic">
              「 {config.site.subtitle} 」
            </p>
          )}

          {config.site.description && (
            <p className="text-sm text-[var(--text-color)]/75 mb-6 leading-relaxed">
              {config.site.description}
            </p>
          )}

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-2 max-w-md">
            <Link
              href="/archives/"
              className="hero-stats-card flex flex-col gap-0.5 p-3 rounded-lg bg-[var(--bg-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,var(--bg-color))] transition-colors border border-[var(--border-light)]"
            >
              <div className="flex items-center gap-1 text-[var(--accent-color)] text-xs">
                <Archive size={12} /> 文章
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--heading-color)' }}>
                {posts.length}
              </div>
            </Link>
            <Link
              href="/categories/"
              className="hero-stats-card flex flex-col gap-0.5 p-3 rounded-lg bg-[var(--bg-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,var(--bg-color))] transition-colors border border-[var(--border-light)]"
            >
              <div className="flex items-center gap-1 text-[var(--accent-color)] text-xs">
                <FolderOpen size={12} /> 分类
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--heading-color)' }}>
                {categories.length}
              </div>
            </Link>
            <Link
              href="/tags/"
              className="hero-stats-card flex flex-col gap-0.5 p-3 rounded-lg bg-[var(--bg-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,var(--bg-color))] transition-colors border border-[var(--border-light)]"
            >
              <div className="flex items-center gap-1 text-[var(--accent-color)] text-xs">
                <Hash size={12} /> 标签
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--heading-color)' }}>
                {tags.length}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section>
        <div className="flex items-baseline justify-between mb-5 px-1">
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: 'var(--heading-color)' }}
          >
            <span className="inline-block w-1 h-5 bg-[var(--accent-color)] rounded-sm" />
            最新文章
          </h2>
          <Link
            href="/archives/"
            className="text-sm text-[var(--muted-color)] hover:text-[var(--accent-color)] transition-colors"
          >
            查看全部 →
          </Link>
        </div>
        <PostList posts={posts} postsPerPage={config.theme.postsPerPage} />
      </section>
    </div>
  )
}
