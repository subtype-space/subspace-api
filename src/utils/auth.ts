import { Request } from 'express'
import { logger } from './logger.js'
import jwt, { Secret } from 'jsonwebtoken'

export function validateJWT(req: Request): boolean {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    logger.error('JWT secret is not defined in the environment!')
    return false
  }
  const authHeader = req.headers.authorization
  logger.debug('Incoming headers:', req.headers)
  if (!authHeader?.startsWith('Bearer ')) {
    logger.error('No auth header!')
    return false
  }
  // Get token from auth header since it'd look like "Bearer <token>"
  const token = authHeader.split(' ')[1]
  logger.debug('Inspecting token', token)

  try {
    jwt.verify(token, secret as Secret)
    return true
  } catch (error) {
    logger.warn('JWT validation failed', error)
    return false
  }
}
