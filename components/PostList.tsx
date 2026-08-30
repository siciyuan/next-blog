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

  // 列表只保留渲染卡片必须的字段（减小传给客户端的数据体积）
  const listPosts: Post[] = posts.map((p) => ({
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

  return (
    <PostListClient posts={listPosts} postsPerPage={postsPerPage} cardConfig={cardConfig} />
  )
}
