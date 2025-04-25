import { Request, Response } from 'express'
import { logger } from './logger.js'
import jwt, { Secret } from 'jsonwebtoken'

export function checkAuth(req: Request, res: Response) {
  const authHeader = req.headers.authorization
  const expectedToken = process.env.SERVER_API_KEY
  logger.debug('Incoming authentication headers:', req.rawHeaders)

  if (!authHeader || !authHeader.startsWith('Bearer ') || !expectedToken) {
    return false
  }

  const token = authHeader.split(' ')[1]
  if (token !== expectedToken) {
    return false
  }

  return true
}


export function validateJWT(req: Request): boolean {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    logger.error('JWT secret is not defined in the environment!')
    return false
  }
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer')) {
    return false
  }
  // Get token from auth header since it'd look like "Bearer <token>"
  const token = authHeader.split(' ')[1]

  try {
    jwt.verify(token, secret as Secret)
    return true
  } catch (error) {
    logger.warn('JWT validation failed', error)
    return false
  }
}
