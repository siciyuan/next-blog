import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { formatDateShort } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

interface ArchiveData {
  year: string
  months: { month: string; posts: Post[] }[]
}

interface ArchiveTimelineProps {
  data: ArchiveData[]
}

export default function ArchiveTimeline({ data }: ArchiveTimelineProps) {
  const totalPosts = data.reduce(
    (sum, y) => sum + y.months.reduce((s, m) => s + m.posts.length, 0),
    0
  )

  return (
    <div className="space-y-2">
      {data.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-color)]">还没有任何文章哦～</div>
      ) : (
        data.map((yearData) => {
          const yearCount = yearData.months.reduce((s, m) => s + m.posts.length, 0)
          return (
            <section key={yearData.year}>
              <h2 className="archive-year">
                <CalendarDays size={20} className="text-[var(--accent-color)]" />
                <span>{yearData.year}</span>
                <span className="text-sm font-normal text-[var(--muted-color)]">
                  · {yearCount} 篇
                </span>
              </h2>

              {yearData.months.map((monthData) => (
                <div key={monthData.month}>
                  <h3 className="archive-month">
                    {monthData.month} 月
                    <span className="ml-1 text-xs opacity-70">({monthData.posts.length})</span>
                  </h3>

                  <div className="archive-timeline">
                    {monthData.posts.map((post) => (
                      <div key={post.slug} className="archive-timeline-item">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[var(--muted-color)] shrink-0 w-10 tabular-nums">
                            {formatDateShort(post.date).slice(5)}
                          </span>
                          <Link
                            href={`/posts/${post.slug}/`}
                            className="flex-1 min-w-0 text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors truncate"
                          >
                            <span className="truncate">{post.title}</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )
        })
      )}
    </div>
  )
}
