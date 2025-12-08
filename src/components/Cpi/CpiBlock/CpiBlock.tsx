import React, { useMemo, useState, useEffect } from 'react'
import type { IndicatorItem } from '@/utils/forms'
import { CpiTable } from '../CpiTable/CpiTable'
import { CpiCard } from '../CpiCard/CpiCard'
import { IndicatorGraphic } from '@/components/IndicatorGraphic/IndicatorGraphic'
import  EmptyState  from '@/components/EmptyState/EmptyState'

interface CpiBlockProps {
  indicators: IndicatorItem[]
  cpiData: Array<Record<string, any>>
  farm: string
  dmb: number
  shiftId?: number | null
}

export const CpiBlock: React.FC<CpiBlockProps> = ({ indicators, cpiData, farm, dmb, shiftId }) => {
  // выбираем релевантные индикаторы
  const filteredIndicators = useMemo(() => {
    return indicators.filter(i => i.active && i.farm === farm && Number(i.dmb) === Number(dmb))
  }, [indicators, farm, dmb])

  const [selectedIndicatorId, setSelectedIndicatorId] = useState('')

  useEffect(() => {
    if (!selectedIndicatorId && filteredIndicators.length > 0) {
      setSelectedIndicatorId(filteredIndicators[0].indicator)
    }
  }, [filteredIndicators])

  // дополнительные фильтры сделают компонент более устойчивым)
  const filteredData = useMemo(() => {
    return cpiData.filter(row => {
      if (!row) return false
      if (row.farm !== farm) return false
      if (Number(row.dmb) !== Number(dmb)) return false
      if (shiftId !== undefined && shiftId !== null) {
        if (Number(row.shift_id) !== Number(shiftId)) return false
      }
      return true
    })
  }, [cpiData, farm, dmb, shiftId])

return (
  <div className="space-y-4 mt-3">
    {filteredData.length > 0 && filteredIndicators.length > 0 && (
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div className="flex flex-col h-full">
    <CpiCard
      indicators={filteredIndicators}
      cpiData={filteredData}
      farm={farm}
      dmb={dmb}
      shiftId={shiftId}
      onSelectIndicator={setSelectedIndicatorId}
      selectedIndicatorId={selectedIndicatorId}
    />
  </div>

  <div className="flex flex-col h-full">
    <IndicatorGraphic
      indicators={filteredIndicators}
      cpiData={filteredData}
      farm={farm}
      dmb={dmb}
      id={selectedIndicatorId}
    />
  </div>

</div>
    )}

    {/* Таблица под ними */}
    {cpiData.length > 0 && filteredIndicators.length > 0 && (
    <CpiTable
      indicators={filteredIndicators}
      cpiData={filteredData}
      farm={farm}
      dmb={dmb}
    />
    )}

{cpiData.length === 0 && filteredIndicators.length > 0 && (
  <EmptyState icon="📭">Нет данных за выбранный период для этой смены</EmptyState>
)}

{cpiData.length > 0 && filteredIndicators.length === 0 && (
  <EmptyState icon="🎯">Введите критерии для ДМБ</EmptyState>
)}

{cpiData.length === 0 && filteredIndicators.length === 0 && (
  <EmptyState icon="⚠️">
    <div>Критерии для ДМБ отсутствуют</div>
    <div>Нет данных за выбранный период для этой смены</div>
  </EmptyState>
)}


  </div>
)

}

export default CpiBlock
