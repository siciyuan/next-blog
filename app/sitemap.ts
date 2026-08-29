import type { MetadataRoute } from 'next'
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/posts'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getConfig()
  const base = (config.site.url || 'http://localhost:3000').replace(/\/$/, '')

  const [posts, tags, categories] = await Promise.all([
    getAllPosts(),
    getAllTags(),
    getAllCategories(),
  ])

  const staticPages: MetadataRoute.Sitemap = ['', '/archives/', '/about/', '/categories/', '/tags/', '/links/'].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: p === '' ? 1 : 0.8,
    })
  )

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/posts/${p.slug}/`,
    lastModified: new Date(p.updated || p.date),
    changeFrequency: 'weekly',
    priority: p.sticky ? 0.9 : 0.7,
  }))

  const tagPages: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${base}/tags/${encodeURIComponent(t.name)}/`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${encodeURIComponent(c.name)}/`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages]
}
