import { getConfig } from '@/lib/config'
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/posts'
import dynamic from 'next/dynamic'
import ThemeToggle from './ThemeToggle'
import NavLinks, { type NavLinkItem } from './NavLinks'
import HeaderShell from './HeaderShell'
import {
  Home,
  Archive,
  Hash,
  User,
  BookOpen,
  FolderOpen,
  FileText,
  Link2,
} from 'lucide-react'
import type { NavBadgeType } from '@/lib/config'

// Search / MobileMenu 默认折叠 / 关闭，首屏不参与交互。
// dynamic(ssr:false) 让首屏水合跳过这些组件（直接减包减水合任务 → 降 TBT）。
const Search = dynamic(() => import('./Search'), {
  ssr: false,
  loading: () => <div className="w-9 h-9 shrink-0" />,
})
const MobileMenu = dynamic(() => import('./MobileMenu'), {
  ssr: false,
  loading: () => <div className="w-9 h-9 shrink-0 md:hidden" />,
})

// 导航图标映射（与 Sidebar 保持一致）
const navIconMap: Record<string, React.ReactNode> = {
  home: <Home size={16} />,
  archive: <Archive size={16} />,
  tag: <Hash size={16} />,
  folder: <FolderOpen size={16} />,
  user: <User size={16} />,
  book: <BookOpen size={16} />,
  file: <FileText size={16} />,
  link: <Link2 size={16} />,
}

export default async function Header() {
  const config = await getConfig()
  const [allPosts, allTags, allCategories] = await Promise.all([
    getAllPosts(),
    getAllTags(),
    getAllCategories(),
  ])

  const searchPosts = allPosts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt }))
  const badges: Record<Exclude<NavBadgeType, undefined>, number> = {
    posts: allPosts.length,
    categories: allCategories.length,
    tags: allTags.length,
  }

  // 组装导航项（图标在服务端构建后传给客户端组件）
  const navItems: NavLinkItem[] = config.nav.map((item) => ({
    label: item.label,
    path: item.path,
    icon: item.icon ? navIconMap[item.icon] : undefined,
    badge: item.badge,
  }))

  return (
    <HeaderShell>
      <header className="backdrop-blur-md bg-[var(--bg-color)]/85 border-b border-[var(--border-color)]">
        <div className="main-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <a href="/" className="flex items-center gap-3 group shrink-0">
              {config.site.avatar && (
                <img
                  src={config.site.avatar}
                  alt="avatar"
                  width={36}
                  height={36}
                  decoding="async"
                  className="w-9 h-9 rounded-full border border-[var(--border-color)] transition-transform group-hover:rotate-12 duration-300"
                />
              )}
              <span
                className="font-bold text-lg tracking-wide transition-colors group-hover:text-[var(--accent-color)]"
                style={{ color: 'var(--heading-color)' }}
              >
                {config.site.title}
              </span>
            </a>

            {/* Desktop Nav（当前页高亮） */}
            <NavLinks items={navItems} badges={badges} />

            {/* Right Controls */}
            <div className="flex items-center gap-1.5">
              {config.search.enable && (
                <Search posts={searchPosts} placeholder={config.search.placeholder} />
              )}
              <ThemeToggle />
              {/* Mobile Hamburger */}
              <MobileMenu items={navItems} badges={badges} />
            </div>
          </div>
        </div>
      </header>
    </HeaderShell>
  )
}
