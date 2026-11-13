export type ClassValue = string | number | false | null | undefined | ClassValue[]

/** 조건부 클래스 결합 (clsx 최소 구현) */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const v of inputs) {
    if (!v) continue
    if (Array.isArray(v)) {
      const inner = cn(...v)
      if (inner) out.push(inner)
    } else {
      out.push(String(v))
    }
  }
  return out.join(' ')
}
