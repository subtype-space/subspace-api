// TODO: fine-grained tool access
// https://developers.cloudflare.com/agents/model-context-protocol/authorization/

import { expressjwt } from 'express-jwt'
import { Request, Response, NextFunction } from 'express'
import { logger } from './logger.js'

const JWT_SECRET = process.env.JWT_SECRET

// all of this may change due to keycloak oauth support
export function logIncomingAuth(req: Request, res: Response, next: NextFunction) {
  logger.info(`[AUTH] Connection from ${req.headers['cf-connecting-ip'] ?? req.ip} - ${req.headers['cf-ipcountry'] ?? 'unknown country'}`)

  // For "manual" JWT
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('[AUTH] No auth header or bad format')
    logger.debug('[AUTH] Incoming headers:', req.headers)
  } else {
    const token = authHeader.split(' ')[1]
    logger.debug('[AUTH] Inspecting token:', token)
  }

  // For Keycloak-specific OIDC
  // TODO -- users may not want Keycloak, make this optional/toggle disable
  const user = req.kauth?.grant?.access_token?.content
  if (user) {
    logger.info(`[AUTH] Authenticated as ${user.preferred_username ?? user.clientId ?? 'unknown'} (${user.sub})`)
  } else {
    logger.warn('[AUTH] No grant found on request')
    logger.warn('[AUTH] Possible auth failure')
  }

  next()
}

export const authRequired = expressjwt({
  secret: JWT_SECRET!,
  issuer: 'https://auth.subtype.space',
  audience: 'https://api.subtype.space',
  algorithms: ['HS256'],
  credentialsRequired: true,
})

export const authOptional = expressjwt({
  secret: JWT_SECRET!,
  algorithms: ['HS256'],
  credentialsRequired: false,
})
