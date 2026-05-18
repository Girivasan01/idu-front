import { lazy, useEffect } from 'react';

import {} from 'react-router-dom';
import {} from 'react-router-dom';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { useAppContext } from '@/context/appContext';

import routes from './routes';

export default function AppRouter() {
  let location = useLocation();
  const { state: stateApp, appContextAction } = useAppContext();
  const { app } = appContextAction;
  
  const currentAdmin = useSelector(selectCurrentAdmin);

  const routesList = [];

  Object.entries(routes).forEach(([key, value]) => {
    routesList.push(...value);
  });

  function getAppNameByPath(path) {
    for (let key in routes) {
      for (let i = 0; i < routes[key].length; i++) {
        if (routes[key][i].path === path) {
          return key;
        }
      }
    }
    // Return 'default' app  if the path is not found
    return 'default';
  }
  
  // Handle staff redirect on initial load
  // When staff tries to access root '/', redirect to /staff-dashboard
  useEffect(() => {
    if (currentAdmin && currentAdmin.role === 'staff' && location.pathname === '/') {
      // Staff will be handled by ProtectedRoute in routes
      // This is just to ensure smooth transition
    }
  }, [location, currentAdmin]);
  
  useEffect(() => {
    if (location.pathname === '/') {
      app.default();
    } else {
      const path = getAppNameByPath(location.pathname);
      app.open(path);
    }
  }, [location]);

  let element = useRoutes(routesList);

  return element;
}
