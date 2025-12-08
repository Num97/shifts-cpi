import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { labels } from '@/constants/labels'
import type { IndicatorItem } from '@/utils/forms'

interface CpiCardProps {
  indicators: IndicatorItem[] // уже отфильтрованные для farm/dmb (см. CpiBlock)
  cpiData: Array<Record<string, any>> // уже отфильтрованные по периоду/shift и т.д.
  farm: string
  dmb: number
  shiftId?: number | null
  onSelectIndicator: (id: string) => void
  selectedIndicatorId: string
}

export const CpiCard: React.FC<CpiCardProps> = ({ indicators, cpiData, farm, dmb, shiftId, onSelectIndicator, selectedIndicatorId }) => {
  const totalRows = cpiData.length

  // Для каждого индикатора считаем сколько успехов в периоде
  const perIndicatorStats = useMemo(() => {
  const stats = indicators.map(ind => {
    const key = ind.indicator
    const needMore = (ind as any).more_than
    let successCount = 0
    let sumValue = 0
    let valueCount = 0

    for (const row of cpiData) {
      const rowVal = row?.[key]
      if (rowVal === undefined || rowVal === null) continue

      const isSuccess = needMore
        ? Number(rowVal) >= Number(ind.value)
        : Number(rowVal) <= Number(ind.value)

      if (isSuccess) successCount++

      // суммируем для среднего
      sumValue += Number(rowVal)
      valueCount++
    }

    return {
      key,
      label: (labels as Record<string, string>)[key] ?? key,
      successCount,
      total: totalRows,
      percent: totalRows > 0 ? (successCount / totalRows) * 100 : 0,
      averageValue: valueCount > 0 ? sumValue / valueCount : null, // <- новое поле
    }
  })

  return stats
}, [indicators, cpiData, totalRows])

  // const perIndicatorStats = useMemo(() => {
  //   const stats = indicators.map(ind => {
  //     const key = ind.indicator
  //     const needMore = (ind as any).more_than
  //     let successCount = 0

  //     for (const row of cpiData) {
  //       const rowVal = row?.[key]
  //       if (rowVal === undefined || rowVal === null) continue

  //       const isSuccess = needMore
  //         ? Number(rowVal) >= Number(ind.value)
  //         : Number(rowVal) <= Number(ind.value)

  //       if (isSuccess) successCount++
  //     }

  //     return {
  //       key,
  //       label: (labels as Record<string, string>)[key] ?? key,
  //       successCount,
  //       total: totalRows,
  //       percent: totalRows > 0 ? (successCount / totalRows) * 100 : 0,
  //     }
  //   })

  //   return stats
  // }, [indicators, cpiData, totalRows])

  const overallSuccess = useMemo(() => {
  if (perIndicatorStats.length === 0) return { success: 0, total: 0 }

  const success = perIndicatorStats.reduce((sum, s) => sum + s.successCount, 0)
  const total = perIndicatorStats.reduce((sum, s) => sum + s.total, 0)

  return { success, total }
}, [perIndicatorStats])


  const overallPercent = useMemo(() => {
    if (perIndicatorStats.length === 0) return 0
    const totalPercent = perIndicatorStats.reduce((sum, s) => sum + s.percent, 0)
    return totalPercent / perIndicatorStats.length
  }, [perIndicatorStats])


  return (
  <Card className="h-full flex flex-col rounded-2xl shadow-md bg-gray-200/80 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">
            {farm}
          </div>
          <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            ДМБ {dmb}
          </div>
        </div>

        <div className="text-2xl font-semibold hidden sm:block">{shiftId !== undefined && shiftId !== null ? `Смена ${shiftId}` : ''}</div>

        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">Выходов за период</div>
          <div className="text-xl font-semibold">{totalRows}</div>
        </div>
      </CardTitle>
    </CardHeader>

    <CardContent className="flex-1 flex flex-col pt-2 flex-1">
      <div className="flex-1 grid grid-cols-1 gap-2">
        {perIndicatorStats.length === 0 ? (
          <div className="text-base text-muted-foreground">
            Нет индикаторов для отображения
          </div>
        ) : (
          perIndicatorStats.map(s => (
            <div
              key={s.key}
              onClick={() => onSelectIndicator(s.key)}
              className={`
                flex items-center justify-between gap-3 
                py-3 px-4 
                rounded-xl 
                bg-white/70 dark:bg-gray-900/40 
                backdrop-blur-sm
                border 
                transition-all cursor-pointer

                ${selectedIndicatorId === s.key 
                  ? "border-indigo-400 dark:border-indigo-500 shadow-md ring-4 ring-indigo-300/60 dark:ring-indigo-700/50" 
                  : "border-gray-200/50 dark:border-gray-700/60 ring-1 ring-inset ring-gray-200/40 dark:ring-gray-700/40"
                }

                hover:bg-white/90 dark:hover:bg-gray-900/60
              `}
            >
              <div className="min-w-0">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                  {s.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {s.successCount} из {s.total}
                </div>
              </div>

              <div className="flex items-center gap-3">
              {s.averageValue !== null && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Ср: <b>{s.averageValue.toFixed(1)}</b>
                </div>
              )}
                <div className="flex items-center gap-2">
                  <div
                    className={`text-lg font-semibold ${
                      s.percent >= 75
                        ? "text-emerald-600 dark:text-emerald-400"
                        : s.percent >= 50
                        ? "text-amber-700/90 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {Math.round(s.percent)}%
                  </div>

                  <Badge
                    className={`text-sm font-semibold px-2.5 py-1 rounded-lg
                      ${
                        s.percent >= 75
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-700/50"
                          : s.percent >= 50
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700/50"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700/50"
                      }
                    `}
                  >
                    {s.successCount}/{s.total}
                  </Badge>
                </div>

              </div>
            </div>
          ))
        )}
        {perIndicatorStats.length > 0 && (
          <div
            className="
              mt-5 pt-4 
              border-t border-gray-300/60 dark:border-gray-700/60 
              flex justify-between items-center
              bg-gradient-to-r from-gray-50/20 to-gray-100/10 
              dark:from-gray-800/20 dark:to-gray-900/10
              rounded-xl
              px-3 py-2
            "
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Общая эффективность
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`
                  text-xl font-semibold tracking-tight
                  ${
                    overallPercent < 50
                      ? "text-red-600 dark:text-red-400"
                      : overallPercent < 75
                      ? "text-amber-700/90 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                `}
              >
                {Math.round(overallPercent)}%
              </div>


              <Badge
                className={`
                  text-sm font-semibold px-3 py-1.5 rounded-lg
                  shadow-sm backdrop-blur
                  transition-all
                  border
                  ${
                    overallPercent < 50
                      ? "bg-red-100/70 text-red-800 border-red-300/70 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/60 hover:bg-red-200 dark:hover:bg-red-700/50"
                      : overallPercent < 75
                      ? "bg-amber-100/70 text-amber-800 border-amber-300/70 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/60 hover:bg-amber-200 dark:hover:bg-amber-700/50"
                      : "bg-emerald-100/70 text-emerald-800 border-emerald-300/70 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/60 hover:bg-emerald-200 dark:hover:bg-emerald-700/50"
                  }
                `}
              >
                {overallSuccess.success}/{overallSuccess.total}
              </Badge>

            </div>
          </div>
        )}

      </div>
    </CardContent>
  </Card>
  )
}

export default CpiCard
