import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { IndicatorItem } from '@/utils/forms'
import { labels } from '@/constants/labels'
import { saveIndicator, deleteIndicator } from '@/utils/api'
import { Trash2, Pencil } from "lucide-react";


interface IndicatorsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farm: string
  dmb: number
  indicators: IndicatorItem[] // все индикаторы из API (фильтруем внутри)
  onSave?: (payload: Partial<IndicatorItem> & { value: number }) => void
  onDelete?: (id: number) => void
  setIndicators: React.Dispatch<React.SetStateAction<IndicatorItem[]>>
}

type FormState = {
  id?: number
  indicatorKey: string
  more_than: boolean
  active: boolean
  value: string
}

export const IndicatorsModal: React.FC<IndicatorsModalProps> = ({
  open,
  onOpenChange,
  farm,
  dmb,
  indicators,
  onSave,
  onDelete,
  setIndicators,
}) => {
  const [editing, setEditing] = useState<FormState | null>(null)
  const [form, setForm] = useState<FormState>({
    indicatorKey: '',
    more_than: true,
    active: true,
    value: '',
  })

const updateIndicators = (updater: (prev: IndicatorItem[]) => IndicatorItem[]) => {
  setIndicators(prev => {
    const next = updater(prev)

    const filtered = next.filter(i => i)

    const sorted = filtered.sort((a, b) => a.indicator.localeCompare(b.indicator))

    return sorted
  })
}

  // existing for this farm+dmb
  const existing = useMemo(
    () => indicators.filter((it) => it.farm === farm && it.dmb === dmb),
    [indicators, farm, dmb]
  )

  // build select options from labels, exclude date,farm,dmb and keys already present
  const reservedKeys = useMemo(() => new Set(['date', 'farm', 'dmb']), [])
  const existingKeys = useMemo(() => new Set(existing.map((e) => e.indicator)), [existing])

  const availableOptions = useMemo(() => {
    return Object.keys(labels)
      .filter((k) => !reservedKeys.has(k) && !existingKeys.has(k))
      .map((k) => ({ key: k, label: labels[k] }))
  }, [labels, reservedKeys, existingKeys])

  useEffect(() => {
    // reset form when modal opens/closes (but if editing, keep editing state)
    if (!open) {
      setForm({
        indicatorKey: '',
        more_than: true,
        active: true,
        value: '',
      })
      setEditing(null)
    }
  }, [open])

  const startEdit = (item: IndicatorItem) => {
    setEditing({
      id: item.id,
      indicatorKey: item.indicator,
      more_than: item.more_than,
      active: item.active,
      value: String((item as any).value ?? ''), // value may not exist in indicator item shape; keep flexible
    })
    setForm({
      id: item.id,
      indicatorKey: item.indicator,
      more_than: item.more_than,
      active: item.active,
      value: String((item as any).value ?? ''),
    })
  }

  const clearForm = () => {
    setForm({
      indicatorKey: '',
      more_than: true,
      active: true,
      value: '',
    })
    setEditing(null)
  }

const handleDelete = async (item: IndicatorItem) => {
  try {
    if (!item.id) return
    await deleteIndicator(item.id)  // вызываем DELETE

    // обновляем локальный массив indicators через setIndicators
    updateIndicators(prev => prev.filter(i => i.id !== item.id))

    if (onDelete) onDelete(item.id) // обновляем родителя, если нужно
  } catch (err) {
    console.error('Ошибка при удалении индикатора', err)
  }
}

const handleSubmit = async () => {
  if (!form.indicatorKey) {
    alert('Выберите индикатор')
    return
  }

  // Проверяем value
  if (!form.value || isNaN(Number(form.value))) {
    alert('Введите корректное числовое значение')
    return
  }

  // Формируем payload
  const payload: Partial<IndicatorItem> & { value: number } = {
    farm,
    dmb,
    indicator: form.indicatorKey,
    more_than: form.more_than,
    active: form.active,
    value: Number(form.value),
    ...(form.id ? { id: form.id } : {}), // добавляем id только если редактируем
  }

  try {
    const result = await saveIndicator(payload) // POST / add or update

    // обновляем локальный массив indicators через setIndicators
    updateIndicators(prev => {
    const newItem: IndicatorItem = {
        id: result.id,
        farm: farm,
        dmb: dmb,
        indicator: form.indicatorKey,
        more_than: form.more_than,
        active: form.active,
        value: Number(form.value),
    }

    if (!prev) return [newItem]

    const exists = prev.find(i => i.id === result.id)
    if (exists) {
        return prev.map(i => i.id === result.id ? newItem : i)
    } else {
        return [...prev, newItem]
    }
    })

    if (onSave) onSave({ ...payload, id: result.id }) // передаем обновленные данные родителю
    clearForm()
    // onOpenChange(false)
  } catch (err) {
    console.error('Ошибка при сохранении индикатора', err)
  }
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl mx-auto">{farm} ДМБ {dmb}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left: existing items */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Существующие критерии</h3>
            {existing.length === 0 ? (
              <p className="text-base text-gray-500">Критерии не заданы</p>
            ) : (
              <ul className="space-y-2">
                {existing.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex flex-col">
                      <span className="text-lg font-medium">{ labels[it.indicator] ?? it.indicator }</span>
                      <span className='text-base text-gray-500 dark:text-gray-300'>{it.more_than ? 'Больше' : 'Меньше'} {it.value}</span>
                      <span className="text-base text-gray-500 dark:text-gray-300">
                        {it.active ? 'Активно' : 'Неактивно'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit icon */}
                      <button
                        type="button"
                        onClick={() => startEdit(it)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Редактировать"
                      >
                        <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-200 hover:text-gray-400 dark:hover:text-gray-400 transition" />
                      </button>

                      {/* Delete icon */}
                      <button
                        type="button"
                        onClick={() => handleDelete(it)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Удалить"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700 transition" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: form add/edit */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">{editing ? 'Редактирование' : 'Добавить критерий'}</h3>

            {/* Indicator select */}
            <div>
                <label className="block text-base mb-1 text-gray-600 dark:text-gray-300">Показатель</label>

                {editing ? (
                    // режим редактирования — просто отображаем label
                    <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
                    {labels[editing.indicatorKey] ?? editing.indicatorKey}
                    </div>
                ) : (
                    // режим добавления — обычный Select
                    <Select
                    value={form.indicatorKey}
                    onValueChange={(val) =>
                        setForm((s) => ({ ...s, indicatorKey: val }))
                    }
                    >
                    <SelectTrigger className="w-full text-base">
                        <SelectValue placeholder="Выберите показатель" />
                    </SelectTrigger>

                    <SelectContent>
                        {availableOptions.length === 0 ? (
                        <SelectItem value="Нет доступных показателей" className="text-base text-gray-500">
                            Нет доступных показателей
                        </SelectItem>
                        ) : (
                        availableOptions.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key}>
                            {opt.label}
                            </SelectItem>
                        ))
                        )}
                    </SelectContent>
                    </Select>
                )}
            </div>

            {/* More than toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-base mb-1 text-gray-600 dark:text-gray-300">Условие</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md ${form.more_than ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                    onClick={() => setForm((s) => ({ ...s, more_than: true }))}
                  >
                    {'Больше'}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md ${!form.more_than ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                    onClick={() => setForm((s) => ({ ...s, more_than: false }))}
                  >
                    {'Меньше'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-base mb-1 text-gray-600 dark:text-gray-300">Активен</label>
                <Switch  className="w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-700 data-[state=checked]:bg-indigo-600 transition-colors dark:data-[state=checked]:bg-indigo-300"
                    checked={form.active} onCheckedChange={(v) => setForm((s) => ({ ...s, active: !!v }))} />
              </div>
            </div>

            {/* Value input */}
            <div>
              <label className="block text-base mb-1 text-gray-600 dark:text-gray-300">Значение (число)</label>
              <Input
                value={form.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, value: e.target.value }))}
                placeholder="Например 10.5"
                type="number"
                className="text-base placeholder:text-base" 
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
                <Button
                variant="outline"
                onClick={clearForm}
                className="border-gray-400 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors px-3 py-1 rounded-md"
                >
                Очистить
                </Button>

                <Button
                onClick={handleSubmit}
                className="bg-indigo-500 text-white hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors px-3 py-1 rounded-md"
                >
                {editing ? 'Сохранить' : 'Добавить'}
                </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <div className="flex justify-end gap-2 w-full">
            <Button
                className="border-gray-400 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors px-3 py-1 rounded-md" 
                variant="outline" onClick={() => onOpenChange(false)}>Закрыть
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
