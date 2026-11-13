interface CompassMarkProps {
  size?: number
  className?: string
}

/** 로고 마크: 북쪽(하늘색)과 남쪽(흰색) 바늘 */
export function CompassMark({ size = 28, className }: CompassMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="15" fill="#256EF4" />
      <circle cx="16" cy="16" r="10.5" stroke="#FFFFFF" strokeOpacity="0.45" />
      <path d="M16 5.5 19 16l-3-1.5-3 1.5z" fill="#FFCC33" />
      <path d="M16 26.5 13 16l3 1.5 3-1.5z" fill="#FFFFFF" />
      <circle cx="16" cy="16" r="1.7" fill="#256EF4" stroke="#FFFFFF" strokeWidth="1.2" />
    </svg>
  )
}
