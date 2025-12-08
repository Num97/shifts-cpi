// src/utils/api.ts

import type { CpiParams } from './apiTypes';
import type { CpiResponse, IndicatorsResponse, IndicatorItem } from './forms';

// ---------------------
// Универсальный GET
// ---------------------
async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ---------------------
// Универсальный запрос
// ---------------------
async function apiRequest<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// =================================================
/*                SHIFTS — Indicators              */
// =================================================

const INDICATORS_URL = '/api/v1/shifts/indicators';

// GET /indicators
export function getIndicators() {
  return apiGet<IndicatorsResponse>(INDICATORS_URL);
}

export const fetchIndicators = getIndicators;

// POST /indicators — add
export function saveIndicator(
  data: Partial<IndicatorItem> & { value: number }
) {
  return apiRequest<{ id: number }>(`${INDICATORS_URL}/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT /indicators/:id — update
export function updateIndicator(
  id: number,
  data: Partial<IndicatorItem> & { value: number }
) {
  return apiRequest(`${INDICATORS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE /indicators/:id — soft delete
export function deleteIndicator(id: number) {
  return apiRequest(`${INDICATORS_URL}/${id}`, {
    method: 'DELETE',
  });
}

// =================================================
/*                     SHIFTS — CPI                */
// =================================================

// GET /cpi?date_start&date_end&farm&dmb&shift_id?
export function getCpi(params: CpiParams) {
  const query = new URLSearchParams({
    date_start: params.date_start,
    date_end: params.date_end,
    farm: params.farm,
    dmb: String(params.dmb),
  });

  // shift_id — теперь необязательный
  if (params.shift_id !== undefined && params.shift_id !== null) {
    query.set('shift_id', String(params.shift_id));
  }

  return apiGet<CpiResponse>(`/api/v1/shifts/cpi?${query.toString()}`);
}
