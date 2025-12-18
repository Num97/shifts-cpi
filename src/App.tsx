import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Header } from './components/Header/Header'
import { IndicatorsBlock } from './components/Indicators/IndicatorsBlock/IndicatorsBlock'
import { CpiBlock } from './components/Cpi/CpiBlock/CpiBlock'
import CpiOverviewBlock from './components/CpiOverview/CpiOverviewBlock/CpiOverviewBlock'

import { Loading } from './components/Conditions/Loading/Loading'
import { ErrorMessage } from './components/Conditions/Error/Error'
import EmptyState from './components/EmptyState/EmptyState'

import { getCpi, getIndicators } from '@/utils/api'
import type { CpiResponse, IndicatorsResponse, ShiftPeriodRecommendation } from '@/utils/forms'
import type { CpiParams } from '@/utils/apiTypes'

/* ---------- UI режимы ---------- */
type ViewMode = 'criteria' | 'shifts' | 'overview'

function App() {
  const [searchParams] = useSearchParams()

  /* ---------- UI state ---------- */
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [dmbOverviewActive, setDmbOverviewActive] = useState(true)

  /* ---------- Фильтры ---------- */
  const [farm, setFarm] = useState('')
  const [dmb, setDmb] = useState(0)
  const [shiftId, setShiftId] = useState(0)
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  /* ---------- Данные ---------- */
  const [indicators, setIndicators] = useState<IndicatorsResponse>([])
  const [cpiData, setCpiData] = useState<CpiResponse | null>(null)

  const [overviewData, setOverviewData] = useState<{
    cpi: CpiResponse | null
    recommendation: ShiftPeriodRecommendation | null
  }>({
    cpi: null,
    recommendation: null,
  })

  /* ---------- Loading / Error ---------- */
  const [loadingIndicators, setLoadingIndicators] = useState(false)
  const [errorIndicators, setErrorIndicators] = useState<string | null>(null)

  const [loadingCpi, setLoadingCpi] = useState(false)
  const [errorCpi, setErrorCpi] = useState<string | null>(null)

  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  /* ======================================================
     1️⃣ Загрузка индикаторов (один раз)
     ====================================================== */
  useEffect(() => {
    const loadIndicators = async () => {
      setLoadingIndicators(true)
      setErrorIndicators(null)
      try {
        const data = await getIndicators()
        setIndicators(data)
      } catch (e) {
        console.error(e)
        setErrorIndicators('Ошибка загрузки индикаторов')
      } finally {
        setLoadingIndicators(false)
      }
    }

    loadIndicators()
  }, [])

  /* ======================================================
     2️⃣ URL → фильтры
     ====================================================== */
  useEffect(() => {
    setFarm(searchParams.get('farm') || '')
    setDmb(Number(searchParams.get('dmb')) || 0)
    setShiftId(Number(searchParams.get('shift_id')) || 0)
    setDateStart(searchParams.get('date_start') || '')
    setDateEnd(searchParams.get('date_end') || '')
  }, [searchParams])

  /* ======================================================
     3️⃣ CPI по сменам (с shift_id)
     ====================================================== */
  useEffect(() => {
    if (!dateStart || !dateEnd || !farm) return

    const loadCpi = async () => {
      setLoadingCpi(true)
      setErrorCpi(null)

      const params: CpiParams = {
        date_start: dateStart,
        date_end: dateEnd,
        farm,
        dmb,
        shift_id: shiftId,
      }

      try {
        const data = await getCpi(params)
        setCpiData(data)
      } catch (e) {
        console.error(e)
        setErrorCpi('Ошибка загрузки данных по сменам')
      } finally {
        setLoadingCpi(false)
      }
    }

    loadCpi()
  }, [dateStart, dateEnd, farm, dmb, shiftId])

  /* ======================================================
     4️⃣ Обзор (без shift_id) + рекомендации
     ====================================================== */
  useEffect(() => {
    if (!dateStart || !dateEnd || !farm) return

    const query = new URLSearchParams({
      date_start: dateStart,
      date_end: dateEnd,
      farm,
      dmb: String(dmb),
    })

    const loadOverview = async () => {
      setOverviewLoading(true)
      setOverviewError(null)

      try {
        const [cpiRes, recRes] = await Promise.all([
          fetch(`/api/v1/shifts/cpi?${query}`),
          fetch(`/api/v1/shifts/cpi/recommendations?${query}`),
        ])

        if (!cpiRes.ok || !recRes.ok) {
          throw new Error('Ошибка загрузки обзора')
        }

        const [cpi, recommendation] = await Promise.all([
          cpiRes.json(),
          recRes.json(),
        ])

        setOverviewData({ cpi, recommendation })
      } catch (e) {
        console.error(e)
        setOverviewError('Ошибка загрузки общего обзора')
      } finally {
        setOverviewLoading(false)
      }
    }

    loadOverview()
  }, [dateStart, dateEnd, farm, dmb])

  /* ======================================================
     5️⃣ Вычисляемые флаги
     ====================================================== */
  const hasIndicatorsForFarmDmb = useMemo(
    () => indicators.some(i => i.farm === farm && i.dmb === dmb),
    [indicators, farm, dmb]
  )

  const isOverviewEmpty =
    !overviewData.cpi || overviewData.cpi.length === 0

  /* ======================================================
     RENDER
     ====================================================== */
  return (
    <div className="min-h-screen bg-gray-100/50 dark:bg-gray-900/90 p-2">
      <Header
        criteriaActive={viewMode === 'criteria'}
        overviewActive={viewMode === 'overview'}
        onToggleCriteria={() =>
          setViewMode(prev => (prev === 'criteria' ? 'overview' : 'criteria'))
        }
        onToggleOverview={() =>
          setViewMode(prev => (prev === 'overview' ? 'shifts' : 'overview'))
        }
      />

      {/* ---------- CRITERIA ---------- */}
      {viewMode === 'criteria' && (
        <>
          {loadingIndicators && <Loading text="Загружаем индикаторы..." />}
          {errorIndicators && <ErrorMessage text={errorIndicators} />}
          {!loadingIndicators && !errorIndicators && (
            <IndicatorsBlock
              indicators={indicators}
              setIndicators={setIndicators}
            />
          )}
        </>
      )}

      {/* ---------- SHIFTS ---------- */}
      {viewMode === 'shifts' && (
        <>
          {loadingCpi && <Loading text="Загружаем данные по сменам..." />}
          {errorCpi && <ErrorMessage text={errorCpi} />}
          {cpiData && !loadingCpi && !errorCpi && (
            <CpiBlock
              indicators={indicators}
              cpiData={cpiData}
              farm={farm}
              dmb={dmb}
              shiftId={shiftId}
            />
          )}
        </>
      )}

      {/* ---------- OVERVIEW ---------- */}
      {viewMode === 'overview' && (
        <>
          {overviewLoading && <Loading text="Загружаем общий обзор..." />}
          {overviewError && <ErrorMessage text={overviewError} />}

          {!overviewLoading &&
            !overviewError &&
            overviewData.cpi &&
            overviewData.recommendation &&
            hasIndicatorsForFarmDmb &&
            !isOverviewEmpty &&
            (
              <CpiOverviewBlock
                cpiDataWithoutShift={overviewData.cpi}
                indicators={indicators}
                recommendationData={overviewData.recommendation}
                farm={farm}
                dmb={dmb}
                dmbOverviewActive={dmbOverviewActive}
                onToggleDmbOverview={setDmbOverviewActive}
              />
            )}

          {!overviewLoading && (
            <>
              {!hasIndicatorsForFarmDmb && !isOverviewEmpty && (
                <EmptyState icon="⚠️">Нет критериев для ДМБ</EmptyState>
              )}
              {hasIndicatorsForFarmDmb && isOverviewEmpty && (
                <EmptyState icon="📭">Нет данных за выбранный период</EmptyState>
              )}
              {!hasIndicatorsForFarmDmb && isOverviewEmpty && (
                <EmptyState icon="⚠️">
                  <div>Критерии для ДМБ отсутствуют</div>
                  <div>Нет данных за выбранный период</div>
                </EmptyState>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
