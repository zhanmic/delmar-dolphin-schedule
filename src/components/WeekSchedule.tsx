import type { CSSProperties } from 'react'
import { SUB_TEAM_COLORS } from '../lib/groups'
import {
  dayHeading,
  formatTimeRange,
  isOccurrenceOnDay,
  type WeekModel,
} from '../lib/week'
import type { Occurrence, SubTeam } from '../types'

interface Props {
  week: WeekModel
  occurrences: Occurrence[]
}

function primaryTeam(teams: SubTeam[]): SubTeam {
  return teams[0] ?? 'Other'
}

export function WeekSchedule({ week, occurrences }: Props) {
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
