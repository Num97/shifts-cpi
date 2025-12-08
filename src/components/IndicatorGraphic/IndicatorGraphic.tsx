import React, { useMemo } from 'react'
import Chart from 'react-apexcharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { IndicatorItem } from '@/utils/forms'
import { labels } from '@/constants/labels'

interface IndicatorGraphicProps {
  indicators: IndicatorItem[]
  cpiData: Array<Record<string, any>>
  farm: string
  dmb: number
  id: string
}

export const IndicatorGraphic: React.FC<IndicatorGraphicProps> = ({
  indicators,
  cpiData,
  farm,
  dmb,
  id,
}) => {
  const indicator = indicators.find(ind => ind.indicator === id)
  if (!indicator) return null

  const threshold = Number(indicator.value)
  const moreThan = indicator.more_than ?? true

  const data = useMemo(
    () =>
      cpiData
        .map(row => ({
          date: row.date,
          value: row[id] ?? null,
        }))
        .filter(d => d.value !== null),
    [cpiData, id]
  )

  if (data.length === 0)
    return <div className="text-center py-10 text-muted-foreground">Нет данных</div>

  const values = data.map(d => Number(d.value))
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  // 10% padding сверху и снизу
    let min = Math.min(minValue, threshold)
    let max = Math.max(maxValue, threshold)

    // padding 10%
    const paddingFactor = 0.1
    const range = max - min
    min = Math.max(min - range * paddingFactor, 0)
    max = max + range * paddingFactor

  min = Math.max(min, 0)

  // offset порога в процентах для градиента
  const thresholdOffset =
    (1 - (threshold - min) / (max - min)) * 100

  const series = [
    {
      name: labels[indicator.indicator] || indicator.indicator,
      data: data.map(d => Number(d.value.toFixed(2))),
    },
  ]

  const isAlwaysAbove = minValue >= threshold
  const isAlwaysBelow = maxValue <= threshold
  const transitionSize = 10 // ширина переходной зоны в %

  const startColor = moreThan ? '#10b981' : '#ef4444'
  const endColor   = moreThan ? '#ef4444' : '#10b981'

  // ограничиваем чтобы не вылетало за 0..100
  const before = Math.max(thresholdOffset - transitionSize, 0)
  const after  = Math.min(thresholdOffset + transitionSize, 100)

    let colorStops

    if (isAlwaysAbove) {
      // всё выше порога → только один цвет
      colorStops = [
        {
          offset: 0,
          color: moreThan ? '#10b981' : '#ef4444',
          opacity: 1,
        },
        {
          offset: 100,
          color: moreThan ? '#10b981' : '#ef4444',
          opacity: 1,
        },
      ]
    } else if (isAlwaysBelow) {
      // всё ниже порога → только другой цвет
      colorStops = [
        {
          offset: 0,
          color: moreThan ? '#ef4444' : '#10b981',
          opacity: 1,
        },
        {
          offset: 100,
          color: moreThan ? '#ef4444' : '#10b981',
          opacity: 1,
        },
      ]
    } else {
        colorStops = [
      {
        offset: 0,
        color: startColor,
        opacity: 0.8,
      },
      {
        offset: before,
        color: startColor,
        opacity: 1,
      },
      {
        offset: thresholdOffset,
        color: endColor,
        opacity: 1,
      },
      {
        offset: after,
        color: endColor,
        opacity: 0.9,
      },
      {
        offset: 100,
        color: endColor,
        opacity: 0.8,
      },
    ]
      }

      const gradient = {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.7,
        colorStops,
      }

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: 'indicator-chart',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        dynamicAnimation: { enabled: true, speed: 800 },
        animateGradually: { enabled: true, delay: 50 },
      },
      background: 'transparent',
    },
    fill: {
      type: 'gradient',
      gradient,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#0ea5e9'],
    },
    markers: {
    size: 5,
    discrete: data.map(d => {
        const value = Number(d.value)
        const isAbove = value >= Number(indicator.value)
        let color = '#0ea5e9'

        if (moreThan) {
        color = isAbove ? '#10b981' : '#ef4444'
        } else {
        color = isAbove ? '#ef4444' : '#10b981'
        }

        return {
        seriesIndex: 0,
        dataPointIndex: data.indexOf(d),
        fillColor: color,
        strokeColor: color,
        size: 5,
        }
    }),
    hover: { size: 7 },
    },
    xaxis: {
      categories: data.map(d => d.date),
      labels: {
        rotate: -45,
        style: { fontSize: '12px', colors: Array(data.length).fill('#6b7280') },
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      min,
      max,
      labels: {
        formatter: val => val.toFixed(1),
        style: { fontSize: '12px', colors: ['#6b7280'] },
      },
    },
    tooltip: {
      theme: 'dark',
      x: { show: true },
      y: { formatter: val => `${val}` },
    },
    grid: {
      borderColor: "#aaaaaa",
      strokeDashArray: 4,
    },
    annotations: {
      yaxis: [
        {
          y: threshold,
          borderColor: '#f59e0b',
          borderWidth: 2,
          strokeDashArray: 4,
          label: {
            text: `${threshold}`,
            style: { color: '#f59e0b', background: 'transparent' },
          },
        },
      ],
    },
  }

  return (
    <Card className="h-full flex flex-col rounded-2xl shadow-md bg-gray-100 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <div className="text-gray-500 dark:text-gray-400 font-semibold">{farm}</div>
          <div className='text-gray-900 dark:text-gray-100 font-semibold'>{labels[indicator.indicator] || indicator.indicator}</div>
          <div className="text-gray-500 dark:text-gray-400 font-semibold">ДМБ {dmb}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-2">
        <div className="w-full min-h-80 h-full">
          <Chart options={options} series={series} type="line" height="100%" />
        </div>
      </CardContent>
    </Card>
  )
}

export default IndicatorGraphic
