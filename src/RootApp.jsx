import './style/app.css';

import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { App } from 'antd';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import { setNotificationAPI } from './request/notificationInstance';

const IdurarOs = lazy(() => import('./apps/IdurarOs'));

// This component is placed inside App provider and can use App.useApp()
function NotificationInitializer({ children }) {
  const { notification } = App.useApp();
  
  useEffect(() => {
    if (notification) {
      setNotificationAPI(notification);
    }
  }, [notification]);
  
  return children;
}

export default function RoutApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <NotificationInitializer>
            <IdurarOs />
          </NotificationInitializer>
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
