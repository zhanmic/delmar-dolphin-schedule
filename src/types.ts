export type EventLabel = 'practice' | 'event' | string

export interface RecurringCustom {
  id: number
  removed?: boolean
  name?: string
  startTime?: string
  endTime?: string
  attachments?: unknown[]
}

export interface Recurring {
  period: 'weekdays' | 'weekly' | 'monthly' | 'yearly' | string
  endDate: string
  days?: number[]
  custom?: RecurringCustom[]
}

export interface CommitEvent {
  _id: string
  label: EventLabel
  name: string
  startDate: string
  endDate: string
  recurring?: Recurring
  visibleTo?: string
  superTeamId?: string
}

export interface WebsiteData2b {
  events: CommitEvent[]
  programs?: unknown[]
  coachesAndAdmins?: unknown[]
  clubs?: unknown[]
  recordBoards?: unknown[]
}

export interface WebsiteData2a {
  superTeam?: {
    _id: string
    name: string
    timezone?: string
  }
  websiteConfig?: unknown
  settings?: unknown
}

export type SubTeam =
  | 'Sr'
  | 'Jr'
  | 'Jr Prep'
  | 'DEVO'
  | 'Sr/Jr'
  | 'Other'

export interface Occurrence {
  id: string
  sourceId: string
  name: string
  label: EventLabel
  start: Date
  end: Date
  subTeams: SubTeam[]
  location: string | null
}
