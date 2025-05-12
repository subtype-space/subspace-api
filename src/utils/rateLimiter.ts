import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import { Request } from 'express-jwt' // this ideally should come after the custom auth middleware
import { logger } from './logger.js'
import { Response } from 'express'

function isAuthenticated(req: Request): boolean {
  return Boolean(req.auth?.sub || req?.kauth?.grant?.access_token?.content?.sub)
}

function getSessionId(req: Request): string {
  return req.auth?.sub ? `session-${req.auth.sub}` : (req.kauth?.grant?.access_token?.content?.sub ?? `anon-session-${req.ip}`)
}

export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: (req: Request): number => {
    const ip = req.headers['cf-connecting-ip'] ?? req.ip
    const authed = isAuthenticated(req)
    logger.info(`Rate limit check for ${authed ? 'authenticated' : 'anon'} - ${ip}`)
    return authed ? 60 : 5 // 60 req/min for auth, 5 for anon
  },
  keyGenerator: (req: Request): string => {
    const ip = req.headers['cf-connecting-ip'] ?? req.ip
    return getSessionId(req) ?? ip
  },
  handler: (req: Request, res: Response) => {
    const ip = req.headers['cf-connecting-ip'] ?? req.ip
    logger.warn('Rate limiting IP address:', ip)
    res.status(429).send({ message: 'Rate limited' })
  },
})
