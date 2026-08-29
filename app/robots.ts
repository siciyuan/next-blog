import type { MetadataRoute } from 'next'
import { getConfig } from '@/lib/config'

export const dynamic = 'force-static'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getConfig()
  const base = (config.site.url || 'http://localhost:3000').replace(/\/$/, '')

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
