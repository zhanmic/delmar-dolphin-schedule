import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

interface Props {
  text: string
  className?: string
}

/** Horizontally scrolls overflowing meet/event titles so the full name can be read. */
export function ScrollableName({ text, className = '' }: Props) {
  const outerRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    function measure() {
      if (!outer || !inner) return
      const next = Math.max(0, Math.ceil(inner.scrollWidth - outer.clientWidth))
      setDistance(next)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)

    let cancelled = false
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure()
      })
    }

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [text])

  const classes = [
    'scroll-name',
    distance > 0 ? 'is-overflow' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const durationSec =
    distance > 0 ? Math.max(4, Math.min(12, distance / 28)) : 0

  return (
    <span
      ref={outerRef}
      className={classes}
      title={text}
      style={
        distance > 0
          ? ({
              '--scroll-distance': `${distance}px`,
              '--scroll-duration': `${durationSec}s`,
            } as CSSProperties)
          : undefined
      }
    >
      <span ref={innerRef} className="scroll-name__text">
        {text}
      </span>
    </span>
  )
}
