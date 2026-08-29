import { getConfig } from '@/lib/config'
import { getAllTags, getAllCategories, getAllPosts } from '@/lib/posts'
import TagCloud from './TagCloud'
import TocSidebarSlot from './TocSidebarSlot'
import MobileSidebarTabs from './MobileSidebarTabs'
import SidebarTabs from './SidebarTabs'
import Link from 'next/link'
import {
  Calendar,
  FolderOpen,
  Tag as TagIcon,
  Clock,
  Home,
  Archive,
  BookOpen,
  User,
  FileText,
  Hash,
  Link as LinkIcon,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import type {
  BlogConfig,
  SidebarWidget,
  NavBadgeType,
  SidebarConfig,
  SiteConfig,
} from '@/lib/config'
import type { Post } from '@/lib/posts'

// ============================================================
// 导航图标映射
// ============================================================
const navIconMap: Record<string, React.ReactNode> = {
  home: <Home size={15} />,
  archive: <Archive size={15} />,
  tag: <Hash size={15} />,
  folder: <FolderOpen size={15} />,
  user: <User size={15} />,
  book: <BookOpen size={15} />,
  file: <FileText size={15} />,
  link: <LinkIcon size={15} />,
}

// ============================================================
// 社交图标映射
// ============================================================
import {
  Github,
  Twitter,
  Mail,
  Rss,
  Globe,
  MessageCircle,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
} from 'lucide-react'

const socialIconMap: Record<string, React.ReactNode> = {
  github: <Github size={16} />,
  twitter: <Twitter size={16} />,
  mail: <Mail size={16} />,
  email: <Mail size={16} />,
  rss: <Rss size={16} />,
  website: <Globe size={16} />,
  globe: <Globe size={16} />,
  telegram: <MessageCircle size={16} />,
  instagram: <Instagram size={16} />,
  linkedin: <Linkedin size={16} />,
  facebook: <Facebook size={16} />,
  youtube: <Youtube size={16} />,
  weibo: <Globe size={16} />,
  zhihu: <BookOpen size={16} />,
}

// ============================================================
// Profile Widget - NexT 风格大头像
// ============================================================
function ProfileWidget({
  site,
  postCount,
  catCount,
  tagCount,
}: {
  site: SiteConfig
  postCount: number
  catCount: number
  tagCount: number
}) {
  const rounded = site.avatarRounded !== false
  const animate = site.avatarAnimate !== false

  return (
    <div className="sidebar-widget card-radius-medium text-center">
      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <div
          className={`avatar ${rounded ? 'rounded' : ''} ${animate ? 'animate' : ''}`}
          style={{ width: 128, height: 128 }}
        >
          {site.avatar ? (
            <img src={site.avatar} alt={site.author} />
          ) : (
            <div className="avatar-placeholder text-4xl">
              {site.author.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Author & subtitle */}
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--heading-color)' }}>
        {site.author}
      </h2>
      {site.subtitle && (
        <p className="text-sm text-[var(--muted-color)] mb-4 italic leading-relaxed">
          {site.subtitle}
        </p>
      )}

      {/* Site stats row - NexT 经典风格 */}
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border-light)]">
        <Link href="/archives/" className="flex flex-col gap-1 hover:scale-105 transition-transform">
          <span className="text-lg font-semibold" style={{ color: 'var(--accent-color)' }}>
            {postCount}
          </span>
          <span className="text-xs text-[var(--muted-color)]">文章</span>
        </Link>
        <Link
          href="/categories/"
          className="flex flex-col gap-1 hover:scale-105 transition-transform border-x border-[var(--border-light)]"
        >
          <span className="text-lg font-semibold" style={{ color: 'var(--accent-color)' }}>
            {catCount}
          </span>
          <span className="text-xs text-[var(--muted-color)]">分类</span>
        </Link>
        <Link href="/tags/" className="flex flex-col gap-1 hover:scale-105 transition-transform">
          <span className="text-lg font-semibold" style={{ color: 'var(--accent-color)' }}>
            {tagCount}
          </span>
          <span className="text-xs text-[var(--muted-color)]">标签</span>
        </Link>
      </div>
    </div>
  )
}

// ============================================================
// Stats Widget（站点统计卡片：总字数 / 运行天数 / 最近更新）
// ============================================================
function StatsWidget({
  posts,
  since,
}: {
  posts: Post[]
  since?: number
}) {
  const totalWords = posts.reduce((s, p) => s + p.wordCount, 0)
  const wordsText = totalWords >= 1000 ? (totalWords / 1000).toFixed(1) + 'k' : String(totalWords)

  const startYear = since && since > 2000 ? since : new Date().getFullYear()
  const startDate = new Date(startYear, 0, 1).getTime()
  const runningDays = Math.max(1, Math.ceil((Date.now() - startDate) / 86400000))

  const lastUpdated = posts.reduce((acc, p) => {
    const t = new Date(p.updated || p.date).getTime()
    return t > acc ? t : acc
  }, 0)

  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">
        <BarChart3 size={15} /> 站点统计
      </h3>
      <div className="grid grid-cols-2 gap-px bg-[var(--border-light)] rounded overflow-hidden">
        {[
          { label: '文章总数', value: String(posts.length) },
          { label: '总字数', value: wordsText },
          { label: '运行天数', value: `${runningDays}` },
          {
            label: '最近更新',
            value: lastUpdated ? new Date(lastUpdated).toISOString().slice(5, 10) : '—',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 py-3 bg-[var(--secondary-bg)]"
          >
            <span className="text-base font-semibold" style={{ color: 'var(--accent-color)' }}>
              {item.value}
            </span>
            <span className="text-xs text-[var(--muted-color)]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Social Widget
// ============================================================
function SocialWidget({ config }: { config: BlogConfig }) {
  if (!config.social.length) return null
  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">社交链接</h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {config.social.map((item) => (
          <a
            key={item.name + item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            title={item.name}
          >
            {socialIconMap[item.icon.toLowerCase()] ?? <Globe size={16} />}
          </a>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Sidebar Menu Widget
// ============================================================
function MenuWidget({
  config,
  badges,
}: {
  config: BlogConfig
  badges: Record<Exclude<NavBadgeType, undefined>, number>
}) {
  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">导航菜单</h3>
      <ul className="space-y-1">
        {config.nav.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className="flex items-center justify-between group px-3 py-2 rounded transition-all hover:bg-[color-mix(in_srgb,var(--accent-color)_8%,transparent)]"
            >
              <span className="flex items-center gap-2 text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors text-sm">
                {item.icon && (navIconMap[item.icon] ?? <ChevronRight size={14} />)}
                {item.label}
              </span>
              {item.badge && badges[item.badge] !== undefined && (
                <span className="nav-badge">{badges[item.badge]}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================
// Recent Posts Widget
// ============================================================
function RecentPostsWidget({ posts, count }: { posts: Post[]; count: number }) {
  const recentPosts = posts.slice(0, count)
  if (!recentPosts.length) return null
  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">
        <Clock size={15} /> 最近文章
      </h3>
      <ul className="space-y-2.5">
        {recentPosts.map((post, idx) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}/`}
              className="flex items-start gap-3 group"
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-semibold text-white mt-0.5"
                style={{
                  background:
                    idx === 0
                      ? 'var(--accent-color)'
                      : idx === 1
                      ? '#f39c12'
                      : idx === 2
                      ? '#3498db'
                      : 'color-mix(in srgb, var(--muted-color) 70%, transparent)',
                }}
              >
                {idx + 1}
              </span>
              <span className="text-sm text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors line-clamp-2 leading-snug">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================
// Categories Widget
// ============================================================
function CategoriesWidget({
  categories,
}: {
  categories: { name: string; count: number }[]
}) {
  if (!categories.length) return null
  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">
        <FolderOpen size={15} /> 文章分类
      </h3>
      <ul className="space-y-1.5">
        {categories.map((cat) => (
          <li key={cat.name}>
            <Link
              href={`/category/${encodeURIComponent(cat.name)}/`}
              className="flex items-center justify-between group px-3 py-1.5 rounded transition-all hover:bg-[color-mix(in_srgb,var(--accent-color)_8%,transparent)]"
            >
              <span className="flex items-center gap-2 text-sm text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors">
                <ChevronRight size={12} className="text-[var(--muted-color)] group-hover:text-[var(--accent-color)]" />
                {cat.name}
              </span>
              <span className="text-xs text-[var(--muted-color)] group-hover:text-[var(--accent-color)]">
                ({cat.count})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================
// Tag Cloud Widget
// ============================================================
function TagCloudWidget({ tags }: { tags: { name: string; count: number }[] }) {
  if (!tags.length) return null
  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">
        <TagIcon size={15} /> 标签云
      </h3>
      <TagCloud tags={tags} />
    </div>
  )
}

// ============================================================
// Friend Links Widget
// ============================================================
function FriendLinksWidget({
  links,
}: {
  links: { name: string; url: string; avatar?: string; description?: string }[]
}) {
  if (!links.length) return null
  return (
    <div className="sidebar-widget card-radius-medium">
      <h3 className="sidebar-widget-title">
        <LinkIcon size={15} /> 友情链接
      </h3>
      <div className="space-y-1">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="friend-link"
            title={link.description}
          >
            <div className="friend-link-avatar">
              {link.avatar ? (
                <img src={link.avatar} alt={link.name} className="w-full h-full object-cover" />
              ) : (
                link.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors">
                {link.name}
              </div>
              {link.description && (
                <div className="text-xs text-[var(--muted-color)] truncate">
                  {link.description}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Main Sidebar Component
// ============================================================
export default async function Sidebar() {
  const config = await getConfig()
  const sidebarConf: SidebarConfig = config.sidebar

  // 加载数据（并行）
  const [tags, categories, posts] = await Promise.all([
    getAllTags(),
    getAllCategories(),
    getAllPosts(),
  ])

  const badges = {
    posts: posts.length,
    categories: categories.length,
    tags: tags.length,
  }

  const widgetMap: Record<SidebarWidget, React.ReactNode> = {
    profile: (
      <ProfileWidget
        key="profile"
        site={config.site}
        postCount={posts.length}
        catCount={categories.length}
        tagCount={tags.length}
      />
    ),
    social: <SocialWidget key="social" config={config} />,
    stats: <StatsWidget key="stats" posts={posts} since={config.footer?.since} />,
    // pisces 布局：文章页时 TOC 挂到侧栏面板顶部
    toc_slot:
      config.theme.layout === 'pisces' && config.theme.showToc ? (
        <TocSidebarSlot key="toc_slot" collapsed={config.theme.tocCollapsed} />
      ) : null,
    menu: <MenuWidget key="menu" config={config} badges={badges} />,
    recent_posts: (
      <RecentPostsWidget key="recent" posts={posts} count={sidebarConf.recentPostsCount} />
    ),
    categories: <CategoriesWidget key="categories" categories={categories} />,
    tagcloud: <TagCloudWidget key="tags" tags={tags} />,
    links: <FriendLinksWidget key="links" links={config.links} />,
  }

  const rendered = sidebarConf.widgets.map((w) => widgetMap[w]).filter(Boolean)

  const stickyClass = sidebarConf.sticky ? 'md:sticky md:top-20 self-start' : ''

  // 标签数据（排除 profile，它在所有视口下独立显示在顶部）
  const labelMap: Record<string, string> = {
    stats: '统计',
    social: '社交',
    menu: '菜单',
    recent_posts: '最近',
    categories: '分类',
    tagcloud: '标签',
    links: '友链',
    toc_slot: '目录',
  }
  const tabWidgets = sidebarConf.widgets
    .filter((w) => w !== 'profile' && widgetMap[w])
    .map((w) => ({
      id: w,
      label: labelMap[w] || w,
      content: widgetMap[w],
    }))

  // profile widget 始终独立显示在顶部
  const profileWidget = widgetMap['profile']

  return (
    <aside
      className={`content-aside w-full md:shrink-0 space-y-0 ${stickyClass}`}
      style={{ maxWidth: sidebarConf.width, flexBasis: sidebarConf.width }}
    >
      {/* profile 始终独立显示 */}
      {profileWidget}
      {/* 桌面端：其余 widget 标签切换 */}
      <div className="hidden md:block">
        {tabWidgets.length > 0 && <SidebarTabs widgets={tabWidgets} />}
      </div>
    </aside>
  )
}
