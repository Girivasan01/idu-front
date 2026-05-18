export const DASHBOARD_PIN_KEY = 'dashboard_unlocked';
export const DEFAULT_DASHBOARD_PIN = '1234';

export const clearDashboardPinLock = () => {
  window.sessionStorage.removeItem(DASHBOARD_PIN_KEY);
};
