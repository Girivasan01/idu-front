// Global notification instance for Ant Design v5
// This is set by the App component and used by request handlers

let notificationAPI = null;

export const setNotificationAPI = (api) => {
  notificationAPI = api;
};

export const getNotificationAPI = () => {
  return notificationAPI;
};

// Default notification methods that work without context (fallback)
const defaultNotification = {
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  open: () => {},
  config: () => {}, // Add config method to prevent errors
};

export const getNotification = () => {
  return notificationAPI || defaultNotification;
};

