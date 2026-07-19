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
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="session-kind__icon"
    >
      <circle cx="16.5" cy="5.5" r="2" />
      <path d="M4 12.5h5.5l2.8-2.2 3.2 2.2H21" />
      <path d="m10.2 12.5 1.6 3.4 3.4-.8" />
      <path d="M3 18.5c1.6-1.1 3.1-1.1 4.7 0s3.1 1.1 4.7 0 3.1-1.1 4.7 0 3.1 1.1 4.7 0" />
      <path d="M3 21.2c1.6-1.1 3.1-1.1 4.7 0s3.1 1.1 4.7 0 3.1-1.1 4.7 0 3.1 1.1 4.7 0" />
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
