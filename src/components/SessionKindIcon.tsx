interface Props {
  kind: 'practice' | 'meet' | 'event'
  className?: string
}

function sessionKindLabel(kind: Props['kind']): string {
  if (kind === 'meet') return 'Meet'
  if (kind === 'event') return 'Event'
  return 'Practice'
}

function sessionKindEmoji(kind: Props['kind']): string {
  if (kind === 'meet') return '🏅'
  if (kind === 'event') return '📅'
  return '🏊'
}

/** Compact kind mark: swimmer, medal, or calendar emoji. */
export function SessionKindIcon({ kind, className = '' }: Props) {
  const label = sessionKindLabel(kind)
  const classes = `session-kind${className ? ` ${className}` : ''} session-kind--${kind}`

  return (
    <span className={classes} title={label} aria-hidden>
      <span className="session-kind__emoji">{sessionKindEmoji(kind)}</span>
    </span>
  )
}
