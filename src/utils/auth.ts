import { expressjwt } from 'express-jwt'
import { Request, Response, NextFunction } from 'express'
import { logger } from './logger.js'

const JWT_SECRET = process.env.JWT_SECRET

export function logIncomingAuth(req: Request, res: Response, next: NextFunction) {
  logger.debug('Incoming headers:', req.headers)

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('No auth header or bad format')
  } else {
    const token = authHeader.split(' ')[1]
    logger.debug('Inspecting token:', token)
  }

  next()
}

export const authRequired = expressjwt({
  secret: JWT_SECRET!,
  algorithms: ['HS256'],
  credentialsRequired: true,
})

export const authOptional = expressjwt({
  secret: JWT_SECRET!,
  algorithms: ['HS256'],
  credentialsRequired: false,
})
