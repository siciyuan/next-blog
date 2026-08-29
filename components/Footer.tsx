import { getConfig } from '@/lib/config'
import Link from 'next/link'
import { Github, Twitter, Mail, Rss, Globe, MessageCircle, BookOpen, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={15} />,
  twitter: <Twitter size={15} />,
  mail: <Mail size={15} />,
  email: <Mail size={15} />,
  rss: <Rss size={15} />,
  website: <Globe size={15} />,
  globe: <Globe size={15} />,
  telegram: <MessageCircle size={15} />,
  instagram: <Instagram size={15} />,
  linkedin: <Linkedin size={15} />,
  facebook: <Facebook size={15} />,
  youtube: <Youtube size={15} />,
  weibo: <Globe size={15} />,
  zhihu: <BookOpen size={15} />,
}

export default async function Footer() {
  const config = await getConfig()
  const currentYear = new Date().getFullYear()
  const { footer, site } = config

  return (
    <footer className="site-footer mt-16 bg-[var(--secondary-bg)] border-t border-[var(--border-color)]">
      <div className="main-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 顶部装饰色条 */}
        <div className="footer-divider" />

        {/* 社交链接 */}
        {config.social.length > 0 && (
          <div className="flex justify-center items-center gap-3 mb-8">
            {config.social.map((item) => (
              <a
                key={item.name + item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                title={item.name}
              >
                {iconMap[item.icon.toLowerCase()] ?? <Globe size={15} />}
              </a>
            ))}
          </div>
        )}

        {/* 版权信息 */}
        <div className="text-center text-sm text-[var(--muted-color)] space-y-2">
          {footer.showCopyright && (
            <div>
              &copy; {footer.since && footer.since !== currentYear ? `${footer.since} – ` : ''}
              {currentYear}
              <Link href="/" className="mx-1 hover:text-[var(--accent-color)] transition-colors">
                {site.author}
              </Link>
              <span className="mx-1.5 text-[var(--border-color)]">·</span>
              {footer.creativeCommons && (
                <>
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent-color)] transition-colors"
                    title="CC BY-NC-SA 4.0"
                  >
                    CC BY-NC-SA 4.0
                  </a>
                  <span className="mx-1.5 text-[var(--border-color)]">·</span>
                </>
              )}
              {footer.powered && (
                <>
                  由{' '}
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--accent-color)] hover:opacity-80"
                  >
                    Next.js
                  </a>{' '}
                  强力驱动
                </>
              )}
            </div>
          )}

          {(footer.beian || footer.beianPublic) && (
            <div className="space-x-4 text-xs">
              {footer.beian && (
                <a
                  href="https://beian.miit.gov.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent-color)] transition-colors"
                >
                  {footer.beian}
                </a>
              )}
              {footer.beianPublic && (
                <a
                  href={`http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${footer.beianPublic.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent-color)] transition-colors inline-flex items-center gap-1"
                >
                  <span>🛡️</span>
                  {footer.beianPublic}
                </a>
              )}
            </div>
          )}

          {footer.custom && (
            <div
              className="mt-2 text-xs opacity-90"
              dangerouslySetInnerHTML={{ __html: footer.custom }}
            />
          )}
        </div>
      </div>
    </footer>
  )
}
