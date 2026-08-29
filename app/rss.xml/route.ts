import { getAllPosts } from '@/lib/posts'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-static'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// RSS 2.0 订阅源（对应 NexT 的 hexo-generator-feed）
export async function GET() {
  const config = await getConfig()
  const posts = await getAllPosts()
  const siteUrl = (config.site.url || 'http://localhost:3000').replace(/\/$/, '')

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/posts/${p.slug}/</link>
      <guid isPermaLink="true">${siteUrl}/posts/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('')}
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(config.site.description)}</description>
    <language>${config.site.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
