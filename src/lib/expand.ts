import { addDays, addMonths, addYears } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import type { CommitEvent, CommitMeet, Occurrence } from '../types'
import { parseEventTeams } from './groups'
import { parsePracticeName } from './nameFormat'
import {
  DEFAULT_PRACTICE_NAME_FORMAT,
  type EventParseMode,
  type PracticeNameFormat,
} from './settings'

const DEFAULT_TZ = 'America/New_York'

function parseUtc(iso: string): Date {
  return new Date(iso)
}

/** Local midnight epoch-ms in team timezone (matches Commit custom ids). */
function dayStartMs(date: Date, timeZone: string): number {
  const zoned = toZonedTime(date, timeZone)
  const midnightLocal = new Date(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    0,
    0,
    0,
    0,
  )
  return fromZonedTime(midnightLocal, timeZone).getTime()
}

/** Moment-style day(): Sun=0 … Sat=6 in team timezone. */
function momentDay(date: Date, timeZone: string): number {
  return toZonedTime(date, timeZone).getDay()
}

function advanceByPeriod(
  date: Date,
  period: string,
): Date {
  switch (period) {
    case 'weekly':
      return addDays(date, 7)
    case 'monthly':
      return addMonths(date, 1)
    case 'yearly':
      return addYears(date, 1)
    case 'weekdays':
    default:
      return addDays(date, 1)
  }
}

/**
 * Expand Commit calendar events into concrete occurrences in [rangeStart, rangeEnd).
 * Mirrors the recurrence logic used by commitswimming.com website JS.
 */
export function expandEvents(
  events: CommitEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  timeZone: string = DEFAULT_TZ,
  eventParseMode: EventParseMode = 'fromName',
  practiceNameFormat: PracticeNameFormat = DEFAULT_PRACTICE_NAME_FORMAT,
): Occurrence[] {
  const results: Occurrence[] = []

  for (const event of events) {
    const baseStart = parseUtc(event.startDate)
    const baseEnd = parseUtc(event.endDate)
    const durationMs = baseEnd.getTime() - baseStart.getTime()
    const rec = event.recurring

    if (!rec) {
      if (baseStart >= rangeStart && baseStart < rangeEnd) {
        results.push(
          toOccurrence(
            event,
            event.name,
            baseStart,
            baseEnd,
            eventParseMode,
            practiceNameFormat,
          ),
        )
      }
      continue
    }

    const until = parseUtc(rec.endDate)
    const allowedDays = new Set(rec.days ?? [1, 2, 3, 4, 5])
    const customs = new Map((rec.custom ?? []).map((c) => [c.id, c]))

    // Commit builds dtstart from UTC Y/M/D/H/M/S components of startDate
    let cursor = new Date(
      Date.UTC(
        baseStart.getUTCFullYear(),
        baseStart.getUTCMonth(),
        baseStart.getUTCDate(),
        baseStart.getUTCHours(),
        baseStart.getUTCMinutes(),
        baseStart.getUTCSeconds(),
      ),
    )
    const untilUtc = new Date(
      Date.UTC(
        until.getUTCFullYear(),
        until.getUTCMonth(),
        until.getUTCDate(),
        until.getUTCHours(),
        until.getUTCMinutes(),
        until.getUTCSeconds(),
      ),
    )

    let guard = 0
    while (cursor <= untilUtc && guard < 800) {
      guard += 1

      if (rec.period === 'weekdays') {
        if (!allowedDays.has(momentDay(cursor, timeZone))) {
          cursor = advanceByPeriod(cursor, rec.period)
          continue
        }
      }

      if (cursor < rangeStart) {
        // still need custom check only if in range; skip early dates cheaply
        if (cursor.getTime() + durationMs < rangeStart.getTime()) {
          cursor = advanceByPeriod(cursor, rec.period)
          continue
        }
      }

      const custom = customs.get(dayStartMs(cursor, timeZone))
      if (custom?.removed) {
        cursor = advanceByPeriod(cursor, rec.period)
        continue
      }

      let occStart = cursor
      let occEnd = new Date(cursor.getTime() + durationMs)
      let name = event.name

      if (custom?.startTime && custom.endTime) {
        occStart = parseUtc(custom.startTime)
        occEnd = parseUtc(custom.endTime)
        name = custom.name || event.name
      }

      if (occStart >= rangeStart && occStart < rangeEnd) {
        results.push(
          toOccurrence(
            event,
            name,
            occStart,
            occEnd,
            eventParseMode,
            practiceNameFormat,
          ),
        )
      }

      cursor = advanceByPeriod(cursor, rec.period)
    }
  }

  return results.sort((a, b) => a.start.getTime() - b.start.getTime())
}

function toOccurrence(
  event: CommitEvent,
  name: string,
  start: Date,
  end: Date,
  eventParseMode: EventParseMode = 'fromName',
  practiceNameFormat: PracticeNameFormat = DEFAULT_PRACTICE_NAME_FORMAT,
): Occurrence {
  const isTeamEvent = event.label === 'event'
  if (isTeamEvent) {
    return {
      id: `${event._id}-${start.getTime()}`,
      sourceId: event._id,
      name,
      label: event.label,
      start,
      end,
      subTeams: parseEventTeams(name, eventParseMode),
      location: parsePracticeName(name, practiceNameFormat).location,
    }
  }

  const parsed = parsePracticeName(name, practiceNameFormat)
  return {
    id: `${event._id}-${start.getTime()}`,
    sourceId: event._id,
    name,
    label: event.label,
    start,
    end,
    subTeams: parsed.subTeams,
    location: parsed.location,
  }
}

export function expandPractices(
  events: CommitEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  timeZone?: string,
  practiceNameFormat: PracticeNameFormat = DEFAULT_PRACTICE_NAME_FORMAT,
): Occurrence[] {
  return expandEvents(
    events.filter((e) => e.label === 'practice'),
    rangeStart,
    rangeEnd,
    timeZone,
    'fromName',
    practiceNameFormat,
  )
}

/** Convert Commit meets into week occurrences (one row per meet start). */
export function expandMeets(
  meets: CommitMeet[],
  rangeStart: Date,
  rangeEnd: Date,
  eventParseMode: EventParseMode = 'fromName',
): Occurrence[] {
  const results: Occurrence[] = []

  for (const meet of meets) {
    const start = parseUtc(meet.startDateTime)
    const end = parseUtc(meet.endDateTime)
    if (start < rangeStart || start >= rangeEnd) continue

    const name =
      (meet.userTitle && meet.userTitle.trim()) ||
      (meet.titleEventsFile && meet.titleEventsFile.trim()) ||
      'Meet'
    const location =
      (meet.locationDetails && meet.locationDetails.trim()) ||
      [meet.city, meet.state].filter(Boolean).join(', ') ||
      null

    results.push({
      id: `meet-${meet._id}-${start.getTime()}`,
      sourceId: meet._id,
      name,
      label: 'meet',
      start,
      end,
      subTeams: parseEventTeams(name, eventParseMode),
      location,
    })
  }

  return results.sort((a, b) => a.start.getTime() - b.start.getTime())
}
