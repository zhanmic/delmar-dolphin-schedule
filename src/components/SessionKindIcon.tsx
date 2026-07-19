interface Props {
  kind: 'practice' | 'meet' | 'event'
  className?: string
}

function sessionKindLabel(kind: Props['kind']): string {
  if (kind === 'meet') return 'Meet'
  if (kind === 'event') return 'Event'
  return 'Practice'
}

/** Compact kind mark: swimmer, medal, or calendar. */
export function SessionKindIcon({ kind, className = '' }: Props) {
  const label = sessionKindLabel(kind)
  const classes = `session-kind${className ? ` ${className}` : ''} session-kind--${kind}`

  return (
    <span className={classes} title={label} aria-hidden>
      {kind === 'meet' ? (
        <MedalIcon />
      ) : kind === 'event' ? (
        <CalendarIcon />
      ) : (
        <SwimmerIcon />
      )}
    </span>
  )
}

function SwimmerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="session-kind__icon"
      aria-hidden
    >
      {/* Material Design Icons “swim” pictogram — reads clearly at ~12–16px */}
      <path d="M2 18c2.22-1 4.44-2 6.67-2 2.22 0 4.44 2 6.66 2 2.23 0 4.45-2 6.67-2v3c-2.22 0-4.44 2-6.67 2-2.22 0-4.44-2-6.66-2-2.23 0-4.45 1-6.67 2zm6.67-5c-.78 0-1.55.12-2.32.32l4.92-3.44-1.04-1.24c-.14-.17-.23-.4-.23-.64 0-.34.17-.65.44-.83l5.72-4 1.15 1.63-4.84 3.39 5.23 6.23c-.79.33-1.58.58-2.37.58-2.22 0-4.44-2-6.66-2M18 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4" />
    </svg>
  )
}

function MedalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="session-kind__icon"
    >
      <path d="M7.2 2.5h2.8l2 5.2-2.3 1.2L7.2 2.5Z" />
      <path d="M16.8 2.5h-2.8l-2 5.2 2.3 1.2 2.5-6.4Z" />
      <circle cx="12" cy="15.2" r="5.3" />
      <circle cx="12" cy="15.2" r="2" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="session-kind__icon"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3.5" />
      <path d="M16 3.5v3.5" />
      <path d="M3.5 10h17" />
    </svg>
  )
}
