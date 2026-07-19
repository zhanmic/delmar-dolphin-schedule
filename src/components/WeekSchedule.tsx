import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { MEET_COLOR, SUB_TEAM_COLORS } from '../lib/groups'
import {
  dayHeading,
  formatTimeRange,
  formatTimeRangeCompact,
  isOccurrenceOnDay,
  type WeekModel,
} from '../lib/week'
import type { Occurrence, SubTeam } from '../types'
import { DayDetailSheet } from './DayDetailSheet'

interface Props {
  week: WeekModel
  occurrences: Occurrence[]
  /** Mobile concise list (carpool-style rows) */
  fitMode?: boolean
}

function primaryTeam(teams: SubTeam[]): SubTeam {
  return teams[0] ?? 'Other'
}

function sessionAccent(occ: Occurrence): string {
  if (occ.label === 'meet') return MEET_COLOR
  return SUB_TEAM_COLORS[primaryTeam(occ.subTeams)]
}

function sessionLabel(occ: Occurrence): string {
  if (occ.label === 'meet') return 'Meet'
  return primaryTeam(occ.subTeams)
}

function groupOccurrencesByDay(week: WeekModel, occurrences: Occurrence[]) {
  return week.days
    .map((day) => {
      const dayOccs = occurrences.filter((o) => isOccurrenceOnDay(o.start, day))
      return {
        day,
        heading: dayHeading(day),
        occurrences: dayOccs,
      }
    })
    .filter((group) => group.occurrences.length > 0)
}

export function WeekSchedule({ week, occurrences, fitMode = false }: Props) {
  const [openDayKey, setOpenDayKey] = useState<string | null>(null)

  const dayGroups = groupOccurrencesByDay(week, occurrences)
  const openGroup =
    openDayKey == null
      ? null
      : dayGroups.find((group) => group.day.key === openDayKey) ?? null

  function openDay(key: string) {
    setOpenDayKey(key)
  }

  function onDayKeyDown(event: KeyboardEvent, key: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDay(key)
    }
  }

  const detailSheet = openGroup ? (
    <DayDetailSheet
      title={`${openGroup.heading.weekday}, ${openGroup.heading.date}`}
      subtitle={`${openGroup.occurrences.length} session${
        openGroup.occurrences.length === 1 ? '' : 's'
      } · Commit API details`}
      occurrences={openGroup.occurrences}
      onClose={() => setOpenDayKey(null)}
    />
  ) : null

  if (fitMode) {
    if (occurrences.length === 0) {
      return (
        <div className="week-list week-list--fit">
          <p className="day-col__empty">No practices</p>
        </div>
      )
    }

    return (
      <>
        <div className="week-list week-list--fit" role="list">
          {dayGroups.map((group) => (
            <section
              key={group.day.key}
              className={`day-group day-group--interactive${
                group.heading.isToday ? ' is-today' : ''
              }`}
              role="button"
              tabIndex={0}
              aria-label={`${group.heading.weekday} ${group.heading.shortDate}, ${group.occurrences.length} sessions. Open full details.`}
              style={
                {
                  '--day-sessions': String(group.occurrences.length),
                } as CSSProperties
              }
              onClick={() => openDay(group.day.key)}
              onKeyDown={(event) => onDayKeyDown(event, group.day.key)}
            >
              <header className="day-group__when">
                <span className="day-group__weekday">
                  {group.heading.weekday}
                </span>
                <span className="day-group__date">
                  {group.heading.shortDate}
                </span>
              </header>

              <div className="day-group__sessions">
                {group.occurrences.map((occ) => {
                  const isMeet = occ.label === 'meet'
                  const team = sessionLabel(occ)
                  const loc =
                    occ.location ??
                    (isMeet ? occ.name : 'Practice')
                  const primary = isMeet ? 'Meet' : team
                  return (
                    <article
                      key={occ.id}
                      className={`day-session day-session--${
                        isMeet ? 'meet' : 'practice'
                      }`}
                      style={
                        {
                          '--card-accent': sessionAccent(occ),
                        } as CSSProperties
                      }
                      aria-label={`${isMeet ? 'Meet' : 'Practice'}, ${primary}, ${loc}, ${formatTimeRangeCompact(occ.start, occ.end)}`}
                    >
                      <span className="day-session__mid">
                        <span className="day-session__top">
                          <span className="day-session__kind">
                            {isMeet ? 'Meet' : 'Practice'}
                          </span>
                          {!isMeet ? (
                            <span className="day-session__team">{team}</span>
                          ) : null}
                        </span>
                        <span className="day-session__loc">{loc}</span>
                      </span>
                      <span className="day-session__time">
                        {formatTimeRangeCompact(occ.start, occ.end)}
                      </span>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
        {detailSheet}
      </>
    )
  }

  return (
    <>
      <div className="week-grid" role="list">
        {week.days.map((day) => {
          const heading = dayHeading(day)
          const dayOccs = occurrences.filter((o) =>
            isOccurrenceOnDay(o.start, day),
          )
          const interactive = dayOccs.length > 0

          return (
            <section
              key={day.key}
              className={`day-col${heading.isToday ? ' is-today' : ''}${
                interactive ? ' day-col--interactive' : ''
              }`}
              role={interactive ? 'button' : 'listitem'}
              tabIndex={interactive ? 0 : undefined}
              aria-label={
                interactive
                  ? `${heading.weekday} ${heading.date}, ${dayOccs.length} sessions. Open full details.`
                  : `${heading.weekday} ${heading.date}`
              }
              onClick={interactive ? () => openDay(day.key) : undefined}
              onKeyDown={
                interactive
                  ? (event) => onDayKeyDown(event, day.key)
                  : undefined
              }
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
                    const isMeet = occ.label === 'meet'
                    const team = sessionLabel(occ)
                    return (
                      <article
                        key={occ.id}
                        className={`practice-card practice-card--${
                          isMeet ? 'meet' : 'practice'
                        }`}
                        style={
                          {
                            '--card-accent': sessionAccent(occ),
                          } as CSSProperties
                        }
                      >
                        <div className="practice-card__meta">
                          <span className="practice-card__kind">
                            {isMeet ? 'Meet' : 'Practice'}
                          </span>
                          {!isMeet ? (
                            <span className="practice-card__team">{team}</span>
                          ) : null}
                          {occ.location ? (
                            <span className="practice-card__loc">
                              {occ.location}
                            </span>
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
      {detailSheet}
    </>
  )
}
