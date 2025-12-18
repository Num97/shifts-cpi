import React, { useMemo } from "react"
import type {
  IndicatorsResponse,
  IndicatorItem,
  CpiResponse,
  ShiftPeriodRecommendation
} from "@/utils/forms"

import CpiOverviewGraphic from "../CpiOverviewGraphic/CpiOverviewGraphic"
import DmbOverviewBlock from "@/components/DmbOverview/DmbOverviewBlock/DmbOverviewBlock"
import { PremiumToggle } from "@/components/CpiOverview/PremiumToggle/PremiumToggle"

interface Props {
  cpiDataWithoutShift: CpiResponse
  indicators: IndicatorsResponse
  recommendationData: ShiftPeriodRecommendation
  farm: string
  dmb: number
  dmbOverviewActive: boolean
  onToggleDmbOverview: (v: boolean) => void
}

const CpiOverviewBlock: React.FC<Props> = ({
  cpiDataWithoutShift,
  indicators,
  recommendationData,
  farm,
  dmb,
  dmbOverviewActive,
  onToggleDmbOverview
}) => {
  const filteredSortedIndicators: IndicatorItem[] = useMemo(() => {
    return indicators
      .filter(ind => ind.farm === farm && ind.dmb === dmb && ind.active)
      .sort((a, b) => a.indicator.localeCompare(b.indicator))
  }, [indicators, farm, dmb])

  return (
    <div className="w-full mx-auto p-4 space-y-6">
      <PremiumToggle
        dmbOverviewActive={dmbOverviewActive}
        onToggleDmbOverview={onToggleDmbOverview}
      />

      {/* ===== Контент ===== */}
      {dmbOverviewActive ? (
        <DmbOverviewBlock
          cpiDataWithoutShift={cpiDataWithoutShift}
          recommendationData={recommendationData}
          indicators={indicators}
          farm={farm}
          dmb={dmb}
        />
      ) : (
        <div
          className="
            grid grid-cols-1 
            sm:grid-cols-2 
            xl:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] 
            gap-6 
            place-items-center
            w-full
          "
        >
          {filteredSortedIndicators.map(ind => (
            <div
              key={ind.id}
              className="
                w-full
                max-w-[650px]
                rounded-2xl shadow-md 
                bg-gray-200/80 dark:bg-gray-800/60 
                border border-gray-200/60 dark:border-gray-700/50 
                p-4
              "
            >
              <CpiOverviewGraphic
                indicator={ind}
                cpiData={cpiDataWithoutShift}
                farm={farm}
                dmb={dmb}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CpiOverviewBlock
