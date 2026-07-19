import { useEffect, useId, useRef, useState } from 'react'
import {
  EVENT_PARSE_MODE_OPTIONS,
  type EventParseMode,
  type ScheduleSettings,
} from '../lib/settings'
import { useTheme } from './ThemeProvider'

interface SettingsButtonProps {
  className?: string
  settings: ScheduleSettings
  onChange: (next: ScheduleSettings) => void
}

export function SettingsButton({
  className = '',
  settings,
  onChange,
}: SettingsButtonProps) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function patch(partial: Partial<ScheduleSettings>) {
    onChange({ ...settings, ...partial })
  }

  return (
    <div
      ref={rootRef}
      className={`settings${className ? ` ${className}` : ''}`}
    >
      <button
        type="button"
        className="settings__button"
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="settings__icon"
          aria-hidden
        >
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.86 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className="settings__panel"
          role="dialog"
          aria-label="Settings"
        >
          <p className="settings__heading">Schedule</p>

          <label className="settings__switch">
            <input
              type="checkbox"
              checked={settings.includeTeamEvents}
              onChange={(e) => patch({ includeTeamEvents: e.target.checked })}
            />
            <span>
              <span className="settings__switch-label">Include team events</span>
              <span className="settings__switch-hint">
                Calendar items like meetings, breaks, and cancellations
              </span>
            </span>
          </label>

          <label className="settings__switch">
            <input
              type="checkbox"
              checked={settings.queryMeets}
              onChange={(e) => patch({ queryMeets: e.target.checked })}
            />
            <span>
              <span className="settings__switch-label">Query meets</span>
              <span className="settings__switch-hint">
                Fetch Commit meet entries and show them on the week
              </span>
            </span>
          </label>

          <p className="settings__heading settings__heading--spaced">
            Parse team events
          </p>
          <div
            className="settings__stack"
            role="radiogroup"
            aria-label="Parse team events"
          >
            {EVENT_PARSE_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={settings.eventParseMode === option.value}
                className={`settings__choice${
                  settings.eventParseMode === option.value
                    ? ' settings__choice--active'
                    : ''
                }`}
                onClick={() =>
                  patch({ eventParseMode: option.value as EventParseMode })
                }
              >
                <span className="settings__choice-label">{option.label}</span>
                <span className="settings__choice-hint">
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          <p className="settings__heading settings__heading--spaced">
            Appearance
          </p>
          <div className="settings__theme" role="group" aria-label="Theme">
            <button
              type="button"
              className={`settings__option${theme === 'light' ? ' settings__option--active' : ''}`}
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Day
            </button>
            <button
              type="button"
              className={`settings__option${theme === 'dark' ? ' settings__option--active' : ''}`}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Night
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
