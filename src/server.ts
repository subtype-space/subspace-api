import './utils/env.js' // I hate how I have to do this but whatever. Stupid shim.
import { logger } from './utils/logger.js'
import express, { Request, NextFunction, Response } from 'express'
import trmnlRouter from './v1/routers/trmnlRouter.js'
import statusRouter from './v1/routers/statusRouter.js'
import helmet from 'helmet'
import session from 'express-session'

import KeycloakConnect from 'keycloak-connect'
import { keycloakConfig } from './configs/keycloakConfig.js'

// MCP import shenanigans
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { registerTools } from './v1/mcp/registerTools.js'

import { logIncomingAuth } from './utils/auth.js'
import { rateLimiter } from './utils/rateLimiter.js'

logger.info('Initializing stateless MCP server...')
const mcpServer = new McpServer(
  {
    name: 'subspace-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Create transport stateless
const mcpTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
})

logger.debug(mcpServer)
const server = express()
const PORT = process.env.PORT || 9595
const ACTIVE_VERSION = process.env.API_VERSION || 'v1'
const memoryStore = new session.MemoryStore()
const keycloak = new KeycloakConnect({ store: memoryStore }, keycloakConfig)

logger.info('Registering tools with MCP server...')
registerTools(mcpServer)

try {
  await mcpServer.connect(mcpTransport)
  logger.info('MCP server is ready')
} catch (err) {
  logger.error('There was an error connecting the MCP server to transport', err)
}

// reverse proxy -- removing this will cause issues with secure cookies
server.set('trust proxy', 1)

logger.info('Setting up middleware...')
// SESSION_SECRET should just be a super long random base64 encoded string
server.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: {
      secure: true, // Setting this to true requires trust proxy set in express
    },
  })
)
server.use(keycloak.middleware())
server.use(helmet())
server.use(rateLimiter)
server.use(express.json())
// Declare regular REST API routing
logger.info('Initializing routes...')

//server.use('/v1/trmnl', express.json(), trmnlRouter) disable this route because it's just not active right now
server.use('/', statusRouter)
server.use('/health', express.json(), statusRouter)


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

// MCP Setup - stateless
server.all('/mcp', logIncomingAuth, keycloak.protect(), async (req, res) => {
  try {
    await mcpTransport.handleRequest(req, res, req.body)
  } catch (err) {
    logger.error('MCP transport error:', err)
    res.status(500).json({
      error: 'MCP transport failure',
      detail: err
    })
  }
})

// discord activity auth
// Discord enpoint to return oauth2 token after user authentication
server.post('/discord/token', logIncomingAuth, async (req, res) => {
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.ACTIVITY_DISCORD_CLIENT_ID!,
      client_secret: process.env.ACTIVITY_DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code: req.body.code,
    }),
  })

  // Retrieve the access_token from the response
  const { access_token } = await response.json()

  // Return the access_token to our client as { access_token: "..."}
  res.send({ access_token })
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
