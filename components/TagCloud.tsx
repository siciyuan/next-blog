import Link from 'next/link'

interface TagCloudProps {
  tags: { name: string; count: number }[]
}

export default function TagCloud({ tags }: TagCloudProps) {
  const maxCount = Math.max(...tags.map((t) => t.count), 1)
  const minCount = Math.min(...tags.map((t) => t.count), 1)
  const range = maxCount - minCount || 1

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        // 权重 1~5，依据相对热度
        const weight = Math.round(1 + ((tag.count - minCount) / range) * 4)
        return (
          <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}/`}>
            <span
              className="tag-cloud-item"
              style={{ ['--weight' as any]: weight }}
              title={`${tag.name} · ${tag.count} 篇文章`}
            >
              {tag.name}
              <sup className="ml-0.5 opacity-60 text-[10px]">{tag.count}</sup>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
