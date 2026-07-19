import { addDays, format, isSameDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export const TEAM_TZ = 'America/New_York'

export interface WeekModel {
  /** Real UTC instants for filtering/expansion */
  rangeStart: Date
  rangeEnd: Date
  /** Local calendar days (Y/M/D in team TZ) for column headers */
  days: Array<{ year: number; month: number; date: number; key: string }>
  label: string
}

function localParts(date: Date, timeZone: string) {
  const z = toZonedTime(date, timeZone)
  return {
    year: z.getFullYear(),
    month: z.getMonth(),
    date: z.getDate(),
    day: z.getDay(),
  }
}

function atLocalMidnight(
  year: number,
  month: number,
  date: number,
  timeZone: string,
): Date {
  return fromZonedTime(new Date(year, month, date, 0, 0, 0, 0), timeZone)
}

export function getWeekModel(anchor: Date, timeZone: string = TEAM_TZ): WeekModel {
  const parts = localParts(anchor, timeZone)
  const weekStartDate = parts.date - parts.day // Sunday-based
  const start = atLocalMidnight(parts.year, parts.month, weekStartDate, timeZone)

  const startParts = localParts(start, timeZone)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = atLocalMidnight(
      startParts.year,
      startParts.month,
      startParts.date + i,
      timeZone,
    )
    const p = localParts(d, timeZone)
    return {
      year: p.year,
      month: p.month,
      date: p.date,
      key: `${p.year}-${p.month + 1}-${p.date}`,
    }
  })

  const endParts = days[6]
  const rangeEnd = atLocalMidnight(
    endParts.year,
    endParts.month,
    endParts.date + 1,
    timeZone,
  )

  const startLabel = format(
    toZonedTime(start, timeZone),
    'MMM d',
  )
  const endLabelDate = toZonedTime(
    atLocalMidnight(endParts.year, endParts.month, endParts.date, timeZone),
    timeZone,
  )
  const endLabel =
    startParts.month === endParts.month
      ? format(endLabelDate, 'd, yyyy')
      : format(endLabelDate, 'MMM d, yyyy')

  return {
    rangeStart: start,
    rangeEnd,
    days,
    label: `${startLabel} – ${endLabel}`,
  }
}

export function formatTimeRange(start: Date, end: Date, timeZone: string = TEAM_TZ) {
  const s = toZonedTime(start, timeZone)
  const e = toZonedTime(end, timeZone)
  return `${format(s, 'h:mm a')} – ${format(e, 'h:mm a')}`
}

/** Compact range for dense mobile rows, e.g. 6:30–8:15 AM */
export function formatTimeRangeCompact(
  start: Date,
  end: Date,
  timeZone: string = TEAM_TZ,
) {
  const s = toZonedTime(start, timeZone)
  const e = toZonedTime(end, timeZone)
  const sPeriod = format(s, 'a')
  const ePeriod = format(e, 'a')
  if (sPeriod === ePeriod) {
    return `${format(s, 'h:mm')}–${format(e, 'h:mm a')}`
  }
  return `${format(s, 'h:mm a')}–${format(e, 'h:mm a')}`
}

export function dayHeading(
  day: WeekModel['days'][number],
  timeZone: string = TEAM_TZ,
) {
  const instant = atLocalMidnight(day.year, day.month, day.date, timeZone)
  const local = toZonedTime(instant, timeZone)
  const today = toZonedTime(new Date(), timeZone)
  return {
    weekday: format(local, 'EEE'),
    date: format(local, 'MMM d'),
    shortDate: format(local, 'M/d'),
    isToday: isSameDay(local, today),
    instant,
  }
}

export function isOccurrenceOnDay(
  occStart: Date,
  day: WeekModel['days'][number],
  timeZone: string = TEAM_TZ,
) {
  const local = toZonedTime(occStart, timeZone)
  return (
    local.getFullYear() === day.year &&
    local.getMonth() === day.month &&
    local.getDate() === day.date
  )
}

export function shiftWeek(anchor: Date, deltaWeeks: number) {
  return addDays(anchor, deltaWeeks * 7)
}
