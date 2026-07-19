import { useEffect, useMemo, useState } from 'react'
import { fetchScheduleData, fetchTeamConfig } from './api/commit'
import { GroupFilters } from './components/GroupFilters'
import { SettingsButton } from './components/SettingsButton'
import { ThemeToggle } from './components/ThemeToggle'
import { WeekNav } from './components/WeekNav'
import { WeekSchedule } from './components/WeekSchedule'
import { expandEvents, expandMeets, expandPractices } from './lib/expand'
import { occurrenceMatchesTeams, SUB_TEAM_ORDER } from './lib/groups'
import {
  getStoredSettings,
  setStoredSettings,
  type ScheduleSettings,
} from './lib/settings'
import { getWeekModel, shiftWeek, TEAM_TZ } from './lib/week'
import type { CommitEvent, CommitMeet, SubTeam } from './types'
import './App.css'

const DEFAULT_SELECTED: SubTeam[] = ['Sr']

export default function App() {
  const [anchor, setAnchor] = useState(() => new Date())
  const [events, setEvents] = useState<CommitEvent[]>([])
  const [meets, setMeets] = useState<CommitMeet[]>([])
  const [timeZone, setTimeZone] = useState(TEAM_TZ)
  const [selected, setSelected] = useState<Set<SubTeam>>(
    () => new Set(DEFAULT_SELECTED),
  )
  const [settings, setSettings] = useState<ScheduleSettings>(() =>
    getStoredSettings(),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setStoredSettings(settings)
  }, [settings])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [config, schedule] = await Promise.all([
          fetchTeamConfig(),
          fetchScheduleData(settings.queryMeets),
        ])
        if (cancelled) return
        setTimeZone(config.superTeam?.timezone ?? TEAM_TZ)
        setEvents(schedule.events ?? [])
        setMeets(settings.queryMeets ? (schedule.meets ?? []) : [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load schedule')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [settings.queryMeets])

  const week = useMemo(
    () => getWeekModel(anchor, timeZone),
    [anchor, timeZone],
  )

  const weekOccurrences = useMemo(() => {
    const practices = expandPractices(
      events,
      week.rangeStart,
      week.rangeEnd,
      timeZone,
    )

    const teamEvents = settings.includeTeamEvents
      ? expandEvents(
          events.filter((e) => e.label === 'event'),
          week.rangeStart,
          week.rangeEnd,
          timeZone,
          settings.eventParseMode,
        )
      : []

    const meetOccurrences = settings.queryMeets
      ? expandMeets(
          meets,
          week.rangeStart,
          week.rangeEnd,
          settings.eventParseMode,
        )
      : []

    return [...practices, ...teamEvents, ...meetOccurrences].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    )
  }, [events, meets, week, timeZone, settings])

  const availableTeams = useMemo(() => {
    const present = new Set<SubTeam>()
    for (const occ of weekOccurrences) {
      for (const t of occ.subTeams) present.add(t)
    }
    const core: SubTeam[] = ['Sr', 'Jr', 'Jr Prep', 'DEVO']
    return SUB_TEAM_ORDER.filter(
      (t) => core.includes(t) || present.has(t),
    )
  }, [weekOccurrences])

  const counts = useMemo(() => {
    const map: Partial<Record<SubTeam, number>> = {}
    for (const occ of weekOccurrences) {
      for (const t of occ.subTeams) {
        map[t] = (map[t] ?? 0) + 1
      }
    }
    return map
  }, [weekOccurrences])

  const filtered = useMemo(
    () =>
      weekOccurrences.filter((o) =>
        occurrenceMatchesTeams(o.subTeams, selected),
      ),
    [weekOccurrences, selected],
  )

  /** Phone → concise carpool-style rows for any group selection. */
  const fitMode = isMobile
  /** Few sessions fill the screen; more sessions scroll inside the list. */
  const fitScroll = fitMode && filtered.length > 8

  return (
    <div
      className={`app${fitMode ? ' app--fit' : ''}${fitScroll ? ' app--fit-scroll' : ''}`}
    >
      <div className="app__glow" aria-hidden />
      <header className="hero">
        <div className="hero__top">
          <SettingsButton settings={settings} onChange={setSettings} />
          <h1 className="hero__brand">Delma Dolphins Schedule</h1>
          <ThemeToggle />
        </div>
        <p className="hero__sub">
          Weekly view by group — powered by the live Commit calendar API.
        </p>
      </header>

      <main className="panel">
        <WeekNav
          label={week.label}
          onPrev={() => setAnchor((d) => shiftWeek(d, -1))}
          onNext={() => setAnchor((d) => shiftWeek(d, 1))}
          onToday={() => setAnchor(new Date())}
        />

        {loading ? (
          <div className="state">Loading schedule…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : (
          <>
            <GroupFilters
              available={availableTeams}
              selected={selected}
              onChange={setSelected}
              counts={counts}
            />

            {filtered.length === 0 ? (
              <div className="state">
                No sessions this week for the selected groups.
              </div>
            ) : (
              <WeekSchedule
                week={week}
                occurrences={filtered}
                fitMode={fitMode}
              />
            )}
          </>
        )}

        <footer className="footer">
          <a
            href="https://www.delmardolfins.com/schedule"
            target="_blank"
            rel="noreferrer"
          >
            Official Commit calendar
          </a>
          <span>·</span>
          <span>{timeZone.replace(/_/g, ' ')}</span>
        </footer>
      </main>
    </div>
  )
}
