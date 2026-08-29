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
  display: 'swap',
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
        {/* RSS 订阅声明 */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={config.site.title}
          href="/rss.xml"
        />
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
