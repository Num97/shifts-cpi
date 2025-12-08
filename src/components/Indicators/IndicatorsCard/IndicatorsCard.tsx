import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from '@/components/ui'
import type { IndicatorItem } from '@/utils/forms'
import { IndicatorsModal } from '../IndicatorsModal/IndicatorsModal'
import type { IndicatorsResponse } from '@/utils/forms'
import { labels } from '@/constants/labels'

interface IndicatorsCardProps {
  farm: string
  dmb: number
  indicators: IndicatorItem[]
  onSave?: (payload: any) => void
  onDelete?: (id: number) => void
  setIndicators: React.Dispatch<React.SetStateAction<IndicatorsResponse>>
}

export const IndicatorsCard: React.FC<IndicatorsCardProps> = ({
  farm,
  dmb,
  indicators,
  onSave,
  onDelete,
  setIndicators,
}) => {
  const [open, setOpen] = React.useState(false)

  // отфильтрованные индикаторы для карточки
  const filtered = indicators.filter(
    item => item.farm === farm && item.dmb === dmb && item.active
  )

  // Форматирование значения: если число — обрезаем/делаем фикс. Иначе — как есть.
  const formatValue = (v: unknown) => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'number') {
      // убрать лишнюю дробную часть, но оставить до 2 знаков
      return Number.isInteger(v) ? v.toString() : v.toFixed(2)
    }
    return String(v)
  }

  // Возвращает текст для сравнения (больше/меньше) и понятную иконку
  const getComparison = (more_than?: boolean | null) => {
    if (more_than === null || more_than === undefined) {
      return { text: '—', Icon: null, colorClass: 'text-gray-400' }
    }
    if (more_than === true) {
      const Icon = () => (
        <svg className="w-4 h-4 inline-block -mt-[2px]" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 12l5-7 5 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
      return { text: 'больше', Icon, colorClass: 'text-emerald-600 dark:text-emerald-400' }
    } else {
      const Icon = () => (
        <svg className="w-4 h-4 inline-block -mt-[2px]" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 8l5 7 5-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
      return { text: 'меньше', Icon, colorClass: 'text-rose-600 dark:text-rose-400' }
    }
  }

  // Маленькая карточка-строка индикатора
  const IndicatorRow: React.FC<{ item: IndicatorItem }> = ({ item }) => {
    const key = item.indicator ?? 'unknown';
    const label = labels[key] ?? key;
    const value = formatValue(item.value);

    const { text, Icon, colorClass } = getComparison((item as any).more_than);

    return (
          <li
            key={item.id}
            className="
              flex flex-col items-center gap-1
              py-1 px-3 
              rounded-lg
              bg-gray-100 dark:bg-gray-900/80
              border border-gray-100 dark:border-gray-700
              shadow
              hover:bg-gray-100 dark:hover:bg-gray-900/50
              transition
              text-center
            "
          >
            <div className="text-base text-gray-700 dark:text-gray-300">{label}</div>

            <div className="flex items-center gap-2 mt-1">
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{value}</div>
              {text !== '—' && (
                <Badge
                  className={`
                    inline-flex items-center gap-1 
                    px-2 py-0.5 
                    rounded-full 
                    text-[0.80rem] font-medium 
                    ${colorClass}
                    bg-opacity-15 dark:bg-opacity-20
                    border border-gray-100 dark:border-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-700/60
                  `}
                >
                  {Icon && <Icon />}
                  <span className="capitalize">{text}</span>
                </Badge>
              )}
            </div>
          </li>
    );
  };


  // Иконка редактирования (стилизованная, нейтральная)
  const EditIcon = (
    <svg
      className="w-4 h-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M12 20h9" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <>
  <Card
    className="
      w-full min-h-[240px] mx-auto
      rounded-2xl
      bg-gradient-to-br from-white to-slate-100 dark:from-gray-900/70 dark:to-black/50
      shadow-xl shadow-gray-300/20 dark:shadow-black/50
      hover:shadow-2xl
      transition-all duration-300
      ring-1 ring-transparent hover:ring-gray-300/40 dark:hover:ring-gray-600/50
      backdrop-blur-sm
    "
  >
    <CardHeader className="px-5 pt-5">
      <CardTitle className="text-center font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100">
        {`ДМБ ${dmb}`}
      </CardTitle>
    </CardHeader>

    <CardContent className="px-4 pt-2 pb-3">
      {filtered.length > 0 ? (
        <ul className="space-y-1">
          {filtered.map(item => (
            <IndicatorRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="py-10">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            Критерии не заданы
          </p>
        </div>
      )}
    </CardContent>

    <CardFooter className="flex justify-center px-4 pb-4 pt-3">
      <Button
        size="sm"
        variant="ghost"
        className="
          flex items-center gap-2
          rounded-xl px-4 py-2
          bg-amber-200/60 dark:bg-amber-500/20
          backdrop-blur-sm
          border border-gray-200 dark:border-gray-700
          shadow-sm hover:shadow-md
          text-sm font-semibold
          text-gray-800 dark:text-gray-100
          hover:ring-1 hover:ring-gray-300/50 dark:hover:ring-gray-600/40
          transition-all duration-300
        "
        onClick={() => setOpen(true)}
      >
        {EditIcon} Редактировать
      </Button>
    </CardFooter>
  </Card>

  <IndicatorsModal
    open={open}
    onOpenChange={setOpen}
    farm={farm}
    dmb={dmb}
    indicators={indicators}
    onSave={onSave}
    onDelete={onDelete}
    setIndicators={setIndicators}
  />
</>
  )
}
