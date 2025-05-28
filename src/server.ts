import './utils/env.js' // I hate how I have to do this but whatever. Stupid shim.
import { logger } from './utils/logger.js'
import express, { NextFunction, Response } from 'express'
import { Request } from 'express-jwt'
import trmnlRouter from './v1/routers/trmnlRouter.js'
import statusRouter from './v1/routers/statusRouter.js'
import helmet from 'helmet'
import session from 'express-session'

import KeycloakConnect from 'keycloak-connect'
import { keycloakConfig } from './configs/keycloakConfig.js'

// MCP import shenanigans
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { registerTools } from './v1/mcp/registerTools.js'

import { logIncomingAuth } from './utils/auth.js'
import { rateLimiter } from './utils/rateLimiter.js'

logger.info('Initializing MCP server...')
const mcpServer = new McpServer({
  name: 'subspace-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
})
logger.debug(mcpServer)
const server = express()
const PORT = process.env.PORT || 9595
const ACTIVE_VERSION = process.env.API_VERSION || 'v1'
// Register and enable model context protocol tools
const transports: { [sessionId: string]: SSEServerTransport } = {}
const memoryStore = new session.MemoryStore()
const keycloak = new KeycloakConnect({ store: memoryStore }, keycloakConfig)

logger.info('Registering tools with MCP server...')
registerTools(mcpServer)

logger.info('Setting up middleware...')
// SESSION_SECRET should just be a super long random base64 encoded string
server.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: {
      secure: true // Setting this to true requires trust proxy set in express
    }
  })
)
server.use(keycloak.middleware())
server.use(helmet())
server.use(rateLimiter)

// Declare regular REST API routing
logger.info('Initializing routes...')

//server.use('/v1/trmnl', express.json(), trmnlRouter) disable this route because it's just not active right now
server.use('/', statusRouter)
server.use('/health', express.json(), statusRouter)

// reverse proxy -- removing this will cause issues with secure cookies
server.set('trust proxy', 1)

server.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  logger.debug(err)

  if (err.name === 'UnauthorizedError') {
    logger.warn('JWT failed authentication')
    res.status(401).send({ message: 'Unauthorized' })
  } else if (err.code === 'credentials_required') {
    logger.warn('No token provided')
    res.status(401).json({ message: 'No token provided' })
  } else {
    next(err)
  }
})

// MCP Setup
// Discovery endpoint
server.get('/sse', logIncomingAuth, keycloak.protect(), async (req: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res)
  transports[transport.sessionId] = transport
  logger.info('New MCP session created:', transport.sessionId)
  res.on('close', () => {
    logger.info('Closing session', transport.sessionId)
    delete transports[transport.sessionId]
  })
  await mcpServer.connect(transport)
})

// MCP Handler
server.post('/messages', logIncomingAuth, keycloak.protect(), async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string

  if (typeof sessionId != 'string') {
    logger.error('Bad sessionId', sessionId)
    res.status(400).send({ message: 'Bad sessionId' })
  }

  const transport = transports[sessionId]
  if (transport) {
    logger.info(`${transport.sessionId} has an active session`)
    await transport.handlePostMessage(req, res, req.body) // don't remove req.body otherwise MCP inspector will panik
  } else {
    logger.warn(`${sessionId} was not found`)
    res.status(400).send('Requested sessionId not found')
  }
})

// oauth
server.get('/.well-known/oauth-protected-resource', async (_: Request, res: Response) => {
  const baseURL = `https://api.subtype.space`
  res.json({
    resource: baseURL,
    authorization_servers: [`https://auth.subtype.space`],
  })
})

server.listen(PORT, () => {
  logger.info(`Using log level: ${process.env.LOG_LEVEL || 'info'}`)
  logger.info('Using API version:', ACTIVE_VERSION)
  logger.debug('MCP Server debug:', mcpServer)
  logger.info('subspace API now listening on PORT:', PORT)
})
