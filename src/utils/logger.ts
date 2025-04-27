const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const
type LogLevel = (typeof LOG_LEVELS)[number]

const rawLogLevel = (process.env.LOG_LEVEL || 'info').toLowerCase()
const CURRENT_LOG_LEVEL: LogLevel = LOG_LEVELS.includes(rawLogLevel as LogLevel) ? (rawLogLevel as LogLevel) : 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(CURRENT_LOG_LEVEL)
}

export const logger = {
  error: (...args: unknown[]) => shouldLog('error') && console.error('[ERROR]', ...args),
  warn: (...args: unknown[]) => shouldLog('warn') && console.warn('[WARN]', ...args),
  info: (...args: unknown[]) => shouldLog('info') && console.info('[INFO]', ...args),
  debug: (...args: unknown[]) => shouldLog('debug') && console.debug('[DEBUG]', ...args),
}
