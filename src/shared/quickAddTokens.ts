// Live highlighting for the natural-language quick-add input.
//
// WHY highlight at all when Todoist's server does the real parsing: quick add is
// write-only feedback otherwise — the user types "Review PR fri p1 #Work" and only
// learns after submit whether "#Work" matched. Colouring the tokens Todoist's
// parser will consume makes the syntax discoverable and catches typos before the
// task lands in the Inbox. We deliberately do NOT parse dates ourselves for
// submission: `td task quickadd` sends the raw text and Todoist's parser wins.
// These spans are a hint layer only, so being approximate is fine; being
// confidently WRONG (marking text that Todoist will keep as content) is worse
// than not marking it, hence the conservative date vocabulary.

export type TokenKind = 'priority' | 'project' | 'label' | 'section' | 'assignee' | 'deadline' | 'date' | 'description' | 'text'
export type Token = { kind: TokenKind; text: string; start: number; end: number }

const WEEKDAYS = '(?:mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:rs(?:day)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)'
const MONTHS = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)'
const TIME = '(?:(?:at\\s+)?\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)|at\\s+\\d{1,2}(?::\\d{2})?|(?:at\\s+)?(?:noon|midnight))'
const DAY_WORD = `(?:today|tod|tonight|tomorrow|tom|yesterday|next\\s+(?:week|month|year|${WEEKDAYS})|this\\s+(?:weekend|week)|${WEEKDAYS}|in\\s+\\d+\\s+(?:days?|weeks?|months?)|${MONTHS}\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+${MONTHS}|\\d{4}-\\d{2}-\\d{2})`
const RECURRING = `(?:every\\s+(?:other\\s+)?(?:day|weekday|workday|week|month|year|morning|evening|${WEEKDAYS}(?:\\s*(?:,|and)\\s*${WEEKDAYS})*|\\d+\\s+(?:days?|weeks?|months?|years?)))`
const DATE_PHRASE = `(?:${RECURRING}(?:\\s+${TIME})?|${DAY_WORD}(?:\\s+${TIME})?|${TIME})`

// Order matters: structured markers first, then dates. Each alternative is a
// whole token bounded by whitespace or string edges so "p1" inside "mp100" or
// "#" inside a URL fragment is not highlighted.
const PATTERN = new RegExp(
  [
    '(?<priority>\\bp[1-4]\\b)',
    // # and @ only start a token at a word boundary of whitespace: otherwise
    // "jane@example.com" became a label and "page#section" a project.
    '(?<project>(?<=\\s|^)#(?:"[^"]+"|[^\\s#@/+{]+))',
    '(?<label>(?<=\\s|^)@(?:"[^"]+"|[^\\s#@/+{]+))',
    '(?<section>(?<=\\s|^)/(?:"[^"]+"|[^\\s#@/+{]+))',
    '(?<assignee>(?<=\\s|^)\\+[^\\s#@/+{]+)',
    '(?<deadline>\\{[^}]+\\})',
    // Trailing punctuation counts as a boundary only when the sentence ends
    // there ("call mom tomorrow."), not inside a word like "Monday.com".
    `(?<date>(?<=\\s|^)${DATE_PHRASE}(?=\\s|$|[.,;!?](?:\\s|$)))`,
  ].join('|'),
  'gi',
)

/** Todoist quick add: " // description text" (must be at the end) — the
 *  OpenAPI spec's /api/v1/tasks/quick description. Everything after it is the
 *  description, so nothing in it is a date, label or project. A URL's "//" has
 *  no whitespace before it and is not a marker. */
const DESCRIPTION = /(?:^|\s)\/\/(?=\s|$)/

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  const marker = DESCRIPTION.exec(input)
  // The marker's own leading space stays with the title side.
  const descriptionAt = marker ? marker.index + (marker[0].startsWith('/') ? 0 : 1) : input.length
  const head = input.slice(0, descriptionAt)
  let last = 0
  PATTERN.lastIndex = 0
  for (let match = PATTERN.exec(head); match; match = PATTERN.exec(head)) {
    if (match[0].length === 0) { PATTERN.lastIndex++; continue }
    const groups = match.groups ?? {}
    const kind = (Object.keys(groups).find(key => groups[key] !== undefined) ?? 'text') as TokenKind
    if (match.index > last) tokens.push({ kind: 'text', text: input.slice(last, match.index), start: last, end: match.index })
    tokens.push({ kind, text: match[0], start: match.index, end: match.index + match[0].length })
    last = match.index + match[0].length
  }
  if (last < head.length) tokens.push({ kind: 'text', text: head.slice(last), start: last, end: head.length })
  if (descriptionAt < input.length) tokens.push({ kind: 'description', text: input.slice(descriptionAt), start: descriptionAt, end: input.length })
  return tokens
}

/** What the parser will most likely treat as the task title — used for the
 *  "Adds: …" preview line under the input. */
export function contentPreview(input: string): string {
  return tokenize(input).filter(token => token.kind === 'text').map(token => token.text).join('').replace(/\s+/g, ' ').trim()
}
