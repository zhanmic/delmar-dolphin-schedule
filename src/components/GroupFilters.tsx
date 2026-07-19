import type { CSSProperties } from 'react'
import {
  EVENT_COLOR,
  MEET_COLOR,
  SUB_TEAM_COLORS,
  SUB_TEAM_ORDER,
} from '../lib/groups'
import type { SubTeam } from '../types'

interface KindFilter {
  count: number
  selected: boolean
  onChange: (selected: boolean) => void
}

interface Props {
  available: SubTeam[]
  selected: Set<SubTeam>
  onChange: (next: Set<SubTeam>) => void
  counts: Partial<Record<SubTeam, number>>
  /** When Include team events is on, show a separate Event chip (not a group). */
  eventFilter?: KindFilter | null
  /** When Query meets is on, show a separate Meet chip (not a group). */
  meetFilter?: KindFilter | null
}

export function GroupFilters({
  available,
  selected,
  onChange,
  counts,
  eventFilter = null,
  meetFilter = null,
}: Props) {
  const teams = SUB_TEAM_ORDER.filter((t) => available.includes(t))

  function toggle(team: SubTeam) {
    const next = new Set(selected)
    if (next.has(team)) next.delete(team)
    else next.add(team)
    onChange(next)
  }

  function selectAll() {
    onChange(new Set(teams))
    eventFilter?.onChange(true)
    meetFilter?.onChange(true)
  }

  function clearAll() {
    onChange(new Set())
    eventFilter?.onChange(false)
    meetFilter?.onChange(false)
  }

  return (
    <section className="filters" aria-label="Sub-team filters">
      <div className="filters__header">
        <h2>Groups</h2>
        <div className="filters__actions">
          <button type="button" className="text-btn" onClick={selectAll}>
            All
          </button>
          <button type="button" className="text-btn" onClick={clearAll}>
            Clear
          </button>
        </div>
      </div>
      <div className="filters__list" role="group">
        {teams.map((team) => {
          const active = selected.has(team)
          const count = counts[team] ?? 0
          return (
            <button
              key={team}
              type="button"
              className={`filter-chip${active ? ' is-active' : ''}`}
              style={{ '--chip-color': SUB_TEAM_COLORS[team] } as CSSProperties}
              aria-pressed={active}
              aria-label={`${team}, ${count} this week`}
              onClick={() => toggle(team)}
            >
              <span className="filter-chip__dot" aria-hidden />
              <span className="filter-chip__label">{team}</span>
              <span
                className="filter-chip__count"
                aria-label={`${count} this week`}
              >
                {count}
              </span>
            </button>
          )
        })}

        {eventFilter ? (
          <button
            type="button"
            className={`filter-chip filter-chip--event${
              eventFilter.selected ? ' is-active' : ''
            }`}
            style={{ '--chip-color': EVENT_COLOR } as CSSProperties}
            aria-pressed={eventFilter.selected}
            aria-label={`Events, ${eventFilter.count} this week`}
            onClick={() => eventFilter.onChange(!eventFilter.selected)}
          >
            <span className="filter-chip__dot" aria-hidden />
            <span className="filter-chip__label">Event</span>
            <span
              className="filter-chip__count"
              aria-label={`${eventFilter.count} this week`}
            >
              {eventFilter.count}
            </span>
          </button>
        ) : null}

        {meetFilter ? (
          <button
            type="button"
            className={`filter-chip filter-chip--meet${
              meetFilter.selected ? ' is-active' : ''
            }`}
            style={{ '--chip-color': MEET_COLOR } as CSSProperties}
            aria-pressed={meetFilter.selected}
            aria-label={`Meets, ${meetFilter.count} this week`}
            onClick={() => meetFilter.onChange(!meetFilter.selected)}
          >
            <span className="filter-chip__dot" aria-hidden />
            <span className="filter-chip__label">Meet</span>
            <span
              className="filter-chip__count"
              aria-label={`${meetFilter.count} this week`}
            >
              {meetFilter.count}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  )
}
