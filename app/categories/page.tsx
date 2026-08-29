import { getAllCategories, getPostsByCategory } from '@/lib/posts'
import { getConfig } from '@/lib/config'
import PostList from '@/components/PostList'
import TagCloud from '@/components/TagCloud'
import Link from 'next/link'
import { FolderOpen, Hash } from 'lucide-react'

export async function generateMetadata() {
  const config = await getConfig()
  return {
    title: `全部分类 - ${config.site.title}`,
    description: `浏览所有文章分类 - ${config.site.title}`,
  }
}

export default async function CategoriesIndexPage() {
  const [categories, config] = await Promise.all([getAllCategories(), getConfig()])

  // 拉取每个分类的最新 1 篇文章摘要数、及 posts count（categories 已有）
  const enriched = await Promise.all(
    categories.map(async (c) => {
      const posts = await getPostsByCategory(c.name)
      return { ...c, lastPostAt: posts[0]?.date ?? '' }
    })
  )

  // 为了快速展示，这里把 PostList 用于“全部文章”，并附加分类墙
  return (
    <div className="space-y-8">
      <header>
        <h1
          className="text-3xl font-bold mb-3 flex items-center gap-2"
          style={{ color: 'var(--heading-color)' }}
        >
          <span className="inline-block w-1 h-8 bg-[var(--accent-color)] rounded-sm" />
          <FolderOpen size={28} className="text-[var(--accent-color)]" />
          全部分类
        </h1>
        <p className="text-sm text-[var(--muted-color)]">
          共 <span className="font-semibold text-[var(--accent-color)]">{categories.length}</span> 个分类
        </p>
      </header>

      {/* 分类墙 */}
      {enriched.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-color)] card-radius-medium bg-[var(--secondary-bg)] border border-[var(--border-color)]">
          还没有任何分类，去文章中添加 <code>categories: [xxx]</code> front-matter 吧
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enriched.map((c) => (
            <Link
              key={c.name}
              href={`/category/${encodeURIComponent(c.name)}/`}
              className="group block p-5 bg-[var(--secondary-bg)] border border-[var(--border-color)] card-radius-medium hover:border-[color-mix(in_srgb,var(--accent-color)_40%,var(--border-color))] hover:-translate-y-0.5 transition-all shadow-[var(--card-shadow)]"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-[var(--heading-color)] font-semibold group-hover:text-[var(--accent-color)] transition-colors">
                  <FolderOpen size={16} />
                  <span className="truncate">{c.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)] text-[var(--accent-color)]">
                  {c.count} 篇
                </span>
              </div>
              <p className="text-xs text-[var(--muted-color)]">
                最近更新：{c.lastPostAt ? new Date(c.lastPostAt).toLocaleDateString() : '-'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
