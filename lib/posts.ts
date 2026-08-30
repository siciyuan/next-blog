import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

export interface Post {
  slug: string
  title: string
  date: string
  updated?: string
  tags: string[]
  categories: string[]
  excerpt: string
  content: string
  cover?: string
  readingTime: number
  wordCount: number
  draft: boolean
  sticky?: boolean
}

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) return []
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = await Promise.all(
    fileNames
      .filter((name) => name.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        const processedContent = await remark()
          .use(remarkGfm)
          .use(html, { allowDangerousHtml: true })
          .process(content)
        const contentHtml = processedContent.toString()

        const plainText = content.replace(/[#*_`\[\]\(\)!]/g, '').trim()
        const excerpt =
          data.excerpt || plainText.slice(0, 200).replace(/\n/g, ' ') + '...'

        // 归一化为数组（hexo 的 categories/tags 可能是字符串、数组或逗号分隔值）
        const toArray = (v: unknown): string[] => {
          if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string')
          if (typeof v === 'string') return v.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
          return []
        }

        return {
          slug,
          title: data.title || slug,
          date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          updated: data.updated ? new Date(data.updated).toISOString() : undefined,
          tags: toArray(data.tags),
          categories: toArray(data.categories),
          excerpt,
          content: contentHtml,
          cover: data.cover,
          readingTime: estimateReadingTime(content),
          wordCount: plainText.split(/\s+/).length,
          draft: data.draft || false,
          sticky: data.sticky || false,
        }
      })
  )

  return allPosts
    .filter((post) => !post.draft)
    // 置顶文章优先，其余按日期倒序
    .sort(
      (a, b) =>
        (b.sticky ? 1 : 0) - (a.sticky ? 1 : 0) ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
}

/**
 * 解码路由参数：App Router 传给 page 的 params 是 URL 编码后的原始串
 * （如中文 slug 会是 %E5%B8%B8...），必须先解码再与文件名/元数据比较，
 * 否则中文 slug 的文章/标签/分类页全部 404。
 */
function decodeParam(v: string): string {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

export async function getPostBySlug(rawSlug: string): Promise<Post | null> {
  const slug = decodeParam(rawSlug)
  const posts = await getAllPosts()
  return posts.find((p) => p.slug === slug) || null
}

export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const posts = await getAllPosts()
  const tagMap = new Map<string, number>()
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getPostsByTag(rawTag: string): Promise<Post[]> {
  const tag = decodeParam(rawTag)
  const posts = await getAllPosts()
  return posts.filter((post) => post.tags.includes(tag))
}

export async function getAllCategories(): Promise<{ name: string; count: number }[]> {
  const posts = await getAllPosts()
  const catMap = new Map<string, number>()
  posts.forEach((post) => {
    post.categories.forEach((cat) => {
      catMap.set(cat, (catMap.get(cat) || 0) + 1)
    })
  })
  return Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getPostsByCategory(rawCategory: string): Promise<Post[]> {
  const category = decodeParam(rawCategory)
  const posts = await getAllPosts()
  return posts.filter((post) => post.categories.includes(category))
}

export async function getArchiveData(): Promise<
  { year: string; months: { month: string; posts: Post[] }[] }[]
> {
  const posts = await getAllPosts()
  const archiveMap = new Map<string, Map<string, Post[]>>()

  posts.forEach((post) => {
    // 按东八区分组年/月，与展示日期（timeZone: Asia/Shanghai）保持一致，
    // 避免构建机为 UTC 时边界日期归错月份
    const cn = new Date(new Date(post.date).getTime() + 8 * 3600 * 1000)
    const year = cn.getUTCFullYear().toString()
    const month = (cn.getUTCMonth() + 1).toString().padStart(2, '0')

    if (!archiveMap.has(year)) archiveMap.set(year, new Map())
    const yearMap = archiveMap.get(year)!
    if (!yearMap.has(month)) yearMap.set(month, [])
    yearMap.get(month)!.push(post)
  })

  return Array.from(archiveMap.entries())
    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    .map(([year, monthsMap]) => ({
      year,
      months: Array.from(monthsMap.entries())
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([month, posts]) => ({ month, posts })),
    }))
}

export async function searchPosts(query: string): Promise<Post[]> {
  const posts = await getAllPosts()
  const lowerQuery = query.toLowerCase()
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  )
}
