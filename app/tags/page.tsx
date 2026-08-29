import { getAllTags } from '@/lib/posts'
import { getConfig } from '@/lib/config'
import TagCloud from '@/components/TagCloud'
import Link from 'next/link'
import { Hash } from 'lucide-react'

export async function generateMetadata() {
  const config = await getConfig()
  return {
    title: `全部标签 - ${config.site.title}`,
    description: `浏览所有文章标签 - ${config.site.title}`,
  }
}

export default async function TagsIndexPage() {
  const [tags, config] = await Promise.all([getAllTags(), getConfig()])
  const total = tags.reduce((s, t) => s + t.count, 0)

  return (
    <div className="space-y-8">
      <header>
        <h1
          className="text-3xl font-bold mb-3 flex items-center gap-2"
          style={{ color: 'var(--heading-color)' }}
        >
          <span className="inline-block w-1 h-8 bg-[var(--accent-color)] rounded-sm" />
          <Hash size={28} className="text-[var(--accent-color)]" />
          全部标签
        </h1>
        <p className="text-sm text-[var(--muted-color)]">
          共 <span className="font-semibold text-[var(--accent-color)]">{tags.length}</span> 个标签，
          <span className="font-semibold text-[var(--accent-color)] mx-1">{total}</span> 次使用
        </p>
      </header>

      {tags.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-color)] card-radius-medium bg-[var(--secondary-bg)] border border-[var(--border-color)]">
          还没有任何标签，去文章中添加 <code>tags: [xxx]</code> front-matter 吧
        </div>
      ) : (
        /* 大标签云 */
        <div className="p-6 sm:p-10 bg-[var(--secondary-bg)] border border-[var(--border-color)] card-radius-medium shadow-[var(--card-shadow)]">
          <style>{`
            .tags-cloud-lg .tag-cloud-item {
              --weight: 1;
              padding: 0.4em 0.9em;
              font-size: calc(0.9em + (var(--weight) - 1) * 0.18em);
              margin: 0.35em 0.4em 0.35em 0;
              border-radius: 2em;
            }
          `}</style>
          <div className="tags-cloud-lg flex flex-wrap justify-center">
            <TagCloud tags={tags} />
          </div>
        </div>
      )}

      {/* 标签列表（按热度排序） */}
      {tags.length > 0 && (
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: 'var(--heading-color)' }}
          >
            <span className="inline-block w-1 h-5 bg-[var(--accent-color)] rounded-sm" />
            标签排行榜
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {tags.slice(0, 20).map((t, i) => (
              <Link
                key={t.name}
                href={`/tags/${encodeURIComponent(t.name)}/`}
                className="group flex items-center justify-between p-3 bg-[var(--secondary-bg)] border border-[var(--border-color)] card-radius-small hover:border-[color-mix(in_srgb,var(--accent-color)_30%,var(--border-color))] transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      i < 3
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--bg-color)] text-[var(--muted-color)]'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="font-medium truncate group-hover:text-[var(--accent-color)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
                  >
                    #{t.name}
                  </span>
                </span>
                <span className="text-xs text-[var(--muted-color)] shrink-0 ml-2">
                  {t.count} 篇
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
