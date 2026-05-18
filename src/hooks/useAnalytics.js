/**
 * useAnalytics.js  —  Webaac Solutions Finance Management
 * Place:  src/hooks/useAnalytics.js
 *
 * Endpoints exactly as registered in appApi.js:
 *   /api/reports               → CollectionReports page
 *   /api/dashboard/admin       → Admin Dashboard
 *   /api/dashboard/staff       → Staff Dashboard
 *   /api/staff/performance     → Staff Performance View (admin)
 *   /api/dashboard/performance-summary  → My Performance Summary (staff)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api';
const REFRESH_MS   = 30_000;

function useAnalyticsEndpoint(endpoint, autoRefresh = true) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const timerRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth?.token || auth?.current?.token || localStorage.getItem('token');
      const { data: res } = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Idurar wraps all responses as { success: true, result: {...} }
      setData(res?.result ?? res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      timerRef.current = setInterval(() => fetchData(true), REFRESH_MS);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData, autoRefresh]);

  return { data, loading, error, refresh: () => fetchData() };
}

export const useReportsData        = () => useAnalyticsEndpoint('/reports');
export const useAdminDashboard     = () => useAnalyticsEndpoint('/dashboard/admin');
export const useStaffDashboard     = () => useAnalyticsEndpoint('/dashboard/staff');
export const usePerformanceData    = () => useAnalyticsEndpoint('/staff/performance');
export const usePerformanceSummary = () => useAnalyticsEndpoint('/dashboard/performance-summary');
