import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

// ============================================================
// Site Config
// ============================================================
export interface SiteConfig {
  title: string
  subtitle: string
  description: string
  author: string
  language: string
  keywords: string[]
  url: string
  favicon?: string
  avatar?: string
  avatarRounded?: boolean
  avatarAnimate?: boolean
}

// ============================================================
// Theme Config
// ============================================================
export type ThemeLayout = 'muse' | 'mist' | 'pisces'
export type ThemeScheme = 'light' | 'dark' | 'auto'
export type CardRadius = 'none' | 'small' | 'medium' | 'large'
export type FontFamily = 'serif' | 'sans' | 'mono'
export type LinkStyle = 'always' | 'hover' | 'none'
export type AnimationSpeed = 'fast' | 'normal' | 'slow'
export type CodeTheme = 'github' | 'one-dark' | 'monokai'

export interface ThemeConfig {
  layout: ThemeLayout
  scheme: ThemeScheme
  primaryColor: string
  accentColor: string
  showToc: boolean
  tocCollapsed: boolean
  showBackToTop: boolean
  showReadingProgress: boolean
  postsPerPage: number
  codeTheme: CodeTheme
  cardRadius: CardRadius
  showPostCover: boolean
  showExcerpt: boolean
  excerptLength: number
  fontFamily: FontFamily
  linkStyle: LinkStyle
  animationSpeed: AnimationSpeed
}

// ============================================================
// Navigation
// ============================================================
export type NavBadgeType = 'posts' | 'categories' | 'tags' | undefined

export interface NavItem {
  label: string
  path: string
  icon?: string
  badge?: NavBadgeType
}

// ============================================================
// Sidebar
// ============================================================
export type SidebarPosition = 'left' | 'right'
export type SidebarWidget =
  | 'profile'
  | 'stats'
  | 'social'
  | 'menu'
  | 'recent_posts'
  | 'categories'
  | 'tagcloud'
  | 'links'
  // pisces 布局专用：文章目录挂到侧栏面板顶部
  | 'toc_slot'

export interface SidebarConfig {
  position: SidebarPosition
  sticky: boolean
  width: number
  widgets: SidebarWidget[]
  recentPostsCount: number
}

// ============================================================
// Social
// ============================================================
export interface SocialItem {
  name: string
  url: string
  icon: string
}

// ============================================================
// Friend Links
// ============================================================
export interface LinkItem {
  name: string
  url: string
  avatar?: string
  description?: string
}

// ============================================================
// Footer
// ============================================================
export interface FooterConfig {
  since: number
  powered: boolean
  beian?: string
  beianPublic?: string
  custom?: string
  showCopyright: boolean
  creativeCommons: boolean
}

// ============================================================
// Comments
// ============================================================
export type CommentProvider = 'giscus' | 'utterances' | 'disqus' | 'waline'

export interface CommentConfig {
  enable: boolean
  provider?: CommentProvider
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
  // waline 服务端地址
  serverURL?: string
  // disqus 短域名
  shortname?: string
}

// ============================================================
// Search
// ============================================================
export interface SearchConfig {
  enable: boolean
  placeholder: string
  hotkey: boolean
}

// ============================================================
// Post Detail
// ============================================================
export interface PostConfig {
  showNav: boolean
  showUpdated: boolean
  showWordCount: boolean
  showReadingTime: boolean
  showCopyright: boolean
  copyrightText: string
  showLineNumber: boolean
  showCopyButton: boolean
}

// ============================================================
// Root Config
// ============================================================
export interface BlogConfig {
  site: SiteConfig
  theme: ThemeConfig
  nav: NavItem[]
  sidebar: SidebarConfig
  social: SocialItem[]
  links: LinkItem[]
  footer: FooterConfig
  comments: CommentConfig
  search: SearchConfig
  post: PostConfig
  customCss?: string
  customJs?: string
}

let cachedConfig: BlogConfig | null = null

export async function getConfig(): Promise<BlogConfig> {
  if (cachedConfig) return cachedConfig
  const configPath = path.join(process.cwd(), 'content', 'config.yml')
  const file = fs.readFileSync(configPath, 'utf8')
  const raw = yaml.load(file) as Partial<BlogConfig>

  // 应用默认值，保证向后兼容
  cachedConfig = {
    site: {
      title: 'My Blog',
      subtitle: '',
      description: '',
      author: 'Author',
      language: 'zh-CN',
      keywords: [],
      url: '',
      favicon: '/favicon.ico',
      avatar: '',
      avatarRounded: true,
      avatarAnimate: true,
      ...raw.site,
    },
    theme: {
      layout: 'muse',
      scheme: 'auto',
      primaryColor: '#222',
      accentColor: '#fc6423',
      showToc: true,
      tocCollapsed: false,
      showBackToTop: true,
      showReadingProgress: true,
      postsPerPage: 10,
      codeTheme: 'github',
      cardRadius: 'medium',
      showPostCover: true,
      showExcerpt: true,
      excerptLength: 200,
      fontFamily: 'sans',
      linkStyle: 'hover',
      animationSpeed: 'normal',
      ...raw.theme,
    },
    nav: raw.nav ?? [
      { label: '首页', path: '/', icon: 'home' },
      { label: '归档', path: '/archives/', icon: 'archive' },
      { label: '关于', path: '/about/', icon: 'user' },
    ],
    sidebar: {
      position: 'right',
      sticky: true,
      width: 280,
      widgets: ['profile', 'social', 'recent_posts', 'categories', 'tagcloud'],
      recentPostsCount: 5,
      ...raw.sidebar,
    },
    social: raw.social ?? [],
    links: raw.links ?? [],
    footer: {
      since: new Date().getFullYear(),
      powered: true,
      beian: '',
      beianPublic: '',
      custom: '',
      showCopyright: true,
      creativeCommons: false,
      ...raw.footer,
    },
    comments: {
      enable: false,
      provider: 'giscus',
      ...raw.comments,
    },
    search: {
      enable: true,
      placeholder: '搜索文章...',
      hotkey: true,
      ...raw.search,
    },
    post: {
      showNav: true,
      showUpdated: true,
      showWordCount: true,
      showReadingTime: true,
      showCopyright: false,
      copyrightText: '本文采用 CC BY-NC-SA 4.0 协议，转载请注明出处。',
      showLineNumber: true,
      showCopyButton: true,
      ...raw.post,
    },
    customCss: raw.customCss ?? '',
    customJs: raw.customJs ?? '',
  } as BlogConfig

  return cachedConfig
}

export function clearConfigCache() {
  cachedConfig = null
}
