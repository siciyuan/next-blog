import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-24 select-none">
      <div
        className="text-[7rem] leading-none font-bold tracking-tight"
        style={{ color: 'var(--accent-color)' }}
      >
        404
      </div>
      <h1 className="text-xl font-semibold mt-4 mb-2" style={{ color: 'var(--heading-color)' }}>
        页面不存在或已被移动
      </h1>
      <p className="text-sm text-[var(--muted-color)] mb-8">
        你访问的页面可能已被删除、重命名或链接有误
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-2.5 rounded-full transition-transform hover:scale-105"
        style={{ background: 'var(--accent-color)' }}
      >
        返回首页
      </Link>
    </div>
  )
}
