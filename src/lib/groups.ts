import type { SubTeam } from '../types'

export const SUB_TEAM_ORDER: SubTeam[] = [
  'Sr',
  'Jr',
  'Jr Prep',
  'DEVO',
  'Sr/Jr',
  'Other',
]

export const SUB_TEAM_COLORS: Record<SubTeam, string> = {
  Sr: 'var(--team-sr)',
  Jr: 'var(--team-jr)',
  'Jr Prep': 'var(--team-jr-prep)',
  DEVO: 'var(--team-devo)',
  'Sr/Jr': 'var(--team-sr-jr)',
  Other: 'var(--team-other)',
}

/** Parse practice/event name into one or more sub-teams. */
export function parseSubTeams(name: string): SubTeam[] {
  const n = name.trim()
  const lower = n.toLowerCase()

  if (
    /\bjr\s*prep\b/.test(lower) ||
    /\bjrprep\b/.test(lower) ||
    /\bjunior\s*prep\b/.test(lower)
  ) {
    return ['Jr Prep']
  }

  if (/\bdevo\b/.test(lower)) {
    return ['DEVO']
  }

  const hasSr = /\bsr\b/.test(lower) || /\bsenior\b/.test(lower)
  const hasJr = /\bjr\b/.test(lower) || /\bjunior\b/.test(lower)

  if (hasSr && hasJr) return ['Sr/Jr']
  if (hasSr) return ['Sr']
  if (hasJr) return ['Jr']

  return ['Other']
}

const LOCATION_PATTERNS: Array<{ match: RegExp; label: string }> = [
  { match: /\belm\b|\belm\s*ave\b/i, label: 'Elm Ave' },
  { match: /\bbchs\b/i, label: 'BCHS' },
  { match: /\bbcms\b/i, label: 'BCMS' },
  { match: /\bacademy\b|\b\baa\b/i, label: 'Academy' },
  { match: /albany country club/i, label: 'Albany Country Club' },
  { match: /\brpi\b/i, label: 'RPI' },
]

export function parseLocation(name: string): string | null {
  for (const { match, label } of LOCATION_PATTERNS) {
    if (match.test(name)) return label
  }
  return null
}

export function occurrenceMatchesTeams(
  teams: SubTeam[],
  selected: Set<SubTeam>,
): boolean {
  if (selected.size === 0) return true
  if (teams.some((t) => selected.has(t))) return true
  // Shared Sr/Jr sessions appear when either Sr or Jr is selected
  if (teams.includes('Sr/Jr') && (selected.has('Sr') || selected.has('Jr'))) {
    return true
  }
  return false
}
