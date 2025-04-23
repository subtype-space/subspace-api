const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const
type LogLevel = (typeof LOG_LEVELS)[number]

const CURRENT_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info' //default to info

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(CURRENT_LOG_LEVEL)
}

export const logger = {
  error: (...args: unknown[]) => shouldLog('error') && console.error('[ERROR]', ...args),
  warn: (...args: unknown[]) => shouldLog('warn') && console.warn('[WARN]', ...args),
  info: (...args: unknown[]) => shouldLog('info') && console.info('[INFO]', ...args),
  debug: (...args: unknown[]) => shouldLog('debug') && console.debug('[DEBUG]', ...args),
}
