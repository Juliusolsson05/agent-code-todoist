import type { SVGProps } from 'react'

// Inline SVG icons (stroke-based, 16px grid, currentColor) so they inherit the
// theme without an icon font — the frame cannot load remote fonts anyway (its
// CSP allows only the extension's own origin).

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}

export const TodayIcon = ({ day, ...p }: IconProps & { day?: number }) => (
  <Svg {...p}>
    <rect x="2.5" y="3" width="11" height="10.5" rx="2" />
    <path d="M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" />
    <text x="8" y="12" textAnchor="middle" fontSize="5.4" fontWeight="700" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif">{day ?? new Date().getDate()}</text>
  </Svg>
)
export const UpcomingIcon = (p: IconProps) => (
  <Svg {...p}><rect x="2.5" y="3" width="11" height="10.5" rx="2" /><path d="M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4M5 8.5h1M7.5 8.5h1M10 8.5h1M5 11h1M7.5 11h1" /></Svg>
)
export const InboxIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2.5 9.5 4.2 3.8a1 1 0 0 1 1-.8h5.6a1 1 0 0 1 1 .8l1.7 5.7v2.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" /><path d="M2.5 9.5h3l.8 1.5h3.4l.8-1.5h3" /></Svg>
)
export const DoneIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="8" cy="8" r="5.6" /><path d="m5.6 8.1 1.6 1.6 3.3-3.4" /></Svg>
)
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="7" cy="7" r="4.3" /><path d="m10.2 10.2 3.3 3.3" /></Svg>
)
export const LabelIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2.5 3.5v4l6 6 5-5-6-6h-4a1 1 0 0 0-1 1z" /><circle cx="5.5" cy="5.5" r="0.9" fill="currentColor" stroke="none" /></Svg>
)
export const FilterIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2.5 3.5h11l-4.2 5v4l-2.6 1.2V8.5z" /></Svg>
)
export const PlusIcon = (p: IconProps) => <Svg {...p}><path d="M8 3v10M3 8h10" /></Svg>
export const CloseIcon = (p: IconProps) => <Svg {...p}><path d="m4 4 8 8M12 4l-8 8" /></Svg>
export const ChevronIcon = (p: IconProps) => <Svg {...p}><path d="m6 4 4 4-4 4" /></Svg>
export const ChevronDownIcon = (p: IconProps) => <Svg {...p}><path d="m4 6 4 4 4-4" /></Svg>
export const RefreshIcon = (p: IconProps) => (
  <Svg {...p}><path d="M13 8a5 5 0 1 1-1.5-3.6" /><path d="M13 2.8v2.6h-2.6" /></Svg>
)
export const MoreIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="3.5" cy="8" r=".9" fill="currentColor" /><circle cx="8" cy="8" r=".9" fill="currentColor" /><circle cx="12.5" cy="8" r=".9" fill="currentColor" /></Svg>
)
export const FlagIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3.5 14V2.8M3.5 3h8.2l-1.6 3 1.6 3H3.5" /></Svg>
)
export const FlagFilledIcon = ({ color, ...p }: IconProps & { color: string }) => (
  <Svg {...p} style={{ stroke: color }}><path d="M3.5 14V2.8" /><path d="M3.5 3h8.2l-1.6 3 1.6 3H3.5z" style={{ fill: color }} /></Svg>
)
export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="2.5" y="3" width="11" height="10.5" rx="2" /><path d="M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" /></Svg>
)
export const ClockIcon = (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="5.6" /><path d="M8 5v3.2l2 1.3" /></Svg>
export const DeadlineIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="8" cy="8" r="5.6" /><circle cx="8" cy="8" r="2.6" /><circle cx="8" cy="8" r=".6" fill="currentColor" /></Svg>
)
export const RecurringIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 7a5 5 0 0 1 8.6-2.6L13 5.8M13 2.8v3h-3" /><path d="M13 9a5 5 0 0 1-8.6 2.6L3 10.2M3 13.2v-3h3" /></Svg>
)
export const CommentIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.3v-2.3H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" /></Svg>
)
export const TrashIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.6a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.6" /></Svg>
)
export const ExternalIcon = (p: IconProps) => (
  <Svg {...p}><path d="M9 3h4v4M13 3 7.5 8.5M11 9.5V13H3V5h3.5" /></Svg>
)
export const SubtaskIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 2.5v6.5a2 2 0 0 0 2 2h6" /><path d="m10 9 2 2-2 2" /></Svg>
)
export const SidebarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="2" y="3" width="12" height="10" rx="1.8" /><path d="M6 3v10" /></Svg>
)
export const MoveIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2.5 8h8M8 5l3 3-3 3M13.5 3v10" /></Svg>
)
export const AgentIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="4.5" width="10" height="8" rx="2" /><path d="M8 2v2.5M6 8.2v.6M10 8.2v.6M6.3 10.8h3.4" /></Svg>
)
export const KeyboardIcon = (p: IconProps) => (
  <Svg {...p}><rect x="1.8" y="4" width="12.4" height="8" rx="1.5" /><path d="M4.5 6.6h.01M7 6.6h.01M9.5 6.6h.01M12 6.6h.01M5 9.5h6" /></Svg>
)
export const SignOutIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6.5 13.5h-3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3M10.5 11 13.5 8l-3-3M13.5 8h-7" /></Svg>
)
// The setup screens' mark. In the default Todoist look it is Todoist's own logo
// (app.todoist.com/todoist.svg, owner request 2026-10-15: "their font and
// branding"); with "Use Agent Code's colours" on it is our neutral check tile.
// Both render and CSS shows one ([data-td-theme] in styles.css), so the swap
// needs no React state and never flashes.
export const AppMark = (p: IconProps) => (
  <>
    <svg className="td-mark-todoist" width={p.size ?? 28} height={p.size ?? 28} viewBox="0 0 32 32" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" fill="#E44232" d="M4 0h24c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H4c-2.2 0-4-1.8-4-4v-5.374l.057.033c1.365.794 4.592 2.674 5.382 3.12.478.27.936.263 1.397-.003l6.328-3.641.012-.007.035-.02 6.575-3.784c.277-.16.291-.652-.02-.829l-.217-.124c-.316-.18-.726-.413-.901-.516a1.02 1.02 0 0 0-.998.012c-.154.09-10.5 6.038-10.847 6.235a1.349 1.349 0 0 1-1.338 0L0 19.927v-2.693l.057.033c1.365.795 4.592 2.674 5.382 3.12.478.27.936.264 1.397-.002.276-.16 3.307-1.903 6.367-3.664l.024-.014 6.559-3.775c.277-.16.291-.651-.02-.828l-.217-.124c-.316-.18-.726-.414-.901-.517a1.02 1.02 0 0 0-.998.012c-.154.09-10.5 6.039-10.847 6.235a1.349 1.349 0 0 1-1.338 0L0 14.535v-2.693l.056.033a943.17 943.17 0 0 0 5.383 3.12c.478.27.936.264 1.397-.002l6.374-3.668.008-.005c3.2-1.84 6.426-3.698 6.568-3.78.277-.16.291-.65-.02-.828l-.217-.124c-.317-.18-.727-.414-.901-.516a1.02 1.02 0 0 0-.998.012c-.154.089-10.5 6.038-10.847 6.235a1.349 1.349 0 0 1-1.338 0L0 9.143V4c0-2.2 1.8-4 4-4Z" />
      <path fill="#fff" d="M6.836 14.993c.276-.16 3.311-1.906 6.374-3.668l.008-.005c3.2-1.84 6.426-3.698 6.568-3.78.277-.16.29-.65-.02-.828l-.217-.124c-.316-.18-.727-.414-.902-.516a1.02 1.02 0 0 0-.997.012c-.155.089-10.501 6.038-10.847 6.235a1.349 1.349 0 0 1-1.339 0L0 9.143v2.698l.056.033c1.364.795 4.592 2.674 5.383 3.12.478.27.936.264 1.397-.002Z" />
      <path fill="#fff" d="m6.836 20.385 6.366-3.664.024-.014 6.56-3.775c.277-.16.29-.651-.02-.828l-.217-.124c-.316-.18-.727-.414-.902-.517a1.02 1.02 0 0 0-.997.012c-.155.09-10.501 6.039-10.847 6.235a1.349 1.349 0 0 1-1.339 0L0 14.535v2.699l.057.033c1.365.795 4.591 2.674 5.382 3.12.478.27.936.264 1.397-.002Z" />
      <path fill="#fff" d="m13.21 22.108-6.374 3.668c-.461.266-.919.273-1.397.003-.79-.446-4.018-2.326-5.382-3.12L0 22.626v-2.699l5.464 3.175c.413.238.925.235 1.339 0 .346-.197 10.692-6.146 10.847-6.235a1.02 1.02 0 0 1 .997-.012c.175.103.586.336.902.516l.218.124c.31.177.296.669.019.829l-6.575 3.784Z" />
    </svg>
    <svg className="td-mark-own" width={p.size ?? 28} height={p.size ?? 28} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" style={{ fill: 'var(--td-brand)' }} />
      <path d="m9.5 16.5 4.5 4.5 8.5-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </>
)
