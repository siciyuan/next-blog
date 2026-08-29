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

  // 列表不需要正文 HTML，剔除以减小传给客户端的数据体积
  const listPosts = posts.map((p) => ({ ...p, content: '' }))

  return (
    <PostListClient posts={listPosts} postsPerPage={postsPerPage} cardConfig={cardConfig} />
  )
}
