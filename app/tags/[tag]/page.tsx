import { notFound } from 'next/navigation'
import { getPostsByTag, getAllTags } from '@/lib/posts'
import PostList from '@/components/PostList'

// 静态导出：构建时预渲染所有标签页
export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((t) => ({ tag: t.name }))
}

export async function generateMetadata({ params }: { params: { tag: string } }) {
  const tagName = decodeURIComponent(params.tag)
  return { title: `标签: ${tagName}` }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tagName = decodeURIComponent(params.tag)
  const posts = await getPostsByTag(tagName)
  if (posts.length === 0) return notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--heading-color)' }}>
          标签: <span className="text-[var(--primary-color)]">#{tagName}</span>
        </h1>
        <p className="text-[var(--muted-color)] mt-1">共 {posts.length} 篇文章</p>
      </div>
      <PostList posts={posts} postsPerPage={10} />
    </div>
  )
}
