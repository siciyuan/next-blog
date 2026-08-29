import type { Metadata } from 'next'
import { getConfig } from '@/lib/config'
import { Link as LinkIcon, ChevronRight } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  return { title: '友情链接' }
}

export default async function LinksPage() {
  const config = await getConfig()
  const links = config.links

  return (
    <div>
      {/* 页头 */}
      <header className="mb-8 pb-6 border-b border-[var(--border-light)]">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
          <LinkIcon size={26} className="inline-block mr-2 -mt-1" style={{ color: 'var(--accent-color)' }} />
          友情链接
        </h1>
        <p className="text-sm text-[var(--muted-color)]">
          与朋友们互相串门 · 想交换友链请联系站长并在留言中附上站点信息
        </p>
      </header>

      {links.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-color)] rounded-lg bg-[var(--secondary-bg)] border border-[var(--border-color)]">
          <div className="text-5xl mb-4 opacity-40">🔗</div>
          <p className="mb-1">暂无友情链接</p>
          <p className="text-xs">在 content/config.yml 的 links 中添加</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`friend-link-card card-radius-${config.theme.cardRadius}`}
            >
              <div className="friend-link-avatar lg-size">
                {link.avatar ? (
                  <img src={link.avatar} alt={link.name} className="w-full h-full object-cover" />
                ) : (
                  link.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-semibold" style={{ color: 'var(--heading-color)' }}>
                  {link.name}
                  <ChevronRight
                    size={14}
                    className="text-[var(--muted-color)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                {link.description && (
                  <div className="text-xs text-[var(--muted-color)] mt-1 line-clamp-2">
                    {link.description}
                  </div>
                )}
                <div className="text-xs text-[var(--muted-color)]/70 mt-1.5 truncate">
                  {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
