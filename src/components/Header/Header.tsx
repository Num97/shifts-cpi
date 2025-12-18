import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from '@/components/ui'
import type { DateRange as DayPickerDateRange } from 'react-day-picker'
import  OverviewIcon  from '@/components/LiveIcons/OverviewIcon/OverviewIcon'
import  CriteriaIcon  from '@/components/LiveIcons/CriteriaIcon/CriteriaIcon'
import  SunIcon  from '@/components/LiveIcons/SunIcon/SunIcon'
import  MoonIcon  from '@/components/LiveIcons/MoonIcon/MoonIcon'

const farms = ['Аршиновка', 'Наровчат', 'Сердобск']

const dmbOptionsMap: Record<string, number[]> = {
  'Аршиновка': [1, 2, 3],
  'Наровчат': [1, 2],
  'Сердобск': [1, 2],
}

const shiftOptionsMap: Record<string, Record<number, number[]>> = {
  'Сердобск': {
    1: [1, 3, 5, 7],
    2: [2, 4, 6, 8],
  },
}

interface HeaderProps {
  criteriaActive: boolean
  onToggleCriteria: () => void
  onToggleOverview: () => void
  overviewActive: boolean
}

export const Header: React.FC<HeaderProps> = ({ criteriaActive, onToggleCriteria, onToggleOverview, overviewActive }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const today = new Date()

  const defFarm = searchParams.get('farm') || 'Наровчат'
  const defDmb = Number(searchParams.get('dmb')) || 1
  const defShift = Number(searchParams.get('shift_id')) || 1

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29); // чтобы включить сегодня + 29 дней назад

  const defDateStart = searchParams.get('date_start')
    ? new Date(searchParams.get('date_start')!)
    : thirtyDaysAgo;

  const defDateEnd = searchParams.get('date_end')
    ? new Date(searchParams.get('date_end')!)
    : today;

  const [dateRange, setDateRange] = useState<DayPickerDateRange>({
    from: defDateStart,
    to: defDateEnd,
  })
  const [farm, setFarm] = useState<string>(defFarm)
  const [dmb, setDmb] = useState<number>(defDmb)
  const [shift, setShift] = useState<number>(defShift)
  const [dmbOptions, setDmbOptions] = useState<number[]>(dmbOptionsMap[farm])
  const [shiftOptions, setShiftOptions] = useState<number[]>([1, 2, 3, 4])
  const [open, setOpen] = useState(false)

  // Theme
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  const [theme, setTheme] = useState<'light' | 'dark'>(getSystemTheme())

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setTheme(getSystemTheme())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Update search params
  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  useEffect(() => {
    const params = {
      date_start: dateRange.from ? formatDate(dateRange.from) : '',
      date_end: dateRange.to ? formatDate(dateRange.to) : '',
      farm,
      dmb: String(dmb),
      shift_id: String(shift),
    }
    setSearchParams(params)
  }, [dateRange, farm, dmb, shift, setSearchParams])

  // Update options
  useEffect(() => {
    const newDmbOptions = dmbOptionsMap[farm]
    setDmbOptions(newDmbOptions)
    if (!newDmbOptions.includes(dmb)) setDmb(newDmbOptions[0])
  }, [farm])

  useEffect(() => {
    let newShiftOptions: number[] = []

    if (farm === 'Сердобск' && shiftOptionsMap[farm]?.[dmb]) {
      newShiftOptions = shiftOptionsMap[farm][dmb]
    } else {
      newShiftOptions = [1, 2, 3, 4]
    }

    setShiftOptions(newShiftOptions)

    // если текущий shift нет в новых опциях — ставим первую доступную
    if (!newShiftOptions.includes(shift)) {
      setShift(newShiftOptions[0])
    }
  }, [farm, dmb])

  const goHub = () => window.location.assign('/hub');

  const selectTriggerClasses =
    'h-10 px-3 flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors max-w-[160px] w-full truncate'
  const selectItemClasses =
    'cursor-pointer px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white truncate'

  // Icons
  const CalendarIcon = (
    <svg className="w-4 h-4 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
    </svg>
  )

  const FarmIcon = (
    <svg className="w-4 h-4 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 12l9-9 9 9v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" strokeWidth="2" />
    </svg>
  )

  const DmbIcon = (
    <svg className="w-4 h-4 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
    </svg>
  )

  const ShiftIcon = (
    <svg className="w-4 h-4 text-gray-400 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )

  const formatHuman = (d: Date) =>
    d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).replace('.', '')

  return (
    <>
{/* Бургер для мобильных */}
<div className="flex sm:hidden p-4">
  <button
    onClick={() => setOpen(!open)}
    className="relative w-10 h-10 flex flex-col justify-center items-center group"
  >
    {/* Полоски */}
    <span
      className={`block absolute h-1 w-6 bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300 ease-in-out
        ${open ? 'rotate-45 top-5' : 'top-3'}`}
    />
    <span
      className={`block absolute h-1 w-6 bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300 ease-in-out
        ${open ? 'opacity-0' : 'top-5'}`}
    />
    <span
      className={`block absolute h-1 w-6 bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300 ease-in-out
        ${open ? '-rotate-45 top-5' : 'top-7'}`}
    />
  </button>
</div>


    <div className={`flex-col md:flex-row items-center gap-4 p-4 bg-surface-light dark:bg-surface-dark shadow-soft rounded-xl
        ${open ? 'flex' : 'hidden'} sm:flex`}>
      <Button
        onClick={goHub}
        className="h-10 px-4 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
      >
        Главная
      </Button>

      {/* Calendar */}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-10 px-3 flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors max-w-[210px] w-full truncate">
            {CalendarIcon}
            <span className="truncate text-center">
              {dateRange.from && dateRange.to
                ? dateRange.from.getTime() === dateRange.to.getTime()
                  ? formatHuman(dateRange.from)
                  : `${formatHuman(dateRange.from)} — ${formatHuman(dateRange.to)}`
                : 'Выбрать'}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto max-w-[266px] p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              if (!range || !range.from) return
              if (!range.to) setDateRange({ from: range.from, to: range.from })
              else setDateRange(range)
            }}
          />

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {/* Текущий месяц */}
            <Button
              size="sm"
              onClick={() => {
                const start = new Date(today.getFullYear(), today.getMonth(), 1)
                const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                setDateRange({ from: start, to: end })
              }}
            >
              Текущий месяц
            </Button>

            {/* Прошлый месяц */}
            <Button
              size="sm"
              onClick={() => {
                const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                const end = new Date(today.getFullYear(), today.getMonth(), 0)
                setDateRange({ from: start, to: end })
              }}
            >
              Прошлый месяц
            </Button>

            {/* Неделя */}
            <Button
              size="sm"
              onClick={() => {
                const weekAgo = new Date()
                weekAgo.setDate(today.getDate() - 7)
                setDateRange({ from: weekAgo, to: today })
              }}
            >
              Неделя
            </Button>
          </div>
        </PopoverContent>

      </Popover>

      {/* Farm */}
      {/* <Select value={farm} onValueChange={setFarm}> */}
      <Select
        value={farm}
        onValueChange={(v) => {
          setFarm(v);
          if (criteriaActive) {
            onToggleCriteria();
          }
        }}
      >
        <SelectTrigger className={selectTriggerClasses}>
          {FarmIcon}
          <span className="truncate">{farm}</span>
        </SelectTrigger>
        <SelectContent className="bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          {farms.map((f) => (
            <SelectItem key={f} value={f} className={selectItemClasses}>{f}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* DMB */}
      <Select value={String(dmb)} onValueChange={(v) => {setDmb(Number(v));
        if (criteriaActive) {
            onToggleCriteria();
          }
      }}>
        <SelectTrigger className={selectTriggerClasses}>
          {DmbIcon}
          <span className="truncate">ДМБ: {dmb}</span>
        </SelectTrigger>
        <SelectContent className="bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          {dmbOptions.map((d) => (
            <SelectItem key={d} value={String(d)} className={selectItemClasses}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Shift */}
      {/* <Select value={String(shift)} onValueChange={(v) => setShift(Number(v))}> */}
      <Select
        value={String(shift)}
        onValueChange={(v) => {
          setShift(Number(v));
          if (overviewActive) {
            onToggleOverview();
          } else if (criteriaActive) {
            onToggleCriteria();
          }
        }}
       >
        <SelectTrigger className={selectTriggerClasses}>
          {ShiftIcon}
          <span className="truncate">Смена: {shift}</span>
        </SelectTrigger>
        <SelectContent className="bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          {shiftOptions.map((s) => (
            <SelectItem key={s} value={String(s)} className={selectItemClasses}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

            {/* Кнопка "Обзор" */}
      <Button
        onClick={onToggleOverview}
        className={`${selectTriggerClasses} ${overviewActive ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}`}
      >
        <OverviewIcon active={overviewActive} />
        <span className="truncate">{overviewActive ? 'Детали' : 'Обзор'}</span>
      </Button>


            {/* Кнопка "Критерии" */}
      <Button
        onClick={onToggleCriteria}
        className={`${selectTriggerClasses} ${criteriaActive ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : ''}`}
      >
        <CriteriaIcon />
        <span className="truncate">Критерии</span>
      </Button>

      {/* Theme toggle */}
      <Button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={selectTriggerClasses}
      >
        {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        <span className="truncate">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
      </Button>
    </div>
    </>
  )
}
