import { Request, Response } from 'express'
import { logger } from './logger.js'

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
