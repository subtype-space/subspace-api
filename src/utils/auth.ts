import { Request, Response, NextFunction } from 'express'
import { logger } from './logger.js'
import jwt, { Secret } from 'jsonwebtoken'

export function validateJWT(req: Request) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    logger.error('JWT secret is not defined in the environment!')
    return null
  }
  const authHeader = req.headers.authorization
  logger.debug('Incoming headers:', req.headers)
  if (!authHeader?.startsWith('Bearer ')) {
    logger.error('No auth header!')
    return null
  }
  // Get token from auth header since it'd look like "Bearer <token>"
  const token = authHeader.split(' ')[1]
  logger.debug('Inspecting token', token)

  try {
    const decodedToken = jwt.verify(token, secret as Secret)
    return decodedToken
  } catch (error) {
    logger.warn('JWT validation failed', error)
    return null
  }
}

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const user = validateJWT(req)
  if (!user) {
    logger.warn('Incoming request failed JWT validation')
    res.status(401).send({ message: 'Unauthorized' })
  }
  // handle user logic way way way later
  next()
}
