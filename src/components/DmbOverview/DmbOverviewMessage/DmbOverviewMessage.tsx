import React, { useMemo } from 'react'
import type { ShiftPeriodRecommendation } from '@/utils/forms'

interface Props {
  data: ShiftPeriodRecommendation
}

type MessageBlockProps = {
  title: string
  message?: string | null
  variant: 'success' | 'warning' | 'error'
}

const MessageBlock: React.FC<MessageBlockProps> = ({
  title,
  message,
  variant,
}) => {
  if (!message) return null

  const variants = {
    success:
      'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700/50',
    warning:
      'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/60 hover:bg-amber-200 dark:hover:bg-amber-700/50',
    error:
      'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700/50',
  }

  return (
    <div
      className={`rounded-md border p-3 text-sm ${variants[variant]}`}
    >
      <p className="font-medium mb-1">{title}</p>
      <p>{message}</p>
    </div>
  )
}

export const DmbOverviewMessage: React.FC<Props> = ({ data }) => {
  const sortedShifts = useMemo(
    () => [...data.shifts].sort((a, b) => a.shift_id - b.shift_id),
    [data.shifts]
  )

  return (
    <div className="space-y-4 rounded-2xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 p-4 h-full">
      
      {/* Заголовок */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          ДМБ {data.dmb} — {data.farm}
        </h3>

        {data.date_start && data.date_end && (
          <p className="text-sm text-muted-foreground">
            Период: {data.date_start} — {data.date_end}
          </p>
        )}
      </div>

      {/* Общая рекомендация по ДМБ */}
      <div className="space-y-2 rounded-md shadow-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
        <p className="font-medium text-center">
          Общая оценка по ДМБ
        </p>

        <MessageBlock
          title="Стабильная работа"
          message={data.message_success}
          variant="success"
        />

        <MessageBlock
          title="Зона внимания"
          message={data.message_problems}
          variant="warning"
        />

        <MessageBlock
          title="Требует корректировки"
          message={data.message_fail}
          variant="error"
        />

        <p className="pt-1 text-sm text-muted-foreground text-center">
          Общая эффективность:{' '}
          <b>{data.overall_efficiency.toFixed(0)}%</b>
        </p>
      </div>

      {/* Рекомендации по сменам */}
      <div className="space-y-3">
        <p className="font-medium text-center">Смены</p>

        {sortedShifts.map((shift) => (
          <div
            key={shift.shift_id}
            className="space-y-2 rounded-md shadow-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Смена {shift.shift_id}
              </p>
              <p className="pt-1 text-sm text-muted-foreground text-center">
                Эффективность:{' '}
                <b>{shift.overall_efficiency.toFixed(0)}%</b>
              </p>
            </div>

            <MessageBlock
              title="Стабильная работа"
              message={shift.message_success}
              variant="success"
            />

            <MessageBlock
              title="Зона внимания"
              message={shift.message_problems}
              variant="warning"
            />

            <MessageBlock
              title="Требует корректировки"
              message={shift.message_fail}
              variant="error"
            />

          </div>
        ))}
      </div>
    </div>
  )
}
