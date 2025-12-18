import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Props {
  dmbOverviewActive: boolean
  onToggleDmbOverview: (active: boolean) => void
}

export const PremiumToggle: React.FC<Props> = ({
  dmbOverviewActive,
  onToggleDmbOverview,
}) => {
  const buttons = useMemo(
    () => [
      { label: 'Индикаторы', value: false },
      { label: 'Обзор ДМБ', value: true },
    ],
    []
  )

  return (
<div className="flex justify-center">
  <div className="relative inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 shadow-inner w-full max-w-sm">
    
    {/* Индикатор */}
    <motion.div
      className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-gray-700 shadow-md mx-1"
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        width: `calc(50% - 0.5rem)`,
        left: dmbOverviewActive ? '50%' : '0%',
      }}
    />

    {/* Кнопки */}
    {buttons.map((btn, _) => (
      <button
        key={btn.label}
        onClick={() => onToggleDmbOverview(btn.value)}
        className={`
          relative z-10 flex-1 text-sm font-medium rounded-lg transition-colors
          ${dmbOverviewActive === btn.value
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
        `}
        style={{ padding: '0.5rem 1rem' }}
      >
        {btn.label}
      </button>
    ))}
  </div>
</div>

  )
}
