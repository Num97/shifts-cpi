import React, { useMemo } from "react"
import type { IndicatorsResponse, IndicatorItem, CpiResponse } from "@/utils/forms"
import CpiOverviewGraphic from "../CpiOverviewGraphic/CpiOverviewGraphic"

interface Props {
  cpiDataWithoutShift: CpiResponse
  indicators: IndicatorsResponse
  farm: string
  dmb: number
}

const CpiOverviewBlock: React.FC<Props> = ({
  cpiDataWithoutShift,
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
    <div className="w-full mx-auto p-4">
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
    </div>
  )
}

export default CpiOverviewBlock
