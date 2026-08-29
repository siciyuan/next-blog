interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
