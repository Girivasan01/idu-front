import { useEffect, useState } from 'react';
import Dashboard from '@/pages/Dashboard';
import PinLock from '@/components/PinLock';
import { DASHBOARD_PIN_KEY } from '@/utils/dashboardPin';

export default function DashboardProtected() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isUnlocked = window.sessionStorage.getItem(DASHBOARD_PIN_KEY) === 'true';
    setUnlocked(isUnlocked);
    setReady(true);
  }, []);

  if (!ready || !unlocked) {
    return <PinLock onSuccess={() => setUnlocked(true)} />;
  }

  return <Dashboard />;
}
