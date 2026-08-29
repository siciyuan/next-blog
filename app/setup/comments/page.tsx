'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, MessageSquare } from 'lucide-react'

interface Field {
  key: string
  label: string
  placeholder: string
  help?: string
}

const FIELDS: Field[] = [
  { key: 'repo', label: 'repo', placeholder: 'yourname/your-repo', help: 'GitHub 仓库（需公开）' },
  { key: 'repoId', label: 'repoId', placeholder: 'R_kgDOIxxxxxx', help: '在 giscus.app 生成' },
  { key: 'category', label: 'category', placeholder: 'General' },
  { key: 'categoryId', label: 'categoryId', placeholder: 'DIC_kwDOIxxxxxxx', help: '在 giscus.app 生成' },
]

export default function GiscusWizardPage() {
  const [values, setValues] = useState<Record<string, string>>({
    repo: '',
    repoId: '',
    category: 'General',
    categoryId: '',
  })
  const [copied, setCopied] = useState(false)

  const generated = `comments:
  enable: true
  provider: "giscus"
  repo: "${values.repo || 'yourname/your-repo'}"
  repoId: "${values.repoId || 'R_xxxxxxx'}"
  category: "${values.category || 'General'}"
  categoryId: "${values.categoryId || 'DIC_xxxxxxx'}"`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 pb-6 border-b border-[var(--border-light)]">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--heading-color)' }}>
          <MessageSquare size={28} style={{ color: 'var(--accent-color)' }} />
          Giscus 评论接入向导
        </h1>
        <p className="text-sm text-[var(--muted-color)]">
          填写下方字段，生成可直接粘贴到 <code className="px-1.5 py-0.5 rounded bg-[var(--secondary-bg)] text-[var(--accent-color)]">content/config.yml</code> 的配置
        </p>
      </header>

      {/* 步骤说明 */}
      <ol className="space-y-3 mb-8 text-sm">
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center text-xs font-bold">1</span>
          <div>
            访问 <a href="https://giscus.app" target="_blank" rel="noopener" className="text-[var(--accent-color)] underline underline-offset-2 inline-flex items-center gap-0.5">giscus.app <ExternalLink size={12} /></a>，授权仓库并选择 Discussion 分类
          </div>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center text-xs font-bold">2</span>
          <div>页面会生成 <code className="px-1 py-0.5 rounded bg-[var(--secondary-bg)]">repoId</code> 和 <code className="px-1 py-0.5 rounded bg-[var(--secondary-bg)]">categoryId</code>，复制到下方表单</div>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center text-xs font-bold">3</span>
          <div>点击「复制配置」，粘贴到 config.yml 的 <code className="px-1 py-0.5 rounded bg-[var(--secondary-bg)]">comments</code> 段落即可</div>
        </li>
      </ol>

      {/* 表单 */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-[var(--muted-color)] mb-1.5">
              {f.label}
              {f.help && <span className="ml-1 text-[var(--muted-color)]/70">— {f.help}</span>}
            </label>
            <input
              type="text"
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 text-sm bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--accent-color)] transition-colors"
            />
          </div>
        ))}
      </div>

      {/* 生成结果 */}
      <div className="relative">
        <pre className="bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg p-4 pr-14 overflow-x-auto text-xs leading-relaxed">
          <code>{generated}</code>
        </pre>
        <button
          onClick={copy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-colors"
          aria-label="复制配置"
        >
          {copied ? <Check size={14} style={{ color: 'var(--accent-color)' }} /> : <Copy size={14} />}
        </button>
      </div>

      <p className="text-xs text-[var(--muted-color)] mt-4">
        提示：仓库需为<strong className="text-[var(--text-color)]">公开</strong>，并在 Settings → Features 勾选 Discussions。
      </p>
    </div>
  )
}
