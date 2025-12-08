import React from 'react'
import { IndicatorsCard } from '../IndicatorsCard/IndicatorsCard'
import type { IndicatorItem, IndicatorsResponse } from '@/utils/forms'

interface IndicatorsBlockProps {
  indicators: IndicatorItem[]
  setIndicators: React.Dispatch<React.SetStateAction<IndicatorsResponse>>
}

const farms = ['Аршиновка', 'Наровчат', 'Сердобск']
const dmbOptionsMap: Record<string, number[]> = {
  'Аршиновка': [1, 2, 3],
  'Наровчат': [1, 2],
  'Сердобск': [1, 2],
}

export const IndicatorsBlock: React.FC<IndicatorsBlockProps> = ({ indicators, setIndicators }) => {
  return (
    <div className="space-y-10 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {farms.map(farm => (
          <div
            key={farm}
            className="
              w-full
              p-6
              bg-surface-light/40 dark:bg-surface-dark/40
              rounded-xl shadow-md
              flex flex-col
              transition-all duration-300
            "
          >
            <h2 className="
              text-2xl font-semibold tracking-wide
              text-gray-800 dark:text-gray-100
              mb-6
              text-center
            ">
              {farm}
            </h2>

            {/* Карточки DMB: группируем по 2 в ряд */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 justify-center">
              {dmbOptionsMap[farm].map(dmb => (
                <IndicatorsCard
                  key={`${farm}-${dmb}`}
                  farm={farm}
                  dmb={dmb}
                  indicators={indicators}
                  setIndicators={setIndicators}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
