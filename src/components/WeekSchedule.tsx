import type { CSSProperties } from 'react'
import { toZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
import { SUB_TEAM_COLORS } from '../lib/groups'
import {
  dayHeading,
  formatTimeRange,
  formatTimeRangeCompact,
  isOccurrenceOnDay,
  TEAM_TZ,
  type WeekModel,
} from '../lib/week'
import type { Occurrence, SubTeam } from '../types'

interface Props {
  week: WeekModel
  occurrences: Occurrence[]
  /** Mobile concise list (carpool-style rows) */
  fitMode?: boolean
}

function primaryTeam(teams: SubTeam[]): SubTeam {
  return teams[0] ?? 'Other'
}

function occDayMeta(occ: Occurrence, week: WeekModel) {
  const day = week.days.find((d) => isOccurrenceOnDay(occ.start, d))
  if (day) return dayHeading(day)
  const local = toZonedTime(occ.start, TEAM_TZ)
  return {
    weekday: format(local, 'EEE'),
    date: format(local, 'MMM d'),
    shortDate: format(local, 'M/d'),
    isToday: false,
    instant: local,
  }
}

export function WeekSchedule({ week, occurrences, fitMode = false }: Props) {
  if (fitMode) {
    if (occurrences.length === 0) {
      return (
        <div className="week-list week-list--fit">
          <p className="day-col__empty">No practices</p>
        </div>
      )
    }

    return (
      <div className="week-list week-list--fit" role="list">
        {occurrences.map((occ) => {
          const team = primaryTeam(occ.subTeams)
          const heading = occDayMeta(occ, week)
          const loc = occ.location ?? 'Practice'
          return (
            <article
              key={occ.id}
              className={`day-row${heading.isToday ? ' is-today' : ''}`}
              role="listitem"
              style={
                {
                  '--card-accent': SUB_TEAM_COLORS[team],
                } as CSSProperties
              }
              aria-label={`${heading.weekday} ${heading.shortDate}, ${team}, ${loc}`}
            >
              <div className="day-row__main">
                <span className="day-row__when">
                  <span className="day-row__weekday">{heading.weekday}</span>
                  <span className="day-row__date">{heading.shortDate}</span>
                </span>
                <span className="day-row__mid">
                  <span className="day-row__team">{team}</span>
                  <span className="day-row__loc">{loc}</span>
                </span>
                <span className="day-row__time">
                  {formatTimeRangeCompact(occ.start, occ.end)}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="week-grid" role="list">
      {week.days.map((day) => {
        const heading = dayHeading(day)
        const dayOccs = occurrences.filter((o) =>
          isOccurrenceOnDay(o.start, day),
        )

        return (
          <section
            key={day.key}
            className={`day-col${heading.isToday ? ' is-today' : ''}`}
            role="listitem"
            aria-label={`${heading.weekday} ${heading.date}`}
          >
            <header className="day-col__head">
              <span className="day-col__weekday">{heading.weekday}</span>
              <span className="day-col__date">{heading.date}</span>
            </header>

            <div className="day-col__body">
              {dayOccs.length === 0 ? (
                <p className="day-col__empty">No practices</p>
              ) : (
                dayOccs.map((occ) => {
                  const team = primaryTeam(occ.subTeams)
                  return (
                    <article
                      key={occ.id}
                      className="practice-card"
                      style={
                        {
                          '--card-accent': SUB_TEAM_COLORS[team],
                        } as CSSProperties
                      }
                    >
                      <div className="practice-card__meta">
                        <span className="practice-card__team">{team}</span>
                        {occ.location ? (
                          <span className="practice-card__loc">{occ.location}</span>
                        ) : null}
                      </div>
                      <h3 className="practice-card__title">{occ.name}</h3>
                      <p className="practice-card__time">
                        {formatTimeRange(occ.start, occ.end)}
                      </p>
                    </article>
                  )
                })
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
