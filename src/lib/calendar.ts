import type { Occurrence } from '../types'

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0')
}

/** Format a Date as UTC iCalendar datetime: 20260722T143000Z */
export function formatIcsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

/** Escape text for ICS property values. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function foldIcsLine(line: string): string {
  // RFC 5545 recommends folding at 75 octets; keep it simple for ASCII-heavy content.
  if (line.length <= 70) return line
  const parts: string[] = []
  let remaining = line
  parts.push(remaining.slice(0, 70))
  remaining = remaining.slice(70)
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 69)}`)
    remaining = remaining.slice(69)
  }
  return parts.join('\r\n')
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

export function buildIcsEvent(occ: Occurrence, now = new Date()): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${occurrenceUid(occ)}`,
    `DTSTAMP:${formatIcsUtc(now)}`,
    `DTSTART:${formatIcsUtc(occ.start)}`,
    `DTEND:${formatIcsUtc(occ.end)}`,
    `SUMMARY:${escapeIcsText(occurrenceSummary(occ))}`,
  ]

  if (occ.location) {
    lines.push(`LOCATION:${escapeIcsText(occ.location)}`)
  }

  lines.push(`DESCRIPTION:${escapeIcsText(occurrenceDescription(occ))}`)
  lines.push('END:VEVENT')
  return lines.map(foldIcsLine).join('\r\n')
}

export function buildIcsCalendar(
  occurrences: Occurrence[],
  calendarName = 'Delma Dolphins Schedule',
): string {
  const now = new Date()
  const events = occurrences
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((occ) => buildIcsEvent(occ, now))
    .join('\r\n')

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Delmar Dolphins//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ]
    .map(foldIcsLine)
    .join('\r\n')

  return `${header}\r\n${events}\r\nEND:VCALENDAR\r\n`
}

function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'session'
}

export function calendarFilenameForOccurrences(
  occurrences: Occurrence[],
): string {
  if (occurrences.length === 1) {
    return `delmar-${slugifyFilename(occurrenceSummary(occurrences[0]))}.ics`
  }
  return `delmar-week-${occurrences.length}-sessions.ics`
}

function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/i.test(ua)) return true
  // iPadOS 13+ desktop UA with touch
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

/**
 * On iPhone/iPad Safari, open the .ics so the native “Add to Calendar”
 * sheet appears. Avoid the `download` attribute — that only saves a file.
 */
function openIcsInAppleCalendar(ics: string): boolean {
  // Safari treats an inline text/calendar data URL as “Add to Calendar”.
  // encodeURIComponent keeps newlines/commas valid in the URL.
  const dataUrl =
    'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)

  // Hidden iframe keeps the schedule page in place while Safari
  // hands the calendar file to the system Add sheet.
  try {
    const frame = document.createElement('iframe')
    frame.style.display = 'none'
    frame.setAttribute('aria-hidden', 'true')
    frame.src = dataUrl
    document.body.appendChild(frame)
    window.setTimeout(() => {
      frame.remove()
    }, 4000)
    return true
  } catch {
    // Fall through to navigation handoff.
  }

  // Same-tab handoff — Calendar sheet still appears; Back returns here.
  window.location.assign(dataUrl)
  return true
}

function downloadIcsFile(ics: string, filename: string): void {
  const url = URL.createObjectURL(
    new Blob([ics], { type: 'text/calendar;charset=utf-8' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Offer an .ics calendar to the user.
 * - iPhone/iPad: open inline so Safari shows Add to Calendar (not a download)
 * - Other browsers: share sheet with file when available, else download
 */
export async function offerCalendarFile(
  occurrences: Occurrence[],
  calendarName = 'Delma Dolphins Schedule',
): Promise<'opened' | 'shared' | 'downloaded' | 'cancelled' | 'empty'> {
  if (occurrences.length === 0) return 'empty'

  const ics = buildIcsCalendar(occurrences, calendarName)
  const filename = calendarFilenameForOccurrences(occurrences)

  if (isAppleTouchDevice()) {
    openIcsInAppleCalendar(ics)
    return 'opened'
  }

  const file = new File([ics], filename, { type: 'text/calendar' })

  try {
    if (
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: calendarName,
        text:
          occurrences.length === 1
            ? occurrenceSummary(occurrences[0])
            : `${occurrences.length} sessions from Delma Dolphins Schedule`,
      })
      return 'shared'
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'cancelled'
    }
  }

  downloadIcsFile(ics, filename)
  return 'downloaded'
}
