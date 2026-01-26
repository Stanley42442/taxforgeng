// Configurable logging utility - only logs in development
const isDev = import.meta.env.DEV;

type LogArgs = unknown[];

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
  info: (...args: LogArgs) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: LogArgs) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: LogArgs) => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;
