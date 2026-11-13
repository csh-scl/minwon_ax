import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { AGENCY_TYPE_SHORT } from '@/services/recommendationService'
import type { AgencyType } from '@/types'

interface CompassDialProps {
  shares: Record<AgencyType, number>
  dominant: AgencyType
  size?: number
  className?: string
  /** 아직 고민을 입력하지 않았을 때: 바늘이 천천히 좌우로 흔들립니다 */
  idle?: boolean
  showPct?: boolean
}

const ANGLE: Record<AgencyType, number> = { central: 0, local: 120, education: 240 }
const COLOR: Record<AgencyType, string> = {
  central: 'var(--color-compass)',
  local: 'var(--color-mint)',
  education: 'var(--color-peach)',
}
const TINT: Record<AgencyType, string> = {
  central: 'var(--color-compass-tint)',
  local: 'var(--color-mint-tint)',
  education: 'var(--color-peach-tint)',
}

function polar(deg: number, r: number, c = 50) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) }
}

function arc(deg: number, span: number, r: number) {
  const a = polar(deg - span / 2, r)
  const b = polar(deg + span / 2, r)
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`
}

/**
 * 처리기관 방향 다이얼. 세 방향(중앙·지자체·교육청)이 각자의 색 띠를 가지고,
 * 바늘은 유사 민원이 가장 많이 몰린 쪽으로 돌아가 멈춥니다.
 */
export function CompassDial({ shares, dominant, size = 168, className, idle = false, showPct = true }: CompassDialProps) {
  const target = ANGLE[dominant]
  const [angle, setAngle] = useState(target - 40)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAngle(target))
    return () => cancelAnimationFrame(id)
  }, [target])

  const c = 50
  const pct = Math.round((shares[dominant] ?? 0) * 100)
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15)

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-label={idle ? '처리기관 방향 다이얼' : `${AGENCY_TYPE_SHORT[dominant]} 방향, 유사 민원의 ${pct}%`}
      >
        <circle cx={c} cy={c} r="49" fill="var(--color-surface)" />
        <circle cx={c} cy={c} r="49" fill="none" stroke="var(--color-line)" strokeWidth="0.8" />
        {(Object.keys(ANGLE) as AgencyType[]).map((k) => {
          const active = !idle && k === dominant
          return (
            <path
              key={k}
              d={arc(ANGLE[k], 78, 42)}
              fill="none"
              stroke={active ? COLOR[k] : TINT[k]}
              strokeWidth={active ? 6 : 5}
              strokeLinecap="round"
              style={{ transition: 'stroke 500ms' }}
            />
          )
        })}
        {ticks.map((t) => {
          const a = polar(t, 33)
          const b = polar(t, 35.5)
          return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-line-strong)" strokeWidth="0.8" strokeLinecap="round" />
        })}
        {(Object.keys(ANGLE) as AgencyType[]).map((k) => {
          const p = polar(ANGLE[k], 26)
          const active = !idle && k === dominant
          return (
            <text
              key={k}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fontWeight={active ? 800 : 600}
              fill={active ? COLOR[k] : 'var(--color-ink-faint)'}
              style={{ transition: 'fill 500ms' }}
            >
              {AGENCY_TYPE_SHORT[k]}
            </text>
          )
        })}
        <g
          className={cn(idle && 'animate-compass-idle')}
          style={{
            transform: idle ? undefined : `rotate(${angle}deg)`,
            transformOrigin: '50px 50px',
            transition: 'transform 1100ms cubic-bezier(0.2, 0.9, 0.25, 1)',
          }}
        >
          <path d="M50 20 L53.6 50 L50 47.8 L46.4 50 Z" fill={idle ? 'var(--color-ink-faint)' : COLOR[dominant]} style={{ transition: 'fill 500ms' }} />
          <path d="M50 80 L46.4 50 L50 52.2 L53.6 50 Z" fill="var(--color-line-strong)" />
        </g>
        <circle cx={c} cy={c} r="3.2" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.6" />
      </svg>
      {showPct && !idle && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[11%] text-center">
          <span className="tnum rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-muted shadow-card">{pct}%</span>
        </div>
      )}
    </div>
  )
}
