/**
 * Centralized configuration for environment-specific values.
 * All environment-dependent URLs/settings should be defined here.
 */

export const config = {
  // API base URL for REST endpoints
  apiBaseUrl: import.meta.env.PROD
    ? 'https://pomowave.onrender.com/api'
    : '/api',

  // Socket.io server URL for real-time updates
  socketUrl: import.meta.env.PROD
    ? 'https://pomowave.onrender.com'
    : 'http://localhost:3000',
} as const;
