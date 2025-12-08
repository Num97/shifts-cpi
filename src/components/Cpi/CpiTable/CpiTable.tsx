import React, { useMemo } from 'react'
import { labels } from '@/constants/labels'
import type { IndicatorItem } from '@/utils/forms'

interface CpiTableProps {
  indicators: IndicatorItem[]
  cpiData: Array<Record<string, any>>
  farm: string
  dmb: number
}

const fmt = (v: unknown) => {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') {
    return Number.isInteger(v) ? v.toString() : v.toFixed(2)
  }
  return String(v)
}

export const CpiTable: React.FC<CpiTableProps> = ({ indicators, cpiData }) => {
  // порядок колонок: Date, indicators..., Efficiency
  const indicatorKeys = useMemo(() => indicators.map(i => i.indicator), [indicators])

  // helper: count successes in a row
  const countRowSuccesses = (row: Record<string, any>) => {
    let success = 0
    for (const ind of indicators) {
      const key = ind.indicator
      const rowVal = row?.[key]
      if (rowVal === undefined || rowVal === null) continue

      const neededMore = (ind as any).more_than
      const threshold = Number((ind as any).value)

      const isSuccess = neededMore ? Number(rowVal) >= threshold : Number(rowVal) <= threshold
      if (isSuccess) success++
    }
    return success
  }

  const numIndicators = Math.max(1, indicatorKeys.length)

  return (
    <div className="overflow-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30">
    <div
      className="
        overflow-auto 
        rounded-2xl 
        border border-gray-300 dark:border-gray-700 
        shadow-sm 
        bg-white/70 dark:bg-gray-900/40 
        backdrop-blur-sm
      "
    >
      <table className="min-w-full border-collapse text-[13px] tracking-tight">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-700">
            <th className="sticky top-0 z-10 text-left px-5 py-3 font-semibold text-gray-700 dark:text-gray-200 backdrop-blur-sm text-center">
              Дата
            </th>

            {indicatorKeys.map(key => (
              <th
                key={key}
                className="sticky top-0 z-10 text-left px-5 py-3 font-semibold text-gray-700 dark:text-gray-200 backdrop-blur-sm text-center"
              >
                {labels[key] ?? key}
              </th>
            ))}

            <th className="sticky top-0 z-10 text-left px-5 py-3 font-semibold text-gray-700 dark:text-gray-200 backdrop-blur-sm text-center">
              Эффективность, %
            </th>
          </tr>
        </thead>

        <tbody>
          {cpiData.length === 0 && (
            <tr>
              <td
                colSpan={indicatorKeys.length + 2}
                className="px-5 py-10 text-center text-gray-500 dark:text-gray-400"
              >
                Нет данных
              </td>
            </tr>
          )}

          {cpiData.map((row, idx) => {
            const successes = countRowSuccesses(row)
            const efficiency = Number(((100 / numIndicators) * successes).toFixed(1))

            return (
              <tr
                key={row.date ? `${row.date}-${row.shift_id ?? idx}` : idx}
                className="
                  border-b border-gray-200/70 dark:border-gray-700/70
                  hover:bg-gray-200/60 dark:hover:bg-gray-800/40
                  transition-colors
                  bg-gray-100/80 dark:bg-gray-900/40
                "
              >
                {/* DATE */}
                <td className="px-5 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle text-center">
                  {row.date ?? '—'}
                </td>

                {/* INDICATORS */}
                {indicatorKeys.map(key => {
                  const raw = row[key]
                  const display = fmt(raw)

                  const indMeta = indicators.find(i => i.indicator === key)
                  const threshold = indMeta ? Number(indMeta.value) : undefined
                  const neededMore = indMeta ? indMeta.more_than : undefined

                  let isSuccess = false
                  if (threshold !== undefined && raw !== null && raw !== undefined) {
                    isSuccess = neededMore ? Number(raw) >= threshold : Number(raw) <= threshold
                  }

                  return (
                    <td
                      key={key}
                      className="
                        px-5 py-3 whitespace-nowrap align-middle text-gray-900 dark:text-gray-100
                        border-l border-gray-200/70 dark:border-gray-700/50
                        text-center
                      "
                    >
                    <div className="flex items-center gap-3 justify-center">
                      <div className="font-medium">{display}</div>

                      {threshold !== undefined && (
                        <>
                          {/* Δ процент отклонения */}
                          <span
                            className={`
                              text-[12px] font-medium italic px-1.5 py-0.5 rounded-md
                              ${
                                isSuccess
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-rose-700 dark:text-rose-300'
                              }
                            `}
                          >
                            {(() => {
                              const rawNum = Number(raw)
                              const deviation =
                                threshold === 0
                                  ? 0
                                  : ((rawNum - threshold) / threshold) * 100

                              return `${deviation >= 0 ? '+' : ''}${deviation.toFixed(1)}%`
                            })()}
                          </span>

                          {/* Threshold pill */}
                          <span
                            className={`
                              inline-flex items-center gap-1
                              text-[12px] px-2 py-0.5 rounded-md border
                              ${
                                isSuccess
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700'
                                  : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700'
                              }
                            `}
                          >
                            {neededMore ? (
                              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 11-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L9 13.586V3a1 1 0 112 0v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 17z" clipRule="evenodd" />
                              </svg>
                            )}
                            {fmt(threshold)}
                          </span>

                          {/* OK/X pill */}
                          <span
                            className={`
                              text-[11px] px-2 py-0.5 rounded-full font-medium
                              ${
                                isSuccess
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                              }
                            `}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {isSuccess ? (
                                <svg
                                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-rose-600 dark:text-rose-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </div>

                          </span>
                        </>
                      )}
                    </div>
                    </td>
                  )
                })}

                {/* EFFICIENCY */}
                <td className="px-5 py-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap align-middle border-l border-gray-200/70 dark:border-gray-700/50 text-center">
                  {efficiency}%
                  <div className="text-[12px] text-gray-500 dark:text-gray-400">
                    {successes}/{numIndicators}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    </div>
  )
}

export default CpiTable
