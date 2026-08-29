import { getArchiveData, getAllPosts } from '@/lib/posts'
import ArchiveTimeline from '@/components/ArchiveTimeline'
import { getConfig } from '@/lib/config'
import { CalendarDays, BarChart } from 'lucide-react'

export async function generateMetadata() {
  const config = await getConfig()
  return {
    title: `归档 - ${config.site.title}`,
    description: `文章归档 - ${config.site.title}`,
  }
}

export default async function ArchivesPage() {
  const [archiveData, allPosts] = await Promise.all([getArchiveData(), getAllPosts()])
  const totalPosts = allPosts.length
  const totalYears = archiveData.length

  return (
    <div>
      <header className="mb-8">
        <h1
          className="text-3xl font-bold mb-3 flex items-center gap-2"
          style={{ color: 'var(--heading-color)' }}
        >
          <span className="inline-block w-1 h-8 bg-[var(--accent-color)] rounded-sm" />
          <CalendarDays size={28} className="text-[var(--accent-color)]" />
          文章归档
        </h1>
        <p className="text-sm text-[var(--muted-color)]">
          共有 <span className="font-semibold text-[var(--accent-color)]">{totalPosts}</span> 篇文章，
          跨越 <span className="font-semibold text-[var(--accent-color)]">{totalYears}</span> 个年份
        </p>

        {/* 统计卡片 */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {archiveData.slice(0, 4).map((y) => {
            const count = y.months.reduce((s, m) => s + m.posts.length, 0)
            return (
              <div
                key={y.year}
                className="p-3 bg-[var(--secondary-bg)] border border-[var(--border-color)] card-radius-medium"
              >
                <div className="text-xs text-[var(--muted-color)] mb-1 flex items-center gap-1">
                  <BarChart size={11} /> {y.year}
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--heading-color)' }}>
                  {count}
                  <span className="text-xs font-normal text-[var(--muted-color)] ml-1">篇</span>
                </div>
              </div>
            )
          })}
        </div>
      </header>

      <ArchiveTimeline data={archiveData} />
    </div>
  )
}
