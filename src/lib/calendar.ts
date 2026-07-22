import { toZonedTime } from 'date-fns-tz'
import type { Occurrence } from '../types'
import { TEAM_TZ } from './week'

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0')
}

/** Escape text for ICS property values (same rules as swim-carpool). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/** Local wall-clock datetime for TZID fields: 20260721T063000 */
function formatIcsLocal(date: Date, timeZone: string): string {
  const zoned = toZonedTime(date, timeZone)
  return (
    `${zoned.getFullYear()}${pad(zoned.getMonth() + 1)}${pad(zoned.getDate())}` +
    `T${pad(zoned.getHours())}${pad(zoned.getMinutes())}${pad(zoned.getSeconds())}`
  )
}

function formatIcsUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function sessionKindLabel(occ: Occurrence): string {
  if (occ.label === 'meet') return 'Meet'
  if (occ.label === 'event') return 'Event'
  return 'Practice'
}

function occurrenceSummary(occ: Occurrence): string {
  const kind = sessionKindLabel(occ)
  if (occ.label === 'practice' && occ.subTeams.length > 0) {
    return `${occ.subTeams.join('/')} ${kind}`
  }
  return occ.name.trim() || kind
}

function occurrenceDescription(occ: Occurrence): string {
  const lines = [
    `Type: ${sessionKindLabel(occ)}`,
    occ.name ? `Name: ${occ.name}` : null,
    occ.subTeams.length ? `Groups: ${occ.subTeams.join(', ')}` : null,
    occ.location ? `Location: ${occ.location}` : null,
    'Source: Delma Dolphins Schedule',
  ].filter(Boolean) as string[]
  return lines.join('\n')
}

function occurrenceUid(occ: Occurrence): string {
  return `${occ.id}@delmar-dolphin-schedule`
}

export function buildIcsEvent(
  occ: Occurrence,
  timeZone: string = TEAM_TZ,
  now = new Date(),
): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${occurrenceUid(occ)}`,
    `DTSTAMP:${formatIcsUtcStamp(now)}`,
    `DTSTART;TZID=${timeZone}:${formatIcsLocal(occ.start, timeZone)}`,
    `DTEND;TZID=${timeZone}:${formatIcsLocal(occ.end, timeZone)}`,
    `SUMMARY:${escapeIcsText(occurrenceSummary(occ))}`,
  ]

  if (occ.location) {
    lines.push(`LOCATION:${escapeIcsText(occ.location)}`)
  }

  lines.push(`DESCRIPTION:${escapeIcsText(occurrenceDescription(occ))}`)
  lines.push('END:VEVENT')
  return lines.join('\r\n')
}

export function buildIcsCalendar(
  occurrences: Occurrence[],
  calendarName = 'Delma Dolphins Schedule',
  timeZone: string = TEAM_TZ,
): string {
  const now = new Date()
  const events = occurrences
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((occ) => buildIcsEvent(occ, timeZone, now))
    .join('\r\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Delmar Dolphins//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

function slugifyFilename(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'session'
  )
}

export function calendarFilenameForOccurrences(
  occurrences: Occurrence[],
): string {
  if (occurrences.length === 1) {
    return `delmar-${slugifyFilename(occurrenceSummary(occurrences[0]))}.ics`
  }
  return `delmar-week-${occurrences.length}-sessions.ics`
}

/**
 * Same trigger used by swim-carpool: create a text/calendar blob and click a
 * temporary download link. On iPhone Safari this opens the Quick Look sheet
 * with the “Add To Calendar” button (not a silent Files save when MIME is set).
 */
export function downloadCalendarEvent(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Offer an .ics calendar to the user (matches swim-carpool behavior).
 */
export async function offerCalendarFile(
  occurrences: Occurrence[],
  calendarName = 'Delma Dolphins Schedule',
  timeZone: string = TEAM_TZ,
): Promise<'downloaded' | 'empty'> {
  if (occurrences.length === 0) return 'empty'

  const ics = buildIcsCalendar(occurrences, calendarName, timeZone)
  const filename = calendarFilenameForOccurrences(occurrences)
  downloadCalendarEvent(ics, filename)
  return 'downloaded'
}
