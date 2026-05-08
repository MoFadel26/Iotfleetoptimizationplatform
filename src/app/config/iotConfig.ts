// DEVICE_URL is read from VITE_IOT_DEVICE_URL at build time. The default
// matches the existing Vite proxy fallback so nothing breaks if the env var
// is unset locally.
const DEFAULT_DEVICE_URL = 'http://172.20.10.6';
const ENV_DEVICE_URL = (import.meta.env.VITE_IOT_DEVICE_URL as string | undefined) ?? '';

export const IOT_CONFIG = {
  // ─── TOGGLE THIS to switch between mock and real device ───
  USE_MOCK: false,

  // Real device URL (override via VITE_IOT_DEVICE_URL in .env)
  DEVICE_URL: ENV_DEVICE_URL || DEFAULT_DEVICE_URL,

  // How often to poll in milliseconds
  POLL_INTERVAL: 4000,

  // How many failures before marking device as offline
  FAILURE_THRESHOLD: 3,
} as const;
