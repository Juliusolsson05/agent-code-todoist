import { Fragment, type ReactNode } from 'react'

// Minimal inline Markdown for task titles, descriptions and comments.
//
// WHY not a Markdown library: Todoist task text uses a tiny subset (bold,
// italic, inline code, links, bare URLs, and `!!` highlights are not used here),
// a full parser plus sanitiser would dwarf the rest of the view bundle, and we
// never want to emit raw HTML from user data. Everything below produces React
// elements, so there is no injection surface: text is text.
//
// Links cannot navigate the sandboxed frame (top-level navigation and popups are
// denied by the host). They are buttons that ask the service to open the URL in
// the user's browser (server/handlers.ts openUrl, http/https only).

type Opener = (url: string) => void

const INLINE = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g

export function renderInline(text: string, open: Opener, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let index = 0
  INLINE.lastIndex = 0
  for (let match = INLINE.exec(text); match; match = INLINE.exec(text)) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const key = `${keyPrefix}${index++}`
    if (match[2] || match[3]) out.push(<strong key={key}>{match[2] ?? match[3]}</strong>)
    else if (match[4] || match[5]) out.push(<em key={key}>{match[4] ?? match[5]}</em>)
    else if (match[6]) out.push(<code key={key}>{match[6]}</code>)
    else if (match[7] && match[8]) out.push(<LinkButton key={key} url={match[8]} open={open}>{match[7]}</LinkButton>)
    else if (match[9]) out.push(<LinkButton key={key} url={match[9]} open={open}>{prettyUrl(match[9])}</LinkButton>)
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function prettyUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.length > 28 ? `${parsed.pathname.slice(0, 26)}…` : parsed.pathname
    return `${parsed.hostname.replace(/^www\./, '')}${path === '/' ? '' : path}`
  } catch {
    return url
  }
}

function LinkButton({ url, open, children }: { url: string; open: Opener; children: ReactNode }) {
  return (
    <a
      className="td-link"
      href={url}
      title={url}
      onClick={event => {
        // Never let the frame try to navigate; the host would refuse anyway and
        // the click would just look broken.
        event.preventDefault()
        event.stopPropagation()
        open(url)
      }}
    >
      {children}
    </a>
  )
}

/** Block-level rendering for descriptions/comments: paragraphs, `- ` bullets,
 *  `1. ` lists, `> ` quotes and fenced code. */
export function MarkdownBlock({ text, open }: { text: string; open: Opener }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++])
      i++
      blocks.push(<pre key={key++} className="td-md-pre"><code>{body.join('\n')}</code></pre>)
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''))
      blocks.push(<ul key={key++}>{items.map((item, n) => <li key={n}>{renderInline(item, open, `l${key}-${n}`)}</li>)}</ul>)
      continue
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))
      blocks.push(<ol key={key++}>{items.map((item, n) => <li key={n}>{renderInline(item, open, `o${key}-${n}`)}</li>)}</ol>)
      continue
    }
    if (line.startsWith('> ')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) quote.push(lines[i++].slice(2))
      blocks.push(<blockquote key={key++}>{renderInline(quote.join(' '), open, `q${key}`)}</blockquote>)
      continue
    }
    if (!line.trim()) { i++; continue }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(lines[i])) para.push(lines[i++])
    blocks.push(
      <p key={key++}>
        {para.map((p, n) => <Fragment key={n}>{n > 0 && <br />}{renderInline(p, open, `p${key}-${n}`)}</Fragment>)}
      </p>,
    )
  }
  return <div className="td-md">{blocks}</div>
}
