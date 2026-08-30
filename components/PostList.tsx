import { getConfig } from '@/lib/config'
import { Post } from '@/lib/posts'
import PostListClient from './PostListClient'
import type { PostCardConfig } from './PostCard'

interface PostListProps {
  posts: Post[]
  postsPerPage: number
}

/**
 * 服务端 PostList：从 config.yml 读取展示配置，
 * 传递给客户端分页组件渲染。
 */
export default async function PostList({ posts, postsPerPage }: PostListProps) {
  const config = await getConfig()

  const cardConfig: PostCardConfig = {
    showPostCover: config.theme.showPostCover,
    showExcerpt: config.theme.showExcerpt,
    excerptLength: config.theme.excerptLength,
    showUpdated: config.post.showUpdated,
    showReadingTime: config.post.showReadingTime,
    showWordCount: config.post.showWordCount,
    cardRadius: config.theme.cardRadius,
  }

  // 最小字段：仅保留渲染卡片必须的字段（减小 SSR 首帧 HTML 体积和水合数据量）
  const minimalPosts: Post[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? '',
    cover: p.cover ?? '',
    date: p.date,
    updated: p.updated ?? undefined,
    categories: p.categories ?? [],
    tags: p.tags ?? [],
    sticky: !!p.sticky,
    readingTime: p.readingTime ?? 0,
    wordCount: p.wordCount ?? 0,
    draft: false,
    content: '',
  }))

  // 首屏仅 SSR 前 MIN_PAGE 张（默认 5），减小首帧 HTML 尺寸、加快首屏像素揭示（SI）
  // 其余在 hydration 后客户端 state 补上（Lighthouse SI 只关心前 8s 的视觉填充，
  // 首屏 5 张 + 标题/Hero 都在 SSR，剩余翻页是交互行为）
  const MIN_PAGE = Math.min(5, postsPerPage)
  const ssrPosts = minimalPosts.slice(0, MIN_PAGE)

  return (
    <PostListClient
      posts={minimalPosts}
      ssrCount={ssrPosts.length}
      postsPerPage={postsPerPage}
      cardConfig={cardConfig}
    />
  )
}
