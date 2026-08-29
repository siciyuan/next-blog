// 博客展示时区固定为东八区：
// 服务端（Vercel 为 UTC）与客户端（用户本地时区）必须输出完全一致的文本，
// 否则 React 水合时会报 #425（Text content does not match）→ #418 → #423
const BLOG_TZ = 'Asia/Shanghai'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: BLOG_TZ,
  })
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: BLOG_TZ,
  })
}
