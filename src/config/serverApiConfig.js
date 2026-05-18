/**
 * Backend URL
 * Reads from Netlify environment variable
 */
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_SERVER || 'https://mediumaquamarine-rook-503996.hostingersite.com';

/**
 * API URL
 */
export const API_BASE_URL =
  import.meta.env.MODE === 'production' ? `${BACKEND_URL}/api` : 'http://localhost:8888/api';

/**
 * Base URL
 */
export const BASE_URL =
  import.meta.env.MODE === 'production' ? BACKEND_URL : 'http://localhost:8888';

/**
 * Website URL
 */
export const WEBSITE_URL =
  import.meta.env.MODE === 'production' ? BACKEND_URL : 'http://localhost:3000';

/**
 * Download API
 */
export const DOWNLOAD_BASE_URL =
  import.meta.env.MODE === 'production'
    ? `${BACKEND_URL}/download`
    : 'http://localhost:8888/download';

/**
 * File API
 */
export const FILE_BASE_URL = BASE_URL;

/**
 * Token name
 */
export const ACCESS_TOKEN_NAME = 'x-auth-token';
