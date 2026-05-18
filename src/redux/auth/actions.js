import * as actionTypes from './types';
import * as authService from '@/auth';
import { request } from '@/request';
import { clearDashboardPinLock } from '@/utils/dashboardPin';

const normalizeAuthResult = (payload = {}) => {
  const current = payload.result || payload.current || {};
  const token = payload.token || current.token || null;

  return {
    ...current,
    _id: current._id || current.id || null,
    token,
  };
};

const persistAuthState = (payload = {}) => {
  const current = normalizeAuthResult(payload);
  const auth_state = {
    current,
    token: current.token || null,
    isLoggedIn: Boolean(current?._id),
    isLoading: false,
    isSuccess: Boolean(current?._id),
  };

  console.log('[auth] Persisting auth state', auth_state);
  window.localStorage.removeItem('auth');
  window.localStorage.removeItem('isLogout');
  window.localStorage.setItem('auth', JSON.stringify(auth_state));
  if (auth_state.token) {
    window.localStorage.setItem('token', auth_state.token);
  } else {
    window.localStorage.removeItem('token');
  }

  return auth_state;
};

export const login =
  ({ loginData }) =>
  async (dispatch) => {
    clearDashboardPinLock();
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.login({ loginData });
    console.log('[auth.login] API response', data);

    if (data.success === true) {
      const auth_state = persistAuthState(data);
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: auth_state.current,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const register =
  ({ registerData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.register({ registerData });

    if (data.success === true) {
      dispatch({
        type: actionTypes.REGISTER_SUCCESS,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const verify =
  ({ userId, emailToken }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.verify({ userId, emailToken });

    if (data.success === true) {
      const auth_state = persistAuthState(data);
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: auth_state.current,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const resetPassword =
  ({ resetPasswordData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.REQUEST_LOADING,
    });
    const data = await authService.resetPassword({ resetPasswordData });

    if (data.success === true) {
      const auth_state = persistAuthState(data);
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: auth_state.current,
      });
    } else {
      dispatch({
        type: actionTypes.REQUEST_FAILED,
      });
    }
  };

export const logout = () => async (dispatch) => {
  clearDashboardPinLock();
  dispatch({
    type: actionTypes.LOGOUT_SUCCESS,
  });
  const result = window.localStorage.getItem('auth');
  const tmpAuth = JSON.parse(result);
  const settings = window.localStorage.getItem('settings');
  const tmpSettings = JSON.parse(settings);
  window.localStorage.removeItem('auth');
  window.localStorage.removeItem('settings');
  window.localStorage.removeItem('token');
  window.localStorage.setItem('isLogout', JSON.stringify({ isLogout: true }));
  const data = await authService.logout();
  if (data.success === false) {
    const auth_state = {
      current: tmpAuth?.current || {},
      token: tmpAuth?.token || tmpAuth?.current?.token || null,
      isLoggedIn: Boolean(tmpAuth?.current?._id || tmpAuth?.current?.id),
      isLoading: false,
      isSuccess: Boolean(tmpAuth?.current?._id || tmpAuth?.current?.id),
    };
    window.localStorage.setItem('auth', JSON.stringify(auth_state));
    window.localStorage.setItem('settings', JSON.stringify(tmpSettings));
    if (auth_state.token) {
      window.localStorage.setItem('token', auth_state.token);
    }
    window.localStorage.removeItem('isLogout');
    dispatch({
      type: actionTypes.LOGOUT_FAILED,
      payload: auth_state.current,
    });
  } else {
    // on lgout success
  }
};

export const updateProfile =
  ({ entity, jsonData }) =>
  async (dispatch) => {
    let data = await request.updateAndUpload({ entity, id: '', jsonData });

    if (data.success === true) {
      const current = normalizeAuthResult({ result: data.result, token: data.result?.token });
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        payload: current,
      });
      const auth_state = {
        current,
        token: current.token || null,
        isLoggedIn: true,
        isLoading: false,
        isSuccess: true,
      };
      console.log('[auth] Updating profile auth state', auth_state);
      window.localStorage.setItem('auth', JSON.stringify(auth_state));
      if (auth_state.token) {
        window.localStorage.setItem('token', auth_state.token);
      }
    }
  };
