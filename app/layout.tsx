import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import RippleEffect from '@/components/RippleEffect'
import CursorGlow from '@/components/CursorGlow'
import ScrollReveal from '@/components/ScrollReveal'
import { getConfig, type BlogConfig, type ThemeLayout } from '@/lib/config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  // optional = 零字体阻塞：100ms 内没加载完就用回退字体，
  // 避免 FCP 被 Google Fonts 拖慢（SI 的第一元凶）
  display: 'optional',
  adjustFontFallback: true,
  preload: true,
})

// ============================================================
// 根据主题配置生成动态 CSS 变量注入
// ============================================================
function buildThemeCss(config: BlogConfig): string {
  const { theme } = config
  return `
    :root {
      --primary-color: ${theme.primaryColor};
      --accent-color: ${theme.accentColor};
      --link-hover: ${theme.accentColor};
      --blockquote-border: ${theme.accentColor};
    }
  `
}

// ============================================================
// 根据 layout 与 sidebar position 返回 main/sidebar 的顺序类
// ============================================================
function layoutDirection(layout: ThemeLayout, sidebarPosition: 'left' | 'right') {
  // 默认 muse 下侧边栏在右边
  // mist 时根据 sidebar.position
  // pisces 时根据 sidebar.position
  const sideOnLeft =
    (layout === 'mist' && sidebarPosition === 'left') ||
    (layout === 'pisces' && sidebarPosition === 'left')
  return sideOnLeft ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row'
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig()
  return {
    title: {
      default: config.site.title,
      template: `%s | ${config.site.title}`,
    },
    description: config.site.description,
    keywords: config.site.keywords,
    authors: [{ name: config.site.author }],
    openGraph: {
      title: config.site.title,
      description: config.site.description,
      type: 'website',
      siteName: config.site.title,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.site.title,
      description: config.site.description,
    },
    icons: config.site.favicon ? [{ rel: 'icon', url: config.site.favicon }] : undefined,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const config = await getConfig()
  const layoutClass = `layout-${config.theme.layout}`
  const radiusClass = `card-radius-${config.theme.cardRadius}`
  const codeThemeClass = `code-theme-${config.theme.codeTheme}`
  const directionClass = layoutDirection(config.theme.layout, config.sidebar.position)
  const linkClass =
    config.theme.linkStyle === 'always'
      ? 'link-underline'
      : config.theme.linkStyle === 'hover'
      ? 'link-underline'
      : ''

  return (
    <html lang={config.site.language} suppressHydrationWarning>
      <head>
        {/* 动态主题色变量 */}
        <style
          dangerouslySetInnerHTML={{ __html: buildThemeCss(config) }}
          id="theme-css-vars"
        />
        {/* ============================================================
           Critical CSS（首屏骨架）——在 Tailwind/外部 CSS 加载前就能正确绘制，
           根治 SI 的「前 2 秒一片白」。仅保留 header/hero/post-card/footer/
           main-container 的骨架样式，不带 hover/动画。
           ============================================================ */}
        <style
          id="critical-css"
          dangerouslySetInnerHTML={{
            __html: `
*,*::before,*::after{box-sizing:border-box}
html{font-size:16px;-webkit-text-size-adjust:100%;line-height:1.15}
body{margin:0;background:var(--bg-color);color:var(--text-color);font-family:var(--font-inter),system-ui,-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;line-height:1.75;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.main-container{max-width:980px;margin:0 auto;width:100%}
@media (min-width:1200px){.main-container{max-width:1180px}}
.main-container-flex{display:flex;flex-direction:column;gap:2rem;padding:2rem 1rem 1.5rem}
@media (min-width:768px){.main-container-flex{flex-direction:row;padding:2rem 1.5rem 1.5rem;gap:2rem}.main-container-flex > main{min-width:0;flex:1 1 68%}.main-container-flex > aside{flex:0 0 280px;width:280px;position:sticky;top:5rem;align-self:start;max-height:calc(100vh - 6rem);overflow:auto}}
header.site-header{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg-color) 88%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--border-color)}
header .header-inner{max-width:980px;margin:0 auto;padding:0 1rem;height:4rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem}
@media (min-width:1200px){header .header-inner{max-width:1180px;padding:0 1.5rem}}
.brand{display:flex;align-items:center;gap:0.75rem;flex-shrink:0;text-decoration:none;color:inherit}
.brand img.avatar{width:36px;height:36px;border-radius:9999px;border:1px solid var(--border-color);object-fit:cover;background:var(--secondary-bg)}
.brand-title{font-weight:700;font-size:1.1rem;letter-spacing:0.02em;color:var(--heading-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hero-banner{background:var(--secondary-bg);border:1px solid var(--border-color);padding:1.75rem 1.75rem;box-shadow:var(--card-shadow);position:relative;overflow:hidden}
@media (min-width:640px){.hero-banner{padding:2.5rem}}
.hero-banner h1{font-size:1.9rem;line-height:1.2;margin:0.75rem 0;color:var(--heading-color);font-weight:700;letter-spacing:-0.01em}
@media (min-width:640px){.hero-banner h1{font-size:2.5rem}}
.hero-subtitle{color:var(--muted-color);font-style:italic;margin:0.5rem 0 1.25rem}
.hero-desc{color:color-mix(in srgb,var(--text-color) 75%,transparent);font-size:.9rem;line-height:1.8;margin:0 0 1.25rem}
.hero-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-top:0.75rem}
.hero-stats-card{background:var(--bg-color);border:1px solid var(--border-light);border-radius:0.5rem;padding:0.75rem;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:0.125rem}
.hero-stats-card strong{font-size:1.25rem;font-weight:700;color:var(--heading-color)}
.hero-stats-card small{font-size:.75rem;color:var(--muted-color)}
.hero-tag{display:inline-flex;align-items:center;gap:0.375rem;padding:0.25rem 0.75rem;border-radius:9999px;font-size:.75rem;font-weight:500;color:var(--accent-color);background:color-mix(in srgb,var(--accent-color) 12%,transparent)}
.post-list{display:flex;flex-direction:column;gap:1rem;margin-top:0.75rem}
.post-card{background:var(--secondary-bg);border:1px solid var(--border-color);padding:1.3em 1.8em;box-shadow:var(--card-shadow)}
.card-radius-small{border-radius:4px}
.card-radius-medium{border-radius:8px}
.card-radius-large{border-radius:14px}
.post-card h2{margin:0 0 0.5rem;font-size:1.25rem;line-height:1.4;font-weight:700}
.post-card h2 a{color:var(--heading-color);text-decoration:none}
.post-card h2 a:hover{color:var(--accent-color)}
.post-excerpt{color:var(--text-color);font-size:.9rem;line-height:1.8;margin:0.5rem 0 0.75rem}
.post-meta{display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem 0.75rem;font-size:.8rem;color:var(--muted-color);margin-top:0.5rem}
.sticky-badge{display:inline-flex;align-items:center;gap:0.25rem;padding:0.125rem 0.5rem;border-radius:0.25rem;color:#fff;background:var(--accent-color);font-size:.75rem;font-weight:500}
.tag-chip{display:inline-flex;padding:0.125rem 0.5rem;border-radius:0.25rem;border:1px solid var(--border-light);font-size:.72rem;color:var(--muted-color);text-decoration:none;transition:color .15s,border-color .15s}
.tag-chip:hover{color:var(--accent-color);border-color:color-mix(in srgb,var(--accent-color) 40%,var(--border-light))}
.site-footer{border-top:1px solid var(--border-color);padding:1.5rem 1rem;text-align:center;font-size:.8rem;color:var(--muted-color);background:var(--secondary-bg);margin-top:2rem}
.pagination{display:flex;flex-wrap:wrap;gap:0.375rem;justify-content:center}
.pagination-btn{min-width:2.1rem;height:2.1rem;padding:0 0.5rem;border-radius:0.375rem;border:1px solid var(--border-color);background:var(--secondary-bg);color:var(--text-color);font-size:.85rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s}
.pagination-btn:hover:not(:disabled){border-color:var(--accent-color);color:var(--accent-color)}
.pagination-btn.active{background:var(--accent-color);color:#fff;border-color:var(--accent-color)}
.pagination-btn:disabled{opacity:.5;cursor:not-allowed}
.sidebar-profile{background:var(--secondary-bg);border:1px solid var(--border-color);border-radius:8px;padding:1.5rem;box-shadow:var(--sidebar-shadow);margin-bottom:1rem;text-align:center}
.sidebar-profile img.sidebar-avatar{width:96px;height:96px;border-radius:9999px;border:2px solid var(--border-color);object-fit:cover;background:var(--bg-color)}
.sidebar-profile h3{margin:0.75rem 0 0.25rem;font-size:1.1rem;color:var(--heading-color);font-weight:700}
.sidebar-profile .s-sub{font-size:.8rem;color:var(--muted-color);font-style:italic;margin:0 0 0.75rem}
.sidebar-profile .social-links{display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem;margin-top:0.75rem}
.sidebar-profile .social-links a{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:0.375rem;border:1px solid var(--border-light);color:var(--muted-color);text-decoration:none;font-size:.85rem;transition:color .15s,border-color .15s}
.sidebar-profile .social-links a:hover{color:var(--accent-color);border-color:var(--accent-color)}
.sidebar-widget-title{font-size:.9rem;font-weight:600;color:var(--heading-color);margin:0 0 0.75rem;padding-bottom:0.375rem;border-bottom:1px dashed var(--border-light)}
`,
          }}
        />
        {/* RSS 订阅声明 */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={config.site.title}
          href="/rss.xml"
        />
        {/* LCP 优化：预加载头部头像 */}
        {config.site.avatar && (
          <link rel="preload" as="image" href={config.site.avatar} />
        )}
        {/* 自定义外部 CSS */}
        {config.customCss && <link rel="stylesheet" href={config.customCss} />}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased ${layoutClass} ${codeThemeClass} ${linkClass}`}
      >
        <ThemeProvider initialScheme={config.theme.scheme}>
          <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
            <Header />
            <div className={`${radiusClass} flex-1 w-full main-container mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
              <div className={`${directionClass} gap-8`}>
                <main className="content-main flex-1 min-w-0">{children}</main>
                <Sidebar />
              </div>
            </div>
            <Footer />
            {/* 鼠标 & 滚动交互特效 */}
            <ScrollReveal />
            <RippleEffect />
            <CursorGlow />
          </div>
        </ThemeProvider>
        {/* 自定义 JS */}
        {config.customJs && <script src={config.customJs} defer />}
      </body>
    </html>
  )
}
