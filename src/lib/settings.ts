export type EventParseMode = 'fromName' | 'allGroups' | 'other'

export interface ScheduleSettings {
  /** Include calendar items with label "event" (team events, cancellations, etc.). */
  includeTeamEvents: boolean
  /** Fetch Commit meets (`includeMeets=true`) and show them on the week view. */
  queryMeets: boolean
  /** How to map team-event / meet titles onto group filters. */
  eventParseMode: EventParseMode
}

export const SETTINGS_KEY = 'delmar-schedule:settings'

export const DEFAULT_SETTINGS: ScheduleSettings = {
  includeTeamEvents: false,
  queryMeets: false,
  eventParseMode: 'fromName',
}

export const EVENT_PARSE_MODE_OPTIONS: Array<{
  value: EventParseMode
  label: string
  description: string
}> = [
  {
    value: 'fromName',
    label: 'From name',
    description: 'Detect Sr, Jr, Jr Prep, DEVO from the title',
  },
  {
    value: 'allGroups',
    label: 'All groups',
    description: 'Show under every group filter',
  },
  {
    value: 'other',
    label: 'Uncategorized',
    description: 'Bucket as Other',
  },
]

function isEventParseMode(value: unknown): value is EventParseMode {
  return value === 'fromName' || value === 'allGroups' || value === 'other'
}

export function getStoredSettings(): ScheduleSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<ScheduleSettings>
    return {
      includeTeamEvents:
        typeof parsed.includeTeamEvents === 'boolean'
          ? parsed.includeTeamEvents
          : DEFAULT_SETTINGS.includeTeamEvents,
      queryMeets:
        typeof parsed.queryMeets === 'boolean'
          ? parsed.queryMeets
          : DEFAULT_SETTINGS.queryMeets,
      eventParseMode: isEventParseMode(parsed.eventParseMode)
        ? parsed.eventParseMode
        : DEFAULT_SETTINGS.eventParseMode,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function setStoredSettings(settings: ScheduleSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
