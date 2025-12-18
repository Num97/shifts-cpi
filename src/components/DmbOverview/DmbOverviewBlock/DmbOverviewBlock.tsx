import React, { useMemo } from "react"
import type { IndicatorsResponse, IndicatorItem, CpiResponse, ShiftPeriodRecommendation } from "@/utils/forms"
import CpiOverviewGraphic from "@/components/CpiOverview/CpiOverviewGraphic/CpiOverviewGraphic"
import { DmbOverviewMessage } from "@/components/DmbOverview/DmbOverviewMessage/DmbOverviewMessage"

interface Props {
  cpiDataWithoutShift: CpiResponse
  recommendationData: ShiftPeriodRecommendation
  indicators: IndicatorsResponse
  farm: string
  dmb: number
}

const DmbOverviewBlock: React.FC<Props> = ({
  cpiDataWithoutShift,
  recommendationData,
  indicators,
  farm,
  dmb
}) => {

    const filteredSortedIndicators: IndicatorItem[] = useMemo(() => {
      return indicators
        .filter(ind => ind.farm === farm && ind.dmb === dmb && ind.active)
        .sort((a, b) => a.indicator.localeCompare(b.indicator))
    }, [indicators, farm, dmb])

  return (
    <div className="w-full mx-auto p-2">
      <div
        className="
          grid grid-cols-1 
          sm:grid-cols-2 
          xl:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] 
          gap-6 
          items-start 
          justify-items-center
          w-full
        "
      >
        
        <div
          className="
            w-full
            rounded-2xl shadow-md 
            bg-gray-200/80 dark:bg-gray-800/60 
            border border-gray-200/60 dark:border-gray-700/50 
            p-4
          "
        >
          <CpiOverviewGraphic
            cpiData={cpiDataWithoutShift}
            farm={farm}
            dmb={dmb}
            aggregateByShifts={true}
            filteredSortedIndicators={filteredSortedIndicators}
          />
        </div>

        <div
          className="
            w-full
            h-full
            rounded-2xl shadow-md 
            bg-gray-200/80 dark:bg-gray-800/60 
            border border-gray-200/60 dark:border-gray-700/50 
            p-4
          "
        >
          <DmbOverviewMessage data={recommendationData} />
        </div>
      </div>
    </div>
  )
}

export default DmbOverviewBlock
