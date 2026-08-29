import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import MarkdownContent from '@/components/MarkdownContent'
import { getConfig } from '@/lib/config'
import { User, Mail, Globe } from 'lucide-react'

export async function generateMetadata() {
  const config = await getConfig()
  return {
    title: `关于 - ${config.site.title}`,
    description: `关于 ${config.site.author} - ${config.site.subtitle}`,
  }
}

export default async function AboutPage() {
  const config = await getConfig()
  const aboutPath = path.join(process.cwd(), 'content', 'about.md')
  let contentHtml = `
    <p>这里是 <strong>${config.site.author}</strong> 的关于页面。</p>
    <p>请在 <code>content/about.md</code> 中编辑你的个人介绍、经历、联系方式等内容。</p>
    <blockquote>Tip：在 config.yml 中可以配置头像、社交链接等信息。</blockquote>
  `

  if (fs.existsSync(aboutPath)) {
    const file = fs.readFileSync(aboutPath, 'utf8')
    const { content } = matter(file)
    const processed = await remark()
      .use(remarkGfm)
      .use(html, { allowDangerousHtml: true })
      .process(content)
    contentHtml = processed.toString()
  }

  return (
    <article>
      {/* Hero 区 */}
      <section className="mb-8 bg-[var(--secondary-bg)] border border-[var(--border-color)] card-radius-medium p-7 sm:p-8 shadow-[var(--card-shadow)] overflow-hidden relative">
        <div
          aria-hidden
          className="absolute -top-14 right-0 w-56 h-56 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--accent-color)' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div
            className={`avatar ${config.site.avatarRounded !== false ? 'rounded' : ''} ${config.site.avatarAnimate !== false ? 'animate' : ''} shrink-0 shadow-lg border-4 border-white dark:border-[var(--border-color)]`}
            style={{ width: 140, height: 140 }}
          >
            {config.site.avatar ? (
              <img src={config.site.avatar} alt={config.site.author} />
            ) : (
              <div className="avatar-placeholder text-5xl">{config.site.author.charAt(0)}</div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--heading-color)' }}
            >
              {config.site.author}
            </h1>
            {config.site.subtitle && (
              <p className="italic text-[var(--muted-color)] mb-4">
                「 {config.site.subtitle} 」
              </p>
            )}
            {config.site.description && (
              <p className="text-sm text-[var(--text-color)]/85 leading-relaxed mb-4">
                {config.site.description}
              </p>
            )}

            {/* 快速联系方式 */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
              {config.social.find((s) => s.icon === 'email' || s.icon === 'mail') && (
                <a
                  href={config.social.find((s) => s.icon === 'email' || s.icon === 'mail')!.url}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-color)] border border-[var(--border-light)] hover:border-[var(--accent-color)] text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors"
                >
                  <Mail size={14} /> 联系我
                </a>
              )}
              {config.social.find((s) => s.icon === 'github') && (
                <a
                  href={config.social.find((s) => s.icon === 'github')!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-color)] border border-[var(--border-light)] hover:border-[var(--accent-color)] text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors"
                >
                  <Globe size={14} /> GitHub
                </a>
              )}
              {config.site.url && (
                <LinkLike href={config.site.url} label="个人主页" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 正文 */}
      <section className="bg-[var(--secondary-bg)] border border-[var(--border-color)] card-radius-medium p-6 sm:p-8 shadow-[var(--card-shadow)]">
        <MarkdownContent content={contentHtml} />
      </section>
    </article>
  )
}

function LinkLike({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-color)] border border-[var(--border-light)] hover:border-[var(--accent-color)] text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors"
    >
      <User size={14} /> {label}
    </a>
  )
}
