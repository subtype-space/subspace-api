import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import { Request } from 'express-jwt' // this ideally should come after the custom auth middleware
import { logger } from './logger.js'
import { Response } from 'express'

export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: (req: Request): number => {
    logger.debug(`Rate limit check ${req.auth ? 'authenticated' : 'anon'} - ${req.headers['cf-connecting-ip'] ?? req.ip}`)
    return req.auth ? 60 : 5 // 60 req/min for auth, 5 for anon
  },
  keyGenerator: (req: Request): string => {
    return req.auth?.sub ? `session-${req.auth.sub}` : req.ip!
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limiting IP address:', req.ip)
    res.status(429).send({ message: 'Rate limited' })
  },
})
