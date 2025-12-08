import './App.css'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { getCpi, getIndicators } from '@/utils/api'
import { IndicatorsBlock } from './components/Indicators/IndicatorsBlock/IndicatorsBlock'
import type { CpiResponse, IndicatorsResponse } from '@/utils/forms'
import type { CpiParams } from '@/utils/apiTypes'
import { CpiBlock } from './components/Cpi/CpiBlock/CpiBlock'
import CpiOverviewBlock from './components/CpiOverview/CpiOverviewBlock/CpiOverviewBlock'
import { Loading } from './components/Conditions/Loading/Loading'
import { ErrorMessage } from './components/Conditions/Error/Error'
import EmptyState from './components/EmptyState/EmptyState'


function App() {
  const [searchParams] = useSearchParams()
  const [criteriaActive, setCriteriaActive] = useState(false)
  const [overviewActive, setOverviewActive] = useState(true)

  // 🔹 состояние фильтров
  const [farm, setFarm] = useState<string>('')
  const [dmb, setDmb] = useState<number>(0)
  const [shiftId, setShiftId] = useState<number>(0)
  const [dateStart, setDateStart] = useState<string>('')
  const [dateEnd, setDateEnd] = useState<string>('')

  // 🔹 данные из API
  const [indicators, setIndicators] = useState<IndicatorsResponse>([])
  const [cpiData, setCpiData] = useState<CpiResponse | null>(null)

  // 🔹 состояния загрузки и ошибок
  const [loadingIndicators, setLoadingIndicators] = useState(false)
  const [errorIndicators, setErrorIndicators] = useState<string | null>(null)

  const [loadingCpi, setLoadingCpi] = useState(false)
  const [errorCpi, setErrorCpi] = useState<string | null>(null)

  // 🔹 данные без shift_id
  const [cpiDataWithoutShift, setCpiDataWithoutShift] = useState<CpiResponse | null>(null);

  // 🔹 состояние загрузки/ошибок без shift_id
  const [loadingCpiNoShift, setLoadingCpiNoShift] = useState(false);
  const [errorCpiNoShift, setErrorCpiNoShift] = useState<string | null>(null);


  // 1️⃣ Загружаем indicators только при старте приложения
  useEffect(() => {
    const loadIndicators = async () => {
      setLoadingIndicators(true)
      setErrorIndicators(null)
      try {
        const data: IndicatorsResponse = await getIndicators()
        setIndicators(data)
      } catch (err) {
        console.error(err)
        setErrorIndicators('Ошибка загрузки индикаторов')
      } finally {
        setLoadingIndicators(false)
      }
    }

    loadIndicators()
  }, [])

  // Следим за criteriaActive
    useEffect(() => {
      if (criteriaActive && overviewActive) {
        setOverviewActive(false);
      }
    }, [criteriaActive]);

    // Следим за overviewActive
    useEffect(() => {
      if (overviewActive && criteriaActive) {
        setCriteriaActive(false);
      }
    }, [overviewActive]);

  // 2️⃣ Когда меняются параметры URL → обновляем state фильтров
  useEffect(() => {
    setFarm(searchParams.get('farm') || '')
    setDmb(Number(searchParams.get('dmb')) || 0)
    setShiftId(Number(searchParams.get('shift_id')) || 0)
    setDateStart(searchParams.get('date_start') || '')
    setDateEnd(searchParams.get('date_end') || '')
  }, [searchParams])

  // 3️⃣ Загружаем CPI данные при изменении фильтров
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
        const data: CpiResponse = await getCpi(params)
        setCpiData(data)
      } catch (err) {
        console.error(err)
        setErrorCpi('Ошибка загрузки данных по сменам')
      } finally {
        setLoadingCpi(false)
      }
    }

    loadCpi()
  }, [dateStart, dateEnd, farm, dmb, shiftId])

useEffect(() => {
  if (!dateStart || !dateEnd || !farm) return;

  const loadCpiNoShift = async () => {
    setLoadingCpiNoShift(true);
    setErrorCpiNoShift(null);

    const params: CpiParams = {
      date_start: dateStart,
      date_end: dateEnd,
      farm,
      dmb,
    };

    try {
      const query = new URLSearchParams({
        date_start: params.date_start,
        date_end: params.date_end,
        farm: params.farm,
        dmb: String(params.dmb),
      });

      const res = await fetch(`/api/v1/shifts/cpi?${query.toString()}`);
      if (!res.ok) throw new Error('Ошибка запроса CPI без shift_id');

      const data: CpiResponse = await res.json();
      setCpiDataWithoutShift(data);

    } catch (err) {
      console.error(err);
      setErrorCpiNoShift('Ошибка загрузки CPI без shift_id');
    } finally {
      setLoadingCpiNoShift(false);
    }
  };

  loadCpiNoShift();
}, [dateStart, dateEnd, farm, dmb]);  // shiftId тут нет

const hasDataForFarmDmb = indicators.some(
  (item) => item.farm === farm && item.dmb === dmb
);

const isCpiDataEmpty = !cpiDataWithoutShift || cpiDataWithoutShift.length === 0;

return (
  <div className="min-h-screen bg-gray-100/50 dark:bg-gray-900/90 p-2">
    <Header
      criteriaActive={criteriaActive}
      onToggleCriteria={() => setCriteriaActive(prev => !prev)}
      onToggleOverview={() => setOverviewActive(prev => !prev)}
      overviewActive={overviewActive}
    />

    {/* ---------- INDICATORS ---------- */}
    {loadingIndicators && <Loading text="Загружаем индикаторы..." />}

    {errorIndicators && (
      <ErrorMessage text={errorIndicators} />
    )}

    {!loadingIndicators && !errorIndicators && indicators && criteriaActive && (
      <IndicatorsBlock 
        indicators={indicators}
        setIndicators={setIndicators}
      />
    )}


    {/* ---------- СМЕНЫ (с shift_id) ---------- */}
    {!criteriaActive && !overviewActive && (
      <>
        {loadingCpi && <Loading text="Загружаем данные по сменам..." />}

        {errorCpi && (
          <ErrorMessage text={errorCpi} />
        )}

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


    {/* ---------- ОБЗОР (без shift_id) ---------- */}
    {overviewActive && (!cpiDataWithoutShift || cpiDataWithoutShift.length > 0) && indicators.length > 0 && (
      <>
        {loadingCpiNoShift && <Loading text="Загружаем общий обзор..." />}

        {errorCpiNoShift && (
          <ErrorMessage text={errorCpiNoShift} />
        )}

        {!loadingCpiNoShift && !errorCpiNoShift && cpiDataWithoutShift && (
          <CpiOverviewBlock
            cpiDataWithoutShift={cpiDataWithoutShift}
            indicators={indicators}
            farm={farm}
            dmb={dmb}
          />
        )}
      </>
    )}

    {overviewActive && !hasDataForFarmDmb && !isCpiDataEmpty && (
      <EmptyState icon="⚠️">Нет критериев для ДМБ</EmptyState>
    )}
    {overviewActive && isCpiDataEmpty && hasDataForFarmDmb && (
      <EmptyState icon="📭">Нет данных за выбранный период</EmptyState>
    )}
    {overviewActive && isCpiDataEmpty && !hasDataForFarmDmb && (
      <EmptyState icon="⚠️">
        <div>Критерии для ДМБ отсутствуют</div>
        <div>Нет данных за выбранный период</div>
      </EmptyState>
    )}

  </div>
)
}

export default App
