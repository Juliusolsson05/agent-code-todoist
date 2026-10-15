/** Agent sessions only — not terminals or extension panes — for the Quick Add
 *  modal's "Link to agent" row.
 *
 *  A session with no stored kind IS an agent: sessions saved before
 *  multi-provider carry none, and the host treats that as its default provider
 *  (agent-code rehydrate.ts `meta.kind ?? DEFAULT_PROVIDER`). The two non-agent
 *  kinds are spelled out, per the host's own warning against negative pattern
 *  tests (agent-code src/shared/types/providerKind.ts); the first version's
 *  `/terminal|shell|extension/` test silently dropped every kind-less agent
 *  (review of PR #2). */
export function isAgentSession(kind: string | null | undefined): boolean {
  return kind !== 'terminal' && kind !== 'extension-view'
}
