import type { CSSProperties } from 'react'
import { SUB_TEAM_COLORS } from '../lib/groups'
import {
  dayHeading,
  formatTimeRange,
  formatTimeRangeCompact,
  isOccurrenceOnDay,
  type WeekModel,
} from '../lib/week'
import type { Occurrence, SubTeam } from '../types'

interface Props {
  week: WeekModel
  occurrences: Occurrence[]
  /** Single-group mobile fit: equal-height day rows, no page scroll */
  fitMode?: boolean
}

function primaryTeam(teams: SubTeam[]): SubTeam {
  return teams[0] ?? 'Other'
}

export function WeekSchedule({ week, occurrences, fitMode = false }: Props) {
  if (fitMode) {
    const rows = week.days
      .map((day) => {
        const heading = dayHeading(day)
        const dayOccs = occurrences.filter((o) =>
          isOccurrenceOnDay(o.start, day),
        )
        return { day, heading, dayOccs }
      })
      .filter((row) => row.dayOccs.length > 0)

    if (rows.length === 0) {
      return (
        <div className="week-list week-list--fit">
          <p className="day-col__empty">No practices</p>
        </div>
      )
    }

    return (
      <div className="week-list week-list--fit" role="list">
        {rows.map(({ day, heading, dayOccs }) => {
          const team = primaryTeam(dayOccs[0].subTeams)
          const loc =
            dayOccs[0].location ??
            dayOccs.map((o) => o.location).find(Boolean) ??
            'Practice'
          return (
            <article
              key={day.key}
              className={`day-row${heading.isToday ? ' is-today' : ''}`}
              role="listitem"
              style={
                {
                  '--card-accent': SUB_TEAM_COLORS[team],
                } as CSSProperties
              }
              aria-label={`${heading.weekday} ${heading.date}`}
            >
              <div className="day-row__main">
                <span className="day-row__when">
                  <span className="day-row__weekday">{heading.weekday}</span>
                  <span className="day-row__date">{heading.shortDate}</span>
                </span>
                <span className="day-row__loc">{loc}</span>
                <span className="day-row__time">
                  {dayOccs.length === 1
                    ? formatTimeRangeCompact(dayOccs[0].start, dayOccs[0].end)
                    : dayOccs
                        .map((o) => formatTimeRangeCompact(o.start, o.end))
                        .join(' · ')}
                </span>
              </div>
              {dayOccs.length > 1 ? (
                <ul className="day-row__extras">
                  {dayOccs.map((occ) => (
                    <li key={occ.id}>{occ.name}</li>
                  ))}
                </ul>
              ) : null}
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
