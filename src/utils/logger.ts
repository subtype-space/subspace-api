const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const
type LogLevel = (typeof LOG_LEVELS)[number]

const rawLogLevel = (process.env.LOG_LEVEL || 'info').toLowerCase()
const CURRENT_LOG_LEVEL: LogLevel = LOG_LEVELS.includes(rawLogLevel as LogLevel) ? (rawLogLevel as LogLevel) : 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(CURRENT_LOG_LEVEL)
}

function formatMessage(level: LogLevel, args: unknown[]): unknown[] {
  const date = new Date().toLocaleDateString('en-CA') // use ISO
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const colorCodes: Record<LogLevel, string> = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    info: '\x1b[36m', // Cyan
    debug: '\x1b[90m', // Gray
  }

  const resetCode = '\x1b[0m'
  
  return [`${colorCodes[level]}[${level.toUpperCase().padEnd(5)}]${resetCode} [${date} ${time}]`, ...args]
}

export const logger = Object.fromEntries(
  LOG_LEVELS.map((level) => [
    level,
    (...args: unknown[]) => {
      if (shouldLog(level)) {
        ;(console[level] as (...args: unknown[]) => void)(...formatMessage(level, args))
      }
    },
  ])
) as Record<LogLevel, (...args: unknown[]) => void>
