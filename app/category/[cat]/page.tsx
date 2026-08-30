import { notFound } from 'next/navigation'
import { getPostsByCategory, getAllCategories } from '@/lib/posts'
import PostList from '@/components/PostList'

// 静态导出：构建时预渲染所有分类页
export async function generateStaticParams() {
  const cats = await getAllCategories()
  return cats.map((c) => ({ cat: c.name }))
}

export async function generateMetadata({ params }: { params: { cat: string } }) {
  const catName = decodeURIComponent(params.cat)
  return { title: `分类: ${catName}` }
}

export default async function CategoryPage({ params }: { params: { cat: string } }) {
  const catName = decodeURIComponent(params.cat)
  const posts = await getPostsByCategory(catName)
  if (posts.length === 0) return notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--heading-color)' }}>
          分类: <span className="text-[var(--primary-color)]">{catName}</span>
        </h1>
        <p className="text-[var(--muted-color)] mt-1">共 {posts.length} 篇文章</p>
      </div>
      <PostList posts={posts} postsPerPage={10} />
    </div>
  )
}
