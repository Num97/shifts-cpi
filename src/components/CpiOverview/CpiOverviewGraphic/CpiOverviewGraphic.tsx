// src/components/CpiOverviewGraphic/CpiOverviewGraphic.tsx
import React, { useMemo} from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, Badge, Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import type { IndicatorItem, CpiItem } from "@/utils/forms";
import { labels } from "@/constants/labels";
import {  AnimatePresence, motion } from "framer-motion";

interface Props {
  indicator: IndicatorItem;
  cpiData: CpiItem[];
  farm: string;
  dmb: number;
}

interface ShiftStats {
  shift: number;
  total: number;
  success: number;
  percent: number;
  averageValue: number;
}

const getBarColor = (percent: number) => {
  if (percent < 50) return "#dc2626";      // красный
  if (percent < 75) return "#ff7d13";      // желтый
  return "#16a34a";                        // зеленый
};

const formatPercent = (p: number) => `${Math.round(p)}%`;

const CpiOverviewGraphic: React.FC<Props> = ({ indicator, cpiData, farm, dmb }) => {
  // считаем статистику по сменам: total, success, percent
const stats: ShiftStats[] = useMemo(() => {
  const shifts = Array.from(new Set(cpiData.map((r) => r.shift_id))).sort((a, b) => a - b);
  return shifts.map((shiftId) => {
    const shiftRows = cpiData.filter((r) => r.shift_id === shiftId);

    let successCount = 0;
    let sumValues = 0;

    for (const row of shiftRows) {
      const key = indicator.indicator as keyof CpiItem;
      const value = Number(row[key]);
      sumValues += value;

      const target = indicator.value;
      const isSuccess = indicator.more_than ? value >= target : value <= target;
      if (isSuccess) successCount++;
    }

    const total = shiftRows.length;
    const percent = total > 0 ? (successCount / total) * 100 : 0;
    const averageValue = total > 0 ? sumValues / total : 0;

    return { shift: shiftId, total, success: successCount, percent, averageValue};
  });
}, [cpiData, indicator]);

const getValueColor = (value: number, indicator: IndicatorItem) => {
  const target = indicator.value;
  const moreThan = indicator.more_than;
  if (moreThan) return value >= target ? 'emerald-700 dark:emerald-300' : 'rose-700 dark:rose-300';
  return value <= target ? 'emerald-700 dark:emerald-300' : 'rose-700 dark:rose-300';
};

  // подготовка данных для графика
  const categories = stats.map((s) => `Смена ${s.shift}`);
  const colors = stats.map((s) =>
    s.percent === 0 ? "#d1d5db" : getBarColor(s.percent) // gray-300
  );

  const visualSeriesData = stats.map((s) => {
  const percent = Number(s.percent.toFixed(2));
    return percent > 5 ? percent : 5; // минимум 5% высоты
  });

const realSeriesData = stats.map((s) => Number(s.percent.toFixed(2)));

const series = [
  {
    name: labels[indicator.indicator] || indicator.indicator,
    data: visualSeriesData,
  }
];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: {
        enabled: true,
        dynamicAnimation: { enabled: true, speed: 800 },
        animateGradually: { enabled: true, delay: 50 },
      },
      dropShadow: {
        enabled: true,
        top: 6,
        left: 0,
        blur: 10,
        opacity: 0.12,
      },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "90%",
        borderRadius: 8,
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["#ffffff"] },
    xaxis: {
      categories,
      labels: {
        rotate: -30,
        offsetY: 3,
        style: {
          fontSize: "13px",
          fontWeight: 500,
          colors: "#6b7280",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      max: 100,
      min: 0,
      labels: {
        formatter: (val) => (typeof val === "number" ? val.toFixed(1) : String(val)),
        style: {
          fontSize: "13px",
          fontWeight: 500,
          colors: "#6b7280",
        },
      },
    },
    tooltip: {
      theme: "dark",
      shared: false,
      intersect: true,
      x: { show: true },
      y: {
        formatter: (val, opts) => {
          const index = opts.dataPointIndex;
          const real = realSeriesData[index];
          return `${Math.round(real)}%`; // честный тултип
        }
      },
      marker: { show: true },
    },
    colors,
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.95,
        opacityTo: 0.95,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: "#aaaaaa",
      strokeDashArray: 3,
      padding: { left: 10, right: 10 },
    },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 640,
        options: {
          plotOptions: { bar: { columnWidth: "60%" } },
          xaxis: { labels: { rotate: -15 } },
        },
      },
    ],
  };

  return (
    <Card className="rounded-2xl shadow-sm bg-gradient-to-b from-white/40 to-white/10 dark:from-black/20 dark:to-black/10 border border-transparent">
      <CardContent className="p-4">
        {/* Верхняя строка с краткой информацией */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{farm}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {labels[indicator.indicator] || indicator.indicator}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">ДМБ {dmb}</div>
        </div>

        {/* Сам график */}
        <div className="w-full h-[260px]">
          <Chart options={options} series={series} type="bar" height="100%" />
        </div>

{/* Нижняя статистика по сменам — premium badges */}
<div className="mt-4">
<div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400 px-1">

      
    <div className="flex items-center gap-2">
      <span
        className='
          inline-flex items-center gap-1
          text-[12px] px-2 py-0.5 rounded-md border
          bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-700
        '
      > Цель:
        {indicator.more_than ? (
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 11-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L9 13.586V3a1 1 0 112 0v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 17z" clipRule="evenodd" />
          </svg>
        )}
        {indicator.value}
      </span>
    </div>

  <div className="hidden sm:flex gap-3 items-center">
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-green-500 block" />
      <span className="text-xs text-gray-500">≥ 75%</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-amber-500 block" />
      <span className="text-xs text-gray-500">50–74%</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-red-500 block" />
      <span className="text-xs text-gray-500">&lt; 50%</span>
    </div>
  </div>
</div>

  {/* Карточки синхронизированы с шириной графика */}
{/* PREMIUM KPI DOCK */}
<div className="relative mt-4 select-none">

  <motion.div
  className="grid grid-cols-1 sm:grid-cols-1 gap-3"
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.12 } },
  }}
>
  <AnimatePresence>
    {stats.map((s) => {
      const shiftKey = `${farm}-${indicator.indicator}-shift-${s.shift}`;
      const averageColorClass = getValueColor(s.averageValue, indicator).includes("emerald")
        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/60 hover:bg-emerald-200 dark:hover:bg-emerald-700/50"
        : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/60 hover:bg-red-200 dark:hover:bg-red-700/50";


      return (
        <motion.div
          key={shiftKey}
          className="shrink-0 min-w-[150px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          layout
        >
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer p-4 rounded-2xl bg-gray-200/80 dark:bg-gray-700/40 
                              border border-gray-200/40 dark:border-gray-500/40 shadow backdrop-blur-md 
                              hover:shadow-lg transition">
                {/* Верхний ряд: название смены и процент */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Смена {s.shift}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: getBarColor(s.percent) }}>
                    {formatPercent(s.percent)}
                  </div>
                </div>

                {/* Бейджи */}
                <div className="flex flex-wrap justify-center gap-2">
                  {/* Выходы */}
                  <Badge className="text-xs px-2.5 py-1 rounded-lg font-semibold
                                    bg-gray-100 text-gray-700 border border-gray-300
                                    dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-500/40
                                    hover:bg-gray-200 dark:hover:bg-gray-700/50">
                    Выходы: {s.total}
                  </Badge>

                  {/* Успех */}
                  <Badge
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border
                      ${
                        Number(s.percent.toFixed(0) || 0) < 50
                          ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/60 hover:bg-red-200 dark:hover:bg-red-700/50"
                          : Number(s.percent.toFixed(0) || 0) < 75
                          ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/60 hover:bg-amber-200 dark:hover:bg-amber-700/50"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/60 hover:bg-emerald-200 dark:hover:bg-emerald-700/50"
                      }
                    `}
                  >
                    Успех: {s.success}
                  </Badge>

                  {/* Среднее значение */}
                  <Badge
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${averageColorClass}`}
                  >
                    Ср.: {s.averageValue.toFixed(1)}
                  </Badge>
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-4 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200/40 dark:border-gray-800/40">
              <div className="text-sm font-medium mb-2">Подробности смены {s.shift}</div>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div>• Выходов: <b>{s.total}</b></div>
                <div>• Успешных: <b>{s.success}</b></div>
                <div>• Результативность: <b>{formatPercent(s.percent)}</b></div>
                <div>• Среднее: <b>{s.averageValue.toFixed(1)}</b></div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      );
    })}
  </AnimatePresence>
</motion.div>

</div>

</div>

      </CardContent>
    </Card>
  );
};

export default CpiOverviewGraphic;
