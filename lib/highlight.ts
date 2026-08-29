// ============================================================
// 轻量客户端语法高亮器（零依赖）
// 思路：对 code 的纯文本做正则分词，逐段转义后包裹 tok-* span。
// 支持常见语言：js/ts、python、bash、json、css、html/xml、yaml
// ============================================================

type TokenClass =
  | 'tok-com' // 注释
  | 'tok-str' // 字符串
  | 'tok-num' // 数字
  | 'tok-lit' // 字面量 true/false/null...
  | 'tok-kw' // 关键字
  | 'tok-fn' // 函数调用
  | 'tok-tag' // HTML 标签
  | 'tok-attr' // 属性 / JSON 键

const COMMON_LITERALS = /^(true|false|null|undefined|this|super|None|True|False)$/

const KEYWORDS: Record<string, string[]> = {
  js: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'new',
    'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof',
    'instanceof', 'extends', 'default', 'switch', 'case', 'break', 'continue', 'of', 'in', 'do',
    'yield', 'static', 'get', 'set', 'void', 'delete', 'interface', 'type', 'enum', 'implements',
    'readonly', 'public', 'private', 'protected', 'namespace', 'declare', 'as', 'satisfies',
  ],
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'class', 'import', 'from', 'as', 'try',
    'except', 'finally', 'with', 'lambda', 'yield', 'pass', 'and', 'or', 'not', 'in', 'is',
    'global', 'nonlocal', 'assert', 'raise', 'del', 'async', 'await',
  ],
  bash: [
    'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function',
    'echo', 'export', 'local', 'return', 'source', 'alias', 'in', 'set', 'cd', 'npm', 'npx',
    'git', 'sudo', 'apt', 'curl', 'mkdir', 'rm', 'cp', 'mv', 'cat',
  ],
  css: [],
  html: [],
  yaml: ['true', 'false', 'null', 'yes', 'no', 'on', 'off'],
}

const HASH_COMMENT_LANGS = new Set([
  'bash', 'sh', 'shell', 'zsh', 'console', 'py', 'python', 'yaml', 'yml', 'toml', 'ruby', 'rb',
])

function normalizeLang(lang?: string): string {
  if (!lang) return ''
  const l = lang.toLowerCase()
  if (['javascript', 'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx'].includes(l)) return 'js'
  if (['typescript'].includes(l)) return 'js'
  if (['python', 'py'].includes(l)) return 'python'
  if (['bash', 'sh', 'shell', 'zsh', 'console', 'powershell', 'ps1'].includes(l)) return 'bash'
  if (l === 'json') return 'json'
  if (l === 'css' || l === 'scss' || l === 'less') return 'css'
  if (['html', 'xml', 'vue', 'svg'].includes(l)) return 'html'
  if (l === 'yaml' || l === 'yml') return 'yaml'
  return l
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function emit(cls: TokenClass | null, text: string): string {
  const esc = escapeHtml(text)
  return cls ? `<span class="${cls}">${esc}</span>` : esc
}

/** 高亮 HTML/XML：基于已转义文本处理标签结构（&lt; &gt; 实体稳定） */
function highlightHtml(escaped: string): string {
  return escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([\w-]+)|([\w-]+)(=)("[^"]*"|'[^']*')|("[^"]*")/g,
    (m, com, tagOpen, tagName, attrName, eq, attrVal, str) => {
      if (com) return emit('tok-com', com)
      if (tagOpen) return emit(null, tagOpen) + emit('tok-tag', tagName)
      if (attrName) return emit('tok-attr', attrName) + emit(null, eq) + emit('tok-str', attrVal)
      if (str) return emit('tok-str', str)
      return m
    }
  )
}

/** 高亮 YAML：键名 + 字符串 + 注释 */
function highlightYaml(escaped: string): string {
  return escaped.replace(
    /(#[^\n]*)|(^[\s-]*[\w.-]+)(:)|("[^"\n]*"|'[^'\n]*')|\b(true|false|null|yes|no|on|off)\b|(\b\d+(?:\.\d+)?\b)/gm,
    (m, com, key, colon, str, lit, num) => {
      if (com) return emit('tok-com', com)
      if (key) return emit('tok-attr', key) + emit(null, colon)
      if (str) return emit('tok-str', str)
      if (lit) return emit('tok-lit', lit)
      if (num) return emit('tok-num', num)
      return m
    }
  )
}

/** 通用分词高亮（js/ts/python/bash/css 等） */
function highlightGeneric(raw: string, langKey: string): string {
  const keywords = KEYWORDS[langKey] || []
  const kwGroup = keywords.length
    ? `|\\b(?:${keywords.map((k) => k.replace(/ /g, '\\s+')).join('|')})\\b`
    : ''
  const hashCom = HASH_COMMENT_LANGS.has(langKey) ? `|#[^\\n]*` : ''
  const cssSel = langKey === 'css' ? `|[.#][\\w-]+` : ''

  const master = new RegExp(
    `(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*${hashCom})` + // 1 注释
      `|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)` + // 2 字符串
      `|\\b(\\d+(?:\\.\\d+)?)\\b` + // 3 数字
      `|\\b(true|false|null|undefined|this|super|None|True|False)\\b` + // 4 字面量
      kwGroup + // 5 关键字
      cssSel + // 6 CSS 选择器
      `|([A-Za-z_$][\\w$]*)(?=\\s*\\()`, // 7 函数调用
    'g'
  )

  let out = ''
  let last = 0
  let m: RegExpExecArray | null
  while ((m = master.exec(raw)) !== null) {
    out += emit(null, raw.slice(last, m.index))
    if (m[1]) out += emit('tok-com', m[1])
    else if (m[2]) out += emit('tok-str', m[2])
    else if (m[3]) out += emit('tok-num', m[3])
    else if (m[4]) out += emit('tok-lit', m[4])
    else if (m[5]) out += emit('tok-kw', m[5])
    else if (m[6]) out += emit('tok-tag', m[6]) // css 选择器复用 tag 色
    else if (m[7]) out += emit('tok-fn', m[7])
    last = m.index + m[0].length
  }
  out += emit(null, raw.slice(last))
  return out
}

/**
 * 高亮入口：输入 code 元素的纯文本与语言标识，返回带 tok-* span 的 HTML。
 * 输出整体已转义，可直接 innerHTML。
 */
export function highlightCode(raw: string, lang?: string): string {
  const key = normalizeLang(lang)

  if (key === 'html') {
    return highlightHtml(escapeHtml(raw))
  }
  if (key === 'yaml') {
    return highlightYaml(escapeHtml(raw))
  }
  return highlightGeneric(raw, key)
}
