import { configureStore } from '@reduxjs/toolkit';

import lang from '@/locale/translation/en_us';

import rootReducer from './rootReducer';
import storePersist from './storePersist';

// localStorageHealthCheck();

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

const normalizeStoredAuth = (storedAuth) => {
  if (!storedAuth || typeof storedAuth !== 'object') {
    return AUTH_INITIAL_STATE;
  }

  const current = storedAuth.current || {};
  const normalizedCurrent = {
    ...current,
    _id: current._id || current.id || null,
    token: storedAuth.token || current.token || null,
  };

  if (!normalizedCurrent._id) {
    storePersist.remove('auth');
    return AUTH_INITIAL_STATE;
  }

  const normalizedAuth = {
    ...storedAuth,
    current: normalizedCurrent,
    token: normalizedCurrent.token,
    isLoggedIn: true,
    isLoading: false,
    isSuccess: true,
  };

  storePersist.set('auth', normalizedAuth);
  return normalizedAuth;
};

const auth_state = normalizeStoredAuth(storePersist.get('auth'));

const initialState = { auth: auth_state };

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false, // Enable Redux DevTools in development mode
});

console.log(
  '🚀 Welcome to Webaac Solutions Finance Management.'
);

export default store;

