export type EventParseMode = 'fromName' | 'allGroups' | 'other'

/** Roles for segments of a practice title split by the separator. */
export type NameField = 'group' | 'location' | 'time' | 'ignore'

export type PracticeParseMode = 'fields' | 'keywords'

export interface PracticeNameFormat {
  /** `fields` = split title by separator; `keywords` = scan whole title. */
  mode: PracticeParseMode
  /** Separator between group / location / time (default "-"). */
  separator: string
  /** Ordered meaning of each segment after splitting. */
  fields: NameField[]
}

export interface ScheduleSettings {
  /** Include calendar items with label "event" (team events, cancellations, etc.). */
  includeTeamEvents: boolean
  /** Fetch Commit meets (`includeMeets=true`) and show them on the week view. */
  queryMeets: boolean
  /** How to map team-event / meet titles onto group filters. */
  eventParseMode: EventParseMode
  /** How to parse practice titles into group + location. */
  practiceNameFormat: PracticeNameFormat
}

export const SETTINGS_KEY = 'delmar-schedule:settings'

export const DEFAULT_PRACTICE_NAME_FORMAT: PracticeNameFormat = {
  mode: 'fields',
  separator: '-',
  fields: ['group', 'location', 'time'],
}

export const DEFAULT_SETTINGS: ScheduleSettings = {
  includeTeamEvents: false,
  queryMeets: false,
  eventParseMode: 'fromName',
  practiceNameFormat: { ...DEFAULT_PRACTICE_NAME_FORMAT },
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

export const PRACTICE_PARSE_MODE_OPTIONS: Array<{
  value: PracticeParseMode
  label: string
  description: string
}> = [
  {
    value: 'fields',
    label: 'Fields',
    description: 'Split title into group, location, then time',
  },
  {
    value: 'keywords',
    label: 'Keywords',
    description: 'Scan the whole title for group and pool names',
  },
]

export const NAME_FIELD_OPTIONS: Array<{ value: NameField; label: string }> = [
  { value: 'group', label: 'Group' },
  { value: 'location', label: 'Location' },
  { value: 'time', label: 'Time (ignore)' },
  { value: 'ignore', label: 'Ignore' },
]

function isEventParseMode(value: unknown): value is EventParseMode {
  return value === 'fromName' || value === 'allGroups' || value === 'other'
}

function isPracticeParseMode(value: unknown): value is PracticeParseMode {
  return value === 'fields' || value === 'keywords'
}

function isNameField(value: unknown): value is NameField {
  return (
    value === 'group' ||
    value === 'location' ||
    value === 'time' ||
    value === 'ignore'
  )
}

function normalizePracticeNameFormat(
  value: unknown,
): PracticeNameFormat {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_PRACTICE_NAME_FORMAT }
  }
  const raw = value as Partial<PracticeNameFormat>
  const fields = Array.isArray(raw.fields)
    ? raw.fields.filter(isNameField)
    : DEFAULT_PRACTICE_NAME_FORMAT.fields
  return {
    mode: isPracticeParseMode(raw.mode)
      ? raw.mode
      : DEFAULT_PRACTICE_NAME_FORMAT.mode,
    separator:
      typeof raw.separator === 'string' && raw.separator.length > 0
        ? raw.separator
        : DEFAULT_PRACTICE_NAME_FORMAT.separator,
    fields: fields.length ? fields : [...DEFAULT_PRACTICE_NAME_FORMAT.fields],
  }
}

export function getStoredSettings(): ScheduleSettings {
  if (typeof window === 'undefined') return {
    ...DEFAULT_SETTINGS,
    practiceNameFormat: { ...DEFAULT_PRACTICE_NAME_FORMAT },
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        practiceNameFormat: { ...DEFAULT_PRACTICE_NAME_FORMAT },
      }
    }
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
      practiceNameFormat: normalizePracticeNameFormat(parsed.practiceNameFormat),
    }
  } catch {
    return {
      ...DEFAULT_SETTINGS,
      practiceNameFormat: { ...DEFAULT_PRACTICE_NAME_FORMAT },
    }
  }
}

export function setStoredSettings(settings: ScheduleSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
