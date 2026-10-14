// Todoist's named colour palette → hex.
//
// Source of truth: @doist/todoist-sdk 15.3.1 `dist/types/utils/colors.d.ts`
// (copied, not imported — the SDK is a devDependency used only by tests, and the
// view bundle must not pull a zod-heavy SDK into the frame for 20 strings).
// Projects, labels and filters carry the KEY ("berry_red"); unknown keys fall back
// to charcoal, the same neutral Todoist uses for "no colour".
export const TODOIST_COLORS: Record<string, string> = {
  berry_red: '#b8255f',
  red: '#db4035',
  orange: '#ff9933',
  yellow: '#fad000',
  olive_green: '#afb83b',
  lime_green: '#7ecc49',
  green: '#299438',
  mint_green: '#6accbc',
  teal: '#158fad',
  sky_blue: '#14aaf5',
  light_blue: '#96c3eb',
  blue: '#4073ff',
  grape: '#884dff',
  violet: '#af38eb',
  lavender: '#eb96eb',
  magenta: '#e05194',
  salmon: '#ff8d85',
  charcoal: '#808080',
  grey: '#b8b8b8',
  taupe: '#ccac93',
}

export const COLOR_KEYS = Object.keys(TODOIST_COLORS)

export function colorHex(key: string | null | undefined): string {
  return (key && TODOIST_COLORS[key]) || TODOIST_COLORS.charcoal
}

/** Priority hues as Todoist renders them (API 4 = p1). These are deliberately
 *  NOT theme tokens: users read p1-red as meaning, and a theme accent that
 *  happened to be red would make every task look urgent. */
export const PRIORITY_COLORS: Record<number, string> = {
  4: '#d1453b',
  3: '#eb8909',
  2: '#246fe0',
  1: 'var(--td-muted)',
}

export function priorityLabel(priority: number): string {
  return `p${5 - Math.min(4, Math.max(1, priority))}`
}
