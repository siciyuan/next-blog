'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X, Clock } from 'lucide-react'
import Link from 'next/link'

interface SearchPost {
  slug: string
  title: string
  excerpt: string
}

interface SearchProps {
  posts: SearchPost[]
  placeholder?: string
  hotkey?: boolean
}

export default function Search({ posts, placeholder = '搜索文章...', hotkey = true }: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchPost[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.length >= 1) {
      const lowerQuery = query.toLowerCase()
      setResults(
        posts
          .filter(
            (post) =>
              post.title.toLowerCase().includes(lowerQuery) ||
              post.excerpt.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 10)
      )
    } else {
      setResults([])
    }
  }, [query, posts])

  useEffect(() => {
    if (!hotkey) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hotkey])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors flex items-center gap-2 text-sm text-[var(--text-color)]"
        title={hotkey ? '搜索 (Ctrl+K)' : '搜索'}
      >
        <SearchIcon size={17} />
        <span className="hidden lg:inline text-xs text-[var(--muted-color)]">搜索</span>
        {hotkey && (
          <kbd className="hidden lg:inline ml-1 px-1.5 py-0.5 text-[10px] rounded bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--muted-color)] font-mono">
            ⌘K
          </kbd>
        )}
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] px-4 bg-black/50 search-modal"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--secondary-bg)] card-radius-medium shadow-2xl border border-[var(--border-color)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-3 border-b border-[var(--border-color)]">
          <SearchIcon size={18} className="text-[var(--muted-color)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-[var(--text-color)] placeholder:text-[var(--muted-color)] text-sm py-1"
          />
          <button
            onClick={() => (query ? setQuery('') : setIsOpen(false))}
            className="p-1 hover:bg-[var(--border-color)] rounded transition-colors"
            aria-label="关闭"
          >
            <X size={16} className="text-[var(--muted-color)]" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {results.length > 0 && (
            <div className="p-1">
              <div className="text-[11px] uppercase tracking-wider px-3 py-2 text-[var(--muted-color)] font-medium">
                搜索结果 · {results.length}
              </div>
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}/`}
                  onClick={() => setIsOpen(false)}
                  className="search-result-item block px-3 py-3 rounded-md mx-2 mb-1 last:mb-2"
                >
                  <div className="font-medium text-[var(--heading-color)] text-sm">
                    {post.title}
                  </div>
                  <div className="text-xs text-[var(--muted-color)] mt-1 line-clamp-1">
                    {post.excerpt}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query.length >= 1 && results.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--muted-color)]">
              <div className="text-4xl mb-2 opacity-40">🔍</div>
              未找到与 “{query}” 相关的文章
            </div>
          )}

          {query.length === 0 && (
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-wider px-2 py-2 text-[var(--muted-color)] font-medium flex items-center gap-1.5">
                <Clock size={11} /> 提示
              </div>
              <ul className="text-xs text-[var(--muted-color)] space-y-1.5 px-2">
                <li>• 输入关键词搜索文章标题或摘要</li>
                <li>• 按 <kbd className="px-1 rounded bg-[var(--bg-color)] border border-[var(--border-color)] mx-1 text-[10px]">ESC</kbd> 关闭搜索面板</li>
                <li>• 点击 <kbd className="px-1 rounded bg-[var(--bg-color)] border border-[var(--border-color)] mx-1 text-[10px]">ESC</kbd> 或外部区域退出</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
